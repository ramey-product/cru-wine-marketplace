export default function OrderConfirmationLoading() {
  return (
    <div className="mx-auto max-w-lg py-8 text-center animate-pulse">
      {/* Check icon */}
      <div className="mx-auto h-16 w-16 rounded-full bg-muted mb-4" />

      {/* Title and order number */}
      <div className="mx-auto h-7 w-52 rounded bg-muted" />
      <div className="mx-auto mt-2 h-4 w-32 rounded bg-muted" />

      {/* Confirmation card */}
      <div className="mt-8 rounded-lg border border-border bg-card p-6 text-left space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 rounded bg-muted flex-shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-4 w-56 rounded bg-muted" />
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Item rows */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        ))}

        <div className="border-t border-border" />

        <div className="flex justify-between">
          <div className="h-5 w-12 rounded bg-muted" />
          <div className="h-5 w-20 rounded bg-muted" />
        </div>
      </div>

      {/* Confirmation text */}
      <div className="mx-auto mt-6 h-4 w-64 rounded bg-muted" />

      {/* Action buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <div className="h-10 w-40 rounded-lg bg-muted" />
        <div className="h-10 w-40 rounded-lg bg-muted" />
      </div>
    </div>
  )
}
