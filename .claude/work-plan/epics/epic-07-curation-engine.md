# Epic: [EPIC-07] — AI + Human Curation Engine

**Source PRD:** `docs/prds/prd-07-curation-engine.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 6,000 (MVP scope)
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-2, fullstack-4, ux-designer, marketing-writer

## Epic Summary

The curation engine is Cru's core differentiator — a hybrid rules-based matching engine combined with human-curated collections that delivers personally relevant wine recommendations from Day 1. It uses taste profile data (flavor affinities, aversions, adventurousness) to score wines against user preferences, generates plain-language explanations for each recommendation, and tracks every interaction to build the dataset needed for ML-powered recommendations in Month 5-6. Curated collections provide editorial discovery for all users including those without taste profiles.

## Success Criteria

- [ ] Rules engine returns top 8 recommendations in < 500ms for 1,000-wine catalog
- [ ] Every recommendation includes a human-readable `match_reason` explanation
- [ ] Curated collections are admin-managed with CRUD, ordering, and date-range scheduling
- [ ] Home screen renders "Picked for You" (with profile) or "Popular Near You" (without) + collections
- [ ] Recommendation interactions (impression, click, dismiss, wishlist, purchase) tracked via PostHog Cloud for ML training
- [ ] Dismissed wines excluded from future recommendation runs
- [ ] 15%+ CTR target on "Picked for You" recommendations

## Story Index

| Story | Title | Type | Points | File |
|-------|-------|------|--------|------|
| STORY-01 | Curation Database Schema | backend | 5 | `epic-07/story-01-curation-database-schema.md` |
| STORY-02 | Curation DAL Functions | backend | 5 | `epic-07/story-02-curation-dal-functions.md` |
| STORY-03 | Rules-Based Matching Engine | backend | 8 | `epic-07/story-03-rules-based-matching-engine.md` |
| STORY-04 | Recommendation Explanation Templates | backend | 3 | `epic-07/story-04-recommendation-explanation-templates.md` |
| STORY-05 | Recommendation Caching | backend | 3 | `epic-07/story-05-recommendation-caching.md` |
| STORY-06 | Dismiss Server Action & PostHog Tracking Setup | backend | 2 | `epic-07/story-06-dismiss-server-action-posthog-tracking.md` |
| STORY-07 | Curated Collections Admin Interface | fullstack | 8 | `epic-07/story-07-curated-collections-admin-interface.md` |
| STORY-08 | Home Screen Curation Sections | fullstack | 8 | `epic-07/story-08-home-screen-curation-sections.md` |
| STORY-09 | Collection Detail Page | frontend | 5 | `epic-07/story-09-collection-detail-page.md` |
| STORY-10 | Recommendation Card with Dismiss Action | frontend | 5 | `epic-07/story-10-recommendation-card-with-dismiss.md` |
| STORY-11 | Curation UX Design & User-Facing Copy | design | 5 | `epic-07/story-11-curation-ux-design-copy.md` |

**Total: 11 stories, 57 story points**

## Architecture Dependencies

- **Database tables:** `curated_collections`, `curated_collection_items`, `user_wine_dismissals`
- **Consumed tables:** `taste_profiles` (Epic 03), `wines` with `flavor_profile` JSONB (Epic 04), `retailer_inventory` (Epic 06), `orders` / `wishlists` (Epic 05)
- **External integrations:** PostHog Cloud (free tier — 1M events/month) for recommendation interaction tracking (impressions, clicks, dismisses, wishlists, purchases)
- **Shared components:** Wine cards (Epic 02), availability display (Epic 06)

## Cross-Cutting Concerns

- **CG-2 Table Categorization:**
  - `user_wine_dismissals` = user-scoped (NO `org_id` — tied to `user_id`, lightweight exclusion record for matching engine)
  - `curated_collections` and `curated_collection_items` = content-scoped (`org_id` = platform org)
- **Caching:** Per-user recommendation cache with 1-hour TTL. V1 uses Next.js `unstable_cache` (Vercel-native). Invalidate on taste profile update or new purchase.
- **Wine cards:** Curation sections reuse the same wine card component from Search & Browse (Epic 02) but augmented with `match_reason` display
- **Interaction tracking:** All recommendation events (impression, click, dismiss, wishlist, purchase) are tracked via **PostHog Cloud free tier** (1M events/month, unlimited seats, no credit card required). PostHog serves as the foundational analytics layer for the P2 ML upgrade. The `user_wine_dismissals` Supabase table provides synchronous dismiss lookups for the matching engine — PostHog handles the analytics/reporting side.

## Technical Risks & Open Questions

- [ ] **Caching strategy:** PRD debates Redis (Upstash) vs. Next.js unstable_cache vs. Supabase edge function cache. V1 decision: Next.js unstable_cache for simplicity and Vercel-native performance. Revisit at 5K users if latency degrades.
- [ ] **Catalog sparsity:** With 500 wines and 20 flavor attributes, matching may be sparse for niche profiles. Mitigation: fallback to "Popular Near You" when < 6 personalized matches.
- [ ] **Scoring formula tuning:** The weighted scoring formula is a best guess pre-launch. Need rapid iteration based on early CTR data. Engine should make weights configurable, not hardcoded.
- [ ] **Home screen collection count:** PRD proposes 4 visible + "See all" link. Finalize with UX review.

---

## Developer Stories

---

### [EPIC-07/STORY-01] — Curation Database Schema

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform developer, I want the curation database tables and PostHog analytics integration created so that curated collections, dismiss exclusion tracking, and recommendation interaction analytics have a performant data layer.

#### Acceptance Criteria

```gherkin
Given the migration runs
When I inspect the database schema
Then curated_collections, curated_collection_items, and user_wine_dismissals tables exist with correct columns, types, and constraints

