# Engineering Review: EPIC-14 DAL & Auth Wiring

**Reviewer:** Lead Full Stack Engineer
**Date:** 2026-03-15
**Status:** Changes Requested

---

## Overall Assessment

The epic is well-structured and correctly identifies the core problem: 48 files in the codebase reference `MOCK_` or `PLACEHOLDER_` constants that must be replaced before production. The phasing is logical, the dependency graph is sound, and the auth/unauth fallback strategy is well thought out. However, the epic has significant coverage gaps (it misses ~15 files with mock data), several DAL functions it claims need creating already exist, and some point estimates are off. Below are the specific findings.

---

## 1. Feasibility and Point Estimates

**Total: 87 points across 26 stories -- reasonable for the scope, but individual stories need adjustment.**

### Under-estimated

| Story | Current | Suggested | Rationale |
|-------|---------|-----------|-----------|
| STORY-08 (home auth gate) | 5 | 3 | The auth check is a simple `getUser()` call plus conditional rendering. The complex work is in STORY-09/10, not here. However, see note below -- if we merge 08 with 09/10, this becomes moot. |
| STORY-12 (RetailerSelectionSheet) | 5 | 8 | This story is deceptively complex. The `Retailer` interface expects `isOpen`, `closingSoon`, `nextOpenAt`, `prepTimeMinutes`, and `deliveryWindowEnd` -- none of which have a data source yet. The epic correctly flags this as a risk but still estimates 5 points as if the data exists. Either scope these fields out for V1 or account for the schema work. |
| STORY-24 (delete placeholders) | 1 | 2 | After checking the codebase, there are two placeholder files to delete (`placeholder-wines.ts` AND `placeholder-collections.ts`), plus `PLACEHOLDER_PRODUCERS` and `PLACEHOLDER_PRODUCER_WINES` inline in `producers/[slug]/page.tsx` and `PLACEHOLDER_WINES` inline in `wines/[slug]/page.tsx`. The grep-and-verify pass across 48 files is non-trivial. |

### Over-estimated

| Story | Current | Suggested | Rationale |
|-------|---------|-----------|-----------|
| STORY-09 (PickedForYou) | 5 | 3 | `getRecommendations()` in `lib/actions/curation.ts` is fully built -- scoring engine, caching, the whole pipeline. The component work is just calling it and mapping the result. The `PickedForYou` component is 45 lines. |
| STORY-11 (CuratedCollectionsRow) | 2 | 1 | `getActiveCollections()` already exists in `lib/dal/collections.ts`. The component is 35 lines with a simple map. This is a 30-minute swap. |
| STORY-17 (notifications settings) | 2 | 1 | If this just reads/writes a preferences row (which `upsertPreferences` already handles), it is trivial. |

### Correctly estimated

Stories 01-06 (wine data wiring) at 19 points total is fair. Stories 25-26 (testing) at 10 points total is appropriate given the breadth of data access patterns to verify.

---

## 2. Implementation Approach Concerns

### STORY-06: Dynamic filters already have DAL functions

The epic says these DAL functions are "needed":
- `getDistinctRegions(client)`
- `getDistinctVarietals(client)`

Both **already exist** in `lib/dal/wines.ts` (lines 287 and 300). The story should be re-scoped to just wire the existing functions into the `FilterPanel` component. This drops the effort from 3 to 2.

### STORY-05: `getNewWines` already exists

The epic lists `getNewWines(client, limit)` as a "new DAL function needed." It already exists at line 236 of `lib/dal/wines.ts`. Re-scope to wiring only.

### STORY-10: PopularNearYou needs a clearer data strategy

The epic says "needs a new DAL function based on order volume or view counts" but does not specify which. There is no `view_counts` or `wine_views` table. Order volume aggregation against `order_items` grouped by `wine_id` is feasible but needs an index on `order_items(wine_id)` and a time window (last 30 days?). The location filter ("optionally filtered by nearby retailer inventory") compounds the query complexity.

