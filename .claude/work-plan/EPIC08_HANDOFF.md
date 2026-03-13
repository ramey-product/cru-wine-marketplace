# Epic 08 Handoff — Social/Community Layer Backend

> **Created**: 2026-03-13
> **Previous**: EPIC-07 Curation Engine merged (PR #16)
> **Branch**: Create `epic-08/social-layer` off `main`
> **PRD**: `docs/prds/prd-08-social-layer.md` (161 lines)
> **Epic File**: `.claude/work-plan/epics/epic-08-social-layer.md`

---

## Process Instructions (Mandatory)

1. **Work on ONE story at a time, sequentially** in dependency order below
2. **Delegate to `sr-backend`** for migrations, DAL, actions, and API routes
3. **Load context incrementally** — do NOT load all docs at once
4. **Subagents load their own context** — pass brief summaries and file paths, not full contents
5. **After each story**: commit, verify typecheck (`pnpm turbo typecheck`), mark complete
6. **After all backend stories**: QA review, PR to main
7. **Regenerate `types/database.ts`** after Story 01 migration — update the types file to include new tables and altered columns

---

## Scope: Backend Stories Only (CP3)

4 stories, 13 story points total. Frontend stories (05-10) are CP4 and out of scope for this handoff.

| # | Story | Points | Agent | Status |
|---|-------|--------|-------|--------|
| 01 | Social Layer Database Schema | 5 | sr-backend | TODO |
| 02 | DAL Functions for Follows and Shares | 3 | sr-backend | TODO |
| 03 | Follow/Unfollow Server Actions | 3 | sr-backend | TODO |
| 04 | Share Tracking Server Action and API Route | 2 | sr-backend | TODO |

---

## Implementation Sequence (Dependency Chain)

```
Story 01 (tables + ALTER profiles)
  └── Story 02 (DAL functions)
        ├── Story 03 (follow/unfollow actions)
        └── Story 04 (share tracking action + API route)
```

**Recommended order:** 01 → 02 → 03 → 04

Stories 03 and 04 are independent of each other (both depend on Story 02 only), so they could theoretically run in parallel. But keeping them sequential avoids interleaving changes to different action files.

---

## Dependencies — All Satisfied

| Dependency | Source | Migration | Verified |
|-----------|--------|-----------|----------|
| `profiles` table | EPIC-01 | `20260307000001` | Yes |
| `wines` table | EPIC-02 | `20260308000002` | Yes |
| `producers` table | EPIC-02 | `20260308000002` | Yes |

---

## Key Architectural Decisions

### 1. V0 Scope: Only Two Social Primitives

- **External sharing**: Users share wine/producer pages via Web Share API or clipboard fallback
- **Internal follows**: Users follow/unfollow other users to build a social graph
- **Explicitly NOT in V0**: No feed, no UGC, no messaging, no comments

### 2. CG-2 Table Scoping: All User-Scoped (NO org_id)

- `follows` — user-scoped (NO `org_id`). Follow relationships are between users, not org-owned data.
- `share_events` — user-scoped (NO `org_id`). Like `user_wine_dismissals` in EPIC-07, these are personal user behavior logs.
- `profiles` ALTER — already user-scoped from EPIC-01.

This matches the pattern established in EPIC-07's `user_wine_dismissals`. Include a comment in the migration explaining the CG-2 exception.

### 3. Table Name Correction: `profiles` Not `user_profiles`

The story files reference `user_profiles` but the actual table is **`profiles`** (migration `20260307000001`). The ALTER and all FK references must use `public.profiles`.

### 4. Follow RLS: Visible to Both Parties

Unlike dismissals (private to the user), follows are visible to both the follower AND the person being followed:
- SELECT: `follower_id = auth.uid() OR following_id = auth.uid()`
- INSERT: `follower_id = auth.uid()` (can only create follows as yourself)
- DELETE: `follower_id = auth.uid()` (can only unfollow as yourself)

Public follow counts (for profile pages) will need a separate approach — either a Supabase function or a public-readable count view, since RLS restricts direct counts. For V0, the action can query counts server-side where the user is authenticated.

### 5. Share Events: Dual Tracking Path

- **Server Action** (`trackShare`) — for authenticated users, called from client components
- **API Route** (`POST /api/v1/share-events`) — for fire-and-forget via `navigator.sendBeacon()`, supports anonymous shares
- The API route uses `supabaseAdmin` (service role) since no user session exists for anonymous tracking

### 6. No `updated_at` on New Tables

- `follows`: created or deleted, never updated
- `share_events`: append-only log, immutable once created
- Neither table needs an `updated_at` column or trigger

---

## Tables to Create / Alter

### Migration: Social Layer Schema (Story 01)

**`follows`** (user-scoped, NO org_id)
```
id              UUID PK DEFAULT gen_random_uuid()
follower_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
following_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
UNIQUE(follower_id, following_id)
CHECK(follower_id != following_id)
```

**`share_events`** (user-scoped, NO org_id)
```
id              UUID PK DEFAULT gen_random_uuid()
user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE  -- nullable for anonymous shares
shareable_type  TEXT NOT NULL CHECK (shareable_type IN ('wine', 'producer'))
shareable_id    UUID NOT NULL
platform        TEXT NOT NULL CHECK (platform IN ('native_share', 'clipboard', 'twitter', 'facebook', 'email'))
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
```

**ALTER `profiles`** (add social columns)
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 160),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username
  ON public.profiles(username) WHERE username IS NOT NULL;
