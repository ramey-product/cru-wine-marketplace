# Architecture Review: EPIC-14 DAL & Auth Wiring

**Reviewer:** System Architect
**Date:** 2026-03-15
**Status:** Review Complete -- Approved with Required Changes

---

## Verdict

The epic is well-structured and its phasing is sound. The DAL inventory is mostly accurate, and the dependency graph is correct. However, the scope is materially incomplete -- there are approximately 15 additional mock data sites not covered by the 26 stories. The epic also has one architectural misstatement (price normalization) and needs a schema decision on store hours before Phase 4 can begin.

---

## 1. Architecture Alignment

**Assessment: GOOD -- minor corrections needed**

The epic correctly follows the established patterns:

- **DAL-first:** All data fetching routed through `lib/dal/` functions. No direct Supabase calls proposed in components.
- **Server-first auth:** The auth pattern in the Implementation Notes section (lines 197-214) correctly uses `createClient()` from `lib/supabase/server.ts` and `getUser()` (not `getSession()`).
- **RLS reliance:** Story 25 covers pgTAP tests for RLS verification. The epic correctly notes that RLS is the enforcement mechanism, not application-level checks.
- **Unauthenticated fallback table:** Well-designed. Matches the system architecture's expectation that public data is accessible without auth and personalized features are gated.

**Corrections required:**

1. **Price normalization is stated backwards.** The epic says (line 233): "DAL returns dollars... `handleAddToCart` converts to cents: `price * 100`." But `MOCK_AVAILABILITY` in `placeholder-wines.ts` stores `lowestPrice` in cents (e.g., `3679` for a $36.79 wine). The actual database columns `price_min` and `price_max` on the wines table store dollars. The `retailer_inventory.price` column also stores dollars. The epic should clarify: DAL returns dollars from the wines/inventory tables, the `WineAvailability` type used by `WineCard` expects cents for `lowestPrice`, so the conversion to cents must happen at the DAL-to-component boundary for availability data, not in `handleAddToCart`. This is a subtle but critical bug vector if implementers follow the epic's current guidance literally.

2. **Missing `org_id` context for consumer queries.** The wines, producers, and collections tables have `org_id` but the epic does not discuss which org context to use for consumer-facing pages. These are platform-level resources (not scoped to a single retailer org), so the RLS policies likely use a broader access pattern (e.g., `is_active = true` rows are readable by any authenticated user, or by the anon key). The epic should clarify whether consumer queries bypass org-scoping via RLS policy design or whether there is a platform org_id. This affects how the Supabase client is used on unauthenticated pages.

---

## 2. Dependency Ordering

**Assessment: CORRECT -- one optimization suggested**

The phase ordering is logically sound:

- Phase 1 (wine data) before Phase 3 (home page) is correct because the home page components consume wine data types.
- Phase 3 (home auth gate) as a prerequisite for Stories 09-11 is correct.
- Phase 8 (cleanup + verification) correctly depends on all prior phases.
- Story 25 (RLS tests) before Story 26 (E2E tests) is correct -- verify data layer before testing UI flows.

**Optimization:** Stories 14-17 (settings pages) have zero dependency on Phases 1-4. They could run in parallel with Phases 1-3 if you have bandwidth. The dependency graph already shows this but the phase numbering (Phase 5) implies sequential execution. Make it explicit that Phase 5 can start as soon as Phase 1 is done (settings pages do not use wine data).

---

## 3. Scope Concerns

**Assessment: UNDER-SCOPED -- significant gaps**

### Missing mock data sites (BLOCKER)

The grep reveals approximately 15 files with `MOCK_` constants that the epic does not cover:

