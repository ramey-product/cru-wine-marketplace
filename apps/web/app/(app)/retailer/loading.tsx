export default function RetailerDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="flex items-center gap-6">
        <div className="h-[72px] w-40 rounded-lg bg-muted" />
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
