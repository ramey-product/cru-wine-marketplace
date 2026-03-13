/**
 * Square POS Adapter
 *
 * Implements the POSAdapter interface for Square point-of-sale systems.
 * Uses the Square Catalog API (v2) to fetch inventory items and maps
 * them to the Cru normalized format for wine matching.
 *
 * Key behaviors:
 * - Uses raw fetch (no Square SDK dependency)
 * - Handles cursor-based pagination for large catalogs
 * - Filters catalog items for wine-related categories
 * - Uses the RateLimiter for all API calls
 * - Does NOT write to the database — returns parsed items
 */

import type {
  POSAdapter,
  POSCredentials,
  POSInventoryItem,
  SyncResult,
  SyncOptions,
  SquareCredentials,
} from './types'
import { RateLimiter, RateLimitExhaustedError } from './rate-limiter'

// ---------------------------------------------------------------------------
// Square API response types (subset of what the Catalog API returns)
// ---------------------------------------------------------------------------

/** Top-level response from Square's ListCatalog or SearchCatalogObjects. */
interface SquareCatalogResponse {
  objects?: SquareCatalogObject[]
  cursor?: string
  errors?: SquareApiError[]
}

/** A single catalog object from the Square API. */
interface SquareCatalogObject {
  type: string
  id: string
  updated_at?: string
  item_data?: SquareItemData
  item_variation_data?: SquareItemVariationData
  category_data?: SquareCategoryData
}

/** Item-level data within a catalog object. */
interface SquareItemData {
  name?: string
  description?: string
  category_id?: string
  variations?: SquareCatalogObject[]
  /** Product type: 'REGULAR', 'APPOINTMENTS_SERVICE', etc. */
  product_type?: string
}

/** Variation-level data (SKU, price, etc.). */
interface SquareItemVariationData {
  item_id?: string
  name?: string
  sku?: string
  price_money?: SquareMoney
  /** Inventory tracking type: 'NONE' | 'INVENTORY_API' */
  track_inventory?: boolean
}

/** Category data. */
interface SquareCategoryData {
  name?: string
}

/** Square money object — amount is in the smallest denomination (cents for USD). */
interface SquareMoney {
  amount?: number
  currency?: string
}

/** Square API error. */
interface SquareApiError {
  category: string
  code: string
  detail?: string
}

/** Inventory count from Square's Inventory API. */
interface SquareInventoryCount {
  catalog_object_id: string
  quantity?: string
  state?: string
}

/** Response from Square's BatchRetrieveInventoryCounts. */
interface SquareInventoryResponse {
  counts?: SquareInventoryCount[]
  cursor?: string
  errors?: SquareApiError[]
}

