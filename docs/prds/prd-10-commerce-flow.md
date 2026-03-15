# PRD: Commerce Flow & Cart UX

**Feature:** Commerce Flow & Cart UX
**Priority:** P0 — Launch Critical (RICE: 4,800)
**Author:** Matt Ramey
**Date:** March 14, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Cru's current buy flow is an 8-tap gauntlet: Home, Browse, Find wine, Wine Detail, Buy Now, Retailer Sheet, Add to Cart, Cart, Checkout. Every unnecessary tap is a leak in the conversion funnel. Competitive analysis of Uber Eats and Grubhub shows that leading local marketplaces achieve 6-8 tap purchase flows — and Cru's flow is longer despite having a simpler product catalog (wine bottles vs. customizable food orders with sizes, toppings, and special instructions).

Three specific problems compound the friction:

**1. The center tab button is wasted real estate.** The most prominent UI element in the mobile app — the hero button in the tab bar — opens a "Quick Actions" sheet with two low-value options ("Add to Wishlist" redirects to Browse; "Scan Label" is coming soon). This is the prime real estate of the mobile experience and it communicates nothing about commerce. Uber Eats and Grubhub use their bottom navigation to surface cart state and active orders at all times. Cru hides both.

**2. Retailer availability is invisible until you're deep in the funnel.** A user browsing wine cards sees name, producer, varietal, region, and price range — but not whether any nearby store actually stocks it or what the real price is. The "Available at X stores" information only appears after tapping into Wine Detail and then tapping Buy Now. This means users invest 3-4 taps before learning whether a wine is even purchasable nearby. Competitive marketplaces show availability and pricing on every card in the browse feed. Cru should too.

**3. The cart has no persistent presence.** Once a user adds a wine to their cart, the only indication is a small badge on the Cart tab icon. There is no sticky bottom bar showing the running total, no add-to-cart animation confirming the action, and no ever-present nudge toward checkout. Uber Eats' persistent floating cart badge — showing item count and total price, always visible during browsing — is the single most cited UX pattern in our competitive research. Without it, users forget they have items in their cart and abandon.

These three problems share a root cause: the commerce layer is treated as a destination (pages you navigate to) rather than an ambient presence (information and actions available everywhere). This PRD fixes that by making commerce visible, fast, and satisfying across the entire app surface.

## 2. Goals

**User Goals:**
- Complete a purchase in 3 taps from Browse (Browse, Buy on card, Select retailer) — down from 8 taps today
- Always know their cart state without navigating away from what they're doing
- See retailer availability and real pricing on every wine card, not buried behind detail pages
- Feel confident and delighted when completing a purchase (celebration moment, not a dead-end confirmation page)

**Business Goals:**
- Increase browse-to-cart conversion rate from baseline to 20%+ by reducing friction between discovery and purchase intent
- Increase cart-to-checkout conversion rate to 65%+ through persistent cart visibility and ambient purchase nudges
- Reduce cart abandonment by 30% relative to header-badge-only cart indicator
- Increase average session engagement by giving the center tab button a reason to be tapped (Commerce Hub with cart preview, active orders, quick paths)

## 3. Non-Goals

- **Multi-retailer cart** — V1 supports one retailer per order. This PRD improves the single-retailer cart experience; multi-retailer is a future consideration.
- **Checkout flow redesign** — The checkout page itself (address, payment, order summary) is covered by PRD-05. This PRD covers everything that happens before and after checkout.
- **Push notifications for order tracking** — Order status push notifications are a P1 concern. This PRD covers the in-app celebration and transition to tracking, not the notification infrastructure.
- **Native mobile app interactions** — Haptic feedback, native share sheets, and platform-specific gestures are out of scope. This is a progressive web app; we use web-standard animations and interactions.
- **Delivery logistics or ETA accuracy** — Estimated times shown on retailer cards are retailer-provided defaults, not real-time logistics calculations. Cru does not own the delivery fleet.
- **Payment method management** — Adding, editing, or deleting saved payment methods is covered by PRD-05 and user account settings. This PRD surfaces the "pay" action but doesn't redesign payment flows.

