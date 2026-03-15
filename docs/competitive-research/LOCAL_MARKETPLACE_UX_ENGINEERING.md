# Competitive Research: Local Online Marketplace UX — Frontend Engineering Lens

> **Platforms Studied:** Uber Eats, Grubhub
> **Purpose:** Extract technical patterns applicable to Cru Wine Marketplace (Next.js 15 + Supabase + Vercel)
> **Author:** Lead Frontend Engineer (fullstack-1)
> **Date:** 2026-03-14

---

## Executive Summary

Uber Eats and Grubhub have solved the hardest UX problems in local marketplace delivery: real-time order tracking, geolocation-based discovery, proximity sorting, and optimistic cart updates. This document translates their patterns into concrete implementation recommendations for our Next.js 15 + Supabase stack, prioritizing what is buildable on Vercel without native mobile dependencies.

Key findings:

1. **Real-time order tracking** maps cleanly to Supabase Realtime `postgres_changes` subscriptions — no need for a separate WebSocket server.
2. **Geolocation** requires a three-tier fallback strategy (Browser API, IP-based, manual entry) and PostGIS for server-side distance queries.
3. **Mapbox GL JS** is the recommended mapping library — better pricing than Google Maps, first-class React support, and a generous free tier.
4. **Optimistic UI** via React 19's `useOptimistic` + Server Actions covers cart and order mutations without client-side state libraries.
5. **Virtual scrolling** is unnecessary for wine catalogs at our scale; intersection-observer-based pagination is the right pattern.
6. **Web Push notifications** via the Push API + service workers give us near-native order tracking alerts.

---

## 1. Real-Time Order Tracking Architecture

### How Uber Eats / Grubhub Do It

Both platforms use a hybrid approach:

- **WebSocket connections** for live driver/courier tracking (sub-second GPS updates)
- **Server-Sent Events (SSE)** or long-polling as fallback for order status transitions (confirmed, preparing, out for delivery, delivered)
- **Polling** as a final fallback for degraded connectivity (30-second intervals)

Uber Eats specifically uses a proprietary real-time infrastructure called "Ringpop" (consistent hashing ring for WebSocket routing). Grubhub uses a more conventional WebSocket gateway with Redis pub/sub for fan-out.

Both render order status as a **finite state machine** on the frontend:

```
placed -> confirmed -> preparing -> ready_for_pickup -> out_for_delivery -> delivered
                                                                        -> cancelled (from any state)
```

### Recommended Implementation for Cru

Our architecture document already establishes Supabase Realtime as the real-time layer (see Section 13 of E-Commerce Module). Here is the concrete component architecture:

#### Order Status Subscription Pattern

```typescript
// components/features/orders/OrderTracker.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

type OrderUpdate = {
  status: OrderStatus
  updated_at: string
  metadata: Record<string, unknown> // ETA, driver info, etc.
}

export function OrderTracker({
  orderId,
  initialStatus,
}: {
  orderId: string
  initialStatus: OrderStatus
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus)
  const [history, setHistory] = useState<OrderUpdate[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_status_events',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const update = payload.new as OrderUpdate
          setStatus(update.status)
          setHistory((prev) => [...prev, update])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  return (
    // Render status timeline, ETA, progress bar
  )
}
```

#### Event Bridge: Medusa Order Events to Supabase

Our architecture already defines this pattern (E-Commerce Module, Section 13). The flow is:

```
1. Retailer updates order in their dashboard (or Medusa workflow advances)
2. Medusa emits order.status_updated event
3. Medusa subscriber inserts row into Supabase order_status_events table (using service role)
4. Supabase Realtime broadcasts the INSERT to all subscribed clients
5. OrderTracker component receives the update via postgres_changes subscription
```

This avoids running a separate WebSocket server. Supabase Realtime handles connection management, reconnection, and fan-out. The latency is typically 50-200ms from database write to client receipt, which is more than adequate for order status updates (not GPS tracking).

#### Polling Fallback

For environments where WebSocket connections are unreliable (corporate firewalls, spotty mobile), add a polling fallback:

```typescript
// lib/hooks/useOrderStatus.ts
'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useOrderStatus(orderId: string, initialStatus: string) {
  const [status, setStatus] = useState(initialStatus)
  const [isRealtime, setIsRealtime] = useState(true)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Try Realtime first
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', { /* ... */ }, (payload) => {
        setStatus(payload.new.status)
        setIsRealtime(true)
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Fall back to polling
          setIsRealtime(false)
          pollIntervalRef.current = setInterval(async () => {
            const { data } = await supabase
              .from('order_status_events')
              .select('status')
              .eq('order_id', orderId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
            if (data) setStatus(data.status)
          }, 15_000) // 15-second polling
        }
      })

    return () => {
      supabase.removeChannel(channel)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [orderId, supabase])

  return { status, isRealtime }
}
```

#### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Real-time transport | Supabase Realtime (postgres_changes) | Already in our stack, no additional infra, handles reconnection |
| Fallback strategy | 15s polling via Supabase REST | Covers corporate firewalls and degraded connections |
| Status model | Finite state machine with event sourcing | Each transition is an INSERT (audit trail), not an UPDATE |
| GPS tracking | Not in MVP | Wine delivery is not time-critical like food; status updates suffice |

---

## 2. Geolocation Strategy

### How Uber Eats / Grubhub Do It

Both platforms use a **three-tier location detection** strategy:

1. **Browser Geolocation API** (primary) — prompts user for permission, gets precise lat/lng
2. **IP-based geolocation** (fallback) — uses MaxMind GeoIP or similar to get approximate city/region
3. **Manual address entry** (always available) — autocomplete-powered address input for explicit location

Uber Eats aggressively requests geolocation permission on first visit. Grubhub is slightly more conservative, showing "Enter your delivery address" as the primary CTA with geolocation as a secondary option ("Use my location").

Both store the resolved location in:
- A cookie (for server-side rendering of location-aware pages)
- LocalStorage (for persistence across sessions)
- URL parameters (for shareable location-specific links, e.g., `/restaurants/near/san-francisco`)

#### Distance Calculation

Both use server-side distance calculation (not client-side). Uber Eats uses their own geo infrastructure (H3 hexagonal grid system). Grubhub uses PostGIS-style spatial queries against their restaurant database.

Display conventions:
- Distance shown in miles (US) as "0.3 mi" or "2.1 mi"
- Delivery time estimates shown alongside distance ("25-35 min")
- "Nearby" threshold is typically 3-5 miles for restaurants

### Recommended Implementation for Cru

#### Three-Tier Location Detection

```typescript
// lib/geo/location.ts

export type UserLocation = {
  lat: number
  lng: number
  accuracy: 'precise' | 'approximate' | 'manual'
  display_name: string // "San Francisco, CA" or "94102"
  source: 'browser' | 'ip' | 'manual'
}

/**
 * Tier 1: Browser Geolocation API
 * Returns precise coordinates if user grants permission.
 */
export function getBrowserLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        // Reverse geocode to get display name
        const displayName = await reverseGeocode(latitude, longitude)
        resolve({
          lat: latitude,
          lng: longitude,
          accuracy: 'precise',
          display_name: displayName,
          source: 'browser',
        })
      },
      () => resolve(null), // User denied or error
      { timeout: 5000, maximumAge: 300_000 } // Cache for 5 minutes
    )
  })
}

/**
 * Tier 2: IP-based geolocation (server-side)
 * Call from a Server Action or API route.
 */
export async function getIPLocation(
  ipAddress: string
): Promise<UserLocation | null> {
  // Use a free/cheap IP geolocation service
  // Options: ipapi.co (free tier: 1000/day), ip-api.com (free for non-commercial)
  // For production: MaxMind GeoLite2 (free database, self-hosted)
  try {
    const res = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    })
    const data = await res.json()
    if (data.error) return null

    return {
      lat: data.latitude,
      lng: data.longitude,
      accuracy: 'approximate',
      display_name: `${data.city}, ${data.region_code}`,
      source: 'ip',
    }
  } catch {
    return null
  }
}

/**
 * Tier 3: Manual address/zip entry
 * Uses Mapbox Geocoding API for address autocomplete.
 */
export async function geocodeAddress(
  query: string
): Promise<UserLocation | null> {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
    `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&` +
    `country=us&types=address,postcode,place&limit=1`
  )
  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null

  return {
    lat: feature.center[1],
    lng: feature.center[0],
    accuracy: 'manual',
    display_name: feature.place_name,
    source: 'manual',
  }
}
```

#### Location Persistence

```typescript
// lib/geo/location-store.ts

const LOCATION_COOKIE = 'cru_location'
const LOCATION_STORAGE_KEY = 'cru_user_location'

/**
 * Store location in both cookie (for SSR) and localStorage (for persistence).
 */
export function persistLocation(location: UserLocation) {
  // Cookie for server-side access (7-day expiry)
  document.cookie = `${LOCATION_COOKIE}=${encodeURIComponent(
    JSON.stringify({ lat: location.lat, lng: location.lng })
  )}; path=/; max-age=${7 * 86400}; SameSite=Lax`

  // localStorage for full location data
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location))
}

/**
 * Read location from localStorage (client-side).
 */
export function getStoredLocation(): UserLocation | null {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}
```