Given a curator creates a collection
When they add wines to it
Then the curated_collection_items records link to both collection and wine with proper foreign keys

Given a user dismisses a wine
When the dismiss is recorded
Then user_wine_dismissals stores user_id and wine_id for engine exclusion queries

Given curated_collections has RLS enabled
When a non-admin user queries the table
Then they can SELECT active collections but cannot INSERT, UPDATE, or DELETE

Given user_wine_dismissals has RLS enabled
When a user queries the table
Then they can only see/insert their own dismissals (user_id match)

Given PostHog is configured
When a recommendation event fires
Then PostHog captures the event with user_id, wine_id, event_type, source, and match_score properties
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_curation_tables.sql` | Create |
| Lib | `lib/analytics/posthog.ts` | Create |
| Config | `.env.local` | Add `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |
| Test | `supabase/tests/curation-rls.test.sql` | Create |

#### Dependencies

- **Blocked by:** [EPIC-03/STORY-01] — taste_profiles table must exist for engine to consume
- **Blocked by:** [EPIC-04/STORY-01] — wines table with flavor_profile JSONB must exist
- **Blocks:** [EPIC-07/STORY-02] — DAL functions need tables
- **Blocks:** [EPIC-07/STORY-03] — matching engine needs tables

#### Testing Requirements

- [ ] **RLS:** curated_collections: all authenticated users can SELECT active collections; only admins can INSERT/UPDATE/DELETE
- [ ] **RLS:** curated_collection_items: all authenticated users can SELECT items in active collections; only admins can INSERT/UPDATE/DELETE
- [ ] **RLS:** user_wine_dismissals: users can INSERT own dismissals and SELECT own dismissals; cannot see other users' dismissals
- [ ] **RLS:** Negative tests for all three tables (cross-user, non-admin write attempts)
- [ ] **Integration:** PostHog client initializes with correct project key and captures test event

#### Implementation Notes

**Schema Design:**

```sql
-- Content-scoped: org_id = platform org (admin-managed editorial content)
CREATE TABLE curated_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  curator_id UUID NOT NULL REFERENCES auth.users(id),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE curated_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES curated_collections(id) ON DELETE CASCADE,
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  curator_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, wine_id)
);

-- User-scoped: NO org_id per CG-2 (lightweight dismiss exclusion for matching engine)
CREATE TABLE user_wine_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, wine_id)
);
```

**Indexes:**
- `curated_collections`: index on `org_id`, `(is_active, display_order)`, `slug`
- `curated_collection_items`: index on `org_id`, `collection_id`, `(collection_id, position)`
- `user_wine_dismissals`: index on `user_id` (for engine exclusion queries), unique constraint on `(user_id, wine_id)` handles dedup

**RLS Pattern:**
- `curated_collections` and `curated_collection_items`: SELECT for all authenticated users (WHERE `is_active = true` or user is admin); INSERT/UPDATE/DELETE for admins only
- `user_wine_dismissals`: INSERT for authenticated users (own user_id); SELECT for own dismissals only. DELETE allowed for own dismissals (un-dismiss).

**PostHog Integration (`lib/analytics/posthog.ts`):**
- Initialize PostHog client with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
- Export `captureRecommendationEvent(userId, eventName, properties)` helper
- Event names: `recommendation_impression`, `recommendation_click`, `recommendation_dismiss`, `recommendation_wishlist`, `recommendation_purchase`
- Properties per event: `wine_id`, `recommendation_source`, `match_score`, `collection_id` (if applicable)
- Dismiss events are dual-tracked: PostHog for analytics + Supabase `user_wine_dismissals` for synchronous engine exclusion queries
- All other interaction events (impression, click, wishlist, purchase) go to PostHog only — no Supabase storage needed

---

### [EPIC-07/STORY-02] — Curation DAL Functions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer building curation features, I want typed DAL functions for collections and wine dismissals, plus a PostHog analytics helper, so that all data access is centralized, type-safe, and RLS-compliant.

