import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserListItem } from '@/components/features/social/UserListItem'

// TODO: Replace with real DAL calls
// import { getFollowing } from '@/lib/dal/follows'

const MOCK_FOLLOWING = [
  { id: '1', displayName: 'Sarah Chen', username: 'winelover', avatarUrl: null, bio: 'Natural wine explorer', followerCount: 42 },
  { id: '2', displayName: 'James Rivera', username: 'somm_james', avatarUrl: null, bio: 'Certified sommelier', followerCount: 128 },
  { id: '3', displayName: 'Mia Tanaka', username: 'mia_drinks', avatarUrl: null, bio: 'Weekend wine enthusiast', followerCount: 15 },
]

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function FollowingPage({ params }: PageProps) {
  const { username } = await params
  // TODO: Validate username exists
  if (!username) notFound()

  const following = MOCK_FOLLOWING

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/users/${username}`}
          aria-label="Back to profile"
          className="rounded-full p-1 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Following</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
      </div>

      {following.length > 0 ? (
        <div className="space-y-2">
          {following.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              showFollowButton={true}
              isFollowing={false}
              followerCount={user.followerCount}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Not following anyone yet.
        </p>
      )}
    </div>
  )
}
