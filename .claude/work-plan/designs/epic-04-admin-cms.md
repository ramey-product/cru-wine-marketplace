# Epic 04 — Admin Content Management UX Spec

> **Route**: `/admin/producers/*`
> **Story**: EPIC-04/STORY-08
> **Reference**: UX Design Bible Section 5 (Data Tables, Forms), Section 12 (Desktop-first)
> **Status**: Active — engineering complete

---

## 1. Navigation Pattern

```
Admin (sidebar)
  ├── Collections
  ├── Producers ← active
  └── Wine Matching

Producer List → Producer Detail → [Wines | Photos]
```

- Desktop: sidebar nav (`w-52`) + main content area
- Mobile: horizontal tab bar scrollable
- Active state: `bg-primary/10 text-primary`

---

## 2. Producer Table (`/admin/producers`)

### Columns
| Column | Width | Sortable | Content |
|--------|-------|----------|---------|
| Name + Slug | flex-1 | ✓ | Name as `font-medium`, slug as `text-muted-foreground text-xs` |
| Region | 120px | ✓ | Region string |
| Country | 100px | ✓ | Country string |
| Wines | 80px | ✓ | Integer count |
| Status | 80px | ✗ | Active/Inactive badge |
| Actions | 80px | ✗ | Edit link |

### Interactions
- **Search**: Debounced text input filtering by name/region/country
- **Sort**: Click column header toggles asc/desc, `aria-sort` via `aria-label`
- **Row click**: Navigate to `/admin/producers/[id]`
- **New Producer**: Primary button top-right → `/admin/producers/new`

### Empty State
- "No producers yet. Add your first producer to get started."
- Primary CTA: "Add Producer"

---

## 3. Producer Form (`/admin/producers/new` and `/admin/producers/[id]`)

### Form Sections

**1. Identity**
- Name (required) — auto-generates slug on blur
- Slug (readonly, editable on expand)
- Region, Country — text inputs

**2. Story**
- Tagline — text input with live character counter (`X/150`)
  - `text-amber-600` warning when < 20 chars
- Story Content — textarea with Edit/Preview toggle
  - Preview renders paragraphs with `whitespace-pre-wrap`

**3. Viticulture**
- Farming Practices — checkbox group (organic, biodynamic, sustainable, natural, conventional)
- Vineyard Size — text input
- Year Established — text input (validated as integer)
- Annual Production — text input

**4. Media**
- Hero Image URL — text input (future: upload component)

**5. Settings**
- Is Active — toggle switch

### Save Behavior
- `useTransition` for pending state
- Button text: "Save" → "Saving..." (disabled during transition)
- Success: toast notification, stay on page
- Error: inline error message below form

---

## 4. Wines Sub-page (`/admin/producers/[id]/wines`)

### Table + Sheet Pattern
- Table lists all wines for the producer
- Columns: Name, Vintage, Varietal, Price, Status, Edit
- "Add Wine" button opens a Sheet (slide-in panel from right)
- Edit button also opens Sheet with pre-filled WineForm
- Sheet width: `w-[480px]` on desktop

### WineForm Sections
- Identity: name, slug, vintage
- Terroir: varietal, region, country, appellation
- Details: description, alcohol %, price (dollar input with `$` prefix), bottle size
- Tags: comma-separated tags and occasions
- Media: image URL
- Settings: is_active toggle

---

## 5. Photos Sub-page (`/admin/producers/[id]/photos`)

### Photo Grid
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`
- Each card: thumbnail (`aspect-square object-cover rounded-lg`), caption, position badge
- Hover reveals: remove button (top-right), reorder arrows (bottom)

### Add Photo
- Form at top: URL input + Caption input + "Add Photo" button
- URL validation with inline error

### Reorder
- Up/Down arrows swap positions
- Visual position badge: `absolute top-2 left-2` with `bg-background/80 rounded-full px-2 py-0.5 text-xs font-medium`

### Empty State
- "No photos yet. Add your first photo to showcase this producer."
- Add Photo form always visible

---

## 6. Design Principles for Admin

- **Speed over polish**: Minimize clicks, maximize information density
- **Desktop-first**: Most admin work happens on desktop (Bible Section 12)
- **Data-dense**: Tables show all relevant info without expanding
- **Keyboard-friendly**: Tab through form fields, Enter to save
- **Non-destructive**: No permanent deletions from admin (toggle inactive instead)
