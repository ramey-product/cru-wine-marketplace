/**
 * Shopify POS Adapter
 *
 * Implements the POSAdapter interface for Shopify point-of-sale systems.
 * Uses the Shopify Admin REST API (2024-01) to fetch product inventory
 * and maps it to the Cru normalized format for wine matching.
 *
 * Key behaviors:
 * - Uses raw fetch (no Shopify SDK dependency)
 * - Handles cursor-based pagination via the Link header (page_info parameter)
 * - Filters products by product_type and tags for wine-related items
 * - Batch-fetches inventory levels (max 50 inventory_item_ids per request)
 * - Uses the RateLimiter for all API calls (Shopify: 2 req/sec leaky bucket)
 * - Does NOT write to the database — returns parsed items
 */

import type {
  POSAdapter,
  POSCredentials,
  POSInventoryItem,
  SyncResult,
  SyncOptions,
  ShopifyCredentials,
} from './types'
import { RateLimiter, RateLimitExhaustedError } from './rate-limiter'

// ---------------------------------------------------------------------------
// Shopify API response types (subset of what the Admin REST API returns)
// ---------------------------------------------------------------------------

/** A single product from the Shopify Admin API. */
interface ShopifyProduct {
  id: number
  title?: string
  body_html?: string
  product_type?: string
  tags?: string
  vendor?: string
  updated_at?: string
  variants?: ShopifyVariant[]
  status?: string
}

/** A single variant of a Shopify product. */
interface ShopifyVariant {
  id: number
  product_id: number
  title?: string
  sku?: string
  price?: string
  inventory_item_id?: number
  inventory_quantity?: number
}

/** Response from the Shopify Products endpoint. */
interface ShopifyProductsResponse {
  products?: ShopifyProduct[]
}

/** A single inventory level from the Shopify Inventory API. */
interface ShopifyInventoryLevel {
  inventory_item_id: number
  location_id: number
  available?: number | null
}

/** Response from the Shopify Inventory Levels endpoint. */
interface ShopifyInventoryLevelsResponse {
  inventory_levels?: ShopifyInventoryLevel[]
}

