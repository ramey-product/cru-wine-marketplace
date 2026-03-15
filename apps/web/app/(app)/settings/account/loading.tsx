export default function AccountSettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-6 w-24 rounded bg-muted" />
        <div className="mt-2 h-4 w-48 rounded bg-muted" />
      </div>

      {/* Danger zone skeleton */}
      <div className="rounded-lg border border-muted p-6 space-y-4">
        <div>
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="mt-2 h-4 w-full rounded bg-muted" />
          <div className="mt-1 h-4 w-3/4 rounded bg-muted" />
        </div>
        <div className="h-10 w-36 rounded-md bg-muted" />
      </div>
    </div>
  )
}