#### Acceptance Criteria

```gherkin
Given I call getActiveCollections()
When the query executes
Then I receive all active collections with is_active=true and valid date ranges, ordered by display_order

Given I call getCollectionWithItems(collectionId)
When the collection exists
Then I receive the collection with all its wine items ordered by position, including wine details

Given I call dismissWine(userId, wineId)
When the insert succeeds
Then a user_wine_dismissals row is created and a PostHog 'recommendation_dismiss' event is captured

Given I call getUserDismissedWineIds(userId)
When the user has dismissed wines
Then I receive an array of wine_ids from user_wine_dismissals for exclusion from future recommendations

Given I call undismissWine(userId, wineId)
When the delete succeeds
Then the user_wine_dismissals row is removed and the wine can reappear in recommendations
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/collections.ts` | Create |
| DAL | `lib/dal/wine-dismissals.ts` | Create |
| Lib | `lib/analytics/posthog.ts` | Modify (add recommendation event helpers) |
| Types | `types/database.ts` | Regenerate |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-01] — tables and PostHog client must exist
- **Blocks:** [EPIC-07/STORY-03] — matching engine uses DAL for dismiss lookups
- **Blocks:** [EPIC-07/STORY-07] — admin collections CRUD uses DAL
- **Blocks:** [EPIC-07/STORY-10] — recommendation card uses PostHog tracking helpers

#### Testing Requirements

- [ ] **Unit:** getActiveCollections returns only active, date-valid collections
- [ ] **Unit:** getCollectionWithItems returns wines in position order
- [ ] **Unit:** getUserDismissedWineIds returns correct exclusion set from user_wine_dismissals
- [ ] **Unit:** dismissWine creates user_wine_dismissals row and calls PostHog capture
- [ ] **Unit:** undismissWine removes dismissal row
- [ ] **Integration:** DAL functions respect RLS (user can only read/write own dismissals)

#### Implementation Notes

**Collections DAL (`lib/dal/collections.ts`):**
- `getActiveCollections(supabase)` — SELECT active collections where `is_active = true` AND (`start_date IS NULL OR start_date <= now()`) AND (`end_date IS NULL OR end_date >= now()`) ORDER BY `display_order`
- `getCollectionWithItems(supabase, collectionId)` — JOIN with curated_collection_items and wines, order items by position
- `getCollectionBySlug(supabase, slug)` — for collection detail page routing
- `createCollection(supabase, data)` — admin only
- `updateCollection(supabase, collectionId, data)` — admin only
- `addItemToCollection(supabase, collectionId, wineId, position, curatorNote)` — admin only
- `removeItemFromCollection(supabase, itemId)` — admin only
- `reorderCollectionItems(supabase, collectionId, itemIds)` — admin only

**Wine Dismissals DAL (`lib/dal/wine-dismissals.ts`):**
- `dismissWine(supabase, userId, wineId)` — INSERT into user_wine_dismissals (ON CONFLICT DO NOTHING for idempotency) + call PostHog `captureRecommendationEvent` with `recommendation_dismiss`
- `undismissWine(supabase, userId, wineId)` — DELETE from user_wine_dismissals WHERE user_id = $1 AND wine_id = $2
- `getUserDismissedWineIds(supabase, userId)` — SELECT wine_id FROM user_wine_dismissals WHERE user_id = $1 (returns string[] for engine exclusion)

**PostHog Analytics Helpers (added to `lib/analytics/posthog.ts`):**
- `captureRecommendationEvent(userId, eventName, properties)` — wraps PostHog capture with standard event properties
- `batchCaptureImpressions(userId, wineIds, source)` — captures batch impression events to PostHog
- All non-dismiss events (impression, click, wishlist, purchase) tracked via PostHog only — no Supabase storage

---

### [EPIC-07/STORY-03] — Rules-Based Matching Engine

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an Explorer with a completed taste profile, I want Cru to generate personalized wine recommendations based on my flavor preferences so that I see wines I'll actually enjoy rather than generic popular picks.

#### Acceptance Criteria

