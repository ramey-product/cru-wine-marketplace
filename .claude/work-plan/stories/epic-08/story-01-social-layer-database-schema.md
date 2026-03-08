### [EPIC-08/STORY-01] — Social Layer Database Schema

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want the follows and share_events tables created with proper indexes and RLS so that the social layer has its data foundation.

#### Acceptance Criteria

```gherkin
Given the migration runs
When I inspect the database schema
Then the follows table exists with follower_id, following_id, created_at columns and a UNIQUE constraint on (follower_id, following_id)

Given the migration runs
When I inspect the database schema
Then the share_events table exists with user_id, shareable_type, shareable_id, platform, created_at columns

Given the migration runs
When I inspect user_profiles
Then it has username (TEXT UNIQUE), bio (TEXT), and is_public (BOOLEAN DEFAULT true) columns added

Given a user attempts to follow themselves
When the INSERT executes
Then a CHECK constraint prevents follower_id = following_id

Given two users in the follows table
When RLS policies are evaluated
Then a user can only see their own follow relationships (rows where follower_id = auth.uid() OR following_id = auth.uid())
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_social_layer_schema.sql` | Create |
| Test | `supabase/tests/social-layer.test.sql` | Create |

#### Dependencies

- **Blocked by:** [EPIC-01/STORY-01] — user_profiles table must exist for ALTER and for foreign key references
- **Blocks:** [EPIC-08/STORY-02] — DAL functions need schema to exist

#### Testing Requirements

- [ ] **RLS:** User can read their own follows (as follower or following)
- [ ] **RLS:** User cannot read follows between two other users
- [ ] **RLS:** User can insert a follow where follower_id = their own user_id
- [ ] **RLS:** User cannot insert a follow for another user
- [ ] **RLS:** User can read their own share_events
- [ ] **RLS:** User cannot read another user's share_events
- [ ] **Constraint:** UNIQUE(follower_id, following_id) prevents duplicate follows
- [ ] **Constraint:** CHECK(follower_id != following_id) prevents self-follows
- [ ] **Constraint:** shareable_type CHECK IN ('wine', 'producer')
- [ ] **Constraint:** platform CHECK IN ('native_share', 'clipboard', 'twitter', 'facebook', 'email')

#### Implementation Notes

**CG-2 Table Classification:**
- `follows` — user-scoped (NO `org_id`). Follow relationships are between users, not org-owned data. Both `follower_id` and `following_id` reference `auth.users(id)`.
- `share_events` — user-scoped (NO `org_id`). Like `recommendation_events`, these are personal user behavior logs.
- `user_profiles` ALTER — user_profiles is already user-scoped from Epic 01.

**Schema design:**

```sql
-- User-scoped: NO org_id per CG-2
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- User-scoped: NO org_id per CG-2
CREATE TABLE share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shareable_type TEXT NOT NULL CHECK (shareable_type IN ('wine', 'producer')),
  shareable_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('native_share', 'clipboard', 'twitter', 'facebook', 'email')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_share_events_user ON share_events(user_id);
CREATE INDEX idx_share_events_shareable ON share_events(shareable_type, shareable_id);

-- Extend user_profiles (already user-scoped from Epic 01)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 160),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;
```

**RLS for follows** — users can see follows they're part of (as follower or following), can insert their own follows, can delete their own follows. Public follower/following counts are handled via a count function or view.

**No `updated_at` on follows or share_events** — follows are created/deleted (never updated), share_events are append-only log entries. Both are immutable once created.
