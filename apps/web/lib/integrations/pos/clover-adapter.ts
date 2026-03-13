/**
 * Clover POS Adapter
 *
 * Implements the POSAdapter interface for Clover point-of-sale systems.
 * Uses the Clover REST API (v3) to fetch merchant inventory items and
 * maps them to the Cru normalized format for wine matching.
 *
 * Key behaviors:
 * - Uses raw fetch (no Clover SDK dependency)
 * - Handles offset-based pagination (max 100 items per page)
 * - Expands categories and itemStock inline for efficient fetching
 * - Filters items by category name for wine-related products
 * - Uses the RateLimiter for all API calls (Clover: 16 req/sec per app)
 * - Does NOT write to the database — returns parsed items
 */

import type {
  POSAdapter,
  POSCredentials,
  POSInventoryItem,
  SyncResult,
  SyncOptions,
  CloverCredentials,
} from './types'
import { RateLimiter, RateLimitExhaustedError } from './rate-limiter'

// ---------------------------------------------------------------------------
// Clover API response types (subset of what the REST API returns)
// ---------------------------------------------------------------------------

/** Top-level response from the Clover Items endpoint. */
interface CloverItemsResponse {
  elements?: CloverItem[]
  href?: string
}

/** A single item from the Clover REST API. */
interface CloverItem {
  id?: string
  name?: string
  alternateName?: string
  sku?: string
  price?: number
  priceType?: string
  hidden?: boolean
  modifiedTime?: number
  categories?: {
    elements?: CloverCategory[]
  }
  itemStock?: {
    quantity?: number
    stockCount?: number
  }
}

/** A category from the Clover REST API. */
interface CloverCategory {
  id?: string
  name?: string
}

