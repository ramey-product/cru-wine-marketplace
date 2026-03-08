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
