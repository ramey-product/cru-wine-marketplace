'use client'

import { useState, useCallback, useEffect } from 'react'
import type { UserLocation } from '@/lib/geo/types'
import {
  saveLocation,
  getStoredLocation,
  clearLocation as clearStoredLocation,
} from '@/lib/geo/location-store'
import { getBrowserLocation, getIPLocation } from '@/lib/geo/location'
import { setUserLocation } from '@/lib/actions/location'

export interface UseLocationReturn {
  location: UserLocation | null
  isDetecting: boolean
  error: string | null
  detect: () => Promise<void>
  setManualLocation: (loc: UserLocation) => void
  clearLocation: () => void
  isPickerOpen: boolean
  openPicker: () => void
  closePicker: () => void
}

const LOCATION_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // On mount, hydrate from stored location
  useEffect(() => {
    const stored = getStoredLocation()
    if (stored) {
      setLocation(stored)
    }
  }, [])

  const persistLocation = useCallback(async (loc: UserLocation) => {
    setLocation(loc)
    saveLocation(loc)
    setError(null)
    try {
      await setUserLocation({
        lat: loc.lat,
        lng: loc.lng,
        source: loc.source,
        displayName: loc.displayName,
        zip: loc.zip,
      })
    } catch {
      // Server action failure is non-critical; client-side storage is the primary
    }
  }, [])

  const detect = useCallback(async () => {
    setIsDetecting(true)
    setError(null)

    try {
      // Check stored location freshness
      const stored = getStoredLocation()
      if (stored && Date.now() - stored.timestamp < LOCATION_MAX_AGE_MS) {
        setLocation(stored)
        setIsDetecting(false)
        return
      }

      // Try browser geolocation first
      try {
        const browserLoc = await getBrowserLocation()
        await persistLocation(browserLoc)
        setIsDetecting(false)
        return
      } catch {
        // Browser location failed, fall through to IP
      }

      // Fall back to IP geolocation
      try {
        const ipLoc = await getIPLocation()
        await persistLocation(ipLoc)
        setIsDetecting(false)
        return
      } catch {
        // IP location also failed
      }

      setError('Unable to detect your location. Please enter it manually.')
    } catch {
      setError('An unexpected error occurred while detecting location.')
    } finally {
      setIsDetecting(false)
    }
  }, [persistLocation])

  const setManualLocation = useCallback(
    (loc: UserLocation) => {
      persistLocation(loc)
    },
    [persistLocation]
  )

  const clearLocation = useCallback(() => {
    setLocation(null)
    setError(null)
    clearStoredLocation()
  }, [])

  const openPicker = useCallback(() => setIsPickerOpen(true), [])
  const closePicker = useCallback(() => setIsPickerOpen(false), [])

  return {
    location,
    isDetecting,
    error,
    detect,
    setManualLocation,
    clearLocation,
    isPickerOpen,
    openPicker,
    closePicker,
  }
}
