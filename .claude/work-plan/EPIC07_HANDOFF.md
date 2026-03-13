# Epic 07 Handoff — AI + Human Curation Engine Backend

> **Created**: 2026-03-12
> **Previous**: EPIC-05c Type Safety Fixes merged (PR #15)
> **Branch**: Create `epic-07/curation-engine` off `main`
> **PRD**: `docs/prds/prd-07-curation-engine.md` (171 lines)
> **Epic File**: `.claude/work-plan/epics/epic-07-curation-engine.md`

---

## Process Instructions (Mandatory)

1. **Work on ONE story at a time, sequentially** in dependency order below
2. **Delegate to `sr-backend`** for migrations, DAL, actions, and engine logic
3. **Load context incrementally** — do NOT load all docs at once
4. **Subagents load their own context** — pass brief summaries and file paths, not full contents
5. **After each story**: commit, verify typecheck (`pnpm turbo typecheck`), mark complete
6. **After all backend stories**: QA review, PR to main
7. **Regenerate `types/database.ts`** after Story 01 migration — update the types file to include the new tables

---

## Scope: Backend Stories Only (CP3)

6 stories, 26 story points total. Frontend stories (07-11) are CP4 and out of scope for this handoff.

| # | Story | Points | Agent | Status |
|---|-------|--------|-------|--------|
| 01 | Curation Database Schema + PostHog Setup | 5 | sr-backend | TODO |
| 02 | Curation DAL Functions | 5 | sr-backend | TODO |
| 03 | Rules-Based Matching Engine | 8 | sr-backend | TODO |
| 04 | Recommendation Explanation Templates | 3 | sr-backend | TODO |
| 05 | Recommendation Caching | 3 | sr-backend | TODO |
| 06 | Dismiss Server Action & PostHog Tracking | 2 | sr-backend | TODO |

---

## Implementation Sequence (Dependency Chain)

```
Story 01 (tables + PostHog client)
  └── Story 02 (DAL functions)
        ├── Story 03 (matching engine) ──── Story 04 (explanation templates)
        │                              └─── Story 05 (caching layer)
        └── Story 06 (dismiss action)
```

**Recommended order:** 01 → 02 → 03 → 04 → 05 → 06

Rationale: Strictly sequential — each story depends on the previous. Story 06 depends on Story 02 DAL functions but is independent of the engine itself, so it could theoretically run after Story 02, but keeping it last avoids interleaving with the engine work.

---

## Dependencies — All Satisfied

| Dependency | Source | Migration | Verified |
|-----------|--------|-----------|----------|
| `profiles` table | EPIC-01 | `20260307000001` | Yes |
| `organizations` table | EPIC-01 | `20260308000001` | Yes |
| `wines` table (with `flavor_profile` JSONB) | EPIC-02 | `20260308000002` | Yes |
| `taste_profiles` table (with `flavor_affinities`, `flavor_aversions`, `adventurousness_score`) | EPIC-03 | `20260308000004` | Yes |
| `wishlists` + `wishlist_items` tables | EPIC-04 | `20260308000008` | Yes |
| `retailer_inventory` table | EPIC-06 | `20260308000011` | Yes |
| `orders` + `order_items` tables | EPIC-05 | `20260312000001` | Yes |

---

## Key Architectural Decisions

### 1. Hybrid Curation: Rules Engine + Human Collections

Two independent recommendation sources:
- **Rules engine**: Scores wines against user's taste profile (flavor affinities, aversions, adventurousness). Returns personalized "Picked for You" results.
- **Curated collections**: Admin-managed themed wine lists ("Staff Picks", "Under $25", etc.) for editorial discovery.

### 2. Scoring Formula (Configurable Weights)

```typescript
matchScore =
  (flavorAffinityMatches x 3.0) +   // How many of user's loved flavors this wine has
  (noAversionViolation x 5.0) +      // Binary: 5 if no aversions violated, 0 if any violated
  (priceRangeMatch x 2.0) +          // 2 if within user's budget range, 0 otherwise
  (localAvailability x 4.0) +        // 4 if in stock at a nearby retailer, 0 otherwise
  (adventurenessBonus x adventurenessScore)  // Diversity bonus scaled by user's openness (1-3)
```

Weights stored in a config object, not hardcoded. Tunable without code changes.

### 3. Table Scoping (CG-2 Resolution)

- `curated_collections` and `curated_collection_items` — **content-scoped** with `org_id` (platform org manages editorial content)
- `user_wine_dismissals` — **user-scoped**, NO `org_id` (lightweight exclusion record, not org-tied)

### 4. Interaction Tracking: PostHog Cloud (Not Supabase Tables)

- **PostHog Cloud free tier** (1M events/month) for all recommendation analytics
- Event types: `recommendation_impression`, `recommendation_click`, `recommendation_dismiss`, `recommendation_wishlist`, `recommendation_purchase`
- **Dismiss is dual-tracked**: PostHog for analytics + Supabase `user_wine_dismissals` for synchronous engine exclusion
- All other events go to PostHog only — no `recommendation_events` Supabase table needed (PRD mentions one but the epic/stories resolved to PostHog-only)

### 5. Caching: Next.js `unstable_cache`

- Per-user cache key: `curation:recommendations:${userId}`
- TTL: 1 hour (3600s)
- Tags: `['curation', 'user:${userId}']` for targeted invalidation
- Invalidation triggers: taste profile update, order completion
- Zero additional infrastructure (Vercel-native)
- Revisit with Upstash Redis at 5K+ users if latency degrades

### 6. Engine Performance Target

- < 500ms p95 for 1,000-wine catalog
- V1: Fetch all candidate wines in one query, score in-memory in the Server Action
- Exclusion set (purchased + dismissed + wishlisted) fetched as wine_id arrays for filtering
- If catalog grows beyond 5,000 wines, consider moving scoring to a Supabase function

### 7. Explanation Templates

- Every recommendation includes a `match_reason` string
- Template system maps match factors to plain-language fragments
- Up to 3 fragments combined into a single natural sentence (~120 chars max)
- Placeholder copy in V1 — marketing-writer refines in Story 11 (CP4)

---

## Tables to Create

### Migration: Curation Tables (Story 01)

**`curated_collections`** (content-scoped, org_id = platform org)
```
id                  UUID PK DEFAULT gen_random_uuid()
org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
title               TEXT NOT NULL
slug                TEXT NOT NULL UNIQUE
description         TEXT
cover_image_url     TEXT
curator_id          UUID NOT NULL REFERENCES auth.users(id)
display_order       INTEGER NOT NULL DEFAULT 0
is_active           BOOLEAN NOT NULL DEFAULT true
start_date          DATE
end_date            DATE
created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
```

**`curated_collection_items`** (content-scoped)
```
id                  UUID PK DEFAULT gen_random_uuid()
org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
collection_id       UUID NOT NULL REFERENCES curated_collections(id) ON DELETE CASCADE
wine_id             UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE
position            INTEGER NOT NULL DEFAULT 0
curator_note        TEXT
created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
UNIQUE(collection_id, wine_id)
```

**`user_wine_dismissals`** (user-scoped, NO org_id)
```
id                  UUID PK DEFAULT gen_random_uuid()
user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
wine_id             UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE
created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
UNIQUE(user_id, wine_id)
```

**RLS Policies:**
- `curated_collections` SELECT: all authenticated users (WHERE `is_active = true` — or admin sees all)
- `curated_collections` INSERT/UPDATE/DELETE: admin only (org member with admin role)
- `curated_collection_items` SELECT: all authenticated users (for items in active collections)
- `curated_collection_items` INSERT/UPDATE/DELETE: admin only
- `user_wine_dismissals` SELECT: own dismissals only (`user_id = auth.uid()`)
- `user_wine_dismissals` INSERT: own dismissals only (`user_id = auth.uid()`)
- `user_wine_dismissals` DELETE: own dismissals only (un-dismiss)

**Indexes:**
- `curated_collections`: `org_id`, `(is_active, display_order)`, `slug`
- `curated_collection_items`: `org_id`, `collection_id`, `(collection_id, position)`
- `user_wine_dismissals`: `user_id`, unique constraint on `(user_id, wine_id)` handles dedup

---

## Files to Create

| Layer | File | Story | Description |
|-------|------|-------|-------------|
| Migration | `supabase/migrations/20260312000003_create_curation_tables.sql` | 01 | curated_collections, curated_collection_items, user_wine_dismissals + RLS + indexes |
| Lib | `lib/analytics/posthog.ts` | 01 | PostHog client init + `captureRecommendationEvent` helper |
| DAL | `lib/dal/collections.ts` | 02 | getActiveCollections, getCollectionWithItems, getCollectionBySlug, CRUD for admin |
| DAL | `lib/dal/wine-dismissals.ts` | 02 | dismissWine, undismissWine, getUserDismissedWineIds |
| DAL | `lib/dal/curation.ts` | 03 | getRecommendationCandidates (fetches taste profile, wines, exclusion sets, availability) |
| Action | `lib/actions/curation.ts` | 03/06 | generateRecommendations, dismissRecommendation, undismissRecommendation |
| Validation | `lib/validations/curation.ts` | 03/06 | generateRecommendationsSchema, dismissWineSchema |
| Lib | `lib/curation/explanation-templates.ts` | 04 | Template system for match_reason generation |
| Lib | `lib/curation/cache.ts` | 05 | Cache wrapper using Next.js unstable_cache with tag-based invalidation |

---

## Existing Schema Context (Consumed Tables — Quick Reference)

### taste_profiles (Migration `20260308000004`)
```
user_id               UUID (unique, references auth.users)
flavor_affinities     JSONB DEFAULT '[]'  -- array of flavor strings
flavor_aversions      JSONB DEFAULT '[]'  -- array of flavor strings
drinking_contexts     JSONB DEFAULT '[]'
adventurousness_score INTEGER (1-3)       -- 1=play it safe, 2=balanced, 3=surprise me
```
**DAL**: `lib/dal/taste-profiles.ts` — `getTasteProfile(client, userId)` returns full profile

### wines (Migration `20260308000002`)
```
id, name, slug, producer_id, vintage, varietal, region, sub_region,
appellation, country, description, flavor_profile JSONB DEFAULT '{}',
image_url, price_min NUMERIC, price_max NUMERIC, ...
```
**DAL**: `lib/dal/wines.ts`

### wishlists + wishlist_items (Migration `20260308000008`)
**DAL**: `lib/dal/wishlists.ts`

### orders + order_items (Migration `20260312000001`)
**DAL**: `lib/dal/orders.ts`

### retailer_inventory (Migration `20260308000011`)
**DAL**: `lib/dal/inventory.ts`

---

## Existing Code Patterns (Reference for Consistency)

| Module | Path | Pattern Used |
|--------|------|-------------|
| DAL types | `lib/dal/types.ts` | `TypedClient = SupabaseClient<Database>` |
| Taste profiles DAL | `lib/dal/taste-profiles.ts` | Standard DAL pattern: `(client: TypedClient, userId: string)` → `{ data, error }` |
| Server Actions | `lib/actions/taste-profile.ts` | Zod validate → auth → permission → DAL → revalidatePath |
| Validation schemas | `lib/validations/taste-profile.ts` | Zod schemas exported as named constants |
| Database types | `types/database.ts` | 1,437 lines — auto-generated from migrations. Must be updated after Story 01. |

---

## Environment Variables Needed

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_...          # PostHog project API key (public, client-side safe)
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # PostHog ingestion endpoint
```

These should be added to `.env.local` before starting Story 01. PostHog Cloud free tier requires:
1. Sign up at posthog.com
2. Create a project
3. Copy the project API key

For V1 development, the PostHog client can be initialized with a placeholder key — events simply won't be captured. The engine works without PostHog.

---

## Risks & Open Questions

1. **PostHog Client vs Server**: Story 01 creates `lib/analytics/posthog.ts`. The dismiss action (Story 06) calls PostHog from a Server Action. Need `posthog-node` (server SDK), not `posthog-js` (browser SDK). Client-side impression/click tracking (Story 10, CP4) uses the JS SDK. Both SDKs may be needed.

2. **Wine `flavor_profile` JSONB Structure**: The wines table has `flavor_profile JSONB DEFAULT '{}'` but the exact key/value shape isn't formally defined. The matching engine needs to know what keys to compare against `flavor_affinities`. Likely structure: `{ "berry": 0.8, "earthy": 0.6, "pepper": 0.4 }` — verify by checking seed data or PRD-02.

3. **Price Range Matching**: The scoring formula includes `priceRangeMatch` but `taste_profiles` doesn't store a budget range. Options: (a) infer from user's past purchase/wishlist price patterns, (b) add a `price_range` field to taste profiles later, (c) skip price matching in V1. Recommend (c) — set weight to 0 and revisit.

4. **Local Availability Check**: The `localAvailability` scoring factor requires the user's location. This needs lat/lng from the user's session or profile. For V1, this factor can be scored as 1 (available) if the wine appears in `retailer_inventory` for ANY retailer, or 0 if not. Full PostGIS proximity scoring deferred.

5. **`user_wine_dismissals` Has No `org_id`**: Per CG-2 resolution, this table is user-scoped. The migration rules say every table MUST have `org_id`. This is an intentional exception documented in the epic — the dismiss record is personal preference, not org-tied. The sr-backend agent should include a comment in the migration explaining this exception.

6. **Updating `types/database.ts`**: After Story 01 migration, the database types file must be updated to include the new tables. Since `supabase gen types` against the remote project returns empty schemas (migrations not applied remotely), the types should be manually added following the pattern established in EPIC-05c. Add `curated_collections`, `curated_collection_items`, and `user_wine_dismissals` table types to the existing file.

---

## How to Start

1. **Pull latest main**: `git checkout main && git pull`
2. **Create branch**: `git checkout -b epic-07/curation-engine`
3. **Read Story 01**: `.claude/work-plan/stories/epic-07/story-01-curation-database-schema.md`
4. **Delegate to `sr-backend`** with:
   - Story file path
   - Brief: "Create curated_collections, curated_collection_items, user_wine_dismissals tables. Collections are content-scoped (org_id). Dismissals are user-scoped (NO org_id — intentional CG-2 exception). PostHog client in lib/analytics/posthog.ts. See EPIC07_HANDOFF.md for full schema spec."
   - Reference: This handoff doc for schema details + existing migration patterns in `supabase/migrations/`
5. **After Story 01**: Update `types/database.ts` with new table types
6. **Continue through stories** in order: 01 → 02 → 03 → 04 → 05 → 06
7. **After all 6 stories**: Run typecheck (`pnpm turbo typecheck`), build (`pnpm turbo build`), QA review, create PR to main

---

## Story File Paths

| Story | Path |
|-------|------|
| 01 | `.claude/work-plan/stories/epic-07/story-01-curation-database-schema.md` |
| 02 | `.claude/work-plan/stories/epic-07/story-02-curation-dal-functions.md` |
| 03 | `.claude/work-plan/stories/epic-07/story-03-rules-based-matching-engine.md` |
| 04 | `.claude/work-plan/stories/epic-07/story-04-recommendation-explanation-templates.md` |
| 05 | `.claude/work-plan/stories/epic-07/story-05-recommendation-caching.md` |
| 06 | `.claude/work-plan/stories/epic-07/story-06-dismiss-server-action-posthog-tracking.md` |
