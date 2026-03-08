-- ---------------------------------------------------------------------------
-- taste_profiles — user-scoped taste preferences (no org_id per CG-2)
-- ---------------------------------------------------------------------------

CREATE TABLE public.taste_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flavor_affinities     JSONB NOT NULL DEFAULT '[]'::jsonb,
  flavor_aversions      JSONB NOT NULL DEFAULT '[]'::jsonb,
  drinking_contexts     JSONB NOT NULL DEFAULT '[]'::jsonb,
  adventurousness_score INTEGER NOT NULL DEFAULT 2
    CONSTRAINT taste_profiles_adventurousness_check CHECK (adventurousness_score BETWEEN 1 AND 3),
  profile_version       INTEGER NOT NULL DEFAULT 1,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One profile per user
  CONSTRAINT taste_profiles_user_unique UNIQUE (user_id)
);

-- Index for fast lookups by user
CREATE INDEX idx_taste_profiles_user_id ON public.taste_profiles (user_id);

-- Auto-update updated_at
CREATE TRIGGER set_taste_profiles_updated_at
  BEFORE UPDATE ON public.taste_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — user can only access their own taste profile
-- ---------------------------------------------------------------------------

ALTER TABLE public.taste_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own taste profile"
  ON public.taste_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own taste profile"
  ON public.taste_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own taste profile"
  ON public.taste_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- taste_profile_wines — wines a user has marked as "loved" (no org_id)
-- ---------------------------------------------------------------------------

CREATE TABLE public.taste_profile_wines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wine_id    UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  source     TEXT NOT NULL DEFAULT 'manual_add'
    CONSTRAINT taste_profile_wines_source_check CHECK (source IN ('onboarding', 'manual_add')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One entry per user+wine pair
  CONSTRAINT taste_profile_wines_user_wine_unique UNIQUE (user_id, wine_id)
);

-- Indexes for common access patterns
CREATE INDEX idx_taste_profile_wines_user_id ON public.taste_profile_wines (user_id);
CREATE INDEX idx_taste_profile_wines_wine_id ON public.taste_profile_wines (wine_id);

-- ---------------------------------------------------------------------------
-- RLS — user can only access their own taste profile wines
-- ---------------------------------------------------------------------------

ALTER TABLE public.taste_profile_wines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own taste profile wines"
  ON public.taste_profile_wines FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own taste profile wines"
  ON public.taste_profile_wines FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own taste profile wines"
  ON public.taste_profile_wines FOR DELETE
  USING (user_id = auth.uid());
