SET search_path TO 'public', 'extensions';

-- ============================================================================
-- Corrective migration: fix RLS policy defects found in QA/Code Review
--
-- Fixes:
--   1. Migration 3 (recent_searches): add missing TO authenticated on all policies
--   2. Migration 4 (taste_profiles, taste_profile_wines): add missing TO authenticated
--   3. Missing UPDATE policy on taste_profile_wines (needed for upsert)
--   4. Memberships INSERT policy blocks owner bootstrapping (self-referential)
--   5. Missing UPDATE policies on wine_tags and wine_occasions
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. recent_searches — add TO authenticated to all 4 policies
-- ---------------------------------------------------------------------------

DROP POLICY "Users can read own recent searches" ON public.recent_searches;
CREATE POLICY "Users can read own recent searches"
  ON public.recent_searches FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY "Users can insert own recent searches" ON public.recent_searches;
CREATE POLICY "Users can insert own recent searches"
  ON public.recent_searches FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY "Users can update own recent searches" ON public.recent_searches;
CREATE POLICY "Users can update own recent searches"
  ON public.recent_searches FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY "Users can delete own recent searches" ON public.recent_searches;
CREATE POLICY "Users can delete own recent searches"
  ON public.recent_searches FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. taste_profiles — add TO authenticated to all 3 policies
-- ---------------------------------------------------------------------------

DROP POLICY "Users can read own taste profile" ON public.taste_profiles;
CREATE POLICY "Users can read own taste profile"
  ON public.taste_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY "Users can insert own taste profile" ON public.taste_profiles;
CREATE POLICY "Users can insert own taste profile"
  ON public.taste_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY "Users can update own taste profile" ON public.taste_profiles;
CREATE POLICY "Users can update own taste profile"
  ON public.taste_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. taste_profile_wines — add TO authenticated + add missing UPDATE policy
-- ---------------------------------------------------------------------------

DROP POLICY "Users can read own taste profile wines" ON public.taste_profile_wines;
CREATE POLICY "Users can read own taste profile wines"
  ON public.taste_profile_wines FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY "Users can insert own taste profile wines" ON public.taste_profile_wines;
CREATE POLICY "Users can insert own taste profile wines"
  ON public.taste_profile_wines FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY "Users can delete own taste profile wines" ON public.taste_profile_wines;
CREATE POLICY "Users can delete own taste profile wines"
  ON public.taste_profile_wines FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- NEW: UPDATE policy needed for upsert operation in addTasteProfileWine
CREATE POLICY "Users can update own taste profile wines"
  ON public.taste_profile_wines FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. memberships INSERT — allow owner bootstrapping
--    The original policy requires an existing membership to insert, which
--    creates a chicken-and-egg problem for the first member (owner).
--    Fix: also allow inserting when inserting yourself as owner AND no
--    existing members exist for that org (org creation bootstrap).
-- ---------------------------------------------------------------------------

DROP POLICY "Admins can add members" ON public.memberships;
CREATE POLICY "Admins can add members"
  ON public.memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Existing admins/owners can add members
    org_id IN (
      SELECT m.org_id FROM public.memberships m
      WHERE m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
    OR
    -- Bootstrap: user can insert themselves as owner if org has no members yet
    (
      user_id = auth.uid()
      AND role = 'owner'
      AND NOT EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.org_id = memberships.org_id
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 5. wine_tags & wine_occasions — add missing UPDATE policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Platform admins can update wine tags"
  ON public.wine_tags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_tags.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_tags.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Platform admins can update wine occasions"
  ON public.wine_occasions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_occasions.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_occasions.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );
