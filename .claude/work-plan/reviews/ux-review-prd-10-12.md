# UX Design Review: PRD-10, PRD-11, PRD-12

**Reviewer:** UX/UI Design Lead
**Date:** 2026-03-14
**Status:** APPROVED with 22 refinement items

---

## Summary

All three PRDs are well-grounded in competitive research and align with Cru's design language. The patterns borrowed from Uber Eats/Grubhub are adapted appropriately for wine's "considered purchase" pace. Below are refinement items grouped by PRD.

## PRD-10: Commerce Flow & Cart UX

### Refinements

1. **Commerce Hub icon**: Recommend `ShoppingBag` over `LayoutGrid` — it communicates commerce intent while `LayoutGrid` reads as "dashboard." The filled circle treatment stays.

2. **Commerce Hub section order**: Cart Preview (top) → Active Orders (middle) → Quick Paths (bottom) is correct. Users' eyes go to "what did I just do" first.

3. **Sticky cart bar height**: 56px (h-14) matches the tab bar. Use `backdrop-blur-md` and `bg-primary/95` for the burgundy bar — slight transparency creates depth without visual heaviness.

4. **Buy button on cards**: Use `ghost` variant with `ShoppingCart` icon, 32x32px visible area within 44x44px touch target. Position: bottom-right of card, vertically aligned with price.

5. **Availability line typography**: Use `text-xs text-muted-foreground` with a subtle `MapPin` icon (12x12px) prefix. This keeps it secondary to the price while still scannable.

6. **Quantity stepper**: Use pill-shaped container with `rounded-full bg-muted` containing the minus/count/plus. At qty 1, minus transitions to `Trash2` icon with a 150ms crossfade.

7. **Order confirmation**: The burgundy radial expand should use `motion-safe:animate-...`. Duration 200ms for checkmark, 150ms delay for text. Auto-transition at 2s uses a horizontal wipe (left-to-right, 300ms) to the tracking view.

8. **Retailer badges**: Use `Badge` component with custom variants: `badge-closest` (blue-100/blue-700), `badge-best-price` (emerald-100/emerald-700), `badge-best-value` (primary/primary-foreground). Only one badge per retailer.

### Wireframes

**Commerce Hub Sheet Layout:**
```
┌─────────────────────────────┐
│  ═══  (drag handle)         │
│                             │
│  🛒 Your Cart               │
│  ┌─────────────────────────┐│
│  │ 2 items · $56.00        ││
│  │ from Wine House LA      ││
│  │         [View Cart →]   ││
│  └─────────────────────────┘│
│                             │
│  📦 Active Orders            │
│  ┌─────────────────────────┐│
│  │ #1042 · Cork & Bottle   ││
│  │ ● Ready for Pickup      ││
│  └─────────────────────────┘│
│  View All Orders →          │
│                             │
│  ─── Quick Paths ────       │
│  Browse Wines    Producers  │
│  My Wishlist    Scan Label  │
└─────────────────────────────┘
```

**Sticky Cart Bar:**
```
┌──────────────────────────────────┐
│  🛒 2 items · $56.00  [View Cart]│
└──────────────────────────────────┘
┌──────────────────────────────────┐
│ Home  Browse  [Hub]  Wish  Prof  │
└──────────────────────────────────┘
```

## PRD-11: Order Tracking & Post-Purchase

### Refinements

9. **Progress stepper**: Horizontal, not vertical. 4 steps max. Use circles connected by lines. Completed = filled burgundy circle + checkmark. Active = pulsing circle with color per status. Future = gray outline circle.

10. **Stepper line animation**: When status advances, the connecting line fills from left to right (300ms ease-out) before the next circle activates. This creates a sense of progression.

11. **Map thumbnail size**: 200px height, full-width, rounded-lg corners. Branded pin uses Cru's burgundy color. "Get Directions" button overlaid bottom-right of map.

12. **Taste feedback UI**: Card-per-wine layout with wine thumbnail (48x48), name, producer. Thumbs up/down as toggle buttons (not radio). Selected thumb scales to 1.1x with color fill. Optional text area appears below on first thumb tap with placeholder "What did you think?"

