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
  MOCK_AVAILABILITY,
} from './_lib/placeholder-wines'

export const metadata: Metadata = {
  title: 'Browse Wines | Cru',
  description: 'Discover our curated selection of wines from trusted producers around the world.',
}

interface WinesPageProps {
  searchParams: Promise<{
    region?: string | string[]
    varietal?: string | string[]
    price_min?: string
    price_max?: string
    page?: string
  }>
}

export default async function WinesPage({ searchParams }: WinesPageProps) {
  const params = await searchParams

  // TODO: Replace with real DAL call: getWines(client, filters, pagination)
  // const client = createServerClient()
  // const filters: WineFilters = { regions, varietals, price_min, price_max }
  // const { data: wines, total } = await getWines(client, filters, { page, per_page: 24 })

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

  // Apply placeholder filters
  let wines = PLACEHOLDER_WINES

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

  const hasFilters = regionFilter.length > 0 || varietalFilter.length > 0 || priceMin !== null || priceMax !== null

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Browse Wines</h1>
        <p className="text-muted-foreground mt-1">
          Discover wines from our curated collection of trusted producers.
        </p>
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

          {wines.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {wines.length} {wines.length === 1 ? 'wine' : 'wines'}
                {hasFilters ? ' matching your filters' : ''}
              </p>
              <WineGridClient
                wines={wines}
                showBuyButton
                showAvailability
                availabilityMap={MOCK_AVAILABILITY}
              />

              {/* TODO: Add Load More button when total > wines.length */}
            </>
          ) : (
            <BrowseEmptyState />
          )}
        </div>
      </div>
    </>
  )
}
