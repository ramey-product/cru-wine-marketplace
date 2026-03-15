/**
 * /admin/producers/[id]/wines — Producer wine portfolio.
 *
 * Server Component. Renders a table of wines for the producer with an
 * "Add Wine" action. Clicking Edit opens WineForm inside a Sheet.
 *
 * The WineSheet client component is co-located below. Keeping it in the
 * same file avoids an extra file just for the Sheet wrapper.
 *
 * TODO: Replace MOCK_WINES with getWinesByProducer DAL call.
 * TODO: Replace MOCK_PRODUCER_NAME with producer name from getProducerById.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { WinesTableClient } from './WinesTableClient'

// ---------------------------------------------------------------------------
// Mock data — TODO: Replace with DAL calls
// ---------------------------------------------------------------------------

interface MockWine {
  id: string
  name: string
  vintage: number | null
  varietal: string | null
  price_min: number | null
  is_active: boolean
}

const MOCK_WINES: Record<string, MockWine[]> = {
  '1': [
    { id: 'w1', name: 'Bandol Rosé', vintage: 2023, varietal: 'Mourvèdre Blend', price_min: 3500, is_active: true },
    { id: 'w2', name: 'Bandol Rouge', vintage: 2020, varietal: 'Mourvèdre', price_min: 6500, is_active: true },
    { id: 'w3', name: 'Bandol Blanc', vintage: 2022, varietal: 'Clairette Blend', price_min: 4500, is_active: false },
  ],
  '2': [
    { id: 'w4', name: 'Monte Bello', vintage: 2019, varietal: 'Cabernet Sauvignon', price_min: 27500, is_active: true },
    { id: 'w5', name: 'Lytton Springs', vintage: 2021, varietal: 'Zinfandel Blend', price_min: 4500, is_active: true },
    { id: 'w6', name: 'Geyserville', vintage: 2021, varietal: 'Zinfandel Blend', price_min: 4500, is_active: true },
  ],
  '3': [
    { id: 'w7', name: 'Sonoma Mountain Chardonnay', vintage: 2022, varietal: 'Chardonnay', price_min: 7500, is_active: true },
    { id: 'w8', name: 'Vine Hill Chardonnay', vintage: 2022, varietal: 'Chardonnay', price_min: 8500, is_active: true },
    { id: 'w9', name: 'Hirsch Vineyard Pinot Noir', vintage: 2021, varietal: 'Pinot Noir', price_min: 9500, is_active: false },
  ],
  '4': [
    { id: 'w10', name: 'Opus One', vintage: 2020, varietal: 'Cabernet Sauvignon Blend', price_min: 44500, is_active: true },
    { id: 'w11', name: 'Overture', vintage: null, varietal: 'Cabernet Sauvignon Blend', price_min: 19500, is_active: true },
  ],
  '5': [
    { id: 'w12', name: 'Napa Valley Cabernet Sauvignon', vintage: 2021, varietal: 'Cabernet Sauvignon', price_min: 9500, is_active: true },
    { id: 'w13', name: 'Special Selection', vintage: 2019, varietal: 'Cabernet Sauvignon', price_min: 22500, is_active: true },
    { id: 'w14', name: 'Conundrum White', vintage: 2022, varietal: 'White Blend', price_min: 2500, is_active: false },
  ],
}

const MOCK_PRODUCER_NAMES: Record<string, string> = {
  '1': 'Domaine Tempier',
  '2': 'Ridge Vineyards',
  '3': 'Kistler Vineyards',
  '4': 'Opus One Winery',
  '5': 'Caymus Vineyards',
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const name = MOCK_PRODUCER_NAMES[id]
  if (!name) return { title: 'Wines | Admin' }
  return { title: `${name} — Wines | Admin` }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProducerWinesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // TODO: Replace with DAL calls
  // const supabase = await createSupabaseServerClient()
  // const { data: producer } = await getProducerById(supabase, id)
  // if (!producer) notFound()
  // const { data: wines } = await getWinesByProducer(supabase, id, { limit: 100 })

  const { id } = await params
  const producerName = MOCK_PRODUCER_NAMES[id]
  if (!producerName) notFound()

  const wines = MOCK_WINES[id] ?? []

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <nav aria-label="Breadcrumb">
        <Link
          href={`/admin/producers/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Back to ${producerName}`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {producerName}
        </Link>
      </nav>

      {/*
       * WinesTableClient is a Client Component that owns the Sheet/WineForm
       * open state and handles the "Add Wine" + "Edit" interactions.
       */}
      <WinesTableClient
        producerId={id}
        producerName={producerName}
        initialWines={wines}
      />
    </div>
  )
}
