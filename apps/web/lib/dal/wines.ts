import type { WineFilters, Pagination, CreateWineInput, UpdateWineInput } from '@/lib/validations/wines'
import type { TypedClient, PaginatedResult } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// Shared select for wine queries — includes producer name via join
// ---------------------------------------------------------------------------

export const WINE_SELECT = `
  *,
  producer:producers!inner(id, name, slug, region, country, hero_image_url)
` as const

const WINE_WITH_TAGS_SELECT = `
  *,
  producer:producers!inner(id, name, slug, region, country, hero_image_url),
  wine_tags(tag_name),
  wine_occasions(occasion_name)
` as const

// ---------------------------------------------------------------------------
// Core query builder — applies filters to a wines query
// ---------------------------------------------------------------------------

function applyWineFilters(
  query: ReturnType<TypedClient['from']>,
  filters: WineFilters
) {
  let q = query

  if (filters.varietals?.length) {
    q = q.in('varietal', filters.varietals)
  }

  if (filters.regions?.length) {
    q = q.in('region', filters.regions)
  }

  if (filters.sub_regions?.length) {
    q = q.in('sub_region', filters.sub_regions)
  }

  if (filters.countries?.length) {
    q = q.in('country', filters.countries)
  }

  if (filters.price_min != null) {
    q = q.gte('price_min', filters.price_min)
  }

  if (filters.price_max != null) {
    q = q.lte('price_max', filters.price_max)
  }

  if (filters.producer_id) {
    q = q.eq('producer_id', filters.producer_id)
  }

  if (filters.is_active !== undefined) {
    q = q.eq('is_active', filters.is_active)
  } else {
    // Default: only active wines
    q = q.eq('is_active', true)
  }

  return q
}

// ---------------------------------------------------------------------------
// getWines — filtered, paginated wine list
// ---------------------------------------------------------------------------

export async function getWines(
  client: TypedClient,
  filters: WineFilters = {},
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  let query = client
    .from('wines')
    .select(WINE_SELECT, { count: 'exact' })

  query = applyWineFilters(query, filters) as typeof query

  // Tag-based filtering via subquery
  if (filters.tags?.length) {
    query = query.in(
      'id',
      client
        .from('wine_tags')
        .select('wine_id')
        .in('tag_name', filters.tags)
    ) as typeof query
  }

  // Occasion-based filtering via subquery
  if (filters.occasions?.length) {
    query = query.in(
      'id',
      client
        .from('wine_occasions')
        .select('wine_id')
        .in('occasion_name', filters.occasions)
    ) as typeof query
  }

  const { data, count, error } = await query
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('getWines query failed:', error)
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
// getWineBySlug — single wine with full details
// ---------------------------------------------------------------------------

export async function getWineBySlug(client: TypedClient, slug: string) {
  return client
    .from('wines')
    .select(WINE_WITH_TAGS_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
}

// ---------------------------------------------------------------------------
// getWinesByRegion — wines from a specific region
// ---------------------------------------------------------------------------

export async function getWinesByRegion(
  client: TypedClient,
  region: string,
  pagination: Pagination = { page: 1, per_page: 24 }
) {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  const { data, count, error } = await client
    .from('wines')
    .select(WINE_SELECT, { count: 'exact' })
    .eq('region', region)
    .eq('is_active', true)
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('getWinesByRegion query failed:', error)
    return { data: [], total: 0, page, per_page }
  }

  return { data: data ?? [], total: count ?? 0, page, per_page }
}

// ---------------------------------------------------------------------------
// getWinesByVarietal — wines of a specific varietal
// ---------------------------------------------------------------------------

export async function getWinesByVarietal(
  client: TypedClient,
  varietal: string,
  pagination: Pagination = { page: 1, per_page: 24 }
) {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  const { data, count, error } = await client
    .from('wines')
    .select(WINE_SELECT, { count: 'exact' })
    .eq('varietal', varietal)
    .eq('is_active', true)
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('getWinesByVarietal query failed:', error)
    return { data: [], total: 0, page, per_page }
  }

  return { data: data ?? [], total: count ?? 0, page, per_page }
}

// ---------------------------------------------------------------------------
// getWinesByOccasion — wines tagged with a specific occasion
// ---------------------------------------------------------------------------

