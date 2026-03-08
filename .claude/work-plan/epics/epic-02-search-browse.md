# Epic: [EPIC-02] — Search & Browse

**Source PRD:** `docs/prds/prd-02-search-browse.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 7,500
**Build Order:** #2 (Track A — immediately after User Accounts)
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-4, ux-designer, marketing-writer, qa

## Epic Summary

Search & Browse is the primary discovery engine that lets users find wines through multiple paths: keyword search, region, varietal, occasion/mood, producer, and recency. It serves both users who know exactly what they want ("Domaine Tempier Bandol Rosé") and explorers who only know how they feel ("something fun for Tuesday night"). This epic builds the wines catalog schema, full-text search infrastructure, filter system, Wine Card component, and all browse pages — forming the foundation that Taste Profile, Curation, and the commerce funnel build upon.

## Success Criteria

- [ ] Users can search wines by keyword across name, producer, varietal, region, and appellation with <2s results
- [ ] Autocomplete suggestions appear within 300ms of typing (debounced)
- [ ] Browse modes work for Region, Varietal, Occasion, Producer, and "New on Cru"
- [ ] Filters (price, varietal, region, available nearby, producer attributes) narrow results correctly
- [ ] Wine Card displays name, producer, varietal, region, vintage, price, story hook (≤120 chars), availability indicator
- [ ] 60%+ of sessions reach a wine detail page within 2 minutes
- [ ] SEO routes are indexable: `/wines/region/[region]`, `/wines/varietal/[varietal]`, `/wines/occasion/[occasion]`
- [ ] All browse pages are mobile-first responsive with filter drawer on mobile

## Architecture Dependencies

- **Database tables:** `wines` (with tsvector), `wine_tags`, `wine_occasions` (all content-scoped, org_id = platform org per CG-2)
- **Search infrastructure:** PostgreSQL FTS + `pg_trgm` extension (ADR-003)
- **External integrations:** None (search is internal)
- **Shared components:** Wine Card (reused by EPIC-07 curation, EPIC-04 producer pages, EPIC-01 wishlist)

## Cross-Cutting Concerns

- **wines table** — foundational table referenced by wishlists (EPIC-01), taste_profiles (EPIC-03), orders (EPIC-05), retailer_inventory (EPIC-06), curation (EPIC-07)
- **Wine Card component** — shared UI used across browse, curation, wishlist, producer portfolio, and search results
- **Location-based filtering** — "Available nearby" toggle depends on user preferences (EPIC-01) and retailer inventory (EPIC-06)
- **FTS infrastructure** — tsvector generation trigger reused if search expands to producer content

## Technical Risks & Open Questions

- [ ] **FTS performance at scale**: PostgreSQL FTS is sufficient for <5K wines. Need benchmark plan for 5K-10K migration threshold to Meilisearch (ADR-003)
- [ ] **Multi-retailer pricing display**: When a wine is available at multiple retailers with different prices, display rule needed (lowest price? range?)
- [ ] **Occasion taxonomy**: 12 categories defined in architecture — confirm final list matches content team tagging
- [ ] **"Available nearby" without EPIC-06**: Browse builds before retailer inventory exists. Need graceful handling when no inventory data exists yet (hide the toggle or show "coming soon")

---

## Developer Stories

---

### [EPIC-02/STORY-01] — Create wines, wine_tags, and wine_occasions tables with FTS

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform, I need a wines catalog schema with full-text search support so that the browse and search features have a performant data foundation.

#### Acceptance Criteria

```gherkin
Given the migration is applied
When I inspect the database schema
Then the wines table exists with columns: id (UUID PK), producer_id (FK -> producers.id), name (TEXT), slug (TEXT UNIQUE), varietal (TEXT), region (TEXT), sub_region (TEXT nullable), appellation (TEXT nullable), country (TEXT), vintage (INT nullable), description (TEXT nullable), tasting_description (TEXT nullable), food_pairings (JSONB nullable), flavor_profile (JSONB nullable), story_hook (TEXT nullable), image_url (TEXT nullable), price_min (NUMERIC 10,2 nullable), price_max (NUMERIC 10,2 nullable), is_active (BOOLEAN DEFAULT true), search_vector (tsvector), org_id (UUID FK), created_at, updated_at
And a GIN index exists on search_vector
And a trigger auto-updates search_vector on INSERT/UPDATE using name, varietal, region, sub_region, appellation, country
And wine_tags table exists with: id, wine_id (FK), tag_name (TEXT), org_id, created_at
And wine_occasions table exists with: id, wine_id (FK), occasion_name (TEXT), org_id, created_at
And all tables have RLS enabled with content-scoped policies (SELECT: any authenticated user, write: platform org admins only)
And pg_trgm extension is enabled

