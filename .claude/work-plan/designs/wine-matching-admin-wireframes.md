# Admin Wine Matching Review — UX Wireframe Spec

> **Route**: `/admin/wine-matching`
> **Story**: EPIC-06/STORY-13
> **Reference**: UX Design Bible Section 5, 12 (desktop-first)
> **Status**: Active — engineering complete

---

## 1. Overview

Efficiency-optimized admin interface for reviewing wine matches. Desktop-first — most matching work happens on large screens. Keyboard shortcuts accelerate batch workflows.

---

## 2. Queue Table

```
┌───────────────────────────────────────────────────────────┐
│  Wine Match Queue                     [Batch Approve ▼]  │
│                                                           │
│  Filters: [All Status ▼] [All Retailers ▼] [Date Range]  │
│  Search: [________________________]                       │
│                                                           │
│  ┌─────────┬──────────┬────────┬────────────┬──────────┐  │
│  │Raw Wine │Retailer  │Conf.   │Suggested   │Status    │  │
│  ├─────────┼──────────┼────────┼────────────┼──────────┤  │
│  │Opus One │Valley W. │  92%   │Opus One '19│ pending  │  │
│  │Cab 2019 │          │ ●●●●○  │            │          │  │
│  ├─────────┼──────────┼────────┼────────────┼──────────┤  │
│  │Ridge Zin│Downtown  │  78%   │Ridge Lytton│ pending  │  │
│  │Lytton   │          │ ●●●○○  │Springs '20 │          │  │
│  ├─────────┼──────────┼────────┼────────────┼──────────┤  │
│  │Kstler Ch│Wine Shop │  45%   │   —        │unmatched │  │
│  │Sonoma   │          │ ●●○○○  │            │          │  │
│  └─────────┴──────────┴────────┴────────────┴──────────┘  │
│                                                           │
│  Stats: 12 pending · 8 unmatched · 45 resolved           │
└───────────────────────────────────────────────────────────┘
```

### Confidence Badges
| Range | Display | Color |
|-------|---------|-------|
| 90-100% | `●●●●●` + "High" | `text-green-600 bg-green-50` |
| 70-89% | `●●●●○` + "Medium" | `text-amber-600 bg-amber-50` |
| <70% | `●●○○○` + "Low" | `text-red-600 bg-red-50` |

### Batch Approve
- Dropdown: "Approve all >85%", "Approve all >90%"
- Confirmation dialog: "Approve {n} matches? This will create inventory records."

### Filters
- Status: All, Pending, Unmatched, Resolved
- Retailer: dropdown of all retailers
- Date range: date picker pair

---

## 3. Review Card (Expanded Row)

Click a row to expand the side-by-side review card:

```
┌───────────────────────────────────────────────────────────┐
│  Review Match — 78% Confidence                           │
│                                                           │
│  ┌─── Raw CSV Data ───┐  ┌── Suggested Cru Wine ──┐      │
│  │                     │  │                        │      │
│  │  Name: Ridge Zin    │  │  Name: Ridge Lytton    │      │
│  │        Lytton Sprgs │  │        Springs         │      │
│  │  Producer: Ridge    │  │  Producer: Ridge       │      │
│  │  Vintage: 2020      │  │  Vintage: 2020         │      │
│  │  Price: $38.00      │  │  Varietal: Zinfandel   │      │
│  │  SKU: RDG-LYT-20   │  │  Region: Sonoma        │      │
│  │  Qty: 24            │  │                        │      │
│  │                     │  │                        │      │
│  └─────────────────────┘  └────────────────────────┘      │
│                                                           │
│  [ ✓ Approve ]  [ ✗ Reject ]  [ 🔍 Search ]  [ + New ]  │
│                                                           │
│  Keyboard: A = Approve  R = Reject  S = Search  N = New  │
└───────────────────────────────────────────────────────────┘
```

### Side-by-Side Layout
- Desktop: `grid grid-cols-2 gap-6`
- Mobile: stacked vertically
- Matching fields highlighted (name, producer, vintage alignment)
- Mismatched fields: `text-amber-600` to draw attention

### Actions
| Action | Button | Keyboard | Effect |
|--------|--------|----------|--------|
| Approve | Primary green | `A` | Creates inventory record, resolves match |
| Reject | Destructive outline | `R` | Marks as rejected, no inventory created |
| Search | Secondary | `S` | Opens WineSearchModal for manual match |
| New Wine | Secondary | `N` | Opens CreateWineForm pre-filled from CSV |

---

## 4. Wine Search Modal

```
┌──────────────────────────────────────┐
│  Search Cru Wines                    │
│                                      │
│  [ridge zinfandel_____________] 🔍   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Ridge Lytton Springs 2020     │  │
│  │ Zinfandel · Sonoma · $42     │  │
│  │                    [Select]   │  │
│  ├────────────────────────────────┤  │
│  │ Ridge Geyserville 2020        │  │
│  │ Zinfandel blend · Sonoma · $38│  │
│  │                    [Select]   │  │
│  ├────────────────────────────────┤  │
│  │ Ridge East Bench Zin 2019     │  │
│  │ Zinfandel · Dry Creek · $32  │  │
│  │                    [Select]   │  │
│  └────────────────────────────────┘  │
│                                      │
│  Can't find it? [Create New Wine]    │
│                                      │
│              [ Cancel ]              │
└──────────────────────────────────────┘
```

- Shadcn Dialog component
- Debounced search (300ms)
- Results show: name, varietal, region, price
- "Select" resolves the match
- "Create New Wine" fallback opens CreateWineForm

---

## 5. Create Wine Form

Pre-populated from raw CSV data:

```
┌──────────────────────────────────────┐
│  Create New Wine                     │
│  Pre-filled from CSV data.           │
│                                      │
│  Name *        [Ridge Zin Lytton   ] │
│  Producer *    [Ridge Vineyards    ] │
│  Vintage       [2020              ] │
│  Varietal      [Zinfandel         ] │
│  Region        [Sonoma            ] │
│  Price (cents) [3800              ] │
│                                      │
│  [ Cancel ]         [ Create Wine ]  │
└──────────────────────────────────────┘
```

- Fields pre-filled from CSV `raw_data`
- On create: wine record created, match resolved, inventory record created

---

## 6. Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `↑` / `↓` | Navigate queue rows | Queue table |
| `Enter` | Expand/collapse review card | Queue table |
| `A` | Approve match | Review card open |
| `R` | Reject match | Review card open |
| `S` | Open search modal | Review card open |
| `N` | Open create wine form | Review card open |
| `Escape` | Close modal/card | Any overlay |

---

## 7. Accessibility

- Queue table: proper `<table>` with `<th scope="col">` headers
- Row expansion: `aria-expanded`, `aria-controls`
- Action buttons: clear `aria-label` with context
- Keyboard shortcuts: non-conflicting with browser defaults
- Focus management: on expand, focus moves to first action button