```gherkin
Given a user with flavor_affinities ["berry", "earthy", "pepper"] and no aversions
When the engine runs
Then the top 8 results are wines with matching flavor_profile attributes, sorted by match_score descending

Given a user with flavor_aversions ["very_sweet"]
When the engine runs
Then no wine with a dominant sweetness profile appears in recommendations

Given a user with adventurousness_score = 3 ("Surprise me")
When the engine runs
Then at least 2 of the top 8 results are outside the user's primary flavor affinity cluster

Given a user has purchased wine X and dismissed wine Y
When the engine runs
Then neither wine X nor wine Y appear in recommendations

Given a user has no taste profile
When the engine is called
Then it returns null/empty (caller falls back to "Popular Near You")

Given the wine catalog has 1,000 wines
When the engine runs
Then recommendation generation completes in < 500ms
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/curation.ts` | Create |
| DAL | `lib/dal/curation.ts` | Create |
| Validation | `lib/validations/curation.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-02] — needs wine-dismissals DAL for `getUserDismissedWineIds()` exclusion queries
- **Blocked by:** [EPIC-03/STORY-01] — needs taste_profiles table
- **Blocked by:** [EPIC-04/STORY-01] — needs wines with flavor_profile JSONB
- **Blocks:** [EPIC-07/STORY-04] — explanation system consumes match data
- **Blocks:** [EPIC-07/STORY-05] — caching wraps the engine output
- **Blocks:** [EPIC-07/STORY-08] — home screen consumes engine output

#### Testing Requirements

- [ ] **Unit:** Scoring formula produces correct scores for known flavor/wine combinations
- [ ] **Unit:** Aversion violations correctly exclude wines
- [ ] **Unit:** Adventurousness diversity bonus adds variety for high-adventurousness users
- [ ] **Unit:** Exclusion logic removes purchased, dismissed, and wishlisted wines
- [ ] **Unit:** Empty taste profile returns null/empty
- [ ] **Unit:** < 6 matches triggers fallback padding (popular wines fill remaining slots)
- [ ] **Integration:** Full engine run with seeded data returns expected top 8

#### Implementation Notes

**Scoring Formula:**

```typescript
matchScore =
  (flavorAffinityMatches × 3.0) +   // How many of user's loved flavors this wine has
  (noAversionViolation × 5.0) +      // Binary: 5 if no aversions violated, 0 if any violated
  (priceRangeMatch × 2.0) +          // 2 if within user's budget range, 0 otherwise
  (localAvailability × 4.0) +        // 4 if in stock at a nearby retailer, 0 otherwise
  (adventurenessBonus × adventurenessScore)  // Diversity bonus scaled by user's openness
```

**Engine Architecture:**
- `lib/dal/curation.ts` contains the data-fetching: `getRecommendationCandidates(supabase, userId)` — fetches user's taste profile, all wines with flavor_profile, user's exclusion set (purchased + dismissed + wishlisted), and nearby availability
- `lib/actions/curation.ts` contains `generateRecommendations(userId)` Server Action:
  1. Fetch user's taste profile via DAL
  2. If no profile, return `{ data: null }` (no personalized recs)
  3. Fetch candidate wines (all wines minus exclusions)
  4. Score each candidate against user's profile
  5. Sort by score descending
  6. If < 6 results, pad with popular nearby wines
  7. Take top 8
  8. Generate match_reason for each (delegates to explanation system)
  9. Return `{ data: RecommendationResult[] }`

**Weights Configuration:**
- Store scoring weights in a config object (not hardcoded magic numbers) so they can be tuned without code changes
- V1: `SCORING_WEIGHTS = { flavorAffinity: 3.0, noAversion: 5.0, priceRange: 2.0, localAvailability: 4.0, adventurenessBase: 1.5 }`

**Performance:**
- The engine runs as a single Supabase query with server-side scoring (not N+1 queries per wine)
- For V1 with ≤ 1,000 wines, fetch all candidates in one query and score in-memory in the Server Action
- If catalog grows beyond 5,000 wines, consider moving scoring into a Supabase function for DB-level filtering

---

### [EPIC-07/STORY-04] — Recommendation Explanation Templates

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an Explorer, I want each recommendation to include a plain-language explanation of why it was picked for me so that I trust the suggestion and learn about my own palate.

#### Acceptance Criteria

```gherkin
Given a wine matched on flavor affinity + local availability
When the explanation generates
Then the match_reason reads something like "This earthy Rhône red matches your palate — and it's in stock at [Store Name], 2 miles away"

Given a wine matched primarily on adventurousness diversity
When the explanation generates
Then the match_reason signals discovery: "Something new for you: a [varietal] from [region] that [producer tagline]"

Given a wine matched on multiple factors
When the explanation generates
Then it combines up to 3 reason fragments into a single natural sentence

Given a wine with no strong single match factor
When the explanation generates
Then a generic but warm fallback is used: "A [varietal] we think you'll enjoy based on your taste profile"
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/curation.ts` | Modify (add explanation generation) |
| Lib | `lib/curation/explanation-templates.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-03] — needs match data to generate explanations
- **Blocks:** [EPIC-07/STORY-08] — home screen displays match_reason

#### Testing Requirements

- [ ] **Unit:** Each template type produces grammatically correct output with test data
- [ ] **Unit:** Fragment combination logic handles 1, 2, and 3 fragments
- [ ] **Unit:** Fallback template used when no strong match factors exist
- [ ] **Unit:** Template correctly interpolates store name, distance, varietal, region, producer tagline

#### Implementation Notes

**Template System:**

