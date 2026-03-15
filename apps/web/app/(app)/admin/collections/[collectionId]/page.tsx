import type { Metadata } from 'next'
import Link from 'next/link'
import { CollectionManager } from '@/components/features/admin/CollectionManager'
import type { CollectionItem } from '@/components/features/admin/CollectionItemList'
import type { CollectionFormData } from '@/components/features/admin/CollectionForm'

// TODO: Replace with getCollectionWithItems DAL call
const MOCK_COLLECTION: CollectionFormData & { id: string } = {
  id: 'col-1',
  title: 'Summer Roses',
  slug: 'summer-roses',
  description:
    'A hand-picked selection of exceptional roses for the warmer months. From Provencal classics to bold Mediterranean bottlings.',
  coverImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e',
  displayOrder: 1,
  startDate: '2026-06-01',
  endDate: '2026-09-30',
  isActive: true,
}

const MOCK_ITEMS: CollectionItem[] = [
  {
    id: 'ci-1',
    wineId: 'w1',
    wineName: 'Domaine Tempier Bandol Rose 2023',
    producer: 'Domaine Tempier',
    curatorNotes:
      'The benchmark Provencal rose. Savory and structured with notes of garrigue.',
    position: 1,
  },
  {
    id: 'ci-2',
    wineId: 'w3',
    wineName: 'Chateau Simone Palette Rose 2022',
    producer: 'Chateau Simone',
    curatorNotes: 'One of the rarest roses in the world. Hauntingly complex.',
    position: 2,
  },
  {
    id: 'ci-3',
    wineId: 'w5',
    wineName: 'Clos Cibonne Tibouren Cuvee Tradition Rose 2023',
    producer: 'Clos Cibonne',
    curatorNotes:
      'Made from the rare Tibouren grape. Light copper hue with herbal elegance.',
    position: 3,
  },
  {
    id: 'ci-4',
    wineId: 'w6',
    wineName: 'Domaines Ott Chateau de Selle Rose 2023',
    producer: 'Domaines Ott',
    curatorNotes: '',
    position: 4,
  },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionId: string }>
}): Promise<Metadata> {
  const { collectionId } = await params
  // TODO: Fetch actual collection title for metadata
  void collectionId
  return {
    title: `Edit ${MOCK_COLLECTION.title} | Cru Admin`,
    description: `Manage the "${MOCK_COLLECTION.title}" curated collection.`,
  }
}

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>
}) {
  const { collectionId } = await params
  // TODO: Replace with getCollectionWithItems(supabase, collectionId) DAL call
  void collectionId

  return (
    <div className="space-y-6">
      {/* Breadcrumb-style back link */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link
          href="/admin/collections"
          className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Collections
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{MOCK_COLLECTION.title}</span>
      </nav>

      <CollectionManager collection={MOCK_COLLECTION} items={MOCK_ITEMS} />
    </div>
  )
}
