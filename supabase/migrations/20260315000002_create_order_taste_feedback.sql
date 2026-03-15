-- Migration: Create order taste feedback table
-- Epic: EPIC-11 (Order Tracking)
-- Story: STORY-06 (Post-Purchase Taste Feedback)
--
-- Users can rate wines they've purchased with thumbs up/down + optional notes.
-- Feedback is immutable (no UPDATE/DELETE) to preserve data integrity.
-- Integration with taste_signals (EPIC-03) is deferred.

SET search_path TO 'public', 'extensions';

-- =============================================================================
-- 1. Sentiment enum
-- =============================================================================

CREATE TYPE public.taste_sentiment AS ENUM ('positive', 'negative');

-- =============================================================================
-- 2. Order taste feedback table
-- =============================================================================

CREATE TABLE public.order_taste_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  wine_id       UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id        UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sentiment     public.taste_sentiment NOT NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One feedback per user per wine per order
CREATE UNIQUE INDEX idx_taste_feedback_unique
  ON public.order_taste_feedback (order_id, order_item_id, user_id);

CREATE INDEX idx_taste_feedback_user_wine
  ON public.order_taste_feedback (user_id, wine_id);

CREATE INDEX idx_taste_feedback_order
  ON public.order_taste_feedback (order_id);

CREATE INDEX idx_taste_feedback_org
  ON public.order_taste_feedback (org_id);

-- =============================================================================
-- 3. RLS — users can only read and create their own feedback (immutable)
-- =============================================================================

ALTER TABLE public.order_taste_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.order_taste_feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own feedback"
  ON public.order_taste_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No UPDATE or DELETE policies — feedback is immutable
