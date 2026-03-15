export default function RetailerOnboardingLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto h-9 w-52 rounded bg-muted" />
        <div className="mx-auto mt-3 h-5 w-72 rounded bg-muted" />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted" />
            {i < 3 && <div className="h-0.5 w-12 bg-muted" />}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />

        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
        ))}

        <div className="flex justify-end">
          <div className="h-10 w-28 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}
