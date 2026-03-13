import { WineCardSkeleton } from '@/components/features/wines/WineCardSkeleton'

export default function ProducerProfileLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Breadcrumbs skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-muted" />
        <div className="h-4 w-3 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-4 w-3 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>

      {/* Hero image */}
      <div className="aspect-video rounded-lg bg-muted" />

      {/* Producer name + tagline */}
      <div className="space-y-2">
        <div className="h-10 w-64 rounded bg-muted" />
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="h-5 w-72 rounded bg-muted" />
      </div>

      {/* Story + Quick Facts */}
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
        <div className="space-y-4">
          <div className="h-7 w-24 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
        <div className="mt-6 lg:mt-0">
          <div className="h-6 w-24 rounded bg-muted mb-4" />
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div className="h-10 w-full rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Photo gallery skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-16 rounded bg-muted" />
        <div className="flex gap-4 overflow-hidden">
          <div className="flex-shrink-0 w-72 sm:w-80 aspect-[4/3] rounded-lg bg-muted" />
          <div className="flex-shrink-0 w-72 sm:w-80 aspect-[4/3] rounded-lg bg-muted" />
          <div className="flex-shrink-0 w-72 sm:w-80 aspect-[4/3] rounded-lg bg-muted" />
        </div>
      </div>

      {/* Wine grid skeleton */}
      <div className="space-y-6">
        <div className="h-7 w-48 rounded bg-muted" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <WineCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
