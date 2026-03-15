# Competitive UX Research: Uber Eats & Grubhub — UX Design Lens

**Author**: UX/UI Design Lead
**Date**: 2026-03-14
**Purpose**: Extract interaction patterns, information architecture, and component design lessons from two leading local delivery marketplaces. Adapt findings for Cru's premium wine marketplace context.

---

## Top 10 Patterns to Adopt (Ranked by Impact)

1. **Sticky bottom cart bar on mobile** — Higher visibility than header-only cart indicator, more thumb-friendly
2. **Horizontal progress stepper for order tracking** — Clearer than vertical timeline alone, shows full journey
3. **Single-line metadata rows with interpunct separators** — Denser, more scannable card metadata
4. **Time-first proximity display** — "Ready in ~30 min" is more actionable than "1.2 mi"
5. **Shape-matched skeleton loading** — Every component gets a pixel-perfect skeleton twin
6. **Bottom sheet with spring physics** — For retailer selection, cart preview, and item detail on mobile
7. **Order confirmation celebration moment** — Brief, elegant, brand-appropriate animation
8. **Forward-looking status timeline** — Show upcoming steps, not just past events
9. **Quantity stepper with trash icon at 1** — Progressive disclosure of delete action
10. **Status-specific color badges** — Move beyond generic Badge variants to semantic status colors

---

## 1. Component Catalog

### 1.1 Restaurant/Store Card (Uber Eats)

**Visual hierarchy, top to bottom:**

1. **Hero image** — Full-width, 16:9 aspect ratio. High-quality food photography fills the entire card top. On hover/tap, a subtle scale (1.02x) transition draws the eye. This is the primary attention anchor.
2. **Store name** — Bold, 16px semibold, left-aligned directly below the image.
3. **Rating + delivery info row** — A single dense line combining star icon + numeric rating, interpunct separator, delivery fee, interpunct separator, delivery time range.
4. **Promotional badge** (optional) — Overlaid on hero image, top-left corner. Pill-shaped badge with high-contrast background.
5. **Distance** — Notably NOT prominently displayed on card face. Implicit in delivery time estimate. Users care about "when will I get it" more than "how far is it."

**Cru parallel**: Our WineCard already follows a similar hierarchy. Key learning is the single-line metadata row pattern with interpunct separators.

### 1.2 Restaurant/Store Card (Grubhub)

More information-dense than Uber Eats — distance in miles is explicit, minimum order is visible, cuisine type appears. For B2B/power users comparing options, this density is valuable.

**Cru parallel**: Lean toward Uber Eats' cleaner approach for consumer browsing but adopt Grubhub's density for retailer selection context.

### 1.3 Category/Cuisine Carousel

Both apps use horizontally scrollable carousel of category pills/icons near top of discovery feed. Tapping filters the feed with smooth content transition. Active category gets highlighted state.

**Cru parallel**: Consider single-row horizontal scroll for mobile breakpoints, grid layout for desktop.

---

## 2. Interaction Patterns

### 2.1 Bottom Sheet / Modal Patterns

**Uber Eats pattern:**
- Item customization: Sheet starts at ~60% screen height, expandable to full screen via drag
- Cart preview: persistent mini-bar at bottom shows item count and total, tapping expands to full sheet
- Gestures: Drag handle at top, drag down to dismiss, velocity-based snap
- Background dimming at ~40% black opacity
- Spring-physics animation on snap (~300ms)

### 2.2 Sticky Cart Bar

- Persistent bar at bottom of screen (above tab bar)
- Shows: number of items, total price, "View Cart" CTA
- Animates in from below when first item added (slide up, 200ms ease-out)
- Uses primary brand color for high visibility

**Cru adaptation**: Bottom bar on mobile, header indicator on desktop.

### 2.3 Micro-interactions Worth Adopting

- **Add to cart**: Button scales 0.95x on press, springs back. Checkmark animates into cart icon.
- **Quantity stepper**: Minus appears only when qty > 0. At qty 1, minus shows trash icon.
- **Status transitions**: Subtle pulse on status icon, smooth progress bar fill.
- **Order confirmed**: Checkmark animation with radial expand, brief (1.5-2s).

**Cru adaptation**: Scale 0.97x on press for Add to Cart. Subtle pulse on status changes. Wine-appropriate burgundy radial expand confirmation.

### 2.4 Navigation Patterns

**Uber Eats tab bar:** Home, Browse, Orders, Account. Tab bar hides on scroll down, reappears on scroll up. Orders tab shows badge for active orders.

**Cru adaptation**: Home, Browse, [Commerce Hub], Orders, Profile. Orders tab with dot indicator for active orders.

---

## 3. Order Tracking Deep Dive

### 3.1 Uber Eats Order Tracking

**Screen structure:**
1. **Map view** (~40% of screen) — Route from restaurant to delivery, courier position as branded dot, auto-zoom
2. **ETA banner** — Large "Arriving in 12 min" overlaid on map with frosted glass
3. **Status stepper** — Horizontal bar: Order Placed → Preparing → On the Way → Delivered. Active step has pulsing dot.
4. **Order details** — Scrollable: items, courier info, contact button, "Share my ETA"