## 4. User Stories

### Explorer (Primary)

- As an Explorer browsing wines, I want to see which stores near me have each wine in stock and at what price directly on the wine card so that I can identify purchasable wines without tapping into every detail page.
- As an Explorer who found a wine I want, I want to tap a buy button on the card itself and immediately see nearby retailers so that I can add to cart in 2 taps instead of 5.
- As an Explorer with items in my cart, I want a persistent bottom bar showing my item count and total so that I never lose awareness of my cart state while continuing to browse.
- As an Explorer who just placed an order, I want a brief, satisfying confirmation animation so that I feel the transaction is complete and real before transitioning to order tracking.

### Enthusiast (Secondary)

- As an Enthusiast who buys frequently, I want the center tab button to show my cart preview, active orders, and quick paths so that I can manage my wine-buying activity from one hub.
- As an Enthusiast comparing retailers, I want to see "Best Price" and "Closest" badges on retailer options, plus estimated pickup readiness time, so that I can make a fast, informed decision.
- As an Enthusiast adjusting my cart, I want a quantity stepper with a trash icon at quantity 1 so that removing a wine is intuitive and doesn't require hunting for a delete button.

### All Users

- As any user, I want an add-to-cart animation (subtle scale press on the button, counter update on the cart bar) so that I have tactile confirmation my action registered.
- As any user, I want to see retailer availability on wine cards in every context — Browse, Home recommendations, Wishlist, Collection pages — so that the information is consistent regardless of where I encounter a wine.

### Edge Cases

- As a user who taps the buy button on a card for a wine with no nearby retailers, I want a clear message ("Not available nearby") with a prompt to wishlist it or expand my search radius, not an empty sheet.
- As a user who has items in their cart from Retailer A and taps buy on a wine only available at Retailer B, I want a clear conflict dialog ("You have items from [Store A]. Start a new order from [Store B]?") — matching the Uber Eats restaurant-switch pattern.
- As a user on a slow connection, I want the sticky cart bar to show the last-known cart state from local storage so that it doesn't flash empty on every page navigation.
- As a user with accessibility needs, I want the sticky cart bar and Commerce Hub to be fully keyboard-navigable and screen-reader-announced, with `aria-live` regions for cart count updates.

## 5. Requirements

### Must-Have (P0)

**Commerce Hub (Quick Actions Redesign)**
- Replace the "+" center tab button icon with a commerce-oriented icon (not PlusCircle — use `LayoutGrid`, `ShoppingBag`, or a custom icon; final choice via design review)
- Center button opens a Commerce Hub bottom sheet with three sections:
  - **Cart Preview** (top): item count, total, retailer name, "View Cart" CTA. Empty state: "Your cart is empty" with "Browse Wines" link.
  - **Active Orders** (middle): up to 3 most recent active orders showing order number, retailer, status badge, time estimate. Empty state: "No active orders" with subtle messaging. "View All Orders" link at bottom.
  - **Quick Paths** (bottom): "Browse Wines," "Explore Producers," "My Wishlist," "Scan a Label" (with "Coming Soon" badge).
- Sheet height adapts to content — taller when cart has items and orders are active
- 44px minimum touch targets on all interactive elements
- Acceptance criteria:
  - Given a user with 2 items in cart and 1 active order, when they tap the center button, then the Commerce Hub shows cart preview (2 items, total, retailer), the active order with status, and 4 quick path links
  - Given a user with an empty cart and no orders, when they tap the center button, then empty states display for both sections with appropriate CTAs to browse or explore

