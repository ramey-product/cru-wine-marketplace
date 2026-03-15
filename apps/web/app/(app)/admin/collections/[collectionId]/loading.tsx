export default function EditCollectionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-2 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: form */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
            </div>
          ))}
          {/* Description textarea */}
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-24 w-full rounded-md bg-muted" />
          </div>
        </div>

        {/* Right column: item list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 rounded bg-muted" />
            <div className="h-9 w-24 rounded-md bg-muted" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted" />
              </div>
              <div className="h-8 w-8 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
