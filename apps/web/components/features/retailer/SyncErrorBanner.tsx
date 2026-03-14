'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SyncSource = 'csv' | 'lightspeed' | 'square' | 'manual'

interface SyncErrorBannerProps {
  syncSource: string
  errorMessage: string
  onRetry?: () => void
}

function parseSyncSource(raw: string): SyncSource {
  const lower = raw.toLowerCase()
  if (lower === 'lightspeed') return 'lightspeed'
  if (lower === 'square') return 'square'
  if (lower === 'csv') return 'csv'
  return 'manual'
}

const SOURCE_DISPLAY: Record<SyncSource, string> = {
  csv: 'CSV',
  lightspeed: 'Lightspeed',
  square: 'Square',
  manual: 'Manual',
}

const SUPPORT_EMAIL = 'support@cru.wine'

/**
 * SyncErrorBanner — Client Component.
 *
 * Renders a destructive alert banner when the most recent sync has failed.
 * Content and actions are tailored to the sync source type:
 *   - CSV: prompts the user to re-upload
 *   - API (Lightspeed/Square): prompts reconnection or support contact
 *
 * This component must only be rendered when a sync error is present.
 */
export function SyncErrorBanner({ syncSource, errorMessage, onRetry }: SyncErrorBannerProps) {
  const sourceKey = parseSyncSource(syncSource)
  const sourceLabel = SOURCE_DISPLAY[sourceKey]
  const isCsv = sourceKey === 'csv'

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-start"
    >
      {/* Icon */}
      <AlertCircle
        className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
        aria-hidden="true"
      />

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-destructive">
          {isCsv
            ? 'Your last CSV upload failed'
            : `Connection issue with ${sourceLabel}`}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {errorMessage}
        </p>

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {isCsv ? (
            <>
              {onRetry && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRetry}
                  aria-label="Re-upload CSV inventory file"
                >
                  Re-upload CSV
                </Button>
              )}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=CSV%20Upload%20Issue`}
                className="text-sm font-medium text-destructive underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                aria-label="Contact support about CSV upload issue"
              >
                Contact Support
              </a>
            </>
          ) : (
            <>
              {onRetry && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRetry}
                  aria-label={`Reconnect ${sourceLabel} integration`}
                >
                  Reconnect {sourceLabel}
                </Button>
              )}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${sourceLabel} Sync Issue`)}`}
                className="text-sm font-medium text-destructive underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                aria-label="Contact support about sync issue"
              >
                Contact Support
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
