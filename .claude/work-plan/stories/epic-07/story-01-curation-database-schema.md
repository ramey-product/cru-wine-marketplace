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
