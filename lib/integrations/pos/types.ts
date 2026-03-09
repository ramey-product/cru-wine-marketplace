/**
 * POS Adapter Interface and Shared Types
 *
 * Defines the contract that all POS integrations must implement.
 * Each adapter (Square, Lightspeed, Shopify, Clover) implements the
 * POSAdapter interface, ensuring a consistent API for the sync layer.
 */

// ---------------------------------------------------------------------------
// POS Credentials — union of supported POS credential shapes
// ---------------------------------------------------------------------------

/** Square OAuth2 credentials stored in retailers.pos_credentials JSONB. */
export interface SquareCredentials {
  type: 'square'
  access_token: string
  refresh_token?: string
  merchant_id: string
  /** ISO 8601 timestamp when the access token expires. */
  expires_at?: string
  /** Square environment: 'sandbox' or 'production'. */
  environment?: 'sandbox' | 'production'
}

/** Lightspeed credentials (placeholder for STORY-06). */
export interface LightspeedCredentials {
  type: 'lightspeed'
  access_token: string
  refresh_token?: string
  account_id: string
  expires_at?: string
}

/** Shopify credentials (placeholder for STORY-06). */
export interface ShopifyCredentials {
  type: 'shopify'
  access_token: string
  shop_domain: string
}

/** Clover credentials (placeholder for STORY-06). */
export interface CloverCredentials {
  type: 'clover'
  access_token: string
  merchant_id: string
  expires_at?: string
}

/**
 * Discriminated union of all POS credential types.
 * The `type` field matches the `pos_type` column on the retailers table.
 */
export type POSCredentials =
  | SquareCredentials
  | LightspeedCredentials
  | ShopifyCredentials
  | CloverCredentials

// ---------------------------------------------------------------------------
// InventoryItem — normalized item from any POS system
// ---------------------------------------------------------------------------

/**
 * A single inventory item normalized from POS-specific format into
 * the Cru platform format. Adapters parse raw API responses into this
 * shape, which is then fed into the wine_match_queue for fuzzy matching.
 */
export interface POSInventoryItem {
  /** Raw wine name as it appears in the POS catalog. */
  rawWineName: string
  /** Raw producer/brand name if available. */
  rawProducer?: string
  /** Raw vintage string (e.g., "2023", "NV"). */
  rawVintage?: string
  /** Raw varietal/grape variety if available. */
  rawVarietal?: string
  /** SKU or item ID from the POS system. */
  sku?: string
  /** Price in cents (integer). Square already uses cents. */
  price: number
  /** Quantity on hand. 0 if not tracked. */
  quantity: number
}

// ---------------------------------------------------------------------------
// SyncResult — outcome of a full or incremental sync
// ---------------------------------------------------------------------------

/**
 * Result returned by fullSync() and incrementalSync().
 * Contains aggregate statistics and any per-item errors.
 * This is the adapter-level result; the server action wraps this into
 * a sync log entry in the retailer_sync_logs table.
 */
export interface SyncResult {
  /** Overall sync status. */
  status: 'completed' | 'failed' | 'partial'
  /** Total items processed (parsed + failed). */
  recordsProcessed: number
  /** Items successfully parsed (new items the DB has not seen before). */
  recordsCreated: number
  /** Items that updated an existing record. */
  recordsUpdated: number
  /** Items that failed to parse or process. */
  recordsFailed: number
  /** Per-item errors for debugging. */
  errors?: Array<{ item: string; error: string }>
  /** Wall-clock duration of the sync in milliseconds. */
  durationMs: number
  /** The parsed inventory items ready for the match queue. */
  items: POSInventoryItem[]
}

// ---------------------------------------------------------------------------
// SyncOptions — options passed to sync methods
// ---------------------------------------------------------------------------

/** Configuration options for sync operations. */
export interface SyncOptions {
  /** Maximum number of items to fetch (for testing/limiting). 0 = unlimited. */
  maxItems?: number
  /** Category IDs to filter on (POS-specific). */
  categoryIds?: string[]
  /** Whether to include out-of-stock items. Default: true. */
  includeOutOfStock?: boolean
}

// ---------------------------------------------------------------------------
// POSAdapter — the interface all adapters must implement
// ---------------------------------------------------------------------------

/**
 * Contract for POS system adapters.
 *
 * Each adapter is responsible for:
 * 1. Communicating with the POS API (authentication, pagination, rate limiting)
 * 2. Filtering for wine-related items
 * 3. Parsing POS-specific item formats into POSInventoryItem
 * 4. Returning a SyncResult with all parsed items
 *
 * Adapters do NOT write to the database. The server action layer handles
 * database operations (sync logs, match queue insertion, etc.).
 */
export interface POSAdapter {
  /** The POS system type identifier (matches retailers.pos_type). */
  readonly posType: string

  /**
   * Full inventory pull — fetches all catalog items from the POS system.
   * Typically run nightly to ensure complete data freshness.
   *
   * @param retailerId  - The Cru retailer UUID (for logging context)
   * @param credentials - POS-specific OAuth/API credentials
   * @param options     - Optional sync configuration
   * @returns SyncResult with all parsed wine inventory items
   */
  fullSync(
    retailerId: string,
    credentials: POSCredentials,
    options?: SyncOptions
  ): Promise<SyncResult>

  /**
   * Incremental sync — fetches only items changed since a given timestamp.
   * Typically run every 4 hours or triggered by webhooks.
   *
   * @param retailerId  - The Cru retailer UUID (for logging context)
   * @param credentials - POS-specific OAuth/API credentials
   * @param since       - Only include items modified after this timestamp
   * @param options     - Optional sync configuration
   * @returns SyncResult with changed wine inventory items
   */
  incrementalSync(
    retailerId: string,
    credentials: POSCredentials,
    since: Date,
    options?: SyncOptions
  ): Promise<SyncResult>

  /**
   * Parse a single raw POS item into the normalized Cru format.
   * Returns null if the item is not a wine or cannot be parsed.
   *
   * @param rawItem - The raw item object from the POS API
   * @returns Normalized POSInventoryItem or null
   */
  parseInventoryItem(rawItem: unknown): POSInventoryItem | null

  /**
   * Validate that the stored credentials are still valid by making
   * a lightweight API call (e.g., fetch merchant info).
   *
   * @param credentials - POS-specific credentials to test
   * @returns true if credentials are valid, false otherwise
   */
  testConnection(credentials: POSCredentials): Promise<boolean>
}
