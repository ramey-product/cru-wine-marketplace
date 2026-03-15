# PRD: Order Tracking & Post-Purchase Experience

**Feature:** Order Tracking & Post-Purchase Experience
**Priority:** P0 — Launch Critical (RICE: 4,800)
**Author:** Matt Ramey
**Date:** March 14, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)
**Depends On:** PRD-05 (Order Placement), PRD-03 (Taste Profile Onboarding), PRD-07 (AI + Human Curation Engine)

---

## 1. Problem Statement

The order confirmation screen is where most marketplace apps lose their customers emotionally. The user has just handed over money for a product they haven't received yet — the highest-anxiety moment in any commerce transaction. In the wine context, this anxiety is amplified: the user is buying a physical product from a local retailer they may have never visited, through a marketplace they may be trying for the first time. Silence after payment is the fastest way to destroy trust.

Uber Eats and Grubhub solved this with real-time order tracking that provides continuous emotional reassurance — "my food is on the way." But Cru doesn't own delivery logistics, so a live GPS map of a driver is neither possible nor relevant. What Cru can provide is status-based reassurance: "your wine is being prepared," "it's ready for you," "it's on its way." Grubhub's proactive delay communication — notifying users before they have to ask why their order is late — is especially critical for a new marketplace where trust hasn't been established.

Beyond tracking, the post-purchase window is Cru's single best opportunity to build a lasting relationship. Food delivery apps treat post-purchase as a dead zone — rate your order, move on. But wine creates a richer ongoing relationship. When a user drinks the bottle they ordered, that's the moment to ask: "How was it?" A simple thumbs up or down on each wine feeds directly into the taste profile engine, improving future recommendations. This is the retention loop that food delivery apps cannot replicate — and it was identified as the #2 competitive recommendation in our marketplace UX research.

This PRD covers everything that happens after the user taps "Place Order" — the tracking experience, proactive communication, push notifications, taste feedback collection, reorder flow, and the active orders surface that keeps users engaged through fulfillment.

## 2. Goals

**User Goals:**
- Know exactly where my order stands at all times without having to ask
- Receive proactive updates if something is delayed or needs my attention
- Get notified the moment my order is ready for pickup or out for delivery
- Tell Cru what I thought of each wine so my future recommendations improve
- Reorder a wine I loved with one tap, without rebuilding my cart from scratch

**Business Goals:**
- Reduce order-related support inquiries by 60% through proactive status communication
- Achieve 40%+ post-purchase taste feedback submission rate (drives curation engine quality)
- Drive 25%+ repeat purchase rate within 30 days through reorder flow and taste-driven re-engagement
- Build push notification opt-in to 30%+ of users with completed orders (owned re-engagement channel)
- Increase average orders per user per month from 1.2 to 2.0 through frictionless reorder

## 3. Non-Goals

- **Live GPS driver tracking** — Cru doesn't own delivery logistics. The retailer manages fulfillment. Real-time courier tracking is a future consideration if Cru adds its own delivery fleet.
- **In-app chat with retailer** — V1 uses email/phone for retailer contact. In-app messaging is a P2 feature.
- **Wine ratings or numerical scores** — Product Principle #2 (Stories over scores). Taste feedback is thumbs up/down + optional note, not a 1-5 star rating.
- **SMS notifications** — V1 focuses on web push and email. SMS adds carrier costs and compliance burden. Consider for P2.
- **Order modification after placement** — Cancellation is supported (time-limited), but modifying items or quantities after order placement is not in scope.
- **Delivery ETA with real-time precision** — Estimated delivery windows come from retailer-set defaults, not real-time logistics calculations.

## 4. User Stories

### Explorer (Primary)

