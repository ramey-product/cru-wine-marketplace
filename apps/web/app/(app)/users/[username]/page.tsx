import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { UserProfileCard } from '@/components/features/social/UserProfileCard'
import { ProfileTabs } from '@/components/features/social/ProfileTabs'

// TODO: Replace with real DAL calls
// import { createClient } from '@/lib/supabase/server'
// import { getUserByUsername } from '@/lib/dal/users'
// import { getFollowCounts, getIsFollowing } from '@/lib/dal/follows'

const MOCK_USERS: Record<string, {
  id: string
  displayName: string
  username: string
  avatarUrl: string | null
  bio: string | null
  joinDate: string
  isPublic: boolean
}> = {
  winelover: {
    id: '00000000-0000-0000-0000-000000000001',
    displayName: 'Sarah Chen',
    username: 'winelover',
    avatarUrl: null,
    bio: 'Exploring natural wines one glass at a time.',
    joinDate: '2025-09-15T00:00:00Z',
    isPublic: true,
  },
  somm_james: {
    id: '00000000-0000-0000-0000-000000000002',
    displayName: 'James Rivera',
    username: 'somm_james',
    avatarUrl: null,
    bio: 'Certified sommelier. Always hunting for the next great bottle.',
    joinDate: '2025-11-01T00:00:00Z',
    isPublic: true,
  },
}

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const user = MOCK_USERS[username]
  if (!user) return { title: 'User not found | Cru' }

  return {
    title: `${user.displayName} (@${user.username}) | Cru`,
    description: user.bio ?? `${user.displayName} on Cru`,
    openGraph: {
      title: `${user.displayName} (@${user.username})`,
      description: user.bio ?? `${user.displayName} on Cru`,
      type: 'profile',
    },
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params
  const user = MOCK_USERS[username]

  if (!user) notFound()

  // TODO: Replace with real data
  const followerCount = 42
  const followingCount = 18
  const isFollowing = false
  const isOwnProfile = false // TODO: check against current user

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <UserProfileCard
        user={user}
        followerCount={followerCount}
        followingCount={followingCount}
        isFollowing={isFollowing}
        isOwnProfile={isOwnProfile}
      />

      <Suspense fallback={<div className="h-12 animate-pulse rounded bg-muted" />}>
        <ProfileTabs username={user.username} />
      </Suspense>
    </div>
  )
}
