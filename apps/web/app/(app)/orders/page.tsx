import Link from 'next/link'
import { Package } from 'lucide-react'
import { OrderCard } from '@/components/features/orders/OrderCard'

export const metadata = {
  title: 'Orders | Cru',
  description: 'Your order history.',
}

type OrderStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled'

// TODO: Replace with real data from getOrdersByUser DAL call
const MOCK_ORDERS = [
  {
    id: 'order-1',
    orderNumber: 'CRU-4821',
    retailerName: 'Wine House Los Angeles',
    status: 'confirmed' as OrderStatus,
    total: 65.32,
    itemCount: 3,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    fulfillmentType: 'pickup' as const,
  },
  {
    id: 'order-2',
    orderNumber: 'CRU-4799',
    retailerName: 'The Cork & Bottle',
    status: 'completed' as OrderStatus,
    total: 42.18,
    itemCount: 1,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    fulfillmentType: 'delivery' as const,
  },
  {
    id: 'order-3',
    orderNumber: 'CRU-4756',
    retailerName: 'Wine House Los Angeles',
    status: 'cancelled' as OrderStatus,
    total: 120.0,
    itemCount: 4,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    fulfillmentType: 'pickup' as const,
  },
]

export default function OrdersPage() {
  const orders = MOCK_ORDERS

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
          <h2 className="text-lg font-medium">No orders yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            When you buy your first bottle, it will show up here.
          </p>
          <Link
            href="/wines"
            className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Browse wines
          </Link>
        </div>
      )}
    </div>
  )
}
