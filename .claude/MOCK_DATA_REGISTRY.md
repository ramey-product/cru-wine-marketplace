# Mock Data Registry

Tracks all placeholder/mock data in the codebase that must be replaced with real DAL queries before production.

---

## 1. Placeholder Wines

**File:** `apps/web/app/(app)/wines/_lib/placeholder-wines.ts`

| Export | Type | Used By | Production Replacement |
|--------|------|---------|----------------------|
| `PLACEHOLDER_WINES` | `PlaceholderWine[]` (8 wines) | Browse page, PopularNearYou, PickedForYou, NewArrivals | DAL: `getWines(client, filters, pagination)` querying the `wines` table with joins to `producers` |
| `MOCK_AVAILABILITY` | `Record<string, WineAvailability>` | Browse page, PopularNearYou (via `WineGridClient`) | DAL: `findWinesAvailableNearby()` RPC using PostGIS spatial queries from `lib/dal/retailers.ts` |
| `PLACEHOLDER_REGIONS` | `string[]` | FilterPanel | DAL: `SELECT DISTINCT region FROM wines` |
| `PLACEHOLDER_VARIETALS` | `string[]` | FilterPanel | DAL: `SELECT DISTINCT varietal FROM wines` |

**WineAvailability shape** (defined in `WineCard.tsx`):
```ts
interface WineAvailability {
  nearbyRetailerCount: number  // count of retailers within radius
  lowestPrice: number          // cents
  closestRetailer?: {          // omitted when count is 0
    name: string
    distanceMiles: number
  }
}
```

**Notes:**
- Availability data requires user geolocation (from `LocationContext`) to compute distances
- The `findWinesAvailableNearby` RPC in `lib/dal/retailers.ts` already exists but needs a DAL wrapper that returns `WineAvailability` per wine
- When wiring real data, the browse page (`app/(app)/wines/page.tsx`) should fetch availability server-side and pass it to `WineGridClient` via the `availabilityMap` prop

---

## 2. Mock Retailers

**File:** `apps/web/components/features/orders/RetailerSelectionSheet.tsx`

| Export | Type | Used By | Production Replacement |
|--------|------|---------|----------------------|
| `MOCK_RETAILERS` | `Retailer[]` (3 retailers) | RetailerSelectionSheet (default prop) | DAL: `getRetailersNearby()` RPC from `lib/dal/retailers.ts`, filtered by wine availability |

**Retailer shape** (defined in `RetailerSelectionSheet.tsx`):
```ts
interface Retailer {
  id: string
  orgId: string
  name: string
  distanceMiles: number
  price: number               // dollars (not cents)
  fulfillment: ('pickup' | 'delivery')[]
  inStock: boolean
  prepTimeMinutes?: number    // default 30
  deliveryWindowEnd?: string  // e.g. "4:00 PM"
  isOpen?: boolean
  closingSoon?: boolean
  nextOpenAt?: string         // e.g. "10:00 AM"
}
```

**Notes:**
- The `RetailerSelectionSheet` already accepts an optional `retailers` prop — pass real data to override mocks
- Store hours (`isOpen`, `closingSoon`, `nextOpenAt`) will need a real-time source (retailer org settings or a store-hours table)
- `prepTimeMinutes` and `deliveryWindowEnd` depend on retailer fulfillment configuration (not yet built)
- The `price` field is in dollars here (unlike `WineAvailability.lowestPrice` which is cents) — normalize when wiring

---

## 3. Cart Context (Local-Only)

**File:** `apps/web/lib/cart/CartContext.tsx`

The cart currently uses localStorage (`cru-cart-v1`) only. No server-side cart persistence yet.

| Concern | Current State | Production Replacement |
|---------|--------------|----------------------|
| Cart storage | localStorage only | Medusa.js cart API via `lib/actions/cart.ts` (server actions already exist) |
| Retailer name in cart | Hardcoded `'Local Wine Shop'` in `WineGridClient.tsx` | Pull from selected retailer in `RetailerSelectionSheet` |
| Price in cart | Uses `wine.price_min * 100` (cents) | Use actual retailer-specific price from the selected retailer |

**Notes:**
- `lib/actions/cart.ts` already has `addToCart`, `updateCartItemQuantity`, `removeFromCart`, `getActiveCart` — these use the Medusa HTTP client
- `WineGridClient.handleAddToCart` currently hardcodes `'Local Wine Shop'` as retailer name — needs to receive the actual name from the `RetailerSelectionSheet` callback
- The `CartProvider` should eventually hydrate from Medusa on auth, falling back to localStorage for anonymous users

---

## 4. Curated Sections (Home Page)

**File locations:** `apps/web/components/features/curation/`

| Component | Mock Source | Production Replacement |
|-----------|-----------|----------------------|
| `PopularNearYou` | `PLACEHOLDER_WINES.slice(0, 6)` | DAL: trending wines query based on order volume + user location |
| `PickedForYou` | `PLACEHOLDER_WINES.slice(0, 6)` | DAL: recommendation engine based on taste profile + purchase history |
| `NewArrivals` | `PLACEHOLDER_WINES.slice(2, 8)` | DAL: `getWines(client, { sort: 'created_at', order: 'desc' }, { per_page: 6 })` |

---

## Wiring Checklist

When connecting real data, follow this order:

1. **Wines table + DAL** — Replace `PLACEHOLDER_WINES` with `getWines()` DAL calls
2. **Availability** — Wire `findWinesAvailableNearby()` to produce `WineAvailability` map, pass via `availabilityMap` prop
3. **Retailer selection** — Pass real retailers from `getRetailersNearby()` to `RetailerSelectionSheet` via `retailers` prop
4. **Cart persistence** — Connect `CartContext` to Medusa cart API for authenticated users
5. **Curated sections** — Replace static slices with purpose-built DAL queries
6. **Price normalization** — Ensure cents vs dollars consistency across `WineAvailability.lowestPrice` (cents) and `Retailer.price` (dollars)
