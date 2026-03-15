'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImportStatus = 'processing' | 'completed' | 'failed'

interface ImportProgressProps {
  /** Current status of the import job. */
  status: ImportStatus
  /** Number of rows processed so far. */
  progress: number
  /** Total number of rows in the import. */
  total: number
  /** Error message to display when status === 'failed'. */
  errorMessage?: string
  /**
   * Called when the user clicks "Try Again" after a failure.
   * If omitted, the retry button is not rendered.
   */
  onRetry?: () => void
  /**
   * Optional polling callback — the host component calls this to tick
   * the import status forward. ImportProgress calls it every 3 seconds
   * while status === 'processing'.
   *
   * TODO: Replace with real API polling once import status endpoint exists.
   */
  onPoll?: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ImportProgress — visual progress indicator shown while a CSV import runs.
 *
 * - Processing: animated progress bar + "Processing row X of Y…" copy
 * - Completed: green success icon + summary copy
 * - Failed: red error icon + error message + optional retry button
 *
 * Polling:
 *   When `onPoll` is provided and `status === 'processing'`, this component
 *   fires `onPoll` every 3 seconds so the parent can fetch the latest status
 *   from the server.
 *   TODO: Replace with real API polling — `GET /api/v1/import-jobs/:id/status`
 */
export function ImportProgress({
  status,
  progress,
  total,
  errorMessage,
  onRetry,
  onPoll,
}: ImportProgressProps) {
  // ---------------------------------------------------------------------------
  // Polling effect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (status !== 'processing' || !onPoll) return

    // TODO: Poll import status via API every 3 seconds
    const intervalId = setInterval(() => {
      onPoll()
    }, 3000)

    return () => clearInterval(intervalId)
  }, [status, onPoll])

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------
  const safeTotal = total > 0 ? total : 1
  const rawPct = (progress / safeTotal) * 100
  const pct = clamp(Math.round(rawPct), 0, 100)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
      role="status"
      aria-live="polite"
      aria-label={
        status === 'processing'
          ? `Import in progress: ${pct}% complete`
          : status === 'completed'
            ? 'Import complete'
            : 'Import failed'
      }
    >
      {/* ------------------------------------------------------------------ */}
      {/* Processing state                                                     */}
      {/* ------------------------------------------------------------------ */}
      {status === 'processing' && (
        <>
          <Loader2
            className="mb-4 h-10 w-10 animate-spin text-primary"
            aria-hidden="true"
          />

          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Importing your inventory…
          </h3>

          <p className="mb-6 text-sm text-muted-foreground">
            {total > 0
              ? `Processing row ${Math.min(progress, total)} of ${total}`
              : 'Processing rows…'}
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-sm">
            <div
              className="overflow-hidden rounded-full bg-muted h-2"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Import progress: ${pct}%`}
            >
              <div
                className={cn(
                  'h-full rounded-full bg-primary transition-all duration-500 ease-out',
                  pct < 100 && 'animate-pulse'
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground/70">{pct}% complete</p>
          </div>

          <p className="mt-6 text-xs text-muted-foreground/70">
            Do not close this page while the import is running.
          </p>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Completed state                                                      */}
      {/* ------------------------------------------------------------------ */}
      {status === 'completed' && (
        <>
          <CheckCircle2
            className="mb-4 h-12 w-12 text-green-500"
            aria-hidden="true"
          />

          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Import complete
          </h3>

          <p className="text-sm text-muted-foreground">
            {total > 0
              ? `All ${total} row${total !== 1 ? 's' : ''} have been processed.`
              : 'Your CSV has been processed.'}
          </p>

          {/* Full progress bar shown as complete */}
          <div className="mt-6 w-full max-w-sm">
            <div
              className="overflow-hidden rounded-full bg-muted h-2"
              role="progressbar"
              aria-valuenow={100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Import progress: 100%"
            >
              <div className="h-full w-full rounded-full bg-emerald-500" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground/70">100% complete</p>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Failed state                                                         */}
      {/* ------------------------------------------------------------------ */}
      {status === 'failed' && (
        <>
          <XCircle
            className="mb-4 h-12 w-12 text-red-500"
            aria-hidden="true"
          />

          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Import failed
          </h3>

          {errorMessage ? (
            <p
              className="mb-6 text-sm text-red-600 max-w-sm"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : (
            <p className="mb-6 text-sm text-muted-foreground max-w-sm">
              An unexpected error occurred. Please try again or contact support
              if the problem persists.
            </p>
          )}

          {onRetry && (
            <Button
              type="button"
              variant="outline"
              onClick={onRetry}
              aria-label="Retry the import"
            >
              Try Again
            </Button>
          )}
        </>
      )}
    </div>
  )
}