export async function getWinesByOccasion(
  client: TypedClient,
  occasion: string,
  pagination: Pagination = { page: 1, per_page: 24 }
) {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  const { data, count, error } = await client
    .from('wine_occasions')
    .select(`
      wine:wines!inner(
        *,
        producer:producers!inner(id, name, slug, region, country, hero_image_url)
      )
    `, { count: 'exact' })
    .eq('occasion_name', occasion)
    .eq('wines.is_active', true)
    .range(from, to)

  if (error) {
    console.error('getWinesByOccasion query failed:', error)
    return { data: [], total: 0, page, per_page }
  }

  // Flatten join result — each row has { wine: {...} }
  const wines = (data ?? []).map((row: Record<string, unknown>) => row.wine)
  return { data: wines, total: count ?? 0, page, per_page }
}

// ---------------------------------------------------------------------------
// getNewWines — most recently created wines
// ---------------------------------------------------------------------------

export async function getNewWines(
  client: TypedClient,
  limit: number = 12
) {
  const { data, error } = await client
    .from('wines')
    .select(WINE_SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// getWinesByProducer — all wines for a producer
// ---------------------------------------------------------------------------

export async function getWinesByProducer(
  client: TypedClient,
  producerId: string,
  pagination: Pagination = { page: 1, per_page: 24 }
) {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  const { data, count, error } = await client
    .from('wines')
    .select(WINE_SELECT, { count: 'exact' })
    .eq('producer_id', producerId)
    .eq('is_active', true)
    .order('vintage', { ascending: false, nullsFirst: false })
    .range(from, to)

  if (error) {
    console.error('getWinesByProducer query failed:', error)
    return { data: [], total: 0, page, per_page }
  }

  return { data: data ?? [], total: count ?? 0, page, per_page }
}

// ---------------------------------------------------------------------------
// Distinct values for filter UI population
// ---------------------------------------------------------------------------

export async function getDistinctRegions(client: TypedClient) {
  const { data, error } = await client
    .from('wines')
    .select('region')
    .eq('is_active', true)
    .not('region', 'is', null)
    .order('region')

  if (error || !data) return []

  return [...new Set(data.map((d) => d.region).filter(Boolean))]
}

export async function getDistinctVarietals(client: TypedClient) {
  const { data, error } = await client
    .from('wines')
    .select('varietal')
    .eq('is_active', true)
    .not('varietal', 'is', null)
    .order('varietal')

  if (error || !data) return []

  return [...new Set(data.map((d) => d.varietal).filter(Boolean))]
}

export async function getDistinctCountries(client: TypedClient) {
  const { data, error } = await client
    .from('wines')
    .select('country')
    .eq('is_active', true)
    .not('country', 'is', null)
    .order('country')

  if (error || !data) return []

  return [...new Set(data.map((d) => d.country).filter(Boolean))]
}

export async function getDistinctTags(client: TypedClient) {
  const { data, error } = await client
    .from('wine_tags')
    .select('tag_name')
    .order('tag_name')

  if (error || !data) return []

  return [...new Set(data.map((d) => d.tag_name))]
}

export async function getDistinctOccasions(client: TypedClient) {
  const { data, error } = await client
    .from('wine_occasions')
    .select('occasion_name')
    .order('occasion_name')

  if (error || !data) return []

  return [...new Set(data.map((d) => d.occasion_name))]
}

// ---------------------------------------------------------------------------
// Write operations — platform org admin only (enforced at Server Action layer)
// ---------------------------------------------------------------------------

export async function createWine(
  client: TypedClient,
  data: CreateWineInput
) {
  return client
    .from('wines')
    .insert(data)
    .select(WINE_SELECT)
    .single()
}

export async function updateWine(
  client: TypedClient,
  id: string,
  orgId: string,
  data: UpdateWineInput
) {
  return client
    .from('wines')
    .update(data)
    .eq('id', id)
    .eq('org_id', orgId)
    .select(WINE_SELECT)
    .single()
}

// ---------------------------------------------------------------------------
// searchWinesForMatch — fuzzy wine search via match_wine_candidates RPC
// ---------------------------------------------------------------------------

export async function searchWinesForMatch(
  client: TypedClient,
  query: string,
  orgId?: string,
  limit: number = 10
) {
  const { data, error } = await client.rpc('match_wine_candidates', {
    p_search_name: query,
    p_search_producer: null,
    p_search_vintage: null,
    p_search_varietal: null,
    p_org_id: orgId ?? null,
    p_limit: limit,
  })

  if (error) {
    console.error('searchWinesForMatch RPC failed:', error)
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}
