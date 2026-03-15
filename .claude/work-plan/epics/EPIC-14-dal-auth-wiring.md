# Epic: [EPIC-14] — DAL & Auth Wiring

**DRAFT — Pending Review**

**Source PRD:** N/A (Infrastructure epic — replaces all placeholder/mock data with real DAL queries)
**Priority:** P0 — Launch Critical
**RICE Score:** N/A (prerequisite for production launch)
**Epic Owner:** pm-orchestrator
**Primary Agents:** fullstack-engineer, system-architect, qa-engineer

## Epic Summary

This epic eliminates all hardcoded placeholder and mock data from the application, wiring every component to real Supabase queries through the Data Access Layer. It also ensures authentication flows work end-to-end: session handling, taste-profile-gated UI, unauthenticated fallbacks, and correct RLS enforcement across all data access paths. Completing this epic is the final gate before the app can serve real users with real data.

## Success Criteria

- [ ] Zero imports of `PLACEHOLDER_WINES`, `MOCK_AVAILABILITY`, `PLACEHOLDER_REGIONS`, `PLACEHOLDER_VARIETALS` remain in production code
- [ ] Zero `MOCK_` constants remain in any component or page (excluding test files)
- [ ] All wine browse, search, filter, and detail pages query the `wines` table via `lib/dal/wines.ts`
- [ ] All producer pages query the `producers` table via `lib/dal/producers.ts`
- [ ] Home page sections (PickedForYou, PopularNearYou, CuratedCollectionsRow) use real DAL queries
- [ ] Unauthenticated users see a graceful fallback (trending wines, no personalized sections)
- [ ] Authenticated users without a taste profile see the TasteProfileCTA instead of PickedForYou
- [ ] Settings pages (profile, preferences, taste profile, notifications) load and save real user data
- [ ] RetailerSelectionSheet receives real nearby-retailer data based on user location
- [ ] Cart add-to-cart flow uses the actual retailer name from selection (not hardcoded "Local Wine Shop")
- [ ] Admin pages (producers list, producer detail, producer wines, photos, wine-matching stats) use real DAL queries
- [ ] `placeholder-wines.ts` file is deleted from the codebase
- [ ] All DAL queries pass through RLS — verified with pgTAP tests (positive + negative cases)
- [ ] E2E test: anonymous user browses wines, sees availability, cannot access personalized features
- [ ] E2E test: authenticated user with taste profile sees personalized home page

## Architecture Dependencies

- **Database tables:** `wines`, `producers`, `producer_photos`, `curated_collections`, `curated_collection_items`, `taste_profiles`, `taste_profile_wines`, `user_preferences`, `profiles`, `retailer_inventory`, `organizations`, `memberships`, `orders`, `order_items`, `wishlists`, `wishlist_items`, `user_wine_dismissals`, `wine_match_queue` (all already exist)
- **Medusa modules:** Cart API integration (existing `lib/actions/cart.ts` server actions)
- **External integrations:** None new — Supabase Auth (existing), PostGIS for location queries (existing)
- **Shared components:** `WineGridClient`, `WineCard`, `FilterPanel`, `RetailerSelectionSheet` (all existing, need prop updates)

## Cross-Cutting Concerns

- **Auth session propagation:** Every server component that fetches data needs a Supabase server client created via `createClient()` from `lib/supabase/server.ts`. The client carries the user's session for RLS enforcement.
- **Unauthenticated access:** Wine browsing, search, and producer pages should work without auth. Personalized features (PickedForYou, taste profile settings) require auth. Components must handle both states.
- **Price normalization:** `WineAvailability.lowestPrice` is in cents; `Retailer.price` is in dollars. All consumer-facing display must use a consistent format. Normalize at the DAL/action boundary.
- **Location dependency:** PopularNearYou and retailer availability require user geolocation. When location is unavailable, fall back to non-location-scoped queries (e.g., globally trending wines).
- **Filter options:** Regions and varietals for the FilterPanel must come from `SELECT DISTINCT` queries against the wines table, not hardcoded arrays.

