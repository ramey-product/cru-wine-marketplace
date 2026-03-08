### [EPIC-09/STORY-03] — Inventory Management DAL & Server Actions

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer, I want to view my inventory sync health, see error alerts, and manually override stock status so that my Cru listings are always accurate.

#### Acceptance Criteria

```gherkin
Given a retailer calls getInventoryHealth()
When their POS sync last ran successfully 4 hours ago
Then the response includes lastSyncAt, syncSource, and nextScheduledSync

Given a retailer's POS sync has failed
When they view inventory health
Then the response includes error details and available actions (retry for CSV, contact support for API)

Given a retailer manually marks a wine as out_of_stock
When the override saves
Then that wine shows as unavailable on Cru immediately for that retailer

Given a POS sync runs after a manual override
When the sync brings quantity > 0 for an overridden wine
Then the override is automatically cleared and POS data takes precedence
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/retailer-inventory.ts` | Create |
| Action | `lib/actions/retailer-inventory.ts` | Create |
| Validation | `lib/validations/retailer-inventory.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-01] — Needs `retailer_stock_overrides` table
- **Blocked by:** [EPIC-06/STORY-03] — Needs POS sync infrastructure and `retailer_inventories`
- **Blocks:** [EPIC-09/STORY-07] — Inventory health monitor UI needs these DAL functions

#### Testing Requirements

- [ ] **Unit:** Zod validation for stock override status enum
- [ ] **Integration:** Manual stock override creates row in `retailer_stock_overrides` and updates effective availability
- [ ] **Integration:** POS sync clears override when new stock data arrives
- [ ] **RLS:** Retailer can only override stock for their own wines

#### Implementation Notes

**DAL functions:**
- `getInventoryHealth(client, retailerId)` — last sync time, source, errors, next scheduled sync from `retailer_pos_connections`
- `getInventorySummary(client, retailerId)` — counts: total listed, in stock, low stock, out of stock (joining `retailer_inventories` with active `retailer_stock_overrides`)
- `searchRetailerWines(client, retailerId, query)` — search wines in retailer's inventory by name for the quick stock toggle
- `getActiveOverrides(client, retailerId)` — list of currently active manual overrides

**Server Actions:**
- `overrideStockStatus(retailerId, wineId, status)` — upsert into `retailer_stock_overrides`, revalidate wine availability
- `clearStockOverride(retailerId, wineId)` — set `cleared_at = now()` on the override
- `retrySync(retailerId)` — trigger a manual sync attempt (for CSV-based retailers, this is a re-upload prompt; for API-based, it queues a sync job)

The effective stock status for any wine = `retailer_stock_overrides` (if active) ?? `retailer_inventories.status`. This join logic should be encapsulated in a DAL helper.
