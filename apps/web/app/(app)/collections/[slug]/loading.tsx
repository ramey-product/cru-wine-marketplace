export default function CollectionDetailLoading() {
  return (
    <div>
      <div className="mb-8 aspect-[21/9] rounded-xl bg-muted animate-pulse" />
      <div className="mb-8 max-w-2xl space-y-2">
        <div className="h-5 w-full rounded bg-muted animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
