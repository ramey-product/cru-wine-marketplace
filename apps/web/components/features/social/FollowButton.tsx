'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { followUser, unfollowUser } from '@/lib/actions/follows'

interface FollowButtonProps {
  targetUserId: string
  isFollowing: boolean
  followerCount: number
}

export function FollowButton({
  targetUserId,
  isFollowing,
  followerCount,
}: FollowButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [optimisticState, setOptimisticState] = useOptimistic(
    { isFollowing, followerCount },
    (_state, newFollowing: boolean) => ({
      isFollowing: newFollowing,
      followerCount: newFollowing ? _state.followerCount + 1 : _state.followerCount - 1,
    })
  )

  const handleClick = () => {
    startTransition(async () => {
      const newState = !optimisticState.isFollowing
      setOptimisticState(newState)
      const result = newState
        ? await followUser(targetUserId)
        : await unfollowUser(targetUserId)
      if (result.error) {
        // Revert
        setOptimisticState(!newState)
      }
    })
  }

  const showUnfollow = optimisticState.isFollowing && isHovered

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isPending}
      aria-label={
        optimisticState.isFollowing
          ? `Unfollow (currently following, ${optimisticState.followerCount} followers)`
          : `Follow (${optimisticState.followerCount} followers)`
      }
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        showUnfollow
          ? 'border border-destructive text-destructive hover:bg-destructive/10'
          : optimisticState.isFollowing
            ? 'border border-border text-foreground hover:bg-muted'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
    >
      {showUnfollow ? 'Unfollow' : optimisticState.isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
