/**
 * Public Availability API
 *
 * GET /api/v1/inventory/check?wine_id=X&lat=Y&lng=Z&radius=15
 *
 * Returns which retailers currently have a given wine in stock, along with
 * price, quantity, and fulfillment options. No authentication required —
 * this is consumer-facing public data.
 *
 * Performance target: <200ms p95
 * Caching: CDN-friendly via Cache-Control headers (60s fresh, 30s stale)
 *
 * Note: lat/lng/radius params are accepted but geographic filtering is not
 * yet active (PostGIS RPC pending). All matching retailers are returned
 * with distanceMiles set to 0.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAvailabilityForWine } from '@/lib/dal/inventory'
import { InventoryCheckSchema } from '@/lib/validations/inventory-check'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RetailerAvailability {
  retailerId: string
  name: string
  distanceMiles: number
  price: number
  quantity: number
  stockStatus: 'in_stock' | 'low_stock'
  fulfillmentOptions: string[]
  lastSyncedAt: string
}

interface AvailabilityResponse {
  wineId: string
  available: boolean
  retailers: RetailerAvailability[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely extract fulfillment capabilities from the retailer JSONB column.
 * Returns an empty array if the value is null, undefined, or not an array.
 */
function parseFulfillmentCapabilities(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string')
  }
  return []
}

/**
 * Transform a raw DAL inventory record into the public API shape.
 * The DAL returns rows with nested `retailer` from the Supabase join.
 */
function transformRecord(record: Record<string, unknown>): RetailerAvailability | null {
  const retailer = record.retailer as Record<string, unknown> | null | undefined
  if (!retailer) return null

  const stockStatus = record.stock_status as string
  if (stockStatus !== 'in_stock' && stockStatus !== 'low_stock') return null

  return {
    retailerId: retailer.id as string,
    name: retailer.name as string,
    distanceMiles: 0, // PostGIS not wired yet
    price: record.price as number,
    quantity: record.quantity as number,
    stockStatus: stockStatus as 'in_stock' | 'low_stock',
    fulfillmentOptions: parseFulfillmentCapabilities(
      retailer.fulfillment_capabilities
    ),
    lastSyncedAt: (record.last_synced_at as string) ?? new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Parse query params
  const { searchParams } = new URL(request.url)
  const rawParams: Record<string, string> = {}

  for (const key of ['wine_id', 'lat', 'lng', 'radius']) {
    const value = searchParams.get(key)
    if (value !== null) {
      rawParams[key] = value
    }
  }

  // 2. Validate with Zod
  const parsed = InventoryCheckSchema.safeParse(rawParams)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const { wine_id, lat, lng, radius } = parsed.data

  // 3. Query the DAL
  try {
    const supabase = await createClient()

    const result = await getAvailabilityForWine(
      supabase,
      wine_id,
      lat,
      lng,
      radius,
      { page: 1, per_page: 50 }
    )

    // 4. Transform results into API response shape
    const retailers: RetailerAvailability[] = []

    for (const raw of result.data) {
      const transformed = transformRecord(raw as Record<string, unknown>)
      if (transformed) {
        retailers.push(transformed)
      }
    }

    const response: AvailabilityResponse = {
      wineId: wine_id,
      available: retailers.length > 0,
      retailers,
    }

    // 5. Return with cache headers for CDN edge caching
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Internal server error'

    console.error('GET /api/v1/inventory/check failed:', message)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
