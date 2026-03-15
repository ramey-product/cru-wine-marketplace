export default function NewProducerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back navigation */}
      <div className="h-4 w-24 rounded bg-muted" />

      {/* Page header */}
      <div>
        <div className="h-7 w-40 rounded bg-muted" />
        <div className="mt-2 h-4 w-56 rounded bg-muted" />
      </div>

      {/* Form field skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-10 w-full rounded-md bg-muted" />
        </div>
      ))}

      {/* Textarea skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="h-24 w-full rounded-md bg-muted" />
      </div>

      {/* Submit button */}
      <div className="h-10 w-36 rounded-md bg-muted" />
    </div>
  )
}
