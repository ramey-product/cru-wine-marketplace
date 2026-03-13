export default function UserProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-6">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