```typescript
type MatchFactor = 'flavor_affinity' | 'no_aversion' | 'price_range' | 'local_availability' | 'adventureness' | 'producer_story';

interface ExplanationFragment {
  factor: MatchFactor;
  weight: number; // contribution to total score
  template: string; // parameterized template string
}
```

**Template Examples:**
- `flavor_affinity`: "This has the {flavors} character you love"
- `local_availability`: "In stock at {storeName}, {distance} away"
- `adventureness`: "Something new for you: a {varietal} from {region}"
- `producer_story`: "From {producerName} — {tagline}"
- `price_range`: "Right in your sweet spot at {price}"

**Combination Logic:**
1. Sort fragments by weight descending
2. Take top 3 fragments
3. Join with natural connectors: first fragment as main clause, subsequent with " — " or " and "
4. Ensure output is a single sentence, max ~120 characters

**Copy Ownership:** The marketing-writer agent should review and refine all template strings in STORY-11 to ensure they match Cru's brand voice. Use placeholder copy in the engine and replace during the copy pass.

---

### [EPIC-07/STORY-05] — Recommendation Caching

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform operator, I want personalized recommendations cached per-user with a 1-hour TTL so that the home screen loads fast without re-running the matching engine on every page view.

#### Acceptance Criteria

```gherkin
Given a user loads the home screen
When recommendations exist in cache (< 1 hour old)
Then cached results are served without re-running the engine

Given a user updates their taste profile
When the profile save completes
Then the recommendation cache for that user is invalidated

Given a user completes a purchase
When the order is confirmed
Then the recommendation cache for that user is invalidated

Given the cache is empty or expired
When the user loads the home screen
Then the engine runs, results are cached, and recommendations display within 500ms
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/curation.ts` | Modify (add caching layer) |
| Lib | `lib/curation/cache.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-03] — needs the engine to wrap with cache
- **Blocks:** [EPIC-07/STORY-08] — home screen consumes cached recommendations

#### Testing Requirements

- [ ] **Unit:** Cache hit returns stored results without engine execution
- [ ] **Unit:** Cache miss triggers engine run and stores results
- [ ] **Unit:** Cache invalidation clears user's cached recommendations
- [ ] **Integration:** Taste profile update triggers cache invalidation
- [ ] **Integration:** Order completion triggers cache invalidation

#### Implementation Notes

**V1 Strategy: Next.js `unstable_cache`**
- Cache key: `curation:recommendations:${userId}`
- TTL: 3600 seconds (1 hour)
- Tags: `['curation', `user:${userId}`]` for targeted invalidation
- `revalidateTag(`user:${userId}`)` called from taste profile update and order completion Server Actions

**Why `unstable_cache` over Redis:**
- Zero additional infrastructure (Vercel-native)
- Sufficient for V1 scale (< 5K users)
- Automatic CDN-level caching on Vercel
- Revisit with Upstash Redis if latency exceeds 200ms at scale

**Invalidation Triggers:**
- Taste profile update: add `revalidateTag` call to `updateTasteProfile` action (Epic 03)
- Order completion: add `revalidateTag` call to `confirmOrder` action (Epic 05)
- Admin wine catalog changes: invalidate all curation caches (bulk revalidation)

---

### [EPIC-07/STORY-06] — Dismiss Server Action & PostHog Tracking Setup

**Type:** backend
**Story Points:** 2
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform developer, I want a dismiss Server Action that writes to both Supabase (`user_wine_dismissals`) and PostHog, so that dismisses are tracked for analytics while the matching engine can synchronously exclude dismissed wines.

#### Acceptance Criteria

```gherkin
Given a user dismisses a recommendation
When the Server Action executes
Then a row is inserted into user_wine_dismissals AND a "recommendation_dismiss" event is captured in PostHog

Given a user un-dismisses a wine (from a "Dismissed" management view)
When the undismiss Server Action executes
Then the row is deleted from user_wine_dismissals

Given a user dismisses the same wine twice
When the Server Action executes
Then the insert is idempotent (ON CONFLICT DO NOTHING) and no error is returned

Given PostHog is unreachable
When a dismiss event fires
Then the Supabase write succeeds regardless (PostHog capture is fire-and-forget, not blocking)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/curation.ts` | Create |
| Validation | `lib/validations/curation.ts` | Modify (add dismiss schemas) |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-01] — needs `user_wine_dismissals` table and PostHog client
- **Blocked by:** [EPIC-07/STORY-02] — needs wine-dismissals DAL functions
- **Blocks:** [EPIC-07/STORY-10] — recommendation card calls dismiss action

#### Testing Requirements

- [ ] **Unit:** Zod validation rejects missing wine_id or invalid UUID
- [ ] **Unit:** Dismiss action returns `{ data }` on success and `{ error }` on failure
- [ ] **Integration:** Dismiss action inserts row into `user_wine_dismissals` and calls PostHog capture
- [ ] **Integration:** Undismiss action deletes row from `user_wine_dismissals`
- [ ] **Integration:** Duplicate dismiss is idempotent (no error on conflict)

#### Implementation Notes

**Dismiss Server Action (`lib/actions/curation.ts`):**
```typescript
'use server'
// dismissRecommendation(formData):
//   1. Zod validate wine_id
//   2. auth check (getUser)
//   3. dismissWine(supabase, userId, wineId) — DAL call
//   4. captureRecommendationEvent(userId, 'recommendation_dismiss', { wine_id, source })
//   5. revalidatePath for recommendation sections
//   Return { data: { dismissed: true } } or { error: string }

