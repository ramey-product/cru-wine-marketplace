# Epic: [EPIC-05] — Order Placement

**Source PRD:** `docs/prds/prd-05-order-placement.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 5,400
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-3, fullstack-4, ux-designer, marketing-writer

## Epic Summary

Order Placement is the revenue engine of Cru — it converts wine discovery into actual purchase. This epic delivers the complete purchase flow: retailer selection (showing nearby stores with price, stock status, and fulfillment options), retailer-scoped cart management (via Medusa.js v2), checkout with age verification, Stripe payment processing, order lifecycle management (pending → confirmed → ready/out-for-delivery → completed), inventory holds to prevent overselling, order status notifications, and order history. Without this epic, Cru generates zero revenue.

## Success Criteria

- [ ] User can go from "Buy" tap on a wine to payment completion in under 2 minutes
- [ ] Cart is scoped to a single retailer (multi-retailer cart is P2)
- [ ] Stripe Checkout handles payment with idempotent webhook processing
- [ ] Order statuses transition correctly: pending → confirmed → ready_for_pickup / out_for_delivery → completed / cancelled
- [ ] Users can view full order history with status, date, wines, retailer, and total
- [ ] Retailers receive order notification immediately upon successful payment
- [ ] Inventory hold (10 min) prevents overselling during checkout
- [ ] Age verification (21+) enforced before payment
- [ ] All order tables have RLS with dual-access pattern (consumer by user_id, retailer by org_id)

## Story Index

| Story | Title | Type | Points | File |
|-------|-------|------|--------|------|
| STORY-01 | Create orders, order_items, and order_status_history tables with RLS | backend | 8 | `epic-05/story-01-create-orders-tables-rls.md` |
| STORY-02 | DAL functions for cart and orders | backend | 5 | `epic-05/story-02-dal-functions-cart-orders.md` |
| STORY-03 | Cart management Server Actions | backend | 5 | `epic-05/story-03-cart-management-server-actions.md` |
| STORY-04 | Order placement and lifecycle Server Actions | backend | 8 | `epic-05/story-04-order-placement-lifecycle-actions.md` |
| STORY-05 | Stripe webhook handler and order finalization | fullstack | 8 | `epic-05/story-05-stripe-webhook-order-finalization.md` |
| STORY-06 | Inventory hold mechanism | backend | 3 | `epic-05/story-06-inventory-hold-mechanism.md` |
| STORY-07 | Retailer selection and cart UI | frontend | 8 | `epic-05/story-07-retailer-selection-cart-ui.md` |
| STORY-08 | Checkout flow and order confirmation UI | frontend | 8 | `epic-05/story-08-checkout-flow-order-confirmation-ui.md` |
| STORY-09 | Order history and detail pages | frontend | 5 | `epic-05/story-09-order-history-detail-pages.md` |
| STORY-10 | Order notification emails | fullstack | 3 | `epic-05/story-10-order-notification-emails.md` |
| STORY-11 | UX design and user-facing copy | design | 5 | `epic-05/story-11-ux-design-user-facing-copy.md` |

**Total: 11 stories, 66 story points**

## Architecture Dependencies

- **Database tables:** `orders`, `order_items`, `order_status_history` (org-scoped to retailer org, with dual-access RLS for consumer + retailer)
- **Medusa.js v2:** Cart management, order lifecycle, inventory holds. Medusa Cart → Medusa Order on payment success. Cart scoped to a single retailer's store.
- **Stripe:** Checkout Sessions for payment, webhooks for payment confirmation (checkout.session.completed) and refunds (charge.refunded)
- **Hard dependency on EPIC-06 (Retailer Integration):** Needs `retailer_inventory` table, retailer pricing, and POS sync for real-time stock/price data. Retailer org and location data needed for the retailer selection sheet.
- **Depends on:** EPIC-01 `profiles` table (user auth, delivery address); `organizations` table for retailer orgs; EPIC-04 `wines` table (wine references in order items)
- **Downstream:** Push Notifications (P1) builds on order status events; Secondary Marketplace (P1) reuses order/payment infrastructure; EPIC-03 Taste Profile updates from purchase history
- **Shared components:** Wine card (shared with EPIC-02 Search & Browse), retailer card (shared with EPIC-06)

## Cross-Cutting Concerns

- **CG-2 Table Categorization — Dual-Access Pattern:** Orders are org-scoped to the retailer but also accessible by the consumer. RLS needs two SELECT paths: (1) consumer reads own orders via `user_id = auth.uid()`, (2) retailer org members read their org's orders via standard org_id membership subquery. Write access for retailers (status updates) requires org membership. Platform admins can read all orders.
- **CG-1 Medusa Sync — Bidirectional for Orders:** Unlike wine content (Supabase → Medusa one-way), orders involve bidirectional flow: cart operations go through Medusa API, but order records are persisted to Supabase on payment confirmation. `medusa_cart_id` and `medusa_order_id` stored on the Supabase `orders` row for cross-reference.
- **Stripe Webhook Security:** Webhook handler at `app/api/webhooks/stripe/route.ts` MUST verify Stripe signature before processing. Uses `supabaseAdmin` (service role) since there's no user session in webhook context. Must handle duplicate deliveries (idempotent by `stripe_payment_intent_id`).
- **Inventory Hold Coordination:** When checkout begins, a 10-minute inventory hold must be placed. This could be Medusa-level (Medusa cart reserves stock) or application-level (hold record in Supabase). Must coordinate with EPIC-06 retailer inventory sync to avoid phantom stock.
- **Email Notifications:** Order confirmation emails to consumer, order notification emails to retailer. Transactional email service needed (Resend, SendGrid, or Supabase Edge Function + SMTP). Shares email infrastructure with EPIC-01 (auth emails) and future notification features.

## Technical Risks & Open Questions

- [ ] **Medusa cart model fit:** Does Medusa.js v2's cart model support retailer-scoped carts out of the box, or do we need a custom layer? The Medusa `SalesChannel` concept may map to retailers, but needs validation.
- [ ] **Inventory hold implementation:** Medusa-level stock reservation vs. Supabase-level hold record? Medusa's inventory module has stock reservation capabilities, but they may not integrate with external POS inventory (EPIC-06).
- [ ] **California delivery compliance:** Legal review needed — does Cru need a license for marketplace-facilitated delivery, or does the retailer's license cover it? This is a blocker for enabling the delivery fulfillment option.
- [ ] **Stripe Checkout mode:** Hosted Checkout (redirect to Stripe) vs. Embedded Checkout (Stripe Elements in-app)? Hosted is simpler and handles PCI compliance, but embedded provides a better UX. Recommend hosted for V1.
- [ ] **Race condition on payment:** If Stripe webhook arrives before the client redirect callback, the order must still be created correctly. Need to handle both webhook-first and redirect-first flows.
- [ ] **Delivery fee calculation:** How are delivery fees determined? Flat fee per retailer? Distance-based? Retailer-set? This affects the checkout summary UI and order total calculation.
- [ ] **Tax calculation:** Stripe Tax, a third-party tax API (TaxJar, Avalara), or retailer-provided tax rate? V1 LA-only simplifies this (single jurisdiction), but needs a path to multi-state.

---

## Developer Stories

---

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

---

### [EPIC-05/STORY-02] — DAL functions for cart and orders

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want typed DAL functions for cart and order operations so that Server Actions and API routes can read/write order data through a consistent, type-safe interface.

#### Acceptance Criteria

```gherkin
Given a consumer's user ID
When getOrdersByUser is called
Then it returns all orders for that user sorted by created_at DESC

