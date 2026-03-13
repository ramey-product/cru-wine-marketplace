-- Migration: Retailer analytics materialized view
-- EPIC-09/STORY-01 — Aggregated order analytics per retailer per week
--
-- The orders table uses org_id to link to retailers (via retailers.org_id).
-- Monetary values in orders are INTEGER cents (e.g., total = 1299 means $12.99).
-- Commission is calculated at query time using the retailer's commission_rate.

SET search_path TO '';

-- =============================================================================
-- 1. Retailer Order Analytics materialized view
-- =============================================================================
-- Aggregates order data per retailer per week for the last 30 days.
-- Revenue/commission visibility controlled at the application layer
-- (owner-only access enforced by DAL/action, not RLS on the MV).

CREATE MATERIALIZED VIEW public.retailer_order_analytics AS
SELECT
  r.id AS retailer_id,
  r.org_id,
  DATE_TRUNC('week', o.created_at)::date AS week,
  COUNT(o.id)::integer AS total_orders,
  COALESCE(SUM(o.total), 0)::integer AS gross_revenue_cents,
  COALESCE(SUM(ROUND(o.total * r.commission_rate)), 0)::integer AS commission_cents,
  COALESCE(SUM(o.total - ROUND(o.total * r.commission_rate)), 0)::integer AS net_payout_cents,
  COUNT(DISTINCT o.user_id)::integer AS unique_customers,
  COALESCE(AVG(o.total), 0)::integer AS avg_order_value_cents
FROM public.retailers r
LEFT JOIN public.orders o
  ON o.org_id = r.org_id
  AND o.created_at >= now() - INTERVAL '30 days'
  AND o.status != 'cancelled'
GROUP BY r.id, r.org_id, DATE_TRUNC('week', o.created_at)::date;

-- Unique index for REFRESH CONCURRENTLY support
CREATE UNIQUE INDEX idx_retailer_order_analytics_pk
  ON public.retailer_order_analytics (retailer_id, week);

-- =============================================================================
-- 2. Top Wines view (per retailer, last 30 days)
-- =============================================================================

CREATE MATERIALIZED VIEW public.retailer_top_wines AS
SELECT
  r.id AS retailer_id,
  r.org_id,
  oi.wine_id,
  w.name AS wine_name,
  COUNT(DISTINCT o.id)::integer AS order_count,
  SUM(oi.quantity)::integer AS units_sold,
  SUM(oi.subtotal)::integer AS revenue_cents
FROM public.retailers r
JOIN public.orders o ON o.org_id = r.org_id
  AND o.created_at >= now() - INTERVAL '30 days'
  AND o.status != 'cancelled'
JOIN public.order_items oi ON oi.order_id = o.id
JOIN public.wines w ON w.id = oi.wine_id
GROUP BY r.id, r.org_id, oi.wine_id, w.name;

CREATE UNIQUE INDEX idx_retailer_top_wines_pk
  ON public.retailer_top_wines (retailer_id, wine_id);

-- =============================================================================
-- 3. Refresh function (callable by pg_cron or manually)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.refresh_retailer_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.retailer_order_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.retailer_top_wines;
  RETURN;
END;
$$;
