### [EPIC-09/STORY-07] — Inventory Health Monitor UI

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer, I want to see the health of my inventory sync and quickly update stock status for individual wines so that my Cru listings are always accurate.

#### Acceptance Criteria

```gherkin
Given a retailer's POS sync ran successfully 4 hours ago
When they view the inventory tab
Then the sync card shows "Last synced: 4 hours ago via Lightspeed — Next sync: in 20 minutes"

Given a retailer's sync has failed
When they view the inventory tab
Then a red error banner shows with error details and action buttons (Retry / Contact Support)

Given a retailer searches for "Bandol Rosé" in the quick stock update
When matches appear
Then they can toggle stock status (in stock ↔ low stock ↔ out of stock) inline

Given a retailer toggles a wine to out_of_stock
When the update saves
Then a success toast appears and the wine is immediately unavailable on Cru for that retailer
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/retailer/inventory/page.tsx` | Create |
| Component | `components/features/retailer/SyncStatusCard.tsx` | Create |
| Component | `components/features/retailer/SyncErrorBanner.tsx` | Create |
| Component | `components/features/retailer/InventorySummary.tsx` | Create |
| Component | `components/features/retailer/QuickStockSearch.tsx` | Create |
| Component | `components/features/retailer/StockStatusToggle.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-03] — Needs inventory DAL and Server Actions
- **Blocked by:** [EPIC-09/STORY-11] — UX design for inventory health states

#### Testing Requirements

- [ ] **Unit:** SyncStatusCard renders correct relative time and source label
- [ ] **Unit:** SyncErrorBanner renders appropriate action buttons based on sync source type
- [ ] **Integration:** Stock toggle → Server Action → toast confirmation → availability update
- [ ] **Accessibility:** Error banner has `role="alert"`, stock toggles have descriptive labels

#### Implementation Notes

**Sync status card:** Server Component reading from `retailer_pos_connections`. Shows:
- Sync source icon (CSV, Lightspeed, Square, etc.)
- Last sync timestamp (relative: "4 hours ago")
- Next scheduled sync (if API-based)
- Connection health indicator (green checkmark / yellow warning / red error)

**Error banner:** Shows only when last sync failed. Content varies by sync source:
- CSV: "Your last CSV upload failed. [Re-upload CSV]"
- API (Lightspeed/Square): "Connection issue with [source]. [Reconnect] or [Contact Support]"
- 48+ hours since last sync: escalated messaging with prominent styling

**Inventory summary:** Stats cards showing total listed / in stock / low stock / out of stock. These are aggregate counts from `getInventorySummary()`.

**Quick stock search:** `'use client'` component with debounced search input. Results appear as a list with inline `StockStatusToggle` (three-state: in_stock → low_stock → out_of_stock → in_stock). Toggle calls Server Action with optimistic UI.
