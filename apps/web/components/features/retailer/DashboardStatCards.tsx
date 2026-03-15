import { ClipboardList, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DashboardStats {
  /** Number of orders with status === 'pending' */
  pendingOrderCount: number
  /**
   * Today's gross revenue in cents.
   * e.g. 124500 → "$1,245.00"
   */
  todayRevenueCents: number
  /**
   * Percentage change in revenue compared to yesterday.
   * Positive = up, negative = down, null = no prior data.
   */
  todayRevenuePctChange: number | null
  /**
   * ISO timestamp of the most recent successful inventory sync.
   * null means the store has never synced.
   */
  lastSyncedAt: string | null
  /** Overall sync health — drives the dot colour. */
  syncStatus: 'healthy' | 'warning' | 'error'
}

interface DashboardStatCardsProps {
  stats: DashboardStats
}

/** Formats a cent value as a USD string. e.g. 124500 → "$1,245.00" */
function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

/**
 * Converts an ISO timestamp to a short relative time label.
 * e.g. "5 min ago", "2 hrs ago", "3 days ago", "just now"
 */
function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffSecs = Math.floor(diffMs / 1_000)
  if (diffSecs < 60) return 'just now'
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'min'} ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
}

const SYNC_DOT_CLASS: Record<DashboardStats['syncStatus'], string> = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-400',
  error: 'bg-destructive',
}

const SYNC_LABEL: Record<DashboardStats['syncStatus'], string> = {
  healthy: 'Sync healthy',
  warning: 'Sync delayed',
  error: 'Sync failed',
}

/**
 * DashboardStatCards — Server Component.
 *
 * Renders the three KPI stat cards shown at the top of the Retailer Dashboard
 * overview page (UX Design Bible § 9.10):
 *   1. Pending Orders
 *   2. Today's Revenue  (masked per role — TODO once role context is wired)
 *   3. Sync Status
 *
 * Intentionally lightweight — each card is a styled div, not a full card
 * primitive, so the compact density matches the wireframe.
 *
 * TODO: Replace `DashboardStats` mock with getRetailerDashboardStats(supabase, orgId) DAL call.
 */
export function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  const {
    pendingOrderCount,
    todayRevenueCents,
    todayRevenuePctChange,
    lastSyncedAt,
    syncStatus,
  } = stats

  const revenueLabel = formatCents(todayRevenueCents)
  const syncLabel = lastSyncedAt ? `Last synced ${relativeTime(lastSyncedAt)}` : 'Never synced'
  const revenueTrendPositive = todayRevenuePctChange !== null && todayRevenuePctChange >= 0

  return (
    <section
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      aria-label="Dashboard overview statistics"
    >
      {/* --- Card 1: Pending Orders --- */}
      <div
        className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-4"
        aria-label={`${pendingOrderCount} pending ${pendingOrderCount === 1 ? 'order' : 'orders'}`}
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10"
          aria-hidden="true"
        >
          <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {pendingOrderCount}
          </p>
          <p className="text-xs text-muted-foreground">
            {pendingOrderCount === 1 ? 'Pending order' : 'Pending orders'}
          </p>
        </div>
      </div>

      {/* --- Card 2: Today's Revenue --- */}
      <div
        className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-4"
        aria-label={`Today's revenue: ${revenueLabel}`}
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10"
          aria-hidden="true"
        >
          <DollarSign className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {revenueLabel}
          </p>
          {todayRevenuePctChange !== null ? (
            <p
              className={cn(
                'text-xs font-medium',
                revenueTrendPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-destructive'
              )}
              aria-label={`${revenueTrendPositive ? 'Up' : 'Down'} ${Math.abs(todayRevenuePctChange)}% from yesterday`}
            >
              {revenueTrendPositive ? '+' : ''}
              {todayRevenuePctChange}% from yesterday
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Today's revenue</p>
          )}
        </div>
      </div>

      {/* --- Card 3: Sync Status --- */}
      <div
        className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-4"
        aria-label={`Sync status: ${SYNC_LABEL[syncStatus]}. ${syncLabel}`}
      >
        {/* Coloured status dot */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted"
          aria-hidden="true"
        >
          <span
            className={cn(
              'block h-2.5 w-2.5 rounded-full',
              SYNC_DOT_CLASS[syncStatus]
            )}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {SYNC_LABEL[syncStatus]}
          </p>
          <p className="text-xs text-muted-foreground">{syncLabel}</p>
        </div>
      </div>
    </section>
  )
}
