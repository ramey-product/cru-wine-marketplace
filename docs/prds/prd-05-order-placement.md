# PRD: Order Placement

**Feature:** Order Placement (Pickup/Delivery)
**Priority:** P0 — Launch Critical (RICE: 5,400)
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Discovery without a path to purchase is a recipe for abandoned interest. The core Cru loop — discover a wine, connect with its story, want to buy it — breaks completely if the user can't act on that desire immediately. Today, a consumer who falls in love with a wine on Instagram has to Google it, figure out who stocks it nearby, drive to the store hoping it's still on the shelf, and potentially give up at any friction point. Cru shortens that journey to one tap.

But unlike Drizly (defunct, March 2025) or GoPuff, Cru doesn't own inventory or run a delivery fleet. Cru is a marketplace that routes orders to local retail partners for fulfillment. This is a capital-light model that scales with the retailer network — but it means the ordering experience must abstract away the complexity of multi-retailer pricing, inventory, and fulfillment while feeling seamless to the consumer.

This feature serves 100% of users who convert from discovery to purchase. It's the revenue unlock — without it, Cru generates zero dollars.

## 2. Goals

**User Goals:**
- Go from "I want this wine" to "It's on its way" in under 2 minutes
- Choose between pickup (faster, free) and delivery (convenient, fee-based) based on their situation
- See accurate, real-time pricing and availability before committing
- Track their order status through to completion

**Business Goals:**
- Process 200+ orders/week by Month 3 LA launch milestone
- Achieve 5%+ browse-to-purchase conversion rate
- Capture 8-15% commission on every retail order (revenue model from Product Spec)
- Collect order data that feeds taste profile refinement and curation improvement

## 3. Non-Goals

- **Own inventory or fulfillment** — Cru is a marketplace. Retailers hold inventory and fulfill orders.
- **Multi-retailer cart** — V1 supports one retailer per order. If a user wants wines from two stores, that's two separate orders.
- **Subscription/recurring orders** — Not at launch. Subscription commerce is a P2 consideration.
- **Alcohol delivery compliance engine** — V1 launches in LA only (CA has favorable DTC/delivery laws). Multi-state compliance is a Phase 2 expansion concern.
- **Tipping or driver management** — Delivery logistics are managed by the retailer or their existing delivery partner (e.g., local courier). Cru doesn't manage drivers.
- **Gift orders or gift wrapping** — P1 feature.

## 4. User Stories

### Explorer (Primary)
- As an Explorer, I want to tap "Buy" on a wine I discovered and see which nearby stores have it in stock with their prices so that I can choose where to buy.
- As an Explorer, I want to choose between pickup and delivery so that I can get my wine the way that's most convenient right now.
- As an Explorer, I want to see the total cost (wine + any delivery fee + tax) before I confirm so that there are no surprises at checkout.
- As an Explorer, I want to receive an order confirmation with estimated pickup readiness or delivery time so that I know when to expect my wine.
- As an Explorer, I want to see my order history so that I can reorder something I loved.

### Enthusiast (Secondary)
- As an Enthusiast, I want to add multiple wines from the same retailer to a single order so that I can build a mixed case.
- As an Enthusiast, I want to see if a retailer offers case discounts so that I can save on larger orders.

### All Users
- As any user, I want to pay securely with my credit card (Stripe) so that my payment information is protected.
- As any user, I want to receive order status updates (confirmed, ready for pickup, out for delivery, delivered) so that I know where my order is.
- As any user, I want to contact the retailer if there's an issue with my order so that problems get resolved.

### Edge Cases
- As a user whose selected wine goes out of stock between browse and checkout, I want a clear notification and a suggestion to find it at another nearby store or wishlist it.
- As a user under 21 (based on age gate), I want to be blocked from placing an order with a clear explanation of the legal requirement.
- As a user in a location with no delivery-capable retailers, I want pickup to be the only option shown (not a confusing grayed-out delivery toggle).

## 5. Requirements

### Must-Have (P0)

**Wine-to-Cart Flow**
- From any wine card or wine detail page, "Buy" button opens a retailer selection sheet
- Retailer selection shows: store name, distance from user, price, stock status (in stock / low stock / out of stock), fulfillment options (pickup, delivery, or both)
- User selects a retailer → wine added to cart scoped to that retailer
- Cart supports multiple wines from the same retailer in a single order
- Acceptance criteria:
  - Given a wine is available at 3 nearby retailers, when the user taps "Buy," then all 3 appear sorted by distance with their price and fulfillment options
  - Given a user adds 2 wines from the same retailer, when they view the cart, then both wines appear in a single order with combined total