| File | Mock Constant | Epic Coverage |
|------|--------------|---------------|
| `app/(app)/wishlist/page.tsx` | `MOCK_WISHLIST` (uses `PLACEHOLDER_WINES`) | NOT COVERED |
| `app/(app)/orders/page.tsx` | `MOCK_ORDERS` | NOT COVERED |
| `app/(app)/orders/[orderId]/page.tsx` | `MOCK_ORDER_DETAIL` | NOT COVERED |
| `app/(app)/orders/[orderId]/feedback/page.tsx` | `MOCK_ORDER`, `MOCK_FEEDBACK_SUBMITTED` | NOT COVERED |
| `app/(app)/checkout/page.tsx` | `MOCK_CHECKOUT` | NOT COVERED |
| `app/(app)/retailer/page.tsx` | `MOCK_ORDERS` | NOT COVERED |
| `app/(app)/retailer/orders/[orderId]/page.tsx` | `MOCK_ORDER_DETAIL` | NOT COVERED |
| `app/(app)/retailer/analytics/page.tsx` | `MOCK_WEEK_SUMMARIES`, `MOCK_TOP_BY_*` | NOT COVERED |
| `app/(app)/retailer/inventory/page.tsx` | `MOCK_SYNC`, `MOCK_INVENTORY` | NOT COVERED |
| `app/(app)/users/[username]/page.tsx` | `MOCK_USERS` | NOT COVERED |
| `app/(app)/users/[username]/followers/page.tsx` | `MOCK_FOLLOWERS` | NOT COVERED |
| `app/(app)/users/[username]/following/page.tsx` | `MOCK_FOLLOWING` | NOT COVERED |
| `app/(app)/admin/collections/page.tsx` | `MOCK_COLLECTIONS` | NOT COVERED |
| `app/(app)/admin/collections/[collectionId]/page.tsx` | `MOCK_COLLECTION`, `MOCK_ITEMS` | NOT COVERED |
| `components/features/admin/ProducerTable.tsx` | `MOCK_PRODUCERS` | Partially covered by Story 18 |
| `components/features/admin/PhotoManager.tsx` | `MOCK_PHOTOS` | Partially covered by Story 19 |
| `components/features/wine-matching/MatchQueueTable.tsx` | `MOCK_QUEUE_ENTRIES` | NOT COVERED (Story 20 covers stats but not the queue table) |
| `components/features/wine-matching/WineSearchModal.tsx` | `MOCK_WINE_DATABASE` | NOT COVERED |
| `components/features/csv-import/CsvImportWizard.tsx` | `MOCK_PREVIEW_ROWS` | NOT COVERED |
| `components/features/retailer/QuickStockSearch.tsx` | `MOCK_WINES` | NOT COVERED |
| `components/features/collections/CollectionGridClient.tsx` | `'Local Wine Shop'` hardcoded | NOT COVERED |
| `lib/order-tracking/OrderTrackingContext.tsx` | `MOCK_ORDERS` | NOT COVERED |
| `app/(app)/collections/page.tsx` | Uses `PLACEHOLDER_COLLECTIONS` | NOT COVERED |
| `app/(app)/collections/[slug]/page.tsx` | Uses `PLACEHOLDER_COLLECTIONS` | NOT COVERED |

**Recommendation:** Either expand the epic to cover these (adding roughly 8-10 more stories and 25-35 points), or explicitly scope them out with a stated rationale (e.g., "retailer dashboard pages are deferred to EPIC-15 because retailer onboarding is not yet complete"). The success criteria say "zero MOCK_ constants remain in any component or page" -- so either the criteria or the stories need to change.

### Stories that should be split

- **Story 12 (RetailerSelectionSheet)** at 5 points bundles three concerns: (a) the new `getRetailersForWine` DAL function, (b) the component prop wiring, and (c) the store hours decision. The store hours decision alone could block this story indefinitely. Split the store hours portion out as a separate spike/decision story.

### Stories that could be merged

- **Stories 14-17 (settings pages)** are 4 stories at 2-3 points each. They follow an identical pattern (replace `MOCK_*` with DAL call). Could merge into 2 stories: "Wire user settings pages (profile + preferences)" and "Wire user settings pages (taste profile + notifications)" -- saving review overhead.

---

## 4. Missing Items

### 4a. `placeholder-collections.ts` not mentioned for deletion

