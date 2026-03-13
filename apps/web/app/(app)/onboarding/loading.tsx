export default function OnboardingLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-2 w-2 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
      <div className="space-y-6">
        <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
        <div className="flex flex-wrap gap-2 mt-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-10 w-24 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
