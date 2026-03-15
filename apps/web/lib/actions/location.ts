'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { LocationSchema } from '@/lib/validations/location'

export async function setUserLocation(input: {
  lat: number
  lng: number
  source: 'browser' | 'ip' | 'manual'
  displayName: string | null
  zip: string | null
}) {
  const parsed = LocationSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid location' }
  }

  const { lat, lng, displayName } = parsed.data
  const cookieValue = JSON.stringify({ lat, lng, dn: displayName })

  const cookieStore = await cookies()
  cookieStore.set('cru_loc', cookieValue, {
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}
