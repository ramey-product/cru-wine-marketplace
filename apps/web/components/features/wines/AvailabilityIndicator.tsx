import { cn } from '@/lib/utils'

interface AvailabilityIndicatorProps {
  isAvailable: boolean
}

export function AvailabilityIndicator({ isAvailable }: AvailabilityIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isAvailable ? 'bg-cru-success' : 'bg-muted-foreground'
        )}
        aria-hidden="true"
      />
      <span className="text-muted-foreground">
        {isAvailable ? 'In stock nearby' : 'Check availability'}
      </span>
    </div>
  )
}
