# PRD: Discovery & Proximity

**Feature:** Discovery & Proximity (Geolocation, Producer Browse, Map, Recreational Browsing)
**Priority:** P0 — Launch Critical (RICE: 7,200)
**Author:** Matt Ramey
**Date:** March 14, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Cru's core promise is "discover wine locally" — but without location awareness, the app can't deliver on "locally," and without rich discovery flows, it can't deliver on "discover." Today the platform has wine listings and retailer data, but no mechanism to connect those to the user's physical location, no way to browse producers as first-class entities, and no reason to open the app unless you're actively buying something.

This is a three-part problem:

**Location blindness.** Without knowing where the user is, Cru can't answer the most basic question: "Which of these wines can I actually get today?" Every wine card, every search result, every recommendation is less useful without proximity context. Competitive research shows that Uber Eats and Grubhub both treat location as foundational infrastructure — not a feature, but a prerequisite for every other feature to work.

**Discovery dead ends.** A user who reads a wine's story and wants to explore more — more from that producer, more of that varietal, more from that region — hits a wall. There are no contextual navigation paths that keep the exploration loop alive. Every wine detail page is a terminus. This is the opposite of what drives engagement on content-rich platforms.

**No reason to open the app without buying intent.** Competitive analysis identified this as Cru's highest-leverage differentiation opportunity. Food delivery apps are transactional — users open them when hungry. Wine has beautiful stories, stunning vineyard imagery, and fascinating production processes. An app built around wine discovery should be worth opening for the pleasure of browsing, not just for commerce. If Cru only captures "ready to buy" sessions, it misses 80% of potential engagement and cedes daily mindshare to Instagram and wine blogs.

This PRD addresses all three problems as a unified "discovery and proximity" system. The features are interdependent: location powers "Available Near You," which powers discovery loops, which power recreational browsing, which drives the engagement that eventually converts to purchases.

## 2. Goals

**User Goals:**
- Know which wines are available nearby without thinking about geography — the app just knows where I am
- Browse producers as rich, explorable entities — not just a name on a wine label
- Follow natural exploration paths: discover a wine, explore its producer, find similar wines, discover a new region — never hit a dead end
- Open Cru to learn something interesting about wine, even when not planning to buy
- Understand how quickly I can get a wine, not just how far the store is

**Business Goals:**
- Increase average session duration to 4+ minutes (vs. 2 minutes for transactional-only sessions)
- Achieve 35%+ of sessions as "browse-only" (no purchase) — these users convert at 3x rate on subsequent visits
- Drive 25% of purchases through discovery paths (not direct search) by Month 3
- Increase home feed scroll depth to 3+ sections (indicating engagement with discovery content)
- Position Cru as "the wine app you open to explore" — not "the wine app you open to order"

## 3. Non-Goals

- **Turn-by-turn navigation or driving directions** — Cru links out to native maps apps for directions. We show distance and estimated time, not route guidance.
- **Real-time delivery driver tracking** — Cru doesn't own delivery logistics. Map integration shows retailer locations, not courier positions. Live delivery tracking is a future consideration when delivery partnerships mature.
- **Full CMS or editorial publishing system** — Content discovery (producer stories, regional deep-dives) uses structured data already in the database, not a separate content management system. Editorial workflows are out of scope.
- **International geolocation or multi-country support** — V1 launches in LA (California). Location detection, geocoding, and distance calculations are US-only.
- **Retailer delivery zone drawing/editing** — The retailer dashboard's delivery zone management is covered by PRD-09. This PRD covers the consumer-facing proximity display.
- **Social features on producer pages** — Follow/unfollow, reviews, and community activity on producer profiles are covered by PRD-08 (Social Layer). This PRD builds the browse and discovery surface.

## 4. User Stories

### Explorer (Primary)

