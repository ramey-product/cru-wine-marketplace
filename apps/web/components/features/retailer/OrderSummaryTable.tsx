import { cn } from '@/lib/utils'

export interface WeekSummary {
  /** ISO date string of the week start (Monday) */
  weekStartDate: string
  /** Total number of orders in this week */
  orderCount: number
  /** Gross revenue in cents */
  grossRevenueCents: number
  /** Platform commission in cents */
  commissionCents: number
  /** Net payout in cents (gross - commission) */
  netPayoutCents: number
}

interface OrderSummaryTableProps {
  weeks: WeekSummary[]
  role: 'owner' | 'staff'
}

/**
 * Formats a cent integer as a USD dollar string.
 * e.g. 98765 → "$987.65"
 */
function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

/**
 * Formats the week start date as a readable range label.
 * e.g. "Mar 10 – Mar 16"
 */
function formatWeekRange(isoDate: string): string {
  const start = new Date(isoDate)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return `${fmt(start)} – ${fmt(end)}`
}

/**
 * OrderSummaryTable — Server Component.
 *
 * Renders a semantically correct HTML table of weekly order summaries.
 * Financial columns (Gross Revenue, Commission, Net Payout) are masked
 * with "—" for staff roles.
 *
 * Columns: Week | Orders | Gross Revenue | Commission | Net Payout
 *
 * TODO: Replace props with getOrderSummaryByWeek DAL call.
 */
export function OrderSummaryTable({ weeks, role }: OrderSummaryTableProps) {
  const isOwner = role === 'owner'

  const financialClass = cn(
    'text-right tabular-nums',
    !isOwner && 'text-muted-foreground/40 select-none'
  )

  return (
    <section aria-label="Weekly order summary">
      <h2 className="text-base font-semibold mb-3">Weekly Summary</h2>

      {weeks.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No order data yet. Your weekly summaries will appear here once you start receiving orders on Cru.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm" aria-label="Weekly order summary by week">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Week
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Orders
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Gross Revenue
                  {!isOwner && <span className="sr-only"> (hidden)</span>}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Commission
                  {!isOwner && <span className="sr-only"> (hidden)</span>}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Net Payout
                  {!isOwner && <span className="sr-only"> (hidden)</span>}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {weeks.map((week, index) => {
                const isLatest = index === 0

                return (
                  <tr
                    key={week.weekStartDate}
                    className={cn(
                      'bg-card transition-colors hover:bg-muted/30',
                      isLatest && 'font-medium'
                    )}
                  >
                    {/* Week range */}
                    <td className="px-4 py-3 text-left">
                      <span>{formatWeekRange(week.weekStartDate)}</span>
                      {isLatest && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Current
                        </span>
                      )}
                    </td>

                    {/* Orders — always visible */}
                    <td className="px-4 py-3 text-right tabular-nums">
                      {week.orderCount.toLocaleString()}
                    </td>

                    {/* Financial columns — masked for staff */}
                    <td className={cn('px-4 py-3', financialClass)}>
                      {isOwner ? formatCents(week.grossRevenueCents) : (
                        <span aria-label="Owner access required">—</span>
                      )}
                    </td>
                    <td className={cn('px-4 py-3', financialClass)}>
                      {isOwner ? formatCents(week.commissionCents) : (
                        <span aria-label="Owner access required">—</span>
                      )}
                    </td>
                    <td className={cn('px-4 py-3', financialClass)}>
                      {isOwner ? formatCents(week.netPayoutCents) : (
                        <span aria-label="Owner access required">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff notice */}
      {!isOwner && weeks.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Financial columns are visible to account owners only.
        </p>
      )}
    </section>
  )
}
