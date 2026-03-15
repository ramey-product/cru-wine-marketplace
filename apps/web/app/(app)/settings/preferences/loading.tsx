export default function PreferencesSettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="mt-2 h-4 w-56 rounded bg-muted" />
      </div>

      {/* Form field skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-10 w-full rounded-md bg-muted" />
        </div>
      ))}

      {/* Tag chips skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-muted" />
          ))}
        </div>
      </div>

      {/* Save button skeleton */}
      <div className="h-10 w-28 rounded-md bg-muted" />
    </div>
  )
}
