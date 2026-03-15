/**
 * Loading skeleton for /admin/producers.
 *
 * Mirrors the layout of ProducersPage exactly to eliminate layout shift:
 *   - Header row (title + button placeholder)
 *   - Search input placeholder
 *   - Table skeleton (header row + 5 data rows)
 */

export default function ProducersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-36 rounded-md bg-muted" />
          <div className="h-4 w-64 rounded-md bg-muted" />
        </div>
        <div className="h-9 w-36 rounded-md bg-muted" />
      </div>

      {/* Search */}
      <div className="h-9 w-72 rounded-md bg-muted" />

      {/* Table skeleton */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header row */}
        <div className="flex gap-4 px-5 py-3 border-b border-border bg-muted/50">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted ml-auto" />
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-3 w-12 rounded bg-muted" />
          <div className="h-3 w-14 rounded bg-muted" />
        </div>

        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0"
          >
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-28 rounded bg-muted" />
            </div>
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-8 rounded bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-8 w-16 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
