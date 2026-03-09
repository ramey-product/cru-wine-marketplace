# EPIC-06 QA Remaining Issues

Branch: `epic-06/qa-fixes`
Created: 2026-03-08
Status: COMPLETE (all actionable fixes applied)

## Already Fixed (Phase 2, commit e7ab6c4)

1. csv-import.ts: sync_type 'full' → 'csv_import', status 'completed_with_errors' → 'partial'
2. wine-matching.ts (DAL): org_id on getMatchQueue, resolveMatch, getMatchQueueStats; sanitize .or() input
3. inventory.ts (DAL): join alias 'retailers' → 'retailer'; org_id on updateStockStatus, getStaleInventory
4. retailers.ts (DAL): org_id on updateRetailer
5. wine-matcher.ts (service): replace direct DB writes with DAL resolveMatch calls
6. retailer-onboarding.ts: uppercase regex on state validation

## Fixed (Phase 2, DAL org_id pass)

7. H1: inventory.ts `getAvailabilityForWine` — cross-org by design, documented
8. H2: inventory.ts `getRetailerInventory` — added orgId param + .eq('org_id')
9. H3: inventory.ts `upsertInventoryItem` — orgId now separate param (breaks callers)
10. H4: retailers.ts `getRetailerBySlug` — cross-org by design, documented
11. H5: retailers.ts `getRetailers` — added orgId param + .eq('org_id')
12. H6: retailers.ts `getRetailerSyncLogs` — added orgId param + .eq('org_id')
13. H7: wine-matching.ts `bulkCreateMatchQueueItems` — orgId now top-level param (breaks callers)
14. M5: inventory.ts `getRetailerInventory` — fixed alias 'wines.name' → 'wine.name'

## Fixed (Phase 2, caller fixes + Zod + DAL additions)

15. H12: inventory.ts — added `SyncLogSourceEnum` Zod enum
16. H13: inventory.ts — added `SyncTypeEnum` + `SyncLogStatusEnum` Zod enums
17. H14: wine-matching.ts — `MatchStatusEnum` already existed (false positive)
18. H15: wine-matching.ts — `SingleMatchResult.status` JSDoc fixed ("unchanged" → "unmatched")
19. H8: csv-import.ts — replaced direct DB with DAL `createSyncLog`/`updateSyncLog`
20. H9: retailer-onboarding.ts — documented bootstrap exception with block comment
21. H10: wine-matcher.ts — replaced direct `client.from()` with DAL `getPendingMatchQueueEntries`
22. H11: wine-matcher.ts — replaced direct `client.rpc()` with DAL `matchWineCandidates`
23. CALLER-1: csv-import.ts — updated `bulkCreateMatchQueueItems` call signature
24. CALLER-2: retailer-onboarding.ts — updated `bulkCreateMatchQueueItems` call signature
25. CALLER-3: wine-matcher.ts — updated `upsertInventoryItem` call signature
26. M1: csv-import.ts — added TODO comment for RBAC migration
27. M2: csv-import.ts — documented no-permission-needed rationale for `detectColumnsAction`
28. M3: retailer-onboarding.ts — documented onboarding creates org exception
29. M4: retailer-onboarding.ts — fixed `revalidatePath` to use `org.slug` instead of literal brackets
30. M6: retailer-onboarding.ts — added `?? 0` null coalescing for csvItemsQueued
31. C1: types/database.ts — created placeholder with TODO to generate real types

## Not Fixed (deferred or false positive)

- **M7**: `CsvRowSchema.price` optional() — DB column `raw_price INTEGER` IS nullable. False positive.
- **L1**: `RetailerFiltersSchema.state` lowercase — low priority, deferred
- **L2**: `CSV_MAX_SIZE` comment says "10MB" but counts chars — low priority, deferred
- **L3**: `commission_rate` NUMERIC(5,4) not enforced by Zod — low priority, deferred
- **L4**: `wine_match_queue.reviewed_by` FK lacks ON DELETE SET NULL — needs new migration, deferred
