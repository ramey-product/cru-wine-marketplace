# EPIC-12: Discovery & Proximity

**Priority:** P0 — Launch Critical (Highest RICE: 7,200)
**Source PRD:** PRD-12 (Discovery & Proximity)
**Depends On:** EPIC-01 (User Accounts), EPIC-02 (Search & Browse), EPIC-04 (Producer Storytelling), EPIC-06 (Retailer Integration)

---

## Problem Statement

Cru's core promise is "discover wine locally" but without location awareness, the app can't deliver on "locally," and without rich discovery flows, it can't deliver on "discover." Three problems compound: (1) Location blindness — no mechanism to show what's available nearby, (2) Discovery dead ends — no contextual navigation keeps exploration alive, (3) No reason to open the app without buy intent. This epic builds the unified discovery and proximity system that makes every other feature location-aware.

**Architecture review directive:** This epic's infrastructure (PostGIS, geolocation, location persistence) is foundational for EPIC-10 and EPIC-11. Build infrastructure stories first.

---

## Stories

### STORY 12/01: PostGIS Infrastructure & Spatial Queries
**Points:** 8 | **Assignee:** sr-backend

**What:** Set up PostGIS spatial infrastructure and build the core proximity query functions.

**Build:**
1. **Migration: Enable PostGIS**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Migration: Add location to retailers**
   - `location GEOGRAPHY(POINT, 4326)` column on `retailers` table
   - GIST spatial index on `location` column
   - Update existing retailer data with geocoded coordinates

3. **PostgreSQL functions:**
   - `find_nearby_retailers(user_lat FLOAT, user_lng FLOAT, radius_miles INT)` — returns retailers sorted by distance with distance in miles
   - `find_wines_available_nearby(user_lat FLOAT, user_lng FLOAT, radius_miles INT)` — joins retailer inventory with spatial queries, returns wines with nearest retailer info

4. **DAL functions** in `lib/dal/retailers.ts`:
   - `findNearbyRetailers(lat, lng, radiusMiles)` — wraps the RPC call
   - `findWinesAvailableNearby(lat, lng, radiusMiles)` — wraps the RPC call

5. **Spatial query approach:**
   - `ST_DWithin(location, ST_MakePoint(lng, lat)::geography, radius_meters)` for radius filtering
   - `ST_Distance(location, ST_MakePoint(lng, lat)::geography)` for distance sorting
   - Convert miles to meters in SQL: `radius_miles * 1609.34`

**Acceptance Criteria:**
- [ ] PostGIS extension enabled in migration
- [ ] `location` column added to retailers with GIST index
- [ ] `find_nearby_retailers` function returns correct results sorted by distance
- [ ] `find_wines_available_nearby` joins inventory and spatial data correctly
- [ ] DAL functions expose typed, error-handled results
- [ ] RLS policies maintained on all queries
- [ ] Distance returned in miles with one decimal precision

---

### STORY 12/02: Geolocation Infrastructure (3-Tier Fallback)
**Points:** 8 | **Assignee:** fullstack-1

**What:** Build the three-tier location detection system with persistence.

**Build:**
1. **Tier 1: Browser Geolocation API** — `lib/geo/location.ts` → `getBrowserLocation()`
   - Triggered on explicit user action (button tap), never automatic on page load
   - Returns lat/lng with accuracy level
   - Graceful handling of permission denial

2. **Tier 2: IP-based fallback** — `lib/geo/location.ts` → `getIPLocation()`
   - Uses ipapi.co for development, plan MaxMind GeoLite2 for production
   - Automatic fallback when browser permission denied
   - Returns approximate city-level location

3. **Tier 3: Manual entry** — `lib/geo/location.ts` → `geocodeAddress(query)`
   - Mapbox Geocoding API for address/zip to lat/lng conversion
   - Address autocomplete in location picker UI
   - Always available as an option

4. **Location persistence** — `lib/geo/location-store.ts`:
   - Cookie: lat/lng only (for SSR), max 30 days, `SameSite=Lax`
   - localStorage: full location object (lat, lng, displayName, accuracy, source, timestamp)
   - `useLocation()` hook: reads cookie (SSR) → localStorage (client) → triggers detection if none