#### PostGIS Distance Queries (Database Layer)

For "sort by distance" and "available near you," PostGIS on Supabase is the right tool. Supabase's PostgreSQL instance has PostGIS enabled by default.

```sql
-- Migration: Add geography column to retailers table
ALTER TABLE retailers ADD COLUMN location GEOGRAPHY(POINT, 4326);

-- Create spatial index
CREATE INDEX idx_retailers_location ON retailers USING GIST (location);

-- Function: find retailers within radius, sorted by distance
CREATE OR REPLACE FUNCTION find_nearby_retailers(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION DEFAULT 25.0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  distance_miles DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.address,
    ST_Distance(
      r.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1609.34 AS distance_miles  -- meters to miles
  FROM retailers r
  WHERE ST_DWithin(
    r.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_miles * 1609.34  -- miles to meters
  )
  ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql STABLE;
```

```typescript
// lib/dal/retailers.ts
export async function findNearbyRetailers(
  supabase: SupabaseClient,
  lat: number,
  lng: number,
  radiusMiles: number = 25
) {
  return supabase.rpc('find_nearby_retailers', {
    user_lat: lat,
    user_lng: lng,
    radius_miles: radiusMiles,
  })
}
```

#### Location-Aware Component

```typescript
// components/features/location/LocationSelector.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getBrowserLocation,
  geocodeAddress,
  type UserLocation,
} from '@/lib/geo/location'
import { persistLocation, getStoredLocation } from '@/lib/geo/location-store'

export function LocationSelector({
  onLocationSet,
}: {
  onLocationSet: (location: UserLocation) => void
}) {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [addressInput, setAddressInput] = useState('')
  const [isDetecting, setIsDetecting] = useState(false)

  // Restore from storage on mount
  useEffect(() => {
    const stored = getStoredLocation()
    if (stored) {
      setLocation(stored)
      onLocationSet(stored)
    }
  }, [onLocationSet])

  const handleDetectLocation = async () => {
    setIsDetecting(true)
    const detected = await getBrowserLocation()
    setIsDetecting(false)

    if (detected) {
      setLocation(detected)
      persistLocation(detected)
      onLocationSet(detected)
    }
    // If detection fails, user falls through to manual entry
  }

  const handleAddressSubmit = async () => {
    if (!addressInput.trim()) return
    const geocoded = await geocodeAddress(addressInput)
    if (geocoded) {
      setLocation(geocoded)
      persistLocation(geocoded)
      onLocationSet(geocoded)
    }
  }

  return (
    <div className="space-y-3">
      {location ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Showing results near</span>
          <span className="font-medium">{location.display_name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(null)}
            aria-label="Change location"
          >
            Change
          </Button>
        </div>
      ) : (
        <>
          <Button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            variant="outline"
            aria-label="Use my current location"
          >
            {isDetecting ? 'Detecting...' : 'Use My Location'}
          </Button>
          <div className="flex gap-2">
            <Input
              placeholder="Enter zip code or city"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddressSubmit()}
              aria-label="Enter delivery address or zip code"
            />
            <Button onClick={handleAddressSubmit}>Go</Button>
          </div>
        </>
      )}
    </div>
  )
}
```

#### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary geolocation | Browser API with explicit user action | Grubhub pattern: show "Enter address" as primary, "Use my location" as secondary — less intrusive |
| IP fallback | ipapi.co (dev) / MaxMind GeoLite2 (prod) | Free tier for development; self-hosted MaxMind avoids per-request costs in production |
| Address autocomplete | Mapbox Geocoding API | Bundled with mapping library choice (see Section 3); 100K free requests/month |
| Distance calculation | PostGIS on Supabase | Native to our database, spatial indexing, accurate great-circle distance |
| Location persistence | Cookie (lat/lng for SSR) + localStorage (full data) | Cookie enables server-side rendering of location-aware pages; localStorage for rich client state |
| Default radius | 25 miles | Wine delivery radius is wider than food delivery; adjustable per retailer |

---

## 3. Map Integration Plan

### Library Comparison

| Library | Pricing | React Support | Bundle Size | SSR Compatible | Tile Quality |
|---------|---------|---------------|-------------|----------------|-------------|
| **Mapbox GL JS** | 50K free loads/mo, then $5/1K | react-map-gl (official) | ~220KB gzipped | Yes (static fallback) | Excellent |
| Google Maps | $200 free credit/mo (~28K loads) | @vis.gl/react-google-maps | ~180KB | Limited | Excellent |
| Leaflet | Free (OSM tiles) | react-leaflet | ~40KB | Limited | Good |
| MapLibre GL | Free (self-hosted tiles) | react-map-gl (compatible) | ~200KB | Yes | Depends on tile source |

