# CSV Import Flow — UX Wireframe Spec

> **Route**: `/admin/inventory/import`
> **Story**: EPIC-06/STORY-13
> **Reference**: UX Design Bible Section 5 (Forms, Tables)
> **Status**: Active — engineering complete

---

## 1. Flow States

```
Upload → Column Mapping → Preview → Importing → Summary
```

State machine managed in `CsvImportWizard` client component.

---

## 2. Step Wireframes

### Upload

```
┌──────────────────────────────────────────┐
│  Import Inventory                        │
│                                          │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │   📄 Drop your CSV here            │  │
│  │      or click to browse            │  │
│  │   Max 10MB · .csv files only       │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                          │
│  📥 Download template                    │
└──────────────────────────────────────────┘
```

### Column Mapping

```
┌──────────────────────────────────────────┐
│  Map Your Columns                        │
│  We detected 8 columns. Match them       │
│  to Cru's fields.                        │
│                                          │
│  Your Column    →   Cru Field            │
│  ─────────────────────────────────       │
│  "Wine Name"    →   [Wine Name    ▼] ✓   │
│  "Winery"       →   [Producer     ▼] ✓   │
│  "Year"         →   [Vintage      ▼] ✓   │
│  "Price USD"    →   [Price        ▼] ✓   │
│  "Qty"          →   [Quantity     ▼] ✓   │
│  "Grape"        →   [Varietal     ▼]     │
│  "SKU"          →   [SKU          ▼]     │
│  "Notes"        →   [— Skip —    ▼]     │
│                                          │
│  Required: Wine Name ✓ Price ✓ Qty ✓     │
│                                          │
│  [ ← Back ]           [ Preview → ]     │
└──────────────────────────────────────────┘
```

- Auto-detected mappings shown with ✓ checkmark (green)
- Each row: source column name → dropdown select for target field
- Required fields validated: Wine Name, Price, Quantity
- "Skip" option for unmapped columns
- Dropdowns: Shadcn Select component

### Preview

```
┌──────────────────────────────────────────┐
│  Preview Import — 247 rows              │
│  Showing first 20 rows. 3 errors found.  │
│                                          │
│  ┌─────────┬────────┬───────┬──────┐     │
│  │Wine Name│Producer│ Price │  Qty │     │
│  ├─────────┼────────┼───────┼──────┤     │
│  │Cab Sauv │Opus One│ $85  │  12  │     │
│  │Pinot    │Kistler │ $52  │  24  │     │
│  │Zinfandel│Ridge   │██-5██│   8  │     │
│  │         │        │      │      │ ← error: price invalid
│  │Merlot   │        │ $32  │██0██ │     │
│  │         │        │      │      │ ← error: qty is 0
│  └─────────┴────────┴───────┴──────┘     │
│                                          │
│  Errors highlighted in red with tooltip  │
│  messages explaining the issue.          │
│                                          │
│  [ ← Back ]        [ Start Import → ]   │
└──────────────────────────────────────────┘
```

- Table: Shadcn Table with scroll
- Error cells: `bg-red-50 dark:bg-red-950/20 border border-red-200`
- Valid auto-mapped cells: `bg-green-50 dark:bg-green-950/20` (subtle)
- Error tooltip: specific message ("Invalid price: -5.00", "Quantity must be at least 1")
- Row count in header

### Importing (Progress)

```
┌──────────────────────────────────────────┐
│  Importing...                            │
│                                          │
│  ┌══════════════════════░░░░░░░░░┐       │
│  67%                                     │
│                                          │
│  Processing row 165 of 247               │
│  Matched: 142 · Pending review: 18       │
│  Errors: 5                               │
│                                          │
│  Please don't close this page.           │
└──────────────────────────────────────────┘
```

- Animated progress bar: `bg-primary` fill with `transition-all duration-300`
- Live counters update via polling (every 3 seconds)
- "Don't close" advisory text

### Summary

```
┌──────────────────────────────────────────┐
│  ✓ Import Complete                       │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   142    │ │    18    │ │     5    │  │
│  │ Matched  │ │ Pending  │ │  Errors  │  │
│  │          │ │  Review  │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘  │
│                                          │
│  Matched wines are live on Cru.          │
│  Pending wines need admin review.        │
│                                          │
│  [ View Match Queue ] [ Import Another ] │
└──────────────────────────────────────────┘
```

- Three stat cards: matched (green accent), pending (amber), errors (red)
- Clear next-action CTAs

---

## 3. Error Handling

| Error | Message |
|-------|---------|
| Invalid price | "The price seems off — we found '{value}'. Prices should be numbers like 42.00." |
| Missing required | "This column is required but row {n} is empty." |
| File too large | "This file is over 10MB. Try splitting it into smaller files." |
| Wrong format | "We need a .csv file. This looks like a {ext} file." |
| Parse error | "We couldn't read this file. Make sure it's a standard CSV with commas separating columns." |

---

## 4. Accessibility

- Progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemax`
- Error cells: `aria-describedby` linking to error message
- Column mapping dropdowns: keyboard navigable
- Status announcements: `aria-live="polite"` for progress updates
