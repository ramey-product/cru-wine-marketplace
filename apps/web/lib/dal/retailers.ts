import type { TypedClient, PaginatedResult } from '@/lib/dal/types'
import type {
  CreateRetailerInput,
  UpdateRetailerInput,
  RetailerFilters,
  Pagination,
} from '@/lib/validations/retailers'

// ---------------------------------------------------------------------------
// Select constants
// ---------------------------------------------------------------------------

/** Default select for retailer queries. Excludes pos_credentials (sensitive). */
const RETAILER_SELECT = `
  id,
  org_id,
  name,
  slug,
  address,
  city,
  state,
  zip,
  location,
  phone,
  email,
  website,
  pos_type,
  fulfillment_capabilities,
  delivery_radius_miles,
  commission_rate,
  is_active,
  onboarded_at,
  created_at,
  updated_at
` as const

/** Select for sync log entries. */
const SYNC_LOG_SELECT = `
  id,
  org_id,
  retailer_id,
  sync_type,
  sync_source,
  status,
  records_processed,
  records_created,
  records_updated,
  records_failed,
  error_details,
  started_at,
  completed_at,
  duration_ms,
  created_at
` as const

// ---------------------------------------------------------------------------
// getRetailerBySlug — single retailer by unique slug
// ---------------------------------------------------------------------------

/**
 * Look up a single retailer by its unique slug.
 * Returns the retailer row or null if not found.
 *
 * NOTE: Intentionally cross-org — slugs are globally unique and this is used
 * on consumer-facing retailer profile pages where no org context exists.
 */
