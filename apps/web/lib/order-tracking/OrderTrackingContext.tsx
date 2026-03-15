'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { OrderTrackingState } from './types'
import { TERMINAL_STATUSES } from './types'

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface OrderTrackingContextValue {
  /** All active (non-terminal) orders */
  activeOrders: OrderTrackingState[]
  /** The most recently updated active order (shown in nav island wing) */
  mostRecentOrder: OrderTrackingState | null
  /** Whether there are any active orders */
  hasActiveOrders: boolean
  /** Add an order to tracking (called after order placement) */
  trackOrder: (order: OrderTrackingState) => void
  /** Remove an order from tracking */
  removeOrder: (orderId: string) => void
}

const OrderTrackingContext = createContext<OrderTrackingContextValue | null>(
  null
)

// ---------------------------------------------------------------------------
// Mock data for development
// ---------------------------------------------------------------------------

const MOCK_ORDERS: OrderTrackingState[] = [
  {
    orderId: 'order-001',
    status: 'preparing',
    retailerName: 'Wine House LA',
    displayName: 'Estate Reserve 2021',
    itemCount: 2,
    placedAt: new Date(Date.now() - 15 * 60_000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    estimatedTime: '3:30 PM',
  },
]

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface OrderTrackingProviderProps {
  children: ReactNode
  /** Initial orders — in production, fetched via server action on mount */
  initialOrders?: OrderTrackingState[]
}

export function OrderTrackingProvider({
  children,
  initialOrders,
}: OrderTrackingProviderProps) {
  // Use mock data in development when no initial orders provided
  const [orders, setOrders] = useState<OrderTrackingState[]>(
    initialOrders ?? MOCK_ORDERS
  )

  const activeOrders = orders.filter(
    (o) => !TERMINAL_STATUSES.includes(o.status)
  )

  // Most recently updated active order
  const mostRecentOrder =
    activeOrders.length > 0
      ? activeOrders.reduce((latest, o) =>
          new Date(o.updatedAt) > new Date(latest.updatedAt) ? o : latest
        )
      : null

  const trackOrder = useCallback((order: OrderTrackingState) => {
    setOrders((prev) => {
      // Replace if already tracking, otherwise add
      const existing = prev.findIndex((o) => o.orderId === order.orderId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = order
        return updated
      }
      return [...prev, order]
    })
  }, [])

  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId))
  }, [])

  return (
    <OrderTrackingContext.Provider
      value={{
        activeOrders,
        mostRecentOrder,
        hasActiveOrders: activeOrders.length > 0,
        trackOrder,
        removeOrder,
      }}
    >
      {children}
    </OrderTrackingContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOrderTracking(): OrderTrackingContextValue {
  const ctx = useContext(OrderTrackingContext)
  if (!ctx) {
    throw new Error(
      'useOrderTracking must be used within an OrderTrackingProvider'
    )
  }
  return ctx
}