```

**RLS Policies:**
- `follows` SELECT: own follows only (`follower_id = auth.uid() OR following_id = auth.uid()`)
- `follows` INSERT: own follows only (`follower_id = auth.uid()`)
- `follows` DELETE: own follows only (`follower_id = auth.uid()`)
- `share_events` SELECT: own events only (`user_id = auth.uid()`)
- `share_events` INSERT: own events only (`user_id = auth.uid()`) — the API route uses service role for anonymous tracking, bypassing RLS

**Indexes:**
- `follows`: `follower_id`, `following_id`
- `share_events`: `user_id`, composite `(shareable_type, shareable_id)`
- `profiles`: partial unique index on `username` WHERE NOT NULL

---

## Files to Create

| Layer | File | Story | Description |
|-------|------|-------|-------------|
| Migration | `supabase/migrations/20260313000001_social_layer_schema.sql` | 01 | follows, share_events + ALTER profiles + RLS + indexes |
| DAL | `apps/web/lib/dal/follows.ts` | 02 | getFollowing, getFollowers, getIsFollowing, getFollowCounts, createFollow, deleteFollow |
| DAL | `apps/web/lib/dal/shares.ts` | 02 | createShareEvent, getShareCounts |
| Action | `apps/web/lib/actions/follows.ts` | 03 | followUser, unfollowUser |
| Validation | `apps/web/lib/validations/follows.ts` | 03 | FollowUserSchema |
| Action | `apps/web/lib/actions/shares.ts` | 04 | trackShare |
| Validation | `apps/web/lib/validations/shares.ts` | 04 | TrackShareSchema |
| Route | `apps/web/app/api/v1/share-events/route.ts` | 04 | POST handler for anonymous share tracking |

---

## Existing Schema Context (Consumed Tables — Quick Reference)

### profiles (Migration `20260307000001`)
```
id, email, full_name, display_name, avatar_url,
age_confirmed_at, deletion_requested_at, deletion_scheduled_at,
created_at, updated_at
```
**DAL**: `apps/web/lib/dal/users.ts`

### wines (Migration `20260308000002`)
```
id, org_id, producer_id, name, slug, varietal, region, ...
```
**DAL**: `apps/web/lib/dal/wines.ts`

### producers (Migration `20260308000002`)
```
id, org_id, name, slug, region, country, ...
```
**DAL**: `apps/web/lib/dal/producers.ts`

---

## Existing Code Patterns (Reference for Consistency)

| Module | Path | Pattern Used |
|--------|------|-------------|
| DAL types | `apps/web/lib/dal/types.ts` | `TypedClient = SupabaseClient<Database>` |
| Wine dismissals DAL | `apps/web/lib/dal/wine-dismissals.ts` | User-scoped DAL, idempotent upsert pattern |
| Curation actions | `apps/web/lib/actions/curation.ts` | Zod validate → auth → DAL → revalidatePath |
| Curation validations | `apps/web/lib/validations/curation.ts` | Zod schemas as named constants |
| Webhook route | `apps/web/app/api/webhooks/stripe/route.ts` | API route with service role client |
| Supabase admin client | `apps/web/lib/supabase/admin.ts` | Service role client for server-only ops |

---

## Updating `types/database.ts`

After Story 01 migration, update `apps/web/types/database.ts` to include:
1. `follows` table type (Row/Insert/Update/Relationships)
2. `share_events` table type (Row/Insert/Update/Relationships)
3. Add `username`, `bio`, `is_public` columns to the existing `profiles` table type

Follow the pattern from EPIC-07 (manually adding types matching the migration schema).

---

## Risks & Open Questions

1. **`profiles` table name mismatch**: Story files say `user_profiles` but the actual table is `profiles`. The migration and DAL must use `profiles`. This is clarified in this handoff — sr-backend should follow this doc, not the story files, for the table name.

2. **Public follow counts**: RLS restricts follows to only be visible to the involved parties. Public profile pages need follower/following counts visible to everyone. Options:
   - (a) Create a Supabase function `get_follow_counts(user_id)` that runs as `SECURITY DEFINER` to bypass RLS
   - (b) Store denormalized counts on the `profiles` table (updated by trigger)
   - (c) V0: Just fetch counts in the server action where the authenticated user has access

   **Recommend (c)** for V0 simplicity. The follower/following counts are only shown on profile pages, and the server action has auth context. If public (logged-out) profile pages need counts later, add option (a).

3. **Anonymous share events**: The `share_events.user_id` is nullable to support anonymous tracking via the API route. The RLS policy for INSERT uses `user_id = auth.uid()`, which won't work for anonymous inserts. The API route must use the `supabaseAdmin` service role client to bypass RLS for anonymous tracking.

4. **Username generation/selection**: The `profiles` ALTER adds a `username` column but no story in the backend scope handles username selection UI. For V0, `username` is nullable — users who haven't set one are identified by `display_name` or `full_name`. Username selection can be added as part of the profile settings UI (CP4).

5. **No `user_profiles` DAL file exists**: Story 02 mentions modifying `lib/dal/user-profiles.ts` but this file doesn't exist. The existing user DAL is `apps/web/lib/dal/users.ts`. Either add functions there or create a new file — recommend adding to the existing `users.ts` to stay consistent.

---

## How to Start

1. **Pull latest main**: `git checkout main && git pull`
2. **Create branch**: `git checkout -b epic-08/social-layer`
3. **Read Story 01**: `.claude/work-plan/stories/epic-08/story-01-social-layer-database-schema.md`
4. **Delegate to `sr-backend`** with:
   - Story file path
   - Brief: "Create follows and share_events tables (both user-scoped, NO org_id — CG-2 exception). ALTER profiles to add username, bio, is_public columns. IMPORTANT: The actual table name is `profiles` not `user_profiles`. See EPIC08_HANDOFF.md for full schema spec and corrections."
   - Reference: This handoff doc for schema details + existing migration patterns in `supabase/migrations/`
5. **After Story 01**: Update `types/database.ts` with new table types + altered profiles columns
6. **Continue through stories** in order: 01 → 02 → 03 → 04
7. **After all 4 stories**: Run typecheck (`pnpm turbo typecheck`), build (`pnpm turbo build`), QA review, create PR to main

---

## Story File Paths

| Story | Path |
|-------|------|
| 01 | `.claude/work-plan/stories/epic-08/story-01-social-layer-database-schema.md` |
| 02 | `.claude/work-plan/stories/epic-08/story-02-dal-functions-follows-shares.md` |
| 03 | `.claude/work-plan/stories/epic-08/story-03-follow-unfollow-server-actions.md` |
| 04 | `.claude/work-plan/stories/epic-08/story-04-share-tracking-server-action.md` |