Given an order ID
When getOrderById is called
Then it returns the order with items and status history

Given a retailer's org ID
When getOrdersByOrg is called with optional status filter
Then it returns matching orders for that organization

Given a Stripe payment_intent_id
When getOrderByPaymentIntent is called
Then it returns the matching order or null (for idempotency check)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/orders.ts` | Create |
| DAL | `lib/dal/cart.ts` | Create |
| Types | `types/database.ts` | Regenerate (supabase gen types) |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-01 — needs orders tables
- **Blocks:** EPIC-05/STORY-03, STORY-04 — Server Actions call DAL

#### Testing Requirements

- [ ] **Unit:** getOrdersByUser returns correct orders for a given user
- [ ] **Unit:** getOrderById returns order with nested items and status history
- [ ] **Unit:** getOrdersByOrg filters by status correctly
- [ ] **Unit:** getOrderByPaymentIntent returns null for nonexistent PI
- [ ] **Unit:** createOrder inserts order + items in a transaction
- [ ] **Unit:** updateOrderStatus updates status and appends to history

#### Implementation Notes

**`lib/dal/orders.ts`** functions:
- `getOrdersByUser(supabase, userId, { limit?, offset?, status? })` — paginated user order list
- `getOrderById(supabase, orderId)` — single order with items and status history (joined query)
- `getOrdersByOrg(supabase, orgId, { limit?, offset?, status? })` — retailer's order queue
- `getOrderByPaymentIntent(supabase, paymentIntentId)` — idempotency lookup for webhooks
- `createOrder(supabase, { orderData, items })` — transactional insert of order + order_items + initial status history entry
- `updateOrderStatus(supabase, orderId, { status, changedBy, notes })` — update orders.status + append order_status_history row

**`lib/dal/cart.ts`** functions (thin wrappers around Medusa client):
- `createMedusaCart(medusaClient, { regionId, salesChannelId })` — create Medusa cart scoped to retailer
- `addItemToCart(medusaClient, cartId, { variantId, quantity })` — add wine to Medusa cart
- `updateCartItem(medusaClient, cartId, lineItemId, { quantity })` — update quantity
- `removeCartItem(medusaClient, cartId, lineItemId)` — remove from cart
- `getCart(medusaClient, cartId)` — retrieve cart with items and totals

Cart DAL wraps Medusa JS client calls rather than direct Supabase queries — Medusa owns cart state. Supabase only stores orders after payment is confirmed.

---

### [EPIC-05/STORY-03] — Cart management Server Actions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a consumer, I want to add wines to my cart, adjust quantities, and remove items so that I can build my order before checking out.

#### Acceptance Criteria

```gherkin
Given a wine available at a retailer
When the consumer calls addToCart
Then a Medusa cart is created (if none exists) scoped to that retailer, and the wine is added