Given a wine with name "Domaine Tempier Bandol Rosé" exists
When I search with ts_query 'tempier & rose'
Then the wine appears in results

Given a wine tagged with "natural" and "biodynamic"
When I filter wine_tags WHERE tag_name = 'natural'
Then the wine appears in results
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_wines_catalog.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_enable_pg_trgm.sql` | Create |
| Types | `types/database.ts` | Regenerate |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-01 (producers table — wines has FK to producers) OR create both in same migration
- **Blocks:** EPIC-02/STORY-02, EPIC-02/STORY-03, EPIC-01/STORY-02 (wishlists FK to wines), EPIC-03 (taste_profile_wines), EPIC-05 (orders), EPIC-06 (inventory)

#### Testing Requirements

- [ ] **RLS (pgTAP):** Any authenticated user can SELECT wines, wine_tags, wine_occasions
- [ ] **RLS (pgTAP):** Non-platform-admin user cannot INSERT/UPDATE/DELETE wines
- [ ] **RLS (pgTAP):** Platform admin CAN INSERT/UPDATE/DELETE wines
- [ ] **Unit:** FTS trigger correctly updates search_vector on wine INSERT and UPDATE
- [ ] **Unit:** pg_trgm similarity query returns expected fuzzy matches

#### Implementation Notes

- Per CG-2, wines are **content-scoped** — they DO have `org_id` but it always references the platform organization. SELECT is permissive for all authenticated users.
- FTS trigger function: `tsvector_update_trigger` or custom function that concatenates `name || ' ' || varietal || ' ' || region || ' ' || COALESCE(sub_region, '') || ' ' || COALESCE(appellation, '') || ' ' || country` weighted appropriately (name = 'A', varietal = 'B', region = 'B', others = 'C').
- `pg_trgm` extension: enables `similarity()` and `%` operator for fuzzy matching. Used by EPIC-06 wine matching and autocomplete.
- Add trigram index: `CREATE INDEX idx_wines_name_trgm ON wines USING gin (name gin_trgm_ops);`
- `slug` column needs unique B-tree index for URL lookups (`/wines/[slug]`).
- `producer_id` FK — if producers table isn't created yet, this migration must create it first (coordinate with EPIC-04/STORY-01). Consider a single migration that creates both.
- `story_hook` is ≤120 chars — enforce at Zod layer, not database (per design principle: `TEXT` over `VARCHAR(n)`).
- `price_min` / `price_max` — these are platform-level suggested prices, not retailer prices. Retailer-specific prices live in `retailer_inventory` (EPIC-06).

---

### [EPIC-02/STORY-02] — Implement search and wines DAL functions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I need DAL functions for querying wines with search, filters, and browse modes so that the frontend can access wine data through the standard data access pattern.

#### Acceptance Criteria

```gherkin
Given a search query "tempier rosé"
When searchWines is called with the query
Then wines matching the FTS query are returned, ranked by relevance

Given filters { varietal: ["Pinot Noir"], price_max: 35, region: ["Burgundy"] }
When getWines is called with filters
Then only wines matching ALL filters are returned

Given a browse mode "by_region" with region="France"
When getWinesByRegion is called
Then wines from France are returned, grouped by sub_region

