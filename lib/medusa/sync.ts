/**
 * Wine-to-Medusa Product sync utilities.
 *
 * This module transforms Supabase wine rows into Medusa Product payloads
 * and provides create/update operations against the Medusa admin API.
 *
 * NOTE: Medusa.js SDK integration is pending infrastructure setup.
 * Once the Medusa admin SDK (`@medusajs/medusa` or `@medusajs/js-sdk`) is
 * installed and MEDUSA_BACKEND_URL is set, replace the HTTP client below
 * with the official SDK calls.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal wine row shape from the Supabase webhook payload */
export interface WineWebhookRow {
  id: string
  org_id: string
  producer_id: string
  name: string
  slug: string
  varietal?: string | null
  region?: string | null
  country?: string | null
  vintage?: number | null
  description?: string | null
  image_url?: string | null
  price_min?: number | null
  price_max?: number | null
  medusa_product_id?: string | null
  is_active?: boolean
}

/** Medusa Product payload (subset of fields we sync) */
interface MedusaProductPayload {
  title: string
  handle: string
  description?: string
  thumbnail?: string
  status: 'published' | 'draft'
  metadata: Record<string, string>
}

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

export function wineToMedusaPayload(wine: WineWebhookRow): MedusaProductPayload {
  return {
    title: wine.name,
    handle: wine.slug,
    description: wine.description ?? undefined,
    thumbnail: wine.image_url ?? undefined,
    status: wine.is_active ? 'published' : 'draft',
    metadata: {
      supabase_wine_id: wine.id,
      supabase_org_id: wine.org_id,
      supabase_producer_id: wine.producer_id,
      ...(wine.varietal ? { varietal: wine.varietal } : {}),
      ...(wine.region ? { region: wine.region } : {}),
      ...(wine.country ? { country: wine.country } : {}),
      ...(wine.vintage ? { vintage: String(wine.vintage) } : {}),
    },
  }
}

// ---------------------------------------------------------------------------
// Medusa API client (raw HTTP until SDK is installed)
// ---------------------------------------------------------------------------

function getMedusaConfig() {
  const url = process.env.MEDUSA_BACKEND_URL
  const apiKey = process.env.MEDUSA_API_KEY

  if (!url || !apiKey) {
    throw new Error(
      'Medusa is not configured. Set MEDUSA_BACKEND_URL and MEDUSA_API_KEY environment variables.'
    )
  }

  return { url: url.replace(/\/$/, ''), apiKey }
}

async function medusaFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { url, apiKey } = getMedusaConfig()

  return fetch(`${url}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      // API key last so callers cannot override it
      'x-medusa-access-token': apiKey,
    },
  })
}

// ---------------------------------------------------------------------------
// Sync operations
// ---------------------------------------------------------------------------

export interface SyncResult {
  medusa_product_id: string
  action: 'created' | 'updated'
}

/**
 * Create a new Medusa Product from a wine row.
 */
export async function createMedusaProduct(
  wine: WineWebhookRow
): Promise<SyncResult> {
  const payload = wineToMedusaPayload(wine)

  const res = await medusaFetch('/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Medusa create product failed (${res.status}): ${body}`)
  }

  const json = (await res.json()) as { product: { id: string } }
  return { medusa_product_id: json.product.id, action: 'created' }
}

/**
 * Update an existing Medusa Product from a wine row.
 */
export async function updateMedusaProduct(
  medusaProductId: string,
  wine: WineWebhookRow
): Promise<SyncResult> {
  const payload = wineToMedusaPayload(wine)

  const res = await medusaFetch(`/admin/products/${medusaProductId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Medusa update product failed (${res.status}): ${body}`)
  }

  return { medusa_product_id: medusaProductId, action: 'updated' }
}

/**
 * Sync a wine row to Medusa — creates or updates based on whether
 * medusa_product_id already exists on the wine.
 */
export async function syncWineToMedusa(
  wine: WineWebhookRow
): Promise<SyncResult> {
  if (wine.medusa_product_id) {
    return updateMedusaProduct(wine.medusa_product_id, wine)
  }
  return createMedusaProduct(wine)
}