Given a cart with items from Retailer A
When the consumer tries to add a wine from Retailer B
Then the action returns an error explaining that only one retailer per order is supported

Given a cart with 2 units of a wine
When the consumer calls updateCartItemQuantity to 3
Then the cart item quantity updates to 3 and the totals recalculate

Given a cart with one item
When the consumer calls removeFromCart
Then the item is removed and the cart is empty

Given a consumer is not authenticated
When any cart action is called
Then the action returns an authentication error
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/cart.ts` | Create |
| Validation | `lib/validations/cart.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-02 — needs cart DAL functions
- **Blocked by:** EPIC-06 — needs retailer inventory data for stock check on add
- **Blocks:** EPIC-05/STORY-07 — cart UI calls these actions

#### Testing Requirements

- [ ] **Unit:** Zod validation rejects invalid input (negative quantity, missing wine_id)
- [ ] **Integration:** addToCart creates a Medusa cart and adds item
- [ ] **Integration:** addToCart rejects cross-retailer items
- [ ] **Integration:** updateCartItemQuantity updates Medusa cart
- [ ] **Integration:** removeFromCart removes item from Medusa cart
- [ ] **Unit:** Unauthenticated calls return error

#### Implementation Notes

**`lib/actions/cart.ts`** Server Actions:
- `addToCart(formData)` — Zod validate → auth → check retailer scope → inventory check → createMedusaCart (if new) → addItemToCart → return cart
- `updateCartItemQuantity(formData)` — Zod validate → auth → inventory check → updateCartItem → return cart
- `removeFromCart(formData)` — Zod validate → auth → removeCartItem → return cart
- `getActiveCart()` — auth → getCart → return cart or null

**Cart session management:** Store `medusa_cart_id` in an HTTP-only cookie or in the user's `profiles` row (`active_cart_id`). Cookie approach is simpler for V1. Cart expires after 24 hours of inactivity.

**Retailer scope enforcement:** Each cart has a single `sales_channel_id` (mapped to a retailer). If the consumer already has a cart for Retailer A and tries to add from Retailer B, the action returns `{ error: "Your cart contains items from [Retailer A]. Start a new order to buy from [Retailer B]." }`.

**Zod schemas in `lib/validations/cart.ts`:**
- `addToCartSchema: z.object({ wineId: z.string().uuid(), retailerOrgId: z.string().uuid(), quantity: z.number().int().min(1).max(24) })`
- `updateCartItemSchema: z.object({ lineItemId: z.string(), quantity: z.number().int().min(1).max(24) })`
- `removeFromCartSchema: z.object({ lineItemId: z.string() })`

---

### [EPIC-05/STORY-04] — Order placement and lifecycle Server Actions

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a consumer, I want to complete checkout and place my order so that the retailer is notified and my wine is prepared for pickup or delivery.

#### Acceptance Criteria

```gherkin
Given a consumer with items in their cart
When they call initiateCheckout with fulfillment details
Then a Stripe Checkout Session is created and the session URL is returned

Given a consumer selects delivery fulfillment
When they provide a delivery address
Then the delivery fee is calculated and included in the Stripe session amount

Given the consumer has not confirmed age verification (21+)
When they call initiateCheckout
Then the action returns an error requiring age confirmation

Given a retailer confirms an order
When they call updateOrderStatus to 'confirmed'
Then the order status updates, a history entry is added, and the consumer is notified

Given a consumer tries to cancel a 'pending' order
When they call cancelOrder
Then the order is cancelled and a Stripe refund is initiated

Given a consumer tries to cancel a 'completed' order
When they call cancelOrder
Then the action returns an error that completed orders cannot be cancelled
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/orders.ts` | Create |
| Validation | `lib/validations/orders.ts` | Create |
| Lib | `lib/stripe/checkout.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-02 — needs orders DAL
- **Blocked by:** EPIC-05/STORY-03 — needs cart actions (cart must exist before checkout)
- **Blocks:** EPIC-05/STORY-05 — Stripe webhook uses order creation logic
- **Blocks:** EPIC-05/STORY-08 — checkout UI calls initiateCheckout

#### Testing Requirements

- [ ] **Unit:** Zod validation rejects missing fulfillment type, invalid address
- [ ] **Integration:** initiateCheckout creates Stripe Checkout Session with correct line items and amount
- [ ] **Integration:** Delivery orders include delivery fee in Stripe amount
- [ ] **Integration:** Age verification check blocks unverified users
- [ ] **Integration:** updateOrderStatus transitions only along valid paths
- [ ] **Integration:** cancelOrder initiates Stripe refund for paid orders
- [ ] **Unit:** Cannot cancel completed/already-cancelled orders

#### Implementation Notes

**`lib/actions/orders.ts`** Server Actions:
- `initiateCheckout({ fulfillmentType, deliveryAddress?, ageVerified })` — Zod validate → auth → verify cart exists → age check → calculate totals (subtotal + delivery fee + tax) → create Stripe Checkout Session → return `{ sessionUrl }` or `{ sessionId }` (for embedded checkout)
- `updateOrderStatus({ orderId, status, notes? })` — Zod validate → auth → permission check (org member) → validate status transition → updateOrderStatus DAL → trigger notification
- `cancelOrder({ orderId, reason? })` — Zod validate → auth → verify ownership or org membership → verify cancellable status → update status → initiate Stripe refund if payment exists → return

**Valid status transitions:**
```
pending → confirmed | cancelled
confirmed → ready_for_pickup | out_for_delivery | cancelled
ready_for_pickup → completed | cancelled
out_for_delivery → completed | cancelled
completed → (terminal)
cancelled → (terminal)
```

**Stripe Checkout Session creation (`lib/stripe/checkout.ts`):**
- Create session with line items from Medusa cart
- Set `success_url` and `cancel_url` for redirect flow
- Include `metadata: { orderId, medusaCartId, userId }` for webhook correlation
- Set `payment_intent_data.metadata` for idempotency

**Tax calculation:** For V1 (LA only), use a fixed California + LA County rate (~9.5%). Store the rate used on the order for audit. Path to Stripe Tax or TaxJar for multi-state in Phase 2.

---

### [EPIC-05/STORY-05] — Stripe webhook handler and order finalization

**Type:** fullstack
**Story Points:** 8
**Assigned Agent:** fullstack-3
**Phase:** Checkpoint 3: Backend

#### User Story

As the system, I want to process Stripe webhook events so that orders are confirmed upon successful payment, refunds are recorded, and no duplicate processing occurs.

#### Acceptance Criteria

```gherkin
Given a Stripe checkout.session.completed webhook arrives
When the signature is verified
Then the order record is created in Supabase with status 'pending'