The epic lists `placeholder-wines.ts` for deletion (line 240) but does not mention `placeholder-collections.ts`, which also needs to be deleted. It imports from `placeholder-wines.ts` and is used by `collections/page.tsx` and `collections/[slug]/page.tsx`.

### 4b. Collection pages not wired

Story 11 wires `CuratedCollectionsRow` on the home page, but the standalone `/collections` page and `/collections/[slug]` detail page still use `PLACEHOLDER_COLLECTIONS`. These need their own story.

### 4c. `getRetailersForWine` function shape

The epic correctly identifies this as a new DAL function needed (line 127). The existing `findWinesAvailableNearby` RPC goes the other direction (finds wines at retailers). The new function should query `retailer_inventory` joined with `retailers` where `wine_id = ?` and `quantity > 0`, with PostGIS distance sort. This is straightforward but should be spec'd in the story to avoid ambiguity about whether it uses an RPC or a direct query.

### 4d. Notification preferences for consumer users

Story 17 says "notification preferences (may need new DAL function if not yet in `preferences.ts`)." The `preferences.ts` DAL has `notification_email_frequency` in `upsertPreferences`, but the settings/notifications page (line 8 of that file) has a TODO for fetching real notification preferences. The `retailer_notification_preferences` table exists but is retailer-specific. The consumer notification preferences (push notification opt-in, email digests) may need schema work. The existing `user_preferences.notification_email_frequency` field partially covers this, but push notification preferences live in the `push_subscriptions` table. Story 17 needs to clarify which table(s) it reads from.

### 4e. `getRecommendations` reference is wrong

The epic says (line 117): "Connect PickedForYou to `getRecommendations()` from `lib/actions/curation.ts`." But the actual function in `lib/dal/curation.ts` is `getRecommendationCandidates()`. There is no `getRecommendations()` function. The curation DAL returns raw candidate data that needs to go through a scoring engine. Story 09 needs to account for this -- the scoring/ranking logic is not a simple DAL call.

### 4f. Wine matching stats scope mismatch

Story 20 says it needs a new `getMatchQueueStats(client)` function. This function already exists in `lib/dal/wine-matching.ts` as `getMatchQueueStats(client, orgId, retailerId)`. The epic's signature omits the `orgId` and `retailerId` parameters. The admin page likely needs stats aggregated across all retailers for the org, which is a different query than the existing per-retailer one. Clarify whether a new aggregate function is needed or the existing one suffices with iteration.

---

## 5. Open Questions -- Recommendations

### Q1: Store hours data source

**Recommendation: Omit for V1.** Adding a `store_hours` table with day-of-week open/close times, holiday overrides, and timezone handling is a meaningful schema and UI effort (easily 5-8 points). For V1, remove `isOpen`, `closingSoon`, and `nextOpenAt` from the `RetailerSelectionSheet` component props and display only static info (name, address, distance, fulfillment capabilities). Add store hours as a fast-follow in a future epic.

**Rationale:** Store hours data is operationally hard to keep accurate. Retailers change hours seasonally, have holiday closures, etc. Launching with inaccurate hours is worse than launching without hours. The core value of the sheet is showing which retailers carry the wine and how far away they are.

### Q2: Cart hydration strategy

**Recommendation: Keep localStorage-only for V1.** The Medusa cart API integration adds significant complexity (session management, cart merging on login, stale cart cleanup). The `lib/actions/cart.ts` server actions exist but the `CartContext` uses localStorage. Wiring Medusa cart hydration is a separate feature (cart persistence across devices) that can ship after launch.

**Rationale:** Users who clear localStorage lose their cart, but this is acceptable for V1. The alternative requires solving cart merge conflicts (user has localStorage cart + server cart from another device) which is a non-trivial UX and engineering problem.

### Q3: Availability performance

**Recommendation: Start with direct queries, add materialized view if needed.** The existing `find_wines_available_nearby` RPC already uses PostGIS GIST indexes and pagination. For the browse page, you do not need availability for every wine on the page -- only the visible ones. Two options:

