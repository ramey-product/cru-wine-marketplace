'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  saveRecentSearch,
  deleteRecentSearch,
  clearRecentSearches,
} from '@/lib/dal/search'
import { SearchQuerySchema } from '@/lib/validations/search'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// saveSearch — save a search query to recent searches
// ---------------------------------------------------------------------------

export async function saveSearch(query: string) {
  const parsed = SearchQuerySchema.safeParse({ query })
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

  const { error } = await saveRecentSearch(supabase, user.id, parsed.data.query)
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// removeRecentSearch — delete a single recent search
// ---------------------------------------------------------------------------

const DeleteSearchSchema = z.object({
  searchId: z.string().uuid(),
})

export async function removeRecentSearch(searchId: string) {
  const parsed = DeleteSearchSchema.safeParse({ searchId })
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

  const { error } = await deleteRecentSearch(
    supabase,
    user.id,
    parsed.data.searchId
  )
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// clearAllRecentSearches — remove all recent searches for the user
// ---------------------------------------------------------------------------

export async function clearAllRecentSearches() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await clearRecentSearches(supabase, user.id)
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}
