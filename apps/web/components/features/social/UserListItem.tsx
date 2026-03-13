import Image from 'next/image'
import Link from 'next/link'
import { FollowButton } from './FollowButton'

interface UserListItemProps {
  user: {
    id: string
    displayName: string
    username: string
    avatarUrl: string | null
    bio: string | null
  }
  showFollowButton: boolean
  isFollowing: boolean
  followerCount: number
}

export function UserListItem({
  user,
  showFollowButton,
  isFollowing,
  followerCount,
}: UserListItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <Link
        href={`/users/${user.username}`}
        className="relative h-10 w-10 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground"
      >
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
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/users/${user.username}`} className="hover:underline">
          <p className="text-sm font-medium truncate">{user.displayName}</p>
        </Link>
        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        {user.bio && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{user.bio}</p>
        )}
      </div>

      {showFollowButton && (
        <FollowButton
          targetUserId={user.id}
          isFollowing={isFollowing}
          followerCount={followerCount}
        />
      )}
    </div>
  )
}