- As an Explorer, I want to see a visual progress tracker showing exactly where my order is in the fulfillment process so that I feel confident my wine is coming.
- As an Explorer, I want to be notified if my order hasn't been confirmed within 15 minutes so that I know Cru is looking into it rather than wondering if something went wrong.
- As an Explorer, I want to receive a push notification when my order is ready for pickup so that I don't waste time arriving too early or miss the window.
- As an Explorer, I want to be prompted to share what I thought of each wine after I pick up or receive my order so that Cru can learn my taste and recommend better wines next time.
- As an Explorer, I want to reorder a wine I loved with one tap so that I don't have to search for it again and rebuild my cart.

### Enthusiast (Secondary)

- As an Enthusiast, I want to see all my active orders in one place with live status so that I can manage multiple orders from different retailers.
- As an Enthusiast, I want my taste feedback to visibly improve my recommendations so that I feel my input matters and keep providing it.
- As an Enthusiast, I want to reorder an entire past order (multiple wines) in one action so that I can quickly replenish my cellar favorites.

### All Users

- As any user, I want to see a map showing the retailer's location with a "Get Directions" link so that I can easily navigate to pick up my order.
- As any user, I want to opt into push notifications after my first order (not before) so that the prompt feels relevant rather than intrusive.
- As any user, I want to see a badge on the Orders tab when I have active orders so that I'm reminded to check on them without actively thinking about it.

### Edge Cases

- As a user whose order is cancelled by the retailer, I want a clear explanation of why and what my options are (refund status, alternative retailers) so that I don't feel abandoned.
- As a user who reorders a wine that is now out of stock at the original retailer, I want to see alternative retailers or be offered a notification when it's back in stock so that I'm not dead-ended.
- As a user who denied push notification permission, I want to be able to enable it later from my settings so that I can change my mind.
- As a user with multiple active orders, I want each order's notifications to be clearly labeled with the retailer name so that I can tell them apart.

## 5. Requirements

### Must-Have (P0)

**Order Tracking Screen**
- Horizontal progress stepper showing the full order lifecycle with forward-looking steps (upcoming steps shown grayed out, not hidden)
- Pickup flow steps: Placed -> Confirmed -> Ready for Pickup -> Picked Up
- Delivery flow steps: Placed -> Confirmed -> Out for Delivery -> Delivered
- Status-specific colors: amber-600 (pending/placed), cru-primary burgundy (confirmed), emerald-600 (ready for pickup), blue-600 (out for delivery), muted-foreground (completed)
- Active step has a subtle pulse animation (600ms, ease-in-out); respects `prefers-reduced-motion`
- Order details section: order number, retailer name, order date, itemized wine list (name, vintage, producer, quantity, price), subtotal, delivery fee (if applicable), tax, total
- Static map thumbnail showing retailer location with a branded pin and "Get Directions" link (opens native maps app or Google Maps)
- Estimated ready time for pickup ("Ready in approximately 1 hour") or delivery window ("Estimated delivery: Today 5-7 PM")
- Retailer contact information (phone, email) with tap-to-call and tap-to-email
- Real-time status updates via Supabase Realtime `postgres_changes` subscription on `order_status_events` table, with 15-second polling fallback for degraded connections
- Accessible: `aria-live="polite"` on status stepper for screen reader announcements of status changes
- Acceptance criteria:
  - Given an order with status "confirmed," when the retailer updates status to "ready_for_pickup," then the stepper animates to the new step within 2 seconds and the user sees the updated status without refreshing
  - Given a pickup order, when the user views the tracking screen, then all four lifecycle steps are visible with completed steps checked, the active step pulsing, and future steps grayed out
  - Given a delivery order, when the user views the tracking screen, then the delivery-specific steps are shown and the estimated delivery window is displayed

