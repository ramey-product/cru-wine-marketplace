import { cn } from '@/lib/utils'

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

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-primary/10 text-primary',
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-muted text-muted-foreground',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive',
  },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-muted text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      <span className="sr-only">Status: </span>
      {config.label}
    </span>
  )
}
