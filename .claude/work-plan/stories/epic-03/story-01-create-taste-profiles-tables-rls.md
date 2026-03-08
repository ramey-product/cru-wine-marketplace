### [EPIC-03/STORY-01] — Create taste_profiles and taste_profile_wines tables with RLS

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want the taste_profiles and taste_profile_wines tables created with proper constraints and RLS so that user taste data is securely stored and tenant-isolated.

#### Acceptance Criteria

```gherkin
Given the migration runs successfully
When I inspect the taste_profiles table
Then it has columns: id (UUID PK), user_id (UUID FK to auth.users, UNIQUE), flavor_affinities (JSONB DEFAULT '[]'), flavor_aversions (JSONB DEFAULT '[]'), drinking_contexts (JSONB DEFAULT '[]'), adventurousness_score (INTEGER DEFAULT 2 CHECK 1-3), profile_version (INTEGER DEFAULT 1), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)

Given the migration runs successfully
When I inspect the taste_profile_wines table
Then it has columns: id (UUID PK), user_id (UUID FK to auth.users), wine_id (UUID FK to wines), source (TEXT CHECK IN ('onboarding', 'manual_add')), created_at (TIMESTAMPTZ)
And there is a UNIQUE constraint on (user_id, wine_id)

Given a user is authenticated
When they query taste_profiles
Then RLS allows them to SELECT/INSERT/UPDATE only their own rows (user_id = auth.uid())

Given a user is authenticated
When they query taste_profile_wines
Then RLS allows them to SELECT/INSERT/DELETE only their own rows (user_id = auth.uid())
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_taste_profiles.sql` | Create |
| Test | `supabase/tests/taste-profiles.test.sql` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-01 — wines table must exist for taste_profile_wines FK
- **Blocks:** EPIC-03/STORY-03, EPIC-03/STORY-04, EPIC-07/STORY-01

#### Testing Requirements

- [ ] **RLS:** Positive — user can read/write own taste_profile
- [ ] **RLS:** Negative — user cannot read/write another user's taste_profile
- [ ] **RLS:** Positive — user can add/remove own taste_profile_wines
- [ ] **RLS:** Negative — user cannot access another user's taste_profile_wines
- [ ] **Constraint:** adventurousness_score rejects values outside 1-3
- [ ] **Constraint:** duplicate (user_id, wine_id) in taste_profile_wines is rejected

#### Implementation Notes

- These are user-scoped tables per CG-2 resolution — NO `org_id` column. RLS is based on `user_id = auth.uid()`.
- `taste_profiles` should have a UNIQUE constraint on `user_id` (one profile per user).
- JSONB columns store arrays of string tags (e.g., `["berry", "earthy", "pepper"]`).
- Include `updated_at` trigger using `update_updated_at()` function.
- Index on `user_id` for both tables.
