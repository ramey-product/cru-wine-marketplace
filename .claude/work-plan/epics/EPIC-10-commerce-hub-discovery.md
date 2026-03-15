# EPIC-10: Commerce Flow & Cart UX

**Priority:** P0 — Launch Critical
**Source PRD:** PRD-10 (Commerce Flow & Cart UX)
**Depends On:** EPIC-05 (Order Placement — cart engine), EPIC-06 (Retailer Integration — availability data), EPIC-12 (Discovery & Proximity — location infrastructure for availability)

---

## Problem Statement

Cru's buy flow is an 8-tap gauntlet. The most prominent UI element — the center tab bar button — opens a "Quick Actions" sheet with two low-value options. Retailer availability is invisible until deep in the funnel. The cart has no persistent presence. These problems share a root cause: the commerce layer is treated as a destination rather than an ambient presence. This epic fixes that.

---

## Stories

### STORY 10/01: Commerce Hub (Quick Actions Redesign)
**Points:** 5 | **Assignee:** fullstack-1

**What:** Replace the "+" Quick Actions sheet with a Commerce Hub showing cart preview, active orders, and quick paths.

**Build:**
1. **Icon change:** Replace `PlusCircle` with `ShoppingBag` (per UX review recommendation — communicates commerce intent). Filled circle treatment stays.

2. **Cart Preview** (top section):
   - Items in cart: show count, total, retailer name, "View Cart" CTA
   - Empty: "Your cart is empty — great wines are waiting." with "Browse Wines" link
   - Reads from CartContext (see STORY 10/03)

3. **Active Orders** (middle section):
   - Up to 3 most recent active orders (Confirmed/Ready status)
   - Each: order #, retailer, status badge (color-coded per EPIC-11 mapping), time estimate
   - "View All Orders" link at bottom
   - Empty: "No active orders right now."
   - Data from `getActiveOrders()` DAL function (EPIC-11)

4. **Quick Paths** (bottom section):
   - "Browse Wines" → /wines
   - "Explore Producers" → /producers
   - "My Wishlist" → /wishlist
   - "Scan a Label" → # (Coming Soon badge)

5. **Sheet UX:** Height adapts to content. `side="bottom"` with `rounded-t-xl`. 44px min touch targets. Focus trap when open.

**Copy:**
- Sheet title: "Your Wine Hub"
- See copy deck for all strings

**Acceptance Criteria:**
- [ ] Center button icon is `ShoppingBag` (not "+")
- [ ] Sheet shows cart preview with item count, total, and retailer
- [ ] Sheet shows up to 3 active orders with color-coded status badges
- [ ] Sheet shows 4 quick path links
- [ ] Empty states handled gracefully with appropriate CTAs
- [ ] Sheet height adapts to content
- [ ] 44px minimum touch targets on all interactive elements
- [ ] Focus trap and `aria-modal="true"` when open
- [ ] `Escape` key dismisses

---

### STORY 10/02: Retailer Availability on Wine Cards
**Points:** 5 | **Assignee:** fullstack-4

**What:** Surface retailer availability directly on wine cards throughout the app.

**Build:**
1. **Availability line** below price on WineCard:
   - Multiple stores: "Available at X stores" (with MapPin icon, 12x12px, `text-xs text-muted-foreground`)
   - Single best price: "From $XX at [Store Name]"
   - None: "Not available nearby" in muted text
   - Tapping opens RetailerSelectionSheet directly (bypasses Wine Detail)

2. **`showAvailability` prop** on WineCard (default true in browse contexts):
   - Browse grid, Home feed sections, Wishlist, Collection detail: show availability
   - Wine Detail "You Might Also Enjoy": don't show (already on detail page)
   - Commerce Hub cart preview: don't show

3. **Mock data model** (real data from EPIC-12 spatial queries):
   ```typescript
   interface WineAvailability {
     nearbyRetailerCount: number
     lowestPrice: number
     closestRetailer: { name: string; distanceMiles: number; prepTimeMinutes: number }
   }
   ```

**Acceptance Criteria:**
- [ ] Wine cards show availability when `showAvailability` prop is true
- [ ] Availability line tappable → opens RetailerSelectionSheet
- [ ] Shows in Browse, Home, Wishlist, Collection views
- [ ] "Not available nearby" shows when no retailers have stock
- [ ] MapPin icon prefix on availability line

---

### STORY 10/03: Cart State & Sticky Bottom Bar
**Points:** 5 | **Assignee:** fullstack-1

