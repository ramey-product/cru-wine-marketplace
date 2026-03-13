-- Migration: Create inventory_holds table and get_available_stock function
-- Implements temporary inventory reservations during checkout (EPIC-05).
-- Holds are created when a user starts checkout and expire after 10 minutes.
-- All direct access is denied to authenticated users — holds are managed
-- exclusively via service role in Server Actions and Stripe webhooks.

SET search_path TO '';

-- =============================================================================
-- 1. Inventory Holds table
-- =============================================================================

CREATE TABLE public.inventory_holds (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wine_id                     UUID NOT NULL REFERENCES public.wines(id),
  retailer_org_id             UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id                     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quantity                    INTEGER NOT NULL CHECK (quantity > 0),
  expires_at                  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  status                      TEXT NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'converted', 'expired', 'released')),
  stripe_checkout_session_id  TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No updated_at column or trigger: holds are state-transitioned, not updated.

-- =============================================================================
-- 2. Indexes
-- =============================================================================

-- Active holds per wine per retailer — used by get_available_stock()
CREATE INDEX idx_inventory_holds_wine_org
  ON public.inventory_holds (wine_id, retailer_org_id)
  WHERE status = 'active';

-- Active holds approaching expiration — used by expiration cron/job
CREATE INDEX idx_inventory_holds_expires
  ON public.inventory_holds (expires_at)
  WHERE status = 'active';

-- Stripe webhook correlation — find hold by checkout session
CREATE INDEX idx_inventory_holds_session
  ON public.inventory_holds (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

-- =============================================================================
-- 3. Row Level Security — deny all direct authenticated access
-- =============================================================================

ALTER TABLE public.inventory_holds ENABLE ROW LEVEL SECURITY;

-- Deny all SELECT access for authenticated users.
-- Service role bypasses RLS automatically, so server-side code using
-- supabaseAdmin can still read/write holds without issue.
CREATE POLICY "Deny direct select for authenticated users"
  ON public.inventory_holds FOR SELECT
  TO authenticated
  USING (false);

CREATE POLICY "Deny direct insert for authenticated users"
  ON public.inventory_holds FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Deny direct update for authenticated users"
  ON public.inventory_holds FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny direct delete for authenticated users"
  ON public.inventory_holds FOR DELETE
  TO authenticated
  USING (false);

-- =============================================================================
-- 4. get_available_stock — compute available quantity minus active holds
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_available_stock(
  p_wine_id         UUID,
  p_retailer_org_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_total_stock   INTEGER;
  v_held_quantity INTEGER;
BEGIN
  -- Get raw stock from retailer_inventory.
  -- retailer_inventory.org_id corresponds to the retailer's organization.
  SELECT COALESCE(ri.quantity, 0)
    INTO v_total_stock
    FROM public.retailer_inventory ri
   WHERE ri.wine_id = p_wine_id
     AND ri.org_id  = p_retailer_org_id
   LIMIT 1;

  -- If no inventory row exists, stock is zero.
  IF v_total_stock IS NULL THEN
    RETURN 0;
  END IF;

  -- Subtract active (non-expired) holds.
  SELECT COALESCE(SUM(ih.quantity), 0)
    INTO v_held_quantity
    FROM public.inventory_holds ih
   WHERE ih.wine_id        = p_wine_id
     AND ih.retailer_org_id = p_retailer_org_id
     AND ih.status          = 'active'
     AND ih.expires_at      > now();

  RETURN GREATEST(0, v_total_stock - v_held_quantity);
END;
$$;

-- Grant execute to authenticated users so client-side availability checks work.
GRANT EXECUTE ON FUNCTION public.get_available_stock(UUID, UUID) TO authenticated;
