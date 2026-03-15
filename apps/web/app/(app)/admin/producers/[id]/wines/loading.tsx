export default function ProducerWinesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back navigation */}
      <div className="h-4 w-36 rounded bg-muted" />

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>
        <div className="h-9 w-28 rounded-md bg-muted" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header row */}
        <div className="flex gap-4 px-4 py-3 border-b border-border bg-muted/50">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted ml-auto" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>

        {/* Data rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
          >
            <div className="flex-1 space-y-1">
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-5 w-14 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