5. **Location picker component:**
   - Bottom sheet with "Use my location" button + address search input
   - Shows current location with accuracy indicator
   - Accessible from settings and browse page location indicator

6. **Server Action:** `lib/actions/location-actions.ts` → `setUserLocation()`
   - Zod validate (lat/lng bounds, display name) → persist cookie → revalidatePath

**Acceptance Criteria:**
- [ ] Browser location works when permission granted
- [ ] IP-based fallback activates automatically on permission denial
- [ ] Manual zip/address entry geocodes correctly via Mapbox
- [ ] Location persists across sessions via cookie + localStorage
- [ ] `useLocation()` hook provides location on both server and client render
- [ ] Location picker UI with "Use my location" and search input
- [ ] Server Action validates and persists location
- [ ] Mapbox API key in environment variables (never hardcoded)

---

### STORY 12/03: Location-Aware Browse UI
**Points:** 5 | **Assignee:** fullstack-1

**What:** Add persistent location indicator to browse pages and power "Available Nearby" sort.

**Build:**
1. **Location indicator pill** — top of browse page:
   - Format: `📍 Silver Lake · Change`
   - Pill-shaped, tappable "Change" opens location picker bottom sheet
   - Shows accuracy indicator: exact (GPS icon), approximate (~ prefix), manual (pin icon)

2. **"Available Nearby" sort option:**
   - Added to sort dropdown on browse page
   - Only appears when user location is set
   - Orders wines by nearest retailer distance (uses `find_wines_available_nearby`)
   - URL search param: `?sort=nearby`

3. **Wine card availability count:**
   - When location is set, wine cards show "Available at X nearby stores"
   - Count powered by spatial query joining retailer inventory
   - Muted style when count is 0: "Not available nearby"

4. **Default radius:** 25 miles (configurable in user settings)

**Acceptance Criteria:**
- [ ] Location pill displays on browse page with current location
- [ ] "Change" opens location picker sheet
- [ ] "Available Nearby" sort option appears only when location is set
- [ ] Sort orders wines by proximity correctly
- [ ] Wine cards show availability count when location is set
- [ ] Default radius is 25 miles

---

### STORY 12/04: Producer Discovery Page
**Points:** 5 | **Assignee:** fullstack-1

**What:** Build the `/producers` browse page with search and region filter.

**Build:**
1. **`/producers` page** — Grid of ProducerCards:
   - 1-col mobile, 2-col tablet, 3-col desktop
   - Producer cards: 3:2 hero image, producer name (Playfair Display), region subtitle, wine count badge
   - Hover: subtle shadow lift (200ms ease-out)

2. **Producer search:**
   - Text input at top of page: "Search producers..."
   - Client-side filter on mock data for V1
   - Plan migration to `pg_trgm` for production

3. **Region filter:**
   - Horizontal scrollable pills below search
   - Active region: filled primary style
   - Tapping filters producer grid with smooth content transition

4. **Navigation updates:**
   - "Producers" link in TopNav desktop center nav (between Browse and Collections)
   - Home "Discover Producers" → "See all" routes to `/producers`

5. **DAL functions** in `lib/dal/producers.ts`:
   - `getProducers()` — all producers, sorted by relevance (nearby availability first when location set)
   - `getProducersByRegion(region)` — filtered by region
   - `searchProducers(query)` — name search

6. **Page infrastructure:** `loading.tsx` skeleton and `error.tsx` error boundary

**Acceptance Criteria:**
- [ ] `/producers` page renders grid of producer cards
- [ ] Producer search filters results by name
- [ ] Region filter pills work correctly
- [ ] "Producers" link appears in TopNav
- [ ] Home "See all" on Discover Producers links to `/producers`
- [ ] Each producer card links to `/producers/[slug]`
- [ ] Responsive grid: 1/2/3 columns
- [ ] `loading.tsx` and `error.tsx` exist

---

### STORY 12/05: Discovery Loop Links
**Points:** 3 | **Assignee:** fullstack-4

