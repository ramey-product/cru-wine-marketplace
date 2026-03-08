'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { upsertPreferences } from '@/lib/dal/preferences'
import { PreferencesSchema } from '@/lib/validations/preferences'

export async function updatePreferences(formData: FormData) {
  const raw = {
    location_zip: formData.get('location_zip') || undefined,
    price_range_min: formData.get('price_range_min')
      ? Number(formData.get('price_range_min'))
      : undefined,
    price_range_max: formData.get('price_range_max')
      ? Number(formData.get('price_range_max'))
      : undefined,
    occasion_tags: (() => {
      const raw = formData.get('occasion_tags') as string | null
      if (!raw) return undefined
      try {
        return JSON.parse(raw)
      } catch {
        return undefined
      }
    })(),
    notification_email_frequency:
      (formData.get('notification_email_frequency') as string) || undefined,
  }

  const parsed = PreferencesSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await upsertPreferences(supabase, user.id, parsed.data)
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}
