'use client'

export default function ProducerProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="space-y-4 text-center py-16">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <svg
          className="h-6 w-6 text-destructive"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-foreground">Could not load producer profile</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {error.message || 'An unexpected error occurred while loading this producer.'}
      </p>
      <button
        onClick={reset}
        aria-label="Try again"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150"
      >
        Try again
      </button>
    </div>
  )
}
