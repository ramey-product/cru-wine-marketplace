'use client'

interface ProfileSummaryProps {
  summary: string
  onConfirm: () => void
  onAdjust: () => void
  isSubmitting?: boolean
}

export function ProfileSummary({
  summary,
  onConfirm,
  onAdjust,
  isSubmitting = false,
}: ProfileSummaryProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Here&apos;s what we think you&apos;ll love.</h2>
      </div>

      <blockquote className="rounded-lg border border-border bg-muted/50 p-6 text-base leading-relaxed text-foreground italic">
        {summary}
      </blockquote>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isSubmitting ? 'Saving...' : 'Looks right!'}
        </button>
        <button
          type="button"
          onClick={onAdjust}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          Not quite &rarr;
        </button>
      </div>
    </div>
  )
}