### Recommendation: Mapbox GL JS via react-map-gl

**Why Mapbox over Google Maps:**

1. **Pricing**: 50,000 free map loads/month vs. Google's ~28,000 effective free loads. At our early stage, Mapbox is effectively free.
2. **Customization**: Mapbox Studio allows deep style customization to match our brand (dark/wine-themed map styles).
3. **Geocoding bundled**: The Mapbox Geocoding API (for address autocomplete in Section 2) is included in the same free tier.
4. **react-map-gl**: Uber's own open-source React wrapper for Mapbox — battle-tested at scale, maintained by the vis.gl team.
5. **Static map images**: Mapbox Static Images API provides map thumbnails for emails, order confirmations, and SSR fallbacks without loading the full GL library.

**Why not Leaflet:**

Leaflet is lighter but lacks vector tile support, smooth zoom, 3D building rendering, and the geocoding/directions APIs we need. The bundle size advantage (40KB vs 220KB) does not justify the feature gap.

**Why not MapLibre:**

MapLibre is a viable free alternative (fork of Mapbox GL JS v1) but requires self-hosting tile servers or using a third-party tile provider. The operational overhead is not worth it at our stage.

### Minimal Viable Map Components

#### 1. Retailer Location Map (Browse/Discovery)

Shows nearby retailers as pins on a map. Clicking a pin shows retailer details in a panel.

```typescript
// components/features/map/RetailerMap.tsx
'use client'

import { useCallback, useState } from 'react'
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Retailer = {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  distance_miles: number
}

export function RetailerMap({
  retailers,
  userLocation,
}: {
  retailers: Retailer[]
  userLocation: { lat: number; lng: number }
}) {
  const [selected, setSelected] = useState<Retailer | null>(null)

  const handleMarkerClick = useCallback((retailer: Retailer) => {
    setSelected(retailer)
  }, [])

  return (
    <Map
      initialViewState={{
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 11,
      }}
      style={{ width: '100%', height: 400 }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />

      {retailers.map((retailer) => (
        <Marker
          key={retailer.id}
          latitude={retailer.lat}
          longitude={retailer.lng}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            handleMarkerClick(retailer)
          }}
          aria-label={`${retailer.name}, ${retailer.distance_miles.toFixed(1)} miles away`}
        />
      ))}

      {selected && (
        <Popup
          latitude={selected.lat}
          longitude={selected.lng}
          onClose={() => setSelected(null)}
          closeOnClick={false}
          anchor="bottom"
        >
          <div className="p-2">
            <h3 className="font-semibold text-sm">{selected.name}</h3>
            <p className="text-xs text-muted-foreground">{selected.address}</p>
            <p className="text-xs">{selected.distance_miles.toFixed(1)} mi away</p>
          </div>
        </Popup>
      )}
    </Map>
  )
}
```

#### 2. Delivery Zone Indicator (Checkout)

Shows whether the user's address is within a retailer's delivery zone. This is a simple yes/no check, not a full map — display as a badge or inline message.

```typescript
// components/features/orders/DeliveryZoneCheck.tsx
'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { checkDeliveryZone } from '@/lib/actions/delivery-actions'

export function DeliveryZoneCheck({
  retailerId,
  userLat,
  userLng,
}: {
  retailerId: string
  userLat: number
  userLng: number
}) {
  const [inZone, setInZone] = useState<boolean | null>(null)

  useEffect(() => {
    checkDeliveryZone(retailerId, userLat, userLng).then((result) => {
      setInZone(result.data?.in_zone ?? false)
    })
  }, [retailerId, userLat, userLng])

  if (inZone === null) return null

  return inZone ? (
    <Badge variant="secondary">Delivery available</Badge>
  ) : (
    <Badge variant="outline">Pickup only</Badge>
  )
}
```

#### 3. Static Map Image (Order Confirmation / Email)

For order confirmation pages and email notifications, use the Mapbox Static Images API instead of loading the full GL library:

```typescript
// lib/geo/static-map.ts

export function getStaticMapUrl({
  lat,
  lng,
  zoom = 14,
  width = 600,
  height = 300,
  marker = true,
}: {
  lat: number
  lng: number
  zoom?: number
  width?: number
  height?: number
  marker?: boolean
}): string {
  const markerOverlay = marker ? `pin-s+c41e3a(${lng},${lat})/` : ''
  return (
    `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
    `${markerOverlay}${lng},${lat},${zoom}/${width}x${height}@2x` +
    `?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
  )
}
```

#### Integration Phases