**Recommendation:** Define the exact query in the story. Proposed approach:
```sql
SELECT oi.wine_id, COUNT(*) as order_count
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at > NOW() - INTERVAL '30 days'
GROUP BY oi.wine_id
ORDER BY order_count DESC
LIMIT $1
```
For the location variant, join through `retailer_inventory` and `retailers` with a PostGIS distance filter. This should be an RPC function, not a PostgREST query.

### STORY-20: `getMatchQueueStats` already exists

The epic says this is a "new DAL function needed," but `getMatchQueueStats` already exists in `lib/dal/wine-matching.ts` (line 310). The story should be wiring-only.

### STORY-12: Store hours -- defer, don't block

The open question about store hours data should be resolved as "omit for V1." The `Retailer` interface fields `isOpen`, `closingSoon`, `nextOpenAt` should be made optional (they already have `?` modifiers based on the mock data registry), and the component should render gracefully when they are `undefined`. Adding a `store_hours` table is a separate epic.

Similarly, `prepTimeMinutes` and `deliveryWindowEnd` should default to hardcoded values (30 min prep, no delivery window) until fulfillment configuration is built.

---

## 3. Existing Code Inventory -- Corrections

The epic's "Key DAL functions" section is mostly accurate but has these errors:

| Epic Claims | Reality |
|-------------|---------|
| `getDistinctRegions` -- "new, needed" | Already exists in `lib/dal/wines.ts:287` |
| `getDistinctVarietals` -- "new, needed" | Already exists in `lib/dal/wines.ts:300` |
| `getNewWines` -- "new, needed" | Already exists in `lib/dal/wines.ts:236` |
| `getMatchQueueStats` -- "new, needed" | Already exists in `lib/dal/wine-matching.ts:310` |
| `getProfile` -- "exists in lib/dal/users.ts" | Correct |
| `getPreferences` / `upsertPreferences` -- "exists" | Correct |
| `getTasteProfile` / `getTasteProfileWines` -- "exists" | Correct |
| `getProducerById` -- "exists" | Correct, at `lib/dal/producers.ts:60` |
| `searchWines` -- "exists in lib/dal/search.ts" | Correct, at `lib/dal/search.ts:10` |
| `getRecommendations` -- "exists in lib/actions/curation.ts" | Correct, fully implemented with caching |

**New DAL functions actually needed:**
1. `getTrendingWines(client, limit, locationPoint?)` -- does not exist anywhere
2. `getRetailersForWine(client, wineId, userLocation)` -- does not exist; `findWinesAvailableNearby` returns wines, not retailers per wine
3. `getWineAvailability(client, wineId, userLocation)` -- for the wine detail page availability display

---

## 4. Missing Component Coverage

The epic covers 26 stories but misses these files that contain mock data:

### Completely missing from the epic (no story covers them)

