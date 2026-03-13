import Link from 'next/link'
import { OrderStatusBadge } from './OrderStatusBadge'

type OrderStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled'

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    retailerName: string
    status: OrderStatus
    total: number
    itemCount: number
    createdAt: string
    fulfillmentType: 'pickup' | 'delivery'
  }
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-lg border border-border bg-card p-4 hover:border-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">{order.retailerName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {' '}&middot;{' '}
            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
            {' '}&middot;{' '}
            <span className="capitalize">{order.fulfillmentType}</span>
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Order #{order.orderNumber}
        </p>
        <p className="text-sm font-semibold font-mono">${order.total.toFixed(2)}</p>
      </div>
    </Link>
  )
}
