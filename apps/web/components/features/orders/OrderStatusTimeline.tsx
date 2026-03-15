import {
  CheckCircle2,
  Circle,
  Clock,
  Package,
  Truck,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusEvent {
  status: string
  label: string
  timestamp: string
  notes?: string | null
}

interface OrderStatusTimelineProps {
  events: StatusEvent[]
}

/** Status-specific icon and color for the timeline. */
function getStatusVisuals(status: string, isCurrent: boolean) {
  if (!isCurrent) {
    return {
      Icon: Circle,
      colorClass: 'text-muted-foreground/50',
    }
  }

  switch (status) {
    case 'pending':
      return { Icon: Clock, colorClass: 'text-amber-600' }
    case 'confirmed':
      return { Icon: CheckCircle2, colorClass: 'text-primary' }
    case 'ready_for_pickup':
      return { Icon: Package, colorClass: 'text-emerald-600' }
    case 'out_for_delivery':
      return { Icon: Truck, colorClass: 'text-blue-600' }
    case 'completed':
      return { Icon: CheckCircle2, colorClass: 'text-muted-foreground' }
    case 'cancelled':
      return { Icon: XCircle, colorClass: 'text-destructive' }
    default:
      return { Icon: Circle, colorClass: 'text-muted-foreground' }
  }
}

export function OrderStatusTimeline({ events }: OrderStatusTimelineProps) {
  return (
    <div className="space-y-0" role="list" aria-label="Order status timeline">
      {events.map((event, i) => {
        const isLast = i === events.length - 1
        const isCurrent = i === 0
        const { Icon, colorClass } = getStatusVisuals(event.status, isCurrent)

        return (
          <div key={i} className="flex gap-3" role="listitem">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <Icon
                className={cn('h-5 w-5 flex-shrink-0', colorClass)}
                aria-hidden="true"
              />
              {!isLast && (
                <div
                  className="w-px flex-1 bg-border my-1"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Event details */}
            <div className="pb-4">
              <p
                className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {event.label}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock
                  className="h-3 w-3 text-muted-foreground"
                  aria-hidden="true"
                />
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={event.timestamp}
                >
                  {new Date(event.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              {event.notes && (
                <p className="text-xs text-muted-foreground mt-1">
                  {event.notes}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
