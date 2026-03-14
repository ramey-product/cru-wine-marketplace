import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { OrderDetail, type MockOrderDetail } from '@/components/features/retailer/OrderDetail'

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

// TODO: Replace with getRetailerOrderDetail(supabase, retailerId, orderId) DAL call
const MOCK_ORDER_DETAIL: MockOrderDetail = {
  id: 'order-1',
  orderNumber: 'CRU-2024-001',
  status: 'pending' as OrderStatus,
  fulfillmentType: 'pickup',
  customerFirstName: 'Sarah',
  customerLastInitial: 'M',
  items: [
    {
      id: 'li-1',
      wineName: 'Domaine Tempier Bandol Rose',
      producer: 'Domaine Tempier',
      quantity: 2,
      unitPrice: 3800,
    },
    {
      id: 'li-2',
      wineName: 'Ridge Monte Bello 2019',
      producer: 'Ridge Vineyards',
      quantity: 1,
      unitPrice: 6900,
    },
  ],
  subtotal: 14500,
  tax: 1268,
  total: 15768,
  createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  statusHistory: [
    {
      status: 'pending',
      label: 'Order placed',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      notes: 'Customer submitted order for pickup.',
    },
  ],
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>
}): Promise<Metadata> {
  const { orderId } = await params
  // TODO: Fetch actual order number from DAL
  return {
    title: `Order #${MOCK_ORDER_DETAIL.orderNumber} | Retailer Dashboard | Cru`,
    description: `Manage order ${MOCK_ORDER_DETAIL.orderNumber}`,
  }
}

export default async function RetailerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  // TODO: Replace with getRetailerOrderDetail(supabase, retailerId, orderId) DAL call
  const order = MOCK_ORDER_DETAIL

  if (!order) {
    notFound()
  }

  return <OrderDetail order={order} />
}