export async function getRetailerBySlug(client: TypedClient, slug: string) {
  const { data, error } = await client
    .from('retailers')
    .select(RETAILER_SELECT)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('getRetailerBySlug failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// getRetailerByOrgId — retailer belonging to a specific org
// ---------------------------------------------------------------------------

/**
 * Get the retailer record for a given organization.
 * Typically an org has one retailer, so we use .maybeSingle().
 */
export async function getRetailerByOrgId(client: TypedClient, orgId: string) {
  const { data, error } = await client
    .from('retailers')
    .select(RETAILER_SELECT)
    .eq('org_id', orgId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('getRetailerByOrgId failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// getRetailersNearby — proximity query with PostGIS fallback
// ---------------------------------------------------------------------------

/**
 * Find active retailers near a geographic point.
 *
 * TODO: Wire up PostGIS proximity query when the `get_retailers_nearby` RPC
 * function is created in a later migration. The RPC should accept lat, lng,
 * radius_miles and use ST_DWithin for efficient spatial filtering against
 * the GIST-indexed `location` column.
 *
 * Current implementation: returns all active retailers sorted by name with
 * pagination. No distance filtering or sorting is applied.
 */
export async function getRetailersNearby(
  client: TypedClient,
  _lat: number,
  _lng: number,
  _radiusMiles: number,
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  // TODO: Replace with RPC call once DB function exists:
  // const { data, count, error } = await client
  //   .rpc('get_retailers_nearby', {
  //     p_lat: lat,
  //     p_lng: lng,
  //     p_radius_miles: radiusMiles,
  //     p_limit: per_page,
  //     p_offset: from,
  //   })

  const { data, count, error } = await client
    .from('retailers')
    .select(RETAILER_SELECT, { count: 'exact' })
    .eq('is_active', true)
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('getRetailersNearby query failed:', error)
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
// getRetailers — filtered, paginated retailer list
// ---------------------------------------------------------------------------

/**
 * Retrieve a paginated list of retailers, with optional filters.
 */
export async function getRetailers(
  client: TypedClient,
  orgId: string,
  filters: RetailerFilters = {},
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  let query = client
    .from('retailers')
    .select(RETAILER_SELECT, { count: 'exact' })
    .eq('org_id', orgId)

  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  if (filters.state) {
    query = query.eq('state', filters.state)
  }

  if (filters.query) {
    query = query.ilike('name', `%${filters.query}%`)
  }

  const { data, count, error } = await query
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('getRetailers query failed:', error)
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
// createRetailer — insert with PostGIS location
// ---------------------------------------------------------------------------

/**
 * Create a new retailer with geographic location.
 * The `location` column uses EWKT format for PostGIS geography insertion
 * via the Supabase JS client: `SRID=4326;POINT(lng lat)`.
 */
export async function createRetailer(
  client: TypedClient,
  input: CreateRetailerInput
) {
  const { latitude, longitude, ...rest } = input

  const { data, error } = await client
    .from('retailers')
    .insert({
      ...rest,
      location: `SRID=4326;POINT(${longitude} ${latitude})`,
    })
    .select(RETAILER_SELECT)
    .single()

  if (error) {
    console.error('createRetailer failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// updateRetailer — update retailer, optionally relocate
// ---------------------------------------------------------------------------

/**
 * Update an existing retailer. If latitude and longitude are provided,
 * the `location` geography column is recalculated.
 */
export async function updateRetailer(
  client: TypedClient,
  orgId: string,
  retailerId: string,
  input: UpdateRetailerInput
) {
  const { latitude, longitude, ...rest } = input

  // Build update payload; only include location if coordinates are provided
  const updatePayload: Record<string, unknown> = { ...rest }
  if (latitude !== undefined && longitude !== undefined) {
    updatePayload.location = `SRID=4326;POINT(${longitude} ${latitude})`
  }

  const { data, error } = await client
    .from('retailers')
    .update(updatePayload)
    .eq('id', retailerId)
    .eq('org_id', orgId)
    .select(RETAILER_SELECT)
    .single()

  if (error) {
    console.error('updateRetailer failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// getRetailerSyncLogs — paginated sync history
// ---------------------------------------------------------------------------

/**
 * Retrieve paginated sync log entries for a retailer, ordered most recent first.
 */
export async function getRetailerSyncLogs(
  client: TypedClient,
  orgId: string,
  retailerId: string,
  pagination: Pagination = { page: 1, per_page: 20 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  const { data, count, error } = await client
    .from('retailer_sync_logs')
    .select(SYNC_LOG_SELECT, { count: 'exact' })
    .eq('org_id', orgId)
    .eq('retailer_id', retailerId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getRetailerSyncLogs query failed:', error)
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
// createSyncLog — insert a new sync log entry
// ---------------------------------------------------------------------------

/**
 * Create a new retailer sync log entry. Called at the start or end of a
 * CSV import or POS sync to record processing results.
 */
export async function createSyncLog(
  client: TypedClient,
  orgId: string,
  data: {
    retailer_id: string
    sync_type: string
    sync_source: string
    status: string
    records_processed?: number
    records_created?: number
    records_updated?: number
    records_failed?: number
    error_details?: Record<string, unknown>[] | null
    started_at?: string
    completed_at?: string
    duration_ms?: number
  }
) {
  const { data: result, error } = await client
    .from('retailer_sync_logs')
    .insert({
      org_id: orgId,
      ...data,
      error_details: (data.error_details ?? null) as import('@/types/database').Json,
    })
    .select(SYNC_LOG_SELECT)
    .single()

  if (error) {
    console.error('createSyncLog failed:', error)
    return { data: null, error }
  }

  return { data: result, error: null }
}

// ---------------------------------------------------------------------------
// updateSyncLog — update an existing sync log entry
// ---------------------------------------------------------------------------

/**
 * Update a sync log entry, typically to mark it as completed/failed
 * after processing finishes.
 */
export async function updateSyncLog(
  client: TypedClient,
  orgId: string,
  syncLogId: string,
  data: {
    status?: string
    records_processed?: number
    records_created?: number
    records_updated?: number
    records_failed?: number
    error_details?: Record<string, unknown>[] | null
    completed_at?: string
    duration_ms?: number
  }
) {
  const { data: result, error } = await client
    .from('retailer_sync_logs')
    .update({
      ...data,
      error_details: (data.error_details ?? undefined) as import('@/types/database').Json | undefined,
    })
    .eq('id', syncLogId)
    .eq('org_id', orgId)
    .select(SYNC_LOG_SELECT)
    .single()

  if (error) {
    console.error('updateSyncLog failed:', error)
    return { data: null, error }
  }

  return { data: result, error: null }
}
