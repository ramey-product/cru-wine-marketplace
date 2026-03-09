-- Migration: Enable PostGIS and create retailers table
-- Epic: EPIC-06 (Local Retailer Integration)
-- Story: STORY-01 (Retailers and Inventory Schema with PostGIS)
--
-- Retailers are org-scoped (each retailer belongs to an organization).
-- SELECT is permissive for all authenticated users (consumers browse retailers).
-- Write operations restricted to org members (retailer staff).

SET search_path TO '';

-- =============================================================================
-- 1. Enable PostGIS extension for geographic queries
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================================
-- 2. Retailers table
-- =============================================================================

CREATE TABLE public.retailers (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                    UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name                      TEXT NOT NULL,
  slug                      TEXT UNIQUE NOT NULL,
  address                   TEXT NOT NULL,
  city                      TEXT NOT NULL,
  state                     TEXT NOT NULL DEFAULT 'CA',
  zip                       TEXT NOT NULL,
  location                  geography(Point, 4326) NOT NULL,
  phone                     TEXT,
  email                     TEXT,
  website                   TEXT,
  pos_type                  TEXT CHECK (pos_type IN ('square', 'lightspeed', 'shopify', 'clover', 'csv_only', 'other')),
  pos_credentials           JSONB,
  fulfillment_capabilities  JSONB NOT NULL DEFAULT '["pickup"]'::jsonb,
  delivery_radius_miles     INTEGER,
  commission_rate           NUMERIC(5,4) DEFAULT 0.15,
  is_active                 BOOLEAN NOT NULL DEFAULT true,
  onboarded_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraints
ALTER TABLE public.retailers
  ADD CONSTRAINT chk_retailers_commission_rate
  CHECK (commission_rate >= 0 AND commission_rate <= 1);

ALTER TABLE public.retailers
  ADD CONSTRAINT chk_retailers_delivery_radius
  CHECK (delivery_radius_miles IS NULL OR delivery_radius_miles >= 0);

-- =============================================================================
-- 3. Indexes
-- =============================================================================

CREATE INDEX idx_retailers_org ON public.retailers (org_id);
CREATE INDEX idx_retailers_slug ON public.retailers (slug);
CREATE INDEX idx_retailers_location ON public.retailers USING GIST (location);
CREATE INDEX idx_retailers_org_active ON public.retailers (org_id, is_active);

-- =============================================================================
-- 4. Updated_at trigger
-- =============================================================================

CREATE TRIGGER trg_retailers_updated
  BEFORE UPDATE ON public.retailers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 5. Row Level Security
-- =============================================================================

ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can view retailers (consumers browse availability)
CREATE POLICY "Anyone can view retailers"
  ON public.retailers FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only org members can create retailers for their org
CREATE POLICY "Org members can insert retailers"
  ON public.retailers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailers.org_id
    )
  );

-- UPDATE: Only org members can update their org's retailers
CREATE POLICY "Org members can update retailers"
  ON public.retailers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailers.org_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailers.org_id
    )
  );

-- DELETE: Only admins/owners can delete retailers
CREATE POLICY "Org admins can delete retailers"
  ON public.retailers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailers.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );
