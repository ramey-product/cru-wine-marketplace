import type { TypedClient, PaginatedResult } from '@/lib/dal/types'
import type {
  UpsertInventoryItemInput,
  InventoryFilters,
  Pagination,
  StockStatus,
} from '@/lib/validations/inventory'

// ---------------------------------------------------------------------------
// Select constants
// ---------------------------------------------------------------------------

/** Inventory item with joined wine and producer data for display. */
const INVENTORY_WITH_WINE_SELECT = `
  id,
  org_id,
  retailer_id,
  wine_id,
  sku,
  price,
  quantity,
  stock_status,
  sync_source,
  last_synced_at,
  created_at,
  updated_at,
  wine:wines!inner(
    id,
    name,
    slug,
    varietal,
    region,
    country,
    vintage,
    image_url,
    producer:producers(id, name, slug)
  )
` as const

/** Inventory item with retailer data for consumer-facing availability. */
const INVENTORY_WITH_RETAILER_SELECT = `
  id,
  org_id,
  retailer_id,
  wine_id,
  sku,
  price,
  quantity,
  stock_status,
  sync_source,
  last_synced_at,
  created_at,
  updated_at,
  retailer:retailers!inner(
    id,
    name,
    slug,
    address,
    city,
    state,
    zip,
    location,
    phone,
    fulfillment_capabilities,
    is_active
  )
` as const

/** Minimal inventory select (no joins). */
const INVENTORY_SELECT = `
  id,
  org_id,
  retailer_id,
  wine_id,
  sku,
  price,
  quantity,
  stock_status,
  sync_source,
  last_synced_at,
  created_at,
  updated_at
` as const

// ---------------------------------------------------------------------------
// getAvailabilityForWine — where can a consumer buy this wine?
// ---------------------------------------------------------------------------

/**
 * Find retailers that have a specific wine in stock.
 *
 * TODO: Once the `get_retailers_nearby` PostGIS RPC function exists, add
 * distance filtering and sorting by proximity. Currently returns all active
 * retailers with this wine in stock (no geographic filtering).
 *
 * @param _lat  - Consumer latitude (unused until PostGIS RPC is available)
 * @param _lng  - Consumer longitude (unused until PostGIS RPC is available)
 * @param _radiusMiles - Search radius (unused until PostGIS RPC is available)
 */
export async function getAvailabilityForWine(
  client: TypedClient,
  wineId: string,
  _lat?: number,
  _lng?: number,
  _radiusMiles?: number,
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  // TODO: Replace with PostGIS proximity RPC when available:
  // const { data, count, error } = await client.rpc('get_wine_availability', {
  //   p_wine_id: wineId,
  //   p_lat: lat,
  //   p_lng: lng,
  //   p_radius_miles: radiusMiles,
  //   p_limit: per_page,
  //   p_offset: from,
  // })

  const { data, count, error } = await client
    .from('retailer_inventory')
    .select(INVENTORY_WITH_RETAILER_SELECT, { count: 'exact' })
    .eq('wine_id', wineId)
    .neq('stock_status', 'out_of_stock')
    .eq('retailer.is_active', true)
    .order('price', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('getAvailabilityForWine query failed:', error)
    return { data: [], total: 0, page, per_page }
  }

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    per_page,
  }
}

// ---------------------------------------------------------------------------
// getRetailerInventory — paginated inventory for a retailer
// ---------------------------------------------------------------------------

/**
 * Retrieve paginated inventory for a specific retailer, with wine details.
 * Supports filtering by stock_status, sync_source, and text search on wine name.
 */
export async function getRetailerInventory(
  client: TypedClient,
  retailerId: string,
  filters: InventoryFilters = {},
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  let query = client
    .from('retailer_inventory')
    .select(INVENTORY_WITH_WINE_SELECT, { count: 'exact' })
    .eq('retailer_id', retailerId)

  if (filters.stock_status) {
    query = query.eq('stock_status', filters.stock_status)
  }

  if (filters.sync_source) {
    query = query.eq('sync_source', filters.sync_source)
  }

  if (filters.query) {
    query = query.ilike('wines.name', `%${filters.query}%`)
  }

  const { data, count, error } = await query
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getRetailerInventory query failed:', error)
    return { data: [], total: 0, page, per_page }
  }

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    per_page,
  }
}

