import { WineCardSkeleton } from '@/components/features/wines/WineCardSkeleton'

export default function WinesLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="h-5 w-72 bg-muted animate-pulse rounded mt-2" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton — hidden on mobile */}
        <div className="hidden lg:block w-60 shrink-0 space-y-6">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          {/* Filter group skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="space-y-1.5">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    <div className="h-3.5 w-24 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-4 w-20 bg-muted animate-pulse rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <WineCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
