export default function WineDetailLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Breadcrumbs skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-muted" />
        <div className="h-4 w-3 rounded bg-muted" />
        <div className="h-4 w-14 rounded bg-muted" />
        <div className="h-4 w-3 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
        {/* Left column */}
        <div className="space-y-8">
          {/* Wine image */}
          <div className="aspect-[3/4] max-w-md mx-auto lg:mx-0 rounded-lg bg-muted" />

          {/* Producer overline */}
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-9 w-64 rounded bg-muted" />
            <div className="h-5 w-48 rounded bg-muted" />
          </div>

          {/* Story hook */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>

          <hr className="border-border" />

          {/* Tasting notes */}
          <div className="space-y-3">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>

          {/* Food pairings */}
          <div className="space-y-3">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-4 w-36 rounded bg-muted" />
          </div>
        </div>

        {/* Right column: Purchase card skeleton */}
        <div className="hidden lg:block">
          <div className="sticky top-20 rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="h-7 w-20 rounded bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-11 w-full rounded-lg bg-muted" />
            <div className="flex gap-2">
              <div className="h-10 flex-1 rounded-lg bg-muted" />
              <div className="h-10 flex-1 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
