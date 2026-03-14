export interface WineRank {
  /** Wine identifier */
  wineId: string
  /** Display name of the wine */
  wineName: string
  /** Producer / winery name */
  producer: string
  /**
   * The metric count for this list.
   * In the orders list this is order count; in views list it is view count.
   */
  count: number
}

interface TopWinesListProps {
  topByOrders: WineRank[]
  topByViews: WineRank[]
}

interface RankedListProps {
  title: string
  items: WineRank[]
  countLabel: string
  emptyMessage: string
}

function RankedList({ title, items, countLabel, emptyMessage }: RankedListProps) {
  return (
    <div className="flex-1 min-w-0 rounded-lg border border-border bg-card">
      {/* List header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-12 px-5">
          <p className="text-sm text-center text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <ol className="divide-y divide-border" aria-label={title}>
          {items.map((item, index) => (
            <li
              key={item.wineId}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              {/* Rank number */}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground tabular-nums"
                aria-label={`Rank ${index + 1}`}
              >
                {index + 1}
              </span>

              {/* Wine info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.wineName}</p>
                <p className="text-xs text-muted-foreground truncate">{item.producer}</p>
              </div>

              {/* Count */}
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular-nums">
                  {item.count.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{countLabel}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/**
 * TopWinesList — Server Component.
 *
 * Renders two side-by-side ranked lists:
 *   1. Top wines by order count
 *   2. Top wines by page view count
 *
 * V1 uses a simple ordered list — no charts.
 * Empty state is shown individually per list.
 *
 * TODO: Replace props with getTopWines DAL call.
 */
export function TopWinesList({ topByOrders, topByViews }: TopWinesListProps) {
  return (
    <section aria-label="Top performing wines">
      <h2 className="text-base font-semibold mb-3">Top Wines</h2>
      <div className="flex flex-col gap-4 lg:flex-row">
        <RankedList
          title="Most Ordered"
          items={topByOrders}
          countLabel="orders"
          emptyMessage="No orders yet. Your top wines will appear here once you start receiving orders on Cru."
        />
        <RankedList
          title="Most Viewed"
          items={topByViews}
          countLabel="views"
          emptyMessage="No views yet. Wine page views will appear here once customers start browsing your listings."
        />
      </div>
    </section>
  )
}
