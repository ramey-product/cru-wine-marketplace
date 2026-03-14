import { Suspense } from 'react'
import { RevenueCards, type WeekStats } from '@/components/features/retailer/RevenueCards'
import { TopWinesList, type WineRank } from '@/components/features/retailer/TopWinesList'
import { OrderSummaryTable, type WeekSummary } from '@/components/features/retailer/OrderSummaryTable'
import { Separator } from '@/components/ui/separator'

// ---------------------------------------------------------------------------
// Mock data
// TODO: Replace with real DAL calls:
//   const summaries    = await getOrderSummaryByWeek(supabase, orgId, { weeks: 4 })
//   const topWines     = await getTopWines(supabase, orgId)
//   const dashStats    = await getRetailerDashboardStats(supabase, orgId)
//   const role         = membership.role  // derive from authenticated session
// ---------------------------------------------------------------------------

/** The four most recent weekly summaries, newest first. */
const MOCK_WEEK_SUMMARIES: WeekSummary[] = [
  {
    weekStartDate: '2026-03-09',
    orderCount: 47,
    grossRevenueCents: 1_284_500,
    commissionCents: 128_450,
    netPayoutCents: 1_156_050,
  },
  {
    weekStartDate: '2026-03-02',
    orderCount: 39,
    grossRevenueCents: 1_027_300,
    commissionCents: 102_730,
    netPayoutCents: 924_570,
  },
  {
    weekStartDate: '2026-02-23',
    orderCount: 52,
    grossRevenueCents: 1_419_800,
    commissionCents: 141_980,
    netPayoutCents: 1_277_820,
  },
  {
    weekStartDate: '2026-02-16',
    orderCount: 44,
    grossRevenueCents: 1_132_600,
    commissionCents: 113_260,
    netPayoutCents: 1_019_340,
  },
]

/** Derive this-week and last-week stats from the summary list for the KPI cards. */
function toWeekStats(summary: WeekSummary): WeekStats {
  return {
    orders: summary.orderCount,
    grossRevenueCents: summary.grossRevenueCents,
    commissionCents: summary.commissionCents,
    netPayoutCents: summary.netPayoutCents,
  }
}

const MOCK_THIS_WEEK: WeekStats = toWeekStats(MOCK_WEEK_SUMMARIES[0]!)
const MOCK_LAST_WEEK: WeekStats = toWeekStats(MOCK_WEEK_SUMMARIES[1]!)

const MOCK_TOP_BY_ORDERS: WineRank[] = [
  { wineId: 'w-001', wineName: 'Bandol Rosé', producer: 'Domaine Tempier', count: 14 },
  { wineId: 'w-004', wineName: 'Opus One', producer: 'Opus One Winery', count: 11 },
  { wineId: 'w-002', wineName: 'Monte Bello', producer: 'Ridge Vineyards', count: 9 },
  { wineId: 'w-006', wineName: 'To-Kalon Vineyard Cabernet', producer: 'Robert Mondavi', count: 7 },
  { wineId: 'w-003', wineName: 'Sonoma Mountain Chardonnay', producer: 'Kistler Vineyards', count: 6 },
]

const MOCK_TOP_BY_VIEWS: WineRank[] = [
  { wineId: 'w-007', wineName: 'Screaming Eagle Cabernet', producer: 'Screaming Eagle', count: 312 },
  { wineId: 'w-004', wineName: 'Opus One', producer: 'Opus One Winery', count: 287 },
  { wineId: 'w-005', wineName: 'Special Selection Cabernet', producer: 'Caymus Vineyards', count: 241 },
  { wineId: 'w-001', wineName: 'Bandol Rosé', producer: 'Domaine Tempier', count: 198 },
  { wineId: 'w-002', wineName: 'Monte Bello', producer: 'Ridge Vineyards', count: 176 },
]

/**
 * Returns true when there is no order history to show.
 * Used to gate the analytics empty state.
 */
function hasNoData(weeks: WeekSummary[]): boolean {
  return weeks.length === 0 || weeks.every((w) => w.orderCount === 0)
}

/**
 * Retailer Analytics page — Server Component.
 *
 * Displays:
 *   1. Revenue KPI cards (this week vs last week)
 *   2. Top wines by orders and views
 *   3. Weekly order summary table (last 4 weeks)
 *
 * Role is set to 'owner' in mock data — financial fields are fully visible.
 * Staff members would see "—" in financial columns.
 *
 * TODO: Replace mock data with DAL calls listed above.
 * TODO: Derive `role` from authenticated session membership.
 */
export default function RetailerAnalyticsPage() {
  // TODO: Replace with real role from authenticated membership
  const role: 'owner' | 'staff' = 'owner'

  const isEmpty = hasNoData(MOCK_WEEK_SUMMARIES)

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your sales performance and top-selling wines.
        </p>
      </div>

      <Separator />

      {isEmpty ? (
        /* Empty state — no orders yet */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            {/* Bar chart icon inline to avoid additional import */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.5V19a1 1 0 001 1h16a1 1 0 001-1v-5.5M3 9.5V5a1 1 0 011-1h4v9.5M10 14V7a1 1 0 011-1h2a1 1 0 011 1v7M17 14V9a1 1 0 011-1h2a1 1 0 011 1v5"
              />
            </svg>
          </div>
          <p className="text-base font-semibold">No analytics yet</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Your analytics will appear here once you start receiving orders on Cru.
          </p>
        </div>
      ) : (
        <>
          {/* Revenue KPI cards */}
          <Suspense fallback={<div className="h-44 animate-pulse rounded-lg bg-muted" />}>
            <RevenueCards
              thisWeek={MOCK_THIS_WEEK}
              lastWeek={MOCK_LAST_WEEK}
              role={role}
            />
          </Suspense>

          {/* Top wines */}
          <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-muted" />}>
            <TopWinesList
              topByOrders={MOCK_TOP_BY_ORDERS}
              topByViews={MOCK_TOP_BY_VIEWS}
            />
          </Suspense>

          {/* Weekly order summary table */}
          <Suspense fallback={<div className="h-56 animate-pulse rounded-lg bg-muted" />}>
            <OrderSummaryTable
              weeks={MOCK_WEEK_SUMMARIES}
              role={role}
            />
          </Suspense>
        </>
      )}
    </div>
  )
}
