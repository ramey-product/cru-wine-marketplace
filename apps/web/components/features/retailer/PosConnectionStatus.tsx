import { Plug, PlugZap, AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ConnectionStatus = 'connected' | 'disconnected' | 'error'

interface PosConnectionStatusProps {
  connectionType: string
  lastSync: string | null
  status: ConnectionStatus
}

// Map status values to their display properties
const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; dotClass: string; Icon: React.ElementType }
> = {
  connected: {
    label: 'Connected',
    dotClass: 'bg-green-500',
    Icon: PlugZap,
  },
  disconnected: {
    label: 'Disconnected',
    dotClass: 'bg-muted-foreground',
    Icon: Plug,
  },
  error: {
    label: 'Connection Error',
    dotClass: 'bg-destructive',
    Icon: AlertTriangle,
  },
}

/**
 * Read-only card showing the current POS integration status.
 * Action buttons are rendered but not wired — see the TODO below.
 *
 * This is a Server Component: no 'use client' directive required.
 */
export function PosConnectionStatus({
  connectionType,
  lastSync,
  status,
}: PosConnectionStatusProps) {
  const config = STATUS_CONFIG[status]
  const StatusIcon = config.Icon

  // Format the last sync timestamp into a human-readable string
  let lastSyncLabel = 'Never synced'
  if (lastSync) {
    const date = new Date(lastSync)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) {
      lastSyncLabel = 'Just now'
    } else if (diffMins < 60) {
      lastSyncLabel = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else {
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) {
        lastSyncLabel = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      } else {
        lastSyncLabel = date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      }
    }
  }

  return (
    <div
      className="rounded-lg border border-border bg-background p-4"
      aria-label={`POS connection: ${connectionType}, status ${config.label}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              status === 'connected'
                ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
                : status === 'error'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <StatusIcon className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <p className="text-sm font-medium">{connectionType}</p>

            {/* Status indicator row */}
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className={cn('h-2 w-2 rounded-full shrink-0', config.dotClass)}
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>

            {/* Last sync */}
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              <span>Last synced {lastSyncLabel}</span>
            </div>

            {/* Error message — only shown in error state */}
            {status === 'error' && (
              <p className="mt-2 text-xs text-destructive" role="alert">
                Unable to reach the POS system. Check your integration credentials and try
                reconnecting.
              </p>
            )}
          </div>
        </div>

        {/* Right: action button */}
        {/* TODO: Wire to POS connection flow from Epic 06 */}
        <div className="shrink-0">
          {status === 'connected' ? (
            <Button
              variant="destructive"
              size="sm"
              aria-label={`Disconnect ${connectionType} POS integration`}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              aria-label={`Reconnect ${connectionType} POS integration`}
            >
              Reconnect
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
