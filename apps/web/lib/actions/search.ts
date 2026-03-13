'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  saveRecentSearch,
  deleteRecentSearch,
  clearRecentSearches,
} from '@/lib/dal/search'
import { SearchQuerySchema, DeleteSearchSchema } from '@/lib/validations/search'

// ---------------------------------------------------------------------------
// saveSearch — save a search query to recent searches
// ---------------------------------------------------------------------------

export async function saveSearch(query: string) {
  const parsed = SearchQuerySchema.safeParse({ query })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
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
    console.error('saveSearch failed:', error)
    return { error: 'Failed to save search' }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// removeRecentSearch — delete a single recent search
// ---------------------------------------------------------------------------

export async function removeRecentSearch(searchId: string) {
  const parsed = DeleteSearchSchema.safeParse({ searchId })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
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
    console.error('removeRecentSearch failed:', error)
    return { error: 'Failed to remove search' }
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
    console.error('clearAllRecentSearches failed:', error)
    return { error: 'Failed to clear searches' }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}
