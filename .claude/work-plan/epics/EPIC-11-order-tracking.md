# EPIC-11: Order Tracking & Post-Purchase Experience

**Priority:** P0 — Launch Critical
**Source PRD:** PRD-11 (Order Tracking & Post-Purchase Experience)
**Depends On:** EPIC-05 (Order Placement), EPIC-03 (Taste Profile), EPIC-12 (Discovery & Proximity — for map/location infrastructure)

---

## Problem Statement

After a user places an order, Cru goes silent. There's no visual progress tracker, no proactive communication if something goes wrong, no push notifications, and no way to provide taste feedback on purchased wines. This is the highest-anxiety moment in the purchase journey — the user handed over money for a product they haven't received. Uber Eats and Grubhub solve this with real-time tracking that provides continuous emotional reassurance. Cru needs status-based reassurance adapted for wine's longer fulfillment timelines.

Beyond tracking, post-purchase is Cru's best opportunity to build a lasting relationship. A simple thumbs up/down on each wine feeds the taste profile engine, improving future recommendations — a retention loop food delivery apps cannot replicate.

---

## Stories

### STORY 11/01: Order Tracking Screen — Progress Stepper & Details
**Points:** 8 | **Assignee:** fullstack-1

**What:** Build the primary order tracking screen with a horizontal progress stepper, order details, retailer info, and static map.

**Build:**
1. **Progress stepper** — Horizontal bar with 4 steps:
   - Pickup flow: Placed → Confirmed → Ready for Pickup → Picked Up
   - Delivery flow: Placed → Confirmed → Out for Delivery → Delivered
   - Completed steps: filled burgundy circle + checkmark
   - Active step: pulsing circle with status-specific color (see color mapping below)
   - Future steps: gray outline circle
   - Connecting line fills left-to-right (300ms ease-out) when status advances

2. **Status color mapping:**
   | Status | Color | Icon |
   |--------|-------|------|
   | Pending/Placed | amber-600 | Clock |
   | Confirmed | cru-primary (burgundy) | CheckCircle |
   | Ready for Pickup | emerald-600 | Package |
   | Out for Delivery | blue-600 | Truck |
   | Completed | muted-foreground | CheckCircle2 |
   | Cancelled | destructive | XCircle |

3. **Order details section:**
   - Order number, retailer name, order date
   - Itemized wine list: name, vintage, producer, quantity, price
   - Subtotal, delivery fee (if applicable), tax, total

4. **Map thumbnail:**
   - Static Mapbox image (200px height, full-width, rounded-lg)
   - Branded burgundy pin at retailer location
   - "Get Directions" button overlaid bottom-right (opens native maps)

5. **Time estimate:**
   - Pickup: "Ready in approximately X hour(s)"
   - Delivery: "Estimated delivery: Today X-Y PM"
   - Ready now: "Your order is ready!"

6. **Retailer contact:** Phone (tap-to-call), email (tap-to-email)

**Acceptance Criteria:**
- [ ] Tracking screen shows horizontal progress stepper with all lifecycle steps visible
- [ ] Completed steps show checkmark, active step pulses, future steps are grayed
- [ ] Status-specific colors applied per mapping table
- [ ] Order details show itemized list with totals
- [ ] Map thumbnail renders with retailer location pin
- [ ] "Get Directions" opens external maps app
- [ ] Time estimate displays appropriate format for pickup vs delivery
- [ ] Retailer phone is tap-to-call, email is tap-to-email
- [ ] `aria-live="polite"` on stepper for screen reader announcements
- [ ] Active pulse respects `prefers-reduced-motion`
- [ ] `loading.tsx` and `error.tsx` exist for the tracking page

---

### STORY 11/02: Real-Time Order Status Updates
**Points:** 5 | **Assignee:** sr-backend

**What:** Implement real-time order status updates via Supabase Realtime with polling fallback.

**Build:**
1. **`useOrderStatus` hook:**
   - Subscribe to Supabase Realtime `postgres_changes` on `order_status_events` table filtered by `order_id`
   - Detect channel failure (heartbeat timeout) → fallback to 15-second polling via Supabase REST
   - Expose: `currentStatus`, `statusHistory`, `isRealtime`, `lastUpdated`
   - Auto-reconnect on channel failure with exponential backoff

2. **Extend `order_status_events` table** (if not already from EPIC-05):
   - Ensure columns: `id`, `order_id`, `org_id`, `status`, `metadata` (JSONB — ETA, notes, actor), `created_at`
   - RLS policies scoping to `org_id`
   - Index on `(order_id, created_at DESC)`
   - Enable Supabase Realtime on this table for INSERT events

3. **DAL functions** in `lib/dal/order-tracking.ts`:
   - `getOrderWithStatus(orderId)` — order + latest status + full history
   - `getActiveOrders(userId)` — all non-completed/cancelled orders
   - `getOrderStatusHistory(orderId)` — event-sourced history