**Proactive Order Status Communication**
- If a retailer has not confirmed an order within 15 minutes of placement, automatically notify the user: "We're checking on your order with [Store Name]. We'll update you shortly."
- Simultaneously alert the Cru operations team via internal notification (email to ops@cru.wine)
- Vercel cron job running every 5 minutes, querying `orders` table for `status = 'pending' AND created_at < NOW() - INTERVAL '15 minutes'` and `proactive_notification_sent = false`
- Mark order as `proactive_notification_sent = true` after notification to prevent duplicate sends
- Acceptance criteria:
  - Given an order placed 16 minutes ago with status still "pending," when the cron job runs, then the user receives a notification and the ops team is alerted
  - Given an order placed 16 minutes ago that has already triggered a proactive notification, when the cron job runs again, then no duplicate notification is sent

**Email Notifications**
- Email receipt sent on order placement (order confirmation with itemized details, retailer info, estimated timeline)
- Email notification on each status change: confirmed, ready for pickup / out for delivery, completed, cancelled
- Emails include order number, retailer name, status, and a deep link to the order tracking screen
- Acceptance criteria:
  - Given a user places an order, when payment succeeds, then they receive an email confirmation within 60 seconds containing order number, wine details, retailer info, and estimated ready time

**Active Orders Badge**
- Orders tab in the mobile bottom navigation shows a dot indicator (not a count) when there are one or more active (non-completed, non-cancelled) orders
- Cart icon in the top navigation shows an item count badge when the cart has items
- Badge state updates in real-time via the same Supabase Realtime subscription
- Acceptance criteria:
  - Given a user has 2 active orders, when they view any screen, then the Orders tab shows a dot indicator
  - Given all orders are completed, when the user views any screen, then the Orders tab has no dot indicator

**Active Orders List**
- Dedicated view showing all in-progress orders sorted by most recent first
- Each order card shows: retailer name, current status with color-coded badge, number of items, order total, time since order was placed, estimated ready/delivery time
- Tapping an order card navigates to the full order tracking screen
- Accessible from the Orders page and from the Commerce Hub
- Empty state when no active orders: "No active orders. Browse wines to get started." with a CTA to the browse page
- Acceptance criteria:
  - Given a user has 3 active orders at different statuses, when they view the active orders list, then all 3 appear sorted by most recent, each showing its current status with the correct color badge
  - Given a user has no active orders, when they view the active orders list, then the empty state message and browse CTA are displayed

**Technical Requirements**
- `order_status_events` table (event-sourced): `id`, `order_id`, `org_id`, `status`, `metadata` (JSONB — ETA, notes, actor), `created_at`; RLS policies scoping to org_id; index on `(order_id, created_at DESC)`
- `proactive_notification_sent` boolean column on `orders` table (default false)
- Supabase Realtime enabled on `order_status_events` table for INSERT events
- Polling fallback: client-side hook (`useOrderStatus`) that detects Realtime channel failure and falls back to 15-second polling via Supabase REST
- Static map: Mapbox Static Images API for retailer location thumbnail (server-rendered, no client-side GL library load on tracking page)
- DAL functions in `lib/dal/order-tracking.ts`: `getOrderWithStatus()`, `getActiveOrders()`, `getOrderStatusHistory()`
- Server Actions in `lib/actions/order-tracking.ts`: `submitTasteFeedback()`, `reorderFromHistory()`
- Vercel cron endpoint at `app/api/cron/check-pending-orders/route.ts` for proactive notification logic

### Nice-to-Have (P1)

**Push Notifications**
- Web Push API with VAPID keys for browser push notifications
- Opt-in prompt shown after the user's first completed order (not auto-prompted on first visit, not shown during onboarding)
- Prompt UI: a dismissible banner on the order confirmation screen — "Get notified when your orders are ready. Enable notifications?" with Enable and Not Now actions
- Notifications sent for: order confirmed, order ready for pickup, order out for delivery, order delivered
- Each notification includes: order-specific title ("Your wine is ready!"), body text with retailer name, deep link to order tracking screen, Cru branded icon
- Notification tag-based deduplication: same order status update replaces previous notification rather than stacking
- Service Worker (`public/sw.js`) handles push events and notification click (focus existing tab or open new one)
- `push_subscriptions` table: `id`, `user_id`, `org_id`, `endpoint`, `p256dh_key`, `auth_key`, `created_at`; RLS policies
- Settings page toggle for users to enable/disable push notifications after initial opt-in
- Acceptance criteria:
  - Given a user has opted into push notifications, when their order status changes to "ready_for_pickup," then they receive a browser push notification with the retailer name and a link to the tracking screen
  - Given a user has not opted in, when their order status changes, then no push notification is sent (email only)

