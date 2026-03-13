/**
 * Lightspeed Retail POS Adapter
 *
 * Implements the POSAdapter interface for Lightspeed Retail (R-Series)
 * point-of-sale systems. Uses the Lightspeed Retail API V3 to fetch
 * inventory items and maps them to the Cru normalized format for wine
 * matching.
 *
 * Key behaviors:
 * - Uses raw fetch (no Lightspeed SDK dependency)
 * - Handles offset-based pagination for large catalogs
 * - Filters catalog items for wine-related categories
 * - Uses the RateLimiter for all API calls (leaky bucket: 1 req/sec sustained)
 * - Does NOT write to the database — returns parsed items
 */

import type {
  POSAdapter,
  POSCredentials,
  POSInventoryItem,
  SyncResult,
  SyncOptions,
  LightspeedCredentials,
} from './types'
import { RateLimiter, RateLimitExhaustedError } from './rate-limiter'

// ---------------------------------------------------------------------------
// Lightspeed API response types (subset of what the Retail API returns)
// ---------------------------------------------------------------------------

/** Top-level attributes included in paginated Lightspeed responses. */
interface LightspeedAttributes {
  count: string
  offset: string
  limit: string
}

/** Response from the Item endpoint. Can be an array or single object. */
interface LightspeedItemResponse {
  '@attributes'?: LightspeedAttributes
  Item?: LightspeedItem[] | LightspeedItem
}

/** Response from the Category endpoint. */
interface LightspeedCategoryResponse {
  '@attributes'?: LightspeedAttributes
  Category?: LightspeedCategory[] | LightspeedCategory
}

/** Response from the Account endpoint (for connection test). */
interface LightspeedAccountResponse {
  Account?: {
    accountID: string
    name?: string
  }
}

/** A single item from the Lightspeed Retail API. */
interface LightspeedItem {
  itemID: string
  description: string
  defaultCost: string
  Prices?: {
    ItemPrice?: LightspeedItemPrice[] | LightspeedItemPrice
  }
  ItemShops?: {
    ItemShop?: LightspeedItemShop[] | LightspeedItemShop
  }
  categoryID: string
  manufacturerID?: string
  manufacturer?: {
    name?: string
  }
  customSku?: string
  systemSku?: string
  timeStamp?: string
  archived?: boolean
}

/** Price entry for a Lightspeed item. */
interface LightspeedItemPrice {
  amount: string
  useType: string
}

/** Shop-level inventory data for a Lightspeed item. */
interface LightspeedItemShop {
  qoh: string
  shopID: string
}