| File | Mock Constants | Needed DAL |
|------|---------------|------------|
| `app/(app)/orders/page.tsx` | `MOCK_ORDERS` | `getOrders(client, userId)` -- exists in `lib/dal/orders.ts` |
| `app/(app)/orders/[orderId]/page.tsx` | `MOCK_ORDER_DETAIL` | `getOrderById(client, orderId)` -- exists in `lib/dal/orders.ts` |
| `app/(app)/orders/[orderId]/confirmation/page.tsx` | `MOCK_ORDER` | Same DAL |
| `app/(app)/orders/[orderId]/feedback/page.tsx` | `MOCK_ORDER`, `MOCK_FEEDBACK_SUBMITTED` | Order DAL + `getOrderTasteFeedback` in `lib/dal/order-taste-feedback.ts` |
| `app/(app)/cart/page.tsx` | `MOCK_CART` with `PLACEHOLDER_WINES` | Cart context / Medusa cart API |
| `app/(app)/checkout/page.tsx` | `MOCK_CHECKOUT` with `PLACEHOLDER_WINES` | Cart context / Medusa cart API |
| `app/(app)/wishlist/page.tsx` | `MOCK_WISHLIST` with `PLACEHOLDER_WINES` | `getWishlistItems` in `lib/dal/wishlists.ts` |
| `app/(app)/users/[username]/page.tsx` | `MOCK_USERS` | `getUserByUsername` in `lib/dal/users.ts` |
| `app/(app)/users/[username]/followers/page.tsx` | `MOCK_FOLLOWERS` | `getFollowers` in `lib/dal/follows.ts` |
| `app/(app)/users/[username]/following/page.tsx` | `MOCK_FOLLOWING` | `getFollowing` in `lib/dal/follows.ts` |
| `app/(app)/retailer/page.tsx` | `MOCK_ORDERS` | Retailer order DAL in `lib/dal/retailer-orders.ts` |
| `app/(app)/retailer/orders/[orderId]/page.tsx` | `MOCK_ORDER_DETAIL` | Same |
| `app/(app)/retailer/analytics/page.tsx` | `MOCK_WEEK_SUMMARIES`, `MOCK_TOP_BY_ORDERS`, `MOCK_TOP_BY_VIEWS` | `lib/dal/retailer-analytics.ts` |
| `app/(app)/retailer/inventory/page.tsx` | `MOCK_SYNC`, `MOCK_INVENTORY` | `lib/dal/retailer-inventory-mgmt.ts` |
| `app/(app)/collections/page.tsx` | `PLACEHOLDER_COLLECTIONS` | `getActiveCollections` in `lib/dal/collections.ts` |
| `app/(app)/collections/[slug]/page.tsx` | `PLACEHOLDER_COLLECTIONS` | `getCollectionBySlug` in `lib/dal/collections.ts` |
| `app/(app)/collections/_lib/placeholder-collections.ts` | Entire file (definition) | Delete alongside `placeholder-wines.ts` |
| `app/(app)/admin/collections/page.tsx` | `MOCK_COLLECTIONS` | `getActiveCollections` / `getCollections` |
| `app/(app)/admin/collections/[collectionId]/page.tsx` | `MOCK_COLLECTION`, `MOCK_ITEMS` | `getCollectionWithItems` in `lib/dal/collections.ts` |
| `lib/order-tracking/OrderTrackingContext.tsx` | `MOCK_ORDERS` | Real order tracking data |
| `components/features/retailer/QuickStockSearch.tsx` | `MOCK_WINES` | Search DAL |
| `components/features/wine-matching/WineSearchModal.tsx` | `MOCK_WINE_DATABASE` | `searchWinesForMatch` in `lib/dal/wines.ts` |
| `components/features/wine-matching/MatchQueueTable.tsx` | `MOCK_QUEUE_ENTRIES` | `getMatchQueue` in `lib/dal/wine-matching.ts` |
| `components/features/csv-import/CsvImportWizard.tsx` | `MOCK_PREVIEW_ROWS` | Real CSV parsing (different pattern) |
| `app/(app)/wines/[slug]/page.tsx` | Inline `PLACEHOLDER_WINES` (not the shared file) | `getWineBySlug` in `lib/dal/wines.ts` |

That is **25 additional files** the epic does not cover. This is a critical gap -- the success criteria state "zero MOCK_ constants remain" but the story list only addresses roughly half the files.

### Files the epic does cover correctly

The 13 files explicitly covered by the 26 stories (wine browse, search, detail, region, varietal, new, PickedForYou, PopularNearYou, CuratedCollectionsRow, RetailerSelectionSheet, settings x4, admin producers x4, admin wine-matching, admin CollectionItemList, WineSearchInput, WineAvailability) are accurately scoped.

---

## 5. Testing Strategy Assessment

### STORY-25 (RLS pgTAP tests) -- 5 points