13. **Taste feedback framing**: Header text: "How was your wine?" Subtext: "Your feedback helps Cru find wines you'll love." — Not "Rate this wine."

14. **Active order card in Commerce Hub**: Compact: retailer name (bold), status badge (color-coded), single line. Tap → full tracking.

15. **Proactive delay notification**: In-app banner style: amber background, clock icon, "We're checking on your order" text. Appears at top of tracking screen, not as a modal.

### Wireframes

**Order Tracking Screen:**
```
┌─────────────────────────────────┐
│ ← Order #1042                    │
│                                  │
│ ○────●────○────○                 │
│ Placed Confirmed Ready  Picked Up│
│                                  │
│ ┌──────────────────────────────┐ │
│ │       📍 MAP THUMBNAIL        │ │
│ │                    [Directions]│ │
│ └──────────────────────────────┘ │
│                                  │
│ Ready in approximately 1 hour    │
│                                  │
│ Cork & Bottle                    │
│ 📞 (323) 555-0123               │
│ ✉️  hello@corkbottle.com         │
│                                  │
│ ─── Order Details ───            │
│ Domaine Tempier Bandol 2019  $38 │
│ Clos Cibonne Tibouren 2020   $28 │
│ ──────────────────────────────── │
│ Subtotal                   $66.00│
│ Tax                         $5.94│
│ Total                      $71.94│
└─────────────────────────────────┘
```

## PRD-12: Discovery & Proximity

### Refinements

16. **Location indicator**: Pill-shaped, top of browse page: `📍 Silver Lake · Change`. Tapping "Change" opens a bottom sheet with address search and "Use my location" button.

17. **Producer card design**: 3:2 aspect ratio hero image (vineyard/winery shot), producer name in Playfair Display, region as subtitle, wine count badge. Hover: subtle shadow lift.

18. **Discovery loop chips**: Horizontal scroll of chips below wine info on detail page. Style: `rounded-full border border-border bg-background px-3 py-1.5 text-sm`. Tapping navigates with a shared element transition (wine image stays, content cross-fades).

19. **Browse filter bottom sheet**: Group filters into collapsible sections: Type (Red/White/Rose/Sparkling), Price Range (slider), Region (multi-select chips), Varietal (multi-select chips). "Apply Filters" sticky button at bottom. "Clear All" text button top-right.

20. **Sort dropdown**: Minimal select with current sort visible. Options: Relevance, Price ↑, Price ↓, Newest, Available Nearby (only when location set).

21. **Load More button**: Full-width, outline style: "Show More Wines (47 remaining)". Subtle spinner on load. New wines append with a staggered fade-in (50ms delay per card).

22. **"Available Near You" section**: Home feed section with horizontal scroll. Section header: "Available Near You" with location pill inline. Cards show nearest retailer name + distance.

### Wireframes

**Producer Browse Page:**
```
┌─────────────────────────────────┐
│ Producers                        │
│ ┌─────────────────────────────┐ │
│ │ 🔍 Search producers...      │ │
│ └─────────────────────────────┘ │
│                                  │
│ [All] [Provence] [Oregon] [>]    │
│                                  │
│ ┌──────────┐ ┌──────────┐       │
│ │ 📷       │ │ 📷       │       │
│ │ Domaine  │ │ Clos     │       │
│ │ Tempier  │ │ Cibonne  │       │
│ │ Provence │ │ Provence │       │
│ │ 8 wines  │ │ 5 wines  │       │
│ └──────────┘ └──────────┘       │
│ ┌──────────┐ ┌──────────┐       │
│ │ 📷       │ │ 📷       │       │
│ │ Domaine  │ │ Evening  │       │
│ │ Drouhin  │ │ Land     │       │
│ │ Oregon   │ │ CA       │       │
│ │ 12 wines │ │ 6 wines  │       │
│ └──────────┘ └──────────┘       │
└─────────────────────────────────┘
```

## UX Design Bible Updates Needed

After implementation, update the design system documentation:
- Add Commerce Hub component spec
- Add Sticky Cart Bar component spec
- Add Order Tracking stepper component spec
- Add Taste Feedback card component spec
- Document status color mapping (amber/burgundy/emerald/blue/muted)
- Document motion design timings for new interactions
- Add touch target audit results