**Acceptance Criteria:**
- [ ] Status updates reflect on tracking screen within 2 seconds via Realtime
- [ ] If Realtime channel fails, polling fallback activates within 15 seconds
- [ ] `useOrderStatus` hook reconnects automatically after channel failure
- [ ] DAL functions return typed results with proper error handling
- [ ] RLS policies prevent cross-org access to order status events
- [ ] Migration is immutable and follows naming convention

---

### STORY 11/03: Proactive Order Status Communication
**Points:** 3 | **Assignee:** sr-backend

**What:** Alert users when their order hasn't been confirmed within 15 minutes, and notify the ops team.

**Build:**
1. **`proactive_notification_sent` column** on `orders` table (boolean, default false)
2. **Vercel cron endpoint** at `app/api/cron/check-pending-orders/route.ts`:
   - Runs every 5 minutes (configured in `vercel.json`)
   - Queries: `orders WHERE status = 'pending' AND created_at < NOW() - INTERVAL '15 minutes' AND proactive_notification_sent = false`
   - For each match: send user notification (in-app banner + email), alert ops team (email to ops@cru.wine)
   - Set `proactive_notification_sent = true`
3. **In-app delay banner:** Amber background, clock icon, "We're checking on your order with [Store Name]. We'll update you shortly."
   - Displays at top of tracking screen for orders matching the criteria

**Acceptance Criteria:**
- [ ] Orders pending >15 minutes trigger user notification and ops alert
- [ ] `proactive_notification_sent` prevents duplicate notifications
- [ ] Cron endpoint is idempotent (safe to run multiple times)
- [ ] In-app banner appears on the tracking screen for delayed orders
- [ ] Cron job configured in `vercel.json` at 5-minute intervals

---

### STORY 11/04: Email Notifications for Order Lifecycle
**Points:** 3 | **Assignee:** fullstack-3

**What:** Send transactional emails at each order status change.

**Build:**
1. **Email templates** (React Email + Resend):
   - Order confirmation: itemized details, retailer info, estimated timeline, deep link to tracking
   - Status change (confirmed, ready, out for delivery, delivered, cancelled): order number, retailer, new status, deep link
2. **Email trigger:** Server Action or database trigger on `order_status_events` INSERT
3. **Email subjects:**
   - Placed: "Your Cru order is confirmed — #[XXXX]"
   - Ready: "Your wine is ready for pickup!"
   - Delivery: "Your wine is on its way!"
   - Delivered: "Your wine has been delivered"
   - Cancelled: "Your order has been cancelled — #[XXXX]"

**Acceptance Criteria:**
- [ ] Email sent within 60 seconds of order placement with full details
- [ ] Email sent on each status change with appropriate subject and content
- [ ] Emails include deep link to order tracking screen
- [ ] Email templates use Cru branding
- [ ] Resend API integration with error handling and retry

---

### STORY 11/05: Active Orders List & Tab Badge
**Points:** 3 | **Assignee:** fullstack-4

**What:** Show active orders in a dedicated view and add a dot indicator to the Orders tab.

**Build:**
1. **Active orders list** — Page/section showing all in-progress orders:
   - Each card: retailer name, status badge (color-coded), item count, total, time since placed, estimated ready time
   - Sorted by most recent first
   - Tapping navigates to full tracking screen
   - Empty state: "No active orders. Browse wines to get started." with "Browse Wines" CTA

2. **Orders tab badge:**
   - Dot indicator (not count) on Orders tab when 1+ active orders exist
   - Badge state updates via Supabase Realtime subscription
   - Dot uses `bg-primary` color, 8x8px, positioned top-right of tab icon

3. **Commerce Hub integration:**
   - Active orders section in Commerce Hub (STORY 10/01) reads from same data source
   - Shows up to 3 most recent active orders

**Acceptance Criteria:**
- [ ] Active orders list shows all in-progress orders with correct status badges
- [ ] Tapping an order card navigates to the tracking screen
- [ ] Empty state displays when no active orders
- [ ] Orders tab shows dot indicator when active orders exist
- [ ] Dot disappears when all orders complete
- [ ] Badge updates in real-time

---

### STORY 11/06: Post-Purchase Taste Feedback (P1)
**Points:** 5 | **Assignee:** fullstack-2

**What:** Prompt users to provide taste feedback on wines after order completion.

**Build:**
1. **Taste feedback UI:**
   - Card-per-wine layout: wine thumbnail (48x48), name, producer
   - Thumbs up ("Loved it") / thumbs down ("Not for me") toggle buttons
   - Selected thumb scales to 1.1x with color fill
   - Optional text area with placeholder "What did you think? (optional)"
   - Header: "How was your wine?" Subtext: "Your feedback helps Cru find wines you'll love."
   - Submit CTA: "Submit Feedback"
   - Confirmation: "Thanks! Your taste profile has been updated." with "View Your Taste Profile" link

