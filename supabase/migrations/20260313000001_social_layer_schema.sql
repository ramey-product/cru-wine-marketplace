-- Migration: Create follows and share_events tables, ALTER profiles for social columns
-- EPIC-08/STORY-01 — Social/Community Layer schema
--
-- follows and share_events are user-scoped with NO org_id (CG-2 exception):
--   Follow relationships are between users, not org-owned data.
--   Share events are personal user behavior logs, not org-tied content.

SET search_path TO 'public', 'extensions';

-- =============================================================================
-- 1. Follows table
-- =============================================================================
-- NOTE: This table intentionally has NO org_id column per CG-2 resolution.
-- Follow relationships are between users, not org-owned data.

CREATE TABLE public.follows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX idx_follows_follower
  ON public.follows (follower_id);

CREATE INDEX idx_follows_following
  ON public.follows (following_id);

-- No updated_at column or trigger: follows are created or deleted, never updated.

-- =============================================================================
-- 2. Share Events table
-- =============================================================================
-- NOTE: This table intentionally has NO org_id column per CG-2 resolution.
-- Share events are personal user behavior logs, not org-tied content.
-- user_id is nullable to support anonymous share tracking via API route
-- (the API route uses supabaseAdmin service role to bypass RLS).

CREATE TABLE public.share_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shareable_type  TEXT NOT NULL CHECK (shareable_type IN ('wine', 'producer')),
  shareable_id    UUID NOT NULL,
  platform        TEXT NOT NULL CHECK (platform IN ('native_share', 'clipboard', 'twitter', 'facebook', 'email')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_share_events_user
  ON public.share_events (user_id);

CREATE INDEX idx_share_events_shareable
  ON public.share_events (shareable_type, shareable_id);

-- No updated_at column or trigger: share events are append-only, never updated.

-- =============================================================================
-- 3. ALTER profiles — add social columns
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 160),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- Partial unique index on username — only enforces uniqueness for non-null values,
-- allowing multiple users to have NULL username (haven't set one yet).
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username
  ON public.profiles (username) WHERE username IS NOT NULL;

-- =============================================================================
-- 4. Row Level Security
-- =============================================================================

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4a. Follows RLS — visible to both parties
-- -----------------------------------------------------------------------------

-- Users can see follows they are part of (as follower or following)
CREATE POLICY "Users can view their own follow relationships"
  ON public.follows FOR SELECT
  TO authenticated
  USING (follower_id = auth.uid() OR following_id = auth.uid());

-- Users can only create follows as themselves
CREATE POLICY "Users can create their own follows"
  ON public.follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

-- Users can only delete their own follows (unfollow)
CREATE POLICY "Users can delete their own follows"
  ON public.follows FOR DELETE
  TO authenticated
  USING (follower_id = auth.uid());

-- No UPDATE policy: follows are created or deleted, never updated.

-- -----------------------------------------------------------------------------
-- 4b. Share Events RLS — user-scoped (own events only)
-- -----------------------------------------------------------------------------
-- Anonymous share tracking bypasses RLS via supabaseAdmin service role.

-- Users can view their own share events
CREATE POLICY "Users can view their own share events"
  ON public.share_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own share events
CREATE POLICY "Users can create their own share events"
  ON public.share_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No UPDATE or DELETE policy: share events are append-only, immutable.