Given the same webhook event arrives twice (duplicate delivery)
When the handler checks stripe_payment_intent_id
Then it returns 200 OK without creating a duplicate order

Given an invalid webhook signature
When the handler attempts to verify
Then it returns 400 and does not process the event

Given a charge.refunded webhook arrives
When the order is found by payment_intent_id
Then the order status is updated to 'cancelled' with refund metadata

Given a successful payment
When the order is created
Then confirmation emails are sent to both consumer and retailer
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| API Route | `app/api/webhooks/stripe/route.ts` | Create |
| Lib | `lib/stripe/webhook-handlers.ts` | Create |
| Lib | `lib/email/order-notifications.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-01 — needs orders tables
- **Blocked by:** EPIC-05/STORY-02 — needs orders DAL for createOrder, getOrderByPaymentIntent
- **Blocks:** EPIC-05/STORY-10 — notification emails triggered here

#### Testing Requirements

- [ ] **Unit:** Signature verification rejects invalid signatures
- [ ] **Unit:** Idempotency check prevents duplicate order creation
- [ ] **Integration:** checkout.session.completed creates order with correct data
- [ ] **Integration:** charge.refunded updates order status
- [ ] **Unit:** Unknown event types return 200 (acknowledge but ignore)
- [ ] **Unit:** Missing or malformed event data returns 400

#### Implementation Notes

**`app/api/webhooks/stripe/route.ts`:**
```typescript
// POST handler
// 1. Read raw body (for signature verification — cannot parse JSON first)
// 2. Verify Stripe signature using STRIPE_WEBHOOK_SECRET
// 3. Parse event type
// 4. Route to handler: checkout.session.completed, charge.refunded, payment_intent.payment_failed
// 5. Return 200 on success (even for unhandled event types)
```

**Key webhook events:**
- `checkout.session.completed` — Primary event. Extract metadata (orderId, medusaCartId, userId). Check idempotency via `stripe_payment_intent_id`. Create order in Supabase via `supabaseAdmin`. Finalize Medusa cart → Medusa order. Send confirmation emails.
- `charge.refunded` — Look up order by `payment_intent_id`. Update status to `cancelled`. Record refund amount.
- `payment_intent.payment_failed` — Log the failure. Release inventory hold. Clean up Medusa cart if applicable.

**Uses `supabaseAdmin`** (service role) — no user session exists in webhook context. This is one of the few places service role is authorized per project rules.

**Idempotency:** Before creating an order, call `getOrderByPaymentIntent(supabaseAdmin, paymentIntentId)`. If an order already exists, return 200 without creating a duplicate.

**Email notifications** (delegate to `lib/email/order-notifications.ts`):
- Consumer: "Your order is confirmed" with order details, retailer name, estimated time
- Retailer: "New order received" with order details, consumer name, fulfillment type

---

### [EPIC-05/STORY-06] — Inventory hold mechanism

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As the system, I want to place a temporary hold on inventory when a consumer begins checkout so that wines cannot be oversold if multiple consumers try to buy the last bottle simultaneously.

#### Acceptance Criteria

```gherkin
Given a retailer has 2 units of Wine X in stock
When Consumer A starts checkout for 1 unit
Then 1 unit is held and only 1 unit shows as available to other consumers

Given a hold has been active for 10 minutes without payment
When the hold expiration check runs
Then the hold is released and the unit becomes available again

Given Consumer A completes payment within the hold window
When the payment webhook fires
Then the hold is converted to a confirmed order and stock is decremented

Given Consumer A abandons checkout
When they navigate away without completing payment
Then the hold expires after 10 minutes and stock is restored
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_inventory_holds.sql` | Create |
| DAL | `lib/dal/inventory-holds.ts` | Create |
| Lib | `lib/medusa/inventory.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06 — needs retailer inventory data model
- **Blocks:** EPIC-05/STORY-04 — initiateCheckout creates a hold