**Sticky Bottom Cart Bar**
- Persistent bar fixed above the tab navigation on mobile when cart has 1+ items
- Displays: item count ("X items"), total price, and a "View Cart" CTA
- Slides up with a 200ms ease-out animation when the first item is added to the cart
- Slides down and hides when cart is emptied
- Uses the primary brand color (burgundy) for high visibility against the app background
- Does not appear on the Cart page itself or the Checkout page (redundant)
- On desktop, cart state is shown in the header (existing behavior); sticky bottom bar is mobile-only
- Cart state persists via local storage so the bar renders immediately on page navigation without waiting for server data
- Acceptance criteria:
  - Given a user with an empty cart on the Browse page, when they add a wine to cart, then the sticky bottom bar slides up from below the tab bar showing "1 item - $XX.XX - View Cart"
  - Given a user on the Wine Detail page with 3 items in cart, then the sticky bottom bar is visible showing "3 items - $XX.XX"
  - Given a user on the Cart page, then the sticky bottom bar does not appear
  - Given a user who clears their cart, then the sticky bottom bar slides down and disappears

**Retailer Availability on Wine Cards**
- Add an availability line to WineCard below the price, showing one of:
  - "Available at X stores" when multiple nearby retailers have stock (X is count)
  - "From $XX at [Store Name]" when showing the best-price option nearby
  - "Not available nearby" in muted text when no retailer within the user's radius has stock
- The availability line is tappable — opens the RetailerSelectionSheet directly, pre-populated with the wine, bypassing Wine Detail
- Availability displays in all card contexts: Browse grid, Home feed sections (Picked for You, Popular Near You, New on Cru), Wishlist, Collection detail pages
- An `showAvailability` prop on WineCard controls visibility (default true in browse contexts, can be disabled where inappropriate)
- Acceptance criteria:
  - Given a wine available at 3 nearby retailers, when a user views its card in Browse, then "Available at 3 stores" displays below the price and is tappable
  - Given a wine not available at any nearby retailer, when a user views its card, then "Not available nearby" displays in muted text
  - Given a user taps the availability line on a card, then the RetailerSelectionSheet opens with that wine pre-selected — the user does not navigate to Wine Detail

**Buy Button on Wine Cards**
- Add a small cart icon button (ShoppingCart icon) on wine cards in Browse and Collection views
- Tapping the buy button opens the RetailerSelectionSheet directly with the wine pre-selected
- This creates the 3-tap buy flow: Browse, tap buy icon, select retailer
- Button has a 44px minimum touch target
- Button does not appear on wine cards in contexts where direct-buy doesn't make sense:
  - Wishlist cards (different intent — curation, not immediate purchase)
  - "You Might Also Enjoy" recommendations on Wine Detail (user is already in the detail view)
  - Cards in the Commerce Hub cart preview (already in cart)
- Visual treatment: subtle, secondary button style that doesn't compete with the card's primary tap action (navigating to Wine Detail)
- Acceptance criteria:
  - Given a user on the Browse page, when they see a wine card, then a small cart icon button is visible on the card
  - Given a user taps the cart icon on a wine card, then the RetailerSelectionSheet opens for that wine — they do not navigate to Wine Detail
  - Given a wine card in the Wishlist, then no buy button appears on the card

**Cart UX Improvements**
- Quantity stepper: +/- buttons on each cart item. When quantity is 1, the minus button shows a trash icon instead of a minus, and tapping it removes the item from the cart (with a confirmation if the cart would become empty)
- Add-to-cart animation: the buy button or add-to-cart button scales to 0.97x on press (150ms ease-out) and springs back on release (200ms ease-out), providing tactile visual feedback
- Cart total animation: when the total price changes (item added, quantity changed), the number updates with a brief counter animation (numbers roll, 300ms duration) rather than an instant swap
- Cart bar item count updates with a subtle scale pulse (1.1x for 200ms, then back to 1x) when count changes
- Acceptance criteria:
  - Given a cart item with quantity 1, when the user views the quantity stepper, then the minus button shows a trash icon
  - Given a user taps the trash icon on a qty-1 item, then the item is removed from the cart
  - Given a user taps "Add to Cart" on any buy surface, then the button shows a brief press animation (scale 0.97x and back)
  - Given a user adds an item to a cart that already has items, then the cart bar total animates from the old value to the new value

