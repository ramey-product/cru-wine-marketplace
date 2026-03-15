# Wine Card Component Specification

> **Status:** Active
> **Component Path:** `apps/web/components/features/wines/WineCard.tsx`
> **References:** UX Design Bible Sections 2, 3, 5 (Wine Card), 7, 11, 12, 13
> **Last Updated:** 2026-03-14

---

## 1. Overview

The Wine Card is the most important component in the entire product. It is the primary unit of discovery -- the atom from which the browse grid, home page carousels, wishlist, search results, and recommendation sections are composed. Every design decision in this component must optimize for two goals: **spark curiosity** and **drive action** (tap to learn more, add to wishlist, or buy).

### Design Principles Applied

1. **Stories Over Chrome** -- The producer name appears above the wine name (the farmer earns the spotlight). A story hook is always present.
2. **No Ratings or Scores** -- Ever. Non-negotiable per Product Principle 2.
3. **Local First** -- The availability indicator connects discovery to action by showing nearby stock.
4. **Warmth Over Coldness** -- Rounded corners, warm photography, inviting typography.

---

## 2. Visual Hierarchy and Content Slots

### Content Slot Order (Top to Bottom)

```
+-----------------------------------+
|                                   |
|  [Wine Image]                     |
|  aspect-[3/4] object-cover        |
|                                   |
+-----------------------------------+
|  1. PRODUCER NAME (overline)      |
|  2. Wine Name, Vintage (heading)  |
|  3. Varietal -- Region (metadata) |
|  4. $28 (price)                   |
|  5. "A family vineyard in..."     |
|     (story hook, 2 lines max)     |
|  6. [dot] In stock nearby         |
|     (availability indicator)      |
+-----------------------------------+
```

### Slot Specifications

| Slot | Content | Typography Token | Tailwind Classes | Required |
|------|---------|-----------------|------------------|----------|
| Image | Wine bottle or vineyard photo | -- | `aspect-[3/4] object-cover` | Yes (fallback if missing) |
| Producer | Producer/winery name | Overline | `text-xs font-semibold uppercase tracking-widest text-muted-foreground` | Yes |
| Wine Name | Name + vintage year | Heading S | `text-lg font-medium leading-tight` | Yes |
| Metadata | Varietal -- Region, Country | Body M | `text-sm text-muted-foreground` | Optional (hidden if null) |
| Price | Retail price or price range | Price | `text-lg font-semibold font-mono` | Yes |
| Story Hook | 1-2 line producer story excerpt | Body M | `text-sm text-muted-foreground line-clamp-2` | Conditional (toggleable) |
| Availability | Stock status indicator | Body S | `text-xs text-muted-foreground` + dot | Conditional (toggleable) |

### Visual Hierarchy Priority

The eye should flow in this order:
1. **Image** -- Visual anchor, captures attention
2. **Wine Name** -- Largest text in the content area
3. **Price** -- Monospace for scannability across the grid
4. **Producer** -- Overline treatment creates a consistent starting point
5. **Story Hook** -- Rewards deeper reading
6. **Availability** -- Quiet but actionable signal

---

## 3. Image Slot

### With Image

```html
<div class="aspect-[3/4] overflow-hidden bg-muted">
  <Image
    src={wine.image_url}
    alt={displayName}
    width={400}
    height={533}
    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    loading="lazy"
    placeholder="blur"
    blurDataURL={blurPlaceholder}
  />
</div>
```

- Aspect ratio: 3:4 (portrait), matching wine bottle proportions
- Object fit: `cover` to fill the frame regardless of source dimensions
- Loading: `lazy` for below-fold cards, `eager` for first 4 cards in viewport
- Blur placeholder: Use a 10px blurred version or a generated blur hash

### Without Image (Fallback)

When no `image_url` is available, show a gradient placeholder using the wine-type color token.

```html
<div class="aspect-[3/4] bg-gradient-to-br from-[hsl(var(--cru-wine-red))]/20
            to-[hsl(var(--cru-wine-red))]/5 flex items-center justify-center">
  <Wine class="h-12 w-12 text-[hsl(var(--cru-wine-red))]/30" aria-hidden="true" />
</div>
```

Color varies by wine type:
| Wine Type | Gradient From/To |
|-----------|-----------------|
| Red | `--cru-wine-red` / `--cru-wine-red` |
| White | `--cru-wine-white` / `--cru-wine-white` |
| Rose | `--cru-wine-rose` / `--cru-wine-rose` |
| Sparkling | `--cru-wine-sparkling` / `--cru-wine-sparkling` |
| Orange | `--cru-wine-orange` / `--cru-wine-orange` |
| Unknown | `muted` / `muted` (default warm gray) |

---

## 4. Availability Indicator

### Placement

Bottom of the content area, below the story hook. Consists of a colored dot and status text.

