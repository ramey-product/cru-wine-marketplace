'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createFollow, deleteFollow, getIsFollowing } from '@/lib/dal/follows'
import { FollowUserSchema } from '@/lib/validations/follows'

// ---------------------------------------------------------------------------
// followUser — create a follow relationship
// ---------------------------------------------------------------------------

export async function followUser(targetUserId: string) {
  // 1. Zod validate
  const parsed = FollowUserSchema.safeParse({ targetUserId })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // 3. Self-follow check
  if (user.id === parsed.data.targetUserId) {
    return { error: 'Cannot follow yourself' }
  }

  // 4. Duplicate check
  const { data: alreadyFollowing, error: checkError } = await getIsFollowing(
    supabase,
    user.id,
    parsed.data.targetUserId
  )
  if (checkError) {
    return { error: 'Failed to check follow status' }
  }
  if (alreadyFollowing) {
    return { error: 'Already following this user' }
  }

  // 5. DAL call — createFollow
  const { error } = await createFollow(supabase, user.id, parsed.data.targetUserId)
  if (error) {
    console.error('followUser failed:', error)
    return { error: 'Failed to follow user' }
  }

  // 6. Revalidate
  revalidatePath('/', 'layout')

  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// unfollowUser — remove a follow relationship
// ---------------------------------------------------------------------------

export async function unfollowUser(targetUserId: string) {
  // 1. Zod validate
  const parsed = FollowUserSchema.safeParse({ targetUserId })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // 3. DAL call — deleteFollow
  const { error } = await deleteFollow(supabase, user.id, parsed.data.targetUserId)
  if (error) {
    console.error('unfollowUser failed:', error)
    return { error: 'Failed to unfollow user' }
  }

  // 4. Revalidate
  revalidatePath('/', 'layout')

  return { data: { success: true } }
}
