import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserListItem } from '@/components/features/social/UserListItem'

// TODO: Replace with real DAL calls
// import { getFollowers } from '@/lib/dal/follows'

const MOCK_FOLLOWERS = [
  { id: '4', displayName: 'Alex Kim', username: 'alexk', avatarUrl: null, bio: 'Pinot noir devotee', followerCount: 23 },
  { id: '5', displayName: 'Emma Davis', username: 'emma_vino', avatarUrl: null, bio: null, followerCount: 8 },
]

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function FollowersPage({ params }: PageProps) {
  const { username } = await params
  if (!username) notFound()

  const followers = MOCK_FOLLOWERS

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
          <h1 className="text-xl font-semibold">Followers</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
      </div>

      {followers.length > 0 ? (
        <div className="space-y-2">
          {followers.map((user) => (
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
          No followers yet.
        </p>
      )}
    </div>
  )
}
