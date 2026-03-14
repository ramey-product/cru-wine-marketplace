'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from '@/components/features/orders/OrderStatusBadge'
import { SlaBadge } from './SlaBadge'
import { OrderStatusActions } from './OrderStatusActions'

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

export interface MockOrder {
  id: string
  orderNumber: string
  customerName: string
  itemCount: number
  total: number
  fulfillmentType: 'pickup' | 'delivery'
  status: OrderStatus
  createdAt: string
}

interface OrderQueueProps {
  orders: MockOrder[]
}

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

type FilterKey = (typeof FILTER_TABS)[number]['key']

function matchesFilter(status: OrderStatus, filter: FilterKey): boolean {
  if (filter === 'all') return true
  if (filter === 'ready') return status === 'ready_for_pickup' || status === 'out_for_delivery'
  return status === filter
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function truncateOrderNumber(orderNumber: string): string {
  return orderNumber.length > 8 ? orderNumber.slice(0, 8) : orderNumber
}

export function OrderQueue({ orders }: OrderQueueProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const filteredOrders = orders.filter((order) => matchesFilter(order.status, activeFilter))

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div
        className="flex gap-1 overflow-x-auto border-b border-border pb-2"
        role="tablist"
        aria-label="Filter orders by status"
      >
        {FILTER_TABS.map((tab) => {
          const count = orders.filter((o) => matchesFilter(o.status, tab.key)).length
          const isActive = activeFilter === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="order-queue-list"
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Order list */}
      <div id="order-queue-list" role="tabpanel" className="space-y-2">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No orders match this filter.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:border-foreground/20 transition-colors"
            >
              {/* Clickable order info */}
              <Link
                href={`/retailer/orders/${order.id}`}
                className="flex flex-1 items-center gap-4 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                aria-label={`View order ${order.orderNumber} from ${order.customerName}`}
              >
                {/* Order number and customer */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium font-mono">
                      #{truncateOrderNumber(order.orderNumber)}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs capitalize"
                    >
                      {order.fulfillmentType}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {order.customerName}
                  </p>
                </div>

                {/* Item count and total */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-mono font-semibold">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && (
                    <SlaBadge createdAt={order.createdAt} />
                  )}
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>

              {/* Action buttons (not inside the link) */}
              <div className="flex-shrink-0">
                <OrderStatusActions
                  orderId={order.id}
                  status={order.status}
                  fulfillmentType={order.fulfillmentType}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
