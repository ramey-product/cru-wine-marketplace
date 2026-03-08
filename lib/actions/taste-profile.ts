'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  upsertTasteProfile,
  addTasteProfileWine,
  removeTasteProfileWine,
} from '@/lib/dal/taste-profiles'
import {
  TasteProfileSchema,
  AddTasteProfileWineSchema,
  RemoveTasteProfileWineSchema,
} from '@/lib/validations/taste-profile'
import type { TasteProfileInput } from '@/lib/validations/taste-profile'

// ---------------------------------------------------------------------------
// saveTasteProfile — create or update the user's taste profile
// ---------------------------------------------------------------------------

export async function saveTasteProfile(input: TasteProfileInput) {
  const parsed = TasteProfileSchema.safeParse(input)
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

  const { data, error } = await upsertTasteProfile(
    supabase,
    user.id,
    parsed.data
  )
  if (error) {
    console.error('saveTasteProfile failed:', error)
    return { error: 'Failed to save taste profile' }
  }

  revalidatePath('/', 'layout')
  return { data }
}

// ---------------------------------------------------------------------------
// addWineToProfile — add a wine to the user's "Wines I've Loved"
// ---------------------------------------------------------------------------

export async function addWineToProfile(wineId: string, source?: string) {
  const parsed = AddTasteProfileWineSchema.safeParse({
    wine_id: wineId,
    source: source ?? 'manual_add',
  })
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

  const { error } = await addTasteProfileWine(
    supabase,
    user.id,
    parsed.data.wine_id,
    parsed.data.source
  )
  if (error) {
    console.error('addWineToProfile failed:', error)
    return { error: 'Failed to add wine to profile' }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// removeWineFromProfile — remove a wine from the user's "Wines I've Loved"
// ---------------------------------------------------------------------------

export async function removeWineFromProfile(wineId: string) {
  const parsed = RemoveTasteProfileWineSchema.safeParse({ wine_id: wineId })
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

  const { error } = await removeTasteProfileWine(
    supabase,
    user.id,
    parsed.data.wine_id
  )
  if (error) {
    console.error('removeWineFromProfile failed:', error)
    return { error: 'Failed to remove wine from profile' }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}
