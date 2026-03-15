'use client'

/**
 * ImportSummary — results card displayed after a CSV import completes.
 *
 * Shows three stat cards (matched, pending review, errors) and action
 * buttons to navigate to the wine-matching review queue or restart the flow.
 *
 * Rendered inside CsvImportWizard (a client component) and receives an
 * onReset callback, so this must be a client component.
 */

import Link from 'next/link'
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImportSummaryProps {
  /** Rows successfully matched to a wine in the catalogue. */
  matched: number
  /** Rows queued for manual wine-matching review. */
  pendingReview: number
  /** Rows that failed validation and were not imported. */
  errors: number
  /** The sync_log_id returned by importCsvAction — used to filter the review queue. */
  syncLogId: string
  /**
   * Called when the user wants to start a new import.
   * This is a client-side callback so CsvImportWizard must pass it down.
   * The component is still a shared (non-'use client') file — the caller
   * wraps any interactive behaviour.
   */
  onReset: () => void
}

// ---------------------------------------------------------------------------
// Sub-component: stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  colorClass: string      // Tailwind text/bg classes for the value
  bgClass: string         // Card background tint
  borderClass: string     // Card border colour
}

function StatCard({ label, value, icon: Icon, colorClass, bgClass, borderClass }: StatCardProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-lg border ${borderClass} ${bgClass} px-6 py-5 text-center`}
    >
      <Icon className={`h-7 w-7 ${colorClass}`} aria-hidden="true" />
      <span className={`text-3xl font-bold ${colorClass}`}>{value.toLocaleString()}</span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ImportSummary — post-import results screen.
 *
 * Accessibility: stat cards use plain text values; screen readers will read
 * them naturally as part of the document. Interactive buttons have descriptive
 * aria-labels.
 */
export function ImportSummary({
  matched,
  pendingReview,
  errors,
  syncLogId,
  onReset,
}: ImportSummaryProps) {
  const total = matched + pendingReview + errors
  const successCount = matched + pendingReview

  return (
    <div>
      {/* Heading */}
      <h2 className="mb-1 text-xl font-semibold text-gray-900">Import Complete</h2>
      <p className="mb-6 text-sm text-gray-500">
        {successCount > 0 ? (
          <>
            <span className="font-medium text-gray-900">
              {successCount.toLocaleString()} wine{successCount !== 1 ? 's' : ''}
            </span>{' '}
            successfully imported.{' '}
            {pendingReview > 0 && (
              <>
                <span className="font-medium text-yellow-700">
                  {pendingReview.toLocaleString()}
                </span>{' '}
                pending manual review.
              </>
            )}
          </>
        ) : (
          'No rows were imported. Review the errors below.'
        )}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <StatCard
          label="Matched"
          value={matched}
          icon={CheckCircle2}
          colorClass="text-green-600"
          bgClass="bg-green-50"
          borderClass="border-green-200"
        />
        <StatCard
          label="Pending Review"
          value={pendingReview}
          icon={Clock}
          colorClass="text-yellow-600"
          bgClass="bg-yellow-50"
          borderClass="border-yellow-200"
        />
        <StatCard
          label="Errors"
          value={errors}
          icon={AlertTriangle}
          colorClass="text-red-600"
          bgClass="bg-red-50"
          borderClass="border-red-200"
        />
      </div>

      {/* Total processed note */}
      <p className="mb-6 text-xs text-gray-400 text-center">
        {total.toLocaleString()} total row{total !== 1 ? 's' : ''} processed
        {syncLogId && (
          <> &middot; Sync log: <span className="font-mono">{syncLogId}</span></>
        )}
      </p>

      <Separator className="mb-6" />

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        {/* "View Pending Reviews" navigates to the wine-matching queue filtered by this sync log */}
        {pendingReview > 0 ? (
          <Link
            href={`/admin/wine-matching?sync_log_id=${syncLogId}`}
            aria-label={`View ${pendingReview} pending wine matches in the review queue`}
          >
            {/* TODO: Update href when wine-matching supports sync_log_id filter param */}
            <Button>
              View Pending Reviews
            </Button>
          </Link>
        ) : (
          <Link
            href="/admin/wine-matching"
            aria-label="Go to the wine-matching review queue"
          >
            <Button variant="outline">
              View Match Queue
            </Button>
          </Link>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          aria-label="Start a new CSV import"
        >
          Import Another CSV
        </Button>
      </div>
    </div>
  )
}
