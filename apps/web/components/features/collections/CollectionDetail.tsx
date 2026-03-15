import Image from 'next/image'
import { CollectionGridClient } from './CollectionGridClient'
import type { PlaceholderCollection } from '@/app/(app)/collections/_lib/placeholder-collections'

interface CollectionDetailProps {
  collection: PlaceholderCollection
}

export function CollectionDetail({ collection }: CollectionDetailProps) {
  const sortedItems = [...collection.items].sort((a, b) => a.position - b.position)

  return (
    <div>
      {/* Hero */}
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
        {collection.cover_image_url ? (
          <Image
            src={collection.cover_image_url}
            alt={collection.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/50"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-semibold text-foreground">{collection.title}</h1>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8 max-w-2xl">
        <p className="text-base text-muted-foreground leading-relaxed">
          {collection.description}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Curated by {collection.curator_name} &middot; {sortedItems.length} wines
        </p>
      </div>

      {/* Wine grid */}
      <CollectionGridClient items={sortedItems} />
    </div>
  )
}
