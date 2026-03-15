import type { UserLocation } from './types'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const BROWSER_TIMEOUT_MS = 10_000

/**
 * Requests the user's location from the browser Geolocation API.
 * Wraps navigator.geolocation.getCurrentPosition in a Promise with a 10s timeout.
 * On success, reverse geocodes coordinates to get a display name.
 */
export function getBrowserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        let displayName: string | null = null

        try {
          displayName = await reverseGeocode(latitude, longitude)
        } catch {
          // Reverse geocode is best-effort
        }

        resolve({
          lat: latitude,
          lng: longitude,
          source: 'browser',
          displayName,
          zip: null,
          accuracy,
          timestamp: Date.now(),
        })
      },
      (error) => {
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? 'Location permission denied'
              : error.code === error.POSITION_UNAVAILABLE
                ? 'Location unavailable'
                : 'Location request timed out'
          )
        )
      },
      {
        enableHighAccuracy: false,
        timeout: BROWSER_TIMEOUT_MS,
        maximumAge: 5 * 60 * 1000, // Accept cached position up to 5 minutes old
      }
    )
  })
}

/**
 * Fetches approximate user location from IP address using ipapi.co.
 * Returns source 'ip'. Gracefully handles fetch failures.
 */
export async function getIPLocation(): Promise<UserLocation> {
  const response = await fetch('https://ipapi.co/json/', {
    signal: AbortSignal.timeout(5000),
  })

  if (!response.ok) {
    throw new Error(`IP location request failed: ${response.status}`)
  }

  const data = (await response.json()) as {
    latitude?: number
    longitude?: number
    city?: string
    region?: string
    postal?: string
  }

  if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
    throw new Error('Invalid IP location response')
  }

  const cityParts = [data.city, data.region].filter(Boolean)
  const displayName = cityParts.length > 0 ? cityParts.join(', ') : null

  return {
    lat: data.latitude,
    lng: data.longitude,
    source: 'ip',
    displayName,
    zip: data.postal ?? null,
    accuracy: null,
    timestamp: Date.now(),
  }
}

/**
 * Forward geocodes an address/zip query using the Mapbox Geocoding API.
 * Returns the top result as a UserLocation, or null if no results or token missing.
 */
export async function geocodeAddress(
  query: string
): Promise<UserLocation | null> {
  if (!MAPBOX_TOKEN) return null

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=us&types=place,postcode,address&limit=1`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) return null

    const data = (await response.json()) as {
      features?: Array<{
        center: [number, number] // [lng, lat]
        place_name?: string
        context?: Array<{ id: string; text: string }>
      }>
    }

    const feature = data.features?.[0]
    if (!feature) return null

    const [lng, lat] = feature.center
    const zip = extractZipFromContext(feature.context) ?? null

    return {
      lat,
      lng,
      source: 'manual',
      displayName: feature.place_name ?? null,
      zip,
      accuracy: null,
      timestamp: Date.now(),
    }
  } catch {
    return null
  }
}

/**
 * Returns up to 5 geocode suggestions for a query, suitable for autocomplete.
 * Returns empty array if token is missing or request fails.
 */
export async function geocodeAddressSuggestions(
  query: string
): Promise<
  Array<{ displayName: string; lat: number; lng: number; zip: string | null }>
> {
  if (!MAPBOX_TOKEN) return []

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=us&types=place,postcode,address&limit=5`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) return []

    const data = (await response.json()) as {
      features?: Array<{
        center: [number, number]
        place_name?: string
        context?: Array<{ id: string; text: string }>
      }>
    }

    if (!data.features) return []

    return data.features.map((feature) => {
      const [lng, lat] = feature.center
      return {
        displayName: feature.place_name ?? `${lat}, ${lng}`,
        lat,
        lng,
        zip: extractZipFromContext(feature.context) ?? null,
      }
    })
  } catch {
    return []
  }
}

/**
 * Reverse geocodes coordinates into a human-readable display name
 * using the Mapbox Geocoding API. Returns a string like "Silver Lake, Los Angeles"
 * or null if the request fails or token is missing.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=neighborhood,place&limit=1`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) return null

    const data = (await response.json()) as {
      features?: Array<{
        place_name?: string
        text?: string
        context?: Array<{ id: string; text: string }>
      }>
    }

    const feature = data.features?.[0]
    if (!feature) return null

    // Try to build a concise name: "Neighborhood, City" or just "City"
    const neighborhood = feature.text
    const city = feature.context?.find((c) => c.id.startsWith('place'))?.text

    if (neighborhood && city && neighborhood !== city) {
      return `${neighborhood}, ${city}`
    }

    return neighborhood ?? city ?? feature.place_name ?? null
  } catch {
    return null
  }
}

/**
 * Extracts a zip/postal code from the Mapbox context array.
 */
function extractZipFromContext(
  context?: Array<{ id: string; text: string }>
): string | undefined {
  return context?.find((c) => c.id.startsWith('postcode'))?.text
}
