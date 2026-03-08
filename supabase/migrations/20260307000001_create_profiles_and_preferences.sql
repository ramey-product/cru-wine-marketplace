-- Migration: Create profiles and user_preferences tables
-- Epic: EPIC-01 (User Accounts & Preferences)
-- Story: STORY-01 (Database schema for profiles and preferences)
--
-- These are USER-SCOPED tables (no org_id). They use auth.uid() for RLS
-- instead of the org_id membership subquery pattern.

SET search_path TO '';

-- =============================================================================
-- 1. Enum type for notification frequency
-- =============================================================================

CREATE TYPE public.notification_frequency AS ENUM ('daily', 'weekly', 'off');

-- =============================================================================
-- 2. Reusable trigger function: update_updated_at()
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. profiles table
--    - id mirrors auth.users(id), NOT gen_random_uuid()
--    - No org_id (user-scoped)
-- =============================================================================

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  display_name    TEXT,
  avatar_url      TEXT,
  age_confirmed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at trigger
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 4. user_preferences table
--    - One row per user (user_id is UNIQUE)
--    - No org_id (user-scoped)
-- =============================================================================

CREATE TABLE public.user_preferences (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_zip                  TEXT,
  location_lat                  NUMERIC(10, 7),
  location_lng                  NUMERIC(10, 7),
  price_range_min               INTEGER,
  price_range_max               INTEGER,
  occasion_tags                 JSONB DEFAULT '[]'::jsonb,
  notification_email_frequency  public.notification_frequency NOT NULL DEFAULT 'off',
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at trigger
CREATE TRIGGER trg_user_preferences_updated
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 5. Indexes
-- =============================================================================

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences (user_id);
CREATE INDEX idx_user_preferences_occasion_tags ON public.user_preferences USING GIN (occasion_tags);

-- =============================================================================
-- 6. Row Level Security
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles: any authenticated user can read (for display names, avatars in social features)
CREATE POLICY "Authenticated users can view any profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Profiles: only the owner can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles: INSERT not needed (handled by handle_new_user() SECURITY DEFINER trigger)

-- User Preferences: only the owner can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User Preferences: only the owner can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User Preferences: only the owner can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 7. Auth trigger: auto-create profile on user signup
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
