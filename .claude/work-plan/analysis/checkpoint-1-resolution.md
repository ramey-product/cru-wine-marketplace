# Checkpoint 1 Resolution: Final Architecture Decisions

**Status:** Checkpoint 1 -- RESOLVED
**Author:** System Architect (claude/architect agent)
**Date:** 2026-03-07
**Scope:** All open decisions, critical gaps, and open questions from the Architecture Review, incorporating human feedback
**Prerequisite:** Read `architecture-review.md` in the same directory for full context on each item

---

## Table of Contents

1. [Decision Log](#1-decision-log)
2. [ADR-004 Revised: Caching Strategy](#2-adr-004-revised-caching-strategy)
3. [ADR-005 Revised: Real-Time Architecture](#3-adr-005-revised-real-time-architecture)
4. [CG-1 Resolution: Wine/Producer Data Ownership](#4-cg-1-resolution-wineproducer-data-ownership)
5. [CG-2 Resolution: Schema Design Principles and Table Categorization](#5-cg-2-resolution-schema-design-principles-and-table-categorization)
6. [CG-3 Resolution: Retailer Integration Architecture](#6-cg-3-resolution-retailer-integration-architecture)
7. [CG-4 Resolution: Retailer Auth Model](#7-cg-4-resolution-retailer-auth-model)
8. [CG-5 Resolution: PostGIS Design](#8-cg-5-resolution-postgis-design)
9. [Open Question Resolutions](#9-open-question-resolutions)
10. [Medusa Spike Definition](#10-medusa-spike-definition)
11. [Stripe Connect P0 Architecture](#11-stripe-connect-p0-architecture)
12. [Updated Risk Assessment](#12-updated-risk-assessment)

---

## 1. Decision Log

| # | Decision | Status | Resolution |
|---|---|---|---|
| ADR-001 | Multi-tenancy: shared DB + RLS + org_id | **Accepted** | No changes. Confirmed by human review. |
| ADR-002 | Wine/producer data in Supabase as source of truth | **Accepted** | Human confirms: "All wines/producers live in Supabase. Supabase is ultimate source of truth." Sync is one-directional: Supabase -> Medusa. See CG-1 Resolution. |
| ADR-003 | PostgreSQL FTS for P0 search | **Accepted** | No changes. Meilisearch migration path clear at 5K+ wines. |
| ADR-004 | Caching strategy | **Revised** | Original proposed `unstable_cache`. Revised to Upstash Redis for P0-through-P2 durability. See Section 2. |
| ADR-005 | Real-time architecture for inventory | **Revised** | Added cost/benefit analysis. Final recommendation: selective Realtime strategy. See Section 3. |
| ADR-006 | Markdown for rich text | **Accepted** | No changes. |
| CG-1 | Wine/producer data ownership | **Resolved** | Supabase is source of truth. Medusa references Supabase IDs. One-directional sync. See Section 4. |
| CG-2 | 18 missing table schemas | **Resolved** | Design principles established. Tables categorized by ownership pattern. Full schema design deferred to Phase 2 (sr-backend). See Section 5. |
| CG-3 | Retailer integration architecture | **Resolved** | POS adapter pattern designed. 10 POS systems tiered. CSV import pipeline defined. Fuzzy matching algorithm specified. PostGIS setup defined. See Section 6. |
| CG-4 | Retailer auth model | **Resolved** | Retailers ARE organizations with `type = 'retailer'`. Uses existing membership model. Eliminates separate `retailer_members` table. See Section 7. |
| CG-5 | PostGIS design | **Resolved** | Extension enablement, geography columns, spatial indexes, distance query patterns all defined. See Section 8. |
| OQ-1 | Session duration | **Resolved** | 7-day refresh token. See Section 9. |
| OQ-2 | Age gate | **Resolved** | Checkbox at P0. See Section 9. |
| OQ-3 | POS systems | **Resolved** | 10 systems identified and tiered. See Section 6. |
| OQ-4 | Medusa cart spike | **Resolved** | Spike defined with success criteria and fallback plan. See Section 10. |
| OQ-5 | Occasion categories | **Resolved** | 12 categories recommended. See Section 9. |
| OQ-6 | Retailer payouts | **Resolved** | Stripe Connect Express from P0. See Section 11. |
| OQ-7 | Retailer auth model | **Resolved** | Same user model, retailer-as-org. See Section 7. |
| OQ-8 | Onboarding flow | **Resolved** | Separate wizard (5 screens per PRD-03). See Section 9. |
| OQ-9 | Rich text format | **Resolved** | Markdown. See ADR-006 (accepted). |
| OQ-10 | Caching strategy | **Resolved** | Upstash Redis. See Section 2. |

---

## 2. ADR-004 Revised: Caching Strategy

### ADR-004: Upstash Redis for Platform-Wide Caching (P0 through P2)

**Status:** Accepted (revised from original)

**Context:** The original ADR-004 proposed `unstable_cache` (Next.js built-in) for P0, deferring Redis to later. Human feedback: "Needs work -- let's opt for a solution that gets us through P2 growth." P2 means potentially 50K+ users, hundreds of retailers, thousands of concurrent users. `unstable_cache` has fundamental limitations that would force a re-architecture:

- No cross-instance cache sharing (each serverless invocation has its own memory)
- No reliable cache hit rates at scale (cold starts flush the in-memory cache)
- `unstable_cache` is still not fully stable and its API surface may change
- Tag-based invalidation via `revalidateTag` is limited to Next.js's own Data Cache, not extensible to arbitrary cache patterns

**Decision:** Use **Upstash Redis** as the platform-wide caching layer from P0 onward. Upstash is serverless Redis, pay-per-request, designed for Vercel/edge deployment. It powers Vercel KV under the hood. Create a cache utility abstraction at `lib/cache/` so the caching backend can be swapped without changing application code.

**Rationale:**
- **Serverless/managed**: No infrastructure to maintain. No self-hosted Redis cluster.
- **Pay-per-request**: At P0 scale (~5K users), cost is negligible (~$0.20/100K commands). A typical session generates 5-10 cache reads, meaning 50K daily commands at launch costs ~$0.10/day.
- **Scales to P2**: Upstash handles millions of requests/day on the same plan with linear cost scaling. No architecture change needed.
- **Global edge replication**: Upstash supports multi-region read replicas. Reads from the nearest edge node (sub-5ms latency). Critical for P2 multi-city expansion.
- **Tag-based invalidation**: Upstash supports key scanning and pattern-based deletion. Combined with our cache key conventions, this enables surgical invalidation.
- **Works with Vercel**: First-class integration. The `@upstash/redis` SDK is designed for serverless environments (HTTP-based, no persistent connections needed).

**Cache Key Patterns:**

```
# Per-user recommendations (PRD-07)
cru:rec:{userId}                     TTL: 1 hour

# Wine detail page content (PRD-04)
cru:wine:{wineSlug}                  TTL: 15 minutes

# Producer page content (PRD-04)
cru:producer:{producerSlug}          TTL: 15 minutes

# Search results (PRD-02)
cru:search:{queryHash}               TTL: 5 minutes

# Retailer inventory for a wine (PRD-06)
cru:inv:{wineId}:{lat}:{lng}:{radius} TTL: 5 minutes

# Active curated collections (PRD-07)
cru:collections:active               TTL: 30 minutes

# User's taste profile (PRD-03)
cru:taste:{userId}                   TTL: 24 hours

# Retailer dashboard analytics (PRD-09)
cru:rtl:analytics:{orgId}            TTL: 10 minutes

# Retailer order queue (PRD-09)
cru:rtl:orders:{orgId}               TTL: 30 seconds
```

**Invalidation Strategy:**

| Trigger Event | Keys Invalidated | Mechanism |
|---|---|---|
| Taste profile updated | `cru:rec:{userId}`, `cru:taste:{userId}` | Server Action calls `cache.invalidate()` after DAL write |
| Order completed | `cru:rec:{userId}`, `cru:inv:{wineId}:*` | Stripe webhook handler calls `cache.invalidatePattern()` |
| Wine content updated | `cru:wine:{slug}`, `cru:search:*` | Admin action calls `cache.invalidate()` |
| Producer content updated | `cru:producer:{slug}` | Admin action calls `cache.invalidate()` |
| Inventory sync (POS/CSV) | `cru:inv:{wineId}:*` for affected wines | Sync handler calls `cache.invalidatePattern()` |
| Collection created/updated | `cru:collections:active` | Curation action calls `cache.invalidate()` |
| Retailer order status change | `cru:rtl:orders:{orgId}` | Status update action calls `cache.invalidate()` |

**Cache Utility Abstraction:**

```typescript
// lib/cache/index.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    return redis.get<T>(key)
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await redis.set(key, value, { ex: ttlSeconds })
  },

  async invalidate(key: string): Promise<void> {
    await redis.del(key)
  },

  async invalidatePattern(pattern: string): Promise<void> {
    // Use SCAN for pattern-based invalidation (safe for production, non-blocking)
    let cursor = 0
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 })
      cursor = Number(nextCursor)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } while (cursor !== 0)
  },

  async getOrSet<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await redis.get<T>(key)
    if (cached !== null) return cached
    const value = await fn()
    await redis.set(key, value, { ex: ttlSeconds })
    return value
  },
}
```

**Cost Projections:**

| Phase | Users | Est. Daily Commands | Est. Monthly Cost |
|---|---|---|---|
| P0 (Launch) | 5K | 50K | ~$3 |
| P1 (Growth) | 20K | 200K | ~$12 |
| P2 (Scale) | 50K+ | 1M+ | ~$60 |

Upstash free tier includes 10K commands/day. The pay-as-you-go tier starts at $0.20 per 100K commands. Even at P2 scale, caching costs are trivially small compared to compute and database costs.

**Consequences:**
- One additional service dependency (Upstash). Upstash has 99.99% SLA.
- Cache misses fall through to Supabase/Medusa queries (graceful degradation).
- Environment variables needed: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (server-only, never `NEXT_PUBLIC_`).
- The `lib/cache/` abstraction means we can swap to self-hosted Redis, Vercel KV, or any other backend by changing one file.

**Alternatives Rejected:**
- `unstable_cache` (original proposal): No cross-instance sharing, poor hit rates at scale, requires re-architecture at P1.
- Vercel KV: Powered by Upstash but 2-3x more expensive per command. Using Upstash directly is cheaper with the same reliability.
- Self-hosted Redis (Railway): Operational burden, not serverless, fixed cost even at low usage, requires connection management in serverless functions.
- Supabase Edge Functions cache: Not designed for application-level caching.

---

## 3. ADR-005 Revised: Real-Time Architecture (Selective Realtime Strategy)

### ADR-005: Selective Supabase Realtime Strategy

**Status:** Accepted (revised from original)

**Context:** The original ADR-005 proposed no Supabase Realtime for inventory updates, using Server Components with fresh queries on each page load. The human asks: "What's the cost/benefit of NOT using Supabase Realtime from launch?"

### Cost/Benefit Analysis: Supabase Realtime

**Benefits of Using Realtime:**

| Benefit | Impact | Features Affected |
|---|---|---|
| Instant updates without page refresh | High UX value for time-sensitive operations | Order notifications (PRD-09), inventory changes during active browsing |
| Push-based architecture (server pushes, client listens) | Eliminates polling and reduces API calls | Retailer dashboard order queue, user order status tracking |
| Native Supabase feature (no additional service) | Zero infrastructure cost | All features |
| Reduces "stale data" perception | Builds user trust in inventory accuracy | Wine availability indicators, retailer inventory health |

**Costs of Using Realtime:**

| Cost | Impact | Severity |
|---|---|---|
| Forces Client Components | Any component that subscribes to Realtime channels must be `'use client'`, losing RSC benefits (server-side rendering, zero JS bundle, direct DB access) | Medium -- mitigated by composing Realtime-aware client components inside Server Component pages |
| Connection limits | Supabase Free tier: 200 concurrent connections. Pro tier: 500. Each open browser tab with a Realtime subscription = 1 connection. | Medium at P0 (20 retailers + early users). High at P2 if every browse page subscribes. |
| Increased client-side complexity | WebSocket lifecycle management, reconnection handling, state synchronization between server-rendered and client-subscribed data | Low -- Supabase SDK handles most of this |
| Battery/bandwidth on mobile | Persistent WebSocket connections drain mobile battery and consume data | Low for retailer dashboards (desktop). Medium for consumer browse (mobile-heavy). |
| Publication management | Every table that needs Realtime must be added to the Supabase publication. Over-publishing creates noise. | Low -- managed via migrations |

### Decision: Selective Realtime Strategy

Use Supabase Realtime **selectively** -- only for features where real-time push provides meaningfully better UX than fresh Server Component renders or short-TTL cache.

**Features that USE Supabase Realtime:**

| Feature | Channel | Why Realtime | Component Type |
|---|---|---|---|
| Retailer Dashboard: Order Queue (PRD-09) | `orders:{orgId}` | Retailers need instant notification of new orders. The <30min confirmation SLA requires push notifications. Polling or page-refresh-based order discovery is unacceptable for a restaurant/shop operator. | Client Component: `OrderQueueLive` wrapping a Server Component initial render |
| Order Status Updates for Consumers (PRD-05) | `order-status:{orderId}` | When a retailer confirms or marks "ready for pickup," the user should see the update without refreshing. This is the core feedback loop of the order experience. | Client Component: `OrderStatusBadge` on order detail page |
| P1: Live Auction Bidding (MODULE_ECOMMERCE) | `auction:{auctionId}` | Auction bidding is inherently real-time. Already designed in MODULE_ECOMMERCE with `auction_bid_feed` table. Not needed for P0. | Client Component: `BidPanel` |

**Features that DO NOT use Realtime:**

| Feature | Why No Realtime | Alternative |
|---|---|---|
| Browse pages / Wine cards (PRD-02) | Browse is read-heavy, not time-sensitive. A wine being "in stock" is accurate enough with 5-minute cache TTL. Subscribing every browse page to inventory channels would consume connection slots and force every wine card to be a Client Component, destroying RSC performance. | Server Components with Upstash cache (5-min TTL on inventory). Fresh data on page load/navigation. |
| Wine detail pages (PRD-04) | Wine content (producer story, tasting notes, flavor profile) changes infrequently. Price/availability is fetched fresh on page load from `retailer_inventory`. | Server Component with 15-min cache on content, fresh inventory query. |
| Producer pages (PRD-04) | Producer stories are editorial content updated by the Cru team, not live data. | Server Component with 15-min cache. |
| Taste profile / Recommendations (PRD-03, PRD-07) | Recommendations update on taste profile changes or new purchases, not continuously. Cache invalidation on write events is sufficient. | Upstash cache with event-driven invalidation. |
| Social feed / Follows (PRD-08) | At P0, the social layer is lightweight (follow/unfollow, share tracking). Not a live feed requiring push updates. | Server Component with revalidation on mutations. |
| Retailer inventory sync status (PRD-09) | Sync happens on a schedule (nightly) or via POS webhooks. The "last synced at" timestamp is sufficient. No need for live push. | Server Component with 10-min cache on analytics. |
| Search results (PRD-02) | Search is a request-response pattern. No benefit to live-updating search results. | Server Component with PostgreSQL FTS query. |

**Implementation Pattern:**

The selective strategy uses a "Server Component shell with Client Component islands" pattern:

```
Retailer Dashboard Page (Server Component)
  Fetches initial order data via DAL (server-side, RLS-filtered)
  Renders page layout, sidebar, analytics (all Server Components)
    OrderQueueLive (Client Component)
      Receives initial orders as props from parent Server Component
      Subscribes to Realtime channel for new/updated orders
      Merges Realtime updates into local state
      Renders order cards with action buttons
```

This preserves RSC benefits for the page shell and static content while enabling Realtime only in the specific components that need it.

**Connection Budget:**

| Phase | Realtime Users | Est. Peak Concurrent Connections | Supabase Tier Capacity |
|---|---|---|---|
| P0 | 20 retailers + ~50 active consumers checking orders | ~70 | Pro tier: 500 (70% headroom) |
| P1 | 50 retailers + ~200 active consumers + auction bidders | ~250 | Pro tier: 500 (50% headroom) |
| P2 | 200 retailers + ~1,000 active consumers | ~1,200 | Need Team/Enterprise tier or connection multiplexing |

At P0 and P1, connection usage is well within Supabase Pro tier limits. At P2, if connection pressure becomes an issue, options include: Supabase Team tier (higher limits), connection multiplexing via Supabase Realtime's broadcast feature (one server-side subscription fans out to many clients), or migrating high-volume channels to a dedicated WebSocket service.

**Consequences:**
- Browse pages remain Server Components (best for SEO, performance, initial load)
- Retailer dashboard has fast order notification (critical for operational SLA)
- Consumer order tracking feels responsive without requiring push notifications at P0
- Connection budget stays well within limits at P0/P1
- Clear migration path to more Realtime features at P1+ (add channels as needed)

---

## 4. CG-1 Resolution: Wine/Producer Data Ownership

### Final Decision: Supabase is the Canonical Source of Truth

Human confirmation: "All wines/producers live in Supabase. Supabase is ultimate source of truth."

### Data Ownership Map

```
SUPABASE (Source of Truth)                    MEDUSA (Commerce Layer)
================================              ================================
wines                                         Product
  id (UUID) ------------------------------>   metadata.supabase_wine_id
  name                                        title (synced from wines.name)
  slug                                        handle (synced from wines.slug)
  vintage                                     wine_details.vintage
  varietal                                    wine_details.varietal
  region                                      wine_details.region
  appellation                                 wine_details.appellation
  producer_id (FK -> producers)
  tasting_description
  food_pairings (JSONB)
  flavor_profile (JSONB)
  farming_practices (JSONB)
  is_organic, is_biodynamic
  hero_image_url
  ...all content/discovery fields

producers                                     (No Medusa equivalent)
  id (UUID)
  name, slug, region, country
  story_content (markdown)
  farming_practices (JSONB)
  hero_image_url
  ...all storytelling fields

retailer_inventory                            InventoryItem (per stock location)
  wine_id (FK -> wines)                       product_variant_id
  retailer_id (FK -> retailers via org)       stock_location_id
  price                                       (Medusa variant prices)
  quantity                                    stocked_quantity
  stock_status                                (derived from quantity)
```

### Sync Direction: Supabase --> Medusa (One-Directional)

```
Wine Created/Updated in Supabase
    |
    v
Sync Trigger: Database trigger on wines table fires a webhook
    |
    v
Webhook Handler: app/api/webhooks/internal/wine-sync/route.ts
    |
    v
Check: Does a Medusa Product exist for this wine?
    |
    +-- NO: Create Medusa Product via admin API
    |       - title = wines.name
    |       - handle = wines.slug
    |       - metadata.supabase_wine_id = wines.id
    |       - Create wine_details module link
    |       - Create default variant
    |
    +-- YES: Update Medusa Product via admin API
            - Sync changed fields (title, handle, wine_details)
            - Preserve Medusa-managed data (pricing, inventory)
```

### Sync Trigger Mechanism

For P0, the sync trigger is a **Supabase Database Webhook** (pg_net extension) that fires an HTTP POST to our sync endpoint when rows in the `wines` table are inserted or updated. This is simpler than Supabase Edge Functions and keeps the sync logic in our Next.js application code where it can access the Medusa admin SDK.

```sql
-- In migration: enable pg_net and create webhook trigger
CREATE OR REPLACE FUNCTION notify_wine_sync()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.settings.wine_sync_webhook_url'),
    body := jsonb_build_object(
      'wine_id', NEW.id,
      'action', TG_OP,
      'secret', current_setting('app.settings.internal_webhook_secret')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_wine_sync
  AFTER INSERT OR UPDATE ON wines
  FOR EACH ROW EXECUTE FUNCTION notify_wine_sync();
```

### When Does a Wine Get a Medusa Product?

Not every wine in Supabase needs a Medusa Product. A Medusa Product is only created when a wine becomes **purchasable** -- meaning at least one retailer has it in their inventory. The sync flow is:

1. Wine added to Supabase `wines` table (content only, no Medusa Product yet)
2. Retailer uploads inventory (CSV or POS sync) that includes this wine
3. `retailer_inventory` row is created
4. Inventory sync handler checks: does this wine have a Medusa Product?
5. If not, create one via the wine sync mechanism
6. Create a Medusa InventoryItem at the retailer's stock location

This means the wine content catalog can grow independently of the commerce catalog. Editorial team can add wines that are not yet sold by any retailer (for discovery, taste matching, producer storytelling) without polluting the Medusa product catalog.

### Cross-System Query Pattern

For pages that need data from both systems (e.g., Wine Detail Page):

```typescript
// Server Component: app/(app)/[orgSlug]/wines/[slug]/page.tsx
// Fetches from both sources in parallel using React Suspense

async function WineDetailPage({ params }) {
  const { slug } = await params
  const supabase = await createClient()

  // Parallel fetch: Supabase content + inventory
  const [wineResult, inventoryResult] = await Promise.all([
    getWineBySlug(supabase, slug),           // DAL: Supabase
    getRetailersForWine(supabase, slug),      // DAL: Supabase (retailer_inventory join)
  ])

  // Medusa data (pricing, cart eligibility) only needed if wine is purchasable
  let medusaProduct = null
  if (wineResult.data?.medusa_product_id) {
    medusaProduct = await getMedusaProduct(wineResult.data.medusa_product_id)
  }

  return <WineDetail wine={wineResult.data} retailers={inventoryResult.data} product={medusaProduct} />
}
```

### Data Integrity Safeguards

1. **Reconciliation job**: A nightly Vercel Cron job compares Supabase `wines` (where at least one `retailer_inventory` row exists) with Medusa Products. Any drift is logged and corrected.
2. **Medusa product ID back-reference**: When a Medusa Product is created, store `medusa_product_id` on the Supabase `wines` row for fast lookup.
3. **Deletion cascade**: If a wine is deleted from Supabase, the sync webhook archives (not deletes) the corresponding Medusa Product.
4. **Immutable Supabase IDs**: Medusa's `metadata.supabase_wine_id` is set once and never changed. This is the join key.

---

## 5. CG-2 Resolution: Schema Design Principles and Table Categorization

### Design Principles for All 18 Tables

These principles guide the sr-backend agent when designing full table schemas during Phase 2 (backend implementation):

**1. Modular Extensibility**
- Each table should represent a single, well-bounded domain concept
- Use JSONB columns for semi-structured data that may evolve (e.g., `metadata`, `settings`, `capabilities`)
- Every JSONB column MUST have a corresponding Zod schema in `lib/validations/` that validates structure at the application layer
- Prefer adding nullable columns to existing tables over creating new join tables for 1:1 relationships
- When a concept clearly has 1:N or N:M cardinality, use a separate table from the start

**2. Flexible JSONB Usage**
- JSONB is appropriate for: user preferences, feature flags, configuration objects, tag arrays, and data that varies by context
- JSONB is NOT appropriate for: fields that need foreign key relationships, fields that need individual indexing for query performance, or fields that represent distinct entities
- Every JSONB column should have a GIN index if it will be queried with containment operators (`@>`, `?`, `?|`)
- Application-layer validation (Zod) enforces JSONB structure; the database stores it as untyped JSON

**3. Growth-Ready Design**
- All tables include `created_at TIMESTAMPTZ DEFAULT now()` and `updated_at TIMESTAMPTZ DEFAULT now()` with trigger
- All tables include `created_by UUID REFERENCES profiles(id)` for audit trail (nullable for system-created records)
- All data tables include the standard composite index `(org_id, id)` as specified by migration rules
- Use enums for values with a known, bounded set (e.g., `stock_status`, `sync_source`). Use text for values that may grow unboundedly (e.g., tag names, occasion names).
- Prefer `TEXT` over `VARCHAR(n)` -- length validation happens at the Zod layer, not the database layer
- Use `NUMERIC(10,2)` for money fields (never floating point)

**4. Proactive Indexing**
- Every FK column gets a B-tree index (enables efficient JOINs)
- Slug columns get a unique B-tree index (URL lookups)
- Columns used in WHERE clauses of common queries get targeted indexes
- JSONB columns queried with operators get GIN indexes
- Spatial columns get GIST indexes (PostGIS)
- Full-text search columns get GIN indexes on `tsvector`
- Partial indexes where applicable (e.g., `WHERE status = 'active'`, `WHERE is_active = true`)

**5. RLS-Ready by Default**
- Every table has RLS enabled
- Standard org-scoped policies (SELECT, INSERT, UPDATE by membership; DELETE by admin/owner)
- Exceptions documented explicitly (see ownership patterns below)
- User-scoped tables use `user_id = auth.uid()` instead of org_id membership subquery
- Content-scoped tables are readable by all authenticated users but writable only by platform admins

### Table Categorization by Ownership Pattern

#### User-Scoped Tables (RLS by user_id, no org_id)

These tables belong to individual users, not organizations. A user's taste profile, wishlist, and social graph are personal data that span organizational boundaries.

| Table | Key Relationships | RLS Pattern |
|---|---|---|
| `profiles` | PK = `auth.users.id` | SELECT: own profile is readable by self + anyone (public profiles). UPDATE: own profile only. |
| `taste_profiles` | FK: `user_id -> profiles.id` | SELECT/UPDATE: `user_id = auth.uid()` only. One per user. |
| `taste_profile_wines` | FKs: `user_id -> profiles.id`, `wine_id -> wines.id` | SELECT/UPDATE/DELETE: `user_id = auth.uid()` |
| `wishlists` | FK: `user_id -> profiles.id` | SELECT/UPDATE/DELETE: `user_id = auth.uid()` |
| `wishlist_items` | FKs: `wishlist_id -> wishlists.id`, `wine_id -> wines.id` | SELECT/DELETE: join through wishlist ownership to `user_id = auth.uid()` |
| `user_preferences` | FK: `user_id -> profiles.id` | SELECT/UPDATE: `user_id = auth.uid()`. One per user. |
| `follows` | FKs: `follower_id -> profiles.id`, `following_id -> profiles.id` | SELECT: `follower_id = auth.uid() OR following_id = auth.uid()`. INSERT/DELETE: `follower_id = auth.uid()` |
| `share_events` | FK: `user_id -> profiles.id` | SELECT/INSERT: `user_id = auth.uid()` |
| `recommendation_events` | FKs: `user_id -> profiles.id`, `wine_id -> wines.id` | SELECT/INSERT: `user_id = auth.uid()`. System can also write via service role. |

**Exception documentation**: These tables intentionally do NOT have `org_id`. User identity in Cru is personal, not organizational. A user can be a member of multiple organizations (their personal org, a retailer org they work at) but their taste profile, wishlist, and social graph are theirs alone. This is a documented exception to the "every table has org_id" rule.

#### Org-Scoped Tables (RLS by org_id via memberships)

These tables belong to organizations and follow the standard RLS pattern from SYSTEM_ARCHITECTURE Section 3.

| Table | Org Type | Key Relationships | Notes |
|---|---|---|---|
| `organizations` | All types | Self-referential | Gets new `type` column (see CG-4) |
| `memberships` | All types | FKs: `user_id`, `org_id` | Standard join table |
| `invitations` | All types | FK: `org_id` | Standard pattern |
| `retailers` (metadata) | `type = 'retailer'` | FK: `org_id -> organizations.id` | Retailer-specific settings, one per retailer org |
| `retailer_inventory` | `type = 'retailer'` | FKs: `org_id`, `wine_id -> wines.id` | RLS: retailer can manage own inventory. All authenticated users can SELECT (for availability display). |

**Note on `retailer_inventory` RLS**: This table has a special dual-access pattern. Retailer org members can INSERT/UPDATE/DELETE their own inventory. But ALL authenticated users need SELECT access to query wine availability. The SELECT policy is: `TRUE` for authenticated users (or use a service role view). The write policies use standard org-scoped membership checks.

#### Content-Scoped Tables (Platform-Managed, Publicly Readable)

Wine and producer content is managed by the Cru platform team (a "platform" org) but readable by all authenticated users. This is editorial content that drives the entire discovery experience.

| Table | Managed By | Key Relationships | RLS Pattern |
|---|---|---|---|
| `wines` | Platform org (admin/content team) | FK: `producer_id -> producers.id` | SELECT: all authenticated users. INSERT/UPDATE/DELETE: platform org admins only. |
| `producers` | Platform org | None (top-level entity) | SELECT: all authenticated users. INSERT/UPDATE/DELETE: platform org admins only. |
| `producer_photos` | Platform org | FK: `producer_id -> producers.id` | Same as producers. |
| `wine_tags` | Platform org | FK: `wine_id -> wines.id` | Same as wines. |
| `wine_occasions` | Platform org | FK: `wine_id -> wines.id` | Same as wines. |
| `curated_collections` | Platform org (curators) | FK: `curator_id -> profiles.id` | SELECT: all authenticated (where `is_active = true`). INSERT/UPDATE/DELETE: platform org admins. |
| `curated_collection_items` | Platform org | FKs: `collection_id -> curated_collections.id`, `wine_id -> wines.id` | Same as collections. |

**RLS implementation for content tables**: These tables DO have an `org_id` column, but it always references the platform organization's ID. The SELECT policy is permissive (all authenticated users can read). Write policies check membership in the platform org with admin role. This maintains the architectural consistency of `org_id` on every table while allowing public readability.

```sql
-- Example content table RLS pattern
-- SELECT: any authenticated user
CREATE POLICY "All users can view wines"
  ON wines FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE: only platform org members with admin+ role
CREATE POLICY "Platform admins can manage wines"
  ON wines FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
```

### Schema Design Deliverable

The sr-backend agent will produce complete SQL migration files for all 18 tables during Phase 2. Each migration will include:
- Full column definitions with types, constraints, defaults
- All foreign key relationships
- RLS enablement and all four policies (SELECT, INSERT, UPDATE, DELETE)
- All indexes (composite, FK, slug, GIN, spatial, full-text)
- `updated_at` trigger
- JSONB column documentation (expected structure, with reference to Zod schema)

---

## 6. CG-3 Resolution: Retailer Integration Architecture

### POS Adapter Pattern

All POS integrations follow a common adapter interface. Each POS system gets a dedicated adapter module. The interface is designed to normalize the wildly different APIs into a consistent internal model.

```
lib/integrations/pos/
  types.ts              # Common types and interface definition
  adapter-factory.ts    # Factory that returns the correct adapter by POS type
  adapters/
    square.ts           # Square for Retail adapter
    shopify.ts          # Shopify POS adapter
    lightspeed.ts       # Lightspeed Retail adapter
    clover.ts           # Clover adapter
    korona.ts           # Korona POS adapter
    toast.ts            # Toast adapter (if needed)
    touchbistro.ts      # TouchBistro adapter (if needed)
    revel.ts            # Revel Systems adapter
    spoton.ts           # SpotOn adapter
    ncr-aloha.ts        # NCR Aloha adapter (if needed)
    csv.ts              # Universal CSV import adapter (always available)
  sync/
    scheduler.ts        # Cron-based full sync scheduler
    webhook-handler.ts  # Incoming POS webhook processor
    reconciler.ts       # Nightly reconciliation job
```

**Common Adapter Interface:**

```typescript
// lib/integrations/pos/types.ts

export interface POSInventoryItem {
  externalId: string        // POS system's unique item ID
  name: string              // Wine name as entered in POS
  producer?: string         // Producer/brand name
  vintage?: number          // Vintage year
  varietal?: string         // Grape variety
  sku?: string              // POS SKU
  barcode?: string          // UPC/EAN barcode
  price: number             // Retail price in cents
  quantity: number           // Current stock count
  category?: string         // POS category (e.g., "Red Wine", "Spirits")
  lastModified?: Date       // When this item was last changed in POS
}

export interface POSAdapter {
  readonly posType: string

  // Authentication
  authenticate(credentials: POSCredentials): Promise<POSConnection>
  refreshToken(connection: POSConnection): Promise<POSConnection>

  // Inventory operations
  fetchFullInventory(connection: POSConnection): Promise<POSInventoryItem[]>
  fetchInventoryChanges(connection: POSConnection, since: Date): Promise<POSInventoryItem[]>

  // Webhook support (not all POS systems support webhooks)
  supportsWebhooks: boolean
  parseWebhookPayload?(payload: unknown, headers: Record<string, string>): POSInventoryItem[]
  verifyWebhookSignature?(payload: string, signature: string, secret: string): boolean
}
```

### POS System Tiering

The 10 POS systems are tiered by: (1) likelihood of use by indie wine shops/bottle shops, (2) API quality and documentation, (3) webhook support, and (4) implementation effort.

**Tier 1: Build for P0 (4 integrations + CSV)**

| POS System | Wine Retail Relevance | API Quality | Webhooks | Priority Rationale |
|---|---|---|---|---|
| **Square** | **High** -- widely used by small retail, simple setup, free basic POS | Excellent REST API, well-documented, generous free tier | Yes (webhooks for inventory changes) | Most likely POS for small indie wine shops. Free to start. Strong developer ecosystem. |
| **Lightspeed Retail** | **High** -- purpose-built for retail, popular among specialty shops | Good REST API, OAuth2, inventory management focused | Yes (inventory webhooks) | Strong fit for wine retail. Good inventory management features. Popular with boutique retailers. |
| **Shopify POS** | **High** -- used by retailers with online stores, good for omnichannel | Excellent GraphQL API, best-in-class docs | Yes (extensive webhook support) | Highly common among LA wine shops with online presence. Rich API. Elevated to P0 based on LA retailer landscape. |
| **Clover** | **High** -- common small business POS, widely deployed among LA wine retailers | Adequate REST API, reasonable docs | Yes | Fiserv-owned, widely deployed in LA indie retail. Elevated to P0 based on LA retailer landscape. |
| **CSV Import** | **Universal** -- works for every retailer regardless of POS | N/A | N/A | Always available as fallback. Zero integration effort per retailer. |

**Tier 2: Build for P1 (1 integration)**

| POS System | Wine Retail Relevance | API Quality | Webhooks | Notes |
|---|---|---|---|---|
| **Korona POS** | **Medium** -- specifically targets specialty retail including wine/liquor | Good API, purpose-built for specialty retail | Limited | Good wine retail fit. Smaller developer community but solid product. |

**Tier 3: Evaluate for P2 (build only if retailer census demands it)**

| POS System | Wine Retail Relevance | API Quality | Notes |
|---|---|---|---|
| **SpotOn** | Medium -- growing in restaurant/retail space | Decent API | Growing platform, could be relevant at scale. |
| **Revel Systems** | Medium -- iPad POS for retail and restaurants | Adequate API | Less common for pure wine retail. |

**Tier 4: Deprioritize (restaurant POS, poor fit for wine retail)**

| POS System | Wine Retail Relevance | API Quality | Rationale for Deprioritization |
|---|---|---|---|
| **Toast** | **Low** -- primarily a restaurant POS | Restaurant-focused API | Toast is built for restaurants, not retail. A wine shop using Toast is unusual. If encountered, CSV import is the fallback. |
| **TouchBistro** | **Low** -- restaurant-only POS | Limited API | No retail inventory management. Restaurant-only. |
| **NCR Aloha** | **Low** -- restaurant POS (formerly Aloha by NCR) | Enterprise API, complex onboarding | Enterprise restaurant POS. Not for indie retail. |

**Recommendation for P0:** Build Square + Lightspeed Retail + Shopify POS + Clover adapters + CSV import. This covers the four most common POS systems among LA indie wine shops and bottle shops, plus a universal CSV fallback. Conduct a retailer census with the 20 target retailers to validate coverage.

### CSV Import Pipeline

CSV import is the universal fallback that every retailer can use, regardless of their POS system. The pipeline has six stages:

```
[Upload] --> [Parse] --> [Validate] --> [Fuzzy Match] --> [Review] --> [Confirm]
```

**Stage 1: Upload**
- Retailer uploads CSV file via the retailer dashboard
- Supported formats: CSV, TSV, XLS, XLSX (parsed via `SheetJS/xlsx` library)
- Maximum file size: 10MB (covers ~50K rows)
- Store raw file in Supabase Storage: `{orgId}/imports/{timestamp}-{filename}`

**Stage 2: Parse**
- Parse CSV into rows using a streaming parser (handles large files)
- Auto-detect column mapping using header matching:
  - Required: wine name (or product name), price, quantity
  - Optional: producer/brand, vintage, varietal, SKU, barcode, category
- Present column mapping UI for retailer to confirm/adjust
- Handle common variations: "Wine Name" vs "Product" vs "Item Description"

**Stage 3: Validate**
- Validate each row against a Zod schema:
  - `name`: required, non-empty string
  - `price`: required, positive number (parse currency symbols, handle cents)
  - `quantity`: required, non-negative integer
  - `vintage`: optional, 4-digit year between 1900-2030
- Flag invalid rows (missing required fields, unparseable price, etc.)
- Display validation summary: X valid, Y warnings, Z errors

**Stage 4: Fuzzy Match (Wine Matching Algorithm)**
- For each valid CSV row, attempt to match against the canonical `wines` table
- See "Wine Fuzzy Matching Algorithm" below for details
- Output three categories:
  - **Auto-matched** (confidence >= 90%): linked to canonical wine record automatically
  - **Needs review** (confidence 70-89%): presented to admin with top 3 candidate matches
  - **Unmatched** (confidence < 70%): flagged for manual review, option to create new wine record

**Stage 5: Review**
- Admin review interface showing:
  - CSV row data alongside candidate matches
  - Confidence score for each candidate
  - One-click approve/reject per match
  - "Create new wine" option for genuinely new wines
- Batch approve: auto-matched rows can be approved in bulk

**Stage 6: Confirm**
- Approved matches create/update `retailer_inventory` rows
- Upsert logic: if retailer already has an inventory record for this wine, update price/quantity
- Track sync source as `csv` and update `last_synced_at`
- Display import summary: X wines matched, Y created new, Z skipped

### Wine Fuzzy Matching Algorithm

The matching algorithm combines multiple signals to produce a confidence score between 0 and 100.

**Input:** A CSV row with `name`, optionally `producer`, `vintage`, `varietal`

**Matching signals and weights:**

| Signal | Weight | Method | Notes |
|---|---|---|---|
| Name similarity | 40% | Trigram similarity (`pg_trgm` extension) on normalized name | Normalize: lowercase, remove punctuation, expand abbreviations (Dom. -> Domaine, Ch. -> Chateau) |
| Producer match | 25% | Trigram similarity on producer name against `producers.name` | If CSV has no producer field, attempt to extract from wine name |
| Vintage match | 20% | Exact match on vintage year | If CSV has no vintage, this signal is excluded and other weights proportionally increase |
| Varietal match | 15% | Exact match or synonym lookup (e.g., Syrah = Shiraz, Pinot Grigio = Pinot Gris) | Use a varietal synonym table |

**Algorithm:**

```sql
-- PostgreSQL function for fuzzy wine matching
-- Requires: CREATE EXTENSION pg_trgm;

CREATE OR REPLACE FUNCTION match_wine(
  p_name TEXT,
  p_producer TEXT DEFAULT NULL,
  p_vintage INTEGER DEFAULT NULL,
  p_varietal TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  wine_id UUID,
  wine_name TEXT,
  producer_name TEXT,
  vintage INTEGER,
  varietal TEXT,
  confidence NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.name,
    p.name AS producer_name,
    w.vintage,
    w.varietal,
    (
      -- Name similarity (40% weight, or higher if other fields missing)
      similarity(lower(w.name), lower(p_name)) * 40
      -- Producer similarity (25% weight)
      + CASE
          WHEN p_producer IS NOT NULL AND p.name IS NOT NULL
          THEN similarity(lower(p.name), lower(p_producer)) * 25
          ELSE 0
        END
      -- Vintage exact match (20% weight)
      + CASE
          WHEN p_vintage IS NOT NULL AND w.vintage = p_vintage THEN 20
          WHEN p_vintage IS NOT NULL AND w.vintage IS NOT NULL THEN 0
          ELSE 0
        END
      -- Varietal match (15% weight)
      + CASE
          WHEN p_varietal IS NOT NULL AND lower(w.varietal) = lower(p_varietal) THEN 15
          WHEN p_varietal IS NOT NULL AND w.varietal IS NOT NULL THEN
            similarity(lower(w.varietal), lower(p_varietal)) * 15
          ELSE 0
        END
    )::NUMERIC AS confidence
  FROM wines w
  LEFT JOIN producers p ON w.producer_id = p.id
  WHERE similarity(lower(w.name), lower(p_name)) > 0.2  -- Pre-filter: at least 20% name similarity
  ORDER BY confidence DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Pre-processing (application layer before DB query):**
1. Normalize input: lowercase, strip special characters, expand common abbreviations
2. Abbreviation dictionary: `Dom.` -> `Domaine`, `Ch.` -> `Chateau`, `Cht.` -> `Chateau`, `RSV` -> `Reserve`, `VV` -> `Vieilles Vignes`
3. Extract vintage: regex `\b(19|20)\d{2}\b` from name if no separate vintage field
4. Varietal synonym lookup: `Syrah/Shiraz`, `Pinot Grigio/Pinot Gris`, `Garnacha/Grenache`, `Zinfandel/Primitivo`

**Required PostgreSQL extension:**

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Add trigram index for efficient fuzzy matching
CREATE INDEX idx_wines_name_trgm ON wines USING GIN (name gin_trgm_ops);
CREATE INDEX idx_producers_name_trgm ON producers USING GIN (name gin_trgm_ops);
```

### PostGIS Setup (See Section 8 for full details)

PostGIS is enabled as part of the retailer integration architecture. Retailer locations are stored as `geography(Point, 4326)` columns with GIST spatial indexes. Distance queries use `ST_DWithin` for radius filtering and `ST_Distance` for sorting.

---

## 7. CG-4 Resolution: Retailer Auth Model

### Decision: Retailers ARE Organizations

The cleanest model that leverages all existing infrastructure: each retailer is an organization with `type = 'retailer'`. Retailer staff are members of the retailer organization, using the existing `memberships` table and role system.

**This eliminates the need for a separate `retailer_members` table.** The `retailer_members` table from PRD-09 is replaced by standard `memberships` rows where the org has `type = 'retailer'`.

### Organization Type Column

Add a `type` column to the `organizations` table:

```sql
-- New enum for organization types
CREATE TYPE org_type AS ENUM ('platform', 'retailer', 'personal');

-- Add type column to organizations
ALTER TABLE organizations ADD COLUMN type org_type NOT NULL DEFAULT 'personal';
```

| Type | Description | Example |
|---|---|---|
| `platform` | The Cru platform organization. Owns wine content, producer content, curated collections. Has platform admin users. | "Cru" |
| `retailer` | A retail partner organization. Has its own staff, inventory, orders, settings. | "Silver Lake Wine", "Hi-Lo Liquor Market" |
| `personal` | A consumer user's default organization. Created automatically at signup. | "Matt's Account" |

**Note on `producer` type:** Producers are currently content entities in the `producers` table, not organizations. If producers need their own dashboard (P1+ DTC features), a `producer` org type can be added via migration. For P0, producers are managed by the platform team, not self-serve.

### Retailer Metadata Table

The `retailers` table becomes a metadata/settings table linked to the retailer organization via `org_id`:

```sql
CREATE TABLE retailers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  -- Location
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL DEFAULT 'CA',
  zip             TEXT NOT NULL,
  location        geography(Point, 4326),  -- PostGIS point
  phone           TEXT,
  email           TEXT,
  -- Commerce
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 12.00,  -- Platform commission %
  stripe_connect_account_id TEXT UNIQUE,                 -- Stripe Connect Express
  stripe_connect_onboarded  BOOLEAN DEFAULT FALSE,
  -- POS
  pos_type        TEXT,  -- 'square', 'lightspeed', 'csv', etc.
  pos_credentials JSONB DEFAULT '{}',  -- Encrypted POS API credentials
  -- Fulfillment
  fulfillment_capabilities JSONB DEFAULT '{"pickup": true, "delivery": false}',
  delivery_radius_miles     NUMERIC(5,1),
  delivery_fee_cents        INTEGER DEFAULT 0,
  estimated_delivery_minutes INTEGER,
  -- Operations
  hours_of_operation JSONB,  -- { "mon": "10:00-20:00", "tue": "10:00-20:00", ... }
  -- Audit
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### Membership Roles for Retailers

The existing `member_role` enum (`owner`, `admin`, `member`, `viewer`) is sufficient for retailer organizations. No new role values are needed.

| Role | Context: Retailer Org | Permissions |
|---|---|---|
| `owner` | Retailer owner/manager. Created during retailer onboarding. | Full access: orders, inventory, settings, staff management, analytics, Stripe Connect onboarding. |
| `admin` | Senior staff or co-manager | Orders, inventory, analytics. Cannot modify Stripe Connect or commission settings. |
| `member` | Staff member who processes orders | View and manage orders (confirm, mark ready, complete). View inventory. No settings access. |
| `viewer` | Read-only access (e.g., an investor or auditor) | View orders and analytics only. No actions. |

### Dual Identity: Consumers Who Work at Retailers

A user can be a member of multiple organizations simultaneously. This is already supported by the `memberships` table (which has `UNIQUE(user_id, org_id)`, allowing one membership per org per user, but a user can have memberships in many orgs).

Example: Sarah is a consumer on Cru (member of her personal org) AND a staff member at Silver Lake Wine (member of the retailer org).

```
Sarah's memberships:
  org_id: sarah-personal-org  |  role: owner    |  type: personal
  org_id: silver-lake-wine    |  role: member   |  type: retailer
```

When Sarah navigates to `/silver-lake-wine/dashboard`, the org layout resolves her membership in the Silver Lake Wine org with role `member`, and renders the retailer dashboard. When she navigates to `/sarah/wines`, it resolves her personal org membership.

### Retailer Dashboard Routes

```
app/(app)/[orgSlug]/
  dashboard/             # Retailer dashboard (only rendered if org.type === 'retailer')
    page.tsx             # Order queue + summary stats
    orders/
      page.tsx           # Full order list with filters
      [orderId]/
        page.tsx         # Order detail with actions
    inventory/
      page.tsx           # Inventory health, quick stock update, sync status
    analytics/
      page.tsx           # Top wines, order summary, views
    settings/
      page.tsx           # Store info, fulfillment, POS connection, notifications
```

The `[orgSlug]` layout checks `org.type`:
- If `retailer`: render retailer dashboard layout with order queue, inventory nav
- If `personal`: render consumer layout with browse, profile, orders
- If `platform`: render admin layout with content management, retailer management

### Retailer Onboarding Flow

1. Cru operations team creates a new organization with `type = 'retailer'`
2. A `retailers` metadata row is created with store address, contact info
3. An invitation is sent to the retailer owner's email
4. Retailer owner accepts invitation, creating their account + membership
5. Retailer owner completes Stripe Connect Express onboarding (see Section 11)
6. Retailer uploads first CSV inventory or connects POS system
7. Retailer is live on Cru

This flow uses the existing invitation system from SYSTEM_ARCHITECTURE -- no custom retailer signup flow needed.

---

## 8. CG-5 Resolution: PostGIS Design

### Extension Enablement

```sql
-- In the first retailer integration migration
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

Supabase natively supports PostGIS. The extension is pre-installed but needs to be enabled via migration.

### Geography Column on Retailers

The `retailers` table includes a `geography(Point, 4326)` column. SRID 4326 is the WGS 84 standard (GPS coordinates).

```sql
-- Column definition (included in retailers table creation above)
location geography(Point, 4326)

-- Populate from address coordinates (done during retailer onboarding or CSV import)
-- Example: UPDATE retailers SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
```

### Spatial Index

```sql
-- GIST index for spatial queries (mandatory for performance)
CREATE INDEX idx_retailers_location ON retailers USING GIST (location);
```

### Distance Query Patterns

**Find retailers within a radius:**

```sql
-- Find all retailers within 15 miles of user's location
-- ST_DWithin uses meters for geography type; 15 miles = 24140 meters
SELECT
  r.id,
  o.name AS store_name,
  o.slug,
  r.address,
  r.city,
  ST_Distance(r.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1609.34 AS distance_miles
FROM retailers r
JOIN organizations o ON r.org_id = o.id
WHERE ST_DWithin(
  r.location,
  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
  $3 * 1609.34  -- Convert miles to meters
)
ORDER BY distance_miles ASC;
-- $1 = user longitude, $2 = user latitude, $3 = radius in miles
```

**Find retailers that carry a specific wine, sorted by distance:**

```sql
-- Core query for "Where can I buy this wine nearby?"
SELECT
  r.id AS retailer_id,
  o.name AS store_name,
  o.slug,
  r.address,
  r.city,
  ri.price,
  ri.quantity,
  ri.stock_status,
  ri.last_synced_at,
  r.fulfillment_capabilities,
  ST_Distance(r.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1609.34 AS distance_miles
FROM retailer_inventory ri
JOIN retailers r ON ri.org_id = r.org_id
JOIN organizations o ON r.org_id = o.id
WHERE ri.wine_id = $3
  AND ri.stock_status != 'out_of_stock'
  AND ST_DWithin(
    r.location,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    $4 * 1609.34  -- radius in miles -> meters
  )
ORDER BY distance_miles ASC
LIMIT 10;
```

**DAL function:**

```typescript
// lib/dal/retailers.ts
export async function getNearbyRetailersForWine(
  supabase: TypedClient,
  wineId: string,
  userLng: number,
  userLat: number,
  radiusMiles: number = 15
) {
  // Use RPC call to execute the PostGIS query
  const { data, error } = await supabase.rpc('get_nearby_retailers_for_wine', {
    p_wine_id: wineId,
    p_lng: userLng,
    p_lat: userLat,
    p_radius_miles: radiusMiles,
  })

  return { data, error }
}
```

### Inventory Availability API

The public API endpoint referenced in PRD-06:

```typescript
// app/api/v1/inventory/check/route.ts
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getNearbyRetailersForWine } from '@/lib/dal/retailers'
import { cache } from '@/lib/cache'

const QuerySchema = z.object({
  wine_id: z.string().uuid(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(100).default(15),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams))

  if (!parsed.success) {
    return Response.json({ error: 'Invalid parameters', details: parsed.error.flatten() }, { status: 400 })
  }

  const { wine_id, lat, lng, radius } = parsed.data
  const cacheKey = `cru:inv:${wine_id}:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}`

  const result = await cache.getOrSet(cacheKey, 300, async () => {
    const supabase = await createClient()
    const { data, error } = await getNearbyRetailersForWine(supabase, wine_id, lng, lat, radius)
    if (error) throw error
    return data
  })

  return Response.json({
    available: result.length > 0,
    retailer_count: result.length,
    retailers: result,
  })
}
```

### Geocoding

Retailer addresses are geocoded to lat/lng coordinates during onboarding. For P0, use a simple geocoding approach:

- **Option A (recommended for P0):** Use the browser's Geolocation API to capture the retailer's coordinates during signup, or manually enter lat/lng from Google Maps.
- **Option B (P1):** Integrate a geocoding API (Google Maps Geocoding or Mapbox) to auto-convert addresses to coordinates. This becomes necessary when onboarding retailers at scale.

User location is captured via: (1) browser Geolocation API (preferred, with permission), or (2) zip code from user preferences, geocoded to a centroid point.

---

## 9. Open Question Resolutions

### OQ-1: Session Duration -- 7 Days (Confirmed)

Supabase Auth configuration:
- Access token TTL: 1 hour (Supabase default, non-configurable)
- Refresh token TTL: 7 days
- Refresh token rotation: enabled (each refresh issues a new refresh token)
- Session persistence: cookie-based via `@supabase/ssr`

Users remain logged in for up to 7 days without re-authentication, as long as they visit the app within the 7-day window (which rotates the refresh token). This balances security with convenience for a consumer app where frequent re-login would cause friction.

### OQ-2: Age Gate -- Checkbox (Confirmed)

P0 implementation: Simple checkbox during signup that states "I confirm I am 21 years of age or older." This is Layer 1 (self-declaration) from MODULE_ECOMMERCE Section 10.

Storage: `profiles.age_verified_at TIMESTAMPTZ` -- set when the user checks the box during signup. If null, the user has not age-verified and cannot browse wine content or place orders.

A second age verification checkpoint occurs at checkout (re-confirm via checkbox). Full identity-based age verification (Veratad API with document/KBA verification) is a P1 feature for delivery orders.

### OQ-3: POS Systems -- Tiered (See Section 6)

10 POS systems identified and tiered. P0 builds Square + Lightspeed Retail + CSV. Retailer census needed to validate priorities.

### OQ-5: Occasion Categories -- 12 Recommended

**Rationale for 12 over 8:** Wine occasions span a wide range of social contexts, and providing too few categories forces awkward grouping that reduces curation quality. 12 categories provide enough specificity for meaningful recommendation matching without overwhelming the content team's tagging workload.

The categories should be:
1. **Weeknight dinner** -- casual, everyday wines under $25
2. **Date night** -- slightly elevated, romantic context
3. **Dinner party** -- crowd-pleasers, good conversation starters
4. **Celebration** -- sparkling, special occasion wines
5. **Outdoor gathering** -- BBQ, picnic, rooftop, easy-drinking
6. **Gift** -- impressive bottles, gift-worthy presentation
7. **Solo unwinding** -- comfort wines, no need to impress
8. **Learning & exploring** -- unusual varieties, new regions, adventure picks
9. **Food pairing** -- wines chosen specifically for their food compatibility
10. **Business entertaining** -- safe, impressive choices for professional contexts
11. **Holiday & seasonal** -- wines that match seasonal moods and foods
12. **Just because** -- spontaneous, no-occasion purchases, everyday drinking

**Implementation:** Occasions are stored in a `wine_occasions` join table (wine_id, occasion_slug). The occasion taxonomy is a constants file (`lib/constants/occasions.ts`), not a database table, because the set is controlled by the product team and changes infrequently. If the set needs to be admin-editable in the future, migrate to a reference table.

**P0 content tagging workload:** With 500-1000 wines and 12 occasion categories, the content team needs to tag each wine with 1-3 occasions. This is approximately 1500-3000 tagging decisions, which is manageable as a spreadsheet-driven batch operation during content seeding.

### OQ-8: Onboarding Flow -- Separate Wizard (Confirmed)

PRD-03 defines a 5-screen onboarding wizard for taste profile creation. This is a standalone flow that runs after signup and before the main browse experience. The wizard is:

1. Welcome + flavor affinity selection (tag picker)
2. Flavor aversion selection
3. Drinking context / occasion preferences
4. Adventurousness scale (1-3: stick to favorites, balanced, always exploring)
5. "Wines I've loved" (autocomplete search to seed the profile)

The wizard can be skipped (users can browse without a taste profile) but is strongly encouraged via UI nudges. Taste profile completion rate is a key onboarding metric.

---

## 10. Medusa Spike Definition

### Goal

Validate that Medusa v2 can support Cru's retailer-scoped cart model and Stripe Connect marketplace payments before committing Medusa as the commerce engine for P0.

### Duration

2-3 days (assigned to sr-backend agent).

### Scope

Build a minimal Medusa v2 instance that proves or disproves the following scenarios:

### Test Scenarios

**Scenario 1: Vendor (Retailer) Setup**
- Create a Medusa vendor entity representing a retailer
- Create products linked to that vendor
- Verify that products can be filtered by vendor
- **Pass criteria:** Products are correctly scoped to vendors. Vendor can be created via admin API. Product-vendor relationship is queryable.

**Scenario 2: Retailer-Scoped Cart**
- Create a cart with metadata `{ retailer_id: "vendor-123" }`
- Add line items to the cart
- Attempt to add a line item from a different vendor -- verify this can be prevented
- **Pass criteria:** Cart can be scoped to a single vendor via metadata or custom middleware. Cross-vendor additions can be rejected at the API level (custom cart middleware or subscriber).

**Scenario 3: Checkout with Stripe**
- Complete the checkout flow using Stripe test mode
- Verify payment intent is created with correct amount
- Verify webhook delivery for `checkout.session.completed`
- **Pass criteria:** Full checkout flow works end-to-end in test mode. Stripe payment intent matches cart total. Webhook fires and can be handled.

**Scenario 4: Stripe Connect Destination Charges**
- Create a Stripe Connect Express test account
- Process a payment with `application_fee_amount` (platform commission)
- Verify funds split: platform fee retained, remainder to connected account
- **Pass criteria:** Payment splits correctly between platform and connected account. Connect account receives payout.

**Scenario 5: Inventory Holds**
- Create an inventory item with quantity 5
- Start checkout, verify inventory is reserved
- Let the hold expire, verify inventory is released
- **Pass criteria:** Medusa's native inventory module supports reservation and automatic release. Hold duration is configurable.

**Scenario 6: Supabase Wine ID Reference**
- Create a Medusa product with `metadata.supabase_wine_id = "some-uuid"`
- Query the product by this metadata field
- **Pass criteria:** Products can be looked up by their Supabase wine ID via metadata query. Latency is acceptable (<100ms).

### Success Criteria

All six scenarios must pass for Medusa to be confirmed as the commerce engine. If any scenario fails, document the specific limitation and its workaround complexity.

| Scenario | Criticality | Acceptable Workaround |
|---|---|---|
| 1: Vendor setup | Must pass | None -- core requirement |
| 2: Retailer-scoped cart | Must pass | Custom middleware is acceptable; native support is ideal |
| 3: Stripe checkout | Must pass | None -- core requirement |
| 4: Stripe Connect | Must pass | If Connect doesn't work through Medusa's payment module, a custom payment provider is acceptable |
| 5: Inventory holds | Should pass | If native holds are insufficient, a custom reservation system in Supabase is acceptable |
| 6: Supabase ID reference | Should pass | If metadata queries are slow, a separate lookup table in Medusa's DB is acceptable |

### Fallback Plan

If the Medusa spike fails (2+ "must pass" scenarios fail without acceptable workarounds):

**Fallback: Custom Commerce on Supabase + Stripe**

Build cart, checkout, and order management directly in Supabase with Stripe integration:

| Component | Medusa Replacement |
|---|---|
| Cart | `carts` + `cart_items` tables in Supabase, managed via DAL + Server Actions |
| Checkout | Server Action: validate cart -> create Stripe Checkout Session with `application_fee_amount` -> redirect |
| Orders | `orders` + `order_items` + `order_status_history` tables in Supabase |
| Inventory holds | Database-level advisory locks or a `reservations` table with TTL cleanup |
| Payment processing | Direct Stripe integration (already in SYSTEM_ARCHITECTURE) |

This fallback adds approximately 2 weeks of development time but eliminates the Medusa dependency, the second database, and the cross-service synchronization complexity. It is a viable path if Medusa proves too constraining for Cru's specific commerce model.

The fallback does NOT affect: wine content (Supabase), producer storytelling (Supabase), search (PostgreSQL FTS), taste profiles (Supabase), social features (Supabase), or retailer integration (Supabase). Only the cart-to-order flow changes.

### Spike Deliverable

The sr-backend agent produces a spike report with:
- Pass/fail for each scenario
- Code samples for any custom middleware or workarounds needed
- Performance measurements (API latency for each operation)
- Recommendation: proceed with Medusa OR proceed with fallback
- If proceeding with Medusa: list of custom modules/middleware needed and estimated effort

---

## 11. Stripe Connect P0 Architecture

### Decision: Stripe Connect Express from P0

Human feedback: "Stripe Connect from P0." This is a significant upgrade from the original architecture review recommendation (manual ACH payouts at P0, Connect at P1). Stripe Connect Express is the right choice for automated marketplace payouts and is better long-term despite the additional upfront setup.

### How Stripe Connect Works for Cru

```
Consumer places order for $50 wine at Silver Lake Wine
    |
    v
Stripe Checkout Session created with:
  - payment_intent_data.application_fee_amount: $6 (12% commission)
  - payment_intent_data.transfer_data.destination: Silver Lake Wine's Connect account
    |
    v
Consumer pays $50
    |
    v
Stripe splits:
  - $6 -> Cru platform Stripe account (commission)
  - $44 -> Silver Lake Wine's Connect Express account (retailer payout)
    |
    v
Retailer receives payout on their standard Stripe payout schedule (typically 2 business days)
```

### Retailer Stripe Connect Onboarding Flow

1. **Retailer accepts Cru invitation** and creates their account
2. **Retailer navigates to Settings > Payments** in their dashboard
3. **"Connect with Stripe" button** generates a Stripe Connect Account Link
4. **Retailer is redirected to Stripe's hosted onboarding** (Express type):
   - Stripe handles KYC, identity verification, bank account setup
   - Stripe handles 1099 tax reporting for the retailer
   - Cru never touches or stores bank account details
5. **Stripe redirects back to Cru** after onboarding completion
6. **Webhook `account.updated`** fires, Cru stores `stripe_connect_account_id` on the `retailers` table and sets `stripe_connect_onboarded = true`

```typescript
// lib/actions/stripe-connect.ts
'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getOrgMembership } from '@/lib/dal/organizations'
import { getRetailerByOrgId } from '@/lib/dal/retailers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createConnectAccountLink(orgId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const membership = await getOrgMembership(supabase, user.id, orgId)
  if (!membership || membership.role !== 'owner') return { error: 'Only owners can connect Stripe' }

  const retailer = await getRetailerByOrgId(supabase, orgId)
  if (!retailer) return { error: 'Retailer not found' }

  // Create or retrieve Connect account
  let accountId = retailer.stripe_connect_account_id
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: retailer.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        cru_org_id: orgId,
        cru_retailer_id: retailer.id,
      },
    })
    accountId = account.id
    // Store account ID immediately (webhook will confirm full onboarding)
    await updateRetailerStripeAccount(supabase, retailer.id, accountId)
  }

  // Generate onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/${membership.org_slug}/settings/payments?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${membership.org_slug}/settings/payments?success=true`,
    type: 'account_onboarding',
  })

  return { data: { url: accountLink.url } }
}
```

### Checkout with Connect Destination Charges

```typescript
// lib/medusa/storefront/checkout.ts (or custom checkout if Medusa fallback)

export async function createCheckoutSession(
  cartId: string,
  retailerConnectAccountId: string,
  commissionRate: number  // e.g., 0.12 for 12%
) {
  const cart = await getCartDetails(cartId)
  const totalCents = cart.total  // Total in cents

  const applicationFeeCents = Math.round(totalCents * commissionRate)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: cart.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.wine_name },
        unit_amount: item.price_cents,
      },
      quantity: item.quantity,
    })),
    payment_intent_data: {
      application_fee_amount: applicationFeeCents,
      transfer_data: {
        destination: retailerConnectAccountId,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/{CHECKOUT_SESSION_ID}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?cancelled=true`,
    metadata: {
      cart_id: cartId,
      retailer_org_id: cart.retailer_org_id,
    },
  })

  return session
}
```

### Stripe Connect Webhook Handlers

New webhook events to handle:

```typescript
// app/api/webhooks/stripe/route.ts (extended)

switch (event.type) {
  // Existing handlers
  case 'checkout.session.completed':
    // Create order, release inventory hold, notify retailer
    break

  // NEW: Connect account events
  case 'account.updated':
    // Retailer completed Stripe onboarding
    // Update retailers.stripe_connect_onboarded = true
    break

  case 'transfer.created':
    // Payout to retailer initiated
    // Log in retailer's payout history
    break

  case 'transfer.failed':
    // Payout to retailer failed
    // Alert operations team, notify retailer
    break

  case 'payment_intent.succeeded':
    // Payment successful, order can proceed
    break

  case 'charge.refunded':
    // Refund processed -- may need to reverse the Connect transfer
    // Use stripe.transfers.createReversal() if applicable
    break
}
```

### Environment Variables

```
# Stripe (platform account)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Connect
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...  # Separate webhook endpoint for Connect events
```

### Impact on Commerce Architecture

Using Stripe Connect from P0 has these architectural implications:

1. **No manual payout process needed.** The original plan (manual ACH/check) required an operations workflow that would not scale. Stripe Connect automates payouts entirely.

2. **Commission rate is per-retailer.** The `retailers.commission_rate` field allows different retailers to have different commission rates (8-15% per the product spec). This is passed to `application_fee_amount` at checkout time.

3. **1099 tax reporting is handled by Stripe.** For US-based retailers, Stripe handles 1099-K issuance when thresholds are met. Cru does not need to build tax reporting infrastructure.

4. **Refund handling is more complex.** Refunding a Connect payment requires reversing the transfer to the connected account. Stripe's API supports this but it adds a step to the refund workflow.

5. **Retailer onboarding has a new mandatory step.** Retailers must complete Stripe Connect onboarding before they can receive orders. This adds friction but is a one-time setup. Retailers who do not complete Stripe onboarding are visible on the platform (inventory is shown) but their "Buy" button is disabled with a message: "This store is setting up payments. Check back soon."

---

## 12. Updated Risk Assessment

Based on all decisions made in this document, here is the updated risk assessment:

### Risks Reduced

| Original Risk | Original Severity | New Status | Reason |
|---|---|---|---|
| TR-1: Medusa v2 maturity | High | **Medium** (mitigated) | Spike will validate before committing. Fallback plan is concrete and viable. |
| TR-2: Two-database consistency | Medium | **Medium** (mitigated) | One-directional sync (Supabase -> Medusa) is simpler than bidirectional. Sync trigger mechanism defined. Reconciliation job planned. |
| TR-5: POS integration diversity | Medium | **Low** (mitigated) | 10 POS systems tiered. CSV is universal fallback. Square + Lightspeed cover the most likely retailers. |
| CG-4: Retailer auth model | Critical gap | **Resolved** | Retailer-as-org model leverages all existing infrastructure. No new auth patterns needed. |

### Risks Increased

| Risk | Severity | Likelihood | Reason | Mitigation |
|---|---|---|---|---|
| **Stripe Connect onboarding friction** | Medium | Medium | Stripe Connect Express requires retailers to complete KYC verification with Stripe. Some small business owners may be unfamiliar with the process or reluctant to provide banking details to a third party. | Provide clear onboarding documentation. Cru operations team offers white-glove support for the first 20 retailers. Allow retailers to be listed on Cru (discovery) before Connect onboarding is complete (purchases disabled until connected). |
| **Upstash Redis dependency** | Low | Low | Adding a third managed service (alongside Supabase and Vercel). If Upstash experiences downtime, cached data is unavailable. | Graceful degradation: cache misses fall through to direct database queries. Upstash has 99.99% SLA. The `lib/cache/` abstraction allows backend swap. |

### Risks Unchanged

| Risk | Severity | Likelihood | Notes |
|---|---|---|---|
| TR-3: Cross-service latency (Supabase + Medusa) | Medium | Medium | Mitigated by Suspense boundaries and caching, but fundamental latency of two API calls remains. |
| TR-4: RLS performance at scale | Low | Low | Well-indexed. Not a concern at P0-P1 scale. |
| TR-6: Content seeding bottleneck | Medium | High | Not a technical risk. Human writing effort needed. Start Week 1. |

### New Risks Identified

| # | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| TR-7 | **Medusa spike fails** -- If the spike reveals that Medusa cannot support retailer-scoped carts or Stripe Connect destination charges through its payment module, we fall back to custom commerce on Supabase. This adds ~2 weeks to the timeline. | Medium | Medium | Fallback plan is fully defined (Section 10). The spike should be completed before any other commerce development begins. Spike is the first development task after Checkpoint 2 approval. |
| TR-8 | **PostGIS query performance with complex joins** -- The "nearby retailers for wine" query joins `retailer_inventory`, `retailers`, and `organizations` with a spatial filter. With 20 retailers and 500 wines this is trivial, but at P2 scale (200+ retailers, 5K+ wines) the query plan needs monitoring. | Low | Low | GIST spatial index + FK indexes make this performant. Add `EXPLAIN ANALYZE` logging for inventory API queries. Consider a materialized view for hot queries at P2. |
| TR-9 | **Supabase Realtime connection limits at P2** -- Selective Realtime strategy keeps P0/P1 well within limits. At P2 with 200 retailers, each with an open dashboard connection, plus consumers tracking orders, connection count approaches Supabase Pro limits. | Low (P0/P1) / Medium (P2) | Medium | Monitor connection count. At P2, evaluate Supabase Team tier, broadcast-based fan-out, or moving high-volume channels to a dedicated service. |

### Overall Assessment Update

The architecture is now **fully resolved for P0 development**. All critical gaps have concrete solutions. All open questions have answers. The remaining uncertainty is the Medusa spike outcome, which has a defined fallback. The risk profile has improved from the original review:

- **Critical gaps:** 5 -> 0 (all resolved)
- **Open questions requiring human input:** 10 -> 0 (all answered)
- **High-severity risks:** 1 (Medusa maturity, now Medium with spike plan)
- **Blocking dependencies:** 1 (Medusa spike must complete before commerce development)

**The architecture is ready for Checkpoint 2: Work Plan decomposition into epics and stories.**

---

## Appendix: Files to Create/Modify Based on These Decisions

| Artifact | Path | Owner | Phase |
|---|---|---|---|
| Cache utility | `lib/cache/index.ts` | sr-backend | Phase 2 |
| POS adapter interface | `lib/integrations/pos/types.ts` | sr-backend | Phase 2 |
| POS adapter factory | `lib/integrations/pos/adapter-factory.ts` | sr-backend | Phase 2 |
| Square adapter | `lib/integrations/pos/adapters/square.ts` | fullstack-3 | Phase 2 |
| Lightspeed adapter | `lib/integrations/pos/adapters/lightspeed.ts` | fullstack-3 | Phase 2 |
| CSV import adapter | `lib/integrations/pos/adapters/csv.ts` | fullstack-3 | Phase 2 |
| Fuzzy match function | SQL migration | sr-backend | Phase 2 |
| PostGIS enablement | SQL migration | sr-backend | Phase 2 |
| Organizations type column | SQL migration | sr-backend | Phase 2 |
| Retailers metadata table | SQL migration | sr-backend | Phase 2 |
| Wine sync webhook handler | `app/api/webhooks/internal/wine-sync/route.ts` | sr-backend | Phase 2 |
| Stripe Connect actions | `lib/actions/stripe-connect.ts` | fullstack-3 | Phase 2 |
| Stripe Connect webhook extensions | `app/api/webhooks/stripe/route.ts` | fullstack-3 | Phase 2 |
| All 18 table schemas | `supabase/migrations/` | sr-backend | Phase 2 |
| JSONB Zod schemas | `lib/validations/` | sr-backend | Phase 2 |
| Occasion constants | `lib/constants/occasions.ts` | sr-backend | Phase 2 |
| Medusa spike report | `.claude/work-plan/analysis/medusa-spike-report.md` | sr-backend | Phase 2 (first task) |