**What:** Add contextual "More like this" navigation paths to prevent discovery dead ends.

**Build:**
1. **Wine Detail page** — below wine info, above "You Might Also Enjoy":
   - "More from [Producer Name]" → horizontal scroll of producer's other wines
   - "More [Varietal] wines" → horizontal scroll of same-varietal wines
   - "More wines from [Region]" → horizontal scroll of same-region wines
   - Each section: max 8 wines, "See all" link routes to filtered browse page
   - Style: chips with `rounded-full border border-border bg-background px-3 py-1.5 text-sm`

2. **Producer Profile page:**
   - "Browse [Region] wines" → link to `/wines?region=[region]`

3. **Collection Detail page:**
   - "Explore similar collections" → link back to `/collections`

**Acceptance Criteria:**
- [ ] Wine Detail shows 3 discovery sections (producer, varietal, region)
- [ ] Each section shows up to 8 wines in horizontal scroll
- [ ] "See all" links route to pre-filtered browse page
- [ ] Producer page has region discovery link
- [ ] Collection page has collections link
- [ ] All links route to real pages with correct filters applied

---

### STORY 12/06: Browse Page Mobile UX
**Points:** 5 | **Assignee:** fullstack-2

**What:** Add mobile filter bottom sheet, sort dropdown, load more, and sticky bar.

**Build:**
1. **Mobile filter bottom sheet:**
   - "Filters" button with active count badge (e.g., "Filters (2)")
   - Sheet opens at ~60% height, draggable to full, swipe-down to dismiss
   - Filter sections (collapsible): Type, Price Range, Region, Varietal
   - "Apply Filters" sticky button at bottom, "Clear All" top-right
   - Active filters as removable chips above results

2. **Sort dropdown:**
   - `<Select>` component above wine grid
   - Options: Relevance, Price: Low to High, Price: High to Low, Newest, Available Nearby
   - "Available Nearby" only when location set
   - Syncs with URL search params (`?sort=price_asc`)

3. **Load More pagination:**
   - 12 items per page (cursor-based, `created_at` cursor)
   - "Show More Wines (X remaining)" full-width outline button
   - Spinner on load, staggered fade-in for new cards (50ms delay per card)

4. **Sticky sort + filter bar on mobile:**
   - Contains filter button + sort dropdown
   - Fixed at top on scroll (below top nav)
   - Desktop: sidebar filters remain (existing behavior)

**Acceptance Criteria:**
- [ ] Mobile filter bottom sheet opens with all filter options
- [ ] Filter button shows active count badge
- [ ] Sort dropdown works with URL search params
- [ ] "Available Nearby" sort only appears when location is set
- [ ] Load More button shows with remaining count
- [ ] New wines append with staggered fade-in
- [ ] Sort + filter bar is sticky on mobile scroll
- [ ] Desktop sidebar filters unaffected

---

### STORY 12/07: "Available Near You" Home Feed Section
**Points:** 5 | **Assignee:** fullstack-4

**What:** Add a location-aware section to the home feed showing wines in stock nearby.

**Build:**
1. **"Available Near You" section:**
   - Horizontal scroll of wine cards
   - Header: "Available Near You" with location pill inline
   - Wines sourced from `find_wines_available_nearby` spatial query
   - Sorted by proximity (nearest first)
   - Each card shows nearest retailer name + distance

2. **Edge cases:**
   - No location set: section hidden or shows "Set your location to see nearby wines" CTA
   - No wines nearby: "No wines in stock nearby right now. Check back soon or expand your search radius." with "Expand Search Area" CTA
   - No retailers in radius: "No retailers nearby yet — showing wines from the nearest stores"

3. **Integration:** Insert into Home page between "Discover Producers" and "Popular Near You"

**Acceptance Criteria:**
- [ ] Section displays on home page when location is set
- [ ] Wines sorted by proximity with nearest retailer info
- [ ] Section hidden or shows CTA when no location set
- [ ] Empty state handled gracefully
- [ ] Horizontal scroll with standard card styling

---

### STORY 12/08: Time-First Proximity Display
**Points:** 3 | **Assignee:** fullstack-4

