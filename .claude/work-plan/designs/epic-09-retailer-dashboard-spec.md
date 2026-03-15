# Retailer Dashboard — UX Design Spec

> **Story**: EPIC-09/STORY-11
> **Routes**: `/retailer/*`
> **Reference**: UX Design Bible Sections 5, 9, 12 (desktop-first)
> **Status**: Active — engineering complete

---

## 1. Layout

### Desktop (lg+)
- Sidebar nav: `w-52 flex-shrink-0` with 4 items: Orders, Inventory, Analytics, Settings
- Main content: `flex-1 min-w-0`
- Order queue is the default/home view (most time-critical)
- Dashboard is **desktop-first** per UX Bible Section 12

### Mobile (<lg)
- Horizontal tab bar: scrollable, `overflow-x-auto`
- Same 4 nav items as sidebar
- Full-width content below

### Nav Items
| Item | Icon | Route |
|------|------|-------|
| Orders | `ShoppingBag` | `/retailer` |
| Inventory | `Package` | `/retailer/inventory` |
| Analytics | `TrendingUp` | `/retailer/analytics` |
| Settings | `Settings` | `/retailer/settings` |

---

## 2. Order Queue (`/retailer`)

```
┌─────────────────────────────────────────────────────────┐
│  Orders                               [Filter ▼]       │
│                                                         │
│  [All] [Pending] [Confirmed] [Ready] [Completed]       │
│                                                         │
│  ┌─────────┬──────────┬────────┬──────────┬──────────┐  │
│  │ Order   │ Customer │ Items  │ Total    │ SLA      │  │
│  ├─────────┼──────────┼────────┼──────────┼──────────┤  │
│  │ #1234   │ Jane D.  │ 3 wines│ $142.00  │ ⚠️ 1h15m │  │
│  │ #1233   │ Mike R.  │ 1 wine │ $48.00   │ 🔴 2h30m │  │
│  │ #1232   │ Sarah K. │ 2 wines│ $89.00   │   45m    │  │
│  └─────────┴──────────┴────────┴──────────┴──────────┘  │
│                                                         │
│  Click any order to view details and take action.       │
└─────────────────────────────────────────────────────────┘
```

### SLA Badge Logic
| Elapsed Time | Badge | Color |
|-------------|-------|-------|
| < 60 min | None (just time) | `text-muted-foreground` |
| 60–120 min | ⚠️ Warning | `text-amber-600 bg-amber-50` |
| > 120 min | 🔴 Urgent | `text-red-600 bg-red-50` |

### Tab Filters
- Tabs: All, Pending, Confirmed, Ready, Completed
- Active tab: `bg-primary/10 text-primary`
- Counts shown per tab: "Pending (3)"

### Row Click
- Navigate to `/retailer/orders/[orderId]`
- Entire row is clickable link

---

