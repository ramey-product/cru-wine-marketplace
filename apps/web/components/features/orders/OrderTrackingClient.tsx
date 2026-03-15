'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Clock, MapPin, Phone, Mail, Wifi, WifiOff, Star } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { OrderProgressStepper } from './OrderProgressStepper'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderStatusTimeline } from './OrderStatusTimeline'
import { OrderMapThumbnail } from './OrderMapThumbnail'
import { useOrderStatus } from '@/hooks/useOrderStatus'
import { useOrderTracking } from '@/lib/order-tracking/OrderTrackingContext'
import type { OrderStatus, FulfillmentType } from '@/lib/order-tracking/types'
import { STATUS_LABELS, getCompletionLabel } from '@/lib/order-tracking/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  id: string
  wineId: string
  wineName: string
  producer: string
  varietal?: string | null
  vintage?: string | null
  imageUrl?: string | null
  quantity: number
  unitPrice: number
  subtotal: number
}

interface StatusHistoryEvent {
  id: string
  status: string
  changed_by: string | null
  notes: string | null
  created_at: string
}

interface Retailer {
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  lat?: number | null
  lng?: number | null
}

export interface OrderTrackingData {
  id: string
  orderNumber: string
  status: OrderStatus
  fulfillmentType: FulfillmentType
  retailer: Retailer
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  createdAt: string
  estimatedReadyAt?: string | null
  statusHistory: StatusHistoryEvent[]
}

// ---------------------------------------------------------------------------
// Price formatting (amounts stored in cents)
// ---------------------------------------------------------------------------

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// ---------------------------------------------------------------------------
// Time estimate display
// ---------------------------------------------------------------------------

function TimeEstimate({
  status,
  fulfillmentType,
  estimatedReadyAt,
}: {
  status: OrderStatus
  fulfillmentType: FulfillmentType
  estimatedReadyAt?: string | null
}) {
  if (status === 'completed' || status === 'cancelled') return null

  if (status === 'ready_for_pickup') {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/50">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Your order is ready!
        </p>
      </div>
    )
  }

  if (!estimatedReadyAt) return null

  const estimatedDate = new Date(estimatedReadyAt)
  const now = new Date()

  if (estimatedDate <= now) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Should be ready soon
          </p>
        </div>
      </div>
    )
  }

  const diffMs = estimatedDate.getTime() - now.getTime()
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
  const timeStr = estimatedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  const message =
    fulfillmentType === 'delivery'
      ? `Estimated delivery: Today ${timeStr}`
      : diffHours <= 1
        ? `Ready in approximately ${Math.ceil(diffMs / (1000 * 60))} minutes`
        : `Ready in approximately ${diffHours} hour${diffHours > 1 ? 's' : ''}`

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Delay Banner (pending > 15 min)
// ---------------------------------------------------------------------------

function DelayBanner({ retailerName }: { retailerName: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          We&apos;re checking on your order with {retailerName}. We&apos;ll
          update you shortly.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OrderTrackingClient
// ---------------------------------------------------------------------------

interface OrderTrackingClientProps {
  order: OrderTrackingData
}

export function OrderTrackingClient({ order }: OrderTrackingClientProps) {
  const { trackOrder } = useOrderTracking()

  // Real-time status updates
  const {
    currentStatus,
    statusHistory,
    isRealtime,
    error: realtimeError,
  } = useOrderStatus(order.id, {
    initialStatus: order.status,
    initialHistory: order.statusHistory,
  })

  // Keep OrderTrackingContext in sync for the nav island wing
  useEffect(() => {
    trackOrder({
      orderId: order.id,
      status: currentStatus,
      fulfillmentType: order.fulfillmentType,
      retailerName: order.retailer.name,
      displayName: `${order.items.length} item${order.items.length !== 1 ? 's' : ''} from ${order.retailer.name}`,
      itemCount: order.items.length,
      placedAt: order.createdAt,
      updatedAt: new Date().toISOString(),
    })
  }, [currentStatus, order, trackOrder])

  // Map status history for the timeline component
  const timelineEvents = statusHistory.map((event) => ({
    status: event.status,
    label:
      STATUS_LABELS[event.status as OrderStatus] ?? event.status,
    timestamp: event.created_at,
    notes: event.notes,
  }))

  // Show delay banner if pending for more than 15 minutes
  const isPending = currentStatus === 'pending'
  const age = Date.now() - new Date(order.createdAt).getTime()
  const isDelayed = isPending && age > 15 * 60 * 1000

  return (
    <div className="space-y-6">
      {/* Realtime status indicator */}
      {realtimeError && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <WifiOff className="h-3 w-3" aria-hidden="true" />
          <span>Live updates paused — checking every 15s</span>
        </div>
      )}

      {/* Progress stepper */}
      <OrderProgressStepper
        currentStatus={currentStatus}
        fulfillmentType={order.fulfillmentType}
      />

      {/* Delay banner */}
      {isDelayed && <DelayBanner retailerName={order.retailer.name} />}

      {/* Time estimate */}
      <TimeEstimate
        status={currentStatus}
        fulfillmentType={order.fulfillmentType}
        estimatedReadyAt={order.estimatedReadyAt}
      />

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
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-mono">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatPrice(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-mono">
                    {formatPrice(order.deliveryFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">{formatPrice(order.tax)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="font-mono">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Retailer / Fulfillment */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-base font-medium">
              {order.fulfillmentType === 'pickup'
                ? 'Pickup Location'
                : 'Delivery From'}
            </h2>

            {/* Map */}
            <OrderMapThumbnail
              lat={order.retailer.lat}
              lng={order.retailer.lng}
              retailerName={order.retailer.name}
              address={order.retailer.address}
            />

            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin
                className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium">{order.retailer.name}</p>
                {order.retailer.address && (
                  <p className="text-sm text-muted-foreground">
                    {order.retailer.address}
                  </p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-wrap gap-4">
              {order.retailer.phone && (
                <div className="flex items-center gap-2">
                  <Phone
                    className="h-4 w-4 text-muted-foreground flex-shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href={`tel:${order.retailer.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {order.retailer.phone}
                  </a>
                </div>
              )}
              {order.retailer.email && (
                <div className="flex items-center gap-2">
                  <Mail
                    className="h-4 w-4 text-muted-foreground flex-shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href={`mailto:${order.retailer.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {order.retailer.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status timeline */}
        <div className="mt-6 lg:mt-0">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">Status History</h2>
              {isRealtime && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <Wifi className="h-3 w-3" aria-hidden="true" />
                  Live
                </span>
              )}
            </div>
            <OrderStatusTimeline events={timelineEvents} />
          </div>
        </div>
      </div>

      {/* Feedback banner for completed orders */}
      {currentStatus === 'completed' && (
        <Link
          href={`/orders/${order.id}/feedback`}
          className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Star className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Rate your wines</p>
            <p className="text-xs text-muted-foreground">
              Help us pick better wines for you next time
            </p>
          </div>
        </Link>
      )}
    </div>
  )
}