## Technical Risks & Open Questions

- [ ] **Store hours data source:** `RetailerSelectionSheet` expects `isOpen`, `closingSoon`, `nextOpenAt` — there is no `store_hours` table yet. Decision needed: add a store_hours table, add columns to the retailers table, or omit store-hours display for V1.
- [ ] **Cart hydration strategy:** Should `CartProvider` hydrate from Medusa on auth, or keep localStorage-only for V1? The server actions exist (`lib/actions/cart.ts`) but CartContext currently uses localStorage exclusively.
- [ ] **Availability performance:** Computing `WineAvailability` for every wine on the browse page may be expensive (PostGIS + inventory join). May need a materialized view or caching layer. Benchmark with 320 wines x 12 retailers.
- [ ] **Wine matching stats:** The admin wine-matching page uses `MOCK_STATS` but the underlying `wine_match_queue` table schema needs verification — confirm aggregation queries are possible.
- [ ] **Retailer prep time and delivery windows:** `RetailerSelectionSheet` expects `prepTimeMinutes` and `deliveryWindowEnd` — these likely need new columns on the retailers or a fulfillment_config table.

---

## Story Index

| Story | Title | Type | Points | Status |
|-------|-------|------|--------|--------|
| EPIC-14/STORY-01 | Wire wine browse page to real DAL queries | fullstack | 5 | Draft |
| EPIC-14/STORY-02 | Wire wine search page to real DAL queries | fullstack | 3 | Draft |
| EPIC-14/STORY-03 | Wire wine detail page to real DAL queries | fullstack | 3 | Draft |
| EPIC-14/STORY-04 | Wire varietal and region filter pages to real DAL queries | fullstack | 3 | Draft |
| EPIC-14/STORY-05 | Wire new arrivals page to real DAL queries | fullstack | 2 | Draft |
| EPIC-14/STORY-06 | Dynamic filter options from database (regions, varietals) | fullstack | 3 | Draft |
| EPIC-14/STORY-07 | Wire producer detail page to real DAL queries | fullstack | 3 | Draft |
| EPIC-14/STORY-08 | Wire home page auth gate and taste profile check | fullstack | 5 | Draft |
| EPIC-14/STORY-09 | Wire PickedForYou to real recommendation engine | fullstack | 5 | Draft |
| EPIC-14/STORY-10 | Wire PopularNearYou to real trending + location query | fullstack | 5 | Draft |
| EPIC-14/STORY-11 | Wire CuratedCollectionsRow to real getActiveCollections DAL | fullstack | 2 | Draft |
| EPIC-14/STORY-12 | Wire RetailerSelectionSheet to real nearby-retailer data | fullstack | 5 | Draft |
| EPIC-14/STORY-13 | Fix cart add-to-cart to use real retailer name | frontend | 2 | Draft |
| EPIC-14/STORY-14 | Wire settings/profile page to real DAL | fullstack | 3 | Draft |
| EPIC-14/STORY-15 | Wire settings/preferences page to real DAL | fullstack | 3 | Draft |
| EPIC-14/STORY-16 | Wire settings/taste-profile page to real DAL | fullstack | 3 | Draft |
| EPIC-14/STORY-17 | Wire settings/notifications page to real DAL | fullstack | 2 | Draft |
| EPIC-14/STORY-18 | Wire admin producers list to real DAL | fullstack | 3 | Draft |
| EPIC-14/STORY-19 | Wire admin producer detail, wines, and photos pages to real DAL | fullstack | 5 | Draft |
| EPIC-14/STORY-20 | Wire admin wine-matching stats page to real DAL | fullstack | 3 | Draft |
| EPIC-14/STORY-21 | Wire admin CollectionItemList wine search to real DAL | fullstack | 3 | Draft |
| EPIC-14/STORY-22 | Wire taste-profile WineSearchInput to real search DAL | fullstack | 2 | Draft |
| EPIC-14/STORY-23 | Wire WineAvailability component on wine detail page | fullstack | 3 | Draft |
| EPIC-14/STORY-24 | Delete placeholder-wines.ts and verify zero mock imports | infrastructure | 1 | Draft |
| EPIC-14/STORY-25 | RLS verification: pgTAP tests for all consumer data access patterns | backend | 5 | Draft |
| EPIC-14/STORY-26 | E2E tests: anonymous browsing and authenticated personalized flows | qa | 5 | Draft |
| | **Total** | | **87** | |

