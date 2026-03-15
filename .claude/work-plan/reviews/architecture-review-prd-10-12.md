# Architecture Review: PRD-10, PRD-11, PRD-12

**Reviewer:** System Architect
**Date:** 2026-03-14
**Status:** APPROVED (PRD-11 and PRD-12 with conditions)

---

## PRD-10: Commerce Flow & Cart UX — APPROVED

- Cart state: React Context + `useOptimistic` is the right call. Zustand adds unnecessary dependency for this use case.
- Local storage persistence for cart bar: approved. Use a versioned schema key (`cru-cart-v1`) for safe migrations.
- Single-retailer cart enforcement is correct for V1.
- Z-index layering (tab bar z-40 < cart bar z-45 < sheets z-50) is sound.
- "Best Value" composite score calculated client-side is fine for V1; consider server-side for scale.

## PRD-11: Order Tracking — APPROVED WITH CONDITIONS

### Condition 1: Use existing `order_status_history` table
PRD-05 already defines an `order_status_events` / `order_status_history` table. PRD-11 should extend it, not create a duplicate. Add `metadata JSONB` column if missing. Ensure RLS policies scope to `org_id`.

### Condition 2: `taste_signals` table design
Create a unified `taste_signals` table that serves both taste profile onboarding (PRD-03) and post-purchase feedback (PRD-11). Schema:
- `id UUID`, `user_id UUID`, `org_id UUID`, `signal_type TEXT` (enum: 'onboarding_preference', 'purchase_feedback', 'wishlist_add', 'browse_dwell')
- `wine_id UUID` (nullable), `producer_id UUID` (nullable), `varietal TEXT` (nullable), `region TEXT` (nullable)
- `sentiment TEXT` (enum: 'positive', 'negative', 'neutral'), `confidence NUMERIC`, `note TEXT`
- `created_at TIMESTAMPTZ`
- RLS on `org_id`, indexes on `(user_id, signal_type)` and `(wine_id)`

### Condition 3: Proactive notification cron
Vercel cron is fine for V1. At scale, move to Supabase Edge Functions or a dedicated worker. The 5-minute interval is acceptable.

### Condition 4: Supabase Realtime capacity
Validate concurrent subscription limits on current Supabase plan before launch. Each order tracking page = 1 subscription. Plan for 100+ concurrent at launch.

## PRD-12: Discovery & Proximity — APPROVED WITH CONDITIONS

### Condition 1: Build infrastructure first
PRD-12's geolocation and PostGIS infrastructure is foundational for PRD-10 (retailer availability on cards) and PRD-11 (retailer map on tracking). Build order should be: PRD-12 infrastructure → PRD-10 + PRD-11 in parallel.

### Condition 2: PostGIS setup
- Enable PostGIS extension in a migration: `CREATE EXTENSION IF NOT EXISTS postgis;`
- Add `location GEOGRAPHY(POINT, 4326)` to retailers table
- Create GIST spatial index
- `find_nearby_retailers()` PostgreSQL function with distance calculation

### Condition 3: Location persistence
- Cookie: lat/lng only (for SSR), max 30 days, `SameSite=Lax`
- localStorage: full location object with display name and accuracy level
- Never persist precise coordinates in the database without user consent

### Condition 4: Mapbox API keys
- `NEXT_PUBLIC_MAPBOX_TOKEN` for client-side geocoding and maps (P1)
- `MAPBOX_SECRET_TOKEN` for server-side static images and geocoding
- Both in environment variables, never hardcoded

## Build Sequence Recommendation

1. **Phase 1 (Week 1-3):** PRD-12 infrastructure — PostGIS, geolocation, location persistence, DAL functions
2. **Phase 2 (Week 2-5):** PRD-10 Commerce Hub + Cart UX (parallel with Phase 1 completion)
3. **Phase 3 (Week 3-6):** PRD-11 Order Tracking (parallel with PRD-10)
4. **Phase 4 (Week 4-7):** PRD-12 UI — Producer browse, discovery loops, browse mobile UX
5. **Phase 5 (Week 6-8):** P1 features across all three PRDs
