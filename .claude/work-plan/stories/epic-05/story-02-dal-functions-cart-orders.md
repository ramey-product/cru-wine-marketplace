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
