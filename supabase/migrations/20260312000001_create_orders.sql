-- Migration: Create orders, order_items, and order_status_history tables
-- Implements the order placement schema from PRD-05 / EPIC-05.
-- Uses a dual-access RLS pattern: consumers see their own orders,
-- retailer org members see orders placed against their organization.
-- Monetary values are stored as INTEGER cents (e.g. 1299 = $12.99).

SET search_path TO 'public', 'extensions';

-- =============================================================================
-- 1. Orders table
-- =============================================================================

CREATE TABLE public.orders (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id                     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status                      TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN (
                                'pending', 'confirmed', 'ready_for_pickup',
                                'out_for_delivery', 'completed', 'cancelled'
                              )),
  fulfillment_type            TEXT NOT NULL
                              CHECK (fulfillment_type IN ('pickup', 'delivery')),
  delivery_address            JSONB,
  delivery_fee                INTEGER NOT NULL DEFAULT 0,
  subtotal                    INTEGER NOT NULL,
  tax                         INTEGER NOT NULL DEFAULT 0,
  total                       INTEGER NOT NULL,
  stripe_checkout_session_id  TEXT,
  stripe_payment_intent_id    TEXT UNIQUE,
  medusa_cart_id              TEXT,
  medusa_order_id             TEXT,
  estimated_ready_at          TIMESTAMPTZ,
  notes                       TEXT,
  age_verified                BOOLEAN NOT NULL DEFAULT false,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_orders_org_id ON public.orders (org_id);
CREATE INDEX idx_orders_user_id ON public.orders (user_id);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_stripe_pi ON public.orders (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Updated_at trigger
CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 2. Order Items table
-- =============================================================================

CREATE TABLE public.order_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  wine_id               UUID NOT NULL REFERENCES public.wines(id),
  quantity              INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price            INTEGER NOT NULL,
  subtotal              INTEGER NOT NULL,
  medusa_line_item_id   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);

-- Updated_at trigger
CREATE TRIGGER trg_order_items_updated
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. Order Status History table (append-only audit log)
-- =============================================================================

CREATE TABLE public.order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  changed_by  UUID REFERENCES public.profiles(id),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history (order_id);

-- No updated_at trigger: this table is append-only (no UPDATE/DELETE policies).

-- =============================================================================
-- 4. Row Level Security
-- =============================================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4a. Orders RLS — dual-access pattern
-- -----------------------------------------------------------------------------

-- Consumers can view their own orders
CREATE POLICY "Consumers can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Retailer org members can view orders for their org
CREATE POLICY "Org members can view org orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
    )
  );

-- Only the consumer who owns the order can insert it
CREATE POLICY "Consumers can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only retailer org members can update orders (status transitions, etc.)
CREATE POLICY "Org members can update org orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
    )
  );

-- No DELETE policy: orders should never be deleted, only cancelled.

-- -----------------------------------------------------------------------------
-- 4b. Order Items RLS — access derived from parent order
-- -----------------------------------------------------------------------------

-- Consumers and org members can view order items for orders they can see
CREATE POLICY "Users can view order items for accessible orders"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE user_id = auth.uid()
    )
    OR
    order_id IN (
      SELECT id FROM public.orders
      WHERE org_id IN (
        SELECT org_id FROM public.memberships
        WHERE user_id = auth.uid()
      )
    )
  );

-- Only the consumer who created the order can insert items
CREATE POLICY "Consumers can insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders
      WHERE user_id = auth.uid()
    )
  );

-- No UPDATE or DELETE policies: order items are immutable after creation.
-- Adjustments are handled via order cancellation + new order.

-- -----------------------------------------------------------------------------
-- 4c. Order Status History RLS — access derived from parent order
-- -----------------------------------------------------------------------------

-- Consumers and org members can view status history for accessible orders
CREATE POLICY "Users can view status history for accessible orders"
  ON public.order_status_history FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE user_id = auth.uid()
    )
    OR
    order_id IN (
      SELECT id FROM public.orders
      WHERE org_id IN (
        SELECT org_id FROM public.memberships
        WHERE user_id = auth.uid()
      )
    )
  );

-- Both consumers and org members can append status history entries
CREATE POLICY "Users can insert status history for accessible orders"
  ON public.order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders
      WHERE user_id = auth.uid()
    )
    OR
    order_id IN (
      SELECT id FROM public.orders
      WHERE org_id IN (
        SELECT org_id FROM public.memberships
        WHERE user_id = auth.uid()
      )
    )
  );

-- No UPDATE or DELETE policies: status history is an immutable audit trail.