#### Testing Requirements

- [ ] **Unit:** Hold creation decrements available stock count
- [ ] **Unit:** Hold expiration restores available stock
- [ ] **Unit:** Hold conversion on payment success permanently decrements stock
- [ ] **RLS:** Only system/service role can manage holds (no direct user access)
- [ ] **Integration:** Concurrent checkout for last unit — only one hold succeeds

#### Implementation Notes

**Approach:** Use a Supabase `inventory_holds` table for V1 rather than relying solely on Medusa's inventory module. This gives us direct control and simpler integration with the retailer inventory from EPIC-06.

**Table: `inventory_holds`**
```
id UUID PK DEFAULT gen_random_uuid()
wine_id UUID NOT NULL REFERENCES wines(id)
retailer_org_id UUID NOT NULL REFERENCES organizations(id)
user_id UUID NOT NULL REFERENCES profiles(id)
quantity INTEGER NOT NULL CHECK (quantity > 0)
expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'expired', 'released'))
stripe_checkout_session_id TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

**Hold lifecycle:**
1. `initiateCheckout` → INSERT hold with `status = 'active'`, `expires_at = now() + 10 min`
2. Stripe webhook success → UPDATE hold `status = 'converted'`
3. Cron or pg_cron → UPDATE expired holds `status = 'expired'` WHERE `expires_at < now() AND status = 'active'`
4. Consumer cancels → UPDATE hold `status = 'released'`

**Available stock query:** `retailer_stock - SUM(active holds)` = available for purchase.

**RLS:** Holds table uses restrictive policies — only service role can INSERT/UPDATE (managed by Server Actions and webhooks, never by direct client access). Consumers cannot query holds directly.

---

### [EPIC-05/STORY-07] — Retailer selection and cart UI

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to tap "Buy" on a wine and see which nearby stores have it in stock with their prices so that I can choose where to buy and build my order.

#### Acceptance Criteria

```gherkin
Given a wine is available at 3 nearby retailers
When the user taps "Buy"
Then a bottom sheet opens showing all 3 retailers sorted by distance

Given a retailer in the sheet
When the user views it
Then they see: store name, distance, price, stock status (in stock / low stock / out of stock), fulfillment options (pickup, delivery, or both)

Given the user selects a retailer and taps "Add to Cart"
When the wine is added
Then the cart indicator updates and the user can continue browsing

Given the user opens the cart
When they view it
Then they see: wine(s), quantity controls, unit price per wine, subtotal, and a "Checkout" button

Given the cart has items from Retailer A
When the user tries to buy a wine from Retailer B via the Buy button
Then a message explains the single-retailer limitation and offers to start a new order

Given no retailers have the wine in stock
When the user taps "Buy"
Then a "Notify me" / "Wishlist" CTA is shown instead of the retailer sheet
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/orders/RetailerSelectionSheet.tsx` | Create |
| Component | `components/features/orders/RetailerCard.tsx` | Create |
| Component | `components/features/orders/CartSheet.tsx` | Create |
| Component | `components/features/orders/CartItem.tsx` | Create |
| Component | `components/features/orders/BuyButton.tsx` | Create |
| Component | `components/features/orders/CartIndicator.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-03 — needs cart Server Actions
- **Blocked by:** EPIC-06 — needs retailer inventory + location data for the selection sheet
- **Blocked by:** EPIC-05/STORY-11 — needs UX wireframes and copy
- **Blocks:** EPIC-05/STORY-08 — checkout UI needs cart to exist

#### Testing Requirements

- [ ] **Unit:** RetailerSelectionSheet sorts retailers by distance
- [ ] **Unit:** Out-of-stock retailers show disabled state
- [ ] **Unit:** CartSheet renders correct subtotal from items
- [ ] **Accessibility:** Bottom sheet is keyboard-navigable, focus-trapped, aria-labeled
- [ ] **Accessibility:** Cart quantity controls have aria-labels
- [ ] **E2E:** Add wine to cart → cart indicator shows count → open cart → items visible

#### Implementation Notes

**RetailerSelectionSheet:** Uses Shadcn `Sheet` component (bottom sheet on mobile, side sheet on desktop). Receives a `wineId` prop. Fetches nearby retailers with stock via a DAL query (EPIC-06 provides `retailer_inventory` lookup). Each retailer row shows:
- Store name + distance (from CG-5 PostGIS proximity query)
- Price (from retailer inventory)
- Stock indicator: "In stock" (green), "Low stock" (amber), "Out of stock" (gray/disabled)
- Fulfillment badges: "Pickup" / "Delivery" / both
- "Add to Cart" button (disabled if out of stock)

**CartSheet:** Slide-over panel showing current cart state. Fetches cart from Medusa via `getActiveCart()` action. Each `CartItem` has quantity +/- controls (calls `updateCartItemQuantity`) and a remove button (calls `removeFromCart`). Shows subtotal. "Checkout" button navigates to checkout page.

**BuyButton:** Appears on wine cards and wine detail pages. Calls `RetailerSelectionSheet` on click. Shows "Buy · $XX" with the lowest available price if known, or "Buy" if price varies by retailer.