1. **Lazy load:** Show wine cards without availability initially, then fetch availability per-card (or per-page batch) via a client-side call. This eliminates the N+1 concern entirely.
2. **Batch RPC:** Create a `get_wine_availability_batch(wine_ids UUID[], lat FLOAT, lng FLOAT, radius FLOAT)` RPC that returns availability for a set of wine IDs in one query.

The materialized view approach is overkill for 320 wines x 12 retailers. That is only ~3,840 rows in `retailer_inventory`. PostGIS spatial queries on this scale are sub-millisecond. Benchmark before optimizing.

### Q4: Retailer prep time and delivery windows

**Recommendation: Add columns to the `retailers` table.** Adding `prep_time_minutes INTEGER DEFAULT 30` and `delivery_window_hours INTEGER DEFAULT 2` to the retailers table is simpler than a separate `fulfillment_config` table. These are retailer-level settings, not order-level. A separate table only makes sense if fulfillment config varies by product category or time of day, which is unlikely for V1.

This requires a migration (low risk, additive columns with defaults). Include it in Story 12 or as a prerequisite spike.

---

## 6. Risk Assessment

### HIGH RISK

1. **Scope creep from uncovered mock sites.** The 15+ uncovered files mean either the epic balloons from 87 to ~120 points, or you launch with "zero mocks" as a broken success criterion. Decide and re-scope now, not mid-sprint.

2. **PickedForYou is not just a DAL call.** The recommendation engine in `curation.ts` returns raw candidates. There must be a scoring/ranking function between the DAL call and the component. If this scoring logic does not exist yet, Story 09 is significantly under-estimated at 5 points. Verify whether `lib/actions/curation.ts` has a `getRecommendations` server action that wraps scoring, or if that needs to be built.

3. **Unauthenticated access and RLS.** Wine browse, search, and producer pages must work for anonymous users. If the wines/producers RLS policies require `auth.uid()` membership checks, anonymous users will get zero results. The RLS policies for these tables likely need a public SELECT policy (e.g., `USING (is_active = true)` with no membership check). Verify this is the case before any Phase 1 story starts.

### MEDIUM RISK

4. **Price unit confusion.** The epic's stated normalization rule contradicts the existing mock data. If implementers follow the epic text, they will display prices incorrectly. Fix the epic text before implementation begins.

5. **`placeholder-collections.ts` file creates a hidden dependency.** It imports from `placeholder-wines.ts`. If Story 24 deletes `placeholder-wines.ts` before the collections pages are wired, the build breaks. The dependency graph does not capture this -- collection page wiring must be completed before or as part of Story 24.

### LOW RISK

6. **EPIC-13 (Motion Library) file conflict.** The epic declares a dependency on EPIC-13 completion. This is reasonable but if EPIC-13 is delayed, EPIC-14 can proceed on most stories since the DAL wiring is in page/server files, not in the animated client components.

---

## 7. Summary of Required Changes

### Blockers (must fix before implementation starts)

- [ ] **Expand scope or adjust success criteria** to account for the ~15 uncovered mock data files
- [ ] **Fix price normalization guidance** -- clarify the actual dollar/cent boundary for each data path
- [ ] **Verify RLS public access** for wines, producers, and collections tables -- anonymous users must be able to read active records
- [ ] **Correct `getRecommendations` reference** to `getRecommendationCandidates` and account for the scoring layer in Story 09

### Should fix before implementation

- [ ] Add `placeholder-collections.ts` to the deletion list in Story 24
- [ ] Add stories for collections page wiring (`/collections` and `/collections/[slug]`)
- [ ] Split store hours concern out of Story 12
- [ ] Clarify `getMatchQueueStats` signature mismatch (existing function vs epic's proposed signature)
- [ ] Decide on retailer fulfillment columns migration (recommendation: add to retailers table)

### Nice to have

- [ ] Mark Phases 1 and 5 as parallelizable in the dependency notes
- [ ] Merge Stories 14-17 into 2 stories to reduce overhead
- [ ] Add a "batch availability" RPC story if performance concerns materialize