Given a browse mode "by_occasion" with occasion="weeknight dinner"
When getWinesByOccasion is called
Then wines tagged with that occasion are returned via join with wine_occasions

Given a search query "temp"
When getSearchSuggestions is called
Then autocomplete results include wine names AND varietal names AND producer names matching the prefix/trigram
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/wines.ts` | Create |
| DAL | `lib/dal/search.ts` | Create |
| Validation | `lib/validations/wines.ts` | Create |
| Validation | `lib/validations/search.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-01 (wines tables exist)
- **Blocks:** EPIC-02/STORY-05, EPIC-02/STORY-06, EPIC-02/STORY-07, EPIC-02/STORY-08

#### Testing Requirements

- [ ] **Unit (Vitest):** Search returns relevant results for exact and partial matches
- [ ] **Unit (Vitest):** Filters compose correctly (AND logic across filter types)
- [ ] **Unit (Vitest):** Pagination returns correct page with total count
- [ ] **Unit (Vitest):** Autocomplete returns mixed results (wines, varietals, producers)

#### Implementation Notes

- `lib/dal/wines.ts` functions: `getWines(client, filters, pagination)`, `getWineBySlug(client, slug)`, `getWinesByRegion(client, region)`, `getWinesByVarietal(client, varietal)`, `getWinesByOccasion(client, occasion)`, `getNewWines(client, limit)`, `getWinesByProducer(client, producerId)`.
- `lib/dal/search.ts` functions: `searchWines(client, query, filters, pagination)`, `getSearchSuggestions(client, prefix)`.
- Filter interface: `WineFilters { query?: string, varietals?: string[], regions?: string[], sub_regions?: string[], occasions?: string[], tags?: string[], price_min?: number, price_max?: number, available_nearby?: boolean, producer_id?: string }`.
- Pagination: cursor-based or offset-based. For MVP, offset with `{ page: number, per_page: number }` returning `{ data, total, page, per_page }`.
- `searchWines` uses `to_tsquery` with `plainto_tsquery` fallback for user-friendly query parsing.
- `getSearchSuggestions` combines: (1) wine name trigram matches, (2) varietal DISTINCT matches, (3) producer name matches — limited to 8 total suggestions.
- `available_nearby` filter: initially a no-op until EPIC-06 builds retailer_inventory. Design the interface to accept `{ lat, lng, radius_miles }` but return all wines when inventory data is absent.

---

### [EPIC-02/STORY-03] — Implement recent searches DAL and Server Action

**Type:** backend
**Story Points:** 2
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an explorer, I want to see my recent searches when I focus the search bar so that I can quickly re-run previous queries.

#### Acceptance Criteria

```gherkin
Given a user performs a search for "pinot noir"
When the search is executed
Then the query is saved to their recent searches list

Given a user has 12 saved searches
When recent searches are retrieved
Then only the 10 most recent are returned (FIFO)

Given user-A has recent searches
When user-B requests their recent searches
Then user-B sees only their own searches (empty if new)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_recent_searches.sql` | Create |
| DAL | `lib/dal/search.ts` | Modify (add recent search functions) |
| Action | `lib/actions/search.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 (profiles table)
- **Blocks:** EPIC-02/STORY-07 (search UI uses recent searches)

#### Testing Requirements

- [ ] **RLS (pgTAP):** User can only read/write their own recent searches
- [ ] **Unit:** FIFO cap at 10 — oldest search removed when 11th is added

#### Implementation Notes

- `recent_searches` table: `id UUID PK`, `user_id UUID FK -> profiles.id`, `query TEXT`, `searched_at TIMESTAMPTZ DEFAULT now()`. User-scoped (NO org_id per CG-2 pattern).
- RLS: `user_id = auth.uid()` for all operations.
- DAL: `getRecentSearches(client, userId, limit=10)`, `saveRecentSearch(client, userId, query)`.
- `saveRecentSearch`: Use `INSERT` then `DELETE` the oldest if count > 10. Or use a single transaction with CTE.
- Deduplicate: if same query already exists, update `searched_at` instead of creating new row.

---

### [EPIC-02/STORY-04] — Design browse page layout and Wine Card component

**Type:** design
**Story Points:** 3
**Assigned Agent:** ux-designer
**Phase:** Checkpoint 4: Frontend (pre-build)

#### User Story

As an explorer, I want the browse experience to feel intuitive and inviting — not like a database query tool — so that discovering wine is enjoyable, not clinical.

#### Acceptance Criteria

```gherkin
Given the UX designer delivers browse layouts
When reviewed by fullstack-1
Then designs cover: browse landing page, region browse, varietal browse, occasion browse, producer browse, search results page, empty state, and zero-results state
And each layout shows mobile (375px) and desktop (1280px) versions
And the Wine Card component spec includes: visual hierarchy, content slots, availability indicator placement, interaction states (hover, active, loading)