// undismissRecommendation(formData):
//   1. Zod validate wine_id
//   2. auth check (getUser)
//   3. undismissWine(supabase, userId, wineId) — DAL call
//   4. revalidatePath for recommendation sections
//   Return { data: { undismissed: true } } or { error: string }
```

**PostHog fire-and-forget pattern:**
- PostHog `capture()` is non-blocking — if it fails, the dismiss still succeeds in Supabase
- No try/catch wrapping needed around PostHog calls; errors are silently logged
- All non-dismiss events (impression, click, wishlist, purchase) are tracked purely client-side via PostHog JS SDK in STORY-10

---

### [EPIC-07/STORY-07] — Curated Collections Admin Interface

**Type:** fullstack
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a curator, I want to create themed collections with editorial descriptions, add/remove/reorder wines, and schedule collections with start/end dates so that users see a human-crafted discovery path.

#### Acceptance Criteria

```gherkin
Given a curator navigates to the collections admin
When they click "New Collection"
Then a form appears for title, slug, description, cover image, display order, start/end dates

Given a curator is editing a collection
When they search for wines to add
Then they can search by name/producer and add wines with optional curator notes

Given a curator wants to reorder wines in a collection
When they drag-and-drop wine items
Then position values update and the new order persists

Given a curator sets an end_date of today on a collection
When tomorrow arrives
Then the collection no longer appears in user-facing sections

Given a curator marks a collection as inactive
When a user views the home screen
Then the inactive collection does not appear
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/collections.ts` | Create |
| Component | `components/features/collections/CollectionForm.tsx` | Create |
| Component | `components/features/collections/CollectionItemList.tsx` | Create |
| Component | `components/features/collections/CollectionManager.tsx` | Create |
| Page | `app/(app)/[orgSlug]/admin/collections/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/admin/collections/[collectionId]/page.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-02] — needs collections DAL
- **Blocked by:** [EPIC-07/STORY-11] — needs UX design specs
- **Blocks:** [EPIC-07/STORY-08] — home screen needs collections to exist

#### Testing Requirements

- [ ] **Unit:** Collection create/update Server Actions validate input and persist correctly
- [ ] **Unit:** Reorder action updates position values in correct sequence
- [ ] **Integration:** End-to-end collection CRUD flow
- [ ] **Accessibility:** All form fields labeled, drag-and-drop has keyboard alternative

#### Implementation Notes

- Admin-only pages — check `hasPermission(membership.role, 'collections:manage')`
- Wine search within collection editor: reuse wine search from Epic 02, filtered to wines in catalog
- Drag-and-drop reordering: use `@dnd-kit/sortable` (already a common Shadcn/ui companion)
- Cover image: URL input for V1 (no image upload infrastructure yet). Use placeholder if empty.
- Slug auto-generated from title with manual override option
- Server Actions in `lib/actions/collections.ts`: `createCollection`, `updateCollection`, `deleteCollection`, `addCollectionItem`, `removeCollectionItem`, `reorderCollectionItems`

---

### [EPIC-07/STORY-08] — Home Screen Curation Sections

**Type:** fullstack
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want my home screen to show "Picked for You" recommendations, curated collections, and "Popular Near You" wines so that I have multiple discovery paths the moment I open Cru.

#### Acceptance Criteria

