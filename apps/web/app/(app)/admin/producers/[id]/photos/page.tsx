/**
 * /admin/producers/[id]/photos — Producer photo gallery management.
 *
 * Server Component. Renders PhotoManager with mock photo data.
 *
 * TODO: Replace MOCK_PHOTOS with photos from getProducerById DAL call.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { PhotoManager } from '@/components/features/admin/PhotoManager'
import type { PhotoEntry } from '@/components/features/admin/PhotoManager'

// ---------------------------------------------------------------------------
// Mock data — TODO: Replace with getProducerById DAL call
// ---------------------------------------------------------------------------

const MOCK_PRODUCER_NAMES: Record<string, string> = {
  '1': 'Domaine Tempier',
  '2': 'Ridge Vineyards',
  '3': 'Kistler Vineyards',
  '4': 'Opus One Winery',
  '5': 'Caymus Vineyards',
}

/** Mock photos keyed by producer ID. */
const MOCK_PHOTOS: Record<string, PhotoEntry[]> = {
  '1': [
    {
      id: 'p1',
      image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
      caption: 'Vineyard at sunrise',
      display_order: 0,
    },
    {
      id: 'p2',
      image_url: 'https://images.unsplash.com/photo-1559693367-d7aaab31d3b5?w=400',
      caption: 'Harvest season',
      display_order: 1,
    },
    {
      id: 'p3',
      image_url: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400',
      caption: null,
      display_order: 2,
    },
  ],
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
  if (!name) return { title: 'Photos | Admin' }
  return { title: `${name} — Photos | Admin` }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProducerPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // TODO: Replace with getProducerById DAL call
  // const supabase = await createSupabaseServerClient()
  // const { data: producer } = await getProducerById(supabase, id)
  // if (!producer) notFound()
  // const photos = producer.photos ?? []

  const { id } = await params
  const producerName = MOCK_PRODUCER_NAMES[id]
  if (!producerName) notFound()

  const photos = MOCK_PHOTOS[id] ?? []

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

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Photo Gallery</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {producerName} — manage gallery images and their display order.
        </p>
      </div>

      {/*
       * PhotoManager is a Client Component that owns add/remove/reorder state.
       * Pass the real photos array once the DAL is wired:
       *   <PhotoManager producerId={id} initialPhotos={producer.photos} />
       */}
      <PhotoManager producerId={id} initialPhotos={photos} />
    </div>
  )
}