/** Response from the Clover Merchant endpoint (for connection test). */
interface CloverMerchantResponse {
  id?: string
  name?: string
  owner?: {
    id?: string
    name?: string
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CLOVER_PRODUCTION_URL = 'https://api.clover.com'
const CLOVER_SANDBOX_URL = 'https://apisandbox.dev.clover.com'

/**
 * Maximum items per page in Clover API responses.
 * Clover caps the `limit` parameter at 100.
 */
const CLOVER_PAGE_LIMIT = 100

/**
 * Keywords used to identify wine-related categories in Clover.
 * Case-insensitive matching against category names.
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
 * Keywords that indicate an item is NOT wine even if it's in a wine category.
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

// ---------------------------------------------------------------------------
// CloverAdapter
// ---------------------------------------------------------------------------

/**
 * POS adapter for Clover merchants using the REST API (v3).
 *
 * Fetches items from the Clover inventory with category and stock expansions,
 * filters for wine-related items by category names, and returns normalized
 * POSInventoryItem entries for the wine match queue.
 */
export class CloverAdapter implements POSAdapter {
  readonly posType = 'clover' as const

  private readonly rateLimiter: RateLimiter

  constructor() {
    // Clover API rate limit: 16 requests/second per app (generous).
    // We still use the RateLimiter with a conservative config for resilience.
    this.rateLimiter = new RateLimiter({
      maxRetries: 3,
      baseDelayMs: 300,
      maxDelayMs: 30_000,
      jitterFactor: 1,
      retryableStatusCodes: [429, 500, 502, 503, 504],
    })
  }

  // -------------------------------------------------------------------------
  // fullSync — fetch all items
  // -------------------------------------------------------------------------

  /**
   * Full inventory pull from the Clover merchant.
   *
   * Pipeline:
   * 1. Fetch all items with category and stock expansions
   * 2. Filter for wine items by category names
   * 3. Parse each item into a normalized POSInventoryItem
   */
  async fullSync(
    retailerId: string,
    credentials: POSCredentials,
    options?: SyncOptions
  ): Promise<SyncResult> {
    const startTime = Date.now()
    const cloverCreds = this.assertCloverCredentials(credentials)
    const baseUrl = this.getBaseUrl(cloverCreds)

    const errors: Array<{ item: string; error: string }> = []
    const allItems: POSInventoryItem[] = []
    let recordsProcessed = 0
    let recordsFailed = 0

    try {
      // Step 1: Fetch all items with category and stock expansions
      const rawItems = await this.fetchAllItems(
        cloverCreds,
        baseUrl,
        options?.maxItems
      )

      // Step 2: Filter for wine items and parse
      for (const rawItem of rawItems) {
        recordsProcessed++

        // Filter by category — only process items in wine categories
        if (!this.isWineItem(rawItem)) {
          continue
        }

        try {
          const parsed = this.parseInventoryItem(rawItem)
          if (parsed) {
            if (
              options?.includeOutOfStock === false &&
              parsed.quantity === 0
            ) {
              continue
            }
            allItems.push(parsed)
          }
        } catch {
          recordsFailed++
          errors.push({
            item: rawItem.id ?? 'unknown',
            error: 'Failed to parse item',
          })
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
          ? `Clover API rate limit exceeded: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Unknown error during Clover full sync'

      console.error(
        `CloverAdapter.fullSync failed for retailer ${retailerId}:`,
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
  // incrementalSync — fetch items changed since a given date
  // -------------------------------------------------------------------------

  /**
   * Incremental sync from the Clover merchant.
   *
   * Fetches only items modified after the `since` timestamp using the
   * `modifiedTime` filter parameter (epoch milliseconds).
   */
  async incrementalSync(
    retailerId: string,
    credentials: POSCredentials,
    since: Date,
    options?: SyncOptions
  ): Promise<SyncResult> {
    const startTime = Date.now()
    const cloverCreds = this.assertCloverCredentials(credentials)
    const baseUrl = this.getBaseUrl(cloverCreds)

    const errors: Array<{ item: string; error: string }> = []
    const allItems: POSInventoryItem[] = []
    let recordsProcessed = 0
    let recordsFailed = 0

    try {
      // Step 1: Fetch items modified since the given timestamp
      const rawItems = await this.fetchItemsSince(
        cloverCreds,
        baseUrl,
        since,
        options?.maxItems
      )

      // Step 2: Filter for wine items and parse
      for (const rawItem of rawItems) {
        recordsProcessed++

        if (!this.isWineItem(rawItem)) {
          continue
        }

        try {
          const parsed = this.parseInventoryItem(rawItem)
          if (parsed) {
            if (
              options?.includeOutOfStock === false &&
              parsed.quantity === 0
            ) {
              continue
            }
            allItems.push(parsed)
          }
        } catch {
          recordsFailed++
          errors.push({
            item: rawItem.id ?? 'unknown',
            error: 'Failed to parse item',
          })
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
          ? `Clover API rate limit exceeded: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Unknown error during Clover incremental sync'

      console.error(
        `CloverAdapter.incrementalSync failed for retailer ${retailerId}:`,
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
  // parseInventoryItem — parse a raw Clover item
  // -------------------------------------------------------------------------

  /**
   * Parse a raw Clover Item object into a POSInventoryItem.
   * Returns null if the item is hidden, has no name, or is not parseable
   * as a wine product.
   *
   * Clover prices are already in cents (integer), so no conversion is needed.
   */
  parseInventoryItem(rawItem: unknown): POSInventoryItem | null {
    if (!rawItem || typeof rawItem !== 'object') return null

    const item = rawItem as CloverItem

    // Skip hidden items
    if (item.hidden === true) return null

    const name = item.name?.trim()
    if (!name) return null

    // Check if this looks like a non-wine item
    if (this.isNonWineItem(name)) return null

    // Clover prices are in cents (integer)
    const price = item.price ?? 0

    // Extract SKU
    const sku = item.sku?.trim() || undefined

    // Extract quantity from itemStock expansion
    // Clover uses `quantity` or `stockCount` depending on the endpoint
    const quantity = item.itemStock?.quantity ?? item.itemStock?.stockCount ?? 0

    // Attempt to extract wine metadata from the name
    const { wineName, producer, vintage, varietal } =
      this.extractWineMetadata(name)

    return {
      rawWineName: wineName,
      rawProducer: producer ?? undefined,
      rawVintage: vintage ?? undefined,
      rawVarietal: varietal ?? undefined,
      sku,
      price,
      quantity: Math.max(0, Math.floor(quantity)),
    }
  }

  // -------------------------------------------------------------------------
  // testConnection — validate Clover credentials
  // -------------------------------------------------------------------------

  /**
   * Validate Clover credentials by fetching merchant info.
   * Makes a lightweight GET /v3/merchants/{merchant_id} request.
   */
  async testConnection(credentials: POSCredentials): Promise<boolean> {
    const cloverCreds = this.assertCloverCredentials(credentials)
    const baseUrl = this.getBaseUrl(cloverCreds)

    try {
      const response = await this.rateLimiter.execute(() =>
        fetch(`${baseUrl}/v3/merchants/${cloverCreds.merchant_id}`, {
          method: 'GET',
          headers: this.buildHeaders(cloverCreds),
        })
      )

      if (!response.ok) return false

      const body = (await response.json()) as CloverMerchantResponse
      return !!body.id
    } catch {
      return false
    }
  }

  // -------------------------------------------------------------------------
  // Private: API call helpers
  // -------------------------------------------------------------------------

  /**
   * Fetch all items from the Clover merchant with category and stock expansions.
   * Uses offset-based pagination with a maximum of 100 items per page.
   */
  private async fetchAllItems(
    creds: CloverCredentials,
    baseUrl: string,
    maxItems?: number
  ): Promise<CloverItem[]> {
    const items: CloverItem[] = []
    let offset = 0

    do {
      const url = new URL(
        `${baseUrl}/v3/merchants/${creds.merchant_id}/items`
      )
      url.searchParams.set('expand', 'categories,itemStock')
      url.searchParams.set('offset', String(offset))
      url.searchParams.set('limit', String(CLOVER_PAGE_LIMIT))

      const response = await this.rateLimiter.execute(() =>
        fetch(url.toString(), {
          method: 'GET',
          headers: this.buildHeaders(creds),
        })
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(
          `Clover Items fetch failed (HTTP ${response.status}): ${errorText}`
        )
      }

      const body = (await response.json()) as CloverItemsResponse
      const pageItems = body.elements ?? []

      for (const item of pageItems) {
        items.push(item)
        if (maxItems && items.length >= maxItems) return items
      }

      // If we got fewer items than the limit, we've reached the last page
      if (pageItems.length < CLOVER_PAGE_LIMIT) break

      offset += CLOVER_PAGE_LIMIT
    } while (true)

    return items
  }

  /**
   * Fetch items modified since a given date using the `modifiedTime` filter.
   *
   * Clover uses epoch milliseconds for the modifiedTime filter.
   * The filter syntax is: `filter=modifiedTime>={epochMs}`
   */
  private async fetchItemsSince(
    creds: CloverCredentials,
    baseUrl: string,
    since: Date,
    maxItems?: number
  ): Promise<CloverItem[]> {
    const items: CloverItem[] = []
    const sinceEpochMs = since.getTime()
    let offset = 0

    do {
      const url = new URL(
        `${baseUrl}/v3/merchants/${creds.merchant_id}/items`
      )
      url.searchParams.set('expand', 'categories,itemStock')
      url.searchParams.set('filter', `modifiedTime>=${sinceEpochMs}`)
      url.searchParams.set('offset', String(offset))
      url.searchParams.set('limit', String(CLOVER_PAGE_LIMIT))

      const response = await this.rateLimiter.execute(() =>
        fetch(url.toString(), {
          method: 'GET',
          headers: this.buildHeaders(creds),
        })
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(
          `Clover Items fetch (incremental) failed (HTTP ${response.status}): ${errorText}`
        )
      }

      const body = (await response.json()) as CloverItemsResponse
      const pageItems = body.elements ?? []

      for (const item of pageItems) {
        items.push(item)
        if (maxItems && items.length >= maxItems) return items
      }

      // If we got fewer items than the limit, we've reached the last page
      if (pageItems.length < CLOVER_PAGE_LIMIT) break

      offset += CLOVER_PAGE_LIMIT
    } while (true)

    return items
  }

  // -------------------------------------------------------------------------
  // Private: Parsing helpers
  // -------------------------------------------------------------------------

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
   * Check whether a Clover item is wine-related based on its categories.
   *
   * An item is considered wine if:
   * 1. Any of its expanded categories contain a wine-related keyword, OR
   * 2. Its name contains a wine-related keyword (fallback for uncategorized items)
   *
   * AND the item name does not match non-wine keywords (accessories, etc.).
   */
  private isWineItem(item: CloverItem): boolean {
    const name = item.name?.trim() ?? ''

    // First, exclude non-wine items by name
    if (this.isNonWineItem(name)) return false

    // Check expanded categories
    const categories = item.categories?.elements ?? []
    for (const category of categories) {
      const categoryName = (category.name ?? '').toLowerCase()
      if (categoryName && this.isWineCategory(categoryName)) {
        return true
      }
    }

    // Fallback: check if the item name itself suggests wine
    // This catches items that are uncategorized but clearly wine products
    if (this.containsWineKeyword(name.toLowerCase())) {
      return true
    }

    return false
  }

  /**
   * Check whether a category name matches wine-related keywords.
   */
  private isWineCategory(categoryName: string): boolean {
    const lower = categoryName.toLowerCase()
    return WINE_CATEGORY_KEYWORDS.some(
      (keyword) => lower === keyword || lower.includes(keyword)
    )
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

  // -------------------------------------------------------------------------
  // Private: HTTP helpers
  // -------------------------------------------------------------------------

  /**
   * Build standard headers for Clover API requests.
   * Uses Bearer token authentication.
   */
  private buildHeaders(creds: CloverCredentials): Record<string, string> {
    return {
      'Authorization': `Bearer ${creds.access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Get the Clover API base URL.
   *
   * Clover uses different base URLs for production and sandbox.
   * We detect sandbox credentials by checking for the sandbox domain
   * in the merchant_id or by checking the expires_at field (sandbox
   * tokens often have specific patterns). For simplicity, we default
   * to production and check an environment variable for sandbox mode.
   */
  private getBaseUrl(_creds: CloverCredentials): string {
    // Check environment variable to determine if we should use sandbox
    const useSandbox = process.env.CLOVER_ENVIRONMENT === 'sandbox'
    return useSandbox ? CLOVER_SANDBOX_URL : CLOVER_PRODUCTION_URL
  }

  /**
   * Assert that the provided credentials are CloverCredentials.
   * Throws if the credential type does not match.
   */
  private assertCloverCredentials(
    credentials: POSCredentials
  ): CloverCredentials {
    if (credentials.type !== 'clover') {
      throw new Error(
        `CloverAdapter received credentials of type "${credentials.type}"; expected "clover"`
      )
    }
    return credentials
  }
}
