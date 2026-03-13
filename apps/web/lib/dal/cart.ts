/**
 * Medusa Cart DAL — thin wrappers around the Medusa Store API for cart
 * operations. Uses raw HTTP fetch (same pattern as lib/medusa/sync.ts)
 * since the Medusa SDK is not yet installed.
 *
 * All functions return `{ data, error }` for consistency with the rest
 * of the DAL layer, even though these are HTTP calls rather than
 * Supabase queries.
 */

// ---------------------------------------------------------------------------
// Medusa HTTP client (Store API)
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

const CART_MEDUSA_TIMEOUT_MS = 15_000

async function cartMedusaFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { url, apiKey } = getMedusaConfig()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CART_MEDUSA_TIMEOUT_MS)

  try {
    return await fetch(`${url}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        // API key last so callers cannot override it
        'x-medusa-access-token': apiKey,
      },
    })
  } finally {
    clearTimeout(timer)
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Opaque Medusa cart object — shape depends on Medusa version/config. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MedusaCart = Record<string, any>

interface CartResult {
  data: MedusaCart | null
  error: string | null
}

// ---------------------------------------------------------------------------
// createMedusaCart -- create a new cart in Medusa
// ---------------------------------------------------------------------------

/**
 * Create a new Medusa cart. Optionally supply a region ID and sales channel
 * ID to scope the cart to a specific market.
 */
export async function createMedusaCart(
  options: { regionId?: string; salesChannelId?: string } = {}
): Promise<CartResult> {
  try {
    const body: Record<string, string> = {}
    if (options.regionId) body.region_id = options.regionId
    if (options.salesChannelId) body.sales_channel_id = options.salesChannelId

    const res = await cartMedusaFetch('/store/carts', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('createMedusaCart failed:', res.status, text)
      return { data: null, error: `Medusa create cart failed (${res.status}): ${text}` }
    }

    const json = await res.json()
    return { data: json.cart ?? json, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('createMedusaCart error:', message)
    return { data: null, error: message }
  }
}

// ---------------------------------------------------------------------------
// addItemToCart -- add a line item to an existing cart
// ---------------------------------------------------------------------------

/**
 * Add a product variant to a Medusa cart.
 */
export async function addItemToCart(
  cartId: string,
  input: { variantId: string; quantity: number }
): Promise<CartResult> {
  try {
    const res = await cartMedusaFetch(`/store/carts/${cartId}/line-items`, {
      method: 'POST',
      body: JSON.stringify({
        variant_id: input.variantId,
        quantity: input.quantity,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('addItemToCart failed:', res.status, text)
      return { data: null, error: `Medusa add item failed (${res.status}): ${text}` }
    }

    const json = await res.json()
    return { data: json.cart ?? json, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('addItemToCart error:', message)
    return { data: null, error: message }
  }
}

// ---------------------------------------------------------------------------
// updateCartItem -- update quantity of an existing line item
// ---------------------------------------------------------------------------

/**
 * Update the quantity of a line item in a Medusa cart.
 */
export async function updateCartItem(
  cartId: string,
  lineItemId: string,
  input: { quantity: number }
): Promise<CartResult> {
  try {
    const res = await cartMedusaFetch(
      `/store/carts/${cartId}/line-items/${lineItemId}`,
      {
        method: 'POST',
        body: JSON.stringify({ quantity: input.quantity }),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('updateCartItem failed:', res.status, text)
      return { data: null, error: `Medusa update item failed (${res.status}): ${text}` }
    }

    const json = await res.json()
    return { data: json.cart ?? json, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('updateCartItem error:', message)
    return { data: null, error: message }
  }
}

// ---------------------------------------------------------------------------
// removeCartItem -- remove a line item from a cart
// ---------------------------------------------------------------------------

/**
 * Remove a line item from a Medusa cart.
 */
export async function removeCartItem(
  cartId: string,
  lineItemId: string
): Promise<CartResult> {
  try {
    const res = await cartMedusaFetch(
      `/store/carts/${cartId}/line-items/${lineItemId}`,
      { method: 'DELETE' }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('removeCartItem failed:', res.status, text)
      return { data: null, error: `Medusa remove item failed (${res.status}): ${text}` }
    }

    const json = await res.json()
    return { data: json.cart ?? json, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('removeCartItem error:', message)
    return { data: null, error: message }
  }
}

// ---------------------------------------------------------------------------
// getCart -- retrieve a cart with items and totals
// ---------------------------------------------------------------------------

/**
 * Retrieve a Medusa cart by ID, including its line items and computed totals.
 */
export async function getCart(cartId: string): Promise<CartResult> {
  try {
    const res = await cartMedusaFetch(`/store/carts/${cartId}`, {
      method: 'GET',
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('getCart failed:', res.status, text)
      return { data: null, error: `Medusa get cart failed (${res.status}): ${text}` }
    }

    const json = await res.json()
    return { data: json.cart ?? json, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('getCart error:', message)
    return { data: null, error: message }
  }
}
