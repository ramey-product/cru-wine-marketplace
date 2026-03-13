# Epic 05 Handoff — Order Placement Backend

> **Created**: 2026-03-12
> **Previous**: EPIC-01 QA fixes merged (PR #12), PHASE3_HANDOFF.md completed
> **Branch**: Create `epic-05/order-placement` off `main`
> **PRD**: `docs/prds/prd-05-order-placement.md` (157 lines)
> **Epic File**: `.claude/work-plan/epics/epic-05-order-placement.md`

---

## Process Instructions (Mandatory)

1. **Work on ONE story at a time, sequentially** in dependency order below
2. **Delegate to `sr-backend`** for migrations, DAL, and actions
3. **Delegate to `fullstack-3`** for Stripe webhook handler (Story 05)
4. **Load context incrementally** — do NOT load all docs at once
5. **Subagents load their own context** — pass brief summaries and file paths, not full contents
6. **After each story**: commit, verify, mark complete in story file
7. **After all backend stories**: QA review, PR to main

---

## Scope: Backend Stories Only (CP3)

6 stories, 37 story points total. Frontend stories (07-11) are CP4 and out of scope for this handoff.

| # | Story | Points | Agent | Status |
|---|-------|--------|-------|--------|
| 01 | Orders tables + RLS | 8 | sr-backend | TODO |
| 02 | DAL functions (cart + orders) | 5 | sr-backend | TODO |
| 03 | Cart management Server Actions | 5 | sr-backend | TODO |
| 04 | Order placement + lifecycle Actions | 8 | sr-backend | TODO |
| 05 | Stripe webhook + order finalization | 8 | fullstack-3 | TODO |
| 06 | Inventory hold mechanism | 3 | sr-backend | TODO |

---

## Implementation Sequence (Dependency Chain)

```
Story 01 (tables)
  ├── Story 02 (DAL) ──── Story 03 (cart actions)
  │                  └─── Story 04 (order actions) ──── Story 05 (webhook)
  └── Story 06 (inventory holds) ─── Story 04 (holds used in checkout)
```

**Recommended order:** 01 → 06 → 02 → 03 → 04 → 05

Rationale: Story 06 (inventory holds) has no dependency on Story 02 and is needed by Story 04's `initiateCheckout`. Building it right after the orders tables lets Story 04 reference both the orders DAL and holds DAL.

---

## Dependencies — All Satisfied

| Dependency | Source | Migration |
|-----------|--------|-----------|
| `profiles` table | EPIC-01 | `20260307000001` |
| `organizations` table | EPIC-01 | `20260308000001` |
| `wines` table | EPIC-02 | `20260308000002` |
| `retailer_inventory` table | EPIC-06 | `20260308000011` |
| Medusa.js v2 | Already configured | `lib/medusa/sync.ts` exists |

---

## Key Architectural Decisions

### 1. Monetary Values in Cents (integer)
All money fields (`subtotal`, `tax`, `delivery_fee`, `total`, `unit_price`) are stored as `INTEGER` (cents). Matches Stripe's amount format. No floating-point math.

### 2. Dual-Access RLS Pattern
Orders are scoped to `org_id` (retailer) but also readable by the consumer (`user_id`). Two SELECT paths:
- **Consumer**: `WHERE user_id = auth.uid()`
- **Retailer org member**: `WHERE org_id IN (SELECT org_id FROM organization_memberships WHERE user_id = auth.uid())`

### 3. Cart Lives in Medusa, Orders in Supabase
- Cart state managed entirely by Medusa.js v2 (create, add/remove items, get)
- Cart scoped to single retailer via Medusa `SalesChannel`
- Cart ID stored in HTTP-only cookie (`medusa_cart_id`)
- After payment confirmation, order persisted to Supabase `orders` + `order_items`
- `medusa_cart_id` and `medusa_order_id` stored on order for traceability

### 4. Stripe Checkout Sessions
- Hosted Checkout page (redirect flow) — `success_url` + `cancel_url`
- Metadata: `{ orderId, medusaCartId, userId }` for webhook correlation
- Idempotent via `stripe_payment_intent_id` UNIQUE constraint

### 5. Inventory Holds in Supabase (not Medusa)
- Separate `inventory_holds` table with 10-minute TTL
- Service role only (restrictive RLS — no direct client access)
- Available stock = `retailer_stock - SUM(active holds)`
- Hold lifecycle: active → converted (payment success) | expired (timeout) | released (cancel)

### 6. Tax — Fixed Rate for V1
California + LA County rate (~9.5%). Store rate on order for audit trail. Multi-state support (Stripe Tax / TaxJar) deferred to Phase 2.

### 7. Order Status Machine
```
pending → confirmed | cancelled
confirmed → ready_for_pickup | out_for_delivery | cancelled
ready_for_pickup → completed | cancelled
out_for_delivery → completed | cancelled
completed → (terminal)
cancelled → (terminal)
```

---

## Tables to Create

### Migration 1: Orders Tables (Story 01)

**`orders`**
```
id                         UUID PK DEFAULT gen_random_uuid()
org_id                     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
user_id                    UUID NOT NULL REFERENCES profiles(id)
status                     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','ready_for_pickup','out_for_delivery','completed','cancelled'))
fulfillment_type           TEXT NOT NULL CHECK (fulfillment_type IN ('pickup','delivery'))
delivery_address           JSONB
delivery_fee               INTEGER NOT NULL DEFAULT 0
subtotal                   INTEGER NOT NULL
tax                        INTEGER NOT NULL
total                      INTEGER NOT NULL
stripe_checkout_session_id TEXT
stripe_payment_intent_id   TEXT UNIQUE
medusa_cart_id             TEXT
medusa_order_id            TEXT
estimated_ready_at         TIMESTAMPTZ
notes                      TEXT
age_verified               BOOLEAN NOT NULL DEFAULT false
created_at                 TIMESTAMPTZ DEFAULT now()
updated_at                 TIMESTAMPTZ DEFAULT now()
```

**`order_items`**
```
id                  UUID PK DEFAULT gen_random_uuid()
order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
wine_id             UUID NOT NULL REFERENCES wines(id)
quantity            INTEGER NOT NULL CHECK (quantity > 0)
unit_price          INTEGER NOT NULL
subtotal            INTEGER NOT NULL
medusa_line_item_id TEXT
created_at          TIMESTAMPTZ DEFAULT now()
updated_at          TIMESTAMPTZ DEFAULT now()
```

**`order_status_history`**
```
id          UUID PK DEFAULT gen_random_uuid()
order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
status      TEXT NOT NULL
changed_by  UUID REFERENCES profiles(id)
notes       TEXT
created_at  TIMESTAMPTZ DEFAULT now()
```

**RLS Policies:**
- `orders` SELECT: consumer by `user_id = auth.uid()` OR org member by `org_id` membership subquery
- `orders` INSERT: `user_id = auth.uid()`
- `orders` UPDATE: org member only (retailers confirm/complete)
- `order_items` SELECT: via order ownership (JOIN to orders)
- `order_items` INSERT: via order ownership
- `order_status_history` SELECT: via order ownership
- `order_status_history` INSERT: via order ownership or org membership

**Indexes:** `org_id`, `user_id`, `status`, `stripe_payment_intent_id`, `order_items(order_id)`, `order_status_history(order_id)`

### Migration 2: Inventory Holds (Story 06)

**`inventory_holds`**
```
id                          UUID PK DEFAULT gen_random_uuid()
wine_id                     UUID NOT NULL REFERENCES wines(id)
retailer_org_id             UUID NOT NULL REFERENCES organizations(id)
user_id                     UUID NOT NULL REFERENCES profiles(id)
quantity                    INTEGER NOT NULL CHECK (quantity > 0)
expires_at                  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
status                      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','converted','expired','released'))
stripe_checkout_session_id  TEXT
created_at                  TIMESTAMPTZ DEFAULT now()
```

**RLS:** Restrictive — service role only for INSERT/UPDATE. No direct client access.

---

## Files to Create

| Layer | File | Story | Description |
|-------|------|-------|-------------|
| Migration | `supabase/migrations/20260312000001_create_orders.sql` | 01 | orders, order_items, order_status_history + RLS |
| Migration | `supabase/migrations/20260312000002_create_inventory_holds.sql` | 06 | inventory_holds + restrictive RLS |
| DAL | `lib/dal/orders.ts` | 02 | getOrdersByUser, getOrderById, getOrdersByOrg, getOrderByPaymentIntent, createOrder, updateOrderStatus |
| DAL | `lib/dal/cart.ts` | 02 | Thin Medusa client wrappers: createMedusaCart, addItemToCart, updateCartItem, removeCartItem, getCart |
| DAL | `lib/dal/inventory-holds.ts` | 06 | createHold, releaseHold, convertHold, expireHolds, getActiveHoldsForItem |
| Validation | `lib/validations/cart.ts` | 03 | addToCartSchema, updateCartItemSchema, removeFromCartSchema |
| Validation | `lib/validations/orders.ts` | 04 | initiateCheckoutSchema, updateOrderStatusSchema, cancelOrderSchema |
| Action | `lib/actions/cart.ts` | 03 | addToCart, updateCartItemQuantity, removeFromCart, getActiveCart |
| Action | `lib/actions/orders.ts` | 04 | initiateCheckout, updateOrderStatus, cancelOrder |
| Lib | `lib/stripe/checkout.ts` | 04 | Stripe Checkout Session creation with metadata |
| API Route | `app/api/webhooks/stripe/route.ts` | 05 | Stripe webhook endpoint with signature verification |
| Lib | `lib/stripe/webhook-handlers.ts` | 05 | checkout.session.completed, charge.refunded, payment_intent.payment_failed |
| Lib | `lib/email/order-notifications.ts` | 05 | Consumer + retailer confirmation email stubs |
| Lib | `lib/medusa/inventory.ts` | 06 | Medusa inventory sync helpers |

---

## Existing Schema Context (Quick Reference)

18 migrations exist in `supabase/migrations/`. Key tables already available:

| Table | Migration | Used By |
|-------|-----------|---------|
| `profiles` | `20260307000001` | FK: orders.user_id, inventory_holds.user_id |
| `organizations` | `20260308000001` | FK: orders.org_id, inventory_holds.retailer_org_id |
| `wines` | `20260308000002` | FK: order_items.wine_id, inventory_holds.wine_id |
| `retailer_inventory` | `20260308000011` | Available stock source for holds |
| `organization_memberships` | `20260308000001` | RLS subqueries for retailer access |

## Existing Code Context

| Module | Path | Relevant To |
|--------|------|-------------|
| Medusa sync | `lib/medusa/sync.ts` | Pattern for Medusa client usage |
| Inventory DAL | `lib/dal/inventory.ts` | Stock queries for hold calculation |
| Retailers DAL | `lib/dal/retailers.ts` | Retailer org lookups |
| Wines DAL | `lib/dal/wines.ts` | Wine lookups for cart/order items |
| DAL types | `lib/dal/types.ts` | TypedClient pattern |
| Validation patterns | `lib/validations/*.ts` | Zod schema conventions |
| Action patterns | `lib/actions/*.ts` | Server Action structure (Zod → auth → permission → DAL → revalidate) |

---

## Environment Variables Needed

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

These should be added to `.env.local` before starting Story 04. Stripe webhook secret requires creating a webhook endpoint in the Stripe dashboard (or using `stripe listen --forward-to` for local dev).

---

## Risks & Open Questions

1. **Medusa Cart Integration**: `lib/medusa/sync.ts` exists but cart-specific operations haven't been tested. Story 02's cart DAL wraps Medusa — may need to verify Medusa v2 API surface for cart/line-item operations.
2. **Stripe Checkout vs Payment Intents**: Story 04 creates a Checkout Session (hosted page). If embedded checkout is desired later, the `sessionId` return path is noted in the story but not primary for V1.
3. **Email Delivery**: Story 05 creates `lib/email/order-notifications.ts`. No email service is configured yet — these will be stubs/TODO for V1 with the interface defined.
4. **pg_cron for Hold Expiration**: Story 06 mentions cron for expiring holds. May need Supabase pg_cron extension or a Vercel cron job. For V1, expired holds can be checked at query time (WHERE expires_at < now()).
5. **Concurrent Checkout**: Story 06 requires that only one hold succeeds for the last unit. This needs either a database-level lock or a CHECK constraint tied to stock counts.

---

## How to Start

1. **Pull latest main**: `git checkout main && git pull`
2. **Create branch**: `git checkout -b epic-05/order-placement`
3. **Read Story 01**: `.claude/work-plan/stories/epic-05/story-01-create-orders-tables-rls.md`
4. **Delegate to `sr-backend`** with:
   - Story file path
   - Brief: "Create orders, order_items, order_status_history tables with dual-access RLS (consumer by user_id, retailer by org_id). Money in cents. See EPIC05_HANDOFF.md for schema spec."
   - Reference: This handoff doc for schema details + existing migration patterns
5. **Continue through stories** in order: 01 → 06 → 02 → 03 → 04 → 05
6. **After all 6 stories**: Run QA review, create PR to main

---

## Story File Paths

| Story | Path |
|-------|------|
| 01 | `.claude/work-plan/stories/epic-05/story-01-create-orders-tables-rls.md` |
| 02 | `.claude/work-plan/stories/epic-05/story-02-dal-functions-cart-orders.md` |
| 03 | `.claude/work-plan/stories/epic-05/story-03-cart-management-server-actions.md` |
| 04 | `.claude/work-plan/stories/epic-05/story-04-order-placement-lifecycle-actions.md` |
| 05 | `.claude/work-plan/stories/epic-05/story-05-stripe-webhook-order-finalization.md` |
| 06 | `.claude/work-plan/stories/epic-05/story-06-inventory-hold-mechanism.md` |
