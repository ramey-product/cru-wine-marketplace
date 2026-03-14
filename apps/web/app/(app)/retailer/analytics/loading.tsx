import { Separator } from '@/components/ui/separator'

/**
 * Analytics loading skeleton.
 *
 * Shape-matches the live analytics page layout:
 *   1. Page title area
 *   2. Revenue KPI cards (4-column grid)
 *   3. Top wines lists (2-column side-by-side)
 *   4. Weekly summary table (5 columns, 4 rows)
 */
export default function RetailerAnalyticsLoading() {
  return (
    <div className="space-y-8">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>

      <Separator />

      {/* Revenue KPI cards skeleton — 4 cards */}
      <div>
        <div className="h-5 w-24 animate-pulse rounded bg-muted mb-3" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-9 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Top wines skeleton — 2 side-by-side lists */}
      <div>
        <div className="h-5 w-24 animate-pulse rounded bg-muted mb-3" />
        <div className="flex flex-col gap-4 lg:flex-row">
          {Array.from({ length: 2 }).map((_, listIdx) => (
            <div key={listIdx} className="flex-1 rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              </div>
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="text-right space-y-1">
                      <div className="h-4 w-10 animate-pulse rounded bg-muted ml-auto" />
                      <div className="h-3 w-8 animate-pulse rounded bg-muted ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly summary table skeleton */}
      <div>
        <div className="h-5 w-36 animate-pulse rounded bg-muted mb-3" />
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-4 border-b border-border bg-muted/50 px-4 py-3">
            {[32, 16, 24, 20, 24].map((w, i) => (
              <div
                key={i}
                className={`h-3 animate-pulse rounded bg-muted`}
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
          {/* Data rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border last:border-b-0 bg-card px-4 py-3.5"
            >
              {[28, 12, 20, 16, 20].map((w, j) => (
                <div
                  key={j}
                  className="h-4 animate-pulse rounded bg-muted"
                  style={{ width: `${w * 4}px` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
