export default function NotificationSettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-6 w-36 rounded bg-muted" />
        <div className="mt-2 h-4 w-52 rounded bg-muted" />
      </div>

      {/* Notification toggle rows */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="space-y-1">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-56 rounded bg-muted" />
          </div>
          <div className="h-6 w-11 rounded-full bg-muted" />
        </div>
      ))}

      {/* Frequency selector skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="h-10 w-48 rounded-md bg-muted" />
      </div>

      {/* Save button skeleton */}
      <div className="h-10 w-28 rounded-md bg-muted" />
    </div>
  )
}
