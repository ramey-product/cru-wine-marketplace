export default function CollectionsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-9 w-48 rounded bg-muted animate-pulse" />
        <div className="mt-2 h-5 w-72 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-lg border border-border overflow-hidden">
            <div className="aspect-[16/9] bg-muted animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
