# Curation Surfaces — UX Design Spec

> **Story**: EPIC-07/STORY-11
> **Routes**: `/` (home), `/collections/[slug]`, `/admin/collections`
> **Reference**: UX Design Bible Sections 5, 7, 9, 10
> **Status**: Active — engineering complete

---

## 1. Home Screen Sections

### Layout Overview

```
┌─────────────────────────────────────────┐
│  Welcome back, {name}                   │
│                                         │
│  ── Picked for You ──────────────────── │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│  │Rec │ │Rec │ │Rec │ │Rec │ │Rec │ →  │
│  │Card│ │Card│ │Card│ │Card│ │Card│    │
│  └────┘ └────┘ └────┘ └────┘ └────┘    │
│                                         │
│  ── Curated Collections ─────────────── │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Collection│ │Collection│ │Collection│ │
│  │  Card    │ │  Card    │ │  Card    │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                      See all →          │
│                                         │
│  ── Popular Near You ────────────────── │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │Wine│ │Wine│ │Wine│ │Wine│           │
│  │Card│ │Card│ │Card│ │Card│           │
│  └────┘ └────┘ └────┘ └────┘           │
└─────────────────────────────────────────┘
```

### Section Spacing
- Between sections: `space-y-12` (48px)
- Section heading to cards: `mb-6` (24px)
- Page padding bottom: `pb-20` (mobile nav clearance)

### Horizontal Scroll Behavior
- Container: `flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4`
- Negative margin + padding creates edge-to-edge scroll with page-aligned content
- Each card: `snap-start flex-shrink-0`
- Scrollbar: hidden on Webkit, thin on Firefox
- Desktop (lg+): grid layout instead of scroll where appropriate

---

## 2. Recommendation Card

```
┌──────────────────────────────┐
│  [Wine Image, aspect-[3/4]]  │
│                              │
│  Producer Name               │  <- text-xs text-muted-foreground
│  Wine Name 2020              │  <- text-sm font-semibold
│  $42                         │  <- text-sm font-mono
│                              │
│  "Because you love earthy    │  <- text-xs text-muted-foreground italic
│   Rhône reds..."             │     match_reason
│                              │
│                    [✕]       │  <- dismiss button, top-right
└──────────────────────────────┘
```

### Card Dimensions
| Context | Width | Image Aspect |
|---------|-------|-------------|
| Home section | `w-44 sm:w-52` | `aspect-[3/4]` |
| Full grid | responsive columns | `aspect-[3/4]` |

### Dismiss Button
- Position: `absolute top-2 right-2`
- Style: `h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm`
- Icon: `X` at `h-3 w-3`
- Visible: always visible (no hover-only)
- Tooltip: "Not for me"

### Dismiss Animation
1. Card scales down: `scale-100 → scale-95`, `duration-150`
2. Card fades: `opacity-100 → opacity-0`, `duration-200`
3. Remaining cards slide left to fill gap: `duration-300 ease-out`
4. No confirmation dialog — immediate, lightweight

### Match Reason Placement
- Below price, 2 lines max with truncation
- Style: `text-xs text-muted-foreground italic line-clamp-2`
- Template: "Because you love {preference}, this {descriptor}..."

---

## 3. Collection Card

```
┌──────────────────────────────┐
│  [Cover Image, aspect-video] │
│                              │
│  Summer Rosés                │  <- text-base font-semibold
│  12 wines                    │  <- text-sm text-muted-foreground
└──────────────────────────────┘
```

- Width: `w-64 sm:w-72` in horizontal scroll
- Image: `aspect-video object-cover rounded-t-lg`
- Title: `line-clamp-1` for truncation
- Links to `/collections/[slug]`

---

## 4. Collection Detail Page

```
┌─────────────────────────────────────────┐
│  ← Browse                              │
│                                         │
│  [Hero Image, aspect-[21/9]]            │
│                                         │
│  Summer Rosés                           │  <- text-3xl font-bold
│  "Light, refreshing picks for           │
│   warm evenings."                       │  <- text-lg text-muted-foreground
│                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │Wine│ │Wine│ │Wine│ │Wine│           │
│  │Card│ │Card│ │Card│ │Card│           │
│  └────┘ └────┘ └────┘ └────┘           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │Wine│ │Wine│ │Wine│ │Wine│           │
│  └────┘ └────┘ └────┘ └────┘           │
└─────────────────────────────────────────┘
```

- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`
- Hero: `aspect-[21/9] max-h-[300px]`
- Back nav: breadcrumb-style `← Browse`

---

## 5. Admin Collections CRUD

### Collection List (`/admin/collections`)
- Table: Name, Wine Count, Status (active/scheduled/draft), Actions
- "New Collection" primary button
- Click row → edit page

### Collection Editor (`/admin/collections/[id]`)
- Tab layout: Details | Wines
- **Details tab**: name, slug (auto-gen), description, cover image URL, date range (start/end pickers), is_active toggle
- **Wines tab**: sortable list with drag handle, remove button, search-to-add
- Search: instant search with debounce, results in dropdown
- Reorder: up/down buttons (drag-and-drop enhancement for future)

---

## 6. Empty States

### "Picked for You" — No Profile
> Complete your taste profile to get personalized picks.
> [Set up your profile →]

### "Picked for You" — Sparse Results (<6)
> Show whatever matches exist, pad with "Popular on Cru" if needed. No empty state visible if ≥1 result.

### "Curated Collections" — None Active
> Our curators are putting together something special. Check back soon.

### "Popular Near You" — No Location
> Enable location to see what's popular near you.
> [Allow location →]

---

## 7. Accessibility

- Horizontal scroll sections: `role="region"` with `aria-label`
- Dismiss button: `aria-label="Remove {wine_name} from recommendations"`
- Cards: focusable via keyboard, Enter to navigate
- Scroll containers: arrow key navigation
- Collection admin: drag reorder has keyboard alternative (up/down buttons)
