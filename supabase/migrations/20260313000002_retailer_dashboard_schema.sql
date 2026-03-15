-- Migration: Retailer Dashboard schema — retailer_members, notification preferences,
-- stock overrides, retailer fulfillment settings, and analytics materialized view.
-- EPIC-09/STORY-01 — Retailer Dashboard Database Schema & RLS Policies

SET search_path TO 'public', 'extensions';

-- =============================================================================
-- 1. Retailer Members table
-- =============================================================================
-- Links users to specific retailers with retailer-specific roles (owner/staff).
-- A user can be a member of only one retailer (within a given org).

CREATE TABLE public.retailer_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  retailer_id   UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (retailer_id, user_id)
);

-- Indexes
CREATE INDEX idx_retailer_members_org
  ON public.retailer_members (org_id);

CREATE INDEX idx_retailer_members_retailer
  ON public.retailer_members (retailer_id);

CREATE INDEX idx_retailer_members_user
  ON public.retailer_members (user_id);

-- Updated_at trigger
CREATE TRIGGER trg_retailer_members_updated
  BEFORE UPDATE ON public.retailer_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 2. Retailer Notification Preferences table
-- =============================================================================
-- Per-member notification settings for the retailer dashboard context.

CREATE TABLE public.retailer_notification_preferences (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  retailer_member_id  UUID NOT NULL UNIQUE REFERENCES public.retailer_members(id) ON DELETE CASCADE,
  new_order_email     BOOLEAN NOT NULL DEFAULT true,
  daily_summary_email BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_retailer_notification_prefs_org
  ON public.retailer_notification_preferences (org_id);

-- Updated_at trigger
CREATE TRIGGER trg_retailer_notification_preferences_updated
  BEFORE UPDATE ON public.retailer_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. Retailer Stock Overrides table
-- =============================================================================
-- Manual stock status overrides that take precedence over automated POS sync.
-- Only one active override (cleared_at IS NULL) per wine per retailer.

CREATE TABLE public.retailer_stock_overrides (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  retailer_id      UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  wine_id          UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  override_status  TEXT NOT NULL CHECK (override_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  overridden_by    UUID NOT NULL REFERENCES auth.users(id),
  cleared_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partial unique index: only one active override per wine per retailer
CREATE UNIQUE INDEX idx_retailer_stock_overrides_active
  ON public.retailer_stock_overrides (retailer_id, wine_id)
  WHERE cleared_at IS NULL;

-- Indexes
CREATE INDEX idx_retailer_stock_overrides_org
  ON public.retailer_stock_overrides (org_id);

CREATE INDEX idx_retailer_stock_overrides_retailer
  ON public.retailer_stock_overrides (retailer_id);

-- Updated_at trigger
CREATE TRIGGER trg_retailer_stock_overrides_updated
  BEFORE UPDATE ON public.retailer_stock_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 4. ALTER retailers — add fulfillment settings columns
-- =============================================================================

ALTER TABLE public.retailers
  ADD COLUMN IF NOT EXISTS pickup_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivery_fee_cents INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_delivery_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS hours_of_operation JSONB;

-- =============================================================================
-- 5. Row Level Security
-- =============================================================================

ALTER TABLE public.retailer_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_stock_overrides ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 5a. Retailer Members RLS
-- -----------------------------------------------------------------------------

-- Members can see other members of their retailer
CREATE POLICY "Retailer members can view their retailer team"
  ON public.retailer_members FOR SELECT
  TO authenticated
  USING (
    retailer_id IN (
      SELECT rm.retailer_id FROM public.retailer_members rm
      WHERE rm.user_id = auth.uid()
    )
  );

-- Only retailer owners (or org admins) can add members
CREATE POLICY "Retailer owners can add members"
  ON public.retailer_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.retailer_members rm
      WHERE rm.retailer_id = retailer_members.retailer_id
        AND rm.user_id = auth.uid()
        AND rm.role = 'owner'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = retailer_members.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  );

-- Only retailer owners can update members (role changes)
CREATE POLICY "Retailer owners can update members"
  ON public.retailer_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.retailer_members rm
      WHERE rm.retailer_id = retailer_members.retailer_id
        AND rm.user_id = auth.uid()
        AND rm.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.retailer_members rm
      WHERE rm.retailer_id = retailer_members.retailer_id
        AND rm.user_id = auth.uid()
        AND rm.role = 'owner'
    )
  );

-- Only retailer owners can remove members
CREATE POLICY "Retailer owners can remove members"
  ON public.retailer_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.retailer_members rm
      WHERE rm.retailer_id = retailer_members.retailer_id
        AND rm.user_id = auth.uid()
        AND rm.role = 'owner'
    )
  );

-- -----------------------------------------------------------------------------
-- 5b. Retailer Notification Preferences RLS
-- -----------------------------------------------------------------------------

-- Members can view their own notification preferences
CREATE POLICY "Members can view their own notification preferences"
  ON public.retailer_notification_preferences FOR SELECT
  TO authenticated
  USING (
    retailer_member_id IN (
      SELECT id FROM public.retailer_members
      WHERE user_id = auth.uid()
    )
  );

-- Members can insert their own notification preferences
CREATE POLICY "Members can create their own notification preferences"
  ON public.retailer_notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (
    retailer_member_id IN (
      SELECT id FROM public.retailer_members
      WHERE user_id = auth.uid()
    )
  );

-- Members can update their own notification preferences
CREATE POLICY "Members can update their own notification preferences"
  ON public.retailer_notification_preferences FOR UPDATE
  TO authenticated
  USING (
    retailer_member_id IN (
      SELECT id FROM public.retailer_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    retailer_member_id IN (
      SELECT id FROM public.retailer_members
      WHERE user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 5c. Retailer Stock Overrides RLS
-- -----------------------------------------------------------------------------

-- Retailer members can view overrides for their retailer
CREATE POLICY "Retailer members can view their stock overrides"
  ON public.retailer_stock_overrides FOR SELECT
  TO authenticated
  USING (
    retailer_id IN (
      SELECT rm.retailer_id FROM public.retailer_members rm
      WHERE rm.user_id = auth.uid()
    )
  );

-- Retailer members can create overrides for their retailer
CREATE POLICY "Retailer members can create stock overrides"
  ON public.retailer_stock_overrides FOR INSERT
  TO authenticated
  WITH CHECK (
    retailer_id IN (
      SELECT rm.retailer_id FROM public.retailer_members rm
      WHERE rm.user_id = auth.uid()
    )
    AND overridden_by = auth.uid()
  );

-- Retailer members can update overrides (e.g., clear them)
CREATE POLICY "Retailer members can update stock overrides"
  ON public.retailer_stock_overrides FOR UPDATE
  TO authenticated
  USING (
    retailer_id IN (
      SELECT rm.retailer_id FROM public.retailer_members rm
      WHERE rm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    retailer_id IN (
      SELECT rm.retailer_id FROM public.retailer_members rm
      WHERE rm.user_id = auth.uid()
    )
  );