/** Response from Square's RetrieveLocation (for connection test). */
interface SquareMerchantResponse {
  merchant?: { id: string; business_name?: string }
  errors?: SquareApiError[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SQUARE_API_VERSION = '2024-01-18'
const SQUARE_PRODUCTION_URL = 'https://connect.squareup.com'
const SQUARE_SANDBOX_URL = 'https://connect.squareupsandbox.com'

/**
 * Keywords used to identify wine-related categories in Square.
 * Case-insensitive matching against category names.
 */
const WINE_CATEGORY_KEYWORDS = [
  'wine',
  'wines',
  'red wine',
  'white wine',
  'rose',
  'rosé',
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
// SquareAdapter
// ---------------------------------------------------------------------------

export class SquareAdapter implements POSAdapter {
  readonly posType = 'square' as const

  private readonly rateLimiter: RateLimiter

  constructor() {
    // Square API rate limit: 10 requests/second for Catalog API.
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
  // fullSync — fetch all catalog items
  // -------------------------------------------------------------------------

  async fullSync(
    retailerId: string,
    credentials: POSCredentials,
    options?: SyncOptions
  ): Promise<SyncResult> {
    const startTime = Date.now()
    const squareCreds = this.assertSquareCredentials(credentials)
    const baseUrl = this.getBaseUrl(squareCreds)

    const errors: Array<{ item: string; error: string }> = []
    const allItems: POSInventoryItem[] = []
    let recordsProcessed = 0
    let recordsFailed = 0

    try {
      // Step 1: Fetch wine-related category IDs
      const wineCategoryIds = options?.categoryIds?.length
        ? options.categoryIds
        : await this.fetchWineCategoryIds(squareCreds, baseUrl)

      // Step 2: Fetch all catalog items, paginating through results
      const rawItems = await this.fetchAllCatalogItems(
        squareCreds,
        baseUrl,
        wineCategoryIds,
        options?.maxItems
      )

      // Step 3: Fetch inventory counts for all variations
      const variationIds = this.extractVariationIds(rawItems)
      const inventoryCounts = variationIds.length > 0
        ? await this.fetchInventoryCounts(squareCreds, baseUrl, variationIds)
        : new Map<string, number>()

      // Step 4: Parse each item into normalized format
      for (const rawItem of rawItems) {
        recordsProcessed++

        const variations = rawItem.item_data?.variations ?? []
        if (variations.length === 0) {
          // Items without variations are unusual but possible
          const parsed = this.parseInventoryItem(rawItem)
          if (parsed) {
            allItems.push(parsed)
          }
          continue
        }

        // Each variation becomes a separate inventory item
        for (const variation of variations) {
          const parsed = this.parseVariation(rawItem, variation, inventoryCounts)
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
              item: variation.id ?? rawItem.id ?? 'unknown',
              error: 'Failed to parse variation',
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
          ? `Square API rate limit exceeded: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Unknown error during Square full sync'

      console.error(
        `SquareAdapter.fullSync failed for retailer ${retailerId}:`,
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
    const squareCreds = this.assertSquareCredentials(credentials)
    const baseUrl = this.getBaseUrl(squareCreds)

    const errors: Array<{ item: string; error: string }> = []
    const allItems: POSInventoryItem[] = []
    let recordsProcessed = 0
    let recordsFailed = 0

    try {
      // Step 1: Fetch wine-related category IDs
      const wineCategoryIds = options?.categoryIds?.length
        ? options.categoryIds
        : await this.fetchWineCategoryIds(squareCreds, baseUrl)

      // Step 2: Use SearchCatalogObjects with begin_time filter
      const rawItems = await this.fetchCatalogItemsSince(
        squareCreds,
        baseUrl,
        since,
        wineCategoryIds,
        options?.maxItems
      )

      // Step 3: Fetch inventory counts for changed variations
      const variationIds = this.extractVariationIds(rawItems)
      const inventoryCounts = variationIds.length > 0
        ? await this.fetchInventoryCounts(squareCreds, baseUrl, variationIds)
        : new Map<string, number>()

      // Step 4: Parse each item
      for (const rawItem of rawItems) {
        recordsProcessed++

        const variations = rawItem.item_data?.variations ?? []
        if (variations.length === 0) {
          const parsed = this.parseInventoryItem(rawItem)
          if (parsed) {
            allItems.push(parsed)
          }
          continue
        }

        for (const variation of variations) {
          const parsed = this.parseVariation(rawItem, variation, inventoryCounts)
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
              item: variation.id ?? rawItem.id ?? 'unknown',
              error: 'Failed to parse variation',
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
          ? `Square API rate limit exceeded: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Unknown error during Square incremental sync'

      console.error(
        `SquareAdapter.incrementalSync failed for retailer ${retailerId}:`,
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
  // parseInventoryItem — parse a raw Square catalog object
  // -------------------------------------------------------------------------

  /**
   * Parse a raw Square CatalogObject (type: ITEM) into a POSInventoryItem.
   * Uses the first variation if present. Returns null if the item is not
   * parseable as a wine product.
   */
  parseInventoryItem(rawItem: unknown): POSInventoryItem | null {
    if (!rawItem || typeof rawItem !== 'object') return null

    const item = rawItem as SquareCatalogObject

    // Only process ITEM type objects
    if (item.type !== 'ITEM' || !item.item_data) return null

    const itemData = item.item_data
    const name = itemData.name?.trim()
    if (!name) return null

    // Check if this looks like a non-wine item
    if (this.isNonWineItem(name)) return null

    // Use the first variation for price/SKU
    const firstVariation = itemData.variations?.[0]
    const variationData = firstVariation?.item_variation_data

    const price = variationData?.price_money?.amount ?? 0
    const sku = variationData?.sku ?? undefined

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
      quantity: 0, // Quantity comes from the Inventory API, not the Catalog
    }
  }

  // -------------------------------------------------------------------------
  // testConnection — validate Square credentials
  // -------------------------------------------------------------------------

  async testConnection(credentials: POSCredentials): Promise<boolean> {
    const squareCreds = this.assertSquareCredentials(credentials)
    const baseUrl = this.getBaseUrl(squareCreds)

    try {
      const response = await this.rateLimiter.execute(() =>
        fetch(`${baseUrl}/v2/merchants/${squareCreds.merchant_id}`, {
          method: 'GET',
          headers: this.buildHeaders(squareCreds),
        })
      )

      if (!response.ok) return false

      const body = (await response.json()) as SquareMerchantResponse
      return !body.errors && !!body.merchant?.id
    } catch {
      return false
    }
  }

  // -------------------------------------------------------------------------
  // Private: API call helpers
  // -------------------------------------------------------------------------

  /**
   * Fetch all category IDs that look like wine categories.
   * Uses the ListCatalog endpoint filtered by type=CATEGORY.
   */
  private async fetchWineCategoryIds(
    creds: SquareCredentials,
    baseUrl: string
  ): Promise<string[]> {
    const categoryIds: string[] = []
    let cursor: string | undefined

    do {
      const url = new URL(`${baseUrl}/v2/catalog/list`)
      url.searchParams.set('types', 'CATEGORY')
      if (cursor) url.searchParams.set('cursor', cursor)

      const response = await this.rateLimiter.execute(() =>
        fetch(url.toString(), {
          method: 'GET',
          headers: this.buildHeaders(creds),
        })
      )

      if (!response.ok) {
        console.error(
          `SquareAdapter: failed to fetch categories (HTTP ${response.status})`
        )
        break
      }

      const body = (await response.json()) as SquareCatalogResponse

      for (const obj of body.objects ?? []) {
        const categoryName = obj.category_data?.name?.toLowerCase() ?? ''
        if (this.isWineCategory(categoryName)) {
          categoryIds.push(obj.id)
        }
      }

      cursor = body.cursor
    } while (cursor)

    return categoryIds
  }

  /**
   * Fetch all ITEM catalog objects, optionally filtered by category.
   * Uses cursor-based pagination to fetch all pages.
   */
  private async fetchAllCatalogItems(
    creds: SquareCredentials,
    baseUrl: string,
    categoryIds: string[],
    maxItems?: number
  ): Promise<SquareCatalogObject[]> {
    const items: SquareCatalogObject[] = []

    // If we have category IDs, use SearchCatalogObjects for filtering.
    // Otherwise, list all ITEM objects and let parseInventoryItem filter.
    if (categoryIds.length > 0) {
      let cursor: string | undefined

      do {
        const body = await this.searchCatalogObjects(
          creds,
          baseUrl,
          {
            object_types: ['ITEM'],
            query: {
              exact_query: {
                attribute_name: 'category_id',
                attribute_value: categoryIds[0],
              },
            },
            include_related_objects: true,
            cursor,
          }
        )

        for (const obj of body.objects ?? []) {
          if (obj.type === 'ITEM') {
            items.push(obj)
            if (maxItems && items.length >= maxItems) return items
          }
        }

        cursor = body.cursor
      } while (cursor)

      // If there are multiple wine categories, fetch from each
      for (let i = 1; i < categoryIds.length; i++) {
        cursor = undefined
        do {
          const body = await this.searchCatalogObjects(
            creds,
            baseUrl,
            {
              object_types: ['ITEM'],
              query: {
                exact_query: {
                  attribute_name: 'category_id',
                  attribute_value: categoryIds[i],
                },
              },
              include_related_objects: true,
              cursor,
            }
          )

          for (const obj of body.objects ?? []) {
            if (obj.type === 'ITEM') {
              // Deduplicate by item ID (an item could be in multiple categories)
              if (!items.some((existing) => existing.id === obj.id)) {
                items.push(obj)
                if (maxItems && items.length >= maxItems) return items
              }
            }
          }

          cursor = body.cursor
        } while (cursor)
      }
    } else {
      // No wine categories found — fetch all ITEM objects and filter by name
      let cursor: string | undefined

      do {
        const url = new URL(`${baseUrl}/v2/catalog/list`)
        url.searchParams.set('types', 'ITEM')
        if (cursor) url.searchParams.set('cursor', cursor)

        const response = await this.rateLimiter.execute(() =>
          fetch(url.toString(), {
            method: 'GET',
            headers: this.buildHeaders(creds),
          })
        )

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          throw new Error(
            `Square ListCatalog failed (HTTP ${response.status}): ${errorText}`
          )
        }

        const body = (await response.json()) as SquareCatalogResponse

        for (const obj of body.objects ?? []) {
          if (obj.type === 'ITEM') {
            // When no category filter, include all items — parseInventoryItem
            // will filter non-wine items downstream
            items.push(obj)
            if (maxItems && items.length >= maxItems) return items
          }
        }

        cursor = body.cursor
      } while (cursor)
    }

    return items
  }

  /**
   * Fetch catalog items modified since a given date using SearchCatalogObjects.
   * The `begin_time` parameter filters to items updated after the timestamp.
   */
  private async fetchCatalogItemsSince(
    creds: SquareCredentials,
    baseUrl: string,
    since: Date,
    categoryIds: string[],
    maxItems?: number
  ): Promise<SquareCatalogObject[]> {
    const items: SquareCatalogObject[] = []
    let cursor: string | undefined
    const beginTime = since.toISOString()

    do {
      const searchBody: Record<string, unknown> = {
        object_types: ['ITEM'],
        include_related_objects: true,
        begin_time: beginTime,
        cursor,
      }

      // If we have category IDs, add a prefix query to narrow results
      // Note: Square's SearchCatalogObjects does not support combining
      // begin_time with exact_query, so we filter categories client-side
      const body = await this.searchCatalogObjects(
        creds,
        baseUrl,
        searchBody
      )

      for (const obj of body.objects ?? []) {
        if (obj.type !== 'ITEM') continue

        // If we have category IDs, filter to only wine categories
        if (categoryIds.length > 0) {
          const itemCategoryId = obj.item_data?.category_id
          if (itemCategoryId && !categoryIds.includes(itemCategoryId)) {
            continue
          }
        }

        items.push(obj)
        if (maxItems && items.length >= maxItems) return items
      }

      cursor = body.cursor
    } while (cursor)

    return items
  }

  /**
   * Call Square's SearchCatalogObjects endpoint.
   */
  private async searchCatalogObjects(
    creds: SquareCredentials,
    baseUrl: string,
    body: Record<string, unknown>
  ): Promise<SquareCatalogResponse> {
    const response = await this.rateLimiter.execute(() =>
      fetch(`${baseUrl}/v2/catalog/search`, {
        method: 'POST',
        headers: this.buildHeaders(creds),
        body: JSON.stringify(body),
      })
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Square SearchCatalogObjects failed (HTTP ${response.status}): ${errorText}`
      )
    }

    return (await response.json()) as SquareCatalogResponse
  }

  /**
   * Fetch inventory counts for a batch of catalog object (variation) IDs.
   * Uses Square's BatchRetrieveInventoryCounts endpoint.
   *
   * Returns a Map of variation_id -> quantity.
   */
  private async fetchInventoryCounts(
    creds: SquareCredentials,
    baseUrl: string,
    variationIds: string[]
  ): Promise<Map<string, number>> {
    const counts = new Map<string, number>()

    // Square limits batch size to 100 IDs per request
    const BATCH_SIZE = 100
    for (let i = 0; i < variationIds.length; i += BATCH_SIZE) {
      const batch = variationIds.slice(i, i + BATCH_SIZE)
      let cursor: string | undefined

      do {
        const requestBody: Record<string, unknown> = {
          catalog_object_ids: batch,
          states: ['IN_STOCK'],
          cursor,
        }

        const response = await this.rateLimiter.execute(() =>
          fetch(`${baseUrl}/v2/inventory/counts/batch-retrieve`, {
            method: 'POST',
            headers: this.buildHeaders(creds),
            body: JSON.stringify(requestBody),
          })
        )

        if (!response.ok) {
          console.error(
            `SquareAdapter: failed to fetch inventory counts (HTTP ${response.status})`
          )
          break
        }

        const body = (await response.json()) as SquareInventoryResponse

        for (const count of body.counts ?? []) {
          const qty = parseFloat(count.quantity ?? '0')
          if (!isNaN(qty)) {
            const existing = counts.get(count.catalog_object_id) ?? 0
            counts.set(count.catalog_object_id, existing + qty)
          }
        }

        cursor = body.cursor
      } while (cursor)
    }

    return counts
  }

  // -------------------------------------------------------------------------
  // Private: Parsing helpers
  // -------------------------------------------------------------------------

  /**
   * Parse a single variation of a catalog item into a POSInventoryItem.
   * Combines item-level data (name, category) with variation-level data
   * (price, SKU) and inventory counts.
   */
  private parseVariation(
    item: SquareCatalogObject,
    variation: SquareCatalogObject,
    inventoryCounts: Map<string, number>
  ): POSInventoryItem | null {
    const itemData = item.item_data
    if (!itemData?.name) return null

    const name = itemData.name.trim()
    if (this.isNonWineItem(name)) return null

    const variationData = variation.item_variation_data
    const price = variationData?.price_money?.amount ?? 0
    const sku = variationData?.sku ?? undefined
    const quantity = inventoryCounts.get(variation.id) ?? 0

    // Build the full name: "Item Name - Variation Name" if variation has a name
    // that isn't just "Regular" or the same as the item name
    const variationName = variationData?.name?.trim()
    const fullName =
      variationName &&
      variationName !== 'Regular' &&
      variationName.toLowerCase() !== name.toLowerCase()
        ? `${name} - ${variationName}`
        : name

    const { wineName, producer, vintage, varietal } =
      this.extractWineMetadata(fullName)

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
   * Extract all variation IDs from a list of catalog items.
   * Used to batch-fetch inventory counts.
   */
  private extractVariationIds(items: SquareCatalogObject[]): string[] {
    const ids: string[] = []
    for (const item of items) {
      for (const variation of item.item_data?.variations ?? []) {
        if (variation.id) {
          ids.push(variation.id)
        }
      }
    }
    return ids
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
   * Build standard headers for Square API requests.
   */
  private buildHeaders(creds: SquareCredentials): Record<string, string> {
    return {
      'Authorization': `Bearer ${creds.access_token}`,
      'Content-Type': 'application/json',
      'Square-Version': SQUARE_API_VERSION,
      'Accept': 'application/json',
    }
  }

  /**
   * Get the Square API base URL based on the environment setting.
   */
  private getBaseUrl(creds: SquareCredentials): string {
    return creds.environment === 'sandbox'
      ? SQUARE_SANDBOX_URL
      : SQUARE_PRODUCTION_URL
  }

  /**
   * Assert that the provided credentials are SquareCredentials.
   * Throws if the credential type does not match.
   */
  private assertSquareCredentials(
    credentials: POSCredentials
  ): SquareCredentials {
    if (credentials.type !== 'square') {
      throw new Error(
        `SquareAdapter received credentials of type "${credentials.type}"; expected "square"`
      )
    }
    return credentials
  }
}