// ---------------------------------------------------------------------------
// upsertInventoryItem — insert or update a single inventory record
// ---------------------------------------------------------------------------

/**
 * Upsert a single inventory item. Uses the (retailer_id, wine_id) unique
 * constraint to determine insert vs update. Always updates `last_synced_at`.
 */
export async function upsertInventoryItem(
  client: TypedClient,
  input: UpsertInventoryItemInput
) {
  const { data, error } = await client
    .from('retailer_inventory')
    .upsert(
      {
        ...input,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'retailer_id,wine_id' }
    )
    .select(INVENTORY_SELECT)
    .single()

  if (error) {
    console.error('upsertInventoryItem failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// bulkUpsertInventory — batch upsert inventory items for a retailer
// ---------------------------------------------------------------------------

/**
 * Batch upsert inventory items for a retailer. All items share the same
 * org_id and retailer_id. Uses the (retailer_id, wine_id) unique constraint.
 *
 * @param orgId      - Organization ID for all items
 * @param retailerId - Retailer ID for all items
 * @param items      - Array of inventory items (wine_id, price, quantity, etc.)
 */
export async function bulkUpsertInventory(
  client: TypedClient,
  orgId: string,
  retailerId: string,
  items: Array<{
    wine_id: string
    sku?: string
    price: number
    quantity: number
    stock_status?: string
    sync_source?: string
  }>
) {
  const now = new Date().toISOString()

  const rows = items.map((item) => ({
    org_id: orgId,
    retailer_id: retailerId,
    wine_id: item.wine_id,
    sku: item.sku ?? null,
    price: item.price,
    quantity: item.quantity,
    stock_status: item.stock_status ?? 'in_stock',
    sync_source: item.sync_source ?? 'csv',
    last_synced_at: now,
  }))

  const { data, error } = await client
    .from('retailer_inventory')
    .upsert(rows, { onConflict: 'retailer_id,wine_id' })
    .select(INVENTORY_SELECT)

  if (error) {
    console.error('bulkUpsertInventory failed:', error)
    return { data: null, count: 0, error }
  }

  return { data: data ?? [], count: data?.length ?? 0, error: null }
}

// ---------------------------------------------------------------------------
// updateStockStatus — update a single item's stock status
// ---------------------------------------------------------------------------

/**
 * Update the stock_status of a single inventory item by its ID.
 */
export async function updateStockStatus(
  client: TypedClient,
  orgId: string,
  inventoryId: string,
  status: StockStatus
) {
  const { data, error } = await client
    .from('retailer_inventory')
    .update({
      stock_status: status,
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', inventoryId)
    .eq('org_id', orgId)
    .select(INVENTORY_SELECT)
    .single()

  if (error) {
    console.error('updateStockStatus failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// getStaleInventory — find inventory not synced recently
// ---------------------------------------------------------------------------

/**
 * Find inventory records that have not been synced within the specified
 * number of hours. Useful for flagging stale data for re-sync.
 *
 * @param hoursThreshold - Number of hours since last sync to consider stale
 */
export async function getStaleInventory(
  client: TypedClient,
  orgId: string,
  hoursThreshold: number,
  pagination: Pagination = { page: 1, per_page: 50 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  const cutoff = new Date(
    Date.now() - hoursThreshold * 60 * 60 * 1000
  ).toISOString()

  const { data, count, error } = await client
    .from('retailer_inventory')
    .select(INVENTORY_WITH_WINE_SELECT, { count: 'exact' })
    .eq('org_id', orgId)
    .lt('last_synced_at', cutoff)
    .neq('stock_status', 'out_of_stock')
    .order('last_synced_at', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('getStaleInventory query failed:', error)
    return { data: [], total: 0, page, per_page }
  }

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    per_page,
  }
}
