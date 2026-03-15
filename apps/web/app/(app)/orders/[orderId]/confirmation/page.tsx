import type { Metadata } from 'next'
import { OrderConfirmationClient } from '@/components/features/orders/OrderConfirmationClient'

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

  return (
    <OrderConfirmationClient
      order={MOCK_ORDER}
      orderId={orderId}
    />
  )
}
