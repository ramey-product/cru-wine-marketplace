export default function CartLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 rounded bg-muted" />
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="space-y-4">
          <div className="h-5 w-48 rounded bg-muted" />
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="h-20 w-14 rounded-md bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 rounded-lg bg-muted mt-8 lg:mt-0" />
      </div>
    </div>
  )
}
