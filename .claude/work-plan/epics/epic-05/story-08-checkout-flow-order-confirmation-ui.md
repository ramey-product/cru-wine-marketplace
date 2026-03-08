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
