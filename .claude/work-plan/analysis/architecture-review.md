# Architecture Review: Cru Wine Marketplace

**Status:** Checkpoint 1 -- Architecture Review
**Author:** System Architect (claude/architect agent)
**Date:** 2026-03-07
**Scope:** All 9 P0 PRDs reviewed against System Architecture, E-Commerce Module, and Integrations Module

---

## Table of Contents

1. [Architecture Coverage Validation](#1-architecture-coverage-validation)
2. [Schema Completeness Review](#2-schema-completeness-review)
3. [API Contract Review](#3-api-contract-review)
4. [Integration Feasibility](#4-integration-feasibility)
5. [Medusa Module Mapping](#5-medusa-module-mapping)
6. [Architecture Decision Records](#6-architecture-decision-records)
7. [Risk Assessment and Gaps Summary](#7-risk-assessment-and-gaps-summary)

---

## 1. Architecture Coverage Validation

### Coverage Matrix

For each PRD, every P0 (Must-Have) requirement is mapped to its corresponding architecture component and evaluated for coverage status.

#### PRD-01: User Accounts and Preferences (RICE 10,000)

| PRD Requirement | Architecture Component | Status |
|---|---|---|
| Email + password signup/login | SYSTEM_ARCHITECTURE Section 5 (Supabase Auth) | **Covered** |
| Google OAuth 2.0 and Apple Sign-In | SYSTEM_ARCHITECTURE Section 5 (Social OAuth) | **Covered** |
| Password reset via email | Supabase Auth built-in | **Covered** |
| Session persistence via cookies | SYSTEM_ARCHITECTURE Section 5 (`@supabase/ssr`) | **Covered** |
| Age gate checkbox at signup | MODULE_ECOMMERCE Section 10 (Layer 1 self-declaration) | **Covered** |
| Location capture (zip/geolocation) | No architecture component defined | **Gap** |
| Default price range selector | No architecture component defined | **Gap** |
| Occasion/interest tags | No architecture component defined | **Gap** |
| Preferences stored in user profile | PRD references `user_preferences` table; not in SYSTEM_ARCHITECTURE schema | **Gap** |
| View and edit profile | SYSTEM_ARCHITECTURE Section 4 (`profiles` table) | **Partial** -- profiles table exists but lacks preference columns |
| Wishlist (add/remove/view/sort) | PRD references `wishlists`, `wishlist_items` tables; not in architecture | **Gap** |
| Notification preferences | No architecture component defined | **Gap** |
| Account deletion (CCPA) | No architecture component defined | **Gap** |
| `users` table with org_id and RLS | SYSTEM_ARCHITECTURE Section 4 (`profiles` table) | **Partial** -- profiles table does NOT have org_id |
| DAL in `lib/dal/users.ts` | SYSTEM_ARCHITECTURE Section 7 (DAL pattern) | **Covered** (pattern defined, file not yet specified) |
| Server Actions in `lib/actions/auth.ts`, `lib/actions/preferences.ts` | SYSTEM_ARCHITECTURE Section 6 (Server Action pattern) | **Covered** (pattern defined) |

**Key Gaps for PRD-01:**
- The `profiles` table in SYSTEM_ARCHITECTURE lacks `org_id`. This is a fundamental tension: profiles extend `auth.users` and are user-level, not org-level. The PRD requires `org_id` on user-facing tables, but a user profile naturally spans multiple orgs. This needs an ADR (see Section 6).
- No schema defined for `user_preferences`, `wishlists`, or `wishlist_items` tables.
- No architecture coverage for notification preferences storage.
- No account deletion workflow defined.

#### PRD-02: Search and Browse (RICE 7,500)

| PRD Requirement | Architecture Component | Status |
|---|---|---|
| Browse by Region with sub-regions | Wine catalog in MODULE_ECOMMERCE Section 6; Meilisearch in MODULE_INTEGRATIONS Section 3 | **Partial** -- data model has region field but no hierarchical region taxonomy table |
| Browse by Varietal with descriptions | Wine catalog data model has varietal field | **Partial** -- no description field for varietal metadata |
| Browse by Occasion/Mood | PRD references `wine_occasions` table; not in architecture | **Gap** |
| Browse by Producer | `producers` table from PRD-04; not in architecture schema | **Gap** (addressed by PRD-04 architecture) |
| Browse by "New on Cru" | Sortable by `created_at` | **Covered** |
| Keyword search across wine metadata | MODULE_INTEGRATIONS Section 3 (Meilisearch) | **Covered** |
| Autocomplete suggestions (300ms) | Meilisearch InstantSearch | **Covered** |
| Search results with filter controls | Meilisearch faceted search | **Covered** |
| Recent searches per user (last 10) | No architecture component defined | **Gap** |
| Price range filter | Meilisearch filterable attributes | **Covered** |
| Varietal multi-select filter | Meilisearch filterable attributes | **Covered** |
| Region multi-select with sub-regions | Meilisearch filterable attributes | **Partial** -- no hierarchical region model |
| Available nearby toggle | Requires PostGIS + retailer_inventory join | **Partial** -- PostGIS mentioned in PRD-06 but not fully designed for search integration |
| Producer attributes filter | Wine catalog `is_organic`, `is_biodynamic` | **Partial** -- women-owned, BIPOC-owned attributes not in wine_details model |
| Wine Card display | No component architecture defined | **Covered** (frontend concern, pattern exists) |
| PostgreSQL full-text search | SYSTEM_ARCHITECTURE + MODULE_INTEGRATIONS Section 3 | **Covered** (with Meilisearch as primary) |
| SEO-indexable browse pages | Next.js App Router static generation | **Covered** |
| `wines`, `wine_tags`, `wine_occasions` tables | Only `wine_details` in MODULE_ECOMMERCE; no tags/occasions | **Gap** |
| DAL in `lib/dal/wines.ts`, `lib/dal/search.ts` | DAL pattern defined | **Covered** (pattern) |

**Key Gaps for PRD-02:**
- No `wine_tags` or `wine_occasions` tables in any architecture doc.
- No hierarchical region/sub-region taxonomy table.
- No varietal metadata table (for plain-language descriptions).
- No recent searches storage mechanism.
- The "available nearby" toggle requires cross-system query (Supabase retailer_inventory + PostGIS + Meilisearch product index). This integration point is underspecified.
- Producer attributes (women-owned, BIPOC-owned) not in the Medusa `wine_details` model.

#### PRD-03: Taste Profile Onboarding (RICE 6,000)

| PRD Requirement | Architecture Component | Status |
|---|---|---|
| 5-screen onboarding flow | Frontend concern -- pattern exists | **Covered** |
| Flavor affinity tag selection | No architecture for tag taxonomy | **Gap** |
| Flavor aversion selection | No architecture for aversion taxonomy | **Gap** |
| Drinking context selection | No architecture defined | **Gap** |
| Adventurousness scale (1-3) | No architecture defined | **Gap** |
| Profile summary generation | No template engine defined | **Gap** |
| "Wines I've Loved" autocomplete | Requires search against wine DB | **Covered** (via Meilisearch) |
| `taste_profiles` table | PRD specifies schema; not in architecture docs | **Gap** |
| `taste_profile_wines` table | PRD specifies schema; not in architecture docs | **Gap** |
| DAL in `lib/dal/taste-profiles.ts` | DAL pattern defined | **Covered** (pattern) |
| Server Actions in `lib/actions/taste-profile.ts` | Server Action pattern defined | **Covered** (pattern) |

**Key Gaps for PRD-03:**
- No schema for `taste_profiles` or `taste_profile_wines` in architecture docs. The PRD provides the schema, which is good, but it has not been validated against the architecture.
- No flavor tag taxonomy defined (the set of valid tags, their categories, and how they map to wine attributes).
- No architecture for the rules-based profile summary template system.

#### PRD-04: Producer Storytelling (RICE 6,000)

| PRD Requirement | Architecture Component | Status |
|---|---|---|
| Producer profile page (hero, story, facts, portfolio, gallery) | No architecture defined; PRD provides table schemas | **Gap** |
| Wine detail page | MODULE_ECOMMERCE Section 12 (PDP pattern) | **Partial** -- Medusa PDP exists but doesn't match PRD layout |
| `producers` table | PRD defines schema; not in architecture | **Gap** |
| `producer_photos` table | PRD defines schema; not in architecture | **Gap** |
| `wines` table (Supabase-side) | PRD defines schema; not in architecture | **Gap** -- key tension with Medusa wine_details |
| Rich text story content | No storage format decided | **Gap** (flagged in PRD-04 Section 7) |
| Farming practices (JSONB) | MODULE_ECOMMERCE wine_details has `is_organic`, `is_biodynamic` booleans | **Partial** -- PRD wants JSONB array, architecture has individual booleans |
| Food pairings (JSONB) | Not in MODULE_ECOMMERCE wine_details | **Gap** |
| Flavor profile (JSONB for taste matching) | Not in MODULE_ECOMMERCE wine_details | **Gap** |
| SEO: structured data, OG tags | Next.js `generateMetadata()` pattern | **Covered** |
| DAL in `lib/dal/producers.ts`, `lib/dal/wines.ts` | DAL pattern | **Covered** (pattern) |

**Key Gaps for PRD-04:**
- **Critical:** PRD-04 defines `producers` and `wines` tables in Supabase, but MODULE_ECOMMERCE defines `wine_details` as a Medusa module linked to Medusa Product. This creates a dual-store problem: are producers and wines Supabase entities or Medusa entities? This is the single most important architectural decision to resolve before implementation (see ADR-002 in Section 6).
- No `flavor_profile` JSONB field exists in the Medusa `wine_details` model. This field is critical for taste matching in PRD-07.
- No `food_pairings` JSONB field in any architecture.
- Rich text storage format undecided.

#### PRD-05: Order Placement (RICE 5,400)

| PRD Requirement | Architecture Component | Status |
|---|---|---|
| Wine-to-cart flow with retailer selection | MODULE_ECOMMERCE Section 12 (cart actions) | **Partial** -- Medusa cart exists but retailer-scoped cart is not defined |
| Cart supports multiple wines per retailer | Medusa cart management | **Partial** -- Medusa cart is vendor-scoped per marketplace module, but the retailer-as-vendor mapping needs definition |
| Fulfillment selection (pickup/delivery) | MODULE_ECOMMERCE Section 9 (Delivery Zone module) | **Covered** |
| Order summary with itemized total | Medusa checkout | **Covered** |
| Payment via Stripe Checkout | MODULE_ECOMMERCE Section 11 (Stripe via Medusa) | **Covered** |
| Order lifecycle (pending > confirmed > ready > completed) | MODULE_ECOMMERCE Medusa order module | **Partial** -- Medusa has its own order statuses; PRD defines custom statuses |
| Retailer notification on order | MODULE_INTEGRATIONS Section 10 (Resend email) | **Covered** (integration exists) |
| User email confirmation | MODULE_INTEGRATIONS Section 10 (Resend) | **Covered** |
| Order history view | Medusa order history | **Covered** |
| `orders`, `order_items`, `order_status_history` tables | Medusa manages orders internally | **Partial** -- tension between Medusa-managed orders and Supabase-stored order tables |
| Inventory hold (10 min) | Medusa inventory module | **Covered** (native feature) |
| Stripe webhook handler | SYSTEM_ARCHITECTURE Section 6 (webhook pattern) | **Covered** |
| DAL in `lib/dal/orders.ts`, `lib/dal/cart.ts` | DAL pattern + Medusa storefront helpers | **Covered** |

**Key Gaps for PRD-05:**
- Retailer-scoped cart model needs explicit design. Medusa's marketplace module supports vendor-scoped orders, but PRD-05's model (user selects retailer, then adds wines to that retailer's cart) differs from a traditional multi-vendor marketplace.
- Order status lifecycle in PRD differs from Medusa's default. Custom statuses (ready_for_pickup, out_for_delivery) need mapping.
- The question of whether orders are Medusa-primary or Supabase-primary needs resolution (related to ADR-002).

#### PRD-06: Local Retailer Integration (RICE 4,000)

| PRD Requirement | Architecture Component | Status |
|---|---|---|
| Retailer signup form | No architecture defined | **Gap** |
| CSV import with mapping tool | No architecture defined | **Gap** |
| Wine fuzzy matching algorithm | No architecture defined | **Gap** |
| Manual review interface | No architecture defined | **Gap** |
| `retailer_inventory` table | PRD defines schema; not in architecture | **Gap** |
| `retailers` table | PRD defines schema; not in architecture | **Gap** |
| Location-based queries (PostGIS) | MODULE_INTEGRATIONS mentions PostGIS conceptually | **Partial** -- no PostGIS schema, indexes, or query patterns defined |
| Lightspeed API integration | MODULE_INTEGRATIONS does not cover POS integrations | **Gap** |
| Square API integration | MODULE_INTEGRATIONS does not cover POS integrations | **Gap** |
| Availability display API | PRD defines `GET /api/v1/inventory/check` | **Gap** -- not in architecture |
| DAL in `lib/dal/retailers.ts`, `lib/dal/inventory.ts` | DAL pattern | **Covered** (pattern) |

**Key Gaps for PRD-06:**
- **Critical:** The entire retailer integration layer (retailers table, inventory table, CSV import, wine matching, POS sync) has no architecture coverage. MODULE_INTEGRATIONS covers third-party services like DoorDash and Meilisearch but completely omits POS system integrations (Lightspeed, Square), which are central to PRD-06.
- PostGIS is mentioned but not designed: no extension enablement, no geography columns, no spatial indexes, no query patterns.
- No fuzzy matching algorithm architecture (even conceptual).
- The relationship between Supabase `retailers` table and Medusa `vendor` entity is undefined.

#### PRD-07: AI + Human Curation Engine (RICE 6,000)

| PRD Requirement | Architecture Component | Status |
|---|---|---|
| Rules-based matching engine | MODULE_INTEGRATIONS Section 14 (Preferabli) | **Partial** -- architecture suggests external service; PRD wants custom rules engine |
| Scoring formula (weighted sum) | No architecture defined | **Gap** |
| Recommendation explanations (templates) | No architecture defined | **Gap** |
| `curated_collections` table | PRD defines schema; not in architecture | **Gap** |
| `curated_collection_items` table | PRD defines schema; not in architecture | **Gap** |
| `recommendation_events` table | PRD defines schema; not in architecture | **Gap** |
| Home screen sections (Picked for You, Collections, Popular Near You) | Frontend concern | **Covered** (pattern) |
| Caching for per-user recommendations | SYSTEM_ARCHITECTURE mentions `unstable_cache`; no Redis/caching architecture | **Partial** |
| DAL in `lib/dal/curation.ts`, `lib/dal/collections.ts`, `lib/dal/recommendation-events.ts` | DAL pattern | **Covered** (pattern) |
| Server Action in `lib/actions/curation.ts` | Server Action pattern | **Covered** (pattern) |
| Engine latency < 500ms | No performance architecture | **Gap** |

**Key Gaps for PRD-07:**
- The architecture suggests Preferabli (external recommendation API) in MODULE_INTEGRATIONS Section 14, but PRD-07 explicitly designs a custom rules-based engine. These are contradictory approaches that need reconciliation. The PRD's approach (custom rules engine for V1, ML later) is correct per the product roadmap, but the architecture doc needs to reflect this.
- No caching architecture for per-user recommendation results. The PRD mentions per-user cache keys with 1-hour TTL but no backing store (Redis, Vercel KV, Next.js cache) is chosen.
- No schema for curation tables in architecture docs.

#### PRD-08: Social/Community Layer (RICE 4,200)

| PRD Requirement | Architecture Component | Status |
|---|---|---|
| Share button (Web Share API) | No architecture defined | **Gap** (frontend concern, minimal arch needed) |
| Share URL format with OG tags | Next.js `generateMetadata()` | **Covered** |
| UTM parameter tracking | No architecture defined | **Gap** (minimal) |
| `follows` table | PRD defines schema; not in architecture | **Gap** |
| `share_events` table | PRD defines schema; not in architecture | **Gap** |
| User profile page (`/users/[username]`) | No architecture defined | **Gap** |
| Privacy toggle (public/private) | No architecture defined | **Gap** |
| Follow/unfollow optimistic UI | Client component pattern | **Covered** (pattern) |
| DAL in `lib/dal/follows.ts`, `lib/dal/shares.ts` | DAL pattern | **Covered** (pattern) |
| Server Actions in `lib/actions/follows.ts`, `lib/actions/shares.ts` | Server Action pattern | **Covered** (pattern) |

**Key Gaps for PRD-08:**
- No schema for `follows` or `share_events` tables in architecture docs.
- Public user profiles at `/users/[username]` require a `username` field on the `profiles` table, which doesn't exist in SYSTEM_ARCHITECTURE.
- Privacy controls (public/private profiles) not architecturally addressed.

#### PRD-09: Retailer Dashboard (RICE 27)

| PRD Requirement | Architecture Component | Status |
|---|---|---|
| Order management queue | MODULE_ECOMMERCE marketplace module (vendor orders) | **Partial** -- Medusa vendor portal exists conceptually but retailer-specific UX not designed |
| Order status transitions | Medusa order module + custom statuses | **Partial** |
| Inventory health monitor | Depends on PRD-06 inventory tables | **Gap** (depends on PRD-06 gap) |
| Quick stock update | No architecture defined | **Gap** |
| Basic analytics (top wines, order summary, views) | No analytics architecture defined | **Gap** |
| Retailer settings | No architecture defined | **Gap** |
| `retailer_members` table | PRD defines; not in architecture | **Gap** |
| Retailer auth (retailer role) | PRD suggests `retailer` role in org membership | **Partial** -- `member_role` enum has owner/admin/member/viewer but no retailer |
| SLA indicator (order pending time) | No architecture defined | **Gap** |
| Email notifications for status changes | MODULE_INTEGRATIONS Section 10 (Resend) | **Covered** |
| Materialized views for analytics | No architecture defined | **Gap** |
| DAL in `lib/dal/retailer-dashboard.ts` | DAL pattern | **Covered** (pattern) |
| Server Actions in `lib/actions/retailer-orders.ts` | Server Action pattern | **Covered** (pattern) |

**Key Gaps for PRD-09:**
- The retailer auth model is not reconciled with the core architecture. The `member_role` enum lacks a `retailer` role. PRD-09 suggests retailers are users with a retailer role in the org membership, but this conflates consumer and retailer identities.
- No analytics architecture for dashboard metrics (materialized views, aggregation queries).
- The relationship between Medusa vendor portal and Supabase-based retailer dashboard is unclear.

### Dead Architecture (Components Without PRD References)

| Architecture Component | Document | Status |
|---|---|---|
| Auction and Bidding Module | MODULE_ECOMMERCE Section 7 | **Not needed for P0** -- Auctions are P1 |
| Trading Module (P2P) | MODULE_ECOMMERCE Section 8 | **Not needed for P0** -- Trading is P1 |
| Wine-Searcher API | MODULE_INTEGRATIONS Section 2 | **Not needed for P0** -- No PRD references market pricing |
| Liv-ex API | MODULE_INTEGRATIONS Section 2 | **Not needed for P0** -- Fine wine trading is P1+ |
| DoorDash Drive | MODULE_INTEGRATIONS Section 6 | **Not needed for P0** -- PRD-05 says retailers manage their own delivery |
| Uber Direct | MODULE_INTEGRATIONS Section 6 | **Not needed for P0** -- Same as above |
| Wineshipping (3PL) | MODULE_INTEGRATIONS Section 7 | **Not needed for P0** -- LA-only, retailer-fulfilled |
| AfterShip | MODULE_INTEGRATIONS Section 8 | **Not needed for P0** -- Basic order tracking only |
| Yotpo (Reviews) | MODULE_INTEGRATIONS Section 12 | **Not needed for P0** -- No UGC at launch |
| API4AI Label Recognition | MODULE_INTEGRATIONS Section 13 | **Not needed for P0** -- P1 feature |
| Preferabli | MODULE_INTEGRATIONS Section 14 | **Not needed for P0** -- Custom rules engine replaces this |
| Cabrella Insurance | MODULE_INTEGRATIONS Section 15 | **Not needed for P0** -- LA local only |
| Twilio SMS | MODULE_INTEGRATIONS Section 10 | **Not needed for P0** -- Email only at launch |
| Avalara Tax | MODULE_INTEGRATIONS Section 5 | **Questionable** -- May be needed for order tax calc |
| Sovos ShipCompliant | MODULE_INTEGRATIONS Section 5 | **Not needed for P0** -- LA-only at launch, CA-compliant |

**Assessment:** MODULE_ECOMMERCE and MODULE_INTEGRATIONS are designed for the full product vision (P0 through P3). This is reasonable forward-looking architecture, but it means significant portions are not relevant for the P0 sprint. The development team should focus exclusively on the P0-relevant components and not implement P1+ modules prematurely.

---

## 2. Schema Completeness Review

### Tables Referenced in PRDs vs. Architecture

#### Tables Defined in SYSTEM_ARCHITECTURE

| Table | org_id | RLS | updated_at | Primary Key | Notes |
|---|---|---|---|---|---|
| `organizations` | N/A (is the org) | Implicit | Yes | UUID | Complete |
| `profiles` | **NO** | Needs design | Yes | UUID (FK to auth.users) | Missing org_id -- see ADR below |
| `memberships` | Yes | Standard pattern | No (`joined_at` only) | UUID | Missing `updated_at` trigger |
| `invitations` | Yes | Implicit | No (`created_at` only) | UUID | Missing `updated_at` |

#### Tables Referenced in PRDs but NOT in Architecture

| Table | PRD Source | org_id | Key Columns | Status |
|---|---|---|---|---|
| `user_preferences` | PRD-01 Section 5 | Required | user_id, location_zip, price_range, occasion_tags (JSONB), notification_prefs (JSONB) | **Schema needed** |
| `wishlists` | PRD-01 Section 5 | Required | user_id, name | **Schema needed** |
| `wishlist_items` | PRD-01 Section 5 | Required | wishlist_id, wine_id, added_at | **Schema needed** |
| `wines` | PRD-04 Section 5 | Required | producer_id, name, vintage, varietal, region, appellation, tasting_description, food_pairings (JSONB), flavor_profile (JSONB), slug | **Schema needed** -- conflicts with Medusa wine_details |
| `producers` | PRD-04 Section 5 | Required | name, slug, region, country, tagline, story_content, farming_practices (JSONB), vineyard_size, year_established, annual_production, hero_image_url | **Schema needed** |
| `producer_photos` | PRD-04 Section 5 | Required | producer_id, image_url, caption, display_order | **Schema needed** |
| `wine_tags` | PRD-02 Section 5 | Required | wine_id, tag_name | **Schema needed** |
| `wine_occasions` | PRD-02 Section 5 | Required | wine_id, occasion_name | **Schema needed** |
| `taste_profiles` | PRD-03 Section 5 | Required | user_id, flavor_affinities (JSONB), flavor_aversions (JSONB), drinking_contexts (JSONB), adventurousness_score (int), profile_version (int) | **Schema needed** |
| `taste_profile_wines` | PRD-03 Section 5 | Required | user_id, wine_id, source (enum) | **Schema needed** |
| `retailers` | PRD-06 Section 5 | Required | name, slug, address, city, state, zip, latitude, longitude, phone, email, pos_type, fulfillment_capabilities (JSONB), delivery_radius_miles, commission_rate | **Schema needed** |
| `retailer_inventory` | PRD-06 Section 5 | Required | retailer_id, wine_id, price (decimal), quantity (int), stock_status (enum), last_synced_at, sync_source (enum) | **Schema needed** |
| `curated_collections` | PRD-07 Section 5 | Required | title, slug, description, cover_image_url, curator_id, display_order, is_active, start_date, end_date | **Schema needed** |
| `curated_collection_items` | PRD-07 Section 5 | Required | collection_id, wine_id, position, curator_note | **Schema needed** |
| `recommendation_events` | PRD-07 Section 5 | Required | user_id, wine_id, event_type (enum), recommendation_source (enum), match_score | **Schema needed** |
| `follows` | PRD-08 Section 5 | Required | follower_id, following_id | **Schema needed** |
| `share_events` | PRD-08 Section 5 | Required | user_id, shareable_type (enum), shareable_id, platform (enum) | **Schema needed** |
| `retailer_members` | PRD-09 Section 5 | Required | retailer_id, user_id, role (owner/staff) | **Schema needed** |

**Total: 18 tables required by PRDs that have no architecture schema definition.**

#### Tables Defined in MODULE_ECOMMERCE (Medusa-Side)

These exist in Medusa's database, not Supabase:

| Medusa Entity | Module | P0 Relevance |
|---|---|---|
| `vendor` | Marketplace Module | **P0** -- Maps to retailers concept |
| `vendor_admin` | Marketplace Module | **P0** -- Maps to retailer users |
| `wine_details` | Wine Catalog Module | **P0** -- Wine metadata extension |
| `auction` | Auction Module | P1 -- Not needed for launch |
| `bid` | Auction Module | P1 |
| `trade_listing` | Trading Module | P1 |
| `trade_offer` | Trading Module | P1 |
| `delivery_zone` | Delivery Zone Module | **P0** -- Needed for order fulfillment |
| `delivery_window` | Delivery Zone Module | **P0** |
| `verification_record` | Compliance Module | **P0** -- Age verification records |

#### Supabase Tables Defined in MODULE_ECOMMERCE

| Table | Purpose | P0 Relevance |
|---|---|---|
| `auction_bid_feed` | Real-time bid broadcasting | P1 -- Not for launch |

### JSONB Field Definitions Audit

Several tables use JSONB columns. These need explicit schema definitions:

| Table | JSONB Column | PRD Source | Defined Structure? |
|---|---|---|---|
| `user_preferences` | `occasion_tags` | PRD-01 | No -- needs enum list |
| `user_preferences` | `notification_prefs` | PRD-01 | No -- needs structure |
| `wines` | `food_pairings` | PRD-04 | No -- needs structure |
| `wines` | `flavor_profile` | PRD-04 | No -- needs structure; critical for curation matching |
| `producers` | `farming_practices` | PRD-04 | No -- needs enum list |
| `retailers` | `fulfillment_capabilities` | PRD-06 | No -- needs structure |
| `taste_profiles` | `flavor_affinities` | PRD-03 | No -- needs tag taxonomy |
| `taste_profiles` | `flavor_aversions` | PRD-03 | No -- needs tag taxonomy |
| `taste_profiles` | `drinking_contexts` | PRD-03 | No -- needs enum list |
| `organizations` | `metadata` | SYSTEM_ARCHITECTURE | No -- generic JSONB |

### Missing Indexes

Beyond the standard `org_id` indexes required by project rules:

| Table | Missing Index | Reason |
|---|---|---|
| `wines` | `(slug)` | URL-based lookups |
| `wines` | `(producer_id)` | Producer portfolio queries |
| `wines` | GIN on `flavor_profile` | Curation engine matching |
| `wines` | Full-text search index on `(name, varietal, region)` | PostgreSQL FTS fallback |
| `producers` | `(slug)` | URL-based lookups |
| `retailer_inventory` | `(wine_id, retailer_id)` | Availability lookups |
| `retailer_inventory` | `(retailer_id, stock_status)` | Inventory health queries |
| `retailers` | Spatial index on `(latitude, longitude)` | PostGIS proximity queries |
| `taste_profiles` | `(user_id)` | One-per-user lookup |
| `recommendation_events` | `(user_id, event_type)` | ML training data queries |
| `recommendation_events` | `(wine_id, event_type)` | Wine popularity queries |
| `curated_collections` | `(slug)` | URL-based lookups |
| `curated_collections` | `(is_active, start_date, end_date)` | Active collection queries |
| `follows` | `(follower_id)` | "Who do I follow" queries |
| `follows` | `(following_id)` | "Who follows me" queries |

### Missing Foreign Key Relationships

| FK Needed | From | To | Notes |
|---|---|---|---|
| `wines.producer_id` | `wines` | `producers` | Core content relationship |
| `wishlist_items.wine_id` | `wishlist_items` | `wines` | Wishlist-to-wine join |
| `wishlist_items.wishlist_id` | `wishlist_items` | `wishlists` | Wishlist containment |
| `wishlists.user_id` | `wishlists` | `profiles` | User ownership |
| `taste_profiles.user_id` | `taste_profiles` | `profiles` | Profile ownership |
| `taste_profile_wines.wine_id` | `taste_profile_wines` | `wines` | Wine reference |
| `retailer_inventory.wine_id` | `retailer_inventory` | `wines` | Inventory-to-wine |
| `retailer_inventory.retailer_id` | `retailer_inventory` | `retailers` | Inventory-to-retailer |
| `curated_collection_items.wine_id` | `curated_collection_items` | `wines` | Collection contents |
| `curated_collection_items.collection_id` | `curated_collection_items` | `curated_collections` | Collection membership |
| `recommendation_events.wine_id` | `recommendation_events` | `wines` | Event-to-wine |
| `follows.follower_id` | `follows` | `profiles` | Social graph |
| `follows.following_id` | `follows` | `profiles` | Social graph |

### Schema Issues Requiring Resolution

1. **profiles table lacks org_id**: The `profiles` table in SYSTEM_ARCHITECTURE extends `auth.users` with PK as `auth.users.id`. This is user-global, not org-scoped. But project rules say every user-facing table must have `org_id`. Resolution: profiles are inherently cross-org (a user can be in multiple orgs). RLS for profiles should allow users to read their own profile, not org-scoped. This is an exception to the org_id rule that needs documentation.

2. **Dual wine storage**: PRD-04 defines `wines` table in Supabase with content/discovery fields (tasting_description, food_pairings, flavor_profile, slug). MODULE_ECOMMERCE defines `wine_details` in Medusa with commerce fields (vintage, varietal, region, price, inventory). These are the SAME wines, stored in TWO databases. The identity bridge must ensure consistency. This is addressed in ADR-002.

3. **memberships table missing updated_at**: The core `memberships` table in SYSTEM_ARCHITECTURE lacks `updated_at` and its trigger, violating the migration rules.

---

## 3. API Contract Review

### DAL Functions Referenced Across PRDs

| DAL File | Functions Needed | PRD Source |
|---|---|---|
| `lib/dal/users.ts` | getUserProfile, updateUserProfile, deleteUserAccount | PRD-01 |
| `lib/dal/preferences.ts` | getUserPreferences, updatePreferences, getPreferencesByUserId | PRD-01 |
| `lib/dal/wishlists.ts` | getWishlist, addWishlistItem, removeWishlistItem, getWishlistItems | PRD-01 |
| `lib/dal/wines.ts` | getWineBySlug, getWinesByProducer, searchWines, getWinesByFilters | PRD-02, PRD-04 |
| `lib/dal/search.ts` | performSearch, getRecentSearches, saveRecentSearch | PRD-02 |
| `lib/dal/producers.ts` | getProducerBySlug, getProducerWines, listProducers | PRD-04 |
| `lib/dal/taste-profiles.ts` | createTasteProfile, updateTasteProfile, getTasteProfile, addProfileWine | PRD-03 |
| `lib/dal/orders.ts` | createOrder, getOrderHistory, getOrderById, updateOrderStatus | PRD-05 |
| `lib/dal/cart.ts` | getOrCreateCart, addToCart, removeFromCart, getCartItems | PRD-05 |
| `lib/dal/retailers.ts` | getRetailerBySlug, getNearbyRetailers, getRetailersByWine | PRD-06 |
| `lib/dal/inventory.ts` | checkAvailability, updateInventory, importCSV, getInventoryHealth | PRD-06 |
| `lib/dal/curation.ts` | generateRecommendations, getUserRecommendations, dismissRecommendation | PRD-07 |
| `lib/dal/collections.ts` | getActiveCollections, getCollectionBySlug, createCollection | PRD-07 |
| `lib/dal/recommendation-events.ts` | trackEvent, getEventsByUser, getEventsByWine | PRD-07 |
| `lib/dal/follows.ts` | follow, unfollow, getFollowers, getFollowing, isFollowing | PRD-08 |
| `lib/dal/shares.ts` | trackShare, getSharesByUser, getMostSharedWines | PRD-08 |
| `lib/dal/retailer-dashboard.ts` | getRetailerOrders, getInventorySyncStatus, getRetailerAnalytics | PRD-09 |
| `lib/dal/organizations.ts` | getOrganization, getOrgMembership, getUserOrganizations, createOrganization | SYSTEM_ARCHITECTURE |
| `lib/dal/members.ts` | inviteMember, removeMember, updateMemberRole | SYSTEM_ARCHITECTURE |
| `lib/dal/billing.ts` | canUseFeature, getMemberLimit | SYSTEM_ARCHITECTURE |
| `lib/dal/permissions.ts` | hasPermission | SYSTEM_ARCHITECTURE |

**Total: 21 DAL files needed, 4 defined in architecture, 17 need design.**

### Server Actions Referenced Across PRDs

| Action File | Actions Needed | PRD Source |
|---|---|---|
| `lib/actions/auth.ts` | signup, login, logout, resetPassword, deleteAccount | PRD-01 |
| `lib/actions/preferences.ts` | updatePreferences, updateNotificationPrefs | PRD-01 |
| `lib/actions/wishlist.ts` | addToWishlist, removeFromWishlist | PRD-01 |
| `lib/actions/taste-profile.ts` | saveTasteProfile, updateTasteProfile, addProfileWine | PRD-03 |
| `lib/actions/orders.ts` | createOrder, cancelOrder | PRD-05 |
| `lib/actions/cart-actions.ts` | addToCart, removeFromCart, updateQuantity | PRD-05 (also in MODULE_ECOMMERCE) |
| `lib/actions/curation.ts` | getRecommendations, dismissRecommendation, trackInteraction | PRD-07 |
| `lib/actions/follows.ts` | follow, unfollow | PRD-08 |
| `lib/actions/shares.ts` | trackShare | PRD-08 |
| `lib/actions/retailer-orders.ts` | confirmOrder, markReady, markOutForDelivery, markCompleted, cancelOrder | PRD-09 |

### Route Handlers / API Endpoints Referenced

| Endpoint | Method | PRD Source | Architecture Coverage |
|---|---|---|---|
| `app/api/webhooks/stripe/route.ts` | POST | PRD-05 | **Covered** (SYSTEM_ARCHITECTURE Section 6) |
| `app/api/webhooks/medusa/route.ts` | POST | MODULE_ECOMMERCE | **Covered** |
| `app/api/v1/inventory/check` | GET | PRD-06 Section 5 | **Not in architecture** |
| `app/api/auth/callback/route.ts` | GET | PRD-01 (OAuth) | **Covered** (Supabase Auth flow) |

**Key Gap:** The public inventory API (`GET /api/v1/inventory/check?wine_id=X&lat=Y&lng=Z&radius=R`) referenced in PRD-06 has no architecture design. This needs Route Handler specification including Zod schema, response format, caching strategy, and PostGIS query pattern.

### Naming Consistency Issues

1. PRD-05 references `lib/actions/orders.ts` while MODULE_ECOMMERCE shows `lib/actions/cart-actions.ts`. These are complementary but the naming convention (hyphenated vs. plain) is inconsistent. **Recommendation:** Standardize on hyphenated names for multi-word files (`cart-actions.ts`, `retailer-orders.ts`).

2. PRD-01 references `lib/dal/users.ts` but SYSTEM_ARCHITECTURE uses `lib/dal/organizations.ts` and `lib/dal/members.ts` as examples. The user-specific DAL (profile, preferences) needs its own file. **Recommendation:** Use `lib/dal/profiles.ts` (matching the table name) rather than `lib/dal/users.ts`.

3. The architecture defines Medusa helpers in `lib/medusa/storefront/` while DAL functions are in `lib/dal/`. Commerce operations that go through Medusa (cart, checkout, orders) use Medusa helpers; non-commerce data (taste profiles, follows, wishlists) goes through the Supabase DAL. This dual pattern is correct but needs explicit documentation so developers know which layer to use for each operation.

---

## 4. Integration Feasibility

### Supabase Auth <> PRD-01 (User Accounts)

**Status: Feasible, well-specified.**

Supabase Auth covers all PRD-01 authentication requirements: email/password, Google OAuth, Apple Sign-In, password reset, cookie-based sessions. The architecture is thorough.

**Risks:**
- Apple Sign-In requires paid Apple Developer Program membership and callback URL configuration. Not technically risky but has an operational prerequisite.
- Session duration default is flagged as an open question in PRD-01 Section 7. Supabase Auth default is 1 hour access token + 1 week refresh token, which is reasonable.

### PostgreSQL Full-Text Search <> PRD-02 (Search and Browse)

**Status: Feasible for P0, migration path clear.**

PRD-02 specifies PostgreSQL full-text search as the V1 approach, with Meilisearch migration at P1 if performance degrades past 10K wines. MODULE_INTEGRATIONS Section 3 details Meilisearch.

**Conflict:** The architecture docs emphasize Meilisearch as the primary search solution, but PRD-02 says V1 is PostgreSQL FTS. These need alignment. **Recommendation:** Start with PostgreSQL FTS for P0 (simpler, no additional infrastructure). Define migration criteria and prepare Meilisearch integration patterns for when the catalog exceeds the latency threshold. This is addressed in ADR-003.

**Risks:**
- PostgreSQL FTS with JSONB GIN indexes is performant up to ~50K documents. At Cru's launch scale (500-1000 wines), this is more than adequate.
- Autocomplete within 300ms is achievable with PostgreSQL FTS using prefix matching (`to_tsquery('prefix:*')`).
- The "available nearby" toggle requires joining search results with PostGIS retailer proximity queries. This cross-concern query is the most complex search operation and needs careful index design.

### PostGIS <> PRD-06 (Retailer Integration)

**Status: Feasible but underspecified.**

Supabase supports the PostGIS extension natively. However, no architecture document specifies:
- How to enable PostGIS (`CREATE EXTENSION postgis;`)
- Column types (`geography(Point, 4326)` for lat/lng)
- Spatial index creation
- Distance query patterns (`ST_DWithin`, `ST_Distance`)

**Risks:**
- PostGIS is well-proven and Supabase includes it. No technical risk at the 20-retailer scale.
- The open question in PRD-06 Section 7 about PostGIS vs. application-level distance calculation is clearly in favor of PostGIS. Application-level distance (Haversine formula) doesn't scale and can't use spatial indexes.

### Stripe <> PRD-05 (Order Placement)

**Status: Feasible, well-specified.**

The architecture thoroughly covers Stripe integration via Medusa's built-in Stripe plugin for standard purchases, Stripe Connect for marketplace payouts, and webhook handling.

**Risks:**
- Stripe Connect is designed for multi-vendor marketplaces, but Cru's P0 model routes orders to retailers who fulfill. Are retailers Stripe Connect "Express" accounts? Or does Cru collect payment and manually pay retailers? The PRD mentions 8-15% commission but the payout mechanism is unclear for P0. **Recommendation:** For P0, use simple Stripe Checkout (platform collects, manual payout to retailers via ACH). Stripe Connect for automated payouts is a P1 feature.

### Medusa.js v2 <> PRD-05 (Order Placement)

**Status: Feasible but complex. Key risk area.**

MODULE_ECOMMERCE provides extensive Medusa architecture. However, for P0, Cru's model differs significantly from a standard Medusa marketplace:

1. **Cru doesn't own inventory** -- retailers do. Medusa's inventory module expects centralized inventory management.
2. **Cart is retailer-scoped** -- user picks a retailer, then adds wines from that retailer only. Medusa's default cart allows any product.
3. **Fulfillment is retailer-managed** -- Medusa's fulfillment module expects the platform to control shipping. Cru hands off to the retailer.

**Risks:**
- Medusa v2 is relatively new (v2 was a major rewrite). Community support and documentation are still maturing.
- The "retailer as vendor" mapping requires custom Medusa module work that goes beyond the standard marketplace recipe.
- Running Medusa as a separate server (Railway) adds infrastructure complexity, latency (cross-service API calls), and deployment coordination.

This is the highest-risk integration in the entire stack. See ADR-002 for analysis.

### POS Integrations (Lightspeed, Square) <> PRD-06

**Status: Not architecturally addressed. Medium risk.**

MODULE_INTEGRATIONS does not cover POS system integrations at all. This is a significant gap since POS sync is a P0 requirement.

**Feasibility Assessment:**
- **Lightspeed Retail API:** Well-documented REST API. Supports inventory webhooks. OAuth2 authentication. Technically straightforward.
- **Square for Retail API:** Well-documented, generous free tier. Supports inventory webhooks. OAuth2. Technically straightforward.
- **Risk:** The real risk is not technical but operational -- determining which POS systems the 20 LA launch retailers actually use, and whether those systems have APIs. PRD-06 Section 7 flags this as a blocking open question.

**Recommendation:** Design the integration layer as a pluggable adapter pattern (`lib/integrations/pos/lightspeed.ts`, `lib/integrations/pos/square.ts`, `lib/integrations/pos/csv.ts`) with a common interface. CSV import is the universal fallback.

### Transactional Email <> PRD-05, PRD-09

**Status: Feasible, well-specified.**

MODULE_INTEGRATIONS Section 10 specifies Resend with React Email components. This covers order confirmations, status updates, and retailer notifications.

**No significant risks.**

---

## 5. Medusa Module Mapping

### Commerce Requirements to Medusa Modules

| PRD Requirement | Medusa Module | P0? | Notes |
|---|---|---|---|
| Wine product catalog | Product Module (built-in) + Wine Catalog custom module | Yes | Wine metadata extends Product via module links |
| Cart management | Cart Module (built-in) | Yes | Needs retailer-scoping customization |
| Checkout flow | Checkout workflow (built-in) | Yes | Needs age verification step |
| Stripe payment | Payment Module with Stripe provider (built-in) | Yes | Standard integration |
| Order lifecycle | Order Module (built-in) | Yes | Needs custom status extensions |
| Inventory management | Inventory Module (built-in) | Yes | But inventory is retailer-managed, not centralized |
| Vendor/retailer management | Marketplace custom module | Yes | Retailer = Vendor in Medusa terms |
| Fulfillment (pickup/delivery) | Fulfillment Module + custom provider | Yes | Delivery Zone custom module |
| Age verification at checkout | Custom workflow step | Yes | Veratad integration in checkout workflow |
| Auction/bidding | Custom Auction module | No (P1) | Fully designed but not for P0 |
| P2P trading | Custom Trading module | No (P1) | Fully designed but not for P0 |
| Stripe Connect payouts | Payment module extension | No (P1 for automation) | P0 uses manual payouts |

### PRD Commerce Requirements Without Clear Medusa Mapping

| Requirement | PRD | Issue |
|---|---|---|
| Retailer-scoped cart (user selects retailer first, then adds wines) | PRD-05 | Medusa cart doesn't natively support "select vendor, then add products." Standard flow adds any product to cart. Needs custom middleware or cart metadata. |
| CSV inventory import | PRD-06 | Medusa inventory module accepts API-driven stock updates. CSV parsing and wine matching are application-layer concerns, not Medusa-native. |
| Wine fuzzy matching | PRD-06 | Application-layer concern. Medusa Product search can help but the fuzzy match against free-text CSV data needs custom logic. |
| Curated collections | PRD-07 | Not a Medusa concern. Collections are editorial content stored in Supabase, not commerce data. |
| Recommendation engine | PRD-07 | Not a Medusa concern. Pure Supabase + application logic. |
| Social features (follows, shares) | PRD-08 | Not a Medusa concern. Pure Supabase. |
| Retailer analytics | PRD-09 | Partially Medusa (order data) + Supabase (view counts, inventory health). Needs cross-system aggregation. |

### Medusa Modules Defined but Not Needed for P0

| Module | Section | Deferral Reason |
|---|---|---|
| Auction and Bidding | MODULE_ECOMMERCE Section 7 | P1 feature |
| Trading (P2P) | MODULE_ECOMMERCE Section 8 | P1 feature |
| Shipping Compliance (multi-state) | MODULE_ECOMMERCE Section 10 | LA-only at launch, CA compliant |

### Critical Medusa Integration Question

**Should Medusa manage wine products, or should Supabase?**

PRD-04 defines `wines` and `producers` tables in Supabase with rich content fields (tasting_description, flavor_profile, food_pairings, story_content). MODULE_ECOMMERCE defines `wine_details` in Medusa linked to Medusa's Product module for commerce (pricing, inventory, variants).

For P0, this creates an awkward dual-source:
- **Supabase** has the content/discovery data (producer stories, tasting notes, flavor profiles, occasion tags)
- **Medusa** has the commerce data (pricing, cart, checkout, order, inventory)

Every wine card on the browse page needs data from BOTH systems. Every purchase needs to go through Medusa. Every recommendation needs Supabase.

This is addressed in ADR-002.

---

## 6. Architecture Decision Records

### ADR-001: Multi-Tenancy Approach

**Status:** Proposed (confirming existing decision)

**Context:** Cru is a B2B SaaS platform with multi-tenancy requirements. Consumer users, retailers, and producers all need tenant isolation. The platform needs to support 20+ retail partners, 50+ producers, and 5,000+ consumer users at launch.

**Decision:** Shared database with Row Level Security (RLS) and `org_id` column on every data table. All user queries are filtered through RLS policies that join `auth.uid()` to `memberships.user_id` to determine `org_id` access.

**Rationale:**
- Cost-effective: single database instance, no per-tenant overhead
- Supabase-native: RLS is a first-class PostgreSQL feature with excellent Supabase integration
- Operationally simple: one set of migrations, one schema, one connection pool
- Security-strong: database-level isolation prevents application bugs from leaking data
- Proven at scale: PostgreSQL RLS handles millions of rows efficiently with proper indexing

**Consequences:**
- Every data table must include `org_id` with FK to organizations
- Every query goes through RLS subquery on `memberships`, requiring index on `(user_id, org_id)`
- Some entities (user profiles, follows, shares) are inherently user-scoped, not org-scoped. These need special RLS policies.
- Cross-org queries (admin dashboards, platform analytics) require service role client

**Alternatives Considered:**
- Schema-per-tenant: operationally complex (migrations per schema), unnecessary for Cru's scale
- Database-per-tenant: prohibitively expensive, connection pooling issues
- Application-level filtering only: insufficient security, high bug risk

### ADR-002: Wine and Producer Data Ownership -- Supabase vs. Medusa

**Status:** Proposed

**Context:** Wine and producer data is needed by two systems:
1. **Supabase** for content/discovery: browse pages, producer stories, taste profile matching, curation engine, search, SEO pages
2. **Medusa** for commerce: product catalog, pricing, variants, inventory, cart, checkout, orders

MODULE_ECOMMERCE defines a Medusa `wine_details` module linked to Medusa Product. PRD-04 defines Supabase `wines` and `producers` tables with content fields. Both are needed, creating a dual-store challenge.

**Decision:** Supabase is the primary content store for wines and producers. Medusa is the commerce engine that references Supabase wine IDs for product catalog, pricing, and order management.

Specifically:
- `wines` table in Supabase: canonical wine record with all content/discovery fields (name, varietal, region, producer_id, tasting_description, food_pairings, flavor_profile, slug, SEO metadata)
- `producers` table in Supabase: canonical producer record with all storytelling content
- Medusa Product: created for each wine that is purchasable, linked to the Supabase wine ID via `metadata.supabase_wine_id`
- Medusa `wine_details` custom module: stores commerce-specific wine attributes (vintage year, bottle_size_ml, alcohol_percentage, classification) that are relevant to the purchase flow
- Sync: When a wine is added to the Supabase `wines` table AND has retailer inventory (is purchasable), a corresponding Medusa Product is created/updated via the admin API

**Rationale:**
- Most features (browse, search, taste matching, curation, producer stories, social sharing) are read-heavy and content-driven. These query Supabase directly with RLS.
- Only cart/checkout/order flows need Medusa. Medusa is contacted only when the user is actively purchasing.
- RLS on Supabase wine content is straightforward. RLS on Medusa's separate PostgreSQL is not.
- Supabase full-text search works on Supabase tables, not Medusa tables.
- This minimizes cross-service API calls for the most common user flows (browsing).

**Consequences:**
- Wine data exists in two places (Supabase content + Medusa commerce). A sync mechanism is needed.
- Pricing data comes from Medusa (variants with calculated prices) or from `retailer_inventory` (Supabase). For P0, pricing is retailer-provided, stored in `retailer_inventory`. Medusa product variants hold a "reference price" or the inventory price is used directly.
- When a wine is added/updated in Supabase, a background process must create/update the corresponding Medusa Product.
- Product ID mapping: `wines.id` (Supabase UUID) maps to `product.metadata.supabase_wine_id` in Medusa.

**Alternatives Considered:**
- Medusa as sole product store: Forces all content/discovery queries through Medusa API, adding latency and complexity. Medusa's query system is not designed for the kind of rich content filtering Cru needs (flavor profiles, occasion tags, producer storytelling).
- Supabase as sole store (no Medusa): Requires building cart, checkout, order management, payment processing, and inventory holds from scratch. Duplicates what Medusa does well.
- Full bidirectional sync: Overly complex, introduces consistency issues. One-directional (Supabase -> Medusa) is simpler.

### ADR-003: Search Strategy -- PostgreSQL Full-Text Search vs. Dedicated Engine

**Status:** Proposed

**Context:** PRD-02 requires keyword search, autocomplete (300ms), and faceted filtering. MODULE_INTEGRATIONS recommends Meilisearch. PRD-02 Section 5 specifies PostgreSQL FTS for V1. The decision affects infrastructure complexity and search quality.

**Decision:** Use PostgreSQL full-text search (via Supabase) for P0 launch. Prepare integration patterns for Meilisearch migration when catalog exceeds 5,000 wines OR when search latency exceeds 500ms p95.

**Rationale:**
- At launch scale (500-1,000 wines), PostgreSQL FTS is more than adequate for sub-300ms queries
- Zero additional infrastructure: runs on existing Supabase PostgreSQL instance
- Simpler deployment and maintenance for a team optimizing for speed
- GIN indexes on `tsvector` columns provide efficient full-text + prefix matching
- Faceted filtering (varietal, region, price) uses standard SQL WHERE clauses with indexes
- Meilisearch migration is straightforward: index Supabase data into Meilisearch, swap the search DAL implementation

**Consequences:**
- Search quality (typo tolerance, synonyms, ranking) will be inferior to Meilisearch
- Autocomplete requires `to_tsquery` with prefix matching, which is less polished than Meilisearch's instant search
- No built-in hybrid search (keyword + semantic). This is a P1+ concern.
- Clear migration criteria must be defined: catalog size threshold, latency threshold, user satisfaction threshold

**Alternatives Considered:**
- Meilisearch from Day 1: Adds infrastructure (self-host on Railway or use Meilisearch Cloud), data sync pipeline, and operational complexity. Premature for 500 wines.
- Algolia: SaaS, expensive at scale, enterprise-focused. Premature.
- Typesense: Similar to Meilisearch, slightly less ecosystem support. Same "premature" argument applies.

### ADR-004: Caching Strategy for Per-User Recommendations

**Status:** Proposed

**Context:** PRD-07 requires per-user personalized recommendations with < 500ms generation time, cached for 1 hour. At 5,000 users, this means up to 5,000 cached recommendation sets. The cache must invalidate on taste profile updates or new purchases.

**Decision:** Use Next.js `unstable_cache` (or `cache()` in React Server Components) with per-user cache keys for P0. Evaluate Vercel KV (Redis-compatible) or Upstash Redis if cache hit rates are insufficient or if invalidation patterns become complex.

**Rationale:**
- `unstable_cache` provides per-request deduplication and time-based revalidation natively in Next.js
- No additional infrastructure for P0
- Cache key pattern: `curation:${userId}` with 1-hour `revalidate`
- Invalidation via `revalidateTag` when taste profile is updated or order is completed
- At 5,000 users with 8 recommendations each (small payload), memory pressure is minimal

**Consequences:**
- `unstable_cache` is Vercel-specific in its optimal behavior. Self-hosting Next.js would need a different caching layer.
- No cross-request cache sharing between different Vercel edge/serverless instances (each instance has its own in-memory cache). This means some cache misses on cold starts.
- For P0, this is acceptable. If recommendation generation exceeds 500ms consistently or cache hit rates are below 80%, migrate to Vercel KV or Upstash Redis.

**Alternatives Considered:**
- Redis (Upstash) from Day 1: More reliable cross-instance caching, but adds infrastructure and complexity. Premature for P0.
- Supabase Edge Functions with cache: Not designed for this use case.
- Pre-compute nightly: Stale recommendations, poor UX for users who just completed taste profile. Rejected.

### ADR-005: Real-Time Architecture for Inventory Updates

**Status:** Proposed

**Context:** PRD-06 requires near-real-time inventory updates (POS webhook within 5 minutes, nightly full sync). PRD-02 requires the "available nearby" indicator on wine cards to reflect current stock. Users need to trust that "in stock" means actually in stock.

**Decision:** Use event-driven inventory updates with two mechanisms:
1. **POS webhooks (real-time):** Lightspeed/Square fire webhooks on inventory changes. These hit `app/api/webhooks/pos/[provider]/route.ts`, validate signatures, and update `retailer_inventory` in Supabase via `supabaseAdmin`.
2. **Scheduled full sync (nightly):** A cron job (Supabase Edge Function or Vercel Cron) pulls full inventory from each connected POS system and reconciles with `retailer_inventory`.

Supabase Realtime is NOT used for inventory updates to the browser. Instead, browse pages are Server Components that query fresh data on each page load. The `retailer_inventory.last_synced_at` timestamp provides freshness transparency.

**Rationale:**
- Real-time browser updates for inventory changes are unnecessary for a marketplace with ~500 wines. The "available nearby" indicator is accurate to the last sync, which is sufficient.
- Server Component rendering with cache revalidation provides fresh-enough data without WebSocket overhead.
- POS webhooks provide real-time-ish updates (within minutes) for stock changes.
- Nightly full sync catches any missed webhooks.

**Consequences:**
- A wine could show as "in stock" for up to 4 hours after selling out (between webhook delivery failures and the next polling interval). PRD-06 targets < 5% discrepancy rate.
- No Supabase Realtime channel for inventory. If live inventory updates become critical (e.g., flash sales), a Realtime channel can be added later.

**Alternatives Considered:**
- Supabase Realtime for all inventory changes: Overhead not justified at launch scale. Would require every browse page to subscribe to inventory channels.
- Polling from client: Wasteful, doesn't scale.
- Event sourcing: Overengineered for P0.

### ADR-006: Rich Text Storage Format

**Status:** Proposed

**Context:** PRD-04 requires rich-text producer stories (300-800 words with formatting). PRD-07 requires rich-text collection descriptions. The storage format affects rendering complexity, editor choice, and future content features.

**Decision:** Store content as Markdown in text columns. Render using a Markdown-to-React component (e.g., `react-markdown` or `next-mdx-remote`).

**Rationale:**
- Markdown is human-readable in the database (inspectable, editable via any text editor)
- Extensive ecosystem support: `react-markdown`, `remark`, `rehype` plugins for custom rendering
- Content team can write in any Markdown editor (Notion export, HackMD, Bear, etc.)
- Supabase stores it as plain text (no special column type needed)
- Supports basic formatting: headings, bold, italic, links, lists, blockquotes
- Migration path to structured content (ProseMirror JSON) is straightforward if a rich editor is needed later

**Consequences:**
- No embedded interactive components within stories (no React components in Markdown without MDX)
- No real-time collaborative editing (not needed for P0 -- editorial team creates content offline)
- Image references in Markdown point to Supabase Storage URLs
- Need to sanitize Markdown on render to prevent XSS

**Alternatives Considered:**
- ProseMirror JSON: Structured, supports rich editing, but requires ProseMirror editor setup and custom rendering. Overengineered for P0 where content is created by a small editorial team, not self-serve producers.
- HTML: XSS risk, harder to sanitize, less portable.
- Plain text: Insufficient for formatted stories with headings and emphasis.

---

## 7. Risk Assessment and Gaps Summary

### Critical Gaps (Block Development)

| # | Gap | PRDs Affected | Impact | Recommended Resolution |
|---|---|---|---|---|
| CG-1 | **Wine/Producer data ownership** -- No resolution on whether wines/producers live in Supabase or Medusa or both | PRD-02, PRD-03, PRD-04, PRD-05, PRD-06, PRD-07 | Cannot begin schema design or DAL implementation without this decision | Accept ADR-002: Supabase as content primary, Medusa as commerce layer. Define the sync mechanism. |
| CG-2 | **18 tables with no schema** -- PRDs reference 18 tables that have no architecture definition | All 9 PRDs | Cannot write migrations or DAL functions | sr-backend must design all 18 table schemas before migration work begins |
| CG-3 | **Retailer integration architecture missing** -- No POS integration design, no CSV import architecture, no wine matching algorithm | PRD-06, PRD-05, PRD-09 | The entire commerce chain depends on retailer inventory data | Design POS adapter pattern, CSV import pipeline, and fuzzy matching algorithm |
| CG-4 | **Retailer auth model undefined** -- `member_role` enum lacks retailer roles; relationship between Supabase org membership and Medusa vendor unclear | PRD-09, PRD-06 | Cannot build retailer dashboard or role-based access | Extend `member_role` enum or create separate retailer auth mechanism. Decide on retailer-as-org vs. retailer-as-user pattern. |
| CG-5 | **PostGIS not designed** -- Referenced by PRD-06 but no extension setup, column types, indexes, or query patterns defined | PRD-06, PRD-02 | Cannot implement location-based queries | Add PostGIS migration with geography columns, spatial indexes, and distance query functions |

### Partial Coverage (Need Refinement)

| # | Gap | PRDs Affected | Issue | Recommended Resolution |
|---|---|---|---|---|
| PC-1 | **profiles table missing org_id** | PRD-01 | User profiles are cross-org but migration rules require org_id | Document exception: profiles use user-scoped RLS (users read/write own profile), not org-scoped |
| PC-2 | **Wine detail page dual-source** | PRD-04, PRD-05 | Content from Supabase, pricing/availability from Medusa/inventory | Define the Wine Detail Page data assembly pattern: RSC fetches from both sources |
| PC-3 | **Medusa order statuses vs. PRD statuses** | PRD-05, PRD-09 | Medusa uses standard e-commerce statuses; PRDs define custom ones (ready_for_pickup, out_for_delivery) | Map PRD statuses to Medusa status + metadata, or use custom order status extension |
| PC-4 | **Search + availability cross-query** | PRD-02 | "Available nearby" toggle requires joining search results with PostGIS inventory queries | Design a composite query or two-phase search (text search, then availability filter) |
| PC-5 | **Curation engine caching** | PRD-07 | PRD specifies per-user caching with 1-hour TTL but no implementation designed | Accept ADR-004: `unstable_cache` for P0, Redis for scale |
| PC-6 | **JSONB field schemas** | PRD-03, PRD-04, PRD-06 | 10 JSONB fields across tables with no defined structure | Define TypeScript types + Zod schemas for every JSONB field. Add validation at DAL layer. |
| PC-7 | **Flavor tag taxonomy** | PRD-02, PRD-03, PRD-07 | Tags (berry, earthy, pepper, etc.) are referenced but no canonical list or mapping table exists | Create `flavor_tags` reference table or constants file with category groupings. Define wine-to-tag mapping. |

### Technical Risks

| # | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| TR-1 | **Medusa v2 maturity** -- v2 is a relatively new major rewrite; community docs and examples are still maturing | High | Medium | Assign complex Medusa work to sr-backend (Opus). Build spike/prototype for retailer-scoped cart before committing. Have a fallback plan (custom cart/checkout on Supabase) if Medusa integration proves too complex. |
| TR-2 | **Two-database consistency** -- Supabase wines and Medusa products must stay in sync | Medium | High | Implement sync as a background Server Action triggered on wine/inventory changes. Add reconciliation job to detect drift. Accept eventual consistency (minutes, not seconds). |
| TR-3 | **Cross-service latency** -- Wine detail pages need data from Supabase (content) + Medusa (pricing/availability). Each API call adds latency. | Medium | Medium | Use React `<Suspense>` boundaries to parallelize data fetching. Cache Medusa product data aggressively. Consider denormalizing price data into Supabase `retailer_inventory`. |
| TR-4 | **RLS performance at scale** -- Every query runs a subquery on `memberships`. With 5,000 users and multiple org memberships, this could slow down. | Low | Low | Already mitigated: composite index on `memberships(user_id, org_id)`. Monitor query plans. At 5K users, this is not a concern. |
| TR-5 | **POS integration diversity** -- LA retailers may use POS systems other than Lightspeed/Square (POSIM, custom spreadsheets) | Medium | High | CSV upload as universal fallback (PRD-06 already specifies this). Prioritize POS integrations based on actual retailer census. |
| TR-6 | **Content seeding bottleneck** -- 30-50 producer profiles need human writing effort on a tight timeline | Medium | High | Not a technical risk, but blocks taste matching and curation testing. Start content seeding in parallel with engineering from Week 1. |

### Open Questions Requiring Human Input

| # | Question | PRD Source | Blocking? | Recommended Default |
|---|---|---|---|---|
| OQ-1 | Session duration: 7 days or 30 days? | PRD-01 Section 7 | Yes | 7-day refresh token (Supabase default). Users can stay logged in if refresh tokens are rotated. |
| OQ-2 | Age gate: checkbox or date-of-birth capture? | PRD-01 Section 7 | Yes | Checkbox for P0 (simpler). Full DOB capture when age verification API is integrated for checkout. |
| OQ-3 | Which POS systems do the 20 LA target retailers use? | PRD-06 Section 7 | Yes | Conduct retailer census ASAP. Build CSV import first regardless. |
| OQ-4 | Medusa retailer-scoped cart: does Medusa's cart model support this, or custom layer needed? | PRD-05 Section 7 | Yes | Spike/prototype needed. If Medusa cart can't be retailer-scoped via metadata, build a lightweight custom cart in Supabase with Medusa handling only checkout/payment. |
| OQ-5 | How many occasion/mood categories at launch? | PRD-02 Section 7 | Yes (for content tagging) | 8 categories per PRD-02 proposal. Finalize taxonomy before frontend build. |
| OQ-6 | Onboarding preference flow: separate wizard or integrated into first browse? | PRD-01 Section 7 | No | UX designer to recommend. Default: separate wizard (PRD-03 designs 5 screens). |
| OQ-7 | Rich text storage: Markdown or ProseMirror JSON? | PRD-04 Section 7 | No | Markdown (see ADR-006). |
| OQ-8 | Retailer payout mechanism for P0? | PRD-05, PRD-09 | Yes | Manual ACH/check payout for P0. Stripe Connect is P1. |
| OQ-9 | Caching strategy for recommendations: Next.js cache or Redis? | PRD-07 Section 7 | No | `unstable_cache` for P0 (see ADR-004). |
| OQ-10 | Retailer auth: same user model with retailer role, or separate accounts? | PRD-09 Section 7 | Yes | Same user model, add `retailer` to `member_role` enum, link user to retailer via `retailer_members` table. |

---

## Summary of Findings

### By the Numbers

- **9 PRDs reviewed** with approximately 85 P0 requirements total
- **Covered:** ~35 requirements have full architecture coverage
- **Partial:** ~20 requirements have partial architecture coverage needing refinement
- **Gap:** ~30 requirements have no architecture coverage (schema, API, or integration)

### Top 5 Actions Before Development Begins

1. **Resolve wine/producer data ownership** (ADR-002) -- This decision cascades into every schema, DAL function, and Server Action across 6 of 9 PRDs.

2. **Design all 18 missing table schemas** -- sr-backend cannot write migrations without complete schema definitions including column types, constraints, indexes, and RLS policies.

3. **Design the retailer integration layer** -- POS adapter pattern, CSV import pipeline, PostGIS setup, wine matching algorithm. This is the largest gap in architecture coverage.

4. **Define the retailer auth model** -- How retailers authenticate, what role they have, how retailer identity links to org membership and Medusa vendor.

5. **Spike Medusa retailer-scoped cart** -- Validate that Medusa can support Cru's unique cart model (user selects retailer, then adds wines) before committing to Medusa for cart management.

### Architecture Health Assessment

The **core platform architecture** (SYSTEM_ARCHITECTURE.md) is solid and well-designed. Multi-tenancy, auth, DAL pattern, Server Actions, frontend architecture, and deployment are all production-ready patterns.

The **commerce module** (MODULE_ECOMMERCE.md) is comprehensive but designed for the full product vision (P0-P3). For P0, significant portions (auctions, trading, 3PL) are premature. The relevant portions (marketplace, wine catalog, delivery zones) need adaptation for Cru's retailer-as-vendor model.

The **integrations module** (MODULE_INTEGRATIONS.md) is thorough for the full vision but does not address the P0-critical POS integrations (Lightspeed, Square). Several recommended integrations (DoorDash, Wineshipping, Yotpo, Cabrella) are not needed at launch.

The **PRDs** are exceptionally well-written with clear requirements, acceptance criteria, and technical specifications. Many PRDs include table schemas that fill gaps in the architecture docs. The PRDs should be treated as architectural input -- their table definitions are largely correct and should be formalized into migration files.

**Overall: The architecture is a strong foundation that needs approximately 2-3 days of schema design, integration architecture, and decision-making before development can begin. No fundamental re-architecture is needed.**
