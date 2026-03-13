-- Migration: Create curated_collections, curated_collection_items, and user_wine_dismissals tables
-- EPIC-07/STORY-01 — AI + Human Curation Engine schema
--
-- curated_collections and curated_collection_items are org-scoped (content managed by admins).
-- user_wine_dismissals is user-scoped with NO org_id (CG-2 exception):
--   dismiss records are personal user preferences, not org-tied content.

SET search_path TO '';

-- =============================================================================
-- 1. Curated Collections table
-- =============================================================================

CREATE TABLE public.curated_collections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  cover_image_url TEXT,
  curator_id      UUID NOT NULL REFERENCES auth.users(id),
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  start_date      DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_curated_collections_org
  ON public.curated_collections (org_id);

CREATE INDEX idx_curated_collections_active_order
  ON public.curated_collections (is_active, display_order);

CREATE INDEX idx_curated_collections_slug
  ON public.curated_collections (slug);

-- Updated_at trigger
CREATE TRIGGER trg_curated_collections_updated
  BEFORE UPDATE ON public.curated_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 2. Curated Collection Items table
-- =============================================================================

CREATE TABLE public.curated_collection_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  collection_id   UUID NOT NULL REFERENCES public.curated_collections(id) ON DELETE CASCADE,
  wine_id         UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  position        INTEGER NOT NULL DEFAULT 0,
  curator_note    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (collection_id, wine_id)
);

-- Indexes
CREATE INDEX idx_curated_collection_items_org
  ON public.curated_collection_items (org_id);

CREATE INDEX idx_curated_collection_items_collection
  ON public.curated_collection_items (collection_id);

CREATE INDEX idx_curated_collection_items_collection_position
  ON public.curated_collection_items (collection_id, position);

-- Updated_at trigger
CREATE TRIGGER trg_curated_collection_items_updated
  BEFORE UPDATE ON public.curated_collection_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. User Wine Dismissals table
-- =============================================================================
-- NOTE: This table intentionally has NO org_id column per CG-2 resolution.
-- Dismiss records are personal user preferences, not org-tied content.

CREATE TABLE public.user_wine_dismissals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_id     UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, wine_id)
);

-- Indexes
CREATE INDEX idx_user_wine_dismissals_user
  ON public.user_wine_dismissals (user_id);

-- No updated_at column or trigger: dismissals are created or deleted, never updated.

-- =============================================================================
-- 4. Row Level Security
-- =============================================================================

ALTER TABLE public.curated_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wine_dismissals ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4a. Curated Collections RLS — public read, admin write
-- -----------------------------------------------------------------------------

-- All authenticated users can view collections (application-level filtering via is_active)
CREATE POLICY "Authenticated users can view curated collections"
  ON public.curated_collections FOR SELECT
  TO authenticated
  USING (true);

-- Only org admins/owners can create collections
CREATE POLICY "Org admins can create curated collections"
  ON public.curated_collections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = curated_collections.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

-- Only org admins/owners can update collections
CREATE POLICY "Org admins can update curated collections"
  ON public.curated_collections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = curated_collections.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = curated_collections.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

-- Only org admins/owners can delete collections
CREATE POLICY "Org admins can delete curated collections"
  ON public.curated_collections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = curated_collections.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

-- -----------------------------------------------------------------------------
-- 4b. Curated Collection Items RLS — public read, admin write via parent collection
-- -----------------------------------------------------------------------------

-- All authenticated users can view collection items
CREATE POLICY "Authenticated users can view curated collection items"
  ON public.curated_collection_items FOR SELECT
  TO authenticated
  USING (true);

-- Only org admins/owners can add items (verified via parent collection's org)
CREATE POLICY "Org admins can create curated collection items"
  ON public.curated_collection_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.curated_collections cc
      JOIN public.memberships m ON m.org_id = cc.org_id
      WHERE cc.id = curated_collection_items.collection_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  );

-- Only org admins/owners can update items
CREATE POLICY "Org admins can update curated collection items"
  ON public.curated_collection_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curated_collections cc
      JOIN public.memberships m ON m.org_id = cc.org_id
      WHERE cc.id = curated_collection_items.collection_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.curated_collections cc
      JOIN public.memberships m ON m.org_id = cc.org_id
      WHERE cc.id = curated_collection_items.collection_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  );

-- Only org admins/owners can delete items
CREATE POLICY "Org admins can delete curated collection items"
  ON public.curated_collection_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curated_collections cc
      JOIN public.memberships m ON m.org_id = cc.org_id
      WHERE cc.id = curated_collection_items.collection_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  );

-- -----------------------------------------------------------------------------
-- 4c. User Wine Dismissals RLS — user-scoped (own dismissals only)
-- -----------------------------------------------------------------------------

-- Users can view their own dismissals
CREATE POLICY "Users can view their own wine dismissals"
  ON public.user_wine_dismissals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own dismissals
CREATE POLICY "Users can create their own wine dismissals"
  ON public.user_wine_dismissals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own dismissals (un-dismiss)
CREATE POLICY "Users can delete their own wine dismissals"
  ON public.user_wine_dismissals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- No UPDATE policy: dismissals are created or deleted, never updated.
