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
