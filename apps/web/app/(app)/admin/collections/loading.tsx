export default function CollectionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border">
        {/* Table header */}
        <div className="flex gap-4 border-b border-border bg-muted/50 px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-36 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-8 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-8 animate-pulse rounded bg-muted" />
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