| Phase | Scope | Components |
|-------|-------|------------|
| **MVP (Phase 6)** | Retailer discovery + delivery zone check | `RetailerMap`, `DeliveryZoneCheck`, `LocationSelector` |
| **Phase 7** | Order tracking map (retailer pin + delivery ETA) | `OrderTrackingMap` with static retailer pin |
| **Phase 8** | Delivery radius visualization for retailer dashboard | `DeliveryZoneEditor` (draw/edit zones on map) |

---

## 4. Optimistic UI and Real-Time Update Patterns

### How Uber Eats / Grubhub Do It

Both platforms use aggressive optimistic updates for cart operations:

- **Add to cart**: Item appears in cart immediately, count badge updates, total recalculates client-side. Server confirmation happens in background.
- **Remove from cart**: Item disappears immediately. If server fails, item reappears with an error toast.
- **Quantity change**: New quantity reflects immediately. Server sync happens asynchronously.
- **Order status**: NOT optimistic (this is authoritative server data). Updates flow from server to client via real-time subscriptions.

Grubhub notably uses a **stale-while-revalidate** pattern for restaurant menus — showing cached data immediately while fetching fresh availability data in the background.

### Recommended Patterns for Cru

#### Cart: useOptimistic + Server Actions

React 19 (shipped with Next.js 15) provides `useOptimistic` which is purpose-built for this pattern:

```typescript
// components/features/orders/AddToCartButton.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/lib/actions/cart-actions'
import { useToast } from '@/components/ui/use-toast'

export function AddToCartButton({
  variantId,
  currentCount,
}: {
  variantId: string
  currentCount: number
}) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCount, addOptimistic] = useOptimistic(
    currentCount,
    (current, change: number) => current + change
  )
  const { toast } = useToast()

  const handleAdd = () => {
    // Optimistic update: increment count immediately
    addOptimistic(1)

    startTransition(async () => {
      const result = await addToCart(variantId, 1)
      if (result.error) {
        // Revert happens automatically when transition completes
        // because optimisticCount reverts to currentCount
        toast({
          title: 'Could not add to cart',
          description: result.error,
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={isPending}
      aria-label="Add to cart"
    >
      Add to Cart {optimisticCount > 0 && `(${optimisticCount})`}
    </Button>
  )
}
```

#### Real-Time Availability Updates

Wine availability can change (another user buys the last bottle). Use Supabase Realtime to reflect this:

```typescript
// components/features/wines/LiveAvailability.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'

export function LiveAvailability({
  wineId,
  initialStock,
}: {
  wineId: string
  initialStock: number
}) {
  const [stock, setStock] = useState(initialStock)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`wine-stock-${wineId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'retailer_inventory',
          filter: `wine_id=eq.${wineId}`,
        },
        (payload) => {
          const newStock = (payload.new as { quantity: number }).quantity
          setStock(newStock)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [wineId, supabase])

  if (stock === 0) {
    return <Badge variant="destructive">Sold Out</Badge>
  }
  if (stock <= 3) {
    return <Badge variant="secondary">Only {stock} left</Badge>
  }
  return <Badge variant="outline">In Stock</Badge>
}
```

#### Pattern Summary

| Data Type | Update Strategy | Why |
|-----------|----------------|-----|
| Cart contents | Optimistic (useOptimistic + Server Action) | User expects instant feedback; server is authoritative but slow |
| Order status | Server-authoritative via Realtime subscription | Status transitions must be accurate; cannot be guessed |
| Wine availability / stock | Server-pushed via Realtime subscription | Shared state across users; must reflect true inventory |
| Search results / filters | URL state (nuqs or useSearchParams) | Shareable, bookmarkable, server-rendered |
| User preferences | Optimistic with Server Action | Personal data, low conflict risk |

---

## 5. Performance Patterns for Large Wine Catalogs

### How Uber Eats / Grubhub Do It

Both handle massive restaurant/item catalogs with:

1. **Intersection Observer lazy loading** — sections load as user scrolls into view (not virtual scrolling)
2. **Image optimization** — WebP/AVIF with multiple srcset sizes, blur-up placeholders, lazy loading
3. **Skeleton loading** — content-shaped placeholders during data fetching (not spinners)
4. **Section-based data fetching** — homepage loads "Nearby," "Popular," "New" sections independently
5. **Cursor-based pagination** — "Load more" button or infinite scroll with cursor, not page numbers

Uber Eats specifically uses a "swim lane" layout — horizontally scrollable carousels for categories with vertical scrolling between sections. This limits the visible item count at any time.

### Recommended Patterns for Cru

#### Intersection Observer Pagination

At our scale (hundreds to low thousands of wines per region, not millions), intersection-observer-based "load more" is the right pattern. Virtual scrolling adds complexity without meaningful benefit below 10,000 items.

```typescript
// lib/hooks/useInfiniteScroll.ts
'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

