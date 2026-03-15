'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { OrderTrackingState } from '@/lib/order-tracking/types'
import { STATUS_LABELS } from '@/lib/order-tracking/types'

interface ActiveOrderMiniCardProps {
  order: OrderTrackingState
  onClick?: () => void
}

function getRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ActiveOrderMiniCard({ order, onClick }: ActiveOrderMiniCardProps) {
  return (
    <Link
      href={`/orders/${order.orderId}`}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-foreground/20 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{order.retailerName}</p>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {STATUS_LABELS[order.status]}
          {' '}&middot;{' '}
          {getRelativeTime(order.updatedAt)}
          {order.estimatedTime && (
            <>
              {' '}&middot;{' '}
              Est. {order.estimatedTime}
            </>
          )}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}