---

## Story Summaries

### Phase 1: Wine Data Wiring (Stories 01-06)

Replace all `PLACEHOLDER_WINES` usage with real `getWines()` DAL calls across browse, search, detail, filter, and new-arrivals pages. Extract filter options (regions, varietals) from the database via `SELECT DISTINCT` queries rather than hardcoded arrays.

**Key DAL functions (all exist in `lib/dal/wines.ts`):**
- `getWines(client, filters, pagination)` — paginated wine list with filtering
- `getWineBySlug(client, slug)` — single wine detail with producer join
- `getWinesByProducer(client, producerId, pagination)` — wines for a producer

**Key DAL functions (exist in `lib/dal/search.ts`):**
- `searchWines(client, query, filters, pagination)` — full-text search

**New DAL functions needed:**
- `getDistinctRegions(client)` — `SELECT DISTINCT region FROM wines WHERE is_active = true`
- `getDistinctVarietals(client)` — `SELECT DISTINCT varietal FROM wines WHERE is_active = true`
- `getNewWines(client, limit)` — wines ordered by `created_at DESC`

### Phase 2: Producer Pages (Story 07)

Replace `PLACEHOLDER_PRODUCERS` and `PLACEHOLDER_PRODUCER_WINES` in the `producers/[slug]/page.tsx` with real `getProducerBySlug()` and `getWinesByProducer()` DAL calls. Both functions already exist in `lib/dal/producers.ts` and `lib/dal/wines.ts`.

### Phase 3: Home Page & Curation (Stories 08-11)

Wire the home page to check auth status and taste-profile existence server-side. Replace the hardcoded `HAS_TASTE_PROFILE = true` with a real check. Connect PickedForYou to `getRecommendations()` from `lib/actions/curation.ts` (already built). Wire PopularNearYou to a trending-wines query (needs a new DAL function based on order volume or view counts). Wire CuratedCollectionsRow to the existing `getActiveCollections()` in `lib/dal/collections.ts`.

**New DAL functions needed:**
- `getTrendingWines(client, limit, locationPoint?)` — wines ranked by recent order volume, optionally filtered by nearby retailer inventory

### Phase 4: Retailer & Cart Wiring (Stories 12-13)

Replace `MOCK_RETAILERS` in `RetailerSelectionSheet` with real nearby-retailer data from `lib/dal/retailers.ts`. The `findWinesAvailableNearby` RPC exists but needs a wrapper that returns the `Retailer` shape expected by the component. Fix the hardcoded `'Local Wine Shop'` retailer name in `WineGridClient.handleAddToCart` by passing the selected retailer's real name from the `RetailerSelectionSheet` callback.

**New DAL/action work:**
- Create a `getRetailersForWine(client, wineId, userLocation)` function that returns retailers carrying a specific wine, sorted by distance
- Update `RetailerSelectionSheet` `onSelect` callback to pass retailer name alongside orgId

### Phase 5: Settings Pages (Stories 14-17)

Wire all four settings pages to their real DAL functions. The DAL functions already exist:
- Profile: `getProfile()` / `updateProfile()` in `lib/dal/users.ts`
- Preferences: `getPreferences()` / `upsertPreferences()` in `lib/dal/preferences.ts`
- Taste Profile: `getTasteProfile()` / `getTasteProfileWines()` in `lib/dal/taste-profiles.ts`
- Notifications: notification preferences (may need new DAL function if not yet in `preferences.ts`)

Each page currently declares a `MOCK_*` constant at the top of the file. Replace with a server-side DAL call using the authenticated user's ID.

### Phase 6: Admin Pages (Stories 18-21)