**CartIndicator:** Small badge on the navigation bar showing cart item count. Reads from cart cookie/state. Clicking opens CartSheet.

**State management:** Cart state lives in Medusa (server) and is fetched on demand. Use React `useOptimistic` for quantity changes to avoid flicker. No client-side cart store needed for V1.

---

### [EPIC-05/STORY-08] — Checkout flow and order confirmation UI

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a consumer, I want to review my order, select pickup or delivery, verify my age, and pay securely so that I can complete my purchase with confidence.

#### Acceptance Criteria

```gherkin
Given the consumer navigates to checkout
When the page loads
Then they see: order summary (items, prices), fulfillment selection, and age verification checkbox

Given the consumer selects pickup
When they view the fulfillment details
Then they see: store address, store hours, estimated ready time (1 hour)

Given the consumer selects delivery
When they view the fulfillment details
Then they see: delivery address field (pre-filled from profile), delivery fee, estimated delivery window

Given the consumer checks the age verification box and clicks "Pay"
When Stripe Checkout loads
Then the payment form appears with the correct total

Given payment succeeds
When the consumer is redirected back
Then they see an order confirmation page with: order number, items, total, estimated time, and retailer contact info

Given payment fails
When the consumer is redirected back
Then they see an error message with an option to retry

Given the consumer has not checked age verification
When they click "Pay"
Then the button is disabled and a message prompts them to confirm their age
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/checkout/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/checkout/loading.tsx` | Create |
| Page | `app/(app)/[orgSlug]/checkout/error.tsx` | Create |
| Page | `app/(app)/[orgSlug]/orders/[orderId]/confirmation/page.tsx` | Create |
| Component | `components/features/orders/CheckoutSummary.tsx` | Create |
| Component | `components/features/orders/FulfillmentSelector.tsx` | Create |
| Component | `components/features/orders/AgeVerification.tsx` | Create |
| Component | `components/features/orders/OrderConfirmation.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-04 — needs initiateCheckout Server Action
- **Blocked by:** EPIC-05/STORY-07 — cart must exist before checkout
- **Blocked by:** EPIC-05/STORY-11 — needs UX wireframes and copy

#### Testing Requirements

- [ ] **Unit:** CheckoutSummary renders correct line items and total
- [ ] **Unit:** FulfillmentSelector shows/hides delivery fields based on selection
- [ ] **Unit:** AgeVerification blocks checkout when unchecked
- [ ] **Unit:** OrderConfirmation displays all order details
- [ ] **Accessibility:** All form inputs labeled, error messages announced via aria-live
- [ ] **E2E:** Full checkout flow — select fulfillment → verify age → pay → see confirmation

#### Implementation Notes

**Checkout page** (`app/(app)/[orgSlug]/checkout/page.tsx`):
- Server Component that fetches cart from Medusa and renders checkout form
- Client-side `FulfillmentSelector` for pickup/delivery toggle
- Client-side `AgeVerification` checkbox
- "Pay" button calls `initiateCheckout` Server Action → redirects to Stripe Checkout URL
- For V1, use **Stripe Hosted Checkout** (redirect mode) for simplest PCI compliance

**Fulfillment flow:**
- Pickup: Show retailer address, hours (from retailer data in EPIC-06), "Ready in ~1 hour"
- Delivery: Show address form (pre-filled from `profiles.delivery_address` if set), delivery fee, "Delivered in 1-2 hours"
- If retailer only supports one option, pre-select it and hide the toggle

**Order confirmation page** (`app/(app)/[orgSlug]/orders/[orderId]/confirmation/page.tsx`):
- Stripe redirects to `success_url` with `session_id` query param
- Page polls or awaits the order record (webhook may not have fired yet)
- Shows: order number, itemized receipt, fulfillment details, estimated time, retailer contact
- "Continue browsing" CTA and "View order history" link

**Stripe redirect handling:**
- `success_url`: `/[orgSlug]/orders/{CHECKOUT_SESSION_ID}/confirmation`
- `cancel_url`: `/[orgSlug]/checkout?cancelled=true`
- The confirmation page uses the session ID to look up the order. If the webhook hasn't processed yet, show a "Processing your order..." state and poll every 2 seconds for up to 30 seconds.

---

### [EPIC-05/STORY-09] — Order history and detail pages

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a consumer, I want to view my past orders and check the status of current orders so that I know when my wine will be ready and can reference what I've purchased.

#### Acceptance Criteria

```gherkin
Given a consumer has placed 5 orders
When they navigate to order history
Then all 5 orders appear sorted by date (newest first) with: date, retailer, item count, total, and status badge

Given a consumer clicks on an order
When the detail page loads
Then they see: full item list, prices, fulfillment details, status timeline, and retailer contact

Given an order has status "Ready for Pickup"
When the consumer views it
Then the status badge shows "Ready for Pickup" in a prominent color and the store address is highlighted