**What:** Implement cart state management and a persistent sticky bottom cart bar on mobile.

**Build:**
1. **CartContext** (React Context + `useOptimistic`):
   - Wraps `(app)/layout.tsx` for app-wide access
   - State: items array, total, retailer info, item count
   - Actions: addItem, removeItem, updateQuantity, clearCart
   - `useOptimistic` for instant UI, Server Action reconciliation
   - Local storage persistence (key: `cru-cart-v1`, versioned schema)
   - `useSyncExternalStore` for SSR safety

2. **Sticky bottom cart bar** (mobile only):
   - Fixed above tab bar when cart has 1+ items
   - Shows: "X items · $XX.XX" + "View Cart" CTA
   - Uses `bg-primary/95 backdrop-blur-md` (burgundy, per UX review)
   - Height: 56px (h-14), matches tab bar
   - Z-index: z-45 (between tab bar z-40 and sheets z-50)
   - Slides up 200ms ease-out on first item, slides down on empty
   - Not shown on Cart page or Checkout page
   - `role="status"` with `aria-live="polite"` for screen reader announcements
   - Item count pulse: scale 1.1x for 200ms on count change

3. **Single-retailer enforcement:**
   - Adding item from different retailer triggers conflict dialog
   - Title: "Switch stores?"
   - Body: "You have items from [Store A]. Starting an order from [Store B] will clear your current cart."
   - CTAs: "Switch to [Store B]" (primary) / "Keep current cart" (secondary)

4. **Desktop:** Cart state shown in header (existing behavior), no sticky bottom bar

**Component:** `components/features/commerce/StickyCartBar.tsx` (client component)

**Acceptance Criteria:**
- [ ] CartContext provides cart state to entire app
- [ ] Local storage persistence renders cart bar immediately on navigation
- [ ] Sticky bar slides up when first item added, down when emptied
- [ ] Bar shows item count, total, and "View Cart" CTA
- [ ] Bar not shown on Cart or Checkout pages
- [ ] Retailer conflict dialog works correctly
- [ ] `aria-live="polite"` announces cart updates
- [ ] Respects `prefers-reduced-motion` for animations

---

### STORY 10/04: Buy Button on Wine Cards
**Points:** 3 | **Assignee:** fullstack-2

**What:** Add a cart icon button on wine cards for 3-tap purchase flow.

**Build:**
1. **`onBuy` callback prop** on WineCard (optional)
2. **ShoppingCart icon button** — `ghost` variant, 32x32px visible in 44x44px touch target
3. **Position:** bottom-right of card, vertically aligned with price
4. **Tap → opens RetailerSelectionSheet** with wine pre-selected
5. **Hidden in:** Wishlist cards, "You Might Also Enjoy" on Wine Detail, Commerce Hub cart preview
6. **Press animation:** Scale 0.97x (150ms ease-out), spring back (200ms ease-out)
7. **`aria-label`:** "Add [wine name] to cart"

**Acceptance Criteria:**
- [ ] Wine cards in Browse and Collection show buy button
- [ ] Tapping opens RetailerSelectionSheet for that wine
- [ ] 44px touch target maintained
- [ ] Not shown in Wishlist, Wine Detail recommendations, or Commerce Hub
- [ ] Press animation respects `prefers-reduced-motion`
- [ ] `aria-label` includes wine name

---

### STORY 10/05: Cart UX Improvements
**Points:** 3 | **Assignee:** fullstack-2

**What:** Quantity stepper with trash-at-1, add-to-cart animation, cart total animation.

**Build:**
1. **Quantity stepper** (`components/features/cart/QuantityStepper.tsx`):
   - Pill-shaped container: `rounded-full bg-muted`
   - Minus / count / Plus buttons
   - At qty 1: minus transitions to `Trash2` icon (150ms crossfade)
   - Tapping trash at qty 1 removes item (confirmation if last item in cart)
   - `aria-label="Remove [wine name] from cart"` on trash

2. **Add-to-cart animation:**
   - Button scales 0.97x on press (150ms), springs back (200ms)
   - Checkmark briefly replaces cart icon (300ms)

3. **Cart total animation:**
   - Number rolls (counter animation, 300ms) on total change
   - Cart bar count pulses (1.1x scale, 200ms) on count change

**Acceptance Criteria:**
- [ ] Quantity stepper shows trash icon at qty 1
- [ ] Tapping trash removes item from cart
- [ ] Add-to-cart button shows press animation
- [ ] Cart total animates on value change
- [ ] All animations respect `prefers-reduced-motion`

