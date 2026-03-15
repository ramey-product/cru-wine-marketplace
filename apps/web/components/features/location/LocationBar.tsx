'use client'

import { MapPin } from 'lucide-react'
import { useLocationContext } from '@/lib/geo/LocationContext'

export function LocationBar() {
  const { location, openPicker } = useLocationContext()

  return (
    <button
      type="button"
      onClick={openPicker}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm cursor-pointer hover:bg-muted transition-colors"
      aria-label={
        location
          ? `Current location: ${location.displayName ?? 'Set'}. Click to change`
          : 'Set your location'
      }
    >
      <MapPin className="size-3.5 text-muted-foreground" />
      {location ? (
        <>
          <span className="max-w-[150px] truncate">
            {location.displayName ?? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`}
          </span>
          <span className="text-muted-foreground">&middot;</span>
          <span className="text-muted-foreground">Change</span>
        </>
      ) : (
        <span>Set your location</span>
      )}
    </button>
  )
}