```gherkin
Given a user with a completed taste profile
When they view the home screen
Then "Picked for You" appears as the first section with 8 wine cards, each with a match_reason

Given a user who skipped taste profile
When they view the home screen
Then "Picked for You" is replaced by "Popular Near You" and curated collections are promoted

Given curated collections exist
When the home screen renders
Then a horizontal-scrolling section shows up to 4 active collections with cover images and titles

Given the user clicks "See all collections"
When the page loads
Then all active collections display in a grid layout

Given any section is loading
When the page renders
Then each section shows an independent skeleton loader (Suspense boundary per section)

Given fewer than 6 personalized matches exist
When "Picked for You" renders
Then remaining slots are filled with popular nearby wines
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/curation/PickedForYou.tsx` | Create |
| Component | `components/features/curation/CuratedCollectionsRow.tsx` | Create |
| Component | `components/features/curation/PopularNearYou.tsx` | Create |
| Component | `components/features/curation/RecommendationCard.tsx` | Create |
| Page | `app/(app)/[orgSlug]/home/page.tsx` | Modify |
| Page | `app/(app)/[orgSlug]/collections/page.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-03] — needs matching engine
- **Blocked by:** [EPIC-07/STORY-04] — needs explanation templates
- **Blocked by:** [EPIC-07/STORY-05] — needs caching layer
- **Blocked by:** [EPIC-07/STORY-07] — needs collections to exist in DB
- **Blocked by:** [EPIC-02/STORY-08] — needs wine card component
- **Blocked by:** [EPIC-07/STORY-11] — needs UX design specs

#### Testing Requirements

- [ ] **Unit:** PickedForYou renders 8 cards with match_reason when profile exists
- [ ] **Unit:** PopularNearYou renders when no profile exists
- [ ] **Unit:** CuratedCollectionsRow renders up to 4 collections
- [ ] **Integration:** Home page sections load independently via Suspense
- [ ] **Accessibility:** All sections have proper heading hierarchy and aria-labels

#### Implementation Notes

**Section Architecture:**
- Each section is a Server Component that fetches its own data
- Wrap each section in `<Suspense fallback={<SectionSkeleton />}>` for independent loading
- Home page layout:
  1. "Picked for You" (or "Popular Near You" fallback) — full-width horizontal scroll of 8 cards
  2. "Curated Collections" — horizontal scroll of 4 collection cards with cover image + title
  3. Additional sections TBD (e.g., "New Arrivals" can be added later)

**RecommendationCard Component:**
- Extends the base wine card from Epic 02 with:
  - `match_reason` text below the wine info
  - "Not for me" dismiss button (triggers event + removes card with animation)
  - Impression tracking on viewport entry (IntersectionObserver)

**"Popular Near You" Fallback:**
- Query: top wines by order count at retailers within user's radius (last 30 days)
- Requires user's location (from browser geolocation or zip code in profile)
- Falls back to global popular if no location available

**"Curated Collections" Row:**
- Horizontal scroll with snap-to-card behavior
- Collection card: cover image, title, wine count badge
- "See all" link to `/[orgSlug]/collections`

---

### [EPIC-07/STORY-09] — Collection Detail Page

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to view a curated collection's full wine list with the curator's editorial description and per-wine notes so that I can explore a themed discovery path.

#### Acceptance Criteria

```gherkin
Given a user navigates to a collection page via slug
When the collection exists and is active
Then the page shows the collection title, description, cover image, and all wines in curator order

Given a collection item has a curator_note
When the wine card renders
Then the curator's note appears below the wine details

Given a collection is inactive or past its end_date
When a user navigates to its URL
Then a 404 page is shown

Given a user clicks a wine in the collection
When the wine detail page loads
Then a PostHog "recommendation_click" event is captured with source: "curated_collection"
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/collections/CollectionDetail.tsx` | Create |
| Component | `components/features/collections/CollectionWineCard.tsx` | Create |
| Page | `app/(app)/[orgSlug]/collections/[slug]/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/collections/[slug]/loading.tsx` | Create |
| Page | `app/(app)/[orgSlug]/collections/[slug]/error.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-02] — needs collections DAL (getCollectionBySlug, getCollectionWithItems)
- **Blocked by:** [EPIC-02/STORY-08] — needs wine card component
- **Blocked by:** [EPIC-07/STORY-11] — needs UX design specs

#### Testing Requirements

- [ ] **Unit:** CollectionDetail renders title, description, cover image, wine count
- [ ] **Unit:** CollectionWineCard renders curator_note when present
- [ ] **Unit:** Inactive/expired collections return 404
- [ ] **Accessibility:** Page has proper heading structure, wine cards are keyboard-navigable

#### Implementation Notes

- Route: `app/(app)/[orgSlug]/collections/[slug]/page.tsx`
- Use `getCollectionBySlug(supabase, slug)` to fetch, return `notFound()` if missing or inactive
- Wine cards in curator-defined order (position field)
- Curator notes as italic text below wine info on each card
- Cover image as hero banner at top of page
- Track clicks via PostHog `posthog.capture('recommendation_click', { source: 'curated_collection', wine_id })` in client component
- Include `loading.tsx` skeleton with placeholder cards
- Include `error.tsx` for data fetch failures

---

### [EPIC-07/STORY-10] — Recommendation Card with Dismiss Action

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to dismiss a recommendation with a "Not for me" action so that the system learns what I don't want and future recommendations improve.

#### Acceptance Criteria

