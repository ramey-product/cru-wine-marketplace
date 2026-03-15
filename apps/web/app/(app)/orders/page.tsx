'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingBag } from 'lucide-react'
import { OrderCard } from '@/components/features/orders/OrderCard'

type OrderStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled'
type TabFilter = 'active' | 'completed' | 'all'

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'ready_for_pickup', 'out_for_delivery']
const COMPLETED_STATUSES: OrderStatus[] = ['completed', 'cancelled']

// TODO: Replace with real data from getOrdersByUser DAL call
const MOCK_ORDERS = [
  {
    id: 'order-1',
    orderNumber: 'CRU-4821',
    retailerName: 'Wine House Los Angeles',
    status: 'confirmed' as OrderStatus,
    total: 65.32,
    itemCount: 3,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    fulfillmentType: 'pickup' as const,
    estimatedReadyTime: '3:30 PM',
  },
  {
    id: 'order-4',
    orderNumber: 'CRU-4830',
    retailerName: 'The Barrel Room',
    status: 'pending' as OrderStatus,
    total: 89.50,
    itemCount: 2,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    fulfillmentType: 'delivery' as const,
  },
  {
    id: 'order-2',
    orderNumber: 'CRU-4799',
    retailerName: 'The Cork & Bottle',
    status: 'completed' as OrderStatus,
    total: 42.18,
    itemCount: 1,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 13 * 86400000).toISOString(),
    fulfillmentType: 'delivery' as const,
  },
  {
    id: 'order-3',
    orderNumber: 'CRU-4756',
    retailerName: 'Wine House Los Angeles',
    status: 'cancelled' as OrderStatus,
    total: 120.0,
    itemCount: 4,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 29 * 86400000).toISOString(),
    fulfillmentType: 'pickup' as const,
  },
]

const TAB_OPTIONS: { value: TabFilter; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
]

function getRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>('active')

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (activeTab === 'active') return ACTIVE_STATUSES.includes(order.status)
    if (activeTab === 'completed') return COMPLETED_STATUSES.includes(order.status)
    return true
  })

  const activeCount = MOCK_ORDERS.filter((o) => ACTIVE_STATUSES.includes(o.status)).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      {/* Tab filters */}
      <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Order filters">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.value === 'active' && activeCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order list */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              relativeTime={getRelativeTime(order.updatedAt)}
              estimatedReadyTime={order.estimatedReadyTime}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {activeTab === 'active' ? (
            <>
              <Package className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
              <h2 className="text-lg font-medium">No active orders</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                You don&apos;t have any orders in progress right now.
              </p>
              <Link
                href="/wines"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Browse wines
              </Link>
            </>
          ) : (
            <>
              <Package className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
              <h2 className="text-lg font-medium">No orders yet</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                When you buy your first bottle, it will show up here.
              </p>
              <Link
                href="/wines"
                className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Browse wines
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
