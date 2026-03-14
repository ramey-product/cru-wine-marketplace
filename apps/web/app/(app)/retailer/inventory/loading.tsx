import { Separator } from '@/components/ui/separator'

/**
 * Inventory loading skeleton.
 *
 * Shape-matches the live page layout to prevent layout shift when data arrives:
 *   1. Page title area
 *   2. Sync status card (single wide card)
 *   3. Inventory summary (4-column stat cards)
 *   4. Quick stock search (search input + list rows)
 */
export default function RetailerInventoryLoading() {
  return (
    <div className="space-y-6">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>

      <Separator />

      {/* Sync status card skeleton */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
            <div className="space-y-1.5">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Inventory summary skeleton — 4 stat cards */}
      <div>
        <div className="h-5 w-40 animate-pulse rounded bg-muted mb-3" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-9 w-16 animate-pulse rounded bg-muted" />
              <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Quick stock search skeleton */}
      <div>
        <div className="h-5 w-40 animate-pulse rounded bg-muted mb-3" />
        {/* Search input */}
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted mb-4" />
        {/* Result rows */}
        <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-card">
              <div className="space-y-1.5">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
