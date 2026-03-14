import { CheckCircle2, AlertTriangle, XCircle, Upload, Zap, Square, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type SyncStatus = 'healthy' | 'warning' | 'error'
type SyncSource = 'csv' | 'lightspeed' | 'square' | 'manual'

interface SyncStatusCardProps {
  syncSource: string
  lastSyncedAt: string | null
  nextSyncAt?: string | null
  status: SyncStatus
}

/** Normalize the raw syncSource string to a known enum value for display logic. */
function parseSyncSource(raw: string): SyncSource {
  const lower = raw.toLowerCase()
  if (lower === 'lightspeed') return 'lightspeed'
  if (lower === 'square') return 'square'
  if (lower === 'csv') return 'csv'
  return 'manual'
}

const SOURCE_CONFIG: Record<SyncSource, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  csv: { label: 'CSV Upload', Icon: Upload },
  lightspeed: { label: 'Lightspeed', Icon: Zap },
  square: { label: 'Square', Icon: Square },
  manual: { label: 'Manual', Icon: User },
}

const STATUS_CONFIG: Record<SyncStatus, {
  Icon: React.ComponentType<{ className?: string }>
  iconClass: string
  label: string
  badgeClass: string
}> = {
  healthy: {
    Icon: CheckCircle2,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    label: 'Sync healthy',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: 'text-amber-500 dark:text-amber-400',
    label: 'Sync delayed',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
  error: {
    Icon: XCircle,
    iconClass: 'text-destructive',
    label: 'Sync failed',
    badgeClass: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
  },
}

/**
 * Converts an ISO date string to a human-readable relative time label.
 * e.g. "4 hours ago", "2 days ago", "just now"
 */
function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffSecs = Math.floor(diffMs / 1_000)
  if (diffSecs < 60) return 'just now'
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
}

/**
 * Formats an ISO date string into a short absolute time, e.g. "Mar 14 at 2:30 PM".
 * Used for the "Next sync" display.
 */
function formatAbsolute(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * SyncStatusCard — Server Component.
 *
 * Displays the current POS sync health: source, last sync time (relative),
 * next scheduled sync (API-based sources only), and a health indicator badge.
 */
export function SyncStatusCard({ syncSource, lastSyncedAt, nextSyncAt, status }: SyncStatusCardProps) {
  const sourceKey = parseSyncSource(syncSource)
  const source = SOURCE_CONFIG[sourceKey]
  const statusCfg = STATUS_CONFIG[status]

  const isApiSource = sourceKey === 'lightspeed' || sourceKey === 'square'

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Source icon + label */}
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <source.Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">POS Sync</p>
            <p className="text-xs text-muted-foreground">{source.label}</p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            statusCfg.badgeClass
          )}
          aria-label={`Sync status: ${statusCfg.label}`}
        >
          <statusCfg.Icon className={cn('h-3.5 w-3.5', statusCfg.iconClass)} aria-hidden="true" />
          {statusCfg.label}
        </span>
      </div>

      {/* Timestamps */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last synced</span>
          <span className="font-medium">
            {lastSyncedAt ? (
              <time dateTime={lastSyncedAt} title={new Date(lastSyncedAt).toLocaleString()}>
                {relativeTime(lastSyncedAt)}
              </time>
            ) : (
              <span className="text-muted-foreground">Never</span>
            )}
          </span>
        </div>

        {/* Only show "Next sync" for API-integrated sources */}
        {isApiSource && nextSyncAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next sync</span>
            <time dateTime={nextSyncAt} className="font-medium">
              {formatAbsolute(nextSyncAt)}
            </time>
          </div>
        )}
      </div>
    </div>
  )
}
