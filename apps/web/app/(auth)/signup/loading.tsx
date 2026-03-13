export default function SignupLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2 flex flex-col items-center">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-4 w-56 rounded bg-muted" />
      </div>

      <div className="space-y-3">
        <div className="h-10 w-full rounded-lg bg-muted" />
        <div className="h-10 w-full rounded-lg bg-muted" />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-muted" />
        <div className="h-4 w-6 rounded bg-muted" />
        <div className="h-px flex-1 bg-muted" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-12 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
        <div className="h-10 w-full rounded-lg bg-muted" />
      </div>

      <div className="flex justify-center">
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  )
}
