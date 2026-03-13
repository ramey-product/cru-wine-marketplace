export default function WishlistLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-lg border border-border p-4">
            <div className="h-24 w-16 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