export function useInfiniteScroll<T>({
  fetchPage,
  pageSize = 24,
}: {
  fetchPage: (cursor: string | null, limit: number) => Promise<{
    items: T[]
    nextCursor: string | null
  }>
  pageSize?: number
}) {
  const [items, setItems] = useState<T[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    const result = await fetchPage(cursor, pageSize)
    setItems((prev) => [...prev, ...result.items])
    setCursor(result.nextCursor)
    setHasMore(result.nextCursor !== null)
    setIsLoading(false)
  }, [cursor, fetchPage, hasMore, isLoading, pageSize])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return { items, isLoading, hasMore, sentinelRef }
}
```

#### Image Optimization

Next.js `<Image>` with responsive sizes and blur placeholders:

```typescript
// components/features/wines/WineImage.tsx
import Image from 'next/image'

export function WineImage({
  src,
  alt,
  priority = false,
}: {
  src: string
  alt: string
  priority?: boolean
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={400}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="rounded-lg object-cover"
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhMTEyMCIvPjwvc3ZnPg=="
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
    />
  )
}
```

#### Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Priority loading for above-fold images; Server Components for initial data |
| **FID** (First Input Delay) | < 100ms | Minimal client JS; 'use client' only where needed |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Fixed dimensions on images/cards; skeleton loaders match content shape |
| **Initial JS bundle** | < 200KB gzipped | Tree-shake Mapbox (load only on map pages); lazy-load heavy components |
| **Wine grid render** | < 16ms per frame | CSS Grid layout (no JS layout); intersection observer for pagination |
| **Map load** | < 1s after interaction | Lazy-load Mapbox GL JS on first map view; use static map images elsewhere |

#### Lazy Loading Strategy for Heavy Dependencies

```typescript
// components/features/map/LazyRetailerMap.tsx
'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const RetailerMap = dynamic(
  () => import('./RetailerMap').then((mod) => mod.RetailerMap),
  {
    loading: () => (
      <Skeleton className="w-full h-[400px] rounded-lg" />
    ),
    ssr: false, // Mapbox GL JS requires browser APIs
  }
)

export { RetailerMap as LazyRetailerMap }
```

---

## 6. Push Notifications and Background Updates

### How Uber Eats / Grubhub Do It

Both use **native push notifications** on their mobile apps (APNs for iOS, FCM for Android). On the web:

- Uber Eats web does NOT request Web Push permission — they rely on in-app notifications and email.
- Grubhub web uses **email notifications** for order updates, not Web Push.

Both send notifications at these touchpoints:
1. Order confirmed by restaurant
2. Order being prepared
3. Driver assigned / out for delivery
4. Order delivered
5. Promotional notifications (discounts, new restaurants)

### Recommended Implementation for Cru (Web-First)

Web Push is viable for our use case (order status updates) and provides near-native notification experience. However, Web Push permission acceptance rates on web are typically 5-15%, so it should supplement, not replace, in-app and email notifications.

#### Web Push Architecture

```
1. User opts in to notifications (explicit button, not auto-prompt)
2. Service Worker registers with browser Push service
3. Subscription endpoint stored in Supabase (push_subscriptions table)
4. When order status changes, Supabase Edge Function sends push via web-push library
5. Service Worker receives push, displays notification
```

#### Service Worker Registration

```typescript
// lib/notifications/push.ts

export async function requestPushPermission(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null // Browser doesn't support Web Push
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const registration = await navigator.serviceWorker.register('/sw.js')
  await registration.update()

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  })

  // Store subscription on server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })

  return subscription
}
```

#### Service Worker

```javascript
// public/sw.js

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}

  const options = {
    body: data.body || 'Your order status has been updated.',
    icon: '/icons/cru-icon-192.png',
    badge: '/icons/cru-badge-72.png',
    tag: data.tag || 'order-update', // Replaces previous notification with same tag
    data: { url: data.url || '/orders' },
    actions: [
      { action: 'view', title: 'View Order' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Cru Wine', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/orders'

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Focus existing tab if open
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new tab
      return clients.openWindow(url)
    })
  )
})
```

#### Notification Trigger (Server-Side)

```typescript
// supabase/functions/send-push/index.ts
// Supabase Edge Function triggered by database webhook on order_status_events INSERT

import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:notifications@cruwine.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
)