---

### STORY 10/06: Order Confirmation Celebration
**Points:** 3 | **Assignee:** fullstack-2

**What:** Brief celebration animation after successful order placement.

**Build:**
1. **Celebration screen** (`components/features/commerce/OrderConfirmation.tsx`):
   - Burgundy checkmark with radial expand (200ms)
   - "Order Placed" in Playfair Display, fades in (150ms delay)
   - Order number and retailer name below
   - Uses Framer Motion `AnimatePresence`

2. **Auto-transition:** After 2s, horizontal wipe (300ms) to order tracking view
3. **Skip:** Tap anywhere to go directly to tracking
4. **Accessibility:** `role="alert"` for screen reader announcement
5. **Copy:** "Order Placed" / "Order #[XXXX] from [Store Name]" / "Taking you to order tracking..."

**Acceptance Criteria:**
- [ ] Checkmark animation displays on successful order
- [ ] "Order Placed" text and order details show
- [ ] Auto-transition to tracking after 2 seconds
- [ ] Tap anywhere skips to tracking immediately
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Screen reader announces order placement

---

### STORY 10/07: Retailer Selection Enhancements
**Points:** 5 | **Assignee:** fullstack-4

**What:** Upgrade RetailerSelectionSheet with smart sorting, badges, time estimates, and store hours.

**Build:**
1. **"Best Value" default sort:**
   - Composite score: `score = (normalizedPrice * 0.6) + (normalizedDistance * 0.4)`, lower is better
   - Normalized: `price / maxPrice`, `distance / maxDistance`

2. **Badges** (one per retailer, precedence: Best Value > Best Price > Closest):
   - "Best Value" — `badge-best-value` (primary/primary-foreground)
   - "Best Price" — `badge-best-price` (emerald-100/emerald-700)
   - "Closest" — `badge-closest` (blue-100/blue-700)

3. **Time estimates:**
   - Pickup: "Ready in ~30 min" (from retailer's configured prep time, default 30 min)
   - Delivery: "Delivery by 4:00 PM" (from retailer's delivery window)
   - Format: "Ready in ~30 min · 1.2 mi" (time-first, per EPIC-12 STORY 12/08)

4. **Store hours:**
   - "Open now" (green), "Closes soon" (amber, within 1hr), "Closed" (muted + next opening time)
   - Closed retailers sorted to bottom, dimmed but visible

5. **Touch targets:** Retailer rows minimum 44px (h-11, up from h-10)

**Acceptance Criteria:**
- [ ] Retailers sorted by "best value" composite score by default
- [ ] Correct badges on qualifying retailers (one badge max)
- [ ] Time estimates show on each retailer row
- [ ] Store hours indicator (open/closing soon/closed) displays
- [ ] Closed retailers at bottom, dimmed
- [ ] Touch targets are 44px minimum

---

## Priority Order

1. **STORY 10/03** (Cart state + sticky bar) — Foundation, enables everything else
2. **STORY 10/01** (Commerce Hub) — Highest visibility redesign
3. **STORY 10/02** (Availability on cards) — Core differentiator
4. **STORY 10/07** (Retailer selection enhancements) — Improves purchase decision
5. **STORY 10/04** (Buy on cards) — Shortens buy flow
6. **STORY 10/05** (Cart UX improvements) — Polish
7. **STORY 10/06** (Order confirmation) — Delight moment

**Total points:** 29
**Estimated execution:** 5 person-weeks (per engineering review)
**Recommended parallelization:**
- Phase 1 (Week 1-2): STORY 10/03 (cart state) — must be first, everything reads from CartContext
- Phase 2 (Week 2-4): STORY 10/01 + 10/02 + 10/07 in parallel (different components)
- Phase 3 (Week 4-5): STORY 10/04 + 10/05 + 10/06 in parallel (card + cart + confirmation)

---

## Cross-Epic Dependencies

- **EPIC-11 (Order Tracking):** Commerce Hub's "Active Orders" section reads from EPIC-11's `getActiveOrders()` DAL. Order confirmation (10/06) transitions to EPIC-11's tracking screen.
- **EPIC-12 (Discovery & Proximity):** Availability on cards (10/02) needs location data from EPIC-12's geolocation infrastructure. Retailer selection enhancements (10/07) use EPIC-12's proximity display format.
- **Build sequence (per Architecture review):** EPIC-12 infrastructure → EPIC-10 + EPIC-11 in parallel → EPIC-12 UI.