**Key decisions:** Map is hero element (emotional reassurance). ETA gets largest typography. Stepper limited to 4 steps max. Courier details create human connection.

### 3.2 Cru Order Tracking Adaptation

Wine ordering differs: longer timelines, no real-time courier tracking for pickup, status more important than ETA.

**Pickup orders:**
- Order number, retailer name, ETA/Ready indicator (large, prominent)
- Progress stepper: Placed → Confirmed → Ready for Pickup → Picked Up
- Static map thumbnail with retailer location, "Get Directions" link
- Collapsible order items summary

**Delivery orders (future):**
- Static map initially, live when courier assigned
- "Estimated delivery: 3:45 PM" (absolute time for longer windows)
- Stepper: Placed → Confirmed → Out for Delivery → Delivered

**Status color mapping:**

| Status | Color | Icon | Animation |
|--------|-------|------|-----------|
| Pending | amber-600 | Clock | Subtle pulse |
| Confirmed | cru-primary (burgundy) | CheckCircle | Solid fill |
| Ready for Pickup | emerald-600 | Package | Attention pulse |
| Out for Delivery | blue-600 | Truck | Animated dot |
| Completed | muted-foreground | CheckCircle2 | Muted, settled |
| Cancelled | destructive | XCircle | Static |

---

## 4. Design Recommendations for Cru

### 4.1 Card Design: Single-Line Metadata Row

Compress varietal, region, and availability into one scannable line:
```
Pinot Noir  ·  Willamette Valley  ·  In stock nearby
$38 - $45
```
Instead of stacking vertically.

### 4.2 Retailer Selection Enhancement

- Sort by "best value" default (price × distance)
- Show estimated pickup/delivery time: "Ready in ~30 min"
- Visual badge for top option: "Closest" or "Best Price"
- Store hours indicator to prevent ordering from closed stores
- Touch targets: increase from h-10 (40px) to h-11 (44px)

### 4.3 Cart and Checkout

- Persistent sticky bottom bar on mobile with item count + total
- Cart grouping by retailer for multi-retailer scenarios
- Order confirmation: burgundy checkmark animation (200ms), "Order placed" in Playfair Display, auto-transition to tracking after 2s

### 4.4 Proximity Display

Lead with time, not distance:
- "Ready in ~30 min · 1.2 mi" for pickup
- "Delivery by 4:00 PM · 3.8 mi" for delivery

### 4.5 Order Status Timeline

Show forward-looking steps (upcoming grayed out) — full journey visible, not just completed steps. Add `aria-live="polite"` for screen reader announcements.

---

## 5. Visual Language — What to Borrow vs Keep

**Borrow (interaction patterns):**
- Single-line metadata rows with interpunct separators
- Spring animations on bottom sheets
- Semantic status colors with progress steppers
- Shape-matched skeletons with synchronized shimmer
- Sticky bottom cart bar, quantity steppers

**Keep distinctly Cru:**
- **Typography**: Playfair Display serif headings (editorial authority — neither app uses serifs)
- **Color**: Muted earth tones, wine-burgundy primary (not bright greens/reds)
- **Photography**: Editorial wine/vineyard imagery (not product shots)
- **Pace**: Animations slightly slower (200-350ms vs 150-250ms) — wine is not a speed purchase
- **Density**: Less dense, more breathing room — wine descriptions deserve space

### Motion Design Language

| Interaction | Duration | Easing |
|------------|----------|--------|
| Card hover lift | 200ms | ease-out |
| Bottom sheet open | 300ms | spring(1, 0.85) |
| Bottom sheet dismiss | 250ms | ease-in |
| Add to cart press | 150ms press + 200ms release | ease-out |
| Status change pulse | 600ms | ease-in-out |
| Page transition | 200ms | ease-out |
| Skeleton shimmer | 1500ms | linear (infinite) |
| Toast notification | 300ms in, 200ms out | ease-out / ease-in |

---

## 6. Accessibility Standards

- Touch targets: 44x44px minimum (RetailerCard add-to-cart needs increase from h-10)
- Color contrast: Test all text-muted-foreground at 4.5:1 minimum
- Status colors: Never color alone — always include text labels
- Focus management: Bottom sheets must trap focus
- Live regions: aria-live="polite" for status changes
- Reduced motion: All animations wrapped in prefers-reduced-motion checks

---

## Relevant Cru Files to Update

- `components/features/wines/WineCard.tsx` — Card metadata consolidation
- `components/features/orders/RetailerCard.tsx` — Time-first proximity, touch targets
- `components/features/orders/OrderStatusBadge.tsx` — Semantic status colors
- `components/features/orders/OrderStatusTimeline.tsx` — Forward-looking steps
- `components/features/orders/CartIndicator.tsx` — Sticky bottom bar for mobile
- `components/features/orders/RetailerSelectionSheet.tsx` — Spring physics, focus management
