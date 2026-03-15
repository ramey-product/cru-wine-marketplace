-- Migration: Create PostGIS spatial query functions for nearby retailer/wine discovery
-- Epic: EPIC-12 / Story: STORY-12/01
--
-- Two SECURITY INVOKER functions that leverage the existing GIST index on
-- retailers.location to power location-based search:
--   1. find_nearby_retailers  — retailers within N miles of a point
--   2. find_wines_available_nearby — deduplicated wines stocked by nearby retailers

SET search_path TO '';

-- =============================================================================
-- 1. find_nearby_retailers
--    Returns active retailers within p_radius_miles of (p_lat, p_lng),
--    ordered by distance ascending, with windowed total_count for pagination.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.find_nearby_retailers(
  p_lat           DOUBLE PRECISION,
  p_lng           DOUBLE PRECISION,
  p_radius_miles  DOUBLE PRECISION DEFAULT 25,
  p_limit         INTEGER DEFAULT 24,
  p_offset        INTEGER DEFAULT 0
)
RETURNS TABLE (
  id                        UUID,
  org_id                    UUID,
  name                      TEXT,
  slug                      TEXT,
  address                   TEXT,
  city                      TEXT,
  state                     TEXT,
  zip                       TEXT,
  phone                     TEXT,
  email                     TEXT,
  website                   TEXT,
  fulfillment_capabilities  JSONB,
  delivery_radius_miles     INTEGER,
  is_active                 BOOLEAN,
  created_at                TIMESTAMPTZ,
  updated_at                TIMESTAMPTZ,
  distance_miles            DOUBLE PRECISION,
  total_count               BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT
    r.id,
    r.org_id,
    r.name,
    r.slug,
    r.address,
    r.city,
    r.state,
    r.zip,
    r.phone,
    r.email,
    r.website,
    r.fulfillment_capabilities,
    r.delivery_radius_miles,
    r.is_active,
    r.created_at,
    r.updated_at,
    ST_Distance(
      r.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1609.34 AS distance_miles,
    COUNT(*) OVER() AS total_count
  FROM public.retailers r
  WHERE r.is_active = true
    AND ST_DWithin(
      r.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_miles * 1609.34
    )
  ORDER BY distance_miles ASC
  LIMIT p_limit
  OFFSET p_offset;
$$;

COMMENT ON FUNCTION public.find_nearby_retailers IS
  'Returns active retailers within a given radius (miles) of a lat/lng point, sorted by distance.';

-- =============================================================================
-- 2. find_wines_available_nearby
--    Returns wines available at nearby retailers, deduplicated by wine_id
--    (keeping only the closest retailer per wine). Includes retailer_count
--    (number of nearby retailers carrying the wine) and windowed total_count.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.find_wines_available_nearby(
  p_lat           DOUBLE PRECISION,
  p_lng           DOUBLE PRECISION,
  p_radius_miles  DOUBLE PRECISION DEFAULT 25,
  p_limit         INTEGER DEFAULT 24,
  p_offset        INTEGER DEFAULT 0
)
RETURNS TABLE (
  wine_id         UUID,
  wine_name       TEXT,
  wine_slug       TEXT,
  wine_varietal   TEXT,
  wine_region     TEXT,
  wine_appellation TEXT,
  wine_image_url  TEXT,
  wine_vintage    INTEGER,
  producer_id     UUID,
  producer_name   TEXT,
  producer_slug   TEXT,
  retailer_id     UUID,
  retailer_name   TEXT,
  retailer_slug   TEXT,
  retailer_city   TEXT,
  price           INTEGER,
  distance_miles  DOUBLE PRECISION,
  retailer_count  BIGINT,
  total_count     BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH nearby_inventory AS (
    SELECT
      ri.wine_id,
      ri.retailer_id,
      ri.price,
      r.name        AS retailer_name,
      r.slug        AS retailer_slug,
      r.city        AS retailer_city,
      ST_Distance(
        r.location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
      ) / 1609.34 AS distance_miles,
      ROW_NUMBER() OVER (
        PARTITION BY ri.wine_id
        ORDER BY ST_Distance(
          r.location,
          ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        ) ASC
      ) AS rn,
      COUNT(*) OVER (PARTITION BY ri.wine_id) AS retailer_count
    FROM public.retailer_inventory ri
    JOIN public.retailers r ON r.id = ri.retailer_id
    WHERE r.is_active = true
      AND ri.stock_status IN ('in_stock', 'low_stock')
      AND ri.quantity > 0
      AND ST_DWithin(
        r.location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius_miles * 1609.34
      )
  )
  SELECT
    w.id             AS wine_id,
    w.name           AS wine_name,
    w.slug           AS wine_slug,
    w.varietal       AS wine_varietal,
    w.region         AS wine_region,
    w.appellation    AS wine_appellation,
    w.image_url      AS wine_image_url,
    w.vintage        AS wine_vintage,
    p.id             AS producer_id,
    p.name           AS producer_name,
    p.slug           AS producer_slug,
    ni.retailer_id,
    ni.retailer_name,
    ni.retailer_slug,
    ni.retailer_city,
    ni.price,
    ni.distance_miles,
    ni.retailer_count,
    COUNT(*) OVER()  AS total_count
  FROM nearby_inventory ni
  JOIN public.wines w     ON w.id = ni.wine_id
  JOIN public.producers p ON p.id = w.producer_id
  WHERE ni.rn = 1
  ORDER BY ni.distance_miles ASC
  LIMIT p_limit
  OFFSET p_offset;
$$;

COMMENT ON FUNCTION public.find_wines_available_nearby IS
  'Returns wines stocked by nearby retailers, deduplicated to the closest retailer per wine, sorted by distance.';