Given a consumer has no orders
When they navigate to order history
Then they see an empty state with a CTA to browse wines
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/orders/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/orders/loading.tsx` | Create |
| Page | `app/(app)/[orgSlug]/orders/error.tsx` | Create |
| Page | `app/(app)/[orgSlug]/orders/[orderId]/page.tsx` | Create |
| Component | `components/features/orders/OrderList.tsx` | Create |
| Component | `components/features/orders/OrderCard.tsx` | Create |
| Component | `components/features/orders/OrderDetail.tsx` | Create |
| Component | `components/features/orders/OrderStatusTimeline.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-02 — needs orders DAL (getOrdersByUser, getOrderById)
- **Blocked by:** EPIC-05/STORY-11 — needs UX wireframes and copy for empty states, status badges

#### Testing Requirements

- [ ] **Unit:** OrderList renders orders sorted by date
- [ ] **Unit:** OrderCard shows correct status badge color
- [ ] **Unit:** OrderStatusTimeline renders all status history entries
- [ ] **Unit:** Empty state renders when no orders exist
- [ ] **Accessibility:** Status badges have aria-labels, timeline is screen-reader friendly
- [ ] **E2E:** Navigate to order history → click order → see detail with status timeline

#### Implementation Notes

**Order history page** (`app/(app)/[orgSlug]/orders/page.tsx`):
- Server Component fetching orders via `getOrdersByUser` DAL function
- Renders `OrderList` with `OrderCard` items
- Each `OrderCard` shows: order date, retailer name, wine count, total, status badge
- Status badge colors: pending (gray), confirmed (blue), ready_for_pickup (green), out_for_delivery (amber), completed (green), cancelled (red)

**Order detail page** (`app/(app)/[orgSlug]/orders/[orderId]/page.tsx`):
- Server Component fetching single order via `getOrderById` DAL function
- `OrderDetail` shows itemized receipt: wine name, quantity, unit price, subtotal per item
- `OrderStatusTimeline` shows vertical timeline of all status transitions from `order_status_history`
- Fulfillment details section: pickup address + map link (if pickup) or delivery address (if delivery)
- Retailer contact: store name, phone number, "Contact" link
- If order is in-progress (not completed/cancelled), show estimated completion time prominently

**Empty state:** Use marketing-writer copy. "Your wine journey starts here" type messaging with CTA button to browse/discover page (EPIC-02).

---

### [EPIC-05/STORY-10] — Order notification emails

**Type:** fullstack
**Story Points:** 3
**Assigned Agent:** fullstack-3
**Phase:** Checkpoint 3: Backend

#### User Story

As a consumer and retailer, I want to receive email notifications about order events so that I know when an order is placed, confirmed, and ready.

#### Acceptance Criteria

```gherkin
Given a successful payment
When the webhook processes the order
Then the consumer receives an order confirmation email with order details

Given a successful payment
When the webhook processes the order
Then the retailer receives a new order notification email with order details and fulfillment type

Given a retailer updates order status to "Ready for Pickup"
When the status change is saved
Then the consumer receives a "Ready for Pickup" email with store address and hours

Given an order is cancelled
When the cancellation is processed
Then both consumer and retailer receive cancellation notification emails
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Lib | `lib/email/order-notifications.ts` | Create |
| Lib | `lib/email/templates/order-confirmation.tsx` | Create |
| Lib | `lib/email/templates/order-status-update.tsx` | Create |
| Lib | `lib/email/templates/retailer-new-order.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-05 — webhook handler triggers emails
- **Blocked by:** EPIC-01 — email infrastructure setup (Resend or similar)

#### Testing Requirements

- [ ] **Unit:** Email templates render with correct order data
- [ ] **Unit:** Consumer confirmation email includes order number, items, total, estimated time
- [ ] **Unit:** Retailer notification includes consumer name, items, fulfillment type
- [ ] **Unit:** Status update emails include new status and relevant details
- [ ] **Integration:** Email sending function calls email API correctly

#### Implementation Notes

**Email service:** Use Resend (React Email compatible) or Supabase Edge Function with SMTP. React Email templates provide type-safe, component-based email design.

**Email templates (React Email):**
- `order-confirmation.tsx` — Sent to consumer on payment success. Includes: order number, wine list with quantities and prices, total, fulfillment type and details, estimated time, retailer name/address.
- `retailer-new-order.tsx` — Sent to retailer org admin email on payment success. Includes: consumer name, wine list, fulfillment type (pickup or delivery), delivery address if applicable, order total, action required ("Please confirm this order").
- `order-status-update.tsx` — Sent to consumer on status transitions. Dynamic content based on new status: "Your order is confirmed", "Your order is ready for pickup at [address]", "Your order is out for delivery", "Your order has been cancelled".

**Trigger points:**
1. Stripe webhook (`STORY-05`) → consumer confirmation + retailer new order notification
2. `updateOrderStatus` Server Action (`STORY-04`) → consumer status update email

**Rate limiting:** Don't send more than one email per status transition per order (idempotency). Track `last_notification_status` on the order or in a sent log.

---

### [EPIC-05/STORY-11] — UX design and user-facing copy

**Type:** design
**Story Points:** 5
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend (consulted before frontend build)

#### User Story

As the product team, I want polished UX wireframes and compelling copy for the entire purchase flow so that the checkout experience feels effortless, trustworthy, and on-brand.

#### Acceptance Criteria

