export default function TasteProfileSettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-24 rounded-lg bg-muted animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }, (_, j) => (
                <div key={j} className="h-8 w-20 rounded-full bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
