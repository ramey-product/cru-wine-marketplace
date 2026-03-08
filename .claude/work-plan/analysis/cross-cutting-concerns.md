# Cross-Cutting Concerns — Cru Wine Marketplace

**Generated:** Checkpoint 2 — Work Plan Decomposition
**Scope:** All 9 epics (95 stories, 461 story points)

---

## 1. Multi-Tenancy & Row-Level Security

**Epics Affected:** ALL (01–09)
**Impact:** Every user-facing table requires RLS policies + pgTAP tests

### Concern

Three distinct tenancy patterns exist (per CG-2 resolution):

| Pattern | `org_id` | Tables | Epics |
|---------|----------|--------|-------|
| **User-scoped** | No `org_id` | `profiles`, `user_preferences`, `wishlists`, `wishlist_items`, `taste_profiles`, `taste_profile_wines`, `follows`, `share_events`, `user_wine_dismissals` | 01, 03, 07, 08 |
| **Org-scoped** | Has `org_id` | `wines`, `wine_tags`, `wine_occasions`, `producers`, `producer_photos`, `orders`, `order_items`, `order_status_history`, `retailers`, `retailer_inventory`, `retailer_sync_logs`, `wine_match_queue`, `curated_collections`, `curated_collection_items`, `retailer_members`, `retailer_notification_preferences`, `retailer_stock_overrides`, `retailer_pos_connections` | 02, 04, 05, 06, 07, 09 |
| **Content-scoped** | `org_id` = platform org | `wines` (platform catalog), `producers` | 02, 04 |

### Two-Layer RLS (EPIC-09)

Retailer dashboard introduces a second isolation layer: `org_id` for platform tenancy + `retailer_id` for retailer-specific data isolation. This pattern requires:
- RLS policies that check BOTH `org_id` and `retailer_id`
- Separate pgTAP tests for cross-retailer isolation within the same org
- Role-based data masking at the DAL level (not RLS) for financial data

### Action Items
- Establish shared RLS policy templates for each pattern before backend implementation
- Create reusable pgTAP test fixtures for positive/negative tenant isolation
- Document the two-layer RLS pattern as an ADR for EPIC-09

---

## 2. Shared Wine Card Component

**Epics Affected:** 02, 03, 05, 06, 07, 08
**Impact:** Most-reused UI component across the platform

### Concern

The wine card appears in: search results (02), taste profile matches (03), order history (05), retailer inventory (06), curated collections (07), and social shares (08). Each context requires slightly different data overlays:

| Context | Additional Data |
|---------|----------------|
| Search results | Match score, tag badges |
| Taste profile | Compatibility percentage |
| Order history | Order date, status |
| Retailer inventory | Stock status, price |
| Curated collection | Curator note, position |
| Social share | Shared-by attribution |

### Action Items
- Design a composable wine card with slot-based overlays (EPIC-02/STORY-09 owns the base component)
- Define the card's prop interface early so downstream epics can plan their overlays
- UX designer should produce a single wine card spec covering all 6 contexts

---

## 3. Wines Table as Central Dependency

**Epics Affected:** 02, 03, 04, 05, 06, 07, 08
**Impact:** Architecture bottleneck — most-referenced table in the system

### Concern

The `wines` table (created in EPIC-02, populated via Medusa sync in EPIC-04) is referenced by:
- `wine_tags`, `wine_occasions` (EPIC-02)
- `taste_profile_wines` (EPIC-03)
- `order_items` (EPIC-05)
- `retailer_inventory`, `wine_match_queue` (EPIC-06)
- `curated_collection_items` (EPIC-07)
- `share_events` (EPIC-08)

EPIC-04 (Producer Storytelling) creates the Medusa sync pipeline that populates the wines table. Until this pipeline works, downstream epics have no wine data to operate on.

### Action Items
- Prioritize EPIC-02/STORY-01 (wines schema) and EPIC-04/STORY-05 (Medusa sync) as critical path items
- Create comprehensive seed data for the wines table to unblock parallel frontend work
- Index strategy: ensure `tsvector` index (FTS), `org_id` index, and any FK indexes are all in the initial migration

---

## 4. Medusa.js Sync Direction (CG-1)

**Epics Affected:** 04, 05, 06
**Impact:** Data flow architecture between Supabase and Medusa

### Concern

Per CG-1 resolution: Wine/producer data flows Supabase → Medusa (one-directional sync). Orders have bidirectional flow: Medusa cart → Stripe checkout → webhook → Supabase order record.

