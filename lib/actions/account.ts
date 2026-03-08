'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { initiateDeletion } from '@/lib/dal/users'

export async function deleteAccount() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await initiateDeletion(supabase, user.id)
  if (error) {
    // PGRST116 means .single() found zero rows — deletion is already pending.
    // Treat the same as a successful new request (sign out + redirect).
    if (error.code !== 'PGRST116') {
      return { error: error.message }
    }
  }

  // Log the user out
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