Given the filter system is designed
When reviewed
Then mobile uses a filter drawer pattern (bottom sheet or slide-in)
And desktop uses a sidebar filter panel
And filter selections persist visually (chips or badges)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | `docs/design/browse-layouts.md` | Create |
| Design | `docs/design/wine-card-spec.md` | Create |

#### Dependencies

- **Blocked by:** None (can start immediately)
- **Blocks:** EPIC-02/STORY-06 (Wine Card build), EPIC-02/STORY-05 (browse pages build)

#### Testing Requirements

- [ ] **Review:** Design reviewed by fullstack-1 and pm-orchestrator for feasibility and brand alignment

#### Implementation Notes

- The Wine Card is the most reused component in the app — it appears in browse results, curation sections, wishlist, producer pages, and search results. Design must be flexible enough for all these contexts.
- Availability indicator: green dot for "in stock nearby," gray dot for "not locally available," no dot if inventory data unavailable (EPIC-06 not yet built).
- Story hook: 1-2 line preview of the producer story. Truncated with "Read more →". This is the key differentiator from other wine apps.
- Mobile: wine cards in a single-column list. Desktop: 3-4 column grid.
- Filter patterns: follow Shadcn/ui patterns (Sheet for mobile drawer, Sidebar for desktop panel).

---

### [EPIC-02/STORY-05] — Write browse and search page copy

**Type:** copy
**Story Points:** 2
**Assigned Agent:** marketing-writer
**Phase:** Checkpoint 4: Frontend (pre-build)

#### User Story

As an explorer, I want the browse experience to speak to me like a knowledgeable friend, not a wine encyclopedia.

#### Acceptance Criteria

```gherkin
Given marketing-writer delivers browse copy
When reviewed
Then it includes: browse landing page headline + intro, region descriptions (2-3 sentences each for top 10 regions), varietal descriptions (1-2 sentences each for top 15 varietals), occasion collection names + descriptions, empty state messages, zero-result suggestions, search placeholder text, filter labels, and section headers

Given region descriptions are written
When a user reads the France/Burgundy description
Then it communicates what wines from there taste like in plain, evocative language — no jargon, no scores
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Copy | `docs/copy/browse-pages.md` | Create |

#### Dependencies

- **Blocked by:** None
- **Blocks:** EPIC-02/STORY-06 (pages need copy)

#### Testing Requirements

- [ ] **Review:** Copy reviewed for brand voice, accuracy, accessibility of language

#### Implementation Notes

- Region descriptions should make someone who's never had wine from that region curious to try it.
- Occasion names must match the 12 predefined categories exactly.
- Zero-result copy should be helpful, not apologetic: "No wines matched those filters. Try widening your price range or exploring a different region."
- Search placeholder: something like "Search by wine, producer, or region..." — not generic "Search."

---

### [EPIC-02/STORY-06] — Build Wine Card component

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want each wine in browse results to show me at a glance what the wine is, who made it, what it costs, and whether I can get it nearby so that I can quickly decide which wines to explore further.

#### Acceptance Criteria

```gherkin
Given a wine with full data
When the Wine Card renders
Then it displays: wine name, producer name (linked), varietal, region, vintage, price or price range, story hook (≤120 chars with "Read more →"), and availability indicator

