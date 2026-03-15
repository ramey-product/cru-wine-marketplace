import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { OrderStatusBadge } from '@/components/features/orders/OrderStatusBadge'
import {
  OrderTrackingClient,
  type OrderTrackingData,
} from '@/components/features/orders/OrderTrackingClient'
import type { OrderStatus } from '@/lib/order-tracking/types'
import type { FulfillmentType } from '@/lib/order-tracking/types'

// TODO: Replace with real data from getOrderWithTracking DAL call
const MOCK_ORDER_DETAIL: OrderTrackingData = {
  id: 'order-1',
  orderNumber: 'CRU-4821',
  status: 'confirmed' as OrderStatus,
  fulfillmentType: 'pickup' as FulfillmentType,
  retailer: {
    name: 'Wine House Los Angeles',
    address: '1234 Vine Street, Los Angeles, CA 90028',
    phone: '(323) 555-0100',
    email: 'orders@winehousela.com',
    lat: 34.0978,
    lng: -118.3267,
  },
  items: [
    {
      id: 'li-1',
      wineId: 'wine-1',
      wineName: 'Bandol Rosé 2023',
      producer: 'Domaine Tempier',
      quantity: 2,
      unitPrice: 2800,
      subtotal: 5600,
    },
    {
      id: 'li-2',
      wineId: 'wine-2',
      wineName: 'Cloudy Bay Sauvignon Blanc',
      producer: 'Cloudy Bay',
      quantity: 1,
      unitPrice: 2200,
      subtotal: 2200,
    },
  ],
  subtotal: 7800,
  deliveryFee: 0,
  tax: 741,
  total: 8541,
  createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  estimatedReadyAt: new Date(Date.now() + 2 * 3600000).toISOString(),
  statusHistory: [
    {
      id: 'sh-2',
      status: 'confirmed',
      changed_by: null,
      notes: 'Your order has been confirmed by the retailer.',
      created_at: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
    },
    {
      id: 'sh-1',
      status: 'pending',
      changed_by: null,
      notes: 'Order placed',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>
}): Promise<Metadata> {
  const { orderId } = await params
  // TODO: Fetch real order for dynamic title
  return {
    title: `Order #${MOCK_ORDER_DETAIL.orderNumber} | Cru`,
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  // TODO: Replace with real DAL call
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // const { data: order } = await getOrderWithTracking(supabase, orderId)
  const order = MOCK_ORDER_DETAIL

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Order #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Tracking client — handles real-time updates and all detail sections */}
      <OrderTrackingClient order={order} />
    </div>
  )
}
