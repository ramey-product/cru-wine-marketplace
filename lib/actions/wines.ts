'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CreateWineSchema, UpdateWineSchema } from '@/lib/validations/wines'
import { isPlatformOrgAdmin } from '@/lib/auth/permissions'
import { slugify } from '@/lib/utils/slugify'
import { createWine, updateWine } from '@/lib/dal/wines'

// ---------------------------------------------------------------------------
// Action-level input: slug is optional (auto-generated from name)
// ---------------------------------------------------------------------------

const CreateWineActionSchema = CreateWineSchema.extend({
  slug: CreateWineSchema.shape.slug.optional(),
})

// ---------------------------------------------------------------------------
// createWineAction
// ---------------------------------------------------------------------------

export async function createWineAction(
  input: z.infer<typeof CreateWineActionSchema>
) {
  const slug = input.slug || slugify(input.name)

  const parsed = CreateWineSchema.safeParse({ ...input, slug })
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

  const isAdmin = await isPlatformOrgAdmin(
    supabase,
    user.id,
    parsed.data.org_id
  )
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await createWine(supabase, parsed.data)
  if (error) {
    console.error('createWineAction failed:', error)
    return { error: 'Failed to create wine' }
  }

  revalidatePath('/(app)/[orgSlug]/wines', 'page')
  return { data }
}

// ---------------------------------------------------------------------------
// updateWineAction
// ---------------------------------------------------------------------------

export async function updateWineAction(
  wineId: string,
  orgId: string,
  input: z.infer<typeof UpdateWineSchema>
) {
  const idParsed = z.string().uuid().safeParse(wineId)
  if (!idParsed.success) {
    return { error: 'Invalid wine ID' }
  }

  const orgParsed = z.string().uuid().safeParse(orgId)
  if (!orgParsed.success) {
    return { error: 'Invalid org ID' }
  }

  const parsed = UpdateWineSchema.safeParse(input)
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

  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, orgId)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await updateWine(supabase, wineId, orgId, parsed.data)
  if (error) {
    console.error('updateWineAction failed:', error)
    return { error: 'Failed to update wine' }
  }

  revalidatePath('/(app)/[orgSlug]/wines', 'page')
  if (data?.slug) {
    revalidatePath(`/(app)/[orgSlug]/wines/${data.slug}`, 'page')
  }
  return { data }
}