**Post-Purchase Taste Feedback Loop**
- After an order reaches "completed" status (picked up or delivered), prompt the user to provide taste feedback on each wine in the order
- Prompt surfaces via: (1) in-app banner on next visit to the app, (2) email with deep link sent 2 hours after order completion
- Feedback UI: for each wine in the order, show the wine name, producer, and vintage with a thumbs up / thumbs down toggle and an optional freeform text field ("Tell us what you thought")
- Framing: "Help Cru learn your taste" — not "Rate this wine." Reinforces that feedback improves their personal experience, not that they're grading the wine.
- Feedback data feeds into the taste profile engine (PRD-03 `taste_signals` table integration) as a `purchase_feedback` signal type with high confidence weight
- `order_taste_feedback` table: `id`, `order_id`, `order_item_id`, `wine_id`, `user_id`, `org_id`, `sentiment` (enum: 'positive' | 'negative'), `note` (text, nullable), `created_at`
- After submitting feedback, show a brief confirmation: "Thanks! Your taste profile has been updated." with a link to view their taste profile
- Acceptance criteria:
  - Given a user's order was completed 2 hours ago and they haven't submitted feedback, when they open the app, then they see a banner prompting taste feedback for that order
  - Given a user taps thumbs up on a wine and submits, then a record is created in `order_taste_feedback` AND a `purchase_feedback` signal is written to `taste_signals` for the taste profile engine

**Reorder Flow**
- "Order Again" button on completed order cards in order history
- Tapping "Order Again" checks current availability of all wines in that order at the same retailer
- If all wines are available: pre-populate a new cart with the same items, same retailer, same quantities and navigate to the cart/checkout screen
- If some wines are out of stock: show which wines are unavailable, suggest alternatives from the same retailer (if any), and allow the user to proceed with available wines only
- If the retailer is no longer active on Cru: show a message explaining the retailer is unavailable and suggest other retailers that carry the same wines
- One-tap reorder for fully available orders (from cart confirmation to checkout in 2 taps)
- Acceptance criteria:
  - Given a user views a completed order where all wines are still in stock at the same retailer, when they tap "Order Again," then a new cart is created with the same items and they're navigated to checkout
  - Given a user taps "Order Again" but one wine is out of stock, then they see a clear indication of which wine is unavailable with an option to proceed with the remaining wines

### Future Considerations (P2)

- **In-app messaging with retailer** — Real-time chat for order questions, powered by Supabase Realtime
- **SMS notifications** — For users who prefer SMS over push, with carrier cost management
- **Scheduled pickup time selection** — Let user choose a specific pickup window (e.g., "Saturday 2-4 PM") instead of just "approximately 1 hour"
- **Delivery photo confirmation** — Retailer uploads photo of delivered order as proof of delivery
- **Order dispute resolution workflow** — Structured flow for reporting issues (wrong wine, damaged bottle, missing item) with automated retailer notification and Cru mediation
- **Post-purchase content drip** — After completing an order, send the user curated content about the wines they purchased (producer story, region deep-dive, food pairing guide) via email over the following week
- **Social sharing of taste feedback** — "Share what you thought" to Cru's social layer (PRD-08) so friends can see your wine reactions

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Order tracking page views per order | 2.5+ views per order | 3.5+ | Page view events per order_id |
| Proactive notification trigger rate | < 20% of orders trigger the 15-min check | < 10% | Cron job logs |
| Push notification opt-in rate | 25% of users with 1+ completed orders | 35% | push_subscriptions count / eligible users |
| Taste feedback submission rate | 30% of completed orders | 45% | order_taste_feedback records / completed orders |
| Reorder button tap rate | 15% of users who view completed orders | 25% | Event tracking |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Repeat purchase rate (30-day) | 25% of buyers order again within 30 days | 35% | Cohort analysis |
| Average orders per user per month | 1.5 | 2.0 | Order count / active users |
| Order-related support tickets | < 5% of orders generate a support inquiry | < 2% | Support ticket data |
| Taste profile completeness | 60% of active users have 5+ taste signals from purchases | 75% | taste_signals count per user |
| Reorder conversion rate | 50% of "Order Again" taps complete checkout | 65% | Funnel analytics |

