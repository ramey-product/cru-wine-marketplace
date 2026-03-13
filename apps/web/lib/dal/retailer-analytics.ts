import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// Types for materialized views (not in generated Database types)
// ---------------------------------------------------------------------------

export interface OrderSummaryByWeek {
  week: string
  total_orders: number
  gross_revenue_cents: number
  commission_cents: number
  net_payout_cents: number
  unique_customers: number
  avg_order_value_cents: number
}

export interface TopWine {
  wine_id: string
  wine_name: string
  order_count: number
  units_sold: number
  revenue_cents: number
}

export interface DashboardStats {
  pending_orders_count: number
  total_orders_today: number
  revenue_today_cents: number
}

// ---------------------------------------------------------------------------
// getOrderSummaryByWeek — weekly analytics from retailer_order_analytics MV
// ---------------------------------------------------------------------------

export async function getOrderSummaryByWeek(
  client: TypedClient,
  retailerId: string,
  opts?: { weeks?: number }
) {
  const weeks = opts?.weeks ?? 4

  const { data, error } = await client
    .from('retailer_order_analytics' as any)
    .select(
      'week, total_orders, gross_revenue_cents, commission_cents, net_payout_cents, unique_customers, avg_order_value_cents'
    )
    .eq('retailer_id', retailerId)
    .order('week', { ascending: false })
    .limit(weeks)

  if (error) {
    return { data: [], error }
  }

  return { data: (data ?? []) as unknown as OrderSummaryByWeek[], error: null }
}

// ---------------------------------------------------------------------------
// getTopWines — top selling wines from retailer_top_wines MV
// ---------------------------------------------------------------------------

export async function getTopWines(
  client: TypedClient,
  retailerId: string,
  opts?: { limit?: number }
) {
  const limit = opts?.limit ?? 10

  const { data, error } = await client
    .from('retailer_top_wines' as any)
    .select('wine_id, wine_name, order_count, units_sold, revenue_cents')
    .eq('retailer_id', retailerId)
    .order('revenue_cents', { ascending: false })
    .limit(limit)

  if (error) {
    return { data: [], error }
  }

  return { data: (data ?? []) as unknown as TopWine[], error: null }
}

// ---------------------------------------------------------------------------
// getRetailerDashboardStats — quick stats from orders table
// ---------------------------------------------------------------------------

export async function getRetailerDashboardStats(
  client: TypedClient,
  retailerId: string
): Promise<{ data: DashboardStats | null; error: any }> {
  // First get the retailer's org_id
  const { data: retailer, error: retailerError } = await client
    .from('retailers')
    .select('org_id')
    .eq('id', retailerId)
    .single()

  if (retailerError || !retailer) {
    return { data: null, error: retailerError ?? new Error('Retailer not found') }
  }

  const orgId = retailer.org_id
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayISO = todayStart.toISOString()

  // Run queries in parallel
  const [pendingResult, todayResult] = await Promise.all([
    // Pending orders count
    client
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'pending'),
    // Today's orders
    client
      .from('orders')
      .select('id, total')
      .eq('org_id', orgId)
      .gte('created_at', todayISO),
  ])

  if (pendingResult.error) {
    return { data: null, error: pendingResult.error }
  }
  if (todayResult.error) {
    return { data: null, error: todayResult.error }
  }

  const todayOrders = todayResult.data ?? []
  // orders.total is already stored as integer cents (e.g. 1299 = $12.99)
  const revenueTodayCents = todayOrders.reduce(
    (sum, order) => sum + (order.total ?? 0),
    0
  )

  return {
    data: {
      pending_orders_count: pendingResult.count ?? 0,
      total_orders_today: todayOrders.length,
      revenue_today_cents: revenueTodayCents,
    },
    error: null,
  }
}

// ---------------------------------------------------------------------------
// maskFinancialFields — zero out financial data for non-owner roles
// ---------------------------------------------------------------------------

const FINANCIAL_KEYS = [
  'gross_revenue_cents',
  'commission_cents',
  'net_payout_cents',
  'avg_order_value_cents',
  'revenue_cents',
  'revenue_today_cents',
] as const

export function maskFinancialFields<T extends Record<string, any>>(
  data: T[],
  role: string
): T[] {
  if (role === 'owner') {
    return data
  }

  return data.map((item) => {
    const masked = { ...item }
    for (const key of FINANCIAL_KEYS) {
      if (key in masked) {
        ;(masked as any)[key] = null
      }
    }
    return masked
  })
}
