import { cn } from '@/lib/utils'

interface InventorySummaryProps {
  totalListed: number
  inStock: number
  lowStock: number
  outOfStock: number
}

interface StatCardProps {
  label: string
  count: number
  percentage: number
  /** Tailwind utility classes applied to the count value. */
  countClass?: string
  /** Tailwind utility classes applied to the percentage pill. */
  pillClass?: string
}

/**
 * Formats a percentage to one decimal place, e.g. 68.7%.
 * Shows "0%" when total is zero to avoid NaN display.
 */
function formatPct(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 1000) / 10
}

function StatCard({ label, count, percentage, countClass, pillClass }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={cn('mt-2 text-3xl font-bold tabular-nums', countClass)}>
        {count.toLocaleString()}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            pillClass
          )}
          aria-label={`${percentage}% of total listed`}
        >
          {percentage}%
        </span>
        <span className="text-xs text-muted-foreground">of total</span>
      </div>
    </div>
  )
}

/**
 * InventorySummary — Server Component.
 *
 * Displays four stat cards summarising inventory health:
 * Total Listed, In Stock, Low Stock, Out of Stock.
 * Each card shows the count and its percentage of the total.
 *
 * TODO: Replace props with getInventorySummary DAL call.
 */
export function InventorySummary({ totalListed, inStock, lowStock, outOfStock }: InventorySummaryProps) {
  const inStockPct = formatPct(inStock, totalListed)
  const lowStockPct = formatPct(lowStock, totalListed)
  const outOfStockPct = formatPct(outOfStock, totalListed)

  return (
    <section aria-label="Inventory summary">
      <h2 className="text-base font-semibold mb-3">Inventory Overview</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Total Listed — neutral, no percentage pill needed */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Total Listed</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{totalListed.toLocaleString()}</p>
          <p className="mt-2 text-xs text-muted-foreground">SKUs in catalog</p>
        </div>

        <StatCard
          label="In Stock"
          count={inStock}
          percentage={inStockPct}
          countClass="text-emerald-700 dark:text-emerald-400"
          pillClass="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
        />

        <StatCard
          label="Low Stock"
          count={lowStock}
          percentage={lowStockPct}
          countClass="text-amber-600 dark:text-amber-400"
          pillClass="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
        />

        <StatCard
          label="Out of Stock"
          count={outOfStock}
          percentage={outOfStockPct}
          countClass="text-destructive"
          pillClass="bg-destructive/10 text-destructive dark:bg-destructive/20"
        />
      </div>
    </section>
  )
}
