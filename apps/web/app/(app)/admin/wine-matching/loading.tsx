export default function WineMatchingLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-background p-4 space-y-2"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-10 animate-pulse rounded bg-muted" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border">
        {/* Table header */}
        <div className="flex gap-4 border-b border-border bg-muted/50 px-4 py-3">
          <div className="h-4 w-6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted flex-1" />
            <div className="h-4 w-36 animate-pulse rounded bg-muted flex-[2]" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted flex-1" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted flex-[2]" />
          </div>
        ))}
      </div>
    </div>
  )
}