## 7. RICE Scoring

| Factor | Score | Rationale |
|--------|-------|-----------|
| **Reach** | 8 | Every user who places an order interacts with tracking (100% of converting users). Push notifications and taste feedback extend engagement beyond the transaction. |
| **Impact** | 3 (High) | Directly drives repeat purchases (core revenue multiplier), reduces support load, and feeds the taste profile engine that powers Cru's differentiated curation. Post-purchase engagement is the retention moat. |
| **Confidence** | 80% | Order tracking is proven across all delivery marketplaces. Taste feedback loop is a novel application but the underlying pattern (post-purchase prompt) is well-established. Push notification acceptance rates on web have known variance (5-30%). |
| **Effort** | 4 person-weeks | Order tracking screen and real-time subscriptions (1.5 weeks), proactive notifications and email (0.5 weeks), push notifications (1 week), taste feedback loop (0.5 weeks), reorder flow (0.5 weeks). |
| **RICE Score** | (8 x 3 x 0.8) / 4 = **4,800** | |

## 8. Open Questions

- **[Product — non-blocking]** Taste feedback timing: should the prompt appear immediately on order completion, or after a delay (e.g., 24 hours) to give the user time to actually drink the wine? The 2-hour email is a compromise — but in-app prompts may be premature for wines intended for later consumption.
- **[Engineering — non-blocking]** Supabase Realtime connection limits: how many concurrent Realtime subscriptions can we sustain on our Supabase plan? Each active order tracking page opens a subscription. Need to validate capacity at projected order volumes.
- **[Product — non-blocking]** Should reorder check all retailers for the same wines (showing price comparison), or only the original retailer? Checking all retailers is more user-friendly but adds complexity and may undermine retailer relationships.
- **[Operations — non-blocking]** Proactive notification escalation: when the 15-minute cron fires, what does the ops team actually do? Call the retailer? The ops playbook needs to be defined alongside the technical implementation.
- **[Engineering — non-blocking]** VAPID key management: should VAPID keys be generated per-environment (dev/staging/prod) or shared? Per-environment is standard but requires env-specific service worker registration.

## 9. Timeline Considerations

- **Build order: #11** — Depends on Order Placement (PRD-05) for the order lifecycle and data model. Extends the `order_status_events` table already planned in PRD-05.
- **P0 features (tracking screen, proactive communication, email, badges, active orders list):** 2 weeks
- **P1 features (push notifications, taste feedback, reorder):** 2 weeks
- **Hard dependencies:** PRD-05 (Order Placement) must be complete — this PRD extends the order data model and lifecycle. PRD-03 (Taste Profile) for taste feedback signal integration. PRD-06 (Retailer Integration) for retailer inventory checks in reorder flow.
- **External dependencies:** Mapbox API account for static map images. VAPID key generation for Web Push. Email provider (Resend or similar) for transactional order emails.
- **Downstream dependents:** PRD-07 (AI + Human Curation Engine) benefits from taste feedback signals generated here. PRD-08 (Social Layer) can extend taste feedback into social sharing.