### States

| State | Dot Color | Text | Tailwind |
|-------|-----------|------|----------|
| In stock nearby | `bg-cru-success` (green) | "In stock nearby" | `<span class="h-2 w-2 rounded-full bg-[hsl(var(--cru-success))]" />` |
| Not available locally | `bg-muted-foreground/40` (gray) | "Check availability" | `<span class="h-2 w-2 rounded-full bg-muted-foreground/40" />` |
| Unknown / not shown | No dot | No text | Component not rendered |

### Implementation

```html
<div class="flex items-center gap-1.5 text-xs">
  <span
    class={cn(
      "h-2 w-2 rounded-full shrink-0",
      isAvailable ? "bg-[hsl(var(--cru-success))]" : "bg-muted-foreground/40"
    )}
    aria-hidden="true"
  />
  <span class="text-muted-foreground">
    {isAvailable ? "In stock nearby" : "Check availability"}
  </span>
</div>
```

### Accessibility

- The dot is decorative (`aria-hidden="true"`); status is conveyed via the text label
- Screen readers announce: "In stock nearby" or "Check availability"
- Never rely on color alone for meaning -- text always accompanies the dot

---

## 5. Story Hook

### Purpose

The story hook is Cru's differentiator. Every wine card shows 1-2 lines of the producer's story, connecting the user to the human behind the wine. This replaces the ratings/scores that every other wine platform leads with.

### Content Source

Sourced from `wine.description` or `producer.story_excerpt`. If neither exists, the story hook slot is hidden.

### Specification

```html
<p class="text-sm text-muted-foreground line-clamp-2">
  A third-generation family vineyard where old-vine Grenache meets the Mediterranean breeze...
</p>
```

- Maximum: 2 lines (`line-clamp-2`)
- Ellipsis at truncation point (CSS `line-clamp` handles this)
- Typography: Body M, muted foreground
- "Read more" link is NOT shown on the card -- tapping the card navigates to the detail page where the full story lives

### When Hidden

The `showStoryHook` prop (default: `true`) controls visibility. Story hooks are hidden in:
- Compact/dense contexts (retailer order cards)
- Miniature card variants (inline mentions)

---

## 6. Interaction States

### 6.1 Default State

```
Border:     border border-border
Background: bg-card
Shadow:     none
Transform:  none
```

### 6.2 Hover State (Desktop Only)

Triggered on pointer hover. Not applied on touch devices.

```
Border:     border border-border (unchanged)
Background: bg-card (unchanged)
Shadow:     shadow-md
Transform:  -translate-y-0.5 (lift 2px)
Image:      scale-105 (subtle zoom)
Transition: all 200ms ease
```

```html
<div class="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden
            hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
  <div class="aspect-[3/4] overflow-hidden bg-muted">
    <img class="... group-hover:scale-105 transition-transform duration-300" />
  </div>
</div>
```

### 6.3 Active / Pressed State

```
Transform:  scale-[0.98] (subtle press)
Transition: 100ms ease-out
```

```html
<div class="... active:scale-[0.98] transition-all duration-100">
```

### 6.4 Focus State (Keyboard Navigation)

Visible focus ring on the card when tabbed to.

```
Ring:       ring-2 ring-ring ring-offset-2
Outline:    none (replaced by ring)
```

```html
<Link
  class="... focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
         focus-visible:outline-none rounded-lg"
/>
```

### 6.5 Loading / Skeleton State

Skeleton matches the content shape exactly.

```html
<div class="rounded-lg border border-border overflow-hidden" aria-hidden="true">
  <Skeleton class="aspect-[3/4] w-full" />
  <div class="p-4 space-y-2">
    <Skeleton class="h-3 w-24" />        <!-- producer overline -->
    <Skeleton class="h-5 w-3/4" />       <!-- wine name -->
    <Skeleton class="h-4 w-1/2" />       <!-- varietal -- region -->
    <Skeleton class="h-5 w-16" />        <!-- price -->
    <Skeleton class="h-8 w-full" />      <!-- story hook (2 lines) -->
    <Skeleton class="h-3 w-28" />        <!-- availability -->
  </div>
</div>
```

Skeleton animation: Shimmer from left to right (as defined in UX Bible Section 5).

### 6.6 Disabled State

Not typically used, but available for wines that are temporarily unavailable:

```
Opacity:    opacity-60
Cursor:     cursor-default (no pointer)
Hover:      No hover effects
```

---

## 7. Card Dimensions by Context

The Wine Card adapts its size and visible content slots based on the context it appears in.

### 7.1 Browse Grid (Primary Context)

The default, full-featured card.