/** A category from the Lightspeed Retail API. */
interface LightspeedCategory {
  categoryID: string
  name: string
  parentID?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LIGHTSPEED_BASE_URL = 'https://api.lightspeedapp.com/API/V3/Account'

/**
 * Maximum items per page in Lightspeed API responses.
 * Lightspeed caps the `limit` parameter at 100.
 */
const LIGHTSPEED_PAGE_LIMIT = 100

/**
 * Keywords used to identify wine-related categories in Lightspeed.
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
]

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
]

// ---------------------------------------------------------------------------
// LightspeedAdapter
// ---------------------------------------------------------------------------

export class LightspeedAdapter implements POSAdapter {
  readonly posType = 'lightspeed' as const

  private readonly rateLimiter: RateLimiter

  constructor() {
    // Lightspeed Retail uses a leaky bucket rate limiter:
    // 1 request/second sustained, burst up to 60.
    // We use a conservative base delay with 3 retries.
    this.rateLimiter = new RateLimiter({
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30_000,
      jitterFactor: 1,
      retryableStatusCodes: [429, 500, 502, 503, 504],
    })
  }

  // -------------------------------------------------------------------------
  // fullSync — fetch all catalog items
  // -------------------------------------------------------------------------

  async fullSync(
    retailerId: string,
    credentials: POSCredentials,
    options?: SyncOptions
  ): Promise<SyncResult> {
    const startTime = Date.now()
    const lsCreds = this.assertLightspeedCredentials(credentials)
    const baseUrl = this.getBaseUrl(lsCreds)

    const errors: Array<{ item: string; error: string }> = []
    const allItems: POSInventoryItem[] = []
    let recordsProcessed = 0
    let recordsFailed = 0

    try {
      // Step 1: Fetch wine-related category IDs
      const wineCategoryIds = options?.categoryIds?.length
        ? options.categoryIds
        : await this.fetchWineCategoryIds(lsCreds, baseUrl)

      // Step 2: Fetch all items, paginating through results
      const rawItems = await this.fetchAllItems(
        lsCreds,
        baseUrl,
        wineCategoryIds,
        options?.maxItems
      )

      // Step 3: Parse each item into normalized format
      for (const rawItem of rawItems) {
        recordsProcessed++

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
            item: rawItem.itemID ?? 'unknown',
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
          ? `Lightspeed API rate limit exceeded: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Unknown error during Lightspeed full sync'

      console.error(
        `LightspeedAdapter.fullSync failed for retailer ${retailerId}:`,
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

  async incrementalSync(
    retailerId: string,
    credentials: POSCredentials,
    since: Date,
    options?: SyncOptions
  ): Promise<SyncResult> {
    const startTime = Date.now()
    const lsCreds = this.assertLightspeedCredentials(credentials)
    const baseUrl = this.getBaseUrl(lsCreds)

    const errors: Array<{ item: string; error: string }> = []
    const allItems: POSInventoryItem[] = []
    let recordsProcessed = 0
    let recordsFailed = 0

    try {
      // Step 1: Fetch wine-related category IDs
      const wineCategoryIds = options?.categoryIds?.length
        ? options.categoryIds
        : await this.fetchWineCategoryIds(lsCreds, baseUrl)

      // Step 2: Fetch items modified since the given timestamp
      const rawItems = await this.fetchItemsSince(
        lsCreds,
        baseUrl,
        since,
        wineCategoryIds,
        options?.maxItems
      )

      // Step 3: Parse each item
      for (const rawItem of rawItems) {
        recordsProcessed++

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
            item: rawItem.itemID ?? 'unknown',
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
          ? `Lightspeed API rate limit exceeded: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Unknown error during Lightspeed incremental sync'

      console.error(
        `LightspeedAdapter.incrementalSync failed for retailer ${retailerId}:`,
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
  // parseInventoryItem — parse a raw Lightspeed item
  // -------------------------------------------------------------------------

  /**
   * Parse a raw Lightspeed Item object into a POSInventoryItem.
   * Returns null if the item is archived, has no description, or
   * is not parseable as a wine product.
   */
  parseInventoryItem(rawItem: unknown): POSInventoryItem | null {
    if (!rawItem || typeof rawItem !== 'object') return null

    const item = rawItem as LightspeedItem

    // Skip archived items
    if (item.archived === true) return null

    const name = item.description?.trim()
    if (!name) return null

    // Check if this looks like a non-wine item
    if (this.isNonWineItem(name)) return null

    // Extract price — find the "Default" price type, or use the first available
    const price = this.extractPrice(item)

    // Extract quantity on hand — sum across all shops
    const quantity = this.extractQuantity(item)

    // Extract SKU — prefer customSku, fall back to systemSku
    const sku = item.customSku?.trim() || item.systemSku?.trim() || undefined

    // Extract producer from manufacturer field if available
    const rawProducer = item.manufacturer?.name?.trim() || undefined

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
      quantity: Math.max(0, Math.floor(quantity)),
    }
  }

  // -------------------------------------------------------------------------
  // testConnection — validate Lightspeed credentials
  // -------------------------------------------------------------------------

  async testConnection(credentials: POSCredentials): Promise<boolean> {
    const lsCreds = this.assertLightspeedCredentials(credentials)
    const baseUrl = this.getBaseUrl(lsCreds)

    try {
      const response = await this.rateLimiter.execute(() =>
        fetch(`${baseUrl}.json`, {
          method: 'GET',
          headers: this.buildHeaders(lsCreds),
        })
      )

      if (!response.ok) return false

      const body = (await response.json()) as LightspeedAccountResponse
      return !!body.Account?.accountID
    } catch {
      return false
    }
  }

  // -------------------------------------------------------------------------
  // Private: API call helpers
  // -------------------------------------------------------------------------

  /**
   * Fetch all category IDs that look like wine categories.
   * Uses the Category.json endpoint and matches against wine keywords.
   */
  private async fetchWineCategoryIds(
    creds: LightspeedCredentials,
    baseUrl: string
  ): Promise<string[]> {
    const categoryIds: string[] = []
    let offset = 0

    do {
      const url = new URL(`${baseUrl}/Category.json`)
      url.searchParams.set('offset', String(offset))
      url.searchParams.set('limit', String(LIGHTSPEED_PAGE_LIMIT))

      const response = await this.rateLimiter.execute(() =>
        fetch(url.toString(), {
          method: 'GET',
          headers: this.buildHeaders(creds),
        })
      )

      if (!response.ok) {
        console.error(
          `LightspeedAdapter: failed to fetch categories (HTTP ${response.status})`
        )
        break
      }

      const body = (await response.json()) as LightspeedCategoryResponse

      const categories = this.normalizeToArray(body.Category)

      for (const cat of categories) {
        const categoryName = cat.name?.toLowerCase() ?? ''
        if (this.isWineCategory(categoryName)) {
          categoryIds.push(cat.categoryID)
        }
      }

      // Determine if there are more pages
      const totalCount = parseInt(body['@attributes']?.count ?? '0', 10)
      offset += LIGHTSPEED_PAGE_LIMIT
      if (offset >= totalCount) break
    } while (true)

    return categoryIds
  }

  /**
   * Fetch all Item objects, optionally filtered by wine category IDs.
   * Uses offset-based pagination to fetch all pages.
   */
  private async fetchAllItems(
    creds: LightspeedCredentials,
    baseUrl: string,
    categoryIds: string[],
    maxItems?: number
  ): Promise<LightspeedItem[]> {
    const items: LightspeedItem[] = []

    if (categoryIds.length > 0) {
      // Fetch items for each wine category
      for (const categoryId of categoryIds) {
        let offset = 0

        do {
          const url = new URL(`${baseUrl}/Item.json`)
          url.searchParams.set('categoryID', categoryId)
          url.searchParams.set('offset', String(offset))
          url.searchParams.set('limit', String(LIGHTSPEED_PAGE_LIMIT))
          url.searchParams.set('load_relations', '["ItemShops","Prices","Manufacturer"]')

          const response = await this.rateLimiter.execute(() =>
            fetch(url.toString(), {
              method: 'GET',
              headers: this.buildHeaders(creds),
            })
          )

          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error')
            throw new Error(
              `Lightspeed Item fetch failed (HTTP ${response.status}): ${errorText}`
            )
          }

          const body = (await response.json()) as LightspeedItemResponse
          const pageItems = this.normalizeToArray(body.Item)

          for (const item of pageItems) {
            // Deduplicate by itemID (an item could appear in multiple category fetches)
            if (!items.some((existing) => existing.itemID === item.itemID)) {
              items.push(item)
              if (maxItems && items.length >= maxItems) return items
            }
          }

          // Determine if there are more pages
          const totalCount = parseInt(body['@attributes']?.count ?? '0', 10)
          offset += LIGHTSPEED_PAGE_LIMIT
          if (offset >= totalCount) break
        } while (true)
      }
    } else {
      // No wine categories found — fetch all items and let parseInventoryItem filter
      let offset = 0

      do {
        const url = new URL(`${baseUrl}/Item.json`)
        url.searchParams.set('offset', String(offset))
        url.searchParams.set('limit', String(LIGHTSPEED_PAGE_LIMIT))
        url.searchParams.set('load_relations', '["ItemShops","Prices","Manufacturer"]')

        const response = await this.rateLimiter.execute(() =>
          fetch(url.toString(), {
            method: 'GET',
            headers: this.buildHeaders(creds),
          })
        )

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          throw new Error(
            `Lightspeed Item list failed (HTTP ${response.status}): ${errorText}`
          )
        }

        const body = (await response.json()) as LightspeedItemResponse
        const pageItems = this.normalizeToArray(body.Item)

        for (const item of pageItems) {
          items.push(item)
          if (maxItems && items.length >= maxItems) return items
        }

        // Determine if there are more pages
        const totalCount = parseInt(body['@attributes']?.count ?? '0', 10)
        offset += LIGHTSPEED_PAGE_LIMIT
        if (offset >= totalCount) break
      } while (true)
    }

    return items
  }

  /**
   * Fetch items modified since a given date using the timeStamp filter.
   * Lightspeed supports the `timeStamp=>=,{ISO_DATE}` query parameter
   * to retrieve only items updated after a specific timestamp.
   */
  private async fetchItemsSince(
    creds: LightspeedCredentials,
    baseUrl: string,
    since: Date,
    categoryIds: string[],
    maxItems?: number
  ): Promise<LightspeedItem[]> {
    const items: LightspeedItem[] = []
    const sinceISO = since.toISOString()
    let offset = 0

    do {
      const url = new URL(`${baseUrl}/Item.json`)
      url.searchParams.set('timeStamp', `>=,${sinceISO}`)
      url.searchParams.set('offset', String(offset))
      url.searchParams.set('limit', String(LIGHTSPEED_PAGE_LIMIT))
      url.searchParams.set('load_relations', '["ItemShops","Prices","Manufacturer"]')

      const response = await this.rateLimiter.execute(() =>
        fetch(url.toString(), {
          method: 'GET',
          headers: this.buildHeaders(creds),
        })
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(
          `Lightspeed Item fetch (incremental) failed (HTTP ${response.status}): ${errorText}`
        )
      }

      const body = (await response.json()) as LightspeedItemResponse
      const pageItems = this.normalizeToArray(body.Item)

      for (const item of pageItems) {
        // If we have category IDs, filter to only wine categories
        if (categoryIds.length > 0) {
          if (!categoryIds.includes(item.categoryID)) {
            continue
          }
        }

        items.push(item)
        if (maxItems && items.length >= maxItems) return items
      }

      // Determine if there are more pages
      const totalCount = parseInt(body['@attributes']?.count ?? '0', 10)
      offset += LIGHTSPEED_PAGE_LIMIT
      if (offset >= totalCount) break
    } while (true)

    return items
  }

  // -------------------------------------------------------------------------
  // Private: Parsing helpers
  // -------------------------------------------------------------------------

  /**
   * Extract the retail price from a Lightspeed item's Prices array.
   * Looks for the "Default" price type first, then falls back to the first
   * price entry. Returns price in cents (integer).
   *
   * Lightspeed returns prices as string values (e.g., "29.99"), so we
   * convert to cents by multiplying by 100 and rounding.
   */
  private extractPrice(item: LightspeedItem): number {
    const prices = this.normalizeToArray(item.Prices?.ItemPrice)

    if (prices.length === 0) {
      // Fall back to defaultCost if no prices are set
      return this.dollarsToCents(item.defaultCost)
    }

    // Look for "Default" price type first
    const defaultPrice = prices.find((p) => p.useType === 'Default')
    if (defaultPrice) {
      return this.dollarsToCents(defaultPrice.amount)
    }

    // Fall back to first available price
    return this.dollarsToCents(prices[0]?.amount)
  }

  /**
   * Extract total quantity on hand from a Lightspeed item's ItemShops array.
   * Sums qoh (quantity on hand) across all shop locations.
   */
  private extractQuantity(item: LightspeedItem): number {
    const shops = this.normalizeToArray(item.ItemShops?.ItemShop)

    let totalQoh = 0
    for (const shop of shops) {
      const qoh = parseFloat(shop.qoh ?? '0')
      if (!isNaN(qoh)) {
        totalQoh += qoh
      }
    }

    return totalQoh
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
      vintage = vintageMatch[1] ?? null
      // Remove the vintage from the wine name
      wineName = wineName.replace(vintageMatch[0]!, '').trim()
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
   * Normalize a Lightspeed API response value to an array.
   *
   * Lightspeed returns a single object when there is exactly one result,
   * and an array when there are multiple results. If the value is undefined
   * or null, returns an empty array.
   */
  private normalizeToArray<T>(value: T[] | T | undefined | null): T[] {
    if (value === undefined || value === null) return []
    if (Array.isArray(value)) return value
    return [value]
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
   * Build standard headers for Lightspeed API requests.
   * Uses OAuth2 Bearer token authentication.
   */
  private buildHeaders(creds: LightspeedCredentials): Record<string, string> {
    return {
      'Authorization': `Bearer ${creds.access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Get the Lightspeed API base URL for the given account.
   * The account_id is embedded in the URL path.
   */
  private getBaseUrl(creds: LightspeedCredentials): string {
    return `${LIGHTSPEED_BASE_URL}/${creds.account_id}`
  }

  /**
   * Assert that the provided credentials are LightspeedCredentials.
   * Throws if the credential type does not match.
   */
  private assertLightspeedCredentials(
    credentials: POSCredentials
  ): LightspeedCredentials {
    if (credentials.type !== 'lightspeed') {
      throw new Error(
        `LightspeedAdapter received credentials of type "${credentials.type}"; expected "lightspeed"`
      )
    }
    return credentials
  }
}
