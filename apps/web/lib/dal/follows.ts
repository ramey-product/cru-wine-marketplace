import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// getFollowing — return users that the given user follows, with profile info
// ---------------------------------------------------------------------------

export async function getFollowing(
  client: TypedClient,
  userId: string,
  opts: { limit?: number; offset?: number } = {}
) {
  const { limit = 50, offset = 0 } = opts

  return client
    .from('follows')
    .select('following_id, created_at, profiles!follows_following_id_fkey(id, display_name, full_name, avatar_url, username)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
}

// ---------------------------------------------------------------------------
// getFollowers — return users who follow the given user, with profile info
// ---------------------------------------------------------------------------

export async function getFollowers(
  client: TypedClient,
  userId: string,
  opts: { limit?: number; offset?: number } = {}
) {
  const { limit = 50, offset = 0 } = opts

  return client
    .from('follows')
    .select('follower_id, created_at, profiles!follows_follower_id_fkey(id, display_name, full_name, avatar_url, username)')
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
}

// ---------------------------------------------------------------------------
// getIsFollowing — check if a follow relationship exists
// ---------------------------------------------------------------------------

export async function getIsFollowing(
  client: TypedClient,
  followerId: string,
  followingId: string
) {
  const { data, error } = await client
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle()

  if (error) {
    return { data: false, error }
  }

  return { data: data !== null, error: null }
}

// ---------------------------------------------------------------------------
// getFollowCounts — return follower and following counts for a user
// ---------------------------------------------------------------------------

export async function getFollowCounts(
  client: TypedClient,
  userId: string
) {
  const [followersResult, followingResult] = await Promise.all([
    client
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId),
    client
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ])

  if (followersResult.error) {
    return { data: null, error: followersResult.error }
  }
  if (followingResult.error) {
    return { data: null, error: followingResult.error }
  }

  return {
    data: {
      followers: followersResult.count ?? 0,
      following: followingResult.count ?? 0,
    },
    error: null,
  }
}

// ---------------------------------------------------------------------------
// createFollow — insert a follow relationship
// ---------------------------------------------------------------------------

export async function createFollow(
  client: TypedClient,
  followerId: string,
  followingId: string
) {
  return client
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single()
}

// ---------------------------------------------------------------------------
// deleteFollow — remove a follow relationship
// ---------------------------------------------------------------------------

export async function deleteFollow(
  client: TypedClient,
  followerId: string,
  followingId: string
) {
  return client
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
}