This means:
- EPIC-04 implements the Supabase-to-Medusa product sync (webhook-based)
- EPIC-05 implements the Medusa cart + Stripe checkout flow with webhook-based order finalization
- EPIC-06 inventory updates flow Supabase → Medusa (inventory sync)

### Action Items
- Define the Medusa webhook payload schema before EPIC-04 backend begins
- Implement idempotent webhook handlers for both directions
- Create a sync status monitoring pattern reusable across EPIC-04 and EPIC-06

---

## 5. Stripe Integration & PCI Compliance

**Epics Affected:** 05, 09
**Impact:** Payment processing, financial data handling

### Concern

EPIC-05 uses Stripe Hosted Checkout (no card data touches our servers). EPIC-09 displays revenue/commission data to retailer owners. Key concerns:
- Webhook signature verification is mandatory on all Stripe endpoints
- Idempotency keys prevent duplicate order creation from retry deliveries
- Financial data (revenue, commission, payouts) is masked at the DAL level for staff-role users
- Stripe Customer objects must be created/linked during EPIC-01 user registration

### Action Items
- Implement shared webhook signature verification utility in `lib/stripe/`
- Define the Stripe Customer creation hook in EPIC-01 registration flow
- Document the financial data masking approach as an ADR

---

## 6. POS Integration Abstraction (CG-3)

**Epics Affected:** 06, 09
**Impact:** Multi-vendor integration architecture

### Concern

Per CG-3 resolution: `POSAdapter` interface with 4 P0 adapters (Square, Lightspeed, Shopify, Clover) + CSV fallback. EPIC-06 defines the adapter interface and CSV fallback. EPIC-09 adds the POS connection management UI and OAuth flows.

Cross-cutting issues:
- OAuth token lifecycle management (refresh, expiry, reconnection)
- Adapter error handling standardization (retry strategy, error categorization)
- Sync status reporting (shared between EPIC-06 backend and EPIC-09 dashboard UI)

### Action Items
- Define the `POSAdapter` TypeScript interface before any adapter implementation begins
- Create shared sync status types/enums used by both EPIC-06 and EPIC-09
- Plan for adapter-specific error message mapping

---

## 7. PostGIS & Geospatial Queries (CG-5)

**Epics Affected:** 06, (indirectly 05, 07)
**Impact:** Retailer proximity search, delivery radius

### Concern

Per CG-5 resolution: `geography(Point, 4326)` column with GIST index on the `retailers` table. Used for:
- "Find retailers near me" in consumer search
- Delivery radius validation in order placement
- Location-based collection curation

### Action Items
- Enable PostGIS extension in the initial migration (EPIC-06/STORY-01)
- Create shared geospatial query helpers in `lib/dal/geo.ts`
- Index strategy: GIST index on retailer location column

---

## 8. Caching Strategy

**Epics Affected:** 02, 07, 09
**Impact:** Performance, data freshness

### Concern

Three distinct caching needs:
1. **Wine search results** (EPIC-02): Short TTL, varies by filters/pagination
2. **Curated collection renders** (EPIC-07): Medium TTL (1 hour), invalidated on curator edits
3. **Retailer analytics MV** (EPIC-09): 15-minute materialized view refresh via pg_cron

Per-user recommendation cache (EPIC-07) uses Next.js `unstable_cache` with 1-hour TTL.

### Action Items
- Define caching tiers (no-cache, short, medium, long) as a shared configuration
- Implement event-driven cache invalidation for curator edits (EPIC-07)
- Set up pg_cron for materialized view refresh (EPIC-09/STORY-04)

---

## 9. Transactional Email

**Epics Affected:** 05, 09
**Impact:** User notifications, order lifecycle

### Concern

Both EPIC-05 (order confirmations) and EPIC-09 (retailer order notifications) use Resend + React Email templates. Pattern: fire-and-forget async sends triggered by order status changes.

