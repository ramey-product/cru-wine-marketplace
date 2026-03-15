/**
 * Loading skeleton for /admin/producers/[id].
 *
 * Mirrors the edit producer page layout:
 *   - Back nav link
 *   - Producer name + region
 *   - Two tab-nav cards (Wines, Photos)
 *   - Form section skeleton
 */

export default function EditProducerLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Back nav */}
      <div className="h-4 w-24 rounded bg-muted" />

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-md bg-muted" />
          <div className="h-4 w-36 rounded-md bg-muted" />
        </div>
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>

      {/* Tab nav cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <div className="h-9 w-9 rounded-md bg-muted flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Form section header */}
      <div className="border-b border-border pb-2">
        <div className="h-5 w-36 rounded bg-muted" />
      </div>

      {/* Form field skeletons */}
      <div className="space-y-8">
        {/* Identity section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-9 w-full rounded-md bg-muted" />
            </div>
          ))}
        </div>

        <div className="h-px bg-border" />

        {/* Story section */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-9 w-full rounded-md bg-muted" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-40 w-full rounded-md bg-muted" />
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Viticulture section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-9 w-full rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Save bar */}
      <div className="flex justify-end border-t border-border pt-2">
        <div className="h-9 w-28 rounded-md bg-muted" />
      </div>
    </div>
  )
}
