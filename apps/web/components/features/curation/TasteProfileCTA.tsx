import Link from 'next/link'

export function TasteProfileCTA() {
  return (
    <section aria-label="Build your taste profile">
      <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            aria-hidden="true"
          >
            <path d="M8 22h8" />
            <path d="M7 10h10" />
            <path d="M12 15v7" />
            <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Tell us what you like.</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          In 2 minutes, we&apos;ll learn your taste and show you wines you&apos;ll actually love.
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link
            href="/onboarding"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Build My Taste Profile
          </Link>
          <Link
            href="/wines"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Maybe later
          </Link>
        </div>
      </div>
    </section>
  )
}
