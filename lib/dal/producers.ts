import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Pagination } from '@/lib/validations/wines'
import type { PaginatedResult } from '@/lib/dal/wines'

type TypedClient = SupabaseClient<Database>

// ---------------------------------------------------------------------------
// Shared select for producer queries
// ---------------------------------------------------------------------------

const PRODUCER_SELECT = `*` as const

const PRODUCER_WITH_PHOTOS_SELECT = `
  *,
  producer_photos(id, image_url, caption, display_order)
` as const

// ---------------------------------------------------------------------------
// getProducers — paginated producer list
// ---------------------------------------------------------------------------

export async function getProducers(
  client: TypedClient,
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  const { data, count, error } = await client
    .from('producers')
    .select(PRODUCER_SELECT, { count: 'exact' })
    .eq('is_active', true)
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    return { data: [], total: 0, page, per_page }
  }

  return { data: data ?? [], total: count ?? 0, page, per_page }
}

// ---------------------------------------------------------------------------
// getProducerBySlug — single producer with photos
// ---------------------------------------------------------------------------

export async function getProducerBySlug(client: TypedClient, slug: string) {
  return client
    .from('producers')
    .select(PRODUCER_WITH_PHOTOS_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
}

// ---------------------------------------------------------------------------
// getProducerById — single producer by ID
// ---------------------------------------------------------------------------

export async function getProducerById(client: TypedClient, id: string) {
  return client
    .from('producers')
    .select(PRODUCER_WITH_PHOTOS_SELECT)
    .eq('id', id)
    .single()
}

// ---------------------------------------------------------------------------
// getProducersByRegion — producers from a specific region
// ---------------------------------------------------------------------------

export async function getProducersByRegion(
  client: TypedClient,
  region: string,
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  const { data, count, error } = await client
    .from('producers')
    .select(PRODUCER_SELECT, { count: 'exact' })
    .eq('region', region)
    .eq('is_active', true)
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    return { data: [], total: 0, page, per_page }
  }

  return { data: data ?? [], total: count ?? 0, page, per_page }
}

// ---------------------------------------------------------------------------
// getProducersByCountry — producers from a specific country
// ---------------------------------------------------------------------------

export async function getProducersByCountry(
  client: TypedClient,
  country: string,
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  const { data, count, error } = await client
    .from('producers')
    .select(PRODUCER_SELECT, { count: 'exact' })
    .eq('country', country)
    .eq('is_active', true)
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    return { data: [], total: 0, page, per_page }
  }

  return { data: data ?? [], total: count ?? 0, page, per_page }
}

// ---------------------------------------------------------------------------
// getFeaturedProducers — producers for homepage/featured sections
// ---------------------------------------------------------------------------

export async function getFeaturedProducers(
  client: TypedClient,
  limit: number = 6
) {
  const { data, error } = await client
    .from('producers')
    .select(PRODUCER_SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// Distinct values for filter UI
// ---------------------------------------------------------------------------

export async function getDistinctProducerRegions(client: TypedClient) {
  const { data, error } = await client
    .from('producers')
    .select('region')
    .eq('is_active', true)
    .not('region', 'is', null)
    .order('region')

  if (error || !data) return []

  return [...new Set(data.map((d) => d.region).filter(Boolean))]
}

export async function getDistinctProducerCountries(client: TypedClient) {
  const { data, error } = await client
    .from('producers')
    .select('country')
    .eq('is_active', true)
    .not('country', 'is', null)
    .order('country')

  if (error || !data) return []

  return [...new Set(data.map((d) => d.country).filter(Boolean))]
}
