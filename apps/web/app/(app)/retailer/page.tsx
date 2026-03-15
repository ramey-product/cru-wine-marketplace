import { OrderQueue, type MockOrder } from '@/components/features/retailer/OrderQueue'
import { DashboardGreeting } from '@/components/features/retailer/DashboardGreeting'
import { DashboardStatCards, type DashboardStats } from '@/components/features/retailer/DashboardStatCards'

export const metadata = {
  title: 'Dashboard | Retailer | Cru',
  description: 'Manage incoming orders, monitor inventory sync, and track daily revenue.',
}

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

// TODO: Replace with getRetailerOrders(supabase, orgId) DAL call
const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'CRU-2024-001',
    customerName: 'Sarah M.',
    itemCount: 3,
    total: 14500,
    fulfillmentType: 'pickup',
    status: 'pending' as OrderStatus,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min ago — no SLA badge
  },
  {
    id: 'order-2',
    orderNumber: 'CRU-2024-002',
    customerName: 'James K.',
    itemCount: 1,
    total: 8900,
    fulfillmentType: 'delivery',
    status: 'pending' as OrderStatus,
    createdAt: new Date(Date.now() - 95 * 60000).toISOString(), // 95 min ago — yellow SLA badge
  },
  {
    id: 'order-3',
    orderNumber: 'CRU-2024-003',
    customerName: 'Elena R.',
    itemCount: 6,
    total: 43200,
    fulfillmentType: 'pickup',
    status: 'confirmed' as OrderStatus,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'order-4',
    orderNumber: 'CRU-2024-004',
    customerName: 'David L.',
    itemCount: 2,
    total: 15600,
    fulfillmentType: 'pickup',
    status: 'ready_for_pickup' as OrderStatus,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'order-5',
    orderNumber: 'CRU-2024-005',
    customerName: 'Maria T.',
    itemCount: 4,
    total: 28700,
    fulfillmentType: 'delivery',
    status: 'completed' as OrderStatus,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'order-6',
    orderNumber: 'CRU-2024-006',
    customerName: 'Robert P.',
    itemCount: 1,
    total: 6200,
    fulfillmentType: 'pickup',
    status: 'cancelled' as OrderStatus,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

// TODO: Replace with getRetailerDashboardStats(supabase, orgId) DAL call
const MOCK_STATS: DashboardStats = {
  pendingOrderCount: MOCK_ORDERS.filter((o) => o.status === 'pending').length,
  todayRevenueCents: 124500, // $1,245.00
  todayRevenuePctChange: 12,  // +12% from yesterday
  lastSyncedAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
  syncStatus: 'healthy',
}

export default function RetailerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Personalised greeting + current date */}
      <DashboardGreeting storeName="Wine House Los Angeles" />

      {/* KPI stat cards: Pending Orders | Today's Revenue | Sync Status */}
      <DashboardStatCards stats={MOCK_STATS} />

      {/* Order queue */}
      <OrderQueue orders={MOCK_ORDERS} />
    </div>
  )
}