**Order Confirmation Celebration**
- After a successful order placement, display a brief celebration animation:
  - Burgundy checkmark icon animates in with a radial expand effect (200ms)
  - "Order Placed" text in Playfair Display serif font fades in below the checkmark (150ms delay)
  - Order number and retailer name display below
- After 2 seconds, the screen auto-transitions to the order tracking view (smooth crossfade, 300ms)
- The user can tap anywhere to skip the celebration and go directly to tracking
- Acceptance criteria:
  - Given a user completes checkout successfully, then a burgundy checkmark animation displays with "Order Placed" text and order number
  - Given the celebration screen is showing, after 2 seconds, then the view transitions to order tracking
  - Given the celebration screen is showing, when the user taps anywhere, then the view immediately transitions to order tracking

**Retailer Selection Enhancements**
- Default sort order: "Best Value" — a composite score of price and distance (lower price + closer distance = higher rank). The algorithm weights price at 60% and distance at 40%
- Each retailer option shows estimated pickup readiness time: "Ready in ~30 min" (based on retailer-provided default prep time)
- For delivery-capable retailers: "Delivery by [time]" estimate based on retailer's delivery window
- Badges on top options:
  - "Closest" badge on the nearest retailer (only if it is not also the best value)
  - "Best Price" badge on the lowest-price retailer (only if it is not also the closest)
  - "Best Value" badge on the top-ranked retailer by the composite score
  - A retailer can only have one badge; "Best Value" takes precedence
- Store hours indicator: show "Open now" (green), "Closes soon" (amber, within 1 hour of closing), or "Closed" (muted, with next opening time). Closed retailers appear at the bottom of the list, dimmed but visible
- Touch targets: retailer option rows are minimum 44px tall (increased from current 40px)
- Acceptance criteria:
  - Given 3 nearby retailers with varying prices and distances, when the RetailerSelectionSheet opens, then retailers are sorted by best value (price x distance composite)
  - Given one retailer is closest and another has the lowest price, then "Closest" and "Best Price" badges appear on the respective options
  - Given a retailer closes in 45 minutes, then "Closes soon" displays in amber text on that retailer's row
  - Given a retailer is closed, then it appears at the bottom of the list with muted styling and its next opening time

### Nice-to-Have (P1)

- **Cart upsell section**: "Complete your case" — suggest complementary wines from the same retailer when the user has 1-3 items in cart. Recommendations based on varietal complementarity (red + white, still + sparkling).
- **Retailer sort toggle**: Let users switch between "Best Value" (default), "Price: Low to High," "Distance: Nearest," as explicit sort options in the RetailerSelectionSheet header.
- **Swipe-to-delete in cart**: Swipe left on a cart item to reveal a delete action, matching native mobile patterns.
- **"Notify me" on out-of-stock wines**: When a wine shows "Not available nearby," offer a "Notify me" button that subscribes the user to availability alerts for that wine within their radius.
- **Scheduled pickup time selection**: "Schedule pickup for Saturday 2 PM" — let users choose a future pickup window from the retailer's available slots.
- **Reorder shortcut in Commerce Hub**: For users with order history, add a "Reorder" section to the Commerce Hub showing the last 2 orders with one-tap reorder capability.

### Future Considerations (P2)

- **Haptic feedback**: Native-app-level haptic responses on add-to-cart and order placement (requires native wrapper or PWA improvements).
- **Voice-activated cart management**: "Add another bottle of the Tempranillo" via voice input.
- **AR label scanner integration**: Scan a wine label with the camera, identify the wine, and open the RetailerSelectionSheet directly — the ultimate shortcut from physical world to purchase.
- **Multi-retailer cart with split checkout**: Combine wines from different stores, with coordinated payment splitting and independent fulfillment tracking per retailer.
- **Dynamic pricing signals**: Show "Price dropped $3" or "Trending up" on wine cards based on historical pricing data from retailer feeds.

