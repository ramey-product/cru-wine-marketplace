-- Migration: Create producers, producer_photos, wines, wine_tags, wine_occasions
-- Combined from EPIC-02/STORY-01 (FTS) + EPIC-04/STORY-01 (producers/wines)
--
-- Content-scoped tables: org_id always references the platform organization.
-- SELECT is permissive for all authenticated users.
-- Write operations restricted to platform org admins.

SET search_path TO '';

-- =============================================================================
-- 1. Enable pg_trgm extension (for fuzzy matching / autocomplete)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- 2. Producers table
-- =============================================================================

CREATE TABLE public.producers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  region            TEXT,
  country           TEXT,
  tagline           TEXT CHECK (char_length(tagline) <= 150),
  story_content     TEXT,
  farming_practices JSONB DEFAULT '[]'::jsonb,
  vineyard_size     TEXT,
  year_established  INTEGER,
  annual_production TEXT,
  hero_image_url    TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_producers_org ON public.producers (org_id);
CREATE INDEX idx_producers_slug ON public.producers (slug);
CREATE INDEX idx_producers_active ON public.producers (is_active) WHERE is_active = true;

CREATE TRIGGER trg_producers_updated
  BEFORE UPDATE ON public.producers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. Producer Photos table
-- =============================================================================

CREATE TABLE public.producer_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  producer_id   UUID NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  caption       TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_producer_photos_org ON public.producer_photos (org_id);
CREATE INDEX idx_producer_photos_producer ON public.producer_photos (producer_id);

CREATE TRIGGER trg_producer_photos_updated
  BEFORE UPDATE ON public.producer_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 4. Wines table (with FTS support)
-- =============================================================================

CREATE TABLE public.wines (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  producer_id          UUID NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  varietal             TEXT,
  region               TEXT,
  sub_region           TEXT,
  appellation          TEXT,
  country              TEXT,
  vintage              INTEGER,
  description          TEXT,
  tasting_description  TEXT,
  food_pairings        JSONB DEFAULT '[]'::jsonb,
  flavor_profile       JSONB DEFAULT '{}'::jsonb,
  story_hook           TEXT,           -- ≤120 chars enforced at Zod layer
  image_url            TEXT,
  price_min            NUMERIC(10, 2),
  price_max            NUMERIC(10, 2),
  medusa_product_id    TEXT,           -- nullable: wines can exist without Medusa products
  is_active            BOOLEAN NOT NULL DEFAULT true,
  search_vector        tsvector,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wines_org ON public.wines (org_id);
CREATE INDEX idx_wines_slug ON public.wines (slug);
CREATE INDEX idx_wines_producer ON public.wines (producer_id);
CREATE INDEX idx_wines_varietal ON public.wines (varietal);
CREATE INDEX idx_wines_active ON public.wines (is_active) WHERE is_active = true;
CREATE INDEX idx_wines_search_vector ON public.wines USING gin (search_vector);
CREATE INDEX idx_wines_name_trgm ON public.wines USING gin (name gin_trgm_ops);

CREATE TRIGGER trg_wines_updated
  BEFORE UPDATE ON public.wines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 5. FTS trigger: auto-update search_vector on INSERT/UPDATE
--    Weights: name = 'A', varietal/region = 'B', others = 'C'
-- =============================================================================

CREATE OR REPLACE FUNCTION public.wines_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.varietal, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.region, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.sub_region, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.appellation, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.country, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wines_search_vector
  BEFORE INSERT OR UPDATE OF name, varietal, region, sub_region, appellation, country
  ON public.wines
  FOR EACH ROW EXECUTE FUNCTION public.wines_search_vector_update();

-- =============================================================================
-- 6. Wine Tags table
-- =============================================================================

CREATE TABLE public.wine_tags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id    UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  wine_id   UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  tag_name  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wine_tags_org ON public.wine_tags (org_id);
CREATE INDEX idx_wine_tags_wine ON public.wine_tags (wine_id);
CREATE INDEX idx_wine_tags_name ON public.wine_tags (tag_name);
CREATE UNIQUE INDEX idx_wine_tags_wine_tag ON public.wine_tags (wine_id, tag_name);

-- =============================================================================
-- 7. Wine Occasions table
-- =============================================================================

CREATE TABLE public.wine_occasions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  wine_id        UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  occasion_name  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wine_occasions_org ON public.wine_occasions (org_id);
CREATE INDEX idx_wine_occasions_wine ON public.wine_occasions (wine_id);
CREATE INDEX idx_wine_occasions_name ON public.wine_occasions (occasion_name);
CREATE UNIQUE INDEX idx_wine_occasions_wine_occasion ON public.wine_occasions (wine_id, occasion_name);

-- =============================================================================
-- 8. Row Level Security — Content-scoped pattern
--    SELECT: any authenticated user
--    WRITE: platform org admins only (admin/owner of the org_id on the row)
-- =============================================================================

-- --- Producers ---
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active producers"
  ON public.producers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Platform admins can insert producers"
  ON public.producers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = producers.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Platform admins can update producers"
  ON public.producers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = producers.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = producers.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Platform admins can delete producers"
  ON public.producers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = producers.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

-- --- Producer Photos ---
ALTER TABLE public.producer_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view producer photos"
  ON public.producer_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Platform admins can insert producer photos"
  ON public.producer_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = producer_photos.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Platform admins can update producer photos"
  ON public.producer_photos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = producer_photos.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = producer_photos.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Platform admins can delete producer photos"
  ON public.producer_photos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = producer_photos.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

-- --- Wines ---
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wines"
  ON public.wines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Platform admins can insert wines"
  ON public.wines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wines.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Platform admins can update wines"
  ON public.wines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wines.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wines.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Platform admins can delete wines"
  ON public.wines FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wines.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

-- --- Wine Tags ---
ALTER TABLE public.wine_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wine tags"
  ON public.wine_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Platform admins can insert wine tags"
  ON public.wine_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_tags.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Platform admins can delete wine tags"
  ON public.wine_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_tags.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

-- --- Wine Occasions ---
ALTER TABLE public.wine_occasions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wine occasions"
  ON public.wine_occasions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Platform admins can insert wine occasions"
  ON public.wine_occasions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_occasions.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Platform admins can delete wine occasions"
  ON public.wine_occasions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_occasions.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );
