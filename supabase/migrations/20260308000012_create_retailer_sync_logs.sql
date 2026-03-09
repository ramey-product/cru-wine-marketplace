-- Migration: Create retailer_sync_logs table
-- Epic: EPIC-06 (Local Retailer Integration)
-- Story: STORY-01 (Retailers and Inventory Schema with PostGIS)
--
-- Tracks POS/CSV sync operations for audit and debugging.
-- Only org members can see their own sync history.
-- No updated_at column — sync logs are append-only with a completed_at timestamp.

SET search_path TO '';

-- =============================================================================
-- 1. Retailer Sync Logs table
-- =============================================================================

CREATE TABLE public.retailer_sync_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  retailer_id         UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  sync_type           TEXT NOT NULL,
  sync_source         TEXT NOT NULL,
  status              TEXT NOT NULL,
  records_processed   INTEGER NOT NULL DEFAULT 0,
  records_created     INTEGER NOT NULL DEFAULT 0,
  records_updated     INTEGER NOT NULL DEFAULT 0,
  records_failed      INTEGER NOT NULL DEFAULT 0,
  error_details       JSONB,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ,
  duration_ms         INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraints
ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_sync_type
  CHECK (sync_type IN ('csv_import', 'pos_full', 'pos_incremental', 'manual'));

ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_sync_source
  CHECK (sync_source IN ('square', 'lightspeed', 'shopify', 'clover', 'csv'));

ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_status
  CHECK (status IN ('started', 'completed', 'failed', 'partial'));

ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_records_processed
  CHECK (records_processed >= 0);

ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_records_created
  CHECK (records_created >= 0);

ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_records_updated
  CHECK (records_updated >= 0);

ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_records_failed
  CHECK (records_failed >= 0);

ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_duration_ms
  CHECK (duration_ms IS NULL OR duration_ms >= 0);

-- =============================================================================
-- 2. Indexes
-- =============================================================================

CREATE INDEX idx_retailer_sync_logs_org ON public.retailer_sync_logs (org_id);
CREATE INDEX idx_retailer_sync_logs_retailer_created ON public.retailer_sync_logs (retailer_id, created_at DESC);
CREATE INDEX idx_retailer_sync_logs_status ON public.retailer_sync_logs (status);

-- =============================================================================
-- 3. Row Level Security
--    No updated_at trigger — sync logs are immutable records.
--    Only org members can view and create sync logs.
-- =============================================================================

ALTER TABLE public.retailer_sync_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: Only org members can view their sync logs
CREATE POLICY "Org members can view sync logs"
  ON public.retailer_sync_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailer_sync_logs.org_id
    )
  );

-- INSERT: Only org members can create sync logs
CREATE POLICY "Org members can insert sync logs"
  ON public.retailer_sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailer_sync_logs.org_id
    )
  );

-- UPDATE: Only org members can update sync logs (to set completed_at, status, etc.)
CREATE POLICY "Org members can update sync logs"
  ON public.retailer_sync_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailer_sync_logs.org_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = retailer_sync_logs.org_id
    )
  );