Deno.serve(async (req) => {
  const { record } = await req.json() // Database webhook payload

  // Fetch push subscriptions for this user
  const { data: subscriptions } = await supabaseAdmin
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', record.user_id)

  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed by the retailer.',
    preparing: 'Your order is being prepared.',
    ready_for_pickup: 'Your order is ready for pickup!',
    out_for_delivery: 'Your order is on its way!',
    delivered: 'Your order has been delivered.',
  }

  const message = statusMessages[record.status]
  if (!message || !subscriptions?.length) {
    return new Response('No notification needed', { status: 200 })
  }

  const payload = JSON.stringify({
    title: 'Order Update',
    body: message,
    tag: `order-${record.order_id}`,
    url: `/orders/${record.order_id}`,
  })

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(JSON.parse(sub.subscription), payload)
    )
  )

  return new Response('OK', { status: 200 })
})
```

#### Notification Opt-In UX

Do not auto-prompt for push permission (browsers penalize this). Instead, show an opt-in after the user's first order:

```typescript
// components/features/orders/PushOptIn.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requestPushPermission } from '@/lib/notifications/push'

export function PushOptIn() {
  const [dismissed, setDismissed] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  if (dismissed || subscribed) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Stay Updated</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Get notified when your order status changes.
        </p>
        <Button
          size="sm"
          onClick={async () => {
            const sub = await requestPushPermission()
            setSubscribed(!!sub)
          }}
          aria-label="Enable order notifications"
        >
          Enable Notifications
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notification prompt"
        >
          Not Now
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 7. Offline / Low-Connectivity Handling

### How Uber Eats / Grubhub Do It

Both platforms handle connectivity loss gracefully:

- **Cart persists locally** — items remain in cart even if connection drops
- **Order placement queues** — if connection drops during checkout, the request is queued and retried
- **Status polling fallback** — if WebSocket disconnects, falls back to periodic HTTP polling
- **Stale data indicators** — show "Last updated X minutes ago" when data may be outdated
- **Offline detection** — navigator.onLine + periodic health checks

Neither platform works fully offline (you cannot browse menus offline). This is acceptable for a marketplace where inventory changes in real-time.

### Recommended Patterns for Cru

#### Connection Status Detection

```typescript
// lib/hooks/useConnectionStatus.ts
'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true // Assume online during SSR
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

#### Offline Banner

```typescript
// components/features/connectivity/OfflineBanner.tsx
'use client'

import { useOnlineStatus } from '@/lib/hooks/useConnectionStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      className="bg-destructive text-destructive-foreground text-center py-2 text-sm"
      role="alert"
    >
      You are offline. Some features may be unavailable.
    </div>
  )
}
```

#### Server Action Retry Wrapper

```typescript
// lib/utils/retry.ts

