import type { Metadata } from 'next'
import { Suspense } from 'react'
import { WineGrid } from '@/components/features/browse/WineGrid'
import { FilterChips } from '@/components/features/browse/FilterChips'
import { BrowseEmptyState } from '@/components/features/browse/BrowseEmptyState'
import { PLACEHOLDER_WINES } from '../../_lib/placeholder-wines'

interface VarietalPageProps {
  params: Promise<{ varietal: string }>
  searchParams: Promise<{
    region?: string | string[]
    price_min?: string
    price_max?: string
    page?: string
  }>
}

export async function generateMetadata({ params }: VarietalPageProps): Promise<Metadata> {
  const { varietal } = await params
  const decodedVarietal = decodeURIComponent(varietal)
  return {
    title: `${decodedVarietal} Wines | Cru`,
    description: `Browse our curated selection of ${decodedVarietal} wines.`,
  }
}

export default async function VarietalPage({ params, searchParams }: VarietalPageProps) {
  const { varietal } = await params
  const decodedVarietal = decodeURIComponent(varietal)
  const sp = await searchParams

  // TODO: Replace with real DAL call: getWinesByVarietal(client, decodedVarietal, pagination)
  // const client = createServerClient()
  // const { data: wines, total } = await getWinesByVarietal(client, decodedVarietal, { page, per_page: 24 })

  let wines = PLACEHOLDER_WINES.filter(
    (w) => w.varietal?.toLowerCase() === decodedVarietal.toLowerCase()
  )

  // Apply additional filters from search params
  const regionFilter = Array.isArray(sp.region)
    ? sp.region
    : sp.region
      ? [sp.region]
      : []
  if (regionFilter.length > 0) {
    wines = wines.filter((w) => w.region && regionFilter.includes(w.region))
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
        <h1 className="text-3xl font-bold tracking-tight">{decodedVarietal}</h1>
        <p className="text-muted-foreground mt-1">
          Browse {decodedVarietal} wines from our collection
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
          message={`No ${decodedVarietal} wines found. Try browsing all wines or another varietal.`}
        />
      )}
    </>
  )
}
