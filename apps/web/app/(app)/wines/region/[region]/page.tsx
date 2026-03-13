import type { Metadata } from 'next'
import { Suspense } from 'react'
import { WineGrid } from '@/components/features/browse/WineGrid'
import { FilterChips } from '@/components/features/browse/FilterChips'
import { BrowseEmptyState } from '@/components/features/browse/BrowseEmptyState'
import { PLACEHOLDER_WINES } from '../../_lib/placeholder-wines'

interface RegionPageProps {
  params: Promise<{ region: string }>
  searchParams: Promise<{
    varietal?: string | string[]
    price_min?: string
    price_max?: string
    page?: string
  }>
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { region } = await params
  const decodedRegion = decodeURIComponent(region)
  return {
    title: `${decodedRegion} Wines | Cru`,
    description: `Browse our curated selection of wines from ${decodedRegion}.`,
  }
}

export default async function RegionPage({ params, searchParams }: RegionPageProps) {
  const { region } = await params
  const decodedRegion = decodeURIComponent(region)
  const sp = await searchParams

  // TODO: Replace with real DAL call: getWinesByRegion(client, decodedRegion, pagination)
  // const client = createServerClient()
  // const { data: wines, total } = await getWinesByRegion(client, decodedRegion, { page, per_page: 24 })

  let wines = PLACEHOLDER_WINES.filter(
    (w) => w.region?.toLowerCase() === decodedRegion.toLowerCase()
  )

  // Apply additional filters from search params
  const varietalFilter = Array.isArray(sp.varietal)
    ? sp.varietal
    : sp.varietal
      ? [sp.varietal]
      : []
  if (varietalFilter.length > 0) {
    wines = wines.filter((w) => w.varietal && varietalFilter.includes(w.varietal))
  }
  const priceMin = sp.price_min ? Number(sp.price_min) : null
  const priceMax = sp.price_max ? Number(sp.price_max) : null
  if (priceMin !== null) {
    wines = wines.filter((w) => w.price_min !== null && w.price_min >= priceMin)
  }
  if (priceMax !== null) {
    wines = wines.filter((w) => w.price_max !== null && w.price_max <= priceMax)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{decodedRegion}</h1>
        <p className="text-muted-foreground mt-1">
          Wines from {decodedRegion}
        </p>
      </div>

      <Suspense fallback={null}>
        <FilterChips />
      </Suspense>

      {wines.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {wines.length} {wines.length === 1 ? 'wine' : 'wines'}
          </p>
          <WineGrid wines={wines} />
        </>
      ) : (
        <BrowseEmptyState
          message={`No wines found from ${decodedRegion}. Try browsing all wines or another region.`}
        />
      )}
    </>
  )
}