```gherkin
Given a recommendation card is visible
When the user clicks "Not for me"
Then the card animates out and a dismiss event is tracked

Given a user dismisses a wine from "Picked for You"
When they refresh the home screen
Then the dismissed wine no longer appears in recommendations

Given a recommendation card enters the viewport
When IntersectionObserver fires
Then an impression event is tracked (once per card per session)

Given a user clicks a recommendation card
When the wine detail page loads
Then a click event is tracked with the match_score
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/curation/RecommendationCard.tsx` | Modify |
| Component | `components/features/curation/DismissButton.tsx` | Create |
| Lib | `lib/hooks/useRecommendationTracking.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-02] — needs PostHog analytics helpers (`captureRecommendationEvent`, `batchCaptureImpressions`)
- **Blocked by:** [EPIC-07/STORY-06] — needs dismiss Server Action
- **Blocked by:** [EPIC-07/STORY-08] — needs RecommendationCard component to exist

#### Testing Requirements

- [ ] **Unit:** Dismiss button calls dismiss Server Action and removes card from DOM
- [ ] **Unit:** IntersectionObserver fires PostHog impression capture once per card
- [ ] **Unit:** Click tracking calls `posthog.capture('recommendation_click', ...)` with match_score
- [ ] **Integration:** Dismissed wine excluded from next engine run

#### Implementation Notes

**Client Component (`'use client'`):**
- `DismissButton`: small icon button (X or thumbs-down) with tooltip "Not for me"
- On dismiss: call `dismissRecommendation` Server Action (from STORY-06) which writes to Supabase + PostHog
- Optimistic UI: immediately animate card out (fade + collapse) without waiting for server response
- Use `useRecommendationTracking` hook for impression and click tracking logic

**Impression Tracking (PostHog JS SDK):**
- Use IntersectionObserver to detect when card enters viewport (threshold: 0.5)
- Track each impression once per card per page session (use a Set to deduplicate)
- Batch impressions: collect wine_ids for 500ms debounce, then call `batchCaptureImpressions(userId, wineIds, source)` from PostHog helpers

**Click Tracking (PostHog JS SDK):**
- On card click (before navigation), call `posthog.capture('recommendation_click', { wine_id, source, match_score })`
- PostHog JS SDK handles fire-and-forget — no need for Beacon API or custom fetch calls

---

### [EPIC-07/STORY-11] — Curation UX Design & User-Facing Copy

**Type:** design
**Story Points:** 5
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend (design before build)

#### User Story

As the product team, I want polished UX specifications and brand-voice copy for all curation surfaces so that the curated experience feels personal, warm, and distinctly Cru.

#### Acceptance Criteria

```gherkin
Given the home screen curation sections
When UX specs are delivered
Then layouts for "Picked for You," "Curated Collections," and "Popular Near You" are specified with spacing, card sizes, scroll behavior, and responsive breakpoints

Given the recommendation explanation templates
When marketing copy is delivered
Then all template strings use Cru's brand voice — warm, knowledgeable, never pretentious

Given the "Not for me" dismiss interaction
When UX specs are delivered
Then the animation, button placement, and confirmation behavior are specified

Given the curated collections admin interface
When UX specs are delivered
Then the admin CRUD flow is wireframed with form layouts, drag-and-drop reorder, and date picker

Given empty states and edge cases
When designs are delivered
Then empty "Picked for You" (no profile), sparse results (< 6 matches), and no-collections states have designed fallbacks
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | UX specifications for curation surfaces | Deliver |
| Copy | Recommendation explanation templates (brand voice) | Deliver |
| Copy | Section headings, CTAs, empty state messages | Deliver |
| Copy | Collection admin UI labels and help text | Deliver |

#### Dependencies

- **Blocked by:** None — design can begin as soon as PRD is understood
- **Blocks:** [EPIC-07/STORY-07] — admin interface needs design specs
- **Blocks:** [EPIC-07/STORY-08] — home screen sections need design specs
- **Blocks:** [EPIC-07/STORY-09] — collection detail page needs design specs
- **Blocks:** [EPIC-07/STORY-10] — dismiss interaction needs design specs

#### Testing Requirements

- [ ] **Accessibility:** All designs meet WCAG 2.1 AA contrast and target size requirements
- [ ] **Accessibility:** Dismiss action is keyboard-accessible with clear focus states
- [ ] **Accessibility:** Collection card scroll has keyboard navigation

#### Implementation Notes

**UX Designer Deliverables:**
- Home screen section layouts (mobile + desktop)
- Recommendation card design (match_reason placement, dismiss button position)
- Curated collection card design (cover image ratio, title truncation)
- Collection detail page layout
- Admin collections CRUD wireframes
- Empty states for all edge cases
- Animation specs for dismiss interaction

**Marketing Writer Deliverables:**
- All recommendation explanation template strings (STORY-04)
- Section headings: "Picked for You," "Curated Collections," "Popular Near You" (or better alternatives)
- Empty state copy: "Complete your taste profile to get personalized picks" etc.
- Dismiss button tooltip text
- Collection admin help text and field descriptions
- "See all collections" CTA copy
