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
