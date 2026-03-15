# Retailer Onboarding — UX Wireframe Spec

> **Route**: `/retailer-onboarding`
> **Story**: EPIC-06/STORY-13
> **Reference**: UX Design Bible Sections 5, 9, 12
> **Status**: Active — engineering complete

---

## 1. Overview

A 5-step wizard guiding non-technical retail partners through signup. Must feel as simple as a Shopify signup — minimize cognitive load, maximize progressive disclosure.

---

## 2. Wizard Steps

```
Step 1: Store Details  →  Step 2: POS Selection  →  Step 3: Fulfillment
→  Step 4: CSV Upload  →  Step 5: Review & Submit
```

### Progress Bar
- Horizontal stepper: step number + label
- Completed: `bg-primary text-primary-foreground`
- Active: `border-primary text-primary`
- Upcoming: `bg-muted text-muted-foreground`
- Mobile: show step number + current label only (no full stepper)

---

## 3. Step Wireframes

### Step 1: Store Details

```
┌─────────────────────────────────────────┐
│  Step 1 of 5: Store Details             │
│                                         │
│  Store Name *                           │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Address *                              │
│  ┌─────────────────────────────────┐    │
│  │ 123 Main St, Los Angeles, CA   │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────┐               │
│  │  📍 Map pin preview │               │
│  │   (geocoded result) │               │
│  └─────────────────────┘               │
│                                         │
│  Phone           Email                  │
│  ┌────────────┐  ┌────────────────┐     │
│  │            │  │                │     │
│  └────────────┘  └────────────────┘     │
│                                         │
│  Website (optional)                     │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│                    [ Continue → ]       │
└─────────────────────────────────────────┘
```

- Address geocodes on blur → shows map pin preview
- Map: small embed (`h-40 rounded-lg`) confirming location
- Validation: inline errors on field blur

### Step 2: POS Selection

```
┌─────────────────────────────────────────┐
│  Step 2 of 5: Point of Sale             │
│                                         │
│  How do you manage inventory today?     │
│                                         │
│  ○ Square                               │
│    "We'll sync your inventory           │
│     automatically from Square."         │
│                                         │
│  ○ Lightspeed                           │
│    "Automatic inventory sync            │
│     from Lightspeed Retail."            │
│                                         │
│  ○ Shopify                              │
│    "Pull inventory from your            │
│     Shopify store."                      │
│                                         │
│  ○ Clover                               │
│    "Sync directly with Clover POS."     │
│                                         │
│  ● CSV / Manual                         │
│    "Upload a spreadsheet of your        │
│     wines. We'll walk you through it."  │
│                                         │
│  ○ Other                                │
│    "We'll help you find the best        │
│     way to connect."                    │
│                                         │
│            [ ← Back ] [ Continue → ]    │
└─────────────────────────────────────────┘
```

- Radio group: `space-y-3`
- Each option: `rounded-lg border p-4`, selected: `border-primary bg-primary/5`
- Help text per option explains what it means in plain language

### Step 3: Fulfillment

```
┌─────────────────────────────────────────┐
│  Step 3 of 5: Fulfillment Options       │
│                                         │
│  How can customers get their orders?    │
│                                         │
│  [✓] In-store pickup                    │
│      "Customers pick up at your store." │
│                                         │
│  [✓] Local delivery                     │
│      Delivery radius: [====●====] 10mi  │
│      "You handle delivery within this   │
│       radius."                          │
│                                         │
│  [ ] Ship nationwide                    │
│      "Coming soon — we'll notify you."  │
│                                         │
│            [ ← Back ] [ Continue → ]    │
└─────────────────────────────────────────┘
```

- Checkbox toggles for each option
- Delivery radius: slider appears when delivery enabled
- Ship nationwide: disabled with "coming soon" note

### Step 4: CSV Upload

```
┌─────────────────────────────────────────┐
│  Step 4 of 5: Your Wine List            │
│                                         │
│  Upload your current inventory.         │
│  We accept CSV or Excel files.          │
│                                         │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │                                   │  │
│  │   📄 Drop your file here         │  │
│  │      or click to browse          │  │
│  │                                   │  │
│  │   Max 10MB · CSV or XLSX         │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│                                         │
│  📥 Download our template               │
│  "Not sure about the format?            │
│   Use our template as a starting        │
│   point."                               │
│                                         │
│            [ ← Back ] [ Continue → ]    │
│                        Skip this step   │
└─────────────────────────────────────────┘
```

- Dropzone: dashed border, drag-and-drop + click
- File validation: size (<10MB), format (CSV/XLSX)
- Template download link with helpful copy
- Skip option: can onboard without CSV

### Step 5: Review & Submit

```
┌─────────────────────────────────────────┐
│  Step 5 of 5: Review                    │
│                                         │
│  ── Store Details ──────── [Edit]       │
│  Valley Wine Bar                        │
│  123 Main St, Los Angeles, CA 90012     │
│  (555) 123-4567 · info@valleywine.com   │
│                                         │
│  ── Point of Sale ─────── [Edit]        │
│  CSV / Manual                           │
│                                         │
│  ── Fulfillment ──────── [Edit]         │
│  In-store pickup, Local delivery (10mi) │
│                                         │
│  ── Wine List ────────── [Edit]         │
│  inventory.csv (247 wines)              │
│                                         │
│         [ ← Back ] [ Submit → ]         │
└─────────────────────────────────────────┘
```

- Summary cards with Edit links back to each step
- Submit triggers org + retailer creation + CSV processing
- Redirect to retailer dashboard with processing indicator

---

## 4. Responsive

| Element | Mobile | Desktop |
|---------|--------|---------|
| Stepper | Step N of 5 | Full horizontal stepper |
| Form fields | Single column | Two-column where logical |
| Map preview | Below address | Right of address |
| Buttons | Full width stacked | Right-aligned inline |

---

## 5. Accessibility

- Form fields: all have `<label>`, error messages linked via `aria-describedby`
- Radio group: `role="radiogroup"`, arrow key navigation
- Dropzone: keyboard accessible (Enter/Space to open file picker)
- Step transitions: focus moves to step heading
- Errors: announced via `aria-live="polite"`
