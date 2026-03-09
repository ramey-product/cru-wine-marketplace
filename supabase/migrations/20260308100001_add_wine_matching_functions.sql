-- Migration: Add fuzzy wine matching RPC function and supporting indexes
-- Epic: EPIC-06 (Local Retailer Integration)
-- Story: STORY-04 (Fuzzy Wine Matching Engine)
--
-- Creates:
-- 1. GIN trigram index on producers.name for fuzzy producer matching
-- 2. GIN trigram index on wines.varietal for fuzzy varietal matching
-- 3. match_wine_candidates() RPC function that returns ranked wine candidates
--    using pg_trgm similarity scoring across name, producer, vintage, varietal

SET search_path TO '';

-- =============================================================================
-- 1. Trigram indexes for fuzzy matching
-- =============================================================================

-- producers.name: needed for producer-name trigram similarity in the RPC
CREATE INDEX IF NOT EXISTS idx_producers_name_trgm
  ON public.producers USING gin (name gin_trgm_ops);

-- wines.varietal: needed for varietal trigram similarity in the RPC
CREATE INDEX IF NOT EXISTS idx_wines_varietal_trgm
  ON public.wines USING gin (varietal gin_trgm_ops);

-- =============================================================================
-- 2. match_wine_candidates() — fuzzy search RPC function
-- =============================================================================
--
-- Returns up to `p_limit` wine candidates ranked by a weighted composite score:
--   - Wine name similarity:   0.35
--   - Producer name similarity: 0.30
--   - Vintage exact match:    0.20
--   - Varietal similarity:    0.15
--
-- Uses SECURITY INVOKER so that the caller's RLS policies apply (wines and
-- producers both have permissive SELECT for authenticated users).
--
-- The function applies a pre-filter using the trigram % operator on wine name
-- (with a lowered similarity threshold of 0.1) to narrow candidates before
-- computing the full composite score. This keeps the query fast even on large
-- wine catalogs.

CREATE OR REPLACE FUNCTION public.match_wine_candidates(
  p_search_name    TEXT,
  p_search_producer TEXT DEFAULT NULL,
  p_search_vintage INTEGER DEFAULT NULL,
  p_search_varietal TEXT DEFAULT NULL,
  p_org_id         UUID DEFAULT NULL,
  p_limit          INTEGER DEFAULT 10
)
RETURNS TABLE (
  wine_id          UUID,
  wine_name        TEXT,
  wine_slug        TEXT,
  wine_vintage     INTEGER,
  wine_varietal    TEXT,
  wine_region      TEXT,
  wine_country     TEXT,
  producer_id      UUID,
  producer_name    TEXT,
  producer_slug    TEXT,
  name_score       REAL,
  producer_score   REAL,
  vintage_score    REAL,
  varietal_score   REAL,
  composite_score  REAL
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
DECLARE
  v_search_name     TEXT;
  v_search_producer TEXT;
  v_search_varietal TEXT;
BEGIN
  -- Normalize inputs: lowercase, trim whitespace
  v_search_name     := lower(trim(COALESCE(p_search_name, '')));
  v_search_producer := lower(trim(COALESCE(p_search_producer, '')));
  v_search_varietal := lower(trim(COALESCE(p_search_varietal, '')));

  -- Early exit if no search name provided
  IF v_search_name = '' THEN
    RETURN;
  END IF;

  -- Temporarily lower the similarity threshold for the pre-filter.
  -- The default threshold (0.3) is too aggressive for abbreviated wine names.
  -- We use 0.1 to cast a wide net, then rank by composite score.
  PERFORM set_config('pg_trgm.similarity_threshold', '0.1', true);

  RETURN QUERY
  SELECT
    w.id                                    AS wine_id,
    w.name                                  AS wine_name,
    w.slug                                  AS wine_slug,
    w.vintage                               AS wine_vintage,
    w.varietal                              AS wine_varietal,
    w.region                                AS wine_region,
    w.country                               AS wine_country,
    p.id                                    AS producer_id,
    p.name                                  AS producer_name,
    p.slug                                  AS producer_slug,

    -- Individual component scores
    similarity(lower(w.name), v_search_name)::REAL
      AS name_score,

    CASE
      WHEN v_search_producer = '' THEN 0.5::REAL  -- neutral score when no producer provided
      ELSE similarity(lower(p.name), v_search_producer)::REAL
    END
      AS producer_score,

    CASE
      WHEN p_search_vintage IS NULL THEN 0.5::REAL  -- neutral score when no vintage provided
      WHEN w.vintage IS NULL THEN 0.0::REAL
      WHEN w.vintage = p_search_vintage THEN 1.0::REAL
      ELSE 0.0::REAL
    END
      AS vintage_score,

    CASE
      WHEN v_search_varietal = '' THEN 0.5::REAL  -- neutral score when no varietal provided
      WHEN w.varietal IS NULL THEN 0.0::REAL
      ELSE similarity(lower(w.varietal), v_search_varietal)::REAL
    END
      AS varietal_score,

    -- Weighted composite score
    (
      0.35 * similarity(lower(w.name), v_search_name)::REAL +
      0.30 * CASE
               WHEN v_search_producer = '' THEN 0.5
               ELSE similarity(lower(p.name), v_search_producer)::REAL
             END +
      0.20 * CASE
               WHEN p_search_vintage IS NULL THEN 0.5
               WHEN w.vintage IS NULL THEN 0.0
               WHEN w.vintage = p_search_vintage THEN 1.0
               ELSE 0.0
             END +
      0.15 * CASE
               WHEN v_search_varietal = '' THEN 0.5
               WHEN w.varietal IS NULL THEN 0.0
               ELSE similarity(lower(w.varietal), v_search_varietal)::REAL
             END
    )::REAL AS composite_score

  FROM public.wines w
  JOIN public.producers p ON w.producer_id = p.id
  WHERE
    -- Pre-filter: trigram similarity on wine name (uses GIN index)
    lower(w.name) % v_search_name
    -- Only active wines
    AND w.is_active = true
    -- Optional org_id filter (if provided, scope to that org's wines)
    AND (p_org_id IS NULL OR w.org_id = p_org_id)
  ORDER BY composite_score DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute to authenticated users (needed for RLS SECURITY INVOKER)
GRANT EXECUTE ON FUNCTION public.match_wine_candidates(TEXT, TEXT, INTEGER, TEXT, UUID, INTEGER)
  TO authenticated;