Adequate for the consumer data paths (wines, producers, collections, taste profiles). However, the scope should explicitly list the tables under test. Recommended minimum:
- `wines` -- public read, org-scoped write
- `producers` -- public read, org-scoped write
- `curated_collections` / `curated_collection_items` -- public read, admin write
- `taste_profiles` -- user-scoped read/write
- `user_wine_dismissals` -- user-scoped
- `retailer_inventory` -- public read, org-scoped write
- `wishlists` / `wishlist_items` -- user-scoped
- `orders` / `order_items` -- user-scoped read, system write

### STORY-26 (E2E tests) -- 5 points

The two E2E scenarios described (anonymous browse, authenticated personalized) are the right ones. But 5 points is tight for two full Playwright flows that include page navigation, data assertion, and auth state management. Consider 8 points, or explicitly scope it to happy-path only with no edge cases.

### Missing test coverage

No story covers unit tests for the new DAL functions (`getTrendingWines`, `getRetailersForWine`). Add a story or expand STORY-25 to include Vitest DAL tests for these.

---

## 6. Performance Concerns

### N+1 risk on wine browse with availability

STORY-01 and STORY-23 need to address how `WineAvailability` is computed for a page of wines. If each wine triggers a separate PostGIS query, a page of 24 wines means 24 spatial queries. The existing `findWinesAvailableNearby` RPC returns availability for multiple wines in one call -- the implementation must use this batch approach, not per-wine queries.

**Recommendation:** Add a note to STORY-01 that availability must be fetched in a single batch call (the RPC already supports this) and passed as a `Record<string, WineAvailability>` map, matching the current `availabilityMap` prop pattern.

### Missing index for trending wines query

The `getTrendingWines` function will aggregate `order_items` by `wine_id` with a date filter on `orders.created_at`. Ensure there is a composite index on `orders(created_at)` and `order_items(wine_id)`. If not, add an index migration to STORY-10.

### CuratedCollectionsRow query depth

`getActiveCollections` likely returns collections without their items/wines. `CuratedCollectionsRow` currently just shows collection cards (title, image, count), so a shallow query is fine. But verify the component does not need wine thumbnails -- if it does, the query needs a nested join and the story complexity increases.

### All-wines fetch in recommendation engine

`getRecommendationCandidates` (line 102 of `lib/dal/curation.ts`) fetches ALL active wines to score them in-memory. With the launch catalog (~320 wines), this is fine. At 3,000+ wines, this becomes a problem. Not a blocker for this epic, but add a tech-debt ticket.

---

## 7. Suggested Changes

### A. Add a new phase for missing files

Add **Phase 4.5: Orders, Cart, Wishlist, and Social Wiring** (or expand existing phases) to cover the 25 missing files identified in Section 4. Suggested grouping:

| New Story | Files | Points |
|-----------|-------|--------|
| STORY-27: Wire orders list and detail pages | `orders/page.tsx`, `orders/[orderId]/page.tsx`, `orders/[orderId]/confirmation/page.tsx`, `orders/[orderId]/feedback/page.tsx` | 5 |
| STORY-28: Wire cart and checkout pages | `cart/page.tsx`, `checkout/page.tsx` | 5 |
| STORY-29: Wire wishlist page | `wishlist/page.tsx` | 2 |
| STORY-30: Wire user profile and social pages | `users/[username]/page.tsx`, `users/[username]/followers/page.tsx`, `users/[username]/following/page.tsx` | 3 |
| STORY-31: Wire retailer dashboard pages | `retailer/page.tsx`, `retailer/orders/[orderId]/page.tsx`, `retailer/analytics/page.tsx`, `retailer/inventory/page.tsx` | 8 |
| STORY-32: Wire remaining admin pages | `admin/collections/page.tsx`, `admin/collections/[collectionId]/page.tsx` | 3 |
| STORY-33: Wire remaining components | `WineSearchModal.tsx`, `MatchQueueTable.tsx`, `QuickStockSearch.tsx`, `OrderTrackingContext.tsx` | 5 |
| STORY-34: Wire wine detail inline placeholders | `wines/[slug]/page.tsx` (inline `PLACEHOLDER_WINES`), `producers/[slug]/page.tsx` (inline `PLACEHOLDER_PRODUCERS`) | 3 |
| STORY-35: Delete placeholder-collections.ts | `collections/_lib/placeholder-collections.ts` | 1 |