Given a wine is in stock at a nearby retailer
When the Wine Card renders
Then a green dot availability indicator is visible with aria-label "Available nearby"

Given the user is on mobile (375px viewport)
When Wine Cards render
Then they display in a single-column layout with adequate touch targets

Given the user hovers over a Wine Card on desktop
When the hover state activates
Then a subtle elevation/shadow change indicates interactivity

Given the Wine Card is clicked
When navigation occurs
Then the user is taken to /wines/[slug]
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/wines/WineCard.tsx` | Create |
| Component | `components/features/wines/WineCardSkeleton.tsx` | Create |
| Component | `components/features/wines/AvailabilityIndicator.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-04 (design spec), EPIC-02/STORY-05 (copy)
- **Blocks:** EPIC-02/STORY-08 (browse pages use Wine Card), EPIC-01/STORY-07 (wishlist uses Wine Card), EPIC-07 (curation uses Wine Card)

#### Testing Requirements

- [ ] **Unit:** WineCard renders all data fields correctly
- [ ] **Unit:** Story hook truncates at 120 chars with ellipsis
- [ ] **Accessibility:** aria-labels on availability indicator, proper heading hierarchy, link is focusable
- [ ] **Visual:** Responsive at 375px, 768px, 1280px breakpoints

#### Implementation Notes

- This is a Server Component (no interactivity beyond navigation). The WishlistToggleButton (EPIC-01/STORY-07) is a separate Client Component overlaid on the card.
- Use Shadcn `<Card>` as the base primitive.
- Props interface: `{ wine: Wine, showAvailability?: boolean, showStoryHook?: boolean }` — different contexts may hide certain fields.
- Skeleton component (`WineCardSkeleton`) mirrors the card layout for Suspense fallbacks.
- Price display: if `price_min === price_max`, show single price. If different, show range "$20 - $28". If null, show "Check availability."

---

### [EPIC-02/STORY-07] — Build search bar with autocomplete

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want to type a wine name, producer, or varietal and see instant suggestions so that I can find what I'm looking for without typing the full name.

#### Acceptance Criteria

```gherkin
Given I focus the search bar with no input
When the dropdown opens
Then I see my recent searches (up to 10)

Given I type "temp" in the search bar
When 300ms passes after keystroke (debounce)
Then autocomplete suggestions appear showing matching wines, varietals, and producers

Given I select an autocomplete suggestion
When I click/tap the suggestion
Then I am navigated to the appropriate page (wine detail, varietal browse, or producer page)

Given I press Enter with text in the search bar
When the search executes
Then I am navigated to the search results page with the query applied

Given the autocomplete is loading
When suggestions are being fetched
Then a loading spinner is visible in the dropdown
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/search/SearchBar.tsx` | Create |
| Component | `components/features/search/SearchSuggestions.tsx` | Create |
| Component | `components/features/search/RecentSearches.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-02 (search DAL), EPIC-02/STORY-03 (recent searches)
- **Blocks:** EPIC-02/STORY-08 (browse pages include search bar)

#### Testing Requirements

- [ ] **Unit:** Debounce fires after 300ms, not on every keystroke
- [ ] **Unit:** Suggestions categorized correctly (wines, varietals, producers)
- [ ] **E2E:** Type search → see suggestions → click suggestion → navigate
- [ ] **Accessibility:** Search bar has proper role="searchbox", suggestions have role="listbox", keyboard navigation works

#### Implementation Notes

- Client Component (`'use client'`) — needs state for query input, debounce, and dropdown visibility.
- Use `useDeferredValue` or custom debounce hook (300ms).
- Autocomplete calls a Server Action or API route that wraps `getSearchSuggestions` from the search DAL.
- Group suggestions: "Wines" section, "Varietals" section, "Producers" section — each with up to 3 items.
- Recent searches: stored server-side (STORY-03), fetched on focus. Display with a clock icon and "Recent" header.
- Keyboard: arrow keys to navigate, Enter to select, Escape to close.
- Search bar placement: top of all browse pages + in the app header/nav.

---

### [EPIC-02/STORY-08] — Build browse pages (region, varietal, occasion, producer, new)

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want multiple entry points to discover wines — by region, varietal, occasion, producer, or recency — so that I can navigate in the way that feels most natural to me.

#### Acceptance Criteria

```gherkin
Given I navigate to /wines/region
When the page loads
Then I see a list of regions with descriptions and wine counts, linking to sub-pages

