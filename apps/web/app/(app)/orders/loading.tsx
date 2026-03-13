export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-24 rounded bg-muted" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
