-- Migration: Extend retailer_sync_logs CHECK constraints
-- Epic: EPIC-06 (Local Retailer Integration)
-- Story: STORY-08 (Inventory Sync Scheduling & Error Handling)
--
-- Adds 'webhook_event' and 'staleness_check' to sync_type constraint,
-- and 'pending' to the status constraint. These are required by:
--   - Webhook handlers (sync_type='webhook_event', status='pending')
--   - Staleness check cron (sync_type='staleness_check')

SET search_path TO '';

-- =============================================================================
-- 1. Drop and recreate sync_type constraint with additional values
-- =============================================================================

ALTER TABLE public.retailer_sync_logs
  DROP CONSTRAINT chk_sync_logs_sync_type;

ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_sync_type
  CHECK (sync_type IN (
    'csv_import', 'pos_full', 'pos_incremental', 'manual',
    'webhook_event', 'staleness_check'
  ));

-- =============================================================================
-- 2. Drop and recreate status constraint with 'pending'
-- =============================================================================

ALTER TABLE public.retailer_sync_logs
  DROP CONSTRAINT chk_sync_logs_status;

ALTER TABLE public.retailer_sync_logs
  ADD CONSTRAINT chk_sync_logs_status
  CHECK (status IN ('started', 'completed', 'failed', 'partial', 'pending'));

-- =============================================================================
-- 3. Add composite index for staleness queries
--    (retailer_id + status + completed_at) to efficiently find
--    the last successful sync per retailer.
-- =============================================================================

CREATE INDEX idx_retailer_sync_logs_retailer_status_completed
  ON public.retailer_sync_logs (retailer_id, status, completed_at DESC);