## 6. Technical Considerations

**Cart State Architecture**
- Cart state managed via React Context + `useOptimistic` (React 19) for instant UI updates on add/remove/quantity change, with Server Action reconciliation
- Local storage persistence for cart data so sticky bottom bar and Commerce Hub render immediately on navigation without waiting for server roundtrip
- Cart context wraps the app layout so the sticky bottom bar and Commerce Hub can read cart state from any page
- Single-retailer enforcement: adding an item from a different retailer triggers a conflict dialog before clearing the existing cart

**RetailerSelectionSheet Data**
- Wine availability data requires a query joining `retailer_inventory` (or equivalent) with retailer location data, filtered by user's configured radius
- For the "best value" sort, the composite score is calculated client-side from price and distance: `score = (price / maxPrice) * 0.6 + (distance / maxDistance) * 0.4` (lower is better)
- Store hours require a `retailer_hours` data structure (day-of-week + open/close times) to calculate "Open now" / "Closes soon" / "Closed" status client-side
- Mock data is acceptable for V1 frontend build; real data integration depends on PRD-06 (Retailer Integration)

**Animation Implementation**
- All animations use CSS transitions or Framer Motion (already in the project)
- Respect `prefers-reduced-motion`: all animations are wrapped in motion preference checks. Users with reduced motion see instant state changes instead of animations
- Order confirmation celebration uses a Framer Motion `AnimatePresence` component with exit animation on the auto-transition timer

**Sticky Bottom Cart Bar**
- Implemented as a fixed-position component within the app layout, rendered above the mobile tab navigation
- Z-index layering: tab bar (z-40) < cart bar (z-45) < bottom sheets (z-50)
- The bar does not shift page content (it overlays above the tab bar area, which already has reserved space)

**Accessibility**
- Sticky cart bar: `role="status"` with `aria-live="polite"` so screen readers announce cart count and total updates
- Commerce Hub sheet: focus trap when open, `aria-modal="true"`, `Escape` key dismisses
- Buy button on cards: `aria-label="Add [wine name] to cart"` for screen reader context
- Quantity stepper trash icon: `aria-label="Remove [wine name] from cart"`
- Retailer badges: badges are supplementary to visible text labels, not color-only indicators
- Order confirmation: auto-transition has a `role="alert"` announcement for screen readers

**Component Architecture**
- `components/features/commerce/StickyCartBar.tsx` — client component, reads from CartContext
- `components/features/commerce/CommerceHub.tsx` — client component, renders in bottom sheet
- `components/features/commerce/OrderConfirmation.tsx` — client component with Framer Motion
- `components/features/wines/WineCard.tsx` — update to accept `showAvailability` and `onBuy` props
- `components/features/orders/RetailerSelectionSheet.tsx` — update with sort logic, badges, hours, time estimates
- `components/features/cart/QuantityStepper.tsx` — client component with trash-at-1 behavior

## 7. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Tap count: Browse to cart | 3 taps (card buy button path) | 2 taps (via Commerce Hub reorder) | UX audit / session replay |
| Sticky cart bar → checkout rate | 40% of users who see the bar tap "View Cart" | 50% | Click event on cart bar CTA |
| Commerce Hub open rate | 30% of sessions tap the center button | 40% | Center button tap events |
| Buy-on-card usage | 25% of add-to-cart actions use the card buy button (vs. Wine Detail) | 35% | Event source attribution |
| RetailerSelectionSheet open-from-card rate | 20% of wine card interactions open the retailer sheet directly | 30% | Sheet open events with source tracking |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Browse-to-cart conversion | 20% of browse sessions result in an add-to-cart action | 25% | Funnel analytics |
| Cart-to-checkout conversion | 65% of users who add to cart complete checkout | 75% | Funnel analytics |
| Cart abandonment rate | < 35% (down from estimated 50%+ baseline without persistent cart) | < 25% | Cart created vs. order placed |
| Average order value | $50-70 | $70+ | Order data |
| Order confirmation → tracking view rate | 95% of order confirmations result in tracking page view | 98% | Auto-transition success rate |