/** Response from the Shopify Shop endpoint (for connection test). */
interface ShopifyShopResponse {
  shop?: {
    id: number
    name?: string
    domain?: string
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHOPIFY_API_VERSION = '2024-01'

/**
 * Keywords used to identify wine-related product types and tags in Shopify.
 * Case-insensitive matching against product_type and tags.
 */
const WINE_CATEGORY_KEYWORDS = [
  'wine',
  'wines',
  'red wine',
  'white wine',
  'rose',
  'ros\u00e9',
  'sparkling',
  'champagne',
  'dessert wine',
  'fortified',
  'natural wine',
  'orange wine',
] as const

/**
 * Keywords that indicate an item is NOT wine even if it has wine tags.
 * Used to filter out accessories, glassware, etc.
 */
const NON_WINE_KEYWORDS = [
  'glass',
  'glasses',
  'opener',
  'corkscrew',
  'decanter',
  'stopper',
  'wine rack',
  'gift card',
  'tasting fee',
  'tasting ticket',
  'merchandise',
  'tote',
  'bag',
] as const

/**
 * Maximum number of inventory item IDs per batch request.
 * Shopify limits the inventory_levels endpoint to 50 IDs per call.
 */
const SHOPIFY_INVENTORY_BATCH_SIZE = 50

/**
 * Maximum number of products per page from Shopify's Products endpoint.
 * Shopify caps the `limit` parameter at 250.
 */
const SHOPIFY_PRODUCTS_PAGE_LIMIT = 250

// ---------------------------------------------------------------------------
// ShopifyAdapter
// ---------------------------------------------------------------------------

/**
 * POS adapter for Shopify stores using the Admin REST API.
 *
 * Fetches products from the Shopify catalog, filters for wine-related items
 * by product_type and tags, resolves inventory levels per variant, and
 * returns normalized POSInventoryItem entries for the wine match queue.
 */
export class ShopifyAdapter implements POSAdapter {
  readonly posType = 'shopify' as const

  private readonly rateLimiter: RateLimiter

  constructor() {
    // Shopify Admin API rate limit: 2 requests/second (leaky bucket).
    // We use a conservative base delay with 3 retries.
    this.rateLimiter = new RateLimiter({
      maxRetries: 3,
      baseDelayMs: 500,
      maxDelayMs: 30_000,
      jitterFactor: 1,
      retryableStatusCodes: [429, 500, 502, 503, 504],
    })
  }

  // -------------------------------------------------------------------------
  // fullSync — fetch all products
  // -------------------------------------------------------------------------

  /**
   * Full inventory pull from the Shopify store.
   *
   * Pipeline:
   * 1. Fetch all products (paginated via Link header)
   * 2. Filter for wine products by product_type and tags
   * 3. Batch-fetch inventory levels for all variant inventory_item_ids
   * 4. Parse each variant into a normalized POSInventoryItem
   */
  async fullSync(
    retailerId: string,
    credentials: POSCredentials,
    options?: SyncOptions
  ): Promise<SyncResult> {
    const startTime = Date.now()
    const shopifyCreds = this.assertShopifyCredentials(credentials)
    const baseUrl = this.getBaseUrl(shopifyCreds)

    const errors: Array<{ item: string; error: string }> = []
    const allItems: POSInventoryItem[] = []
    let recordsProcessed = 0
    let recordsFailed = 0

    try {
      // Step 1: Fetch all products, paginating through results
      const rawProducts = await this.fetchAllProducts(
        shopifyCreds,
        baseUrl,
        options?.maxItems
      )

      // Step 2: Filter for wine products
      const wineProducts = rawProducts.filter((product) =>
        this.isWineProduct(product)
      )

      // Step 3: Collect all inventory_item_ids from variants and batch-fetch levels
      const inventoryItemIds = this.extractInventoryItemIds(wineProducts)
      const inventoryLevels = inventoryItemIds.length > 0
        ? await this.fetchInventoryLevels(shopifyCreds, baseUrl, inventoryItemIds)
        : new Map<number, number>()

      // Step 4: Parse each variant into a normalized item
      for (const product of wineProducts) {
        recordsProcessed++

        const variants = product.variants ?? []
        if (variants.length === 0) {
          // Products without variants are unusual but possible
          const parsed = this.parseInventoryItem(product)
          if (parsed) {
            allItems.push(parsed)
          }
          continue
        }

        // Each variant becomes a separate inventory item
        for (const variant of variants) {
          const parsed = this.parseVariant(product, variant, inventoryLevels)
          if (parsed) {
            if (
              options?.includeOutOfStock === false &&
              parsed.quantity === 0
            ) {
              continue
            }
            allItems.push(parsed)
          } else {
            recordsFailed++
            errors.push({
              item: String(variant.id ?? product.id ?? 'unknown'),
              error: 'Failed to parse variant',
            })
          }
        }
      }

      const durationMs = Date.now() - startTime

      return {
        status: recordsFailed > 0 && allItems.length > 0 ? 'partial' : 'completed',
        recordsProcessed,
        recordsCreated: allItems.length,
        recordsUpdated: 0, // Adapter does not know about existing records
        recordsFailed,
        errors: errors.length > 0 ? errors : undefined,
        durationMs,
        items: allItems,
      }
    } catch (err) {
      const durationMs = Date.now() - startTime
      const errorMessage =
        err instanceof RateLimitExhaustedError
          ? `Shopify API rate limit exceeded: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Unknown error during Shopify full sync'

      console.error(
        `ShopifyAdapter.fullSync failed for retailer ${retailerId}:`,
        errorMessage
      )

      return {
        status: allItems.length > 0 ? 'partial' : 'failed',
        recordsProcessed,
        recordsCreated: allItems.length,
        recordsUpdated: 0,
        recordsFailed: recordsFailed + 1,
        errors: [
          ...(errors.length > 0 ? errors : []),
          { item: 'sync', error: errorMessage },
        ],
        durationMs,
        items: allItems,
      }
    }
  }

  // -------------------------------------------------------------------------
  // incrementalSync — fetch products changed since a given date
  // -------------------------------------------------------------------------

  /**
   * Incremental sync from the Shopify store.
   *
   * Fetches only products updated after the `since` timestamp using the
   * `updated_at_min` query parameter. Same pipeline as fullSync but
   * narrowed to changed products.
   */
  async incrementalSync(
    retailerId: string,
    credentials: POSCredentials,
    since: Date,
    options?: SyncOptions
  ): Promise<SyncResult> {
    const startTime = Date.now()
    const shopifyCreds = this.assertShopifyCredentials(credentials)
    const baseUrl = this.getBaseUrl(shopifyCreds)

    const errors: Array<{ item: string; error: string }> = []
    const allItems: POSInventoryItem[] = []
    let recordsProcessed = 0
    let recordsFailed = 0

    try {
      // Step 1: Fetch products updated since the given timestamp
      const rawProducts = await this.fetchProductsSince(
        shopifyCreds,
        baseUrl,
        since,
        options?.maxItems
      )

      // Step 2: Filter for wine products
      const wineProducts = rawProducts.filter((product) =>
        this.isWineProduct(product)
      )

      // Step 3: Batch-fetch inventory levels for changed variants
      const inventoryItemIds = this.extractInventoryItemIds(wineProducts)
      const inventoryLevels = inventoryItemIds.length > 0
        ? await this.fetchInventoryLevels(shopifyCreds, baseUrl, inventoryItemIds)
        : new Map<number, number>()

      // Step 4: Parse each variant
      for (const product of wineProducts) {
        recordsProcessed++

        const variants = product.variants ?? []
        if (variants.length === 0) {
          const parsed = this.parseInventoryItem(product)
          if (parsed) {
            allItems.push(parsed)
          }
          continue
        }

        for (const variant of variants) {
          const parsed = this.parseVariant(product, variant, inventoryLevels)
          if (parsed) {
            if (
              options?.includeOutOfStock === false &&
              parsed.quantity === 0
            ) {
              continue
            }
            allItems.push(parsed)
          } else {
            recordsFailed++
            errors.push({
              item: String(variant.id ?? product.id ?? 'unknown'),
              error: 'Failed to parse variant',
            })
          }
        }
      }

      const durationMs = Date.now() - startTime

      return {
        status: recordsFailed > 0 && allItems.length > 0 ? 'partial' : 'completed',
        recordsProcessed,
        recordsCreated: allItems.length,
        recordsUpdated: 0,
        recordsFailed,
        errors: errors.length > 0 ? errors : undefined,
        durationMs,
        items: allItems,
      }
    } catch (err) {
      const durationMs = Date.now() - startTime
      const errorMessage =
        err instanceof RateLimitExhaustedError
          ? `Shopify API rate limit exceeded: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Unknown error during Shopify incremental sync'

      console.error(
        `ShopifyAdapter.incrementalSync failed for retailer ${retailerId}:`,
        errorMessage
      )

      return {
        status: allItems.length > 0 ? 'partial' : 'failed',
        recordsProcessed,
        recordsCreated: allItems.length,
        recordsUpdated: 0,
        recordsFailed: recordsFailed + 1,
        errors: [
          ...(errors.length > 0 ? errors : []),
          { item: 'sync', error: errorMessage },
        ],
        durationMs,
        items: allItems,
      }
    }
  }

  // -------------------------------------------------------------------------
  // parseInventoryItem — parse a raw Shopify product
  // -------------------------------------------------------------------------

  /**
   * Parse a raw Shopify Product object into a POSInventoryItem.
   * Uses the first variant if present. Returns null if the product is not
   * parseable as a wine product.
   */
  parseInventoryItem(rawItem: unknown): POSInventoryItem | null {
    if (!rawItem || typeof rawItem !== 'object') return null

    const product = rawItem as ShopifyProduct

    // Skip draft or archived products
    if (product.status && product.status !== 'active') return null

    const name = product.title?.trim()
    if (!name) return null

    // Check if this looks like a non-wine item
    if (this.isNonWineItem(name)) return null

    // Use the first variant for price/SKU
    const firstVariant = product.variants?.[0]

    const price = this.dollarsToCents(firstVariant?.price)
    const sku = firstVariant?.sku?.trim() || undefined

    // Extract producer from vendor field if available
    const rawProducer = product.vendor?.trim() || undefined

    // Attempt to extract wine metadata from the name
    const { wineName, producer, vintage, varietal } =
      this.extractWineMetadata(name)

    return {
      rawWineName: wineName,
      rawProducer: rawProducer ?? producer ?? undefined,
      rawVintage: vintage ?? undefined,
      rawVarietal: varietal ?? undefined,
      sku,
      price,
      quantity: Math.max(0, firstVariant?.inventory_quantity ?? 0),
    }
  }

  // -------------------------------------------------------------------------
  // testConnection — validate Shopify credentials
  // -------------------------------------------------------------------------

  /**
   * Validate Shopify credentials by fetching shop info.
   * Makes a lightweight GET /admin/api/{version}/shop.json request.
   */
  async testConnection(credentials: POSCredentials): Promise<boolean> {
    const shopifyCreds = this.assertShopifyCredentials(credentials)
    const baseUrl = this.getBaseUrl(shopifyCreds)

    try {
      const response = await this.rateLimiter.execute(() =>
        fetch(`${baseUrl}/shop.json`, {
          method: 'GET',
          headers: this.buildHeaders(shopifyCreds),
        })
      )

      if (!response.ok) return false

      const body = (await response.json()) as ShopifyShopResponse
      return !!body.shop?.id
    } catch {
      return false
    }
  }

  // -------------------------------------------------------------------------
  // Private: API call helpers
  // -------------------------------------------------------------------------

  /**
   * Fetch all products from the Shopify store, paginating via the Link header.
   *
   * Shopify uses cursor-based pagination with a `Link` response header:
   * `<...?page_info=ABC>; rel="next"`
   *
   * We follow the `rel="next"` link until there are no more pages.
   */
  private async fetchAllProducts(
    creds: ShopifyCredentials,
    baseUrl: string,
    maxItems?: number
  ): Promise<ShopifyProduct[]> {
    const products: ShopifyProduct[] = []
    let nextUrl: string | null = `${baseUrl}/products.json?limit=${SHOPIFY_PRODUCTS_PAGE_LIMIT}`

    do {
      const response = await this.rateLimiter.execute(() =>
        fetch(nextUrl!, {
          method: 'GET',
          headers: this.buildHeaders(creds),
        })
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(
          `Shopify Products fetch failed (HTTP ${response.status}): ${errorText}`
        )
      }

      const body = (await response.json()) as ShopifyProductsResponse

      for (const product of body.products ?? []) {
        products.push(product)
        if (maxItems && products.length >= maxItems) return products
      }

      // Extract the next page URL from the Link header
      nextUrl = this.extractNextPageUrl(response.headers.get('Link'))
    } while (nextUrl)

    return products
  }

  /**
   * Fetch products updated since a given date using `updated_at_min`.
   *
   * Uses the same cursor-based pagination as fetchAllProducts but adds
   * the `updated_at_min` query parameter to narrow results.
   */
  private async fetchProductsSince(
    creds: ShopifyCredentials,
    baseUrl: string,
    since: Date,
    maxItems?: number
  ): Promise<ShopifyProduct[]> {
    const products: ShopifyProduct[] = []
    const sinceISO = since.toISOString()
    let nextUrl: string | null =
      `${baseUrl}/products.json?limit=${SHOPIFY_PRODUCTS_PAGE_LIMIT}&updated_at_min=${encodeURIComponent(sinceISO)}`

    do {
      const response = await this.rateLimiter.execute(() =>
        fetch(nextUrl!, {
          method: 'GET',
          headers: this.buildHeaders(creds),
        })
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(
          `Shopify Products fetch (incremental) failed (HTTP ${response.status}): ${errorText}`
        )
      }

      const body = (await response.json()) as ShopifyProductsResponse

      for (const product of body.products ?? []) {
        products.push(product)
        if (maxItems && products.length >= maxItems) return products
      }

      // Extract the next page URL from the Link header
      nextUrl = this.extractNextPageUrl(response.headers.get('Link'))
    } while (nextUrl)

    return products
  }

  /**
   * Batch-fetch inventory levels for a list of inventory_item_ids.
   *
   * Shopify limits the inventory_levels endpoint to 50 IDs per request.
   * Returns a Map of inventory_item_id -> total available quantity
   * (summed across all locations).
   */
  private async fetchInventoryLevels(
    creds: ShopifyCredentials,
    baseUrl: string,
    inventoryItemIds: number[]
  ): Promise<Map<number, number>> {
    const levels = new Map<number, number>()

    for (let i = 0; i < inventoryItemIds.length; i += SHOPIFY_INVENTORY_BATCH_SIZE) {
      const batch = inventoryItemIds.slice(i, i + SHOPIFY_INVENTORY_BATCH_SIZE)
      const idsParam = batch.join(',')

      const url = `${baseUrl}/inventory_levels.json?inventory_item_ids=${idsParam}`

      const response = await this.rateLimiter.execute(() =>
        fetch(url, {
          method: 'GET',
          headers: this.buildHeaders(creds),
        })
      )

      if (!response.ok) {
        console.error(
          `ShopifyAdapter: failed to fetch inventory levels (HTTP ${response.status})`
        )
        continue
      }

      const body = (await response.json()) as ShopifyInventoryLevelsResponse

      for (const level of body.inventory_levels ?? []) {
        const available = level.available ?? 0
        const existing = levels.get(level.inventory_item_id) ?? 0
        levels.set(level.inventory_item_id, existing + available)
      }
    }

    return levels
  }

  // -------------------------------------------------------------------------
  // Private: Parsing helpers
  // -------------------------------------------------------------------------

  /**
   * Parse a single variant of a Shopify product into a POSInventoryItem.
   * Combines product-level data (title, vendor, tags) with variant-level
   * data (price, SKU) and inventory levels.
   */
  private parseVariant(
    product: ShopifyProduct,
    variant: ShopifyVariant,
    inventoryLevels: Map<number, number>
  ): POSInventoryItem | null {
    const name = product.title?.trim()
    if (!name) return null

    if (this.isNonWineItem(name)) return null

    const price = this.dollarsToCents(variant.price)
    const sku = variant.sku?.trim() || undefined

    // Resolve inventory: prefer batch-fetched levels, fall back to variant quantity
    let quantity = 0
    if (variant.inventory_item_id && inventoryLevels.has(variant.inventory_item_id)) {
      quantity = inventoryLevels.get(variant.inventory_item_id) ?? 0
    } else {
      quantity = variant.inventory_quantity ?? 0
    }

    // Build the full name: "Product Title - Variant Title" if variant has a
    // name that isn't just "Default Title" or the same as the product title
    const variantTitle = variant.title?.trim()
    const fullName =
      variantTitle &&
      variantTitle !== 'Default Title' &&
      variantTitle.toLowerCase() !== name.toLowerCase()
        ? `${name} - ${variantTitle}`
        : name

    // Extract producer from vendor field
    const rawProducer = product.vendor?.trim() || undefined

    const { wineName, producer, vintage, varietal } =
      this.extractWineMetadata(fullName)

    return {
      rawWineName: wineName,
      rawProducer: rawProducer ?? producer ?? undefined,
      rawVintage: vintage ?? undefined,
      rawVarietal: varietal ?? undefined,
      sku,
      price,
      quantity: Math.max(0, Math.floor(quantity)),
    }
  }

  /**
   * Extract wine metadata from a product name string.
   *
   * Wine product names in POS systems often follow patterns like:
   * - "Chateau Margaux 2015 Cabernet Sauvignon"
   * - "Opus One 2018"
   * - "Penfolds Grange Shiraz 2017"
   *
   * This method attempts to pull out vintage and varietal from the name,
   * leaving the rest as the wine name (which may include the producer).
   */
  private extractWineMetadata(name: string): {
    wineName: string
    producer: string | null
    vintage: string | null
    varietal: string | null
  } {
    let wineName = name
    let vintage: string | null = null
    let varietal: string | null = null

    // Extract 4-digit vintage year (1900-2099)
    const vintageMatch = name.match(/\b((?:19|20)\d{2})\b/)
    if (vintageMatch) {
      vintage = vintageMatch[1]
      // Remove the vintage from the wine name
      wineName = wineName.replace(vintageMatch[0], '').trim()
    }

    // Check for common varietals in the name
    const varietalPatterns = [
      'cabernet sauvignon',
      'cabernet franc',
      'pinot noir',
      'pinot grigio',
      'pinot gris',
      'sauvignon blanc',
      'chardonnay',
      'merlot',
      'syrah',
      'shiraz',
      'malbec',
      'tempranillo',
      'sangiovese',
      'nebbiolo',
      'riesling',
      'gewurztraminer',
      'viognier',
      'grenache',
      'mourvedre',
      'zinfandel',
      'petite sirah',
      'petit verdot',
      'chenin blanc',
      'gruner veltliner',
      'albarino',
      'verdejo',
      'garnacha',
      'barbera',
      'dolcetto',
      'prosecco',
      'champagne',
      'cava',
      'moscato',
      'muscat',
    ]

    const lowerName = wineName.toLowerCase()
    for (const v of varietalPatterns) {
      if (lowerName.includes(v)) {
        // Capitalize the varietal properly
        varietal = v
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
        break
      }
    }

    // Clean up extra whitespace and trailing/leading separators
    wineName = wineName
      .replace(/\s{2,}/g, ' ')
      .replace(/^[\s,\-|]+|[\s,\-|]+$/g, '')
      .trim()

    // We don't attempt to separate producer from wine name here because
    // that requires knowledge of the wine database. The matching engine
    // (wine-matcher.ts) handles producer matching via trigram similarity.
    return {
      wineName,
      producer: null,
      vintage,
      varietal,
    }
  }

  /**
   * Extract all inventory_item_ids from a list of Shopify products.
   * Used to batch-fetch inventory levels.
   */
  private extractInventoryItemIds(products: ShopifyProduct[]): number[] {
    const ids: number[] = []
    for (const product of products) {
      for (const variant of product.variants ?? []) {
        if (variant.inventory_item_id) {
          ids.push(variant.inventory_item_id)
        }
      }
    }
    return ids
  }

  /**
   * Check whether a Shopify product is wine-related.
   *
   * A product is considered wine if:
   * 1. Its product_type contains a wine-related keyword, OR
   * 2. Any of its tags contain a wine-related keyword
   *
   * AND the product name does not match non-wine keywords (accessories, etc.).
   */
  private isWineProduct(product: ShopifyProduct): boolean {
    const name = product.title?.trim() ?? ''

    // First, exclude non-wine items by name
    if (this.isNonWineItem(name)) return false

    // Check product_type
    const productType = (product.product_type ?? '').toLowerCase()
    if (productType && this.containsWineKeyword(productType)) {
      return true
    }

    // Check tags (Shopify tags are a comma-separated string)
    const tags = (product.tags ?? '').toLowerCase()
    if (tags && this.containsWineKeyword(tags)) {
      return true
    }

    // If no product_type or tags match, check if the name itself suggests wine
    // This is a fallback for stores that don't use product_type or tags consistently
    if (this.containsWineKeyword(name.toLowerCase())) {
      return true
    }

    return false
  }

  /**
   * Check whether a string contains a wine-related keyword.
   */
  private containsWineKeyword(text: string): boolean {
    return WINE_CATEGORY_KEYWORDS.some(
      (keyword) => text === keyword || text.includes(keyword)
    )
  }

  /**
   * Check whether an item name indicates a non-wine product.
   * Used to filter out accessories and services.
   */
  private isNonWineItem(name: string): boolean {
    const lower = name.toLowerCase()
    return NON_WINE_KEYWORDS.some((keyword) => lower.includes(keyword))
  }

  /**
   * Convert a dollar amount string (e.g., "29.99") to cents (integer).
   * Returns 0 if the value is not a valid number.
   */
  private dollarsToCents(value: string | undefined | null): number {
    if (!value) return 0
    const parsed = parseFloat(value)
    if (isNaN(parsed)) return 0
    return Math.round(parsed * 100)
  }

  // -------------------------------------------------------------------------
  // Private: Pagination helpers
  // -------------------------------------------------------------------------

  /**
   * Extract the next page URL from a Shopify Link header.
   *
   * Shopify uses the RFC 5988 Link header for cursor-based pagination:
   *   <https://store.myshopify.com/admin/api/2024-01/products.json?page_info=ABC>; rel="next"
   *
   * Returns the full URL for the next page, or null if no next page exists.
   */
  private extractNextPageUrl(linkHeader: string | null): string | null {
    if (!linkHeader) return null

    // The Link header may contain multiple entries separated by commas:
    // <url1>; rel="previous", <url2>; rel="next"
    const parts = linkHeader.split(',')

    for (const part of parts) {
      const trimmed = part.trim()
      // Look for the rel="next" entry
      if (trimmed.includes('rel="next"')) {
        // Extract URL from angle brackets: <url>
        const urlMatch = trimmed.match(/<([^>]+)>/)
        if (urlMatch) {
          return urlMatch[1]
        }
      }
    }

    return null
  }

  // -------------------------------------------------------------------------
  // Private: HTTP helpers
  // -------------------------------------------------------------------------

  /**
   * Build standard headers for Shopify Admin API requests.
   * Uses the X-Shopify-Access-Token header for authentication.
   */
  private buildHeaders(creds: ShopifyCredentials): Record<string, string> {
    return {
      'X-Shopify-Access-Token': creds.access_token,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Get the Shopify Admin API base URL for the given shop.
   * Format: https://{shop_domain}/admin/api/{version}
   */
  private getBaseUrl(creds: ShopifyCredentials): string {
    // Ensure the shop domain doesn't already include the protocol
    const domain = creds.shop_domain.replace(/^https?:\/\//, '')
    return `https://${domain}/admin/api/${SHOPIFY_API_VERSION}`
  }

  /**
   * Assert that the provided credentials are ShopifyCredentials.
   * Throws if the credential type does not match.
   */
  private assertShopifyCredentials(
    credentials: POSCredentials
  ): ShopifyCredentials {
    if (credentials.type !== 'shopify') {
      throw new Error(
        `ShopifyAdapter received credentials of type "${credentials.type}"; expected "shopify"`
      )
    }
    return credentials
  }
}
