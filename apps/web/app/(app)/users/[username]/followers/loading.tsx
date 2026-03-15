export default function FollowersLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-pulse">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-muted" />
        <div>
          <div className="h-6 w-28 rounded bg-muted" />
          <div className="mt-1 h-4 w-20 rounded bg-muted" />
        </div>
      </div>

      {/* User list rows */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border p-4"
          >
            <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
            <div className="h-8 w-20 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
