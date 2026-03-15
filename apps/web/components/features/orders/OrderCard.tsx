import Link from 'next/link'
import { Clock } from 'lucide-react'
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
  /** Relative time string (e.g. "15m ago", "2d ago") */
  relativeTime?: string
  /** Estimated ready time (e.g. "3:30 PM") */
  estimatedReadyTime?: string
}

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'ready_for_pickup', 'out_for_delivery']

export function OrderCard({ order, relativeTime, estimatedReadyTime }: OrderCardProps) {
  const isActive = ACTIVE_STATUSES.includes(order.status)

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
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            Order #{order.orderNumber}
          </p>
          {isActive && relativeTime && (
            <p className="text-xs text-muted-foreground">
              Updated {relativeTime}
            </p>
          )}
        </div>
        <p className="text-sm font-semibold font-mono">${order.total.toFixed(2)}</p>
      </div>

      {isActive && estimatedReadyTime && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>Est. ready by {estimatedReadyTime}</span>
        </div>
      )}
    </Link>
  )
}
