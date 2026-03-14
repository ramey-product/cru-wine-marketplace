import { ClipboardList } from 'lucide-react'
import { OrderQueue, type MockOrder } from '@/components/features/retailer/OrderQueue'

export const metadata = {
  title: 'Order Queue | Retailer Dashboard | Cru',
  description: 'Manage incoming orders, confirm fulfillment, and track order status.',
}

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

// TODO: Replace with getRetailerOrders(supabase, retailerId) DAL call
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

export default function RetailerDashboardPage() {
  const orders = MOCK_ORDERS
  const pendingCount = orders.filter((o) => o.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">
              {pendingCount === 1 ? 'Pending order' : 'Pending orders'}
            </p>
          </div>
        </div>
      </div>

      {/* Order queue */}
      <OrderQueue orders={orders} />
    </div>
  )
}