Given I navigate to /wines/region/france
When the page loads
Then I see French wines grouped by sub-region (Burgundy, Bordeaux, Rhône, etc.) with descriptions

Given I navigate to /wines/occasion/weeknight-dinner
When the page loads
Then I see wines tagged with "weeknight dinner" occasion displayed as Wine Cards

Given I navigate to /wines/varietal/pinot-noir
When the page loads
Then I see all Pinot Noir wines with the varietal description at top and Wine Cards below

Given I apply filters (price: $20-35, available nearby: true)
When filter change completes
Then the wine list updates showing only matching wines with filter chips visible

Given I navigate to /wines/new
When the page loads
Then wines are sorted by created_at descending showing most recently added first

Given I am on mobile
When I tap the filter button
Then a filter drawer slides up from the bottom with all filter controls
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/wines/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/region/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/region/[region]/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/varietal/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/varietal/[varietal]/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/occasion/[occasion]/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/new/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/search/page.tsx` | Create |
| Component | `components/features/browse/BrowseLanding.tsx` | Create |
| Component | `components/features/browse/FilterPanel.tsx` | Create |
| Component | `components/features/browse/FilterDrawer.tsx` | Create |
| Component | `components/features/browse/WineGrid.tsx` | Create |
| Component | `components/features/browse/RegionCard.tsx` | Create |
| Component | `components/features/browse/BrowseEmptyState.tsx` | Create |
| Loading | `app/(app)/[orgSlug]/wines/loading.tsx` | Create |
| Error | `app/(app)/[orgSlug]/wines/error.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-02 (wines DAL), EPIC-02/STORY-04 (design), EPIC-02/STORY-05 (copy), EPIC-02/STORY-06 (Wine Card)
- **Blocks:** None directly (but EPIC-03 and EPIC-07 pages link into browse)

#### Testing Requirements

- [ ] **E2E (Playwright):** Navigate browse landing → region → sub-region → see wines
- [ ] **E2E (Playwright):** Apply price filter → results narrow correctly
- [ ] **Accessibility:** axe-core on browse landing, region page, search results
- [ ] **Unit:** Filter state syncs with URL search params
- [ ] **Visual:** Mobile filter drawer, desktop sidebar, responsive grid

#### Implementation Notes

- Browse pages are Server Components that fetch data via DAL with `<Suspense>` boundaries around the wine grid.
- Filters use URL search params (not client state) so that filtered views are shareable/bookmarkable: `?price_min=20&price_max=35&varietal=pinot-noir`.
- Filter panel: Client Component for interactivity, updates URL params on change, triggers Server Component re-render.
- SEO: each browse route generates `<title>` and `<meta description>` via `generateMetadata()`. Include JSON-LD BreadcrumbList.
- Mobile filter drawer: use Shadcn `<Sheet>` component from bottom. Show active filter count badge on the filter button.
- Empty state: when zero results, show suggestions ("Try widening your price range" or "Browse all [region] wines").
- Wine grid: use CSS Grid with responsive columns (1 on mobile, 2 on tablet, 3-4 on desktop).
- Pagination: "Load more" button at bottom (not infinite scroll for V1 — keeps server component model simple).

---

### [EPIC-02/STORY-09] — Build wine detail page

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want to see all details about a wine — its story, tasting notes, food pairings, and where to buy it — so that I can decide whether this is the right bottle for me.

#### Acceptance Criteria

