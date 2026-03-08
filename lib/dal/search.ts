import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { WineFilters, Pagination } from '@/lib/validations/wines'
import type { PaginatedResult } from '@/lib/dal/wines'

type TypedClient = SupabaseClient<Database>

// ---------------------------------------------------------------------------
// Wine select with producer join (matches wines.ts)
// ---------------------------------------------------------------------------

const WINE_SELECT = `
  *,
  producer:producers!inner(id, name, slug, region, country, hero_image_url)
` as const

// ---------------------------------------------------------------------------
// searchWines — full-text search with optional filters & pagination
// Uses plainto_tsquery for user-friendly query parsing (no syntax errors)
// ---------------------------------------------------------------------------

export async function searchWines(
  client: TypedClient,
  query: string,
  filters: WineFilters = {},
  pagination: Pagination = { page: 1, per_page: 24 }
): Promise<PaginatedResult<unknown>> {
  const { page, per_page } = pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  // Use Supabase's textSearch with plainto_tsquery (handles user input safely)
  let q = client
    .from('wines')
    .select(WINE_SELECT, { count: 'exact' })
    .textSearch('search_vector', query, {
      type: 'plain',
      config: 'english',
    })
    .eq('is_active', true)

  // Apply optional filters on top of search
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

  // Tag-based filtering via subquery
  if (filters.tags?.length) {
    q = q.in(
      'id',
      client
        .from('wine_tags')
        .select('wine_id')
        .in('tag_name', filters.tags)
    ) as typeof q
  }

  // Occasion-based filtering via subquery
  if (filters.occasions?.length) {
    q = q.in(
      'id',
      client
        .from('wine_occasions')
        .select('wine_id')
        .in('occasion_name', filters.occasions)
    ) as typeof q
  }

  const { data, count, error } = await q
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
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
// Suggestion types
// ---------------------------------------------------------------------------

export interface SearchSuggestion {
  type: 'wine' | 'varietal' | 'producer'
  label: string
  slug?: string
}

// ---------------------------------------------------------------------------
// getSearchSuggestions — autocomplete combining wines, varietals, producers
// Uses pg_trgm similarity for fuzzy prefix matching
// Returns up to 8 total suggestions
// ---------------------------------------------------------------------------

export async function getSearchSuggestions(
  client: TypedClient,
  prefix: string
): Promise<SearchSuggestion[]> {
  const pattern = `%${prefix}%`
  const suggestions: SearchSuggestion[] = []

  // Run all three queries in parallel
  const [wineResults, varietalResults, producerResults] = await Promise.all([
    // 1. Wine name matches (trigram index on name)
    client
      .from('wines')
      .select('name, slug')
      .eq('is_active', true)
      .ilike('name', pattern)
      .order('name')
      .limit(4),

    // 2. Distinct varietal matches
    client
      .from('wines')
      .select('varietal')
      .eq('is_active', true)
      .not('varietal', 'is', null)
      .ilike('varietal', pattern)
      .order('varietal')
      .limit(3),

    // 3. Producer name matches
    client
      .from('producers')
      .select('name, slug')
      .ilike('name', pattern)
      .order('name')
      .limit(3),
  ])

  // Collect wine suggestions
  if (wineResults.data) {
    for (const wine of wineResults.data) {
      suggestions.push({
        type: 'wine',
        label: wine.name,
        slug: wine.slug,
      })
    }
  }

  // Collect unique varietal suggestions
  if (varietalResults.data) {
    const seen = new Set<string>()
    for (const row of varietalResults.data) {
      if (row.varietal && !seen.has(row.varietal)) {
        seen.add(row.varietal)
        suggestions.push({
          type: 'varietal',
          label: row.varietal,
        })
      }
    }
  }

  // Collect producer suggestions
  if (producerResults.data) {
    for (const producer of producerResults.data) {
      suggestions.push({
        type: 'producer',
        label: producer.name,
        slug: producer.slug,
      })
    }
  }

  // Return at most 8 suggestions total
  return suggestions.slice(0, 8)
}

// ---------------------------------------------------------------------------
// getRecentSearches — return user's most recent search queries
// ---------------------------------------------------------------------------

export async function getRecentSearches(
  client: TypedClient,
  userId: string,
  limit: number = 10
) {
  const { data, error } = await client
    .from('recent_searches')
    .select('id, query, searched_at')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// saveRecentSearch — upsert a search query, enforce FIFO cap at 10
// Deduplicates: if same query exists, updates searched_at.
// Then prunes oldest entries beyond the cap.
// ---------------------------------------------------------------------------

const RECENT_SEARCHES_CAP = 10

export async function saveRecentSearch(
  client: TypedClient,
  userId: string,
  query: string
) {
  // Upsert: insert or update searched_at on conflict
  const { error: upsertError } = await client
    .from('recent_searches')
    .upsert(
      { user_id: userId, query, searched_at: new Date().toISOString() },
      { onConflict: 'user_id,query' }
    )

  if (upsertError) {
    return { error: upsertError }
  }

  // Prune: keep only the N most recent searches
  const { data: allSearches, error: fetchError } = await client
    .from('recent_searches')
    .select('id')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })
    .limit(RECENT_SEARCHES_CAP + 1)

  if (fetchError || !allSearches) {
    return { error: fetchError }
  }

  if (allSearches.length > RECENT_SEARCHES_CAP) {
    const idsToDelete = allSearches
      .slice(RECENT_SEARCHES_CAP)
      .map((row) => row.id)

    const { error: deleteError } = await client
      .from('recent_searches')
      .delete()
      .in('id', idsToDelete)

    if (deleteError) {
      return { error: deleteError }
    }
  }

  return { error: null }
}

// ---------------------------------------------------------------------------
// deleteRecentSearch — remove a single recent search entry
// ---------------------------------------------------------------------------

export async function deleteRecentSearch(
  client: TypedClient,
  userId: string,
  searchId: string
) {
  const { error } = await client
    .from('recent_searches')
    .delete()
    .eq('id', searchId)
    .eq('user_id', userId)

  return { error }
}

// ---------------------------------------------------------------------------
// clearRecentSearches — remove all recent searches for a user
// ---------------------------------------------------------------------------

export async function clearRecentSearches(
  client: TypedClient,
  userId: string
) {
  const { error } = await client
    .from('recent_searches')
    .delete()
    .eq('user_id', userId)

  return { error }
}