**What:** Update retailer cards and availability displays to show time before distance.

**Build:**
1. **RetailerCard updates:**
   - Primary display: "Ready in ~30 min · 1.2 mi" for pickup
   - Delivery: "Delivery by 4:00 PM · 3.8 mi"
   - Estimated time based on retailer's configured prep time (default 30 min)

2. **Wine card availability:**
   - When showing nearest retailer: "From $XX · ~30 min away"
   - Interpunct separator between data points

3. **Distance formatting:**
   - Miles with one decimal: "1.2 mi" (not "1.20 mi" or "1 mi")
   - Under 0.1 mi: show "< 0.1 mi"

**Acceptance Criteria:**
- [ ] Retailer cards show time before distance
- [ ] Estimated pickup time uses retailer's configured prep time
- [ ] Delivery time shows absolute time estimate
- [ ] Distance formatted with one decimal precision
- [ ] Interpunct separator between time and distance

---

### STORY 12/09: Map Integration for Retailer Discovery (P1)
**Points:** 5 | **Assignee:** fullstack-3

**What:** Add interactive Mapbox map showing nearby retailers.

**Build:**
1. **Mapbox GL JS** via `react-map-gl` (Uber's React wrapper)
2. **Map component:** lazy-loaded via `next/dynamic` to avoid bundle impact
3. **Retailer pins** on map with Cru burgundy markers
4. **Map placement:** inside RetailerSelectionSheet as a toggle view
5. **Map on order tracking:** static Mapbox image (already in STORY 11/01)
6. **Environment variables:** `NEXT_PUBLIC_MAPBOX_TOKEN` for client, `MAPBOX_SECRET_TOKEN` for server

**Acceptance Criteria:**
- [ ] Interactive map renders in RetailerSelectionSheet
- [ ] Retailer pins show on map with correct locations
- [ ] Map lazy-loads (not in initial bundle)
- [ ] Map toggles between list and map view
- [ ] Works on mobile with touch zoom/pan

---

### STORY 12/10: Producer Story Cards in Home Feed (P1)
**Points:** 3 | **Assignee:** fullstack-4

**What:** Add editorial producer story hooks to the home feed for recreational browsing.

**Build:**
1. **Producer story cards** in home feed — 2-3 sentence story hooks with vineyard imagery
2. **"Story of the Week"** featured section with editorial depth
3. **Content sourced** from producer/region structured data (not a separate CMS)
4. **Visual treatment:** wider card format, editorial typography (Playfair Display headlines)

**Acceptance Criteria:**
- [ ] Producer story cards appear in home feed
- [ ] Story of the Week section shows a featured producer
- [ ] Cards link to producer profile page
- [ ] Editorial typography and vineyard imagery

---

## Priority Order

1. **STORY 12/01** (PostGIS infrastructure) — Foundation for everything, build FIRST
2. **STORY 12/02** (Geolocation 3-tier) — Enables all location-aware features
3. **STORY 12/03** (Location-aware browse) — Connects infrastructure to UI
4. **STORY 12/04** (Producer discovery page) — Opens up producer content
5. **STORY 12/06** (Browse mobile UX) — Unblocks real mobile browsing
6. **STORY 12/07** (Available Near You) — Home feed location intelligence
7. **STORY 12/08** (Time-first proximity) — UX refinement across surfaces
8. **STORY 12/05** (Discovery loops) — Keeps users exploring
9. **STORY 12/09** (Map integration) — P1 visual enhancement
10. **STORY 12/10** (Producer stories) — P1 engagement content

**Total points:** 50
**Estimated execution:** 12 person-weeks (3 person-months per engineering review)
**Recommended parallelization:**
- Phase 1 (Weeks 1-3): Stories 12/01 + 12/02 (backend + frontend in parallel)
- Phase 2 (Weeks 3-5): Stories 12/03 + 12/04 + 12/06 (parallel frontend work)
- Phase 3 (Weeks 5-7): Stories 12/05 + 12/07 + 12/08 (UI refinements)
- Phase 4 (Weeks 7-9): Stories 12/09 + 12/10 (P1 features)