That adds **35 points** and 9 stories, bringing the epic to ~122 points across 35 stories. This is a large epic, but the alternative is shipping with mock data in production.

### B. Merge stories that are too small

- Merge STORY-11 (CuratedCollectionsRow, 2 pts) into STORY-08 (home auth gate, 5 pts) since they are on the same page
- Merge STORY-13 (cart retailer name fix, 2 pts) into STORY-12 (RetailerSelectionSheet, 5 pts) since the fix depends on the sheet callback change
- Merge STORY-24 (delete placeholders) with STORY-35 (delete placeholder-collections)

### C. Re-scope STORY-12 for V1

Explicitly scope out store hours display (`isOpen`, `closingSoon`, `nextOpenAt`) and delivery config (`prepTimeMinutes`, `deliveryWindowEnd`) from V1. Make these fields render as "Hours unavailable" / use defaults when the data is not present. This converts a 5-point story into a manageable 5 points instead of an 8-point story with schema dependencies.

### D. Resolve cart hydration question before starting Phase 4

The open question about whether `CartProvider` should hydrate from Medusa on auth is a prerequisite for STORY-28 (cart/checkout wiring). This decision should be made at epic kickoff, not left as an open question during implementation. My recommendation: keep localStorage for V1, add Medusa sync as a follow-up epic. This is simpler and avoids the complexity of reconciling server/client cart state.

### E. Add explicit DAL inventory to each story

Each story should list:
- DAL functions that exist (with file:line reference)
- DAL functions that need creating (with proposed signature)
- Components that will be modified (with file path)

This prevents implementers from wasting time writing functions that already exist (which this epic does in 4 cases).

### F. Correct the "files to delete" section

The epic only lists `placeholder-wines.ts` for deletion. It must also include:
- `apps/web/app/(app)/collections/_lib/placeholder-collections.ts`

### G. Add the CsvImportWizard to scope or explicitly defer

`CsvImportWizard.tsx` has `MOCK_PREVIEW_ROWS` but this is a different pattern -- it represents parsed CSV data, not database-backed data. Either add a story for real CSV parsing integration or explicitly note it as deferred (acceptable for V1 since it is an admin tool with a clear TODO).

---

## 8. Dependency and Ordering Notes

- The dependency on EPIC-13 (Motion Library Adoption) is noted but should be a soft dependency. File-level conflicts are resolvable via git; there is no architectural coupling. Do not block EPIC-14 on EPIC-13.
- Phase 1 (wine data) and Phase 5 (settings) are fully independent and can run in parallel with two developers.
- Phase 6 (admin) is independent of Phase 3 (home/curation) and can also run in parallel.
- STORY-25 (RLS tests) should not be blocked on STORY-24 (delete placeholders). RLS tests verify query correctness, which is independent of whether placeholder files still exist. Run them as soon as each phase completes.

---

## Summary

The epic correctly identifies the problem and proposes a reasonable phasing strategy. However, it covers only about half the mock data in the codebase (26 files out of 48) and incorrectly claims 4 DAL functions need creating when they already exist. With the additions outlined above, this becomes a ~120-point epic that genuinely achieves the "zero mock data in production" goal. Without them, STORY-24's verification step will fail because uncovered files will still import mock constants.

**Verdict: Approve the structure and phasing; request revisions to add coverage for missing files and correct the DAL inventory before implementation begins.**
