export default function OrderDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-28 rounded bg-muted" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="h-7 w-48 rounded bg-muted" />
          <div className="mt-2 h-4 w-36 rounded bg-muted" />
        </div>
        <div className="h-6 w-24 rounded-full bg-muted" />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        {/* Left: Order details */}
        <div className="space-y-6">
          {/* Items card */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="h-5 w-16 rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="h-3 w-28 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
            <div className="border-t border-border my-4" />
            <div className="flex justify-between">
              <div className="h-5 w-12 rounded bg-muted" />
              <div className="h-5 w-20 rounded bg-muted" />
            </div>
          </div>

          {/* Fulfillment card */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </div>
        </div>

        {/* Right: Status timeline */}
        <div className="mt-6 lg:mt-0">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="h-5 w-16 rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-3 w-3 rounded-full bg-muted mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
