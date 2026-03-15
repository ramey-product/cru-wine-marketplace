export default function WineSearchLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-9 w-64 rounded bg-muted" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton -- hidden on mobile */}
        <div className="hidden lg:block w-60 shrink-0 space-y-6">
          <div className="h-4 w-16 rounded bg-muted" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="space-y-1.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <div className="h-3.5 w-24 rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-4 w-28 rounded bg-muted mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] rounded-lg bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
