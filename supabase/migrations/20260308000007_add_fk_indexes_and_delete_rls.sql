-- Migration: Add missing FK indexes and DELETE RLS policy
-- Fixes: W8 (FK indexes on invited_by columns), W10 (DELETE policy on taste_profiles)

-- ---------------------------------------------------------------------------
-- W8: Add indexes on foreign key columns that lack them
-- invitations.invited_by and memberships.invited_by reference auth.users(id)
-- Without indexes, JOIN/WHERE on these columns causes sequential scans
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_invitations_invited_by
  ON invitations (invited_by);

CREATE INDEX IF NOT EXISTS idx_memberships_invited_by
  ON memberships (invited_by);

-- ---------------------------------------------------------------------------
-- W10: Add DELETE RLS policy on taste_profiles
-- Users should be able to delete their own taste profile
-- The table already has SELECT, INSERT, UPDATE policies scoped to auth.uid()
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can delete own taste profile"
  ON taste_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
