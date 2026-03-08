### [EPIC-01/STORY-01] — Create profiles and user_preferences tables with RLS

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform, I need database tables for user profiles and preferences so that authenticated users have persistent storage for their identity and settings.

#### Acceptance Criteria

```gherkin
Given the migration is applied
When I inspect the database schema
Then the profiles table exists with columns: id (UUID PK = auth.users.id), email, full_name, display_name, avatar_url, created_at, updated_at
And the user_preferences table exists with columns: id, user_id (FK -> profiles.id), location_zip, location_lat, location_lng, price_range_min, price_range_max, occasion_tags (JSONB), notification_email_frequency (enum: daily/weekly/off), created_at, updated_at
And both tables have RLS enabled
And profiles SELECT policy allows any authenticated user to read any profile
And profiles UPDATE policy restricts to user_id = auth.uid()
And user_preferences SELECT/UPDATE policies restrict to user_id = auth.uid()
And updated_at triggers are active on both tables

Given a user with id 'user-A' is authenticated
When they query user_preferences
Then they see only their own preferences row

Given a user with id 'user-B' is authenticated
When they try to UPDATE user_preferences for user-A
Then the operation returns zero affected rows
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_profiles_and_preferences.sql` | Create |
| Types | `types/database.ts` | Regenerate via `supabase gen types` |

#### Dependencies

- **Blocked by:** None — this is the root migration
- **Blocks:** EPIC-01/STORY-02, EPIC-01/STORY-03, EPIC-01/STORY-04, EPIC-01/STORY-05, and all downstream epics

#### Testing Requirements

- [ ] **RLS (pgTAP):** Positive — user can SELECT/UPDATE own profile and preferences
- [ ] **RLS (pgTAP):** Negative — user cannot SELECT/UPDATE another user's preferences
- [ ] **RLS (pgTAP):** Profiles SELECT — any authenticated user can read any profile (public)
- [ ] **Unit:** Verify migration applies cleanly on fresh database

#### Implementation Notes

- Per CG-2, these are **user-scoped tables** — they do NOT have `org_id`. RLS uses `user_id = auth.uid()` pattern.
- `profiles.id` should be `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` — the profile IS the user.
- `user_preferences` is 1:1 with profiles — add `UNIQUE(user_id)` constraint.
- `price_range_min` and `price_range_max` are `INTEGER` (whole dollar amounts matching the UI buckets: 10, 20, 35, 50, 100).
- `occasion_tags` is a JSONB array of strings. Add a GIN index for containment queries.
- `notification_email_frequency` should be a PostgreSQL enum type `notification_frequency` with values `('daily', 'weekly', 'off')`.
- `location_lat` / `location_lng` are `NUMERIC(10,7)` for precision. These are NOT PostGIS columns — simple lat/lng for user preference storage. PostGIS is used in EPIC-06 for retailer spatial queries.
