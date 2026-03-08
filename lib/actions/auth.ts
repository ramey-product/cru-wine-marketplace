'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { confirmAge, updateProfile } from '@/lib/dal/users'
import {
  SignUpSchema,
  SignInSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  UpdateProfileSchema,
} from '@/lib/validations/auth'

export async function signUp(formData: FormData) {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
    age_confirmed: formData.get('age_confirmed') === 'true',
  }

  const parsed = SignUpSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        age_confirmed: parsed.data.age_confirmed,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If the user session is immediately available (no email confirmation required),
  // confirm age now. Otherwise, age confirmation is handled post-confirmation
  // via the age_confirmed flag in user_metadata.
  if (signUpData.session && signUpData.user) {
    await confirmAge(supabase, signUpData.user.id)
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}

export async function signIn(formData: FormData) {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = SignInSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: 'Could not retrieve OAuth URL' }
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const raw = { email: formData.get('email') }

  const parsed = ResetPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Always return success to prevent email enumeration
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback?next=/update-password`,
  })

  return { data: { success: true } }
}

export async function updatePassword(formData: FormData) {
  const raw = { password: formData.get('password') }

  const parsed = UpdatePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { data: { success: true } }
}

export async function updateUserProfile(formData: FormData) {
  const raw = {
    full_name: formData.get('full_name') ?? undefined,
    display_name: formData.get('display_name') ?? undefined,
    avatar_url: formData.get('avatar_url') ?? undefined,
  }

  const parsed = UpdateProfileSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await updateProfile(supabase, user.id, parsed.data)
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}
