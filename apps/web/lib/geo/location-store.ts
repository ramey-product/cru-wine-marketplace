import type { UserLocation, LocationCookie } from './types'

const COOKIE_NAME = 'cru_loc'
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days
const LOCAL_STORAGE_KEY = 'cru_user_location'

/**
 * Saves user location to both cookie and localStorage for client-side persistence.
 */
export function saveLocation(location: UserLocation): void {
  // Save full location to localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(location))
  } catch {
    // localStorage may be unavailable (private browsing, storage full)
  }

  // Save abbreviated version to cookie for SSR access
  const cookieValue: LocationCookie = {
    lat: location.lat,
    lng: location.lng,
    dn: location.displayName,
  }

  const expires = new Date(Date.now() + COOKIE_MAX_AGE_SECONDS * 1000)
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(cookieValue))};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};expires=${expires.toUTCString()};SameSite=Lax`
}

/**
 * Retrieves the stored user location. Tries localStorage first (has full data),
 * then falls back to cookie (abbreviated data).
 */
export function getStoredLocation(): UserLocation | null {
  // Try localStorage first — contains full UserLocation
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as UserLocation
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return parsed
      }
    }
  } catch {
    // localStorage unavailable or corrupted data
  }

  // Fall back to cookie — contains abbreviated LocationCookie
  const cookie = getLocationFromCookie()
  if (cookie) {
    return {
      lat: cookie.lat,
      lng: cookie.lng,
      source: 'manual', // unknown from cookie, default to manual
      displayName: cookie.dn,
      zip: null,
      accuracy: null,
      timestamp: Date.now(),
    }
  }

  return null
}

/**
 * Parses the location cookie from document.cookie.
 */
export function getLocationFromCookie(): LocationCookie | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=')
    if (name === COOKIE_NAME) {
      try {
        const value = decodeURIComponent(valueParts.join('='))
        const parsed = JSON.parse(value) as LocationCookie
        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          return parsed
        }
      } catch {
        return null
      }
    }
  }

  return null
}

/**
 * Clears location data from both cookie and localStorage.
 */
export function clearLocation(): void {
  // Clear localStorage
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  } catch {
    // localStorage may be unavailable
  }

  // Clear cookie by setting max-age to 0
  document.cookie = `${COOKIE_NAME}=;path=/;max-age=0;SameSite=Lax`
}
