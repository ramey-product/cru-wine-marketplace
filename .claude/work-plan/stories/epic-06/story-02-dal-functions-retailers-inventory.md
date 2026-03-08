### [EPIC-06/STORY-02] — DAL Functions for Retailers and Inventory

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want typed DAL functions for retailers and inventory so that all features query through a consistent, testable data access layer.

#### Acceptance Criteria

```gherkin
Given a user's coordinates and radius
When I call getRetailersNearby(client, lat, lng, radiusMiles)
Then it returns retailers within the radius sorted by distance, with PostGIS calculation

Given a wine_id and user location
When I call getAvailabilityForWine(client, wineId, lat, lng, radiusMiles)
Then it returns an array of { retailer, price, quantity, stockStatus, distanceMiles }

Given a retailer_id
When I call getRetailerInventory(client, retailerId, { page, limit, search })
Then it returns paginated inventory with wine details joined

Given a retailer_id and wine_id
When I call upsertInventoryItem(client, retailerId, wineId, data)
Then it inserts or updates the inventory record via UPSERT on (retailer_id, wine_id)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/retailers.ts` | Create |
| DAL | `lib/dal/inventory.ts` | Create |
| DAL | `lib/dal/wine-matching.ts` | Create |
| Validation | `lib/validations/retailers.ts` | Create |
| Validation | `lib/validations/inventory.ts` | Create |
| Types | `types/database.ts` | Regenerate |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-01 — schema must exist
- **Blocks:** EPIC-06/STORY-03, STORY-04, STORY-05, STORY-09 — all backend stories consume DAL

#### Testing Requirements

- [ ] **Unit:** getRetailersNearby returns correct distance sorting
- [ ] **Unit:** getAvailabilityForWine joins retailer + inventory correctly
- [ ] **Unit:** upsertInventoryItem handles insert and update cases
- [ ] **Unit:** Pagination works correctly for getRetailerInventory
- [ ] **Integration:** PostGIS distance calculations match expected values for known coordinates

#### Implementation Notes

**Key DAL Functions:**

`lib/dal/retailers.ts`:
- `getRetailerBySlug(client, slug)` — single retailer lookup
- `getRetailerByOrgId(client, orgId)` — get retailer profile for an org
- `getRetailersNearby(client, lat, lng, radiusMiles, options?)` — PostGIS proximity query
- `createRetailer(client, data)` — insert new retailer
- `updateRetailer(client, retailerId, data)` — update retailer details
- `getRetailerSyncLogs(client, retailerId, { page, limit })` — paginated sync history

`lib/dal/inventory.ts`:
- `getAvailabilityForWine(client, wineId, lat, lng, radiusMiles)` — core availability query
- `getRetailerInventory(client, retailerId, options)` — paginated inventory list
- `upsertInventoryItem(client, retailerId, wineId, data)` — UPSERT single item
- `bulkUpsertInventory(client, retailerId, items[])` — batch UPSERT for CSV/POS sync
- `updateStockStatus(client, inventoryId, status)` — manual stock adjustment
- `getStaleInventory(client, hoursThreshold)` — find inventory not synced recently

`lib/dal/wine-matching.ts`:
- `getMatchQueue(client, { status, page, limit })` — paginated match queue
- `resolveMatch(client, queueId, { matchedWineId, status })` — admin resolves a match
- `createWineFromMatch(client, queueId)` — creates a new wine record from CSV data

**PostGIS query pattern:**
```sql
SELECT r.*,
  ST_Distance(r.location, ST_MakePoint($lng, $lat)::geography) / 1609.34 AS distance_miles
FROM retailers r
WHERE ST_DWithin(r.location, ST_MakePoint($lng, $lat)::geography, $radiusMiles * 1609.34)
  AND r.is_active = true
ORDER BY distance_miles ASC;
```