```gherkin
Given the purchase flow design
When reviewed
Then wireframes cover: Buy button states, retailer selection sheet, cart sheet, checkout page, order confirmation, order history, order detail, and all error/empty states

Given the copy is written
When reviewed
Then it covers: all button labels, form labels, status badge text, notification messages, error messages, empty states, age verification language, and email subject lines

Given the design system
When new components are reviewed
Then they use existing Shadcn/ui primitives and follow established color/spacing patterns

Given the checkout flow
When tested for accessibility
Then all interactive elements meet WCAG 2.1 AA standards in the wireframes
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | (design output — Figma, wireframe specs, or design tokens doc) | Create |
| Copy | (copy doc delivered to fullstack agents) | Create |

#### Dependencies

- **Blocked by:** None — UX and copy can begin immediately based on PRD
- **Blocks:** EPIC-05/STORY-07, STORY-08, STORY-09 — frontend build needs wireframes and copy

#### Testing Requirements

- [ ] **Accessibility:** Wireframes reviewed for color contrast, tap target sizes, keyboard navigation
- [ ] **Accessibility:** Copy reviewed for plain-language clarity and inclusive phrasing
- [ ] **Design review:** fullstack-1 reviews wireframes for technical feasibility

#### Implementation Notes

**UX focus areas:**
1. **Buy button → retailer sheet:** One-tap entry point. Sheet should feel lightweight, not like a separate page. Mobile-first: bottom sheet. Desktop: side panel or modal.
2. **Cart interaction:** Non-blocking — user can add to cart and continue browsing. Cart indicator (badge count) in nav. Cart opens as a sheet/drawer, not a full page.
3. **Checkout page:** Single-page checkout. Fulfillment toggle at top. Order summary always visible. Age verification above payment button. Minimal fields — don't ask for info we already have.
4. **Order confirmation:** Celebration moment. Clear "what happens next" with timeline. Retailer contact info prominent.
5. **Order status:** Visual timeline component. Color-coded status badges. Active state should feel reassuring ("Your wine is being prepared").
6. **Error states:** Out-of-stock mid-checkout (gentle redirect). Payment failed (clear retry path). Network error (retry with saved state).
7. **Empty states:** No orders yet → warm CTA to browse. No retailers nearby → location prompt.

**Copy focus areas (marketing-writer):**
- Button labels: "Buy · $XX" / "Add to Cart" / "Checkout" / "Pay $XX.XX" — action-oriented, price-visible
- Age verification: Legal-compliant but not clinical. "I confirm I'm 21 or older" not "By checking this box you certify under penalty of perjury..."
- Status labels: Human-readable. "Getting ready" not "confirmed". "On its way" not "out_for_delivery".
- Error messages: Empathetic, solution-focused. "This wine just sold out — check nearby stores?" not "Error: insufficient stock".
- Email subject lines: "Your Cru order is confirmed" / "Your wine is ready for pickup at [Store]" / "Your wine is on its way"
- Empty state: "Your wine story starts with a first sip. Browse our collection →"

---

## Story Summary

| Story | Title | Points | Agent | Phase |
|-------|-------|--------|-------|-------|
| STORY-01 | Create orders, order_items, and order_status_history tables with RLS | 8 | sr-backend | Backend |
| STORY-02 | DAL functions for cart and orders | 5 | sr-backend | Backend |
| STORY-03 | Cart management Server Actions | 5 | sr-backend | Backend |
| STORY-04 | Order placement and lifecycle Server Actions | 8 | sr-backend | Backend |
| STORY-05 | Stripe webhook handler and order finalization | 8 | fullstack-3 | Backend |
| STORY-06 | Inventory hold mechanism | 3 | sr-backend | Backend |
| STORY-07 | Retailer selection and cart UI | 8 | fullstack-1 | Frontend |
| STORY-08 | Checkout flow and order confirmation UI | 8 | fullstack-1 | Frontend |
| STORY-09 | Order history and detail pages | 5 | fullstack-4 | Frontend |
| STORY-10 | Order notification emails | 3 | fullstack-3 | Backend |
| STORY-11 | UX design and user-facing copy | 5 | ux-designer + marketing-writer | Frontend |
| **Total** | | **66** | | |

## Dependency Graph

```
STORY-11 (UX/copy) ──────────────────────┐
                                          │
STORY-01 (tables) ─────┬─► STORY-02 (DAL)│
                        │       │         │
                        │       ▼         │
                        │  STORY-03 (cart actions) ──► STORY-07 (cart UI) ◄─┘
                        │       │                          │
                        │       ▼                          │
                        │  STORY-04 (order actions) ──► STORY-08 (checkout UI)
                        │       │         │
                        │       ▼         │
                        └─► STORY-05 (Stripe webhook) ──► STORY-10 (emails)
                                │
EPIC-06 (retailer) ────► STORY-06 (inventory hold)
                                │
                        STORY-09 (order history UI) ◄── STORY-02
```

**Critical path:** STORY-01 → STORY-02 → STORY-03 → STORY-04 → STORY-05 → STORY-10 (backend chain)
**Frontend critical path:** STORY-11 → STORY-07 → STORY-08 (checkout flow)
**External dependency:** EPIC-06 (Retailer Integration) blocks STORY-03, STORY-06, STORY-07
