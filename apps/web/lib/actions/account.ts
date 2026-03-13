'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { initiateDeletion } from '@/lib/dal/users'

// TODO: [EPIC-01/STORY-11] Import email service once configured (e.g. Resend)
// import { sendDeletionConfirmationEmail } from '@/lib/services/email'

export async function deleteAccount() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await initiateDeletion(supabase, user.id)
  if (error) {
    // PGRST116 means .single() found zero rows — deletion is already pending.
    // Treat the same as a successful new request (sign out + redirect).
    if (error.code !== 'PGRST116') {
      return { error: error.message }
    }
  }

  // TODO: [EPIC-01/STORY-11] Send deletion confirmation email once email service is configured.
  // Per acceptance criteria, user should receive confirmation with:
  // - The scheduled deletion date (deletion_scheduled_at)
  // - Instructions on how to cancel within the 30-day window
  // Example:
  // if (data?.deletion_scheduled_at) {
  //   await sendDeletionConfirmationEmail({
  //     to: user.email!,
  //     scheduledAt: data.deletion_scheduled_at,
  //   })
  // }

  // Log the user out
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