Wire admin pages to real DAL queries. The admin producers list already has `getProducers()` in `lib/dal/producers.ts`. Producer detail, wines, and photos pages need `getProducerById()`, `getWinesByProducer()`, and the producer-photos join. The wine-matching stats page needs an aggregation query against `wine_match_queue`. The CollectionItemList wine search needs to call the real `searchWines()` DAL function.

**New DAL functions needed:**
- `getMatchQueueStats(client)` — aggregate counts by status from `wine_match_queue`

### Phase 7: Remaining Component Wiring (Stories 22-23)

Wire the `WineSearchInput` component in the taste-profile flow to use real `searchWines()` instead of filtering `PLACEHOLDER_WINES` client-side. Wire `WineAvailability` on the wine detail page to show real retailer data for the specific wine.

### Phase 8: Cleanup & Verification (Stories 24-26)

Delete the `placeholder-wines.ts` file entirely. Run a codebase-wide grep to confirm zero remaining `MOCK_` or `PLACEHOLDER_` imports outside of test files. Write pgTAP tests verifying RLS works correctly for all the data access patterns introduced (user can read wines, cannot read other org's inventory, etc.). Write Playwright E2E tests for anonymous browsing and authenticated personalized flows.

---

## Dependency Graph

```
STORY-01 (browse)  ─┐
STORY-02 (search)   │
STORY-03 (detail)   ├─→ STORY-06 (dynamic filters) ─→ STORY-24 (delete placeholders)
STORY-04 (varietal)  │
STORY-05 (new)      ─┘

STORY-07 (producers) ─→ STORY-24

STORY-08 (home auth) ─→ STORY-09 (PickedForYou) ─┐
                       → STORY-10 (PopularNearYou)  ├─→ STORY-24
                       → STORY-11 (Collections)    ─┘

STORY-12 (retailers) ─→ STORY-13 (cart fix) ─→ STORY-24

STORY-14 (profile)    ─┐
STORY-15 (preferences) ├─→ STORY-24
STORY-16 (taste)       │
STORY-17 (notifs)     ─┘

STORY-18 (admin list)      ─┐
STORY-19 (admin detail)     ├─→ STORY-24
STORY-20 (admin matching)   │
STORY-21 (admin search)    ─┘

STORY-22 (wine search input) ─→ STORY-24

STORY-23 (wine availability) ─→ STORY-24

STORY-24 (delete placeholders) ─→ STORY-25 (RLS tests) ─→ STORY-26 (E2E tests)
```

**External dependency:** This epic depends on EPIC-13 (Motion Library Adoption) being complete, as component refactors in that epic may touch the same files.

---

## Implementation Notes

### Auth Pattern for Server Components

Every server component that fetches user-specific data must follow this pattern:

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function SomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Render unauthenticated fallback or redirect
  }

  // Pass supabase client to DAL — RLS is enforced automatically
  const { data } = await getWines(supabase, filters, pagination)
}
```

### Unauthenticated Fallback Strategy

| Feature | Authenticated | Unauthenticated |
|---------|--------------|-----------------|
| Wine browse/search | Full access | Full access |
| Wine detail | Full access | Full access |
| Producer pages | Full access | Full access |
| PickedForYou | Personalized recs | Hidden (show TasteProfileCTA) |
| PopularNearYou | Location-aware | Global trending (no location filter) |
| CuratedCollections | Full access | Full access |
| Settings pages | User data | Redirect to login |
| Admin pages | Role-gated | Redirect to login |
| RetailerSelectionSheet | Location-aware | Prompt for location |

### Price Normalization Rule

All prices stored in the database and passed through DAL are in **dollars** (decimal). The cart stores prices in **cents** (integer). Conversion happens at the boundary:
- DAL returns dollars
- `WineGridClient.handleAddToCart` converts to cents: `price * 100`
- Display components format dollars with `$XX.XX`

### Files to Delete After Wiring

- `apps/web/app/(app)/wines/_lib/placeholder-wines.ts` — all 8 exports replaced by DAL calls
