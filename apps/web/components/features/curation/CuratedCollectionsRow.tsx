import Link from 'next/link'

// TODO: Replace with real getActiveCollections() DAL call
const MOCK_COLLECTIONS = [
  { id: '1', title: 'Staff Picks', slug: 'staff-picks', wine_count: 6 },
  { id: '2', title: 'Under $25', slug: 'under-25', wine_count: 4 },
  { id: '3', title: 'Natural Wines', slug: 'natural-wines', wine_count: 5 },
  { id: '4', title: 'New Arrivals', slug: 'new-arrivals', wine_count: 8 },
]

export function CuratedCollectionsRow() {
  return (
    <section aria-label="Curated collections">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Curated Collections</h2>
        <Link
          href="/collections"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          See all
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 -mx-4 px-4">
        {MOCK_COLLECTIONS.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.slug}`}
            className="snap-start flex-shrink-0 w-[280px] group"
          >
            <div className="rounded-lg border border-border overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="aspect-[16/9] bg-muted flex items-center justify-center">
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
              </div>
              <div className="p-4">
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {collection.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {collection.wine_count} wines
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