## 3. Order Detail (`/retailer/orders/[orderId]`)

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Orders                                       │
│                                                         │
│  Order #1234            [SLA Badge]    [Status Badge]   │
│  Placed 2h 15m ago by Jane D.                           │
│                                                         │
│  ── Items ──                                            │
│  Opus One 2019              1 × $85.00                  │
│  Ridge Zinfandel 2020       2 × $28.50                  │
│                            ──────────                   │
│                            Total: $142.00               │
│                                                         │
│  ── Fulfillment ──                                      │
│  Method: Pickup                                         │
│  Customer phone: (555) 123-4567                         │
│                                                         │
│  ── Actions ──                                          │
│  [ Confirm Order ]  (pending → confirmed)               │
│  [ Mark Ready ]     (confirmed → ready)                 │
│  [ Complete ]       (ready → completed)                 │
│  [ Cancel Order ]   (any → cancelled, destructive)      │
└─────────────────────────────────────────────────────────┘
```

### Status Actions (Contextual)
| Current Status | Available Actions |
|---------------|-------------------|
| Pending | Confirm, Cancel |
| Confirmed | Mark Ready, Cancel |
| Ready for Pickup | Complete, Cancel |
| Out for Delivery | Complete, Cancel |
| Completed | *(none)* |
| Cancelled | *(none)* |

### Role-Based Masking
- **Owner**: sees all financial data
- **Staff**: financial columns show "—" instead of dollar amounts

---

## 4. Inventory Page (`/retailer/inventory`)

```
┌─────────────────────────────────────────────────────────┐
│  Inventory                                              │
│                                                         │
│  ┌─── Sync Status ──────────────────────────────────┐   │
│  │ ● Connected to Square    Last sync: 2h ago       │   │
│  │   Next sync in 4 hours                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │ 247  │ │  12  │ │  5   │ │ 94%  │                   │
│  │Total │ │ Low  │ │ Out  │ │ Match│                   │
│  │Wines │ │Stock │ │Stock │ │ Rate │                   │
│  └──────┘ └──────┘ └──────┘ └──────┘                   │
│                                                         │
│  ── Quick Stock Search ──                               │
│  [Search wines...________________]                      │
│                                                         │
│  Opus One 2019        12 in stock   [In Stock ▼]       │
│  Ridge Zinfandel 2020  3 in stock   [Low Stock ▼]      │
│  Kistler Chard 2021    0 in stock   [Out of Stock ▼]   │
└─────────────────────────────────────────────────────────┘
```

### Sync Status Card
- Connected: green dot + "Connected to {POS}"
- Error: red dot + error banner with remediation
- Last sync time, next sync countdown

### Sync Error Banner
- `role="alert"` for screen readers
- Red border-left accent
- Non-technical error message + specific next steps
- Dismissible

### Stock Status Toggle
Three-state segmented control per wine:
- In Stock (green)
- Low Stock (amber)
- Out of Stock (red/muted)

### Quick Stock Search
- Debounced (300ms) text input
- Results filter inline below search
- Each result: wine name + quantity + status toggle

---

## 5. Analytics Page (`/retailer/analytics`)

```
┌─────────────────────────────────────────────────────────┐
│  Analytics                                              │
│                                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │$4,280│ │  32  │ │$134  │ │ 4.2  │                   │
│  │Rev.  │ │Orders│ │Avg.  │ │Items/│                   │
│  │(30d) │ │(30d) │ │Order │ │Order │                   │
│  │↑ 12% │ │↑ 8%  │ │↓ 3%  │ │= 0%  │                   │
│  └──────┘ └──────┘ └──────┘ └──────┘                   │
│                                                         │
│  ── Top Sellers ──          ── Most Viewed ──           │
│  1. Opus One 2019  (8)     1. Ridge Zin 2020  (45)    │
│  2. Ridge Zin 2020 (6)     2. Opus One 2019   (38)    │
│  3. Kistler 2021   (5)     3. Kistler 2021    (29)    │
│                                                         │
│  ── Weekly Summary ──                                   │
│  [Table: Week | Orders | Revenue | Avg | Fulfillment]   │
└─────────────────────────────────────────────────────────┘
```

### KPI Cards
- 4 cards: Revenue, Orders, Avg Order, Items/Order
- Each: value (large, `text-2xl font-bold font-mono`) + label + trend indicator
- Trend: ↑ green, ↓ red, = muted, with percentage
- Role masking: staff see "—" for revenue/avg order

### Top Lists
- Side-by-side: Top Sellers (by quantity) | Most Viewed (by page views)
- Each: ranked 1-5, name + count
- Links to wine detail (future)

---

## 6. Settings Page (`/retailer/settings`)

Four sections:
1. **Store Information**: name, address, phone, email, website — edit form
2. **Fulfillment Settings**: pickup/delivery toggles, hours, delivery radius
3. **POS Connection**: read-only status card (connected/disconnected, last sync)
4. **Notification Preferences**: email toggle checkboxes

### Save Pattern
- Per-section save buttons (not one global save)
- `useTransition` pending state
- Success toast: "Settings saved."

---

## 7. First-Time Onboarding Guide

3-step tooltip walkthrough on first dashboard visit:

1. **"Here's your order queue"** — Points to order table. "Orders from Cru customers show up here. You'll get an email notification too."
2. **"Monitor your inventory"** — Points to Inventory tab. "Keep your wine list up to date so customers see accurate availability."
3. **"Check your performance"** — Points to Analytics tab. "See how your wines are performing on Cru."

- Tooltip: Shadcn Popover positioned near target element
- "Next" / "Done" buttons
- Dismissible: "Skip tour" link
- Only shows once (tracked in user preferences)

---

## 8. Responsive

| Element | Mobile | Desktop |
|---------|--------|---------|
| Nav | Horizontal tabs | Sidebar |
| Order queue | Card list (stacked) | Table |
| KPI cards | 2×2 grid | 4-column row |
| Top lists | Stacked | Side-by-side |
| Settings | Single column | Two-column where logical |

---

## 9. Accessibility

- Order table: proper `<table>` semantic HTML
- SLA badges: color + text (not color-only)
- Action buttons: clear labels describing the state transition
- Analytics trends: text labels alongside icons (↑ 12% not just arrow)
- Settings forms: all fields labeled, errors linked via `aria-describedby`
- Sync error banner: `role="alert"`
