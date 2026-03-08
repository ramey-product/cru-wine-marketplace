### [EPIC-09/STORY-10] — Customer Email Notifications for Order Status Changes

**Type:** fullstack
**Story Points:** 3
**Assigned Agent:** fullstack-3
**Phase:** Checkpoint 4: Frontend

#### User Story

As a customer, I want to receive email notifications when my order status changes so that I know when my wine is being prepared and when it's ready for pickup or delivery.

#### Acceptance Criteria

```gherkin
Given a retailer confirms an order
When the status changes to 'confirmed'
Then the customer receives an email: "Your order is confirmed — [Retailer Name] is preparing your wine"

Given a retailer marks an order as ready_for_pickup
When the status changes
Then the customer receives an email: "Your wine is ready for pickup at [Retailer Name]"

Given a retailer cancels an order
When the status changes to 'cancelled'
Then the customer receives an email with the cancellation reason and next steps

Given the email service is temporarily unavailable
When a status change triggers a notification
Then the status change still succeeds and the email is queued for retry
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Integration | `lib/integrations/email.ts` | Create |
| Integration | `lib/integrations/email-templates/order-confirmed.tsx` | Create |
| Integration | `lib/integrations/email-templates/order-ready.tsx` | Create |
| Integration | `lib/integrations/email-templates/order-cancelled.tsx` | Create |
| Action | `lib/actions/retailer-orders.ts` | Modify (add notification trigger) |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-02] — Email notifications are triggered by order status change actions
- **Blocks:** Nothing

#### Testing Requirements

- [ ] **Unit:** Email template renders correct content for each status change
- [ ] **Integration:** Status change Server Action triggers email send (mock email service in tests)
- [ ] **Integration:** Email send failure does not block status change

#### Implementation Notes

**Email service:** Use Resend (`@resend/node`) for transactional emails. Simple setup:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
```

**Email templates:** Use React Email (`@react-email/components`) for type-safe, previewable email templates. Each template is a React component that renders to HTML.

**Template content (to be finalized by marketing-writer in STORY-11):**
- **Order Confirmed:** Subject: "Your Cru order is confirmed." Body: wine names, retailer name, estimated time.
- **Ready for Pickup:** Subject: "Your wine is ready for pickup." Body: retailer name, address, hours.
- **Out for Delivery:** Subject: "Your wine is on its way." Body: estimated delivery time.
- **Completed:** Subject: "Order complete — enjoy your wine!" Body: summary, link to rate experience (future).
- **Cancelled:** Subject: "Your order has been cancelled." Body: reason, next steps, link to re-browse.

**Error handling:** Wrap email send in try/catch. If send fails, log the error and continue (don't throw). Consider a simple retry queue (e.g., Supabase Edge Function triggered by a database insert) for failed sends — but for V1, logging the failure and alerting ops is sufficient.

**Async trigger:** The order status Server Actions call a `sendOrderStatusEmail(order, newStatus)` helper after the DAL update succeeds. This helper is non-blocking (fire-and-forget with error logging).
