-- Migration: Create retailer_inventory table
-- Epic: EPIC-06 (Local Retailer Integration)
-- Story: STORY-01 (Retailers and Inventory Schema with PostGIS)
--
-- Tracks wine availability and pricing at each retailer location.
-- SELECT is permissive for all authenticated users (consumers see availability).
-- Write operations restricted to org members (retailer staff).

SET search_path TO '';

-- =============================================================================
-- 1. Retailer Inventory table
-- =============================================================================

CREATE TABLE public.retailer_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  retailer_id     UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  wine_id         UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  sku             TEXT,
  price           INTEGER NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 0,
  stock_status    TEXT NOT NULL DEFAULT 'in_stock',
  sync_source     TEXT NOT NULL DEFAULT 'csv',
  last_synced_at  TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer_id, wine_id)
);

-- Constraints
ALTER TABLE public.retailer_inventory
  ADD CONSTRAINT chk_retailer_inventory_price
  CHECK (price >= 0);

ALTER TABLE public.retailer_inventory
  ADD CONSTRAINT chk_retailer_inventory_quantity
  CHECK (quantity >= 0);

ALTER TABLE public.retailer_inventory
  ADD CONSTRAINT chk_retailer_inventory_stock_status
  CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock'));

ALTER TABLE public.retailer_inventory
  ADD CONSTRAINT chk_retailer_inventory_sync_source
  CHECK (sync_source IN ('csv', 'pos_api', 'manual'));

-- =============================================================================
-- 2. Indexes
-- =============================================================================

CREATE INDEX idx_retailer_inventory_org ON public.retailer_inventory (org_id);
-- Note: (retailer_id, wine_id) already covered by the UNIQUE constraint
CREATE INDEX idx_retailer_inventory_wine ON public.retailer_inventory (wine_id);
CREATE INDEX idx_retailer_inventory_retailer ON public.retailer_inventory (retailer_id);
CREATE INDEX idx_retailer_inventory_org_stock ON public.retailer_inventory (org_id, stock_status);

-- =============================================================================
-- 3. Updated_at trigger
-- =============================================================================

CREATE TRIGGER trg_retailer_inventory_updated
  BEFORE UPDATE ON public.retailer_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 4. Row Level Security
-- =============================================================================

ALTER TABLE public.retailer_inventory ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can view inventory (consumers see availability)
CREATE POLICY "Anyone can view retailer inventory"
  ON public.retailer_inventory FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only org members can add inventory for their org
CREATE POLICY "Org members can insert inventory"
  ON public.retailer_inventory FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailer_inventory.org_id
    )
  );

-- UPDATE: Only org members can update their org's inventory
CREATE POLICY "Org members can update inventory"
  ON public.retailer_inventory FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailer_inventory.org_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailer_inventory.org_id
    )
  );

-- DELETE: Only admins/owners can delete inventory records
CREATE POLICY "Org admins can delete inventory"
  ON public.retailer_inventory FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailer_inventory.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );
