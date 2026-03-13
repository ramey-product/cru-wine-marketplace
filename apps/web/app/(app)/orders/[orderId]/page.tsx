import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import { Separator } from '@/components/ui/separator'
import { OrderStatusBadge } from '@/components/features/orders/OrderStatusBadge'
import { OrderStatusTimeline } from '@/components/features/orders/OrderStatusTimeline'

type OrderStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled'

// TODO: Replace with real data from getOrderById DAL call
const MOCK_ORDER_DETAIL = {
  id: 'order-1',
  orderNumber: 'CRU-4821',
  status: 'confirmed' as OrderStatus,
  fulfillmentType: 'pickup' as const,
  retailer: {
    name: 'Wine House Los Angeles',
    address: '1234 Vine Street, Los Angeles, CA 90028',
    phone: '(323) 555-0100',
  },
  items: [
    { id: 'li-1', wineName: 'Bandol Rose 2023', producer: 'Domaine Tempier', quantity: 2, price: 28.0 },
    { id: 'li-2', wineName: 'Cloudy Bay Sauvignon Blanc', producer: 'Cloudy Bay', quantity: 1, price: 22.0 },
  ],
  subtotal: 78.0,
  deliveryFee: 0,
  tax: 7.41,
  total: 85.41,
  createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  statusHistory: [
    {
      status: 'confirmed',
      label: 'Order confirmed',
      timestamp: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
      notes: 'Your order has been confirmed by the retailer.',
    },
    {
      status: 'pending',
      label: 'Order placed',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      notes: null,
    },
  ],
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>
}): Promise<Metadata> {
  const { orderId } = await params
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
  const order = MOCK_ORDER_DETAIL // TODO: Fetch by orderId

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
          <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        {/* Left: Order details */}
        <div className="space-y-6">
          {/* Items */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-medium mb-4">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.wineName}</p>
                    <p className="text-xs text-muted-foreground">{item.producer}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-mono">${order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">${order.tax.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="font-mono">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Fulfillment / Retailer */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <h2 className="text-base font-medium">
              {order.fulfillmentType === 'pickup' ? 'Pickup Location' : 'Delivery From'}
            </h2>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">{order.retailer.name}</p>
                <p className="text-sm text-muted-foreground">{order.retailer.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <a
                href={`tel:${order.retailer.phone}`}
                className="text-sm text-primary hover:underline"
              >
                {order.retailer.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Right: Status timeline */}
        <div className="mt-6 lg:mt-0">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-medium mb-4">Status</h2>
            <OrderStatusTimeline events={order.statusHistory} />
          </div>
        </div>
      </div>
    </div>
  )
}
