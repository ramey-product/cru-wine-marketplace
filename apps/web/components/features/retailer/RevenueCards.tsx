import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WeekStats {
  /** Number of orders placed */
  orders: number
  /** Gross revenue in cents */
  grossRevenueCents: number
  /** Platform commission in cents */
  commissionCents: number
  /** Net payout to retailer in cents (gross - commission) */
  netPayoutCents: number
}

interface RevenueCardsProps {
  thisWeek: WeekStats
  lastWeek: WeekStats
  role: 'owner' | 'staff'
}

interface CardConfig {
  title: string
  value: string
  trend: number | null
  /** Whether this field is financial and should be masked for staff. */
  isFinancial: boolean
}

/**
 * Formats a cent value as a USD dollar string.
 * e.g. 123456 → "$1,234.56"
 */
function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

/**
 * Calculates the percentage change from `prev` to `curr`.
 * Returns null when prev is 0 (avoids division by zero / infinity).
 */
function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return null
  return Math.round(((curr - prev) / prev) * 1000) / 10
}

interface TrendIndicatorProps {
  pct: number | null
}

function TrendIndicator({ pct }: TrendIndicatorProps) {
  if (pct === null) {
    return <span className="text-xs text-muted-foreground">No prior data</span>
  }

  const isUp = pct > 0
  const isFlat = pct === 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        isFlat && 'text-muted-foreground',
        isUp && 'text-emerald-600 dark:text-emerald-400',
        !isFlat && !isUp && 'text-destructive'
      )}
      aria-label={`${isUp ? 'Up' : isFlat ? 'Unchanged' : 'Down'} ${Math.abs(pct)}% vs last week`}
    >
      {isFlat
        ? <Minus className="h-3 w-3" aria-hidden="true" />
        : isUp
          ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
      }
      {Math.abs(pct)}%
      <span className="text-muted-foreground font-normal ml-0.5">vs last week</span>
    </span>
  )
}

/**
 * RevenueCards — Server Component.
 *
 * Displays four KPI cards for the current week:
 *   Orders | Gross Revenue | Commission | Net Payout
 *
 * Financial fields (revenue, commission, payout) are masked for staff roles.
 * Each card shows a trend arrow comparing this week to last week.
 *
 * TODO: Replace props with getRetailerDashboardStats and maskFinancialFields DAL calls.
 */
export function RevenueCards({ thisWeek, lastWeek, role }: RevenueCardsProps) {
  const isOwner = role === 'owner'

  const cards: CardConfig[] = [
    {
      title: 'Orders This Week',
      value: thisWeek.orders.toLocaleString(),
      trend: pctChange(thisWeek.orders, lastWeek.orders),
      isFinancial: false,
    },
    {
      title: 'Gross Revenue',
      value: formatCents(thisWeek.grossRevenueCents),
      trend: pctChange(thisWeek.grossRevenueCents, lastWeek.grossRevenueCents),
      isFinancial: true,
    },
    {
      title: 'Platform Commission',
      value: formatCents(thisWeek.commissionCents),
      trend: pctChange(thisWeek.commissionCents, lastWeek.commissionCents),
      isFinancial: true,
    },
    {
      title: 'Net Payout',
      value: formatCents(thisWeek.netPayoutCents),
      trend: pctChange(thisWeek.netPayoutCents, lastWeek.netPayoutCents),
      isFinancial: true,
    },
  ]

  return (
    <section aria-label="Revenue summary">
      <h2 className="text-base font-semibold mb-3">This Week</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => {
          const masked = card.isFinancial && !isOwner

          return (
            <div key={card.title} className="rounded-lg border border-border bg-card p-5">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>

              {masked ? (
                /* Staff — show masked placeholder with tooltip-style note */
                <div className="mt-2">
                  <div
                    className="flex items-center gap-1.5"
                    title="Owner access required to view financial data"
                  >
                    <span
                      className="text-3xl font-bold text-muted-foreground/40 select-none"
                      aria-label="Owner access required"
                    >
                      —
                    </span>
                    <Info
                      className="h-4 w-4 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Owner access required
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-3xl font-bold tabular-nums">{card.value}</p>
                  <div className="mt-2">
                    <TrendIndicator pct={card.trend} />
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