### Action Items
- Create shared email sending utility in `lib/integrations/email.ts`
- Define React Email template structure early (shared layout, org branding)
- Implement non-blocking send pattern (don't fail the action if email fails)

---

## 10. Open Graph & Social Sharing

**Epics Affected:** 02, 08
**Impact:** SEO, social media link previews

### Concern

EPIC-08 adds OG meta tags to wine detail pages (created in EPIC-02). Every wine detail page must render dynamic `og:title`, `og:description`, `og:image` tags. Share events track UTM parameters for attribution.

### Action Items
- Build OG meta tag generation into the wine detail page layout (EPIC-02 page, EPIC-08 enhancement)
- Plan for OG image generation/caching (dynamic wine images)
- Define UTM parameter conventions for share attribution

---

## 11. User Profile Evolution

**Epics Affected:** 01, 08
**Impact:** Progressive profile enrichment

### Concern

EPIC-01 creates the base `profiles` table (auth-linked). EPIC-08 extends it with `username`, `bio`, `is_public`, `following_count`, `followers_count`. The username introduces slug-based routing (`/profile/[username]`).

Follow count denormalization requires trigger discipline: `following_count` and `followers_count` on `profiles` must stay in sync when follows are added/removed.

### Action Items
- Plan the `profiles` ALTER migration in EPIC-08 to be additive (no breaking changes)
- Implement follow count sync via PostgreSQL trigger (not application logic)
- Define username validation rules (case-insensitive uniqueness, slug-safe characters)

---

## 12. Order Lifecycle State Machine

**Epics Affected:** 05, 06, 09
**Impact:** Order processing workflow consistency

### Concern

Order status transitions: `pending → confirmed → [ready_for_pickup | out_for_delivery] → completed | cancelled`. This state machine spans:
- EPIC-05: Order creation and initial status
- EPIC-06: Fulfillment status updates from retailer
- EPIC-09: Retailer dashboard order queue management

### Action Items
- Define the order status enum and valid transitions as a shared constant
- Implement status transition validation in the DAL (prevent invalid transitions)
- Trigger email notifications on specific transitions (EPIC-09/STORY-10)

---

## 13. PostHog Analytics Integration

**Epics Affected:** 07, 08 (potentially 02, 05)
**Impact:** Event tracking, recommendation feedback loop, A/B analysis

### Concern

PostHog Cloud (free tier: 1M events/month, unlimited seats, no credit card required) replaces the originally planned `recommendation_events` Supabase table. This provides richer analytics capabilities (funnels, cohorts, feature flags, session replay) without burdening the application database.

Event tracking spans multiple epics:
- **EPIC-07** (primary): Recommendation impressions, clicks, dismissals, wishlist-adds, purchases — all tracked via PostHog for ML training and A/B analysis
- **EPIC-08**: Share events, follow events, profile views — tracked via PostHog for engagement analytics
- **EPIC-02** (potential): Search query analytics, filter usage patterns
- **EPIC-05** (potential): Cart abandonment, checkout funnel analysis

A lightweight `user_wine_dismissals` table remains in Supabase for synchronous engine exclusion queries (the matching engine needs fast lookups of dismissed wine IDs). Dismiss events are dual-tracked: Supabase for engine lookups, PostHog for analytics.

### Action Items
- Initialize PostHog JS SDK in the app layout (`lib/analytics/posthog.ts`)
- Define a shared event naming convention (e.g., `recommendation_impression`, `recommendation_click`, `recommendation_dismiss`)
- Use fire-and-forget pattern: PostHog `capture()` failures must never block user-facing actions
- Plan for PostHog feature flags to support A/B testing of recommendation algorithms
- Document the dual-tracking pattern for dismissals as an ADR

---

## Summary Matrix

| Concern | Epics | Severity | Resolution Timing |
|---------|-------|----------|-------------------|
| Multi-tenancy patterns | ALL | Critical | Before Checkpoint 3 |
| Wine card component | 02,03,05,06,07,08 | High | EPIC-02 backend phase |
| Wines table bottleneck | 02,03,04,05,06,07,08 | Critical | EPIC-02 + EPIC-04 first |
| Medusa sync direction | 04,05,06 | High | EPIC-04 backend phase |
| Stripe/PCI compliance | 05,09 | High | EPIC-05 backend phase |
| POS adapter abstraction | 06,09 | High | EPIC-06 backend phase |
| PostGIS geospatial | 06 | Medium | EPIC-06 migration |
| Caching strategy | 02,07,09 | Medium | Per-epic |
| Transactional email | 05,09 | Medium | EPIC-05 backend phase |
| OG/social sharing | 02,08 | Low | EPIC-08 frontend phase |
| Profile evolution | 01,08 | Medium | EPIC-01 first, EPIC-08 extends |
| Order state machine | 05,06,09 | High | EPIC-05 backend phase |
| PostHog analytics | 07,08,(02,05) | Medium | EPIC-07 backend phase |