| Property | Value |
|----------|-------|
| Width | Fluid, determined by grid column |
| Image aspect | 3:4 |
| Content padding | `p-4` |
| Content spacing | `space-y-2` |
| Visible slots | All: image, producer, name, metadata, price, story hook, availability |
| Border radius | `rounded-lg` (8px) |

### 7.2 Home Page Curation Carousel

Used in "Picked for You" and "Popular Near You" horizontal carousels.

| Property | Value |
|----------|-------|
| Width | Fixed: `w-[260px]` (snap-scroll items) |
| Image aspect | 3:4 |
| Content padding | `p-4` |
| Visible slots | Image, producer, name, price, availability |
| Story hook | Hidden (carousel is for scanning, not reading) |
| Additional | Match reason line below card in recommendation contexts |

```html
<div class="w-[260px] shrink-0 snap-start">
  <WineCard wine={wine} showStoryHook={false} />
  {matchReason && (
    <p class="mt-1.5 text-xs text-muted-foreground italic px-1 line-clamp-1">
      {matchReason}
    </p>
  )}
</div>
```

### 7.3 Wishlist Grid

Same as browse grid but with an additional "Remove" action overlay.

| Property | Value |
|----------|-------|
| Width | Fluid, grid column |
| Image aspect | 3:4 |
| Visible slots | All slots |
| Additional | Remove button (heart icon, filled) in top-right corner of image |

```html
<div class="relative">
  <WineCard wine={wine} />
  <button
    class="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm
           flex items-center justify-center hover:bg-background transition-colors
           focus-visible:ring-2 focus-visible:ring-ring"
    aria-label="Remove from wishlist"
  >
    <Heart class="h-4 w-4 fill-primary text-primary" />
  </button>
</div>
```

### 7.4 Search Results

Same as browse grid with an optional match indicator.

| Property | Value |
|----------|-------|
| Width | Fluid, grid column |
| Image aspect | 3:4 |
| Visible slots | All slots |
| Additional | Match highlight on the matched field (subtle primary/10 background on the matched text) |

### 7.5 Compact Inline (Related Wines, "You Might Also Enjoy")

Smaller card for supplementary recommendation sections.

| Property | Value |
|----------|-------|
| Width | Fluid, 4-col grid on desktop |
| Image aspect | 3:4 |
| Content padding | `p-3` |
| Content spacing | `space-y-1.5` |
| Visible slots | Image, producer, name, price |
| Story hook | Hidden |
| Availability | Hidden |
| Typography scale | Wine name: `text-base font-medium`, Price: `text-base font-semibold font-mono` |

---

## 8. Responsive Behavior

### 8.1 Card Content Adaptations

| Breakpoint | Card Changes |
|------------|-------------|
| Mobile (default) | Full-width single column. Larger touch target. All content visible. |
| `sm` (640px+) | 2-column grid. Card width ~280px. No content changes. |
| `lg` (1024px+) | 3-column grid (with sidebar) or 4-column (without). No content changes. |
| `xl` (1280px+) | 4-column grid. No content changes. |

### 8.2 Touch vs. Pointer

| Interaction | Desktop (Pointer) | Mobile (Touch) |
|------------|-------------------|----------------|
| Navigate to detail | Click anywhere on card | Tap anywhere on card |
| Hover lift | `-translate-y-0.5 shadow-md` | No hover (disabled via `@media (hover: hover)`) |
| Image zoom | `group-hover:scale-105` | No zoom on tap |
| Wishlist toggle | Click heart overlay | Tap heart overlay (44x44px touch target) |
| Context actions | Right-click menu (future) | Long-press menu (future) |

### 8.3 Mobile Touch Target

The entire card surface is a single Link element, making it a large touch target by default. The wishlist heart button (when present) is overlaid with sufficient padding to prevent accidental navigation taps.

```html
<!-- Heart overlay has enough size and offset to be easily tappable -->
<button class="absolute top-3 right-3 h-10 w-10 rounded-full ...">
  <!-- 40px touch target, exceeds 44px with padding -->
</button>
```

---

## 9. Accessibility

### 9.1 Card as a Link

The card is implemented as a single `<Link>` element wrapping the entire card. This provides:
- A single tab stop per card (not multiple focusable elements within)
- Clear focus indication via `focus-visible:ring-2`
- Semantic link behavior for screen readers

### 9.2 aria-label on Card Link

The card's `aria-label` combines all key information into a single announcement:

```
"Wine: Bandol Rose 2023, by Domaine Tempier, $28, available nearby"
```

Pattern:
```tsx
aria-label={`Wine: ${displayName}, by ${producer.name}, ${price}${
  showAvailability
    ? isAvailable
      ? ', available nearby'
      : ', check availability'
    : ''
}`}
```

This is already implemented in the existing `WineCard.tsx`.

### 9.3 Image Alt Text

