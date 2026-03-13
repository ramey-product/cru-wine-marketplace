interface SectionSkeletonProps {
  variant: 'carousel' | 'grid' | 'cta'
}

export function SectionSkeleton({ variant }: SectionSkeletonProps) {
  if (variant === 'cta') {
    return (
      <div className="rounded-xl bg-muted animate-pulse h-48" />
    )
  }

  if (variant === 'carousel') {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 rounded bg-muted animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] space-y-3">
              <div className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-5 w-40 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // grid variant
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 rounded bg-muted animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
