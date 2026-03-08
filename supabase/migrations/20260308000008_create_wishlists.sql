-- Migration: Create wishlists and wishlist_items tables
-- EPIC-01/STORY-02
--
-- User-scoped tables (NO org_id). Each user owns their wishlists.
-- RLS enforces user_id = auth.uid() ownership on wishlists,
-- and wishlist_items access is gated through wishlist ownership.

SET search_path TO '';

-- =============================================================================
-- 1. Wishlists table
-- =============================================================================

CREATE TABLE public.wishlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'My Wishlist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wishlists_user ON public.wishlists (user_id);

CREATE TRIGGER trg_wishlists_updated
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 2. Wishlist Items table
-- =============================================================================

CREATE TABLE public.wishlist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  wine_id     UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  notes       TEXT,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (wishlist_id, wine_id)
);

CREATE INDEX idx_wishlist_items_wishlist ON public.wishlist_items (wishlist_id);
CREATE INDEX idx_wishlist_items_wine ON public.wishlist_items (wine_id);

-- =============================================================================
-- 3. Row Level Security — User-scoped pattern
--    Only the wishlist owner can read/write their wishlists and items.
-- =============================================================================

-- --- Wishlists ---
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlists"
  ON public.wishlists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own wishlists"
  ON public.wishlists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own wishlists"
  ON public.wishlists FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own wishlists"
  ON public.wishlists FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- --- Wishlist Items ---
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist items"
  ON public.wishlist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
        AND wishlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to their own wishlists"
  ON public.wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
        AND wishlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own wishlist items"
  ON public.wishlist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
        AND wishlists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
        AND wishlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove items from their own wishlists"
  ON public.wishlist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
        AND wishlists.user_id = auth.uid()
    )
  );