## 8. Open Questions

- **[Design — non-blocking]** Commerce Hub icon: `LayoutGrid`, `ShoppingBag`, `Zap`, or a custom Cru icon? Needs design review with the full icon set in context. The icon must communicate "hub / command center" not "create" or "add."
- **[Engineering — non-blocking]** Cart state architecture: should cart data live in React Context + localStorage, or should we use Zustand for more complex state scenarios (e.g., optimistic updates across multiple components)? React Context + `useOptimistic` is the current recommendation, but Zustand may be simpler for cross-component sync.
- **[Product — non-blocking]** "Best Value" sort weighting: the proposed 60% price / 40% distance split is a starting point. Should this be user-configurable, or should we A/B test different weightings?
- **[Data — blocking for real data]** Retailer hours data: where does store hours information come from? If retailers don't provide structured hours data via PRD-06 integration, the "Open now / Closes soon / Closed" indicator can't function. Mock data works for V1 build, but real data depends on retailer onboarding.
- **[Legal — non-blocking]** Age gate on quick-buy: when a user adds to cart via the card buy button (bypassing Wine Detail), do we need an age verification step at any point before checkout, or is the checkout-level age confirmation (PRD-05) sufficient?

## 9. RICE Score

| Factor | Score | Rationale |
|--------|-------|-----------|
| **Reach** | 10 (100% of users) | Every user who browses wine is affected by card availability, buy buttons, and cart UX. The Commerce Hub is the center button — maximum surface area. |
| **Impact** | 3 (High) | Reduces buy flow from 8 taps to 3. Persistent cart visibility addresses the #1 gap identified in competitive research. Directly drives conversion metrics. |
| **Confidence** | 80% | Patterns are proven by Uber Eats and Grubhub at massive scale. Wine-specific adaptations (availability on cards, retailer badges) are logical extensions, not novel experiments. Celebration animation is well-established UX. |
| **Effort** | 5 person-weeks | Commerce Hub (1w), Sticky Cart Bar (0.5w), Availability on Cards (1w), Buy Button on Cards (0.5w), Cart UX Improvements (0.5w), Order Confirmation (0.5w), Retailer Selection Enhancements (1w). Parallelizable across 2-3 frontend developers. |
| **RICE Score** | **(10 x 3 x 0.8) / 5 = 4.8 -> 4,800** | |

## 10. Timeline Considerations

- **Build order: #10** — This is a UX enhancement layer on top of existing commerce infrastructure (PRD-05, PRD-06).
- **Dependencies:**
  - **PRD-05 (Order Placement)**: Cart, checkout, and order lifecycle must exist. This PRD enhances the cart UX and adds surfaces to access it, but doesn't build the underlying cart engine.
  - **PRD-06 (Retailer Integration)**: Real retailer availability, pricing, and hours data. Mock data is acceptable for the frontend build; real data integration is a separate workstream.
  - **PRD-02 (Search & Browse)**: Wine cards and browse grid must exist. This PRD adds props and behaviors to existing WineCard components.
- **Downstream dependents:** PRD-07 (Curation Engine) benefits from buy-on-card events as signals. The Commerce Hub becomes a natural surface for personalized recommendations (P1).
- **Parallelization:** Commerce Hub, Sticky Cart Bar, and Retailer Selection Enhancements can be built in parallel by different developers. Buy Button on Cards and Availability on Cards both touch WineCard.tsx and should be sequenced or coordinated.
