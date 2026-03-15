-- Migration: Add proactive notification tracking to orders
-- Epic: EPIC-11 (Order Tracking)
-- Story: STORY-03 (Proactive Order Status Communication)
--
-- Tracks whether a delay notification has been sent for pending orders
-- that exceed the 15-minute threshold. Used by the check-pending-orders
-- cron job to ensure notifications are sent exactly once.

SET search_path TO 'public', 'extensions';

ALTER TABLE public.orders
  ADD COLUMN proactive_notification_sent BOOLEAN NOT NULL DEFAULT false;

-- Index for the cron query: pending orders that haven't been notified
CREATE INDEX idx_orders_pending_not_notified
  ON public.orders (created_at)
  WHERE status = 'pending' AND proactive_notification_sent = false;