- As an Explorer, I want the app to detect my location automatically so that I immediately see wines available near me without entering an address.
- As an Explorer, I want to see "Ready in ~30 min · 1.2 mi" on retailer cards instead of just distance so that I know how quickly I can get a wine.
- As an Explorer, I want to browse a dedicated Producers page so that I can discover winemakers and explore their portfolios.
- As an Explorer, I want to see "More from [Producer]," "More [Varietal] wines," and "More wines from [Region]" links on every wine detail page so that I can keep exploring without hitting a dead end.
- As an Explorer, I want to see a map of nearby retailers that stock a wine I'm interested in so that I can choose the most convenient store.
- As an Explorer, I want the home feed to show "Available Near You" wines so that I can discover what's in stock at local stores right now.
- As an Explorer, I want to read producer stories and regional deep-dives in my browse feed so that the app is interesting even when I'm not buying.

### Enthusiast (Secondary)

- As an Enthusiast, I want to filter producers by region so that I can explore wines from a specific area I'm interested in.
- As an Enthusiast, I want to see a "Story of the Week" feature so that I regularly discover new producers and regions.
- As an Enthusiast, I want to search for producers by name so that I can find a specific winemaker I heard about.

### All Users

- As any user, I want to manually set my location via zip code or address if the app can't detect it automatically so that I still get location-relevant results.
- As any user, I want to change my location from settings at any time so that I can browse wines near a different address (e.g., my office vs. home).
- As any user, I want mobile filter controls to appear as a bottom sheet (not a full page) so that I don't lose my scroll position while refining results.
- As any user, I want to sort browse results by "Available Nearby" so that I see wines I can get most easily first.

### Edge Cases

- As a user who denies browser location permission, I want a non-intrusive fallback (IP-based approximate location) with a clear way to enter my address manually so that the app still works without being pushy about permissions.
- As a user in a location with no nearby retailers (>25 miles), I want to see a helpful message like "No retailers nearby yet — showing wines from the nearest stores" instead of an empty page so that I'm not dead-ended.
- As a user on a slow mobile connection, I want map components to lazy-load so that the page is usable before the map finishes rendering.
- As a user searching for a producer with no wines currently in stock nearby, I want to see their full profile with a "Notify me when available nearby" option so that I'm not frustrated by empty states.

## 5. Requirements

### Must-Have (P0)

**Geolocation & Location Detection**
- Three-tier location fallback: (1) Browser Geolocation API (primary, on explicit user action), (2) IP-based via MaxMind GeoLite2 or ipapi.co (automatic fallback), (3) Manual address/zip entry via Mapbox Geocoding API (always available)
- Location persisted in cookie (lat/lng only, for SSR) and localStorage (full location object including display name and accuracy level)
- Location picker component in user settings and onboarding flow
- Persistent location indicator in browse UI: "Wines near Silver Lake" or "Wines near 90026"
- "Change location" affordance always accessible from the location indicator
- Default proximity radius: 25 miles (configurable in user settings)
- PostGIS spatial queries on retailers table for distance calculation and radius filtering
- Acceptance criteria:
  - Given a user grants browser location permission, when the home page loads, then wines and retailers are sorted/filtered by proximity to their detected location
  - Given a user denies location permission, when the app falls back to IP detection, then the location indicator shows the approximate city and results reflect that area
  - Given a user enters a zip code manually, when they submit, then the location updates and all proximity-aware sections refresh

**Time-First Proximity Display**
- Retailer cards show estimated pickup readiness time as primary proximity signal: "Ready in ~30 min · 1.2 mi"
- Estimated pickup time calculated as: retailer's configured prep time (default 30 min if not set) displayed alongside distance
- Delivery time shown when delivery is available: "Delivery by 4:00 PM · 3.8 mi"
- Distance displayed in miles with one decimal precision (e.g., "1.2 mi"), formatted as secondary to time
- Wine cards in "Available Near You" sections show nearest retailer with time-first format
- Acceptance criteria:
  - Given a retailer has a 45-minute configured prep time and is 2.3 miles from the user, when their card is displayed, then it reads "Ready in ~45 min · 2.3 mi"
  - Given a retailer is 0.3 miles away, when distance is displayed, then it shows "0.3 mi" (not "0 mi" or "0.30 mi")

