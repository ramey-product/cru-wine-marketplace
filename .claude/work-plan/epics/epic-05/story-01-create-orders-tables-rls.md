### [EPIC-05/STORY-01] — Create orders, order_items, and order_status_history tables with RLS

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform engineer, I want to create the order data model with proper RLS policies so that consumers can view their own orders, retailers can manage orders for their store, and platform admins can access all orders.

#### Acceptance Criteria

```gherkin
Given the migration runs successfully
When a consumer queries orders
Then they see only orders where user_id matches their auth.uid()

Given a retailer org member queries orders
When they filter by their org
Then they see all orders scoped to their org_id

Given a platform admin queries orders
When they request all orders
Then they see orders across all retailers

Given an order is created
When the created_at and updated_at columns are checked
Then both are populated and updated_at auto-updates on modification

Given a user from Retailer A queries orders
When Retailer B has orders in the system
Then Retailer B's orders are not visible to Retailer A's members
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_orders_tables.sql` | Create |
| Test | `supabase/tests/orders_rls.test.sql` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 — needs `profiles` table and `organizations` table
- **Blocked by:** EPIC-04/STORY-01 — needs `wines` table for order_items.wine_id FK
- **Blocks:** EPIC-05/STORY-02, STORY-03, STORY-04 — DAL and Actions need tables

#### Testing Requirements

- [ ] **RLS (positive — consumer):** Consumer can SELECT their own orders (user_id = auth.uid())
- [ ] **RLS (positive — retailer):** Retailer org member can SELECT orders in their org
- [ ] **RLS (positive — retailer write):** Retailer org member can UPDATE order status for their org
- [ ] **RLS (negative — consumer):** Consumer CANNOT see other users' orders
- [ ] **RLS (negative — cross-org):** Retailer A members CANNOT see Retailer B's orders
- [ ] **RLS (negative — consumer write):** Consumer CANNOT update order status
- [ ] **Constraint:** order_items.wine_id FK to wines table enforced
- [ ] **Constraint:** order_status_history.status matches valid enum values
- [ ] **Trigger:** updated_at trigger fires on orders and order_items

#### Implementation Notes

**Table: `orders`**
```
id UUID PK DEFAULT gen_random_uuid()
org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE  -- retailer org
user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE     -- consumer
status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'confirmed', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'))
fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('pickup', 'delivery'))
delivery_address JSONB              -- null for pickup; {line1, line2, city, state, zip} for delivery
delivery_fee INTEGER DEFAULT 0      -- cents
subtotal INTEGER NOT NULL           -- cents
tax INTEGER NOT NULL DEFAULT 0      -- cents
total INTEGER NOT NULL              -- cents (subtotal + delivery_fee + tax)
stripe_checkout_session_id TEXT
stripe_payment_intent_id TEXT UNIQUE -- idempotency key for webhook processing
medusa_cart_id TEXT
medusa_order_id TEXT
estimated_ready_at TIMESTAMPTZ      -- for pickup: when order will be ready
notes TEXT                          -- consumer notes to retailer
age_verified BOOLEAN NOT NULL DEFAULT false
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

Monetary values stored in **cents** (integer) to avoid floating-point precision issues. Matches Stripe's amount format.

**Table: `order_items`**
```
id UUID PK DEFAULT gen_random_uuid()
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
wine_id UUID NOT NULL REFERENCES wines(id)
quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
unit_price INTEGER NOT NULL         -- cents, price at time of order
subtotal INTEGER NOT NULL           -- cents (unit_price * quantity)
medusa_line_item_id TEXT
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

Note: `order_items` does NOT have its own `org_id` column — it inherits org context through `order_id → orders.org_id`. RLS policies on `order_items` use a subquery join to `orders`.

**Table: `order_status_history`**
```
id UUID PK DEFAULT gen_random_uuid()
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
status TEXT NOT NULL
changed_by UUID REFERENCES profiles(id)  -- nullable for system-triggered changes
notes TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

`order_status_history` is append-only (INSERT only, no UPDATE/DELETE). RLS mirrors orders: readable by consumer (via order_id → orders.user_id) and retailer org members (via order_id → orders.org_id).

**RLS — Dual-Access Pattern:**
```sql
-- Consumer reads own orders
CREATE POLICY "consumers_select_own_orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Retailer org members read their org's orders
CREATE POLICY "org_members_select_orders" ON orders
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Only authenticated users can INSERT (consumer places order)
CREATE POLICY "authenticated_insert_orders" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Retailer org members can UPDATE (status changes)
CREATE POLICY "org_members_update_orders" ON orders
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );
```

**Indexes:**
- `idx_orders_org_id` on `orders(org_id)` — RLS subquery performance
- `idx_orders_user_id` on `orders(user_id)` — consumer order lookup
- `idx_orders_status` on `orders(status)` — filtering by status
- `idx_orders_stripe_pi` on `orders(stripe_payment_intent_id)` — webhook idempotency lookup
- `idx_order_items_order_id` on `order_items(order_id)`
- `idx_order_status_history_order_id` on `order_status_history(order_id)`
