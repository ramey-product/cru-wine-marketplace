import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from '@/components/features/orders/OrderStatusBadge'
import { OrderStatusTimeline } from '@/components/features/orders/OrderStatusTimeline'
import { OrderStatusActions } from './OrderStatusActions'

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

interface OrderItem {
  id: string
  wineName: string
  producer: string
  quantity: number
  unitPrice: number
}

interface StatusEvent {
  status: string
  label: string
  timestamp: string
  notes?: string | null
}

export interface MockOrderDetail {
  id: string
  orderNumber: string
  status: OrderStatus
  fulfillmentType: 'pickup' | 'delivery'
  customerFirstName: string
  customerLastInitial: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  createdAt: string
  statusHistory: StatusEvent[]
}

interface OrderDetailProps {
  order: MockOrderDetail
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/retailer"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label="Back to order queue"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="outline" className="text-xs capitalize">
              {order.fulfillmentType}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {order.customerFirstName} {order.customerLastInitial}.
            </span>
            <span className="text-sm text-muted-foreground">&middot;</span>
            <time
              className="text-sm text-muted-foreground"
              dateTime={order.createdAt}
            >
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </time>
          </div>
        </div>

        {/* Actions */}
        <OrderStatusActions
          orderId={order.id}
          status={order.status}
          fulfillmentType={order.fulfillmentType}
        />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        {/* Left: Order items and summary */}
        <div className="space-y-6">
          {/* Items table */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-medium mb-4">Order Items</h2>

            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_60px_80px_80px] gap-4 pb-2 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Wine</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Total</span>
            </div>

            {/* Item rows */}
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-3 sm:grid sm:grid-cols-[1fr_60px_80px_80px] sm:gap-4 sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.wineName}</p>
                    <p className="text-xs text-muted-foreground">{item.producer}</p>
                  </div>
                  <div className="flex sm:block sm:text-right mt-1 sm:mt-0">
                    <span className="text-xs text-muted-foreground sm:hidden">Qty:&nbsp;</span>
                    <span className="text-sm">{item.quantity}</span>
                  </div>
                  <div className="flex sm:block sm:text-right">
                    <span className="text-xs text-muted-foreground sm:hidden">Price:&nbsp;</span>
                    <span className="text-sm font-mono">{formatCurrency(item.unitPrice)}</span>
                  </div>
                  <div className="flex sm:block sm:text-right">
                    <span className="text-xs text-muted-foreground sm:hidden">Total:&nbsp;</span>
                    <span className="text-sm font-mono font-medium">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">{formatCurrency(order.tax)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Right: Status timeline */}
        <div className="mt-6 lg:mt-0">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-medium mb-4">Status History</h2>
            <OrderStatusTimeline events={order.statusHistory} />
          </div>
        </div>
      </div>
    </div>
  )
}
