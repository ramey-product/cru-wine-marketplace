'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MapPin, Navigation, Loader2, Search, Check } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useLocationContext } from '@/lib/geo/LocationContext'
import { geocodeAddressSuggestions } from '@/lib/geo/location'
import type { UserLocation } from '@/lib/geo/types'

interface AddressSuggestion {
  displayName: string
  lat: number
  lng: number
  zip: string | null
}

export function LocationPicker() {
  const {
    location,
    isDetecting,
    error,
    detect,
    setManualLocation,
    isPickerOpen,
    closePicker,
  } = useLocationContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await geocodeAddressSuggestions(searchQuery)
        setSuggestions(results)
      } catch {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchQuery])

  // Reset state when sheet closes
  useEffect(() => {
    if (!isPickerOpen) {
      setSearchQuery('')
      setSuggestions([])
      setIsSearching(false)
    }
  }, [isPickerOpen])

  const handleDetect = useCallback(async () => {
    await detect()
    // Close picker after successful detection (location will be non-null)
  }, [detect])

  // Close picker after location is successfully set
  const prevLocationRef = useRef(location)
  useEffect(() => {
    if (
      isPickerOpen &&
      location &&
      prevLocationRef.current !== location
    ) {
      closePicker()
    }
    prevLocationRef.current = location
  }, [location, isPickerOpen, closePicker])

  const handleSelectSuggestion = useCallback(
    (suggestion: AddressSuggestion) => {
      const loc: UserLocation = {
        lat: suggestion.lat,
        lng: suggestion.lng,
        source: 'manual',
        displayName: suggestion.displayName,
        zip: suggestion.zip,
        accuracy: null,
        timestamp: Date.now(),
      }
      setManualLocation(loc)
    },
    [setManualLocation]
  )

  return (
    <Sheet open={isPickerOpen} onOpenChange={(open) => !open && closePicker()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Set your location</SheetTitle>
          <SheetDescription>
            Find wines and retailers near you
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4 pt-0">
          {/* Use my location button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 min-h-[44px]"
            onClick={handleDetect}
            disabled={isDetecting}
            aria-label="Detect my location automatically"
          >
            {isDetecting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Navigation className="size-4" />
            )}
            {isDetecting ? 'Detecting location...' : 'Use my location'}
          </Button>

          {/* Error display */}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, zip, or address"
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Search for a location"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Suggestions list */}
          {suggestions.length > 0 && (
            <ul className="space-y-1" role="listbox" aria-label="Location suggestions">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.lat}-${suggestion.lng}-${index}`}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-muted transition-colors min-h-[44px]"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    role="option"
                    aria-selected={false}
                    aria-label={`Select ${suggestion.displayName}`}
                  >
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{suggestion.displayName}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* No results */}
          {searchQuery.trim().length >= 2 &&
            !isSearching &&
            suggestions.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-3">
                No locations found
              </p>
            )}

          {/* Current location display */}
          {location && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-3">
              <Check className="size-4 shrink-0 text-green-600" />
              <span className="text-sm truncate">
                {location.displayName ?? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
              </span>
              <span className="ml-auto text-xs text-muted-foreground shrink-0">
                Current
              </span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
