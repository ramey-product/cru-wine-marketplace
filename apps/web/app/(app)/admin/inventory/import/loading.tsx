/**
 * Loading skeleton for the inventory import page.
 *
 * Displayed by Next.js automatically while the page segment suspends.
 * Mirrors the rough layout of InventoryImportPage without any real data.
 */
export default function InventoryImportLoading() {
  return (
    <div aria-busy="true" aria-label="Loading import page">
      {/* Page header skeleton */}
      <div className="mb-6 flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Wizard card skeleton */}
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
        {/* Step indicator skeleton */}
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-1 items-center last:flex-none">
              <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-muted" />
              {i < 5 && (
                <div className="mx-2 h-0.5 flex-1 animate-pulse bg-muted" />
              )}
            </div>
          ))}
        </div>

        {/* Drop zone skeleton */}
        <div className="h-6 w-32 animate-pulse rounded bg-muted mb-2" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted mb-6" />
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 px-8 py-12">
          <div className="mb-3 h-10 w-10 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