```gherkin
Given I navigate to /wines/[slug]
When the page loads
Then I see: wine name, producer name (linked to producer page), varietal, region, vintage, full tasting description, food pairings, flavor profile, producer story hook with "Full Story →" link, price/availability section, wishlist toggle, share button

Given the wine has food pairing data
When the page renders
Then 2-3 dish pairings are displayed with friendly formatting

Given the wine is available at nearby retailers
When the availability section renders
Then retailers are listed with price, distance, and stock status

Given the page is shared via URL
When someone opens the shared link
Then OG meta tags (title, description, image) are properly set for social previews

Given I view the page on mobile
When the layout renders
Then content stacks vertically with the CTA (buy/wishlist) prominently visible
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/wines/[slug]/page.tsx` | Create |
| Component | `components/features/wines/WineDetail.tsx` | Create |
| Component | `components/features/wines/TastingNotes.tsx` | Create |
| Component | `components/features/wines/FoodPairings.tsx` | Create |
| Component | `components/features/wines/WineAvailability.tsx` | Create |
| Loading | `app/(app)/[orgSlug]/wines/[slug]/loading.tsx` | Create |
| Error | `app/(app)/[orgSlug]/wines/[slug]/error.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-02 (wines DAL for getWineBySlug), EPIC-02/STORY-06 (Wine Card patterns), EPIC-04/STORY-04 (producer story content)
- **Blocks:** EPIC-05 (order placement links from wine detail "Buy" button), EPIC-08 (share button)

#### Testing Requirements

- [ ] **E2E:** Navigate to wine detail → all sections render
- [ ] **Accessibility:** axe-core scan, heading hierarchy, image alt text
- [ ] **Unit:** OG metadata generated correctly via generateMetadata()
- [ ] **Unit:** Missing data handled gracefully (no food pairings → section hidden)

#### Implementation Notes

- Server Component. Fetch wine by slug via DAL.
- OG tags via `generateMetadata()`: title = "Wine Name — Producer | Cru", description = story_hook or tasting_description truncated, image = wine image_url.
- JSON-LD: Schema.org `Product` with `Offer` entries from retailer inventory (when EPIC-06 is live).
- Availability section: initially shows "Coming soon — availability info" until EPIC-06 provides inventory data. Design the component to accept retailer data as optional prop.
- "Buy" button: navigates to retailer selection flow (EPIC-05). Until EPIC-05 exists, show wishlist CTA.
- Share button: EPIC-08 provides the ShareButton component. Until then, show a simple "Copy link" button.

---

### [EPIC-02/STORY-10] — SEO metadata and sitemap generation

**Type:** fullstack
**Story Points:** 3
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a platform, I need browse pages to be discoverable by search engines so that we drive organic traffic from wine-related searches.

#### Acceptance Criteria

```gherkin
Given a browse page at /wines/region/france
When a search engine crawls the page
Then it finds: proper <title>, <meta description>, canonical URL, and JSON-LD BreadcrumbList

Given all wine detail pages exist
When the sitemap is generated
Then /sitemap.xml includes all active wine detail URLs, region pages, and varietal pages

Given OG tags are set on a wine page
When the URL is shared on social media
Then the preview shows wine name, producer, image, and description
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Sitemap | `app/sitemap.ts` | Create |
| Metadata | All browse page files | Modify (add generateMetadata) |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-08 (browse pages exist), EPIC-02/STORY-09 (wine detail exists)
- **Blocks:** None

#### Testing Requirements

- [ ] **Unit:** sitemap.ts generates valid XML with all expected URLs
- [ ] **Unit:** generateMetadata returns correct title/description for each page type

#### Implementation Notes

- Use Next.js built-in `sitemap.ts` convention for `/sitemap.xml`.
- Fetch all active wine slugs, region slugs, and varietal slugs from DAL.
- Set `changefreq: 'weekly'` for browse pages, `'monthly'` for wine detail.
- Canonical URLs prevent duplicate content issues between filtered/unfiltered views.
- robots.txt: allow all browse pages, block search results page (`/wines/search?q=*`).
