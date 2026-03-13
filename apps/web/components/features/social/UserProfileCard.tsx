import Image from 'next/image'
import Link from 'next/link'
import { FollowButton } from './FollowButton'

interface UserProfileCardProps {
  user: {
    id: string
    displayName: string
    username: string
    avatarUrl: string | null
    bio: string | null
    joinDate: string
    isPublic: boolean
  }
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isOwnProfile: boolean
}

export function UserProfileCard({
  user,
  followerCount,
  followingCount,
  isFollowing,
  isOwnProfile,
}: UserProfileCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative h-20 w-20 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground overflow-hidden">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              fill
              className="rounded-full object-cover"
            />
          ) : (
            user.displayName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold">{user.displayName}</h1>
          <p className="text-sm text-muted-foreground">@{user.username}</p>

          {user.bio && (
            <p className="mt-2 text-sm">{user.bio}</p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            Joined {new Date(user.joinDate).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Stats + Action */}
      <div className="flex items-center gap-6">
        <Link
          href={`/users/${user.username}/followers`}
          className="text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <span className="font-semibold">{followerCount}</span>{' '}
          <span className="text-muted-foreground">{followerCount === 1 ? 'follower' : 'followers'}</span>
        </Link>
        <Link
          href={`/users/${user.username}/following`}
          className="text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <span className="font-semibold">{followingCount}</span>{' '}
          <span className="text-muted-foreground">following</span>
        </Link>

        <div className="ml-auto">
          {isOwnProfile ? (
            <Link
              href="/settings/profile"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Edit profile
            </Link>
          ) : (
            <FollowButton
              targetUserId={user.id}
              isFollowing={isFollowing}
              followerCount={followerCount}
            />
          )}
        </div>
      </div>
    </div>
  )
}
