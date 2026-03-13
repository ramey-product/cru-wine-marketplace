import { CheckCircle2, Circle, Clock } from 'lucide-react'

interface StatusEvent {
  status: string
  label: string
  timestamp: string
  notes?: string | null
}

interface OrderStatusTimelineProps {
  events: StatusEvent[]
}

export function OrderStatusTimeline({ events }: OrderStatusTimelineProps) {
  return (
    <div className="space-y-0" role="list" aria-label="Order status timeline">
      {events.map((event, i) => {
        const isLast = i === events.length - 1
        const isCurrent = i === 0

        return (
          <div key={i} className="flex gap-3" role="listitem">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              {isCurrent ? (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" aria-hidden="true" />
              )}
              {!isLast && (
                <div className="w-px flex-1 bg-border my-1" aria-hidden="true" />
              )}
            </div>

            {/* Event details */}
            <div className={`pb-4 ${!isLast ? '' : ''}`}>
              <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                {event.label}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                <time className="text-xs text-muted-foreground" dateTime={event.timestamp}>
                  {new Date(event.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              {event.notes && (
                <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
