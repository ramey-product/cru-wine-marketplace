export function WineCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Image placeholder */}
      <div className="aspect-[3/4] bg-muted animate-pulse" />

      <div className="p-4 space-y-2">
        {/* Producer name */}
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />

        {/* Wine name */}
        <div className="h-5 w-full bg-muted animate-pulse rounded" />

        {/* Varietal — Region */}
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />

        {/* Price */}
        <div className="h-5 w-16 bg-muted animate-pulse rounded" />

        {/* Story hook */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full bg-muted animate-pulse rounded" />
          <div className="h-3.5 w-3/4 bg-muted animate-pulse rounded" />
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
