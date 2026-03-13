import { notFound } from 'next/navigation'
import { CollectionDetail } from '@/components/features/collections/CollectionDetail'
import { PLACEHOLDER_COLLECTIONS } from '../_lib/placeholder-collections'

interface CollectionPageProps {
  params: Promise<{ slug: string }>
}

// TODO: Replace with real getCollectionBySlug() DAL call
function getCollection(slug: string) {
  const collection = PLACEHOLDER_COLLECTIONS.find(
    (c) => c.slug === slug && c.is_active
  )
  if (!collection) return null

  // Check date validity
  const now = new Date()
  if (collection.end_date && new Date(collection.end_date) < now) return null

  return collection
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params
  const collection = getCollection(slug)
  if (!collection) return { title: 'Collection Not Found | Cru' }

  return {
    title: `${collection.title} | Cru`,
    description: collection.description,
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params
  const collection = getCollection(slug)

  if (!collection) {
    notFound()
  }

  return <CollectionDetail collection={collection} />
}
