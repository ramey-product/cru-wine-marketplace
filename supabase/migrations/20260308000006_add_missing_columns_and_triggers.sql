-- Migration: Add missing columns and triggers for taste profile tables
--
-- Fixes:
--   1. taste_profile_wines: add `updated_at` column (was missing from 000004)
--   2. taste_profile_wines: add updated_at trigger using existing update_updated_at()
--   3. taste_profiles: add auto-increment trigger for `profile_version` column
--      to support atomic upsert operations in the DAL layer

SET search_path TO '';

-- =============================================================================
-- 1. Add updated_at column to taste_profile_wines
-- =============================================================================

ALTER TABLE public.taste_profile_wines
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;

-- =============================================================================
-- 2. Add updated_at trigger on taste_profile_wines
--    Reuses public.update_updated_at() from 20260307000001
-- =============================================================================

CREATE TRIGGER set_taste_profile_wines_updated_at
  BEFORE UPDATE ON public.taste_profile_wines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. Auto-increment profile_version on taste_profiles UPDATE
-- =============================================================================

CREATE OR REPLACE FUNCTION public.increment_profile_version()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_version := OLD.profile_version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_increment_profile_version
  BEFORE UPDATE ON public.taste_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_profile_version();