**Producer Discovery Flow**
- `/producers` browse page with grid of ProducerCards (producer image, name, region, wine count)
- "Producers" link in TopNav (desktop) and bottom navigation or hamburger menu (mobile)
- Producer search: text search by producer name on the `/producers` page
- Region filter on `/producers` page: horizontal scrollable pills for wine regions
- Each ProducerCard links to the existing producer profile page (`/producers/[slug]`)
- Producer cards enhanced with richer display: hero image, short tagline/description, region badge, number of wines available nearby
- `/wines` Browse tab enhanced with a "Producers" sub-section or toggle to browse by producer
- Acceptance criteria:
  - Given a user navigates to `/producers`, when the page loads, then a grid of producer cards is displayed sorted by relevance (producers with nearby availability first)
  - Given a user types "dom" in the producer search, when results appear, then producers with names containing "dom" are shown (e.g., "Domaine Tempier")
  - Given a user taps a region pill "Provence," when the filter is applied, then only producers from Provence are displayed

**Discovery Loop Links**
- Wine Detail page includes contextual "More like this" sections:
  - "More from [Producer Name]" — horizontal scroll of other wines by the same producer
  - "More [Varietal] wines" — horizontal scroll of wines of the same varietal
  - "More wines from [Region]" — horizontal scroll of wines from the same region
- Producer Profile page includes:
  - "Browse [Region] wines" — link to filtered browse page for the producer's region
- All discovery links lead to filtered views of the existing browse page (not separate pages)
- Discovery sections show a maximum of 8 wines per row with a "See all" link
- Acceptance criteria:
  - Given a user is viewing a Pinot Noir from Willamette Valley by Domaine Drouhin, when they scroll below the wine details, then they see "More from Domaine Drouhin," "More Pinot Noir wines," and "More wines from Willamette Valley" sections
  - Given a user taps "See all" on "More Pinot Noir wines," when the browse page loads, then it is pre-filtered to show only Pinot Noir wines

**Browse Page Mobile UX**
- Mobile filter bottom sheet triggered by a "Filters" button with active count badge (e.g., "Filters (2)")
- Bottom sheet opens at ~60% screen height, draggable to full screen, dismissible by swipe-down
- Sort dropdown with options: Relevance (default), Price: Low to High, Price: High to Low, Newest, Available Nearby
- "Available Nearby" sort option only appears when user location is set
- "Load More" button at bottom of results with remaining count (e.g., "Load More (47 remaining)")
- Sticky sort + filter bar on mobile scroll (stays fixed at top as user scrolls results)
- Acceptance criteria:
  - Given a user has applied 2 filters (Red wine, Under $30), when they view the filter button, then it reads "Filters (2)"
  - Given a user is on mobile and scrolls down the wine list, when the sort/filter bar reaches the top, then it sticks and remains visible
  - Given a user taps "Load More" when 47 results remain, when the next batch loads, then the button updates to show the new remaining count

**"Available Near You" Intelligence**
- Home feed section: "Available Near You" — wines in stock at retailers within the user's radius, sorted by proximity
- Browse results support "Available Nearby" sort option, which orders wines by nearest retailer distance
- Wine cards show availability count when relevant: "Available at 3 nearby stores"
- Powered by PostGIS spatial queries joining retailer inventory with retailer location data
- When no wines are available nearby: show a helpful message with the nearest available retailer's distance
- Acceptance criteria:
  - Given a user with location set has 12 wines available within 10 miles, when the home feed loads, then the "Available Near You" section shows these wines sorted by distance
  - Given a wine is in stock at 3 retailers within 25 miles, when the wine card is displayed, then it shows "Available at 3 nearby stores"

