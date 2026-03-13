import Link from 'next/link'
import Image from 'next/image'
import { PLACEHOLDER_COLLECTIONS } from './_lib/placeholder-collections'

export const metadata = {
  title: 'Collections | Cru',
  description: 'Browse curated wine collections hand-picked by our team.',
}

// TODO: Replace with real getActiveCollections() DAL call
const collections = PLACEHOLDER_COLLECTIONS.filter((c) => c.is_active).sort(
  (a, b) => a.display_order - b.display_order
)

export default function CollectionsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Collections</h1>
        <p className="mt-1 text-muted-foreground">
          Hand-picked wine collections curated by our team.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.slug}`}
            className="group rounded-lg border border-border overflow-hidden hover:shadow-md transition-all duration-200"
          >
            <div className="relative aspect-[16/9] bg-muted flex items-center justify-center">
              {collection.cover_image_url ? (
                <Image
                  src={collection.cover_image_url}
                  alt={collection.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                  aria-hidden="true"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              )}
            </div>
            <div className="p-4">
              <h2 className="font-medium group-hover:text-primary transition-colors">
                {collection.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {collection.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {collection.items.length} wines
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
