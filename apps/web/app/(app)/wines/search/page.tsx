import type { Metadata } from 'next'
import { Suspense } from 'react'
import { WineGridClient } from '@/components/features/wines/WineGridClient'
import { FilterPanel } from '@/components/features/browse/FilterPanel'
import { FilterChips } from '@/components/features/browse/FilterChips'
import { BrowseEmptyState } from '@/components/features/browse/BrowseEmptyState'
import {
  PLACEHOLDER_WINES,
  PLACEHOLDER_REGIONS,
  PLACEHOLDER_VARIETALS,
} from '../_lib/placeholder-wines'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    region?: string | string[]
    varietal?: string | string[]
    price_min?: string
    price_max?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const query = params.q ?? ''
  return {
    title: query ? `"${query}" — Search Results | Cru` : 'Search Wines | Cru',
    description: query
      ? `Search results for "${query}" in our curated wine marketplace.`
      : 'Search our curated selection of wines.',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''

  // TODO: Replace with real DAL call: searchWines(client, query, filters, pagination)
  // const client = createServerClient()
  // const filters: WineFilters = { regions, varietals, price_min, price_max }
  // const { data: wines, total } = await searchWines(client, query, filters, { page, per_page: 24 })

  // Parse filter params
  const regionFilter = Array.isArray(params.region)
    ? params.region
    : params.region
      ? [params.region]
      : []
  const varietalFilter = Array.isArray(params.varietal)
    ? params.varietal
    : params.varietal
      ? [params.varietal]
      : []
  const priceMin = params.price_min ? Number(params.price_min) : null
  const priceMax = params.price_max ? Number(params.price_max) : null

  // Simulate search with placeholder data
  let wines = query
    ? PLACEHOLDER_WINES.filter((w) => {
        const searchable = [w.name, w.varietal, w.region, w.country, w.producer.name, w.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return searchable.includes(query.toLowerCase())
      })
    : []

  // Apply additional filters
  if (regionFilter.length > 0) {
    wines = wines.filter((w) => w.region && regionFilter.includes(w.region))
  }
  if (varietalFilter.length > 0) {
    wines = wines.filter((w) => w.varietal && varietalFilter.includes(w.varietal))
  }
  if (priceMin !== null) {
    wines = wines.filter((w) => w.price_min !== null && w.price_min >= priceMin)
  }
  if (priceMax !== null) {
    wines = wines.filter((w) => w.price_max !== null && w.price_max <= priceMax)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {query ? (
            <>Search results for &ldquo;{query}&rdquo;</>
          ) : (
            'Search Wines'
          )}
        </h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <FilterPanel
              availableRegions={PLACEHOLDER_REGIONS}
              availableVarietals={PLACEHOLDER_VARIETALS}
            />
          </Suspense>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={null}>
            <FilterChips />
          </Suspense>

          {!query ? (
            <BrowseEmptyState message="Enter a search term to find wines, producers, or varietals." />
          ) : wines.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {wines.length} {wines.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
              </p>
              <WineGridClient wines={wines} />

              {/* TODO: Add Load More button when total > wines.length */}
            </>
          ) : (
            <BrowseEmptyState
              message={`No wines found for "${query}". Try a different search term or browse our collection.`}
            />
          )}
        </div>
      </div>
    </>
  )
}
