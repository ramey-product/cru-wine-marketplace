# Epic 04 — Wine Detail Page UX Spec

> **Route**: `/wines/[slug]`
> **Story**: EPIC-04/STORY-08
> **Reference**: UX Design Bible Sections 5, 9, 10
> **Status**: Active — engineering scaffold complete

---

## 1. Page Structure

```
WineDetailPage (Server Component)
  ├── Breadcrumbs: Home > Browse > {Wine Name}
  ├── WineHero (image + name + vintage + producer link)
  ├── WineDetailLayout (two-column)
  │   ├── Main Column
  │   │   ├── TastingDescription (flavor profile, tasting notes)
  │   │   ├── FoodPairings (pairing suggestions)
  │   │   └── ProducerHook ("Read full story →")
  │   └── Sidebar
  │       ├── PriceDisplay + AddToCart
  │       ├── AvailabilitySection (retailer list or out-of-stock)
  │       ├── WineQuickFacts (varietal, region, alcohol, etc.)
  │       └── ActionBar (Wishlist + Share)
  └── RelatedWines (horizontal scroll)
```

---

## 2. Wine Hero

### Desktop (lg+)
- Two-column layout: `lg:grid lg:grid-cols-[400px_1fr] lg:gap-10`
- Left: wine bottle image, `aspect-[3/4]`, `max-h-[500px]`, centered
- Right: wine name (`font-display text-3xl font-bold`), vintage, producer link, varietal

### Mobile (<md)
- Stacked: image on top (`aspect-[3/4] max-h-[300px] mx-auto`), text below
- Name: `text-2xl`

### No-Image Fallback
- Muted card with Wine icon, bottle silhouette shape
- `bg-gradient-to-b from-muted to-muted/60 rounded-lg`

---

## 3. Tasting Description

- Section heading: "Tasting Notes" — `text-xl font-semibold`
- Body: `text-base leading-relaxed text-foreground/80`
- Supports rich text paragraphs
- If no description: soft empty state "Tasting notes coming soon."

---

## 4. Food Pairings

- Section heading: "Pairs With" — `text-xl font-semibold`
- Tag layout: `flex flex-wrap gap-2`
- Each pairing: `px-3 py-1.5 rounded-full bg-muted text-sm font-medium`
- If no pairings: section hidden

---

## 5. Producer Hook

```
┌──────────────────────────────────────┐
│  [Avatar/Logo]  Domaine Tempier      │
│  "The benchmark for Bandol —         │
│   wild, sun-drenched..."             │
│                                      │
│  Read the full story →               │  <- text-primary link
└──────────────────────────────────────┘
```

- Card: `rounded-lg bg-muted/30 border border-border p-5`
- Producer name: `text-base font-semibold` as Link to producer page
- Tagline: `text-sm text-muted-foreground italic`
- CTA: `text-sm text-primary hover:underline`

---

## 6. Availability Section

### In Stock
```
┌──────────────────────────────────────┐
│  ● Available from 3 retailers        │
│                                      │
│  Wine Shop LA        $42.00  [Add]   │
│  Valley Wines        $44.50  [Add]   │
│  Downtown Cellars    $45.00  [Add]   │
└──────────────────────────────────────┘
```

### Out of Stock
```
┌──────────────────────────────────────┐
│  ○ Not available nearby              │
│                                      │
│  "This wine isn't in stock at any    │
│   Cru retailers right now."          │
│                                      │
│  [ 🔔 Notify me when available ]    │
└──────────────────────────────────────┘
```

- Green dot (`bg-green-500`) for available, gray dot for unavailable
- Retailer rows: name + price + Add to Cart button
- Notify button: outline style, `text-sm`

---

## 7. Action Bar (Wishlist + Share)

- Horizontal bar: `flex gap-2`
- Wishlist: heart icon toggle, `aria-label="Add to wishlist"` / `"Remove from wishlist"`
- Share: share icon button, opens ShareMenu popover
- Both: `h-10 w-10 rounded-full border` icon buttons
- Wishlist active state: filled heart, `text-red-500`

---

## 8. Sidebar (Desktop)

- Width: `w-[320px]` fixed on desktop (right column)
- Sticky: `sticky top-24`
- Stacked sections: Price → Availability → Quick Facts → Actions
- Mobile: sections flow into single column below hero

---

## 9. Related Wines

- Section heading: "You Might Also Love" — `text-2xl font-semibold`
- Horizontal scroll: `flex gap-4 overflow-x-auto snap-x`
- Standard WineCard components
- 4 visible on desktop, peek pattern on mobile

---

## 10. Responsive Summary

| Element | Mobile | Desktop |
|---------|--------|---------|
| Hero | Stacked (image top) | Side-by-side grid |
| Detail content | Single column | Two-column (main + sidebar) |
| Sidebar | Below main content | Sticky right column |
| Related wines | Horizontal scroll | Horizontal scroll / grid |

---

## 11. Metadata

```tsx
title: `${wine.name} ${wine.vintage} | Cru`
description: wine.description ?? `Discover ${wine.name} from ${producer.name} on Cru.`
openGraph.type: 'product'
openGraph.images: wine.image_url (800×1067, 3:4 ratio)
```
