import Link from 'next/link'
import { CheckCircle2, MapPin } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed | Cru',
}

// TODO: Replace with real order lookup from DAL via getOrderById
// Also handle case where webhook hasn't fired yet (poll or show loading)
const MOCK_ORDER = {
  id: 'mock-order-1',
  orderNumber: 'CRU-4821',
  retailerName: 'Wine House Los Angeles',
  retailerAddress: '1234 Vine Street, Los Angeles, CA 90028',
  fulfillmentType: 'pickup' as const,
  estimatedReady: '~1 hour',
  total: 65.32,
  items: [
    { wineName: 'Bandol Rose 2023', quantity: 2, price: 28.0 },
    { wineName: 'Cloudy Bay Sauvignon Blanc', quantity: 1, price: 22.0 },
  ],
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const order = MOCK_ORDER // TODO: Fetch by orderId

  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <CheckCircle2
        className="mx-auto h-16 w-16 text-cru-success mb-4"
        aria-hidden="true"
      />

      <h1 className="text-2xl font-semibold">Order Confirmed!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order #{order.orderNumber}
      </p>

      {/* Fulfillment details */}
      <div className="mt-8 rounded-lg border border-border bg-card p-6 text-left space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">
              {order.fulfillmentType === 'pickup' ? 'Pickup from' : 'Delivery from'}
            </p>
            <p className="text-sm text-muted-foreground">{order.retailerName}</p>
            <p className="text-sm text-muted-foreground">{order.retailerAddress}</p>
            <p className="mt-1 text-sm font-medium text-primary">
              Ready in {order.estimatedReady}
            </p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity}x {item.wineName}
              </span>
              <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <hr className="border-border" />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="font-mono">${order.total.toFixed(2)}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        A confirmation email has been sent to your inbox.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/orders/${orderId}`}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          View Order Details
        </Link>
        <Link
          href="/wines"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Continue Exploring
        </Link>
      </div>
    </div>
  )
}
