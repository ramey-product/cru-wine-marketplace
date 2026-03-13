export default function CheckoutLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 rounded bg-muted" />
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="space-y-6">
          <div className="h-20 rounded-lg bg-muted" />
          <div className="h-24 rounded-lg bg-muted" />
          <div className="h-16 rounded-lg bg-muted" />
        </div>
        <div className="h-80 rounded-lg bg-muted mt-8 lg:mt-0" />
      </div>
    </div>
  )
}
