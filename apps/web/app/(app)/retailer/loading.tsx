/**
 * RetailerDashboardLoading — shape-matching skeleton for the dashboard overview page.
 *
 * Layout mirrors: greeting block → 3-card stat strip → order queue.
 * No layout shift when data hydrates.
 */
export default function RetailerDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-72 rounded-md bg-muted" />
        <div className="h-4 w-48 rounded-md bg-muted" />
      </div>

      {/* 3-card stat strip skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-4"
          >
            <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-16 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 border-b border-border pb-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-muted" />
        ))}
      </div>

      {/* Order rows skeleton */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[72px] rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