**Cart & Checkout**
- Cart displays: wine(s), quantity, unit price, subtotal
- Fulfillment selection: pickup or delivery (per retailer capabilities)
- For pickup: show store address, hours, estimated ready time (default: 1 hour after order)
- For delivery: show delivery address (from user profile or manual entry), estimated delivery window, delivery fee
- Age verification: re-confirm 21+ via checkbox before payment (legal requirement)
- Order summary: itemized total = subtotal + delivery fee (if applicable) + estimated tax
- Payment via Stripe Checkout (hosted or embedded)
- Acceptance criteria:
  - Given a user selects delivery, when they reach the order summary, then the delivery fee and estimated delivery window are clearly displayed
  - Given a user completes Stripe payment, when the payment succeeds, then an order record is created in the database and the user sees a confirmation screen

**Order Lifecycle**
- Order statuses: pending → confirmed → ready_for_pickup (or out_for_delivery) → completed (or cancelled)
- Retailer receives order notification (email + dashboard alert) immediately upon payment success
- User receives email confirmation with order details and estimated timeline
- User can view order status from their account (order history page)
- Acceptance criteria:
  - Given a retailer confirms an order, when the status updates to "Ready for Pickup," then the user receives an email notification
  - Given a user views their order history, when the page loads, then all past orders display with status, date, wines, retailer, and total

**Technical Requirements**
- Medusa.js v2 as the commerce engine: cart management, order lifecycle, inventory holds
- Stripe integration: Checkout Sessions for payment, webhooks for payment confirmation and refunds
- `orders` table, `order_items` table, `order_status_history` table — all with org_id, RLS, updated_at triggers
- Stripe webhook handler in `app/api/webhooks/stripe/route.ts` — verify signature, use supabaseAdmin (service role)
- DAL functions in `lib/dal/orders.ts`, `lib/dal/cart.ts`
- Server Actions in `lib/actions/orders.ts` — Zod validate → auth check → inventory check → Medusa cart → Stripe session → DAL persist
- Inventory hold: when user starts checkout, hold inventory for 10 minutes to prevent overselling
- Idempotent webhook processing: handle duplicate Stripe webhook deliveries gracefully

### Nice-to-Have (P1)

- In-app order tracking with real-time status updates (push notifications)
- Reorder flow: one-tap reorder from order history
- Gift orders with custom message and recipient address
- Case discount display: "Buy 6+, save 10%" (if retailer offers)
- Apple Pay and Google Pay via Stripe Payment Element

### Future Considerations (P2)

- Multi-retailer cart: combine wines from different stores into one checkout (requires split payment and coordinated fulfillment)
- Subscription orders: recurring delivery of curated wine selections
- Producer DTC orders: direct-from-winery shipping with compliance handling
- Order dispute resolution workflow

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Cart creation rate | 15% of sessions that reach a wine detail page | 20% | Cart events |
| Cart → checkout conversion | 60% of users who add to cart complete checkout | 70% | Funnel analytics |
| Checkout → payment success | 90% of checkout attempts succeed | 95% | Stripe events |
| Average order value | $45-65 | $65+ | Order data |
| Time from "Buy" to payment | < 2 minutes | < 90 seconds | Event timestamps |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Weekly orders | 200+ by Month 3 | 300+ | Order count |
| Repeat purchase rate | 30% of buyers order again within 30 days | 40% | Cohort analysis |
| Order completion rate | 95% of paid orders fulfilled without cancellation | 98% | Order status data |
| Average commission per order | $5-8 (at 12-15% take rate on $45-65 AOV) | $8+ | Revenue analytics |

## 7. Open Questions

- **[Engineering — blocking]** Medusa.js v2 cart management vs. custom cart: does Medusa's cart model support the retailer-scoped cart pattern, or do we need a custom layer on top?
- **[Legal — blocking]** California delivery compliance: does Cru need a license, or does the retailer's license cover marketplace-facilitated orders? Need legal review before delivery goes live.
- **[Product — blocking]** Inventory hold duration: 10 minutes is proposed. Too long frustrates retailers; too short causes checkout failures. Need retailer input.
- **[Operations — non-blocking]** How do retailers communicate "Ready for Pickup" or "Out for Delivery" status updates? Email reply? Dashboard button? API callback? This drives the notification UX.

## 8. Timeline Considerations

- **Build order: #5** — Depends on Local Retailer Integration (#6) for inventory and pricing data.
- **Weeks 7-10 of pre-launch sprint** (Track B)
- **Hard dependency:** Local Retailer Integration (#6) must be complete — Order Placement needs real-time inventory and pricing feeds. User Accounts (#1) for authenticated checkout.
- **External dependency:** Stripe integration setup, retailer POS testing, CA legal review for delivery.
- **Downstream dependents:** Push Notifications (P1) builds on order status for transactional alerts. Secondary Marketplace (P1) reuses the order/payment infrastructure.