2. **Feedback prompt triggers:**
   - In-app banner on next visit after order completion
   - Email with deep link sent 2 hours after order completion (email subject: "How was the [Wine Name]?")

3. **Data model — `order_taste_feedback` table:**
   - `id`, `order_id`, `order_item_id`, `wine_id`, `user_id`, `org_id`
   - `sentiment` (enum: 'positive' | 'negative'), `note` (text, nullable), `created_at`
   - RLS on `org_id`, indexes on `(user_id, wine_id)` and `(order_id)`

4. **Taste signal integration:**
   - On feedback submit, write a `purchase_feedback` signal to `taste_signals` table (unified with PRD-03)
   - High confidence weight for purchase feedback (user actually tasted the wine)

5. **Server Action:** `lib/actions/order-tracking.ts` → `submitTasteFeedback()`
   - Zod validate → auth → create `order_taste_feedback` record → create `taste_signals` record → revalidatePath

**Acceptance Criteria:**
- [ ] Feedback banner appears on next app visit after order completion
- [ ] Card-per-wine layout with thumbs up/down and optional note
- [ ] Submitting feedback creates records in both `order_taste_feedback` and `taste_signals`
- [ ] Confirmation message displays after submission
- [ ] Email prompt sent 2 hours after completion with deep link
- [ ] Migration includes RLS policies and indexes

---

### STORY 11/07: Reorder Flow (P1)
**Points:** 5 | **Assignee:** fullstack-2

**What:** One-tap reorder from completed orders in order history.

**Build:**
1. **"Order Again" button** on completed order cards in order history
2. **Availability check:** When tapped, check current inventory at the same retailer for all wines in the order
3. **Scenarios:**
   - All available: pre-populate cart, navigate to checkout. Copy: "Your previous order is ready to reorder."
   - Partial availability: show unavailable wines, option to proceed with available. Copy: "[X] of [Y] wines are available."
   - Retailer unavailable: explain and suggest alternatives. Copy: "[Store Name] is no longer available on Cru."
4. **Server Action:** `lib/actions/order-tracking.ts` → `reorderFromHistory(orderId)`
   - Validate order belongs to user → check availability → create cart → return cart data

**Acceptance Criteria:**
- [ ] "Order Again" button appears on completed orders
- [ ] All-available scenario pre-populates cart and navigates to checkout
- [ ] Partial availability shows clear indication of which wines are unavailable
- [ ] Retailer unavailable shows explanatory message
- [ ] Server Action validates ownership and checks availability

---

### STORY 11/08: Push Notifications (P1)
**Points:** 5 | **Assignee:** fullstack-3

**What:** Web Push notifications for order status updates.

**Build:**
1. **Opt-in prompt:** Dismissible banner on order confirmation screen after first completed order
   - Copy: "Get notified when your orders are ready. Enable notifications?"
   - Actions: "Enable" / "Not Now"
2. **Service Worker** (`public/sw.js`): handle push events, notification click (focus tab or open new)
3. **`push_subscriptions` table:** `id`, `user_id`, `org_id`, `endpoint`, `p256dh_key`, `auth_key`, `created_at`; RLS
4. **VAPID keys:** per-environment (dev/staging/prod) in environment variables
5. **Notifications sent for:** confirmed, ready for pickup, out for delivery, delivered
6. **Notification format:** order-specific title, body with retailer name, deep link, Cru icon
7. **Tag-based deduplication:** same order status replaces previous notification
8. **Settings toggle** for enable/disable after initial opt-in

**Acceptance Criteria:**
- [ ] Opt-in prompt appears after first completed order (not before)
- [ ] Push notifications sent on each status change for opted-in users
- [ ] Notifications include order title, retailer name, and deep link
- [ ] Tag-based deduplication prevents notification stacking
- [ ] Service worker handles push events and click navigation
- [ ] Settings toggle allows disabling notifications
- [ ] `push_subscriptions` table has RLS policies

---

## Priority Order

1. **STORY 11/01** (Tracking screen) — Core experience, highest visibility
2. **STORY 11/02** (Real-time updates) — Makes tracking screen live
3. **STORY 11/05** (Active orders + badge) — Connects tracking to navigation
4. **STORY 11/03** (Proactive communication) — Trust builder
5. **STORY 11/04** (Email notifications) — Communication channel
6. **STORY 11/06** (Taste feedback) — P1, retention loop
7. **STORY 11/07** (Reorder flow) — P1, repeat purchase driver
8. **STORY 11/08** (Push notifications) — P1, engagement channel

**Total points:** 37
**Estimated execution:** 4 person-weeks (P0: 2 weeks, P1: 2 weeks)
**Recommended parallelization:** Stories 11/01 + 11/02 together (frontend + backend), then 11/03-11/05 in parallel, then P1 stories.