export async function withRetry<T>(
  fn: () => Promise<T>,
  {
    maxRetries = 3,
    baseDelay = 1000,
    backoffMultiplier = 2,
  } = {}
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(backoffMultiplier, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
```

#### Cart Persistence

Our cart is managed by Medusa (server-side), but we can cache the cart state in localStorage for instant display on page load:

```typescript
// lib/cart/cart-cache.ts

const CART_CACHE_KEY = 'cru_cart_cache'

export function cacheCart(cart: CartData) {
  try {
    localStorage.setItem(CART_CACHE_KEY, JSON.stringify({
      data: cart,
      timestamp: Date.now(),
    }))
  } catch {
    // localStorage might be full or disabled
  }
}

export function getCachedCart(): CartData | null {
  try {
    const raw = localStorage.getItem(CART_CACHE_KEY)
    if (!raw) return null

    const { data, timestamp } = JSON.parse(raw)
    // Cache is valid for 30 minutes
    if (Date.now() - timestamp > 30 * 60 * 1000) {
      localStorage.removeItem(CART_CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}
```

---

## 8. Technical Dependencies

### New Packages Required

| Package | Purpose | Bundle Impact | Free Tier |
|---------|---------|---------------|-----------|
| `react-map-gl` | React wrapper for Mapbox GL JS | ~220KB (lazy loaded) | N/A (OSS) |
| `mapbox-gl` | Mapbox GL JS rendering engine | (peer dep of react-map-gl) | 50K map loads/mo |
| `web-push` | Server-side Web Push notifications | Server only (0 client impact) | N/A (OSS) |

### Services Required

| Service | Purpose | Free Tier | Estimated Cost at Scale |
|---------|---------|-----------|------------------------|
| **Mapbox** | Maps, geocoding, static images | 50K map loads + 100K geocoding requests/mo | $5/1K loads after free tier |
| **ipapi.co** (dev) / **MaxMind GeoLite2** (prod) | IP-based geolocation fallback | 1K/day (ipapi) / unlimited (MaxMind, self-hosted) | Free (MaxMind GeoLite2 is free) |
| **VAPID keys** (self-generated) | Web Push authentication | Free (self-hosted) | Free |

### Supabase Extensions Required

| Extension | Purpose | Status |
|-----------|---------|--------|
| **PostGIS** | Spatial queries for retailer proximity | Enabled by default on Supabase |

### Database Schema Additions

```sql
-- push_subscriptions: Store Web Push subscription endpoints
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL, -- PushSubscription object from browser
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, subscription)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- order_status_events: Event-sourced order status tracking
CREATE TABLE order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL, -- Medusa order ID
  user_id UUID NOT NULL REFERENCES auth.users(id),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE order_status_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_order_status_events_order ON order_status_events(order_id);
CREATE INDEX idx_order_status_events_org ON order_status_events(org_id);

-- retailers: Add geography column
ALTER TABLE retailers ADD COLUMN location GEOGRAPHY(POINT, 4326);
CREATE INDEX idx_retailers_location ON retailers USING GIST (location);
```

---

## 9. Implementation Priority

| Priority | Feature | Complexity | Dependencies |
|----------|---------|------------|-------------|
| **P0** | Location detection + manual entry | Low | Mapbox Geocoding API key |
| **P0** | PostGIS distance queries for retailer proximity | Medium | PostGIS extension (already available) |
| **P0** | Optimistic cart updates | Low | Existing cart Server Actions |
| **P1** | Real-time order status tracking | Medium | order_status_events table, Medusa event bridge |
| **P1** | Retailer map (browse page) | Medium | react-map-gl, Mapbox token |
| **P1** | Delivery zone check | Low | PostGIS zone queries |
| **P2** | Web Push notifications | Medium | VAPID keys, service worker, push_subscriptions table |
| **P2** | Offline banner + connectivity detection | Low | None |
| **P2** | Cart cache (localStorage) | Low | None |
| **P3** | Real-time stock availability | Low | Supabase Realtime subscription |
| **P3** | Static map images for emails/confirmations | Low | Mapbox Static API |

---

## 10. Patterns We Should NOT Adopt

These are patterns from Uber Eats / Grubhub that do not apply to our use case:

| Pattern | Why Not |
|---------|---------|
| **Live GPS driver tracking** | Wine delivery is not time-sensitive like food. Status updates (preparing, shipped, delivered) are sufficient. GPS tracking adds complexity, privacy concerns, and requires a mobile driver app. |
| **Virtual scrolling** | Our wine catalog is orders of magnitude smaller than a restaurant menu aggregator. Intersection-observer pagination handles our scale. |
| **Service worker offline caching of catalog** | Wine inventory changes constantly (availability, pricing). Serving stale catalog data could lead to orders for out-of-stock items. |
| **Native mobile app** | We are web-first. PWA features (Web Push, Add to Home Screen) cover the most valuable native capabilities without the App Store overhead. |
| **Micro-frontend architecture** | Uber uses micro-frontends for team scaling (hundreds of engineers). Our team size does not warrant this complexity. |
| **Real-time pricing** | Wine prices do not fluctuate like surge pricing. Static pricing with periodic updates is correct for our domain. |
| **ETA prediction models** | Uber invests heavily in ML-based delivery time prediction. For wine, a simple "ships within X business days" or "ready for pickup in Y hours" is appropriate. |

---

## Appendix A: Comparison of Real-Time Approaches

| Approach | Latency | Complexity | Cost | Our Use Case |
|----------|---------|------------|------|-------------|
| **Supabase Realtime (postgres_changes)** | 50-200ms | Low (built-in) | Included in Supabase plan | Order status, stock updates, bid updates |
| **Supabase Realtime (broadcast)** | 20-50ms | Low | Included | Auction countdown sync |
| **Server-Sent Events (custom)** | 50-100ms | Medium (need API route) | Vercel serverless limits | Not recommended (Supabase handles this) |
| **WebSocket server (custom)** | 10-30ms | High (separate infra) | Additional hosting | Not recommended (overkill for our needs) |
| **Polling** | 5-30s | Low | Higher DB load | Fallback only |

## Appendix B: Mapbox vs Google Maps Feature Parity

| Feature | Mapbox | Google Maps |
|---------|--------|-------------|
| Custom map styles | Mapbox Studio (deep) | Cloud-based styling (limited) |
| Geocoding API | Included in free tier | Separate billing ($5/1K requests) |
| Static map images | Included | Separate billing ($2/1K) |
| Directions API | $5/1K requests | $5-10/1K requests |
| React integration | react-map-gl (Uber-maintained) | @vis.gl/react-google-maps (newer, less mature) |
| SSR support | Static image fallback | Static image fallback |
| Offline / caching | Vector tiles cacheable | Raster tiles, no caching |
| Bundle size | ~220KB | ~180KB |
| Free tier value | ~$250/mo equivalent | ~$200/mo credit |
