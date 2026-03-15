export default function ProfileSettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-6 w-24 rounded bg-muted" />
        <div className="mt-2 h-4 w-64 rounded bg-muted" />
      </div>

      {/* Form field skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-10 w-full rounded-md bg-muted" />
        </div>
      ))}

      {/* Toggle skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-48 rounded bg-muted" />
        </div>
        <div className="h-6 w-11 rounded-full bg-muted" />
      </div>

      {/* Save button skeleton */}
      <div className="h-10 w-28 rounded-md bg-muted" />
    </div>
  )
}
