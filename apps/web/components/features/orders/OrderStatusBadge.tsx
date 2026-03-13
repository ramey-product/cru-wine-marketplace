import { Badge } from '@/components/ui/badge'

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  ready_for_pickup: { label: 'Ready for Pickup', variant: 'default' },
  out_for_delivery: { label: 'Out for Delivery', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'outline' as const }

  return (
    <Badge variant={config.variant}>
      <span className="sr-only">Status: </span>
      {config.label}
    </Badge>
  )
}
