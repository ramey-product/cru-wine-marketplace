-- Migration: Create wine_match_queue table
-- Epic: EPIC-06 (Local Retailer Integration)
-- Story: STORY-01 (Retailers and Inventory Schema with PostGIS)
--
-- Processing queue for matching raw retailer wine data to the canonical wines table.
-- Made org-scoped via org_id (derived from the retailer's org) for RLS consistency.
-- Only org members can view and manage their match queue entries.

SET search_path TO '';

-- =============================================================================
-- 1. Wine Match Queue table
-- =============================================================================

CREATE TABLE public.wine_match_queue (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  retailer_id       UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  raw_wine_name     TEXT NOT NULL,
  raw_producer      TEXT,
  raw_vintage       TEXT,
  raw_varietal      TEXT,
  raw_sku           TEXT,
  raw_price         INTEGER,
  raw_quantity      INTEGER,
  matched_wine_id   UUID REFERENCES public.wines(id),
  match_confidence  NUMERIC(5,4),
  match_status      TEXT NOT NULL DEFAULT 'pending',
  reviewed_by       UUID REFERENCES auth.users(id),
  reviewed_at       TIMESTAMPTZ,
  sync_log_id       UUID REFERENCES public.retailer_sync_logs(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraints
ALTER TABLE public.wine_match_queue
  ADD CONSTRAINT chk_wine_match_queue_status
  CHECK (match_status IN ('pending', 'auto_matched', 'manual_matched', 'rejected', 'new_wine_created'));

ALTER TABLE public.wine_match_queue
  ADD CONSTRAINT chk_wine_match_queue_confidence
  CHECK (match_confidence IS NULL OR (match_confidence >= 0 AND match_confidence <= 1));

ALTER TABLE public.wine_match_queue
  ADD CONSTRAINT chk_wine_match_queue_raw_price
  CHECK (raw_price IS NULL OR raw_price >= 0);

ALTER TABLE public.wine_match_queue
  ADD CONSTRAINT chk_wine_match_queue_raw_quantity
  CHECK (raw_quantity IS NULL OR raw_quantity >= 0);

-- =============================================================================
-- 2. Indexes
-- =============================================================================

CREATE INDEX idx_wine_match_queue_org ON public.wine_match_queue (org_id);
CREATE INDEX idx_wine_match_queue_retailer ON public.wine_match_queue (retailer_id);
CREATE INDEX idx_wine_match_queue_status ON public.wine_match_queue (match_status);
CREATE INDEX idx_wine_match_queue_org_status ON public.wine_match_queue (org_id, match_status);
CREATE INDEX idx_wine_match_queue_sync_log ON public.wine_match_queue (sync_log_id);

-- =============================================================================
-- 3. Updated_at trigger
-- =============================================================================

CREATE TRIGGER trg_wine_match_queue_updated
  BEFORE UPDATE ON public.wine_match_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 4. Row Level Security
-- =============================================================================

ALTER TABLE public.wine_match_queue ENABLE ROW LEVEL SECURITY;

-- SELECT: Only org members can view their match queue
CREATE POLICY "Org members can view match queue"
  ON public.wine_match_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_match_queue.org_id
    )
  );

-- INSERT: Only org members can add to their match queue
CREATE POLICY "Org members can insert match queue entries"
  ON public.wine_match_queue FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_match_queue.org_id
    )
  );

-- UPDATE: Only org members can update their match queue (review matches)
CREATE POLICY "Org members can update match queue entries"
  ON public.wine_match_queue FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_match_queue.org_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = wine_match_queue.org_id
    )
  );