- When image is present: `alt={displayName}` (e.g., "Bandol Rose 2023")
- Fallback SVG icon: `aria-hidden="true"` (decorative)

### 9.4 Price Accessibility

```html
<p class="text-lg font-semibold font-mono" aria-label="Price: $28">$28</p>
```

The `aria-label` ensures screen readers announce "Price: $28" rather than just "$28" which could be ambiguous.

### 9.5 Availability Indicator

- Dot uses `aria-hidden="true"` (decorative color indicator)
- Text label "In stock nearby" or "Check availability" conveys the status
- Never color-only signaling

### 9.6 Keyboard Navigation

- Cards receive focus via Tab in source order (left-to-right, top-to-bottom grid order)
- Enter or Space activates the link
- Focus ring: `ring-2 ring-ring ring-offset-2 rounded-lg`
- When wishlist overlay is present, it receives focus separately (additional tab stop within the card wrapper, not within the Link)

### 9.7 Reduced Motion

When `prefers-reduced-motion` is active:
- Hover lift disabled (no translate)
- Image zoom disabled (no scale)
- All transitions become instant opacity swaps

```css
@media (prefers-reduced-motion: reduce) {
  .group:hover {
    transform: none !important;
    box-shadow: var(--shadow-sm) !important;
  }
  .group-hover\:scale-105 {
    transform: none !important;
  }
}
```

Or via Tailwind:
```html
<div class="... motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
  <img class="... motion-safe:group-hover:scale-105" />
</div>
```

---

## 10. Props Interface

```typescript
interface WineCardProps {
  wine: {
    id: string
    name: string
    slug: string
    varietal: string | null
    region: string | null
    country: string | null
    vintage?: number | null
    image_url: string | null
    price_min: number | null
    price_max: number | null
    producer: { name: string; slug: string }
    description: string | null
    wine_type?: 'red' | 'white' | 'rose' | 'sparkling' | 'orange' | 'dessert' | null
  }
  /** Show the availability dot + text. Default: true */
  showAvailability?: boolean
  /** Show the story hook excerpt. Default: true */
  showStoryHook?: boolean
  /** Current availability status. Default: false */
  isAvailable?: boolean
  /** Variant controls size and visible slots */
  variant?: 'default' | 'compact' | 'carousel'
  /** Match reason text for recommendation contexts */
  matchReason?: string
}
```

---

## 11. Component File Structure

```
apps/web/components/features/wines/
+-- WineCard.tsx              # Main card component (Server Component)
+-- WineCardSkeleton.tsx      # Skeleton loading state
+-- WineCardActions.tsx       # Wishlist heart overlay (Client Component, 'use client')
+-- AvailabilityIndicator.tsx # Dot + text status (Server Component)
+-- utils.ts                  # formatWinePrice, formatVarietalRegion helpers
```

### Server vs. Client Boundaries

- **WineCard** -- Server Component. Pure data display, no interactivity.
- **WineCardActions** -- Client Component. Handles wishlist toggle with optimistic UI, event handlers.
- **AvailabilityIndicator** -- Server Component. Static display based on boolean prop.
- **WineCardSkeleton** -- Server Component. Static skeleton markup.

---

## 12. Dark Mode

All tokens automatically adapt via CSS custom properties. No additional dark-mode-specific classes needed on the card itself. The key adaptations:

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Card background | `bg-card` (#FFFFFF) | `bg-card` (#1C1917) |
| Card border | `border-border` (#E7E3DF) | `border-border` (#44403C) |
| Producer text | `text-muted-foreground` (#78716C) | `text-muted-foreground` (#A8A29E) |
| Wine name | `text-foreground` (#1C1917) | `text-foreground` (#FAFAF9) |
| Image fallback bg | `bg-muted` (#F5F3F0) | `bg-muted` (#292524) |
| Hover shadow | `shadow-md` (black/7%) | `shadow-md` (black/20%) |
| Availability dot | `bg-cru-success` (#16A34A) | `bg-cru-success` (#22C55E) |

---

## 13. Design Quality Checklist

- [x] Passes 5-second test: Wine name and price are immediately scannable
- [x] Visual hierarchy: Image draws eye, name is largest text, price is monospace for grid scanning
- [x] Consistent with UX Bible Wine Card spec (Section 5)
- [x] Responsive across all breakpoints (1-col mobile through 4-col desktop)
- [x] Dark mode works via token inheritance
- [x] Empty state: Image fallback with wine-type gradient
- [x] Loading state: Shape-matching skeleton
- [x] Accessibility: aria-label, focus ring, no color-only signaling, reduced motion
- [x] No orphaned states: Every interaction (hover, focus, active) has visual feedback
- [x] No ratings or scores displayed anywhere on the card
- [x] Producer name above wine name (farmer earns the spotlight)
- [x] Story hook present by default (Cru's differentiator)
