export default function RetailerOrderDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-5 w-32 rounded bg-muted" />

      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded bg-muted" />
          <div className="h-5 w-40 rounded bg-muted" />
        </div>
        <div className="h-8 w-32 rounded bg-muted" />
      </div>

      {/* Content skeleton */}
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="h-[400px] rounded-lg bg-muted" />
        <div className="mt-6 lg:mt-0 h-[240px] rounded-lg bg-muted" />
      </div>
    </div>
  )
}