**Technical Requirements**
- PostGIS extension enabled on Supabase (already available by default)
- `location GEOGRAPHY(POINT, 4326)` column on `retailers` table with GIST spatial index
- `find_nearby_retailers(user_lat, user_lng, radius_miles)` PostgreSQL function returning retailers sorted by distance
- `find_wines_available_nearby(user_lat, user_lng, radius_miles)` PostgreSQL function joining retailer inventory with spatial queries
- Geolocation utilities in `lib/geo/location.ts`: `getBrowserLocation()`, `getIPLocation()`, `geocodeAddress()`
- Location persistence in `lib/geo/location-store.ts`: cookie + localStorage read/write
- DAL functions in `lib/dal/retailers.ts`: `findNearbyRetailers()`, `findWinesAvailableNearby()`
- DAL functions in `lib/dal/producers.ts`: `getProducers()`, `getProducersByRegion()`, `searchProducers()`
- Server Actions in `lib/actions/location-actions.ts`: `setUserLocation()` (Zod validate, persist, revalidatePath)
- Mapbox Geocoding API for address autocomplete and reverse geocoding (address/zip to lat/lng)
- All new pages need `loading.tsx` (skeleton states) and `error.tsx` (error boundaries)

### Nice-to-Have (P1)

- **Map Integration for Retailer Discovery** — Mapbox GL JS map showing nearby retailers that stock a specific wine. Map embedded in retailer selection sheet. Lazy-loaded via `next/dynamic` to avoid bundle impact. Map on order tracking page (static image for pickup, interactive for future delivery). Uses `react-map-gl` (Uber's official Mapbox React wrapper).
- **Producer story cards in home feed** — 2-3 sentence story hooks with compelling vineyard photography, integrated into the browse feed alongside purchasable wines. "Story of the Week" featured section with editorial depth.
- **Regional deep-dives** — "This week: explore the wines of Bandol" with educational content woven into the browsable experience. Content sourced from producer/region structured data, not a separate CMS.
- **Animated transitions for discovery loops** — When navigating between discovery links (wine to producer, wine to varietal), use shared element transitions (200-350ms, per UX research on wine's "considered" browsing pace).
- **"Trending in [Neighborhood]"** — Social proof signals adapted for wine: locality-based trending rather than raw popularity counts. "Trending in Silver Lake" rather than "1,200 people ordered this."
- **Smart empty states for new regions** — When Cru expands to a new city, show "We're building our network in [City]. Want to be notified when we launch?" with email capture.

### Future Considerations (P2)

- **Retailer delivery zone visualization on map** — Consumer-facing map overlay showing which areas a retailer delivers to. Requires retailer-drawn delivery zones (PRD-09 scope).
- **Live delivery tracking on map** — Real-time courier position when delivery partnerships support GPS sharing.
- **Location-based push notifications** — "You're near Silver Lake Wine Co. — your wishlisted Bandol Rose is in stock!" Requires geofencing and push notification infrastructure.
- **Producer "virtual visits"** — Video or 360-degree vineyard tours linked from producer profiles.
- **Wine region map explorer** — Interactive map where users tap wine regions (Bordeaux, Willamette Valley, Barossa) to explore wines from that area. A content-rich discovery surface.
- **Personalized proximity radius** — Machine-learned radius per user based on their actual pickup/delivery patterns (city users: 3 miles, suburban users: 15 miles).

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Location detection rate | 70% of sessions have a resolved location (any tier) | 80% | Analytics: location_set events by source |
| Producer page visits | 15% of sessions include a `/producers` page view | 20% | Page analytics |
| Discovery loop engagement | 25% of wine detail page views result in a discovery link tap | 35% | Click events on "More from..." sections |
| Browse session depth | 3+ sections scrolled on home feed per session | 4+ | Scroll depth analytics |
| "Available Near You" tap rate | 20% of home feed sessions tap into an "Available Near You" wine | 30% | Section interaction events |
| Mobile filter usage | 40% of mobile browse sessions use the filter bottom sheet | 50% | Filter open/apply events |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Average session duration | 4 minutes | 5 minutes | Session analytics |
| Browse-only session rate | 35% of sessions have no purchase | 40% | Session classification |
| Discovery-driven purchases | 25% of purchases reached via discovery loop (not direct search) | 35% | Attribution analytics |
| Return visit rate (7-day) | 40% of users return within 7 days | 50% | Cohort analysis |
| Producer page to wine purchase conversion | 8% of producer page visits lead to a purchase within session | 12% | Funnel analytics |
| "Available Nearby" sort usage | 30% of browse sessions use "Available Nearby" sort | 40% | Sort selection events |

## 7. Open Questions

- **[Engineering — non-blocking]** MaxMind GeoLite2 vs. ipapi.co for IP-based fallback: MaxMind requires self-hosting the database (higher accuracy, no per-request cost) vs. ipapi.co (easier setup, 1000 free requests/day). Decision can be made during implementation. Start with ipapi.co for development, plan MaxMind for production.
- **[Product — non-blocking]** Default proximity radius: 25 miles is proposed as the default. For LA (sprawling, car-centric), this feels right. For future dense urban markets (NYC, SF), 5-10 miles may be more appropriate. Should the default be market-specific from launch, or start with 25 and adjust?
- **[Product — non-blocking]** Producer browse sort order: "Relevance" sort for producers should factor in nearby availability (producers with wines in stock locally rank higher). Should it also factor in user taste profile data (producers aligned with preferences rank higher)? This creates a dependency on PRD-03 and PRD-07.
- **[Design — non-blocking]** Map component placement: Should the retailer map appear (a) inline on the wine detail page, (b) inside the retailer selection bottom sheet, or (c) on a dedicated "Nearby Stores" tab? Competitive research suggests (b) is the lowest-friction option. UX designer should prototype and validate.
- **[Content — non-blocking]** Producer story cards and "Story of the Week" require editorial content. Is this sourced from producer onboarding data (automated), created by Cru's editorial team (manual), or AI-generated from producer metadata (hybrid)? This affects the content pipeline timeline.
- **[Legal — non-blocking]** Does displaying retailer locations on a map require any retailer consent beyond the existing marketplace agreement? Likely no, but worth confirming with legal.

## 8. RICE Score

| Factor | Value | Reasoning |
|--------|-------|-----------|
| **Reach** | 90% | Every user benefits from location-aware results and discovery loops. Location is foundational infrastructure. |
| **Impact** | 3 (High) | Transforms Cru from a transactional app to a discovery platform. Directly enables the "wine app you open to explore" positioning. |
| **Confidence** | 80% | Three-tier geolocation is well-proven (Uber Eats, Grubhub both use it). PostGIS is production-ready on Supabase. Discovery loops are a standard content platform pattern. Map integration has clear library choice (Mapbox GL JS). Main risk: content quality for recreational browsing depends on producer data richness. |
| **Effort** | 3 person-months | Geolocation infrastructure (0.5 mo), PostGIS queries + DAL (0.5 mo), Producer browse pages (0.5 mo), Discovery loop links (0.25 mo), Browse mobile UX (0.5 mo), Available Near You intelligence (0.5 mo), Map integration P1 (0.25 mo). |
| **RICE Score** | **7,200** | (90 x 3 x 0.8) / 3 = 72, scaled to 7,200 for consistency with existing PRD scoring |

## 9. Timeline Considerations

- **Build order: #12** — Depends on core platform infrastructure being in place. Can be parallelized with commerce features.
- **Hard dependencies:** User Accounts (PRD-01) for location persistence in user profile. Search & Browse (PRD-02) for the browse page that discovery loops link into. Local Retailer Integration (PRD-06) for retailer location data and inventory feeds. Producer Storytelling (PRD-04) for producer profile pages that the producer browse flow links to.
- **Soft dependencies:** Taste Profile Onboarding (PRD-03) for personalized producer sorting. AI Curation Engine (PRD-07) for "Available Near You" ranking intelligence beyond pure proximity.
- **External dependencies:** Mapbox API key and account setup. MaxMind GeoLite2 database download (for production IP geolocation). Retailer geocoded addresses (lat/lng) — may need a one-time geocoding batch job during retailer onboarding.
- **Downstream dependents:** Order Placement (PRD-05) benefits from location-aware retailer selection. Social Layer (PRD-08) benefits from producer browse pages as surfaces for social interactions.
