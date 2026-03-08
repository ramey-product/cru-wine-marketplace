'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  CreateProducerSchema,
  UpdateProducerSchema,
} from '@/lib/validations/producers'
import { isPlatformOrgAdmin } from '@/lib/auth/permissions'
import { slugify } from '@/lib/utils/slugify'
import {
  createProducer,
  updateProducer,
  addProducerPhoto,
  deleteProducerPhoto,
  reorderProducerPhotos,
} from '@/lib/dal/producers'

// ---------------------------------------------------------------------------
// Action-level input: slug is optional (auto-generated from name)
// ---------------------------------------------------------------------------

const CreateProducerActionSchema = CreateProducerSchema.extend({
  slug: CreateProducerSchema.shape.slug.optional(),
})

// ---------------------------------------------------------------------------
// createProducerAction
// ---------------------------------------------------------------------------

export async function createProducerAction(
  input: z.infer<typeof CreateProducerActionSchema>
) {
  const slug = input.slug || slugify(input.name)

  const parsed = CreateProducerSchema.safeParse({ ...input, slug })
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

  const { data, error } = await createProducer(supabase, parsed.data)
  if (error) {
    console.error('createProducerAction failed:', error)
    return { error: 'Failed to create producer' }
  }

  revalidatePath('/(app)/[orgSlug]/producers', 'page')
  return { data }
}

// ---------------------------------------------------------------------------
// updateProducerAction
// ---------------------------------------------------------------------------

export async function updateProducerAction(
  producerId: string,
  orgId: string,
  input: z.infer<typeof UpdateProducerSchema>
) {
  const idParsed = z.string().uuid().safeParse(producerId)
  if (!idParsed.success) {
    return { error: 'Invalid producer ID' }
  }

  const orgParsed = z.string().uuid().safeParse(orgId)
  if (!orgParsed.success) {
    return { error: 'Invalid org ID' }
  }

  const parsed = UpdateProducerSchema.safeParse(input)
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

  const { data, error } = await updateProducer(
    supabase,
    producerId,
    orgId,
    parsed.data
  )
  if (error) {
    console.error('updateProducerAction failed:', error)
    return { error: 'Failed to update producer' }
  }

  revalidatePath('/(app)/[orgSlug]/producers', 'page')
  if (data?.slug) {
    revalidatePath(`/(app)/[orgSlug]/producers/${data.slug}`, 'page')
  }
  return { data }
}

// ---------------------------------------------------------------------------
// addProducerPhotoAction
// ---------------------------------------------------------------------------

const AddPhotoSchema = z.object({
  org_id: z.string().uuid(),
  producer_id: z.string().uuid(),
  image_url: z.string().url(),
  caption: z.string().max(500).optional(),
  display_order: z.number().int().min(0).optional(),
})

export async function addProducerPhotoAction(
  input: z.infer<typeof AddPhotoSchema>
) {
  const parsed = AddPhotoSchema.safeParse(input)
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

  const { data, error } = await addProducerPhoto(supabase, parsed.data)
  if (error) {
    console.error('addProducerPhotoAction failed:', error)
    return { error: 'Failed to add photo' }
  }

  revalidatePath('/(app)/[orgSlug]/producers', 'page')
  return { data }
}

// ---------------------------------------------------------------------------
// deleteProducerPhotoAction
// ---------------------------------------------------------------------------

export async function deleteProducerPhotoAction(
  photoId: string,
  orgId: string
) {
  const idParsed = z.string().uuid().safeParse(photoId)
  if (!idParsed.success) {
    return { error: 'Invalid photo ID' }
  }

  const orgParsed = z.string().uuid().safeParse(orgId)
  if (!orgParsed.success) {
    return { error: 'Invalid org ID' }
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

  const { error } = await deleteProducerPhoto(supabase, photoId, orgId)
  if (error) {
    console.error('deleteProducerPhotoAction failed:', error)
    return { error: 'Failed to delete photo' }
  }

  revalidatePath('/(app)/[orgSlug]/producers', 'page')
  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// reorderProducerPhotosAction
// ---------------------------------------------------------------------------

const ReorderPhotosSchema = z.object({
  producer_id: z.string().uuid(),
  org_id: z.string().uuid(),
  ordered_ids: z.array(z.string().uuid()).min(1),
})

export async function reorderProducerPhotosAction(
  input: z.infer<typeof ReorderPhotosSchema>
) {
  const parsed = ReorderPhotosSchema.safeParse(input)
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

  const { error } = await reorderProducerPhotos(
    supabase,
    parsed.data.producer_id,
    parsed.data.ordered_ids
  )
  if (error) {
    console.error('reorderProducerPhotosAction failed:', error)
    return { error: 'Failed to reorder photos' }
  }

  revalidatePath('/(app)/[orgSlug]/producers', 'page')
  return { data: { success: true } }
}
