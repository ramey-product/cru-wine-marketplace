export default function ProducerPhotosLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back navigation */}
      <div className="h-4 w-36 rounded bg-muted" />

      {/* Page header */}
      <div>
        <div className="h-7 w-40 rounded bg-muted" />
        <div className="mt-2 h-4 w-72 rounded bg-muted" />
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square rounded-lg bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
