export default function PrivacySettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-6 w-20 rounded bg-muted" />
        <div className="mt-2 h-4 w-64 rounded bg-muted" />
      </div>

      {/* Visibility card skeleton */}
      <div className="rounded-lg border border-muted p-4 space-y-4">
        <div>
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="mt-2 h-4 w-72 rounded bg-muted" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted" />
        </div>
      </div>

      <div className="h-10 w-24 rounded-lg bg-muted" />
    </div>
  )
}
