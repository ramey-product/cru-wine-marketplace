import { cookies } from 'next/headers'
import type { LocationCookie } from './types'

/**
 * Reads the user's location cookie on the server during SSR.
 * Returns the abbreviated LocationCookie or null if not set/invalid.
 */
export async function getServerLocation(): Promise<LocationCookie | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('cru_loc')?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as LocationCookie
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}
