# Engineering Review: PRD-10, PRD-11, PRD-12

**Reviewer:** Lead Full Stack Developer
**Date:** 2026-03-14
**Status:** ALL GREEN — Feasible with noted complexity

---

## PRD-10: Commerce Flow & Cart UX

**Complexity:** Large (L)
**Estimate:** 5 person-weeks
**Verdict:** GREEN

### Breakdown
- Commerce Hub redesign: 1 week (bottom sheet, cart preview, active orders, quick paths)
- Sticky Cart Bar: 0.5 weeks (fixed position, z-index, local storage sync)
- Availability on Wine Cards: 1 week (WineCard prop extension, mock data integration, RetailerSelectionSheet direct open)
- Buy Button on Wine Cards: 0.5 weeks (conditional rendering, context-aware visibility)
- Cart UX (quantity stepper, animations): 0.5 weeks
- Order Confirmation celebration: 0.5 weeks (Framer Motion)
- Retailer Selection enhancements (sort, badges, hours): 1 week

### Technical Notes
- CartContext should wrap at the `(app)/layout.tsx` level
- `useOptimistic` for instant add/remove, reconcile with Server Action response
- Local storage sync: use `useSyncExternalStore` for SSR safety
- RetailerSelectionSheet: the "best value" sort needs a clear algorithm spec. Proposed: `score = (normalizedPrice * 0.6) + (normalizedDistance * 0.4)`, lower is better
- All animations: CSS-first where possible, Framer Motion only for complex orchestrated sequences (celebration)

### Risks
- WineCard is already a complex component; adding `showAvailability`, `onBuy`, and buy button increases surface area. Consider compound component pattern.
- Cart conflict dialog (switching retailers) needs careful state management

## PRD-11: Order Tracking & Post-Purchase

**Complexity:** Large (L)
**Estimate:** 4 person-weeks
**Verdict:** GREEN

### Breakdown
- Order tracking screen + progress stepper: 1.5 weeks
- Supabase Realtime subscription + polling fallback: 0.5 weeks
- Proactive notification cron: 0.5 weeks
- Email notifications (Resend integration): 0.5 weeks
- Active orders list + badge: 0.5 weeks
- Taste feedback UI + data model: 0.5 weeks (P1)
- Reorder flow: 0.5 weeks (P1)

### Technical Notes
- `useOrderStatus` hook: subscribe to Realtime channel, detect failure, fallback to polling
- Progress stepper: pure CSS with `data-status` attributes for color mapping
- Mapbox Static Images API: server-rendered `<img>` tag, no client-side GL library needed for tracking page
- Cron job: `app/api/cron/check-pending-orders/route.ts` with Vercel cron config in `vercel.json`
- Email: use Resend with React Email templates

### Risks
- Supabase Realtime channel failure detection needs robust implementation (heartbeat + reconnect)
- Push notification browser support varies; need graceful degradation

## PRD-12: Discovery & Proximity

**Complexity:** Extra Large (XL)
**Estimate:** 12 person-weeks (3 person-months)
**Verdict:** GREEN (largest effort, most foundational)

### Breakdown
- Geolocation infrastructure (3-tier fallback, persistence): 2 weeks
- PostGIS setup + spatial queries + DAL: 2 weeks
- Producer browse page + search + filter: 2 weeks
- Discovery loop links (wine detail, producer page): 1 week
- Browse mobile UX (filter sheet, sort, load more, sticky bar): 2 weeks
- "Available Near You" intelligence: 1.5 weeks
- Map integration (P1): 1.5 weeks

### Technical Notes
- PostGIS: `ST_DWithin` for radius queries, `ST_Distance` for sorting. Both work with `GEOGRAPHY` type (meters, converted to miles in SQL)
- Location store: custom hook `useLocation()` that reads from cookie (SSR) → localStorage (client) → triggers detection
- Producer search: start with client-side filter on mock data, migrate to `pg_trgm` full-text search
- Browse mobile filter sheet: reuse Shadcn Sheet component with `side="bottom"`, spring animation per UX research
- Load More: cursor-based pagination with `created_at` cursor, 12 items per page

### Risks
- PostGIS queries can be slow without proper indexes. GIST index on geography column is mandatory.
- IP geolocation accuracy varies wildly. MaxMind GeoLite2 city-level accuracy is ~70% at best.
- Mapbox API costs: geocoding is $0.75/1000 requests, map loads are usage-based. Budget monitoring needed.

## Recommended Build Sequence

1. **PRD-12 Infrastructure** (PostGIS, geolocation, location store) — foundation for everything
2. **PRD-10 + PRD-11** in parallel — both depend on PRD-12 infrastructure for location awareness
3. **PRD-12 UI** (producer browse, discovery loops, mobile UX) — builds on infrastructure
4. **P1 features** across all three — push notifications, taste feedback, map, producer stories
