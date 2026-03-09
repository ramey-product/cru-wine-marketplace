import type { TypedClient, PaginatedResult } from '@/lib/dal/types'
import type { Pagination } from '@/lib/validations/wines'

// ---------------------------------------------------------------------------
// Select constants
// ---------------------------------------------------------------------------

/** Match queue entry with joined wine candidate details. */
const MATCH_QUEUE_SELECT = `
  id,
  org_id,
  retailer_id,
  raw_wine_name,
  raw_producer,
  raw_vintage,
  raw_varietal,
  raw_sku,
  raw_price,
  raw_quantity,
  matched_wine_id,
  match_confidence,
  match_status,
  reviewed_by,
  reviewed_at,
  sync_log_id,
  created_at,
  updated_at
` as const

/** Match queue entry with the matched wine details (when a match exists). */
const MATCH_QUEUE_WITH_WINE_SELECT = `
  id,
  org_id,
  retailer_id,
  raw_wine_name,
  raw_producer,
  raw_vintage,
  raw_varietal,
  raw_sku,
  raw_price,
  raw_quantity,
  matched_wine_id,
  match_confidence,
  match_status,
  reviewed_by,
  reviewed_at,
  sync_log_id,
  created_at,
  updated_at,
  matched_wine:wines(
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

// ---------------------------------------------------------------------------
// Match queue filter types
// ---------------------------------------------------------------------------

export interface MatchQueueFilters {
  /** Filter by match status (pending, auto_matched, manual_matched, rejected, new_wine_created) */
  match_status?: string
  /** Filter by retailer */
  retailer_id?: string
  /** Filter by sync log batch */
  sync_log_id?: string
  /** Search raw wine name or raw producer */
  query?: string
}

// ---------------------------------------------------------------------------
// getMatchQueue — paginated match queue with filters
// ---------------------------------------------------------------------------

/**
 * Retrieve the wine match queue with optional filters.
 * Results include matched wine details when a match exists.
 * Ordered by created_at descending (newest first).
 */
export async function getMatchQueue(
  client: TypedClient,
  orgId: string,
  filters: MatchQueueFilters = {},
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  let query = client
    .from('wine_match_queue')
    .select(MATCH_QUEUE_WITH_WINE_SELECT, { count: 'exact' })
    .eq('org_id', orgId)

  if (filters.match_status) {
    query = query.eq('match_status', filters.match_status)
  }

  if (filters.retailer_id) {
    query = query.eq('retailer_id', filters.retailer_id)
  }

  if (filters.sync_log_id) {
    query = query.eq('sync_log_id', filters.sync_log_id)
  }

  if (filters.query) {
    // Sanitize query for PostgREST filter string (escape special chars: . , ( ) ")
    const sanitized = filters.query.replace(/[.,()"%\\]/g, '')
    if (sanitized.length > 0) {
      query = query.or(
        `raw_wine_name.ilike.%${sanitized}%,raw_producer.ilike.%${sanitized}%`
      )
    }
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getMatchQueue query failed:', error)
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
// resolveMatch — update match status and optionally assign a wine
// ---------------------------------------------------------------------------

/**
 * Resolve a match queue entry by updating its status and optionally
 * assigning a matched wine. Sets reviewed_by and reviewed_at.
 *
 * @param queueId   - The wine_match_queue entry ID
 * @param data      - Resolution data (status, optional wine_id, confidence)
 */
export async function resolveMatch(
  client: TypedClient,
  orgId: string,
  queueId: string,
  data: {
    match_status: string
    matched_wine_id?: string | null
    match_confidence?: number | null
    reviewed_by?: string | null
  }
) {
  const updatePayload: Record<string, unknown> = {
    match_status: data.match_status,
    matched_wine_id: data.matched_wine_id ?? null,
    match_confidence: data.match_confidence ?? null,
  }

  // Only set reviewed_by/reviewed_at for human reviews, not system auto-matches
  if (data.reviewed_by) {
    updatePayload.reviewed_by = data.reviewed_by
    updatePayload.reviewed_at = new Date().toISOString()
  }

  const { data: result, error } = await client
    .from('wine_match_queue')
    .update(updatePayload)
    .eq('id', queueId)
    .eq('org_id', orgId)
    .select(MATCH_QUEUE_SELECT)
    .single()

  if (error) {
    console.error('resolveMatch failed:', error)
    return { data: null, error }
  }

  return { data: result, error: null }
}

// ---------------------------------------------------------------------------
// createMatchQueueItem — insert a new entry (used by CSV import)
// ---------------------------------------------------------------------------

/**
 * Insert a new wine match queue entry. Typically called during CSV import
 * or POS sync when a wine cannot be automatically matched.
 */
export async function createMatchQueueItem(
  client: TypedClient,
  data: {
    org_id: string
    retailer_id: string
    raw_wine_name: string
    raw_producer?: string
    raw_vintage?: string
    raw_varietal?: string
    raw_sku?: string
    raw_price?: number
    raw_quantity?: number
    matched_wine_id?: string
    match_confidence?: number
    match_status?: string
    sync_log_id?: string
  }
) {
  const { data: result, error } = await client
    .from('wine_match_queue')
    .insert({
      org_id: data.org_id,
      retailer_id: data.retailer_id,
      raw_wine_name: data.raw_wine_name,
      raw_producer: data.raw_producer ?? null,
      raw_vintage: data.raw_vintage ?? null,
      raw_varietal: data.raw_varietal ?? null,
      raw_sku: data.raw_sku ?? null,
      raw_price: data.raw_price ?? null,
      raw_quantity: data.raw_quantity ?? null,
      matched_wine_id: data.matched_wine_id ?? null,
      match_confidence: data.match_confidence ?? null,
      match_status: data.match_status ?? 'pending',
      sync_log_id: data.sync_log_id ?? null,
    })
    .select(MATCH_QUEUE_SELECT)
    .single()

  if (error) {
    console.error('createMatchQueueItem failed:', error)
    return { data: null, error }
  }

  return { data: result, error: null }
}

// ---------------------------------------------------------------------------
// bulkCreateMatchQueueItems — batch insert (used during sync)
// ---------------------------------------------------------------------------

/**
 * Batch insert multiple match queue entries. Typically used during a CSV
 * import or POS sync to queue all unmatched wines at once.
 *
 * @param orgId - Top-level org_id enforced on all items to prevent mixed-org batches
 */
export async function bulkCreateMatchQueueItems(
  client: TypedClient,
  orgId: string,
  items: Array<{
    retailer_id: string
    raw_wine_name: string
    raw_producer?: string
    raw_vintage?: string
    raw_varietal?: string
    raw_sku?: string
    raw_price?: number
    raw_quantity?: number
    matched_wine_id?: string
    match_confidence?: number
    match_status?: string
    sync_log_id?: string
  }>
) {
  const rows = items.map((item) => ({
    org_id: orgId,
    retailer_id: item.retailer_id,
    raw_wine_name: item.raw_wine_name,
    raw_producer: item.raw_producer ?? null,
    raw_vintage: item.raw_vintage ?? null,
    raw_varietal: item.raw_varietal ?? null,
    raw_sku: item.raw_sku ?? null,
    raw_price: item.raw_price ?? null,
    raw_quantity: item.raw_quantity ?? null,
    matched_wine_id: item.matched_wine_id ?? null,
    match_confidence: item.match_confidence ?? null,
    match_status: item.match_status ?? 'pending',
    sync_log_id: item.sync_log_id ?? null,
  }))

  const { data, error } = await client
    .from('wine_match_queue')
    .insert(rows)
    .select(MATCH_QUEUE_SELECT)

  if (error) {
    console.error('bulkCreateMatchQueueItems failed:', error)
    return { data: null, count: 0, error }
  }

  return { data: data ?? [], count: data?.length ?? 0, error: null }
}

// ---------------------------------------------------------------------------
// getMatchQueueStats — summary counts by status for a retailer
// ---------------------------------------------------------------------------

/**
 * Get summary counts of match queue entries grouped by status.
 * Useful for dashboard display showing pending vs resolved counts.
 */
export async function getMatchQueueStats(
  client: TypedClient,
  orgId: string,
  retailerId: string
) {
  const statuses = [
    'pending',
    'auto_matched',
    'manual_matched',
    'rejected',
    'new_wine_created',
  ] as const

  const counts: Record<string, number> = {}

  // Fetch counts for each status in parallel
  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await client
        .from('wine_match_queue')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('retailer_id', retailerId)
        .eq('match_status', status)

      if (error) {
        console.error(`getMatchQueueStats failed for status ${status}:`, error)
        return { status, count: 0 }
      }

      return { status, count: count ?? 0 }
    })
  )

  for (const result of results) {
    counts[result.status] = result.count
  }

  return {
    data: counts,
    total: Object.values(counts).reduce((sum, c) => sum + c, 0),
    error: null,
  }
}

// ---------------------------------------------------------------------------
// getPendingMatchQueueEntries — batch fetch pending entries for processing
// ---------------------------------------------------------------------------

/**
 * Fetch pending match queue entries for batch processing.
 * Returns a lightweight select (no joined wine data) ordered oldest-first.
 */
export async function getPendingMatchQueueEntries(
  client: TypedClient,
  orgId: string,
  limit: number = 100
) {
  const { data, error } = await client
    .from('wine_match_queue')
    .select(MATCH_QUEUE_SELECT)
    .eq('org_id', orgId)
    .eq('match_status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('getPendingMatchQueueEntries failed:', error)
    return { data: null, error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// matchWineCandidates — DAL wrapper for match_wine_candidates RPC
// ---------------------------------------------------------------------------

/**
 * Call the `match_wine_candidates` PostgreSQL RPC function for trigram-based
 * fuzzy matching. Returns ranked wine candidates with similarity scores.
 */
export async function matchWineCandidates(
  client: TypedClient,
  params: {
    searchName: string
    searchProducer: string | null
    searchVintage: number | null
    searchVarietal: string | null
    orgId: string
    limit?: number
  }
) {
  const { data, error } = await client.rpc('match_wine_candidates', {
    p_search_name: params.searchName,
    p_search_producer: params.searchProducer,
    p_search_vintage: params.searchVintage,
    p_search_varietal: params.searchVarietal,
    p_org_id: params.orgId,
    p_limit: params.limit ?? 5,
  })

  if (error) {
    console.error('matchWineCandidates RPC failed:', error)
    return { data: null, error }
  }

  return { data: data ?? [], error: null }
}
