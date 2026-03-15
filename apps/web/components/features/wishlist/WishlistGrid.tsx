/**
 * WishlistGrid — client component
 *
 * Renders the wishlist as a responsive multi-column grid.
 * Owns the optimistic removal state and the undo-toast lifecycle.
 *
 * Removal flow:
 *  1. User clicks remove → item is hidden immediately (optimistic)
 *  2. Toast appears: "[Wine] removed from wishlist" + "Undo" button
 *  3a. User clicks "Undo" within 5 s → item reappears, no server call
 *  3b. Timer expires → server action fires to persist the removal
 */
'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { WishlistCard, type WishlistCardWine } from './WishlistCard'
import { removeWineFromWishlistAction } from '@/lib/actions/wishlists'
import { UndoToast } from './UndoToast'

export interface WishlistItem {
  wine: WishlistCardWine
  addedAt: string
}

interface WishlistGridProps {
  items: WishlistItem[]
}

interface PendingRemoval {
  wineId: string
  wineName: string
  /** setTimeout handle — cleared if the user undoes */
  timerId: ReturnType<typeof setTimeout>
}

export function WishlistGrid({ items: initialItems }: WishlistGridProps) {
  // Optimistically-filtered item list (items hidden after removal click)
  const [visibleIds, setVisibleIds] = useState<Set<string>>(
    () => new Set(initialItems.map((i) => i.wine.id))
  )

  // Single pending removal at a time — a new removal replaces the previous
  // (the previous one commits immediately when replaced)
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null)
  const pendingRef = useRef<PendingRemoval | null>(null)

  const [, startTransition] = useTransition()

  /** Commit the pending removal to the server immediately. */
  const commitRemoval = useCallback((wineId: string) => {
    startTransition(async () => {
      const result = await removeWineFromWishlistAction(wineId)
      if (result.error) {
        // On error, restore the item so the user can try again
        setVisibleIds((prev) => new Set([...prev, wineId]))
        console.error('removeWineFromWishlistAction failed:', result.error)
      }
    })
  }, [])

  /** Handle the remove button click from a WishlistCard. */
  const handleRemove = useCallback(
    (wineId: string, wineName: string) => {
      // If there's already a pending removal, commit it now before queuing the new one
      if (pendingRef.current) {
        clearTimeout(pendingRef.current.timerId)
        commitRemoval(pendingRef.current.wineId)
      }

      // Hide the item optimistically
      setVisibleIds((prev) => {
        const next = new Set(prev)
        next.delete(wineId)
        return next
      })

      // Schedule the server commit after 5 seconds
      const timerId = setTimeout(() => {
        setPendingRemoval(null)
        pendingRef.current = null
        commitRemoval(wineId)
      }, 5000)

      const removal: PendingRemoval = { wineId, wineName, timerId }
      setPendingRemoval(removal)
      pendingRef.current = removal
    },
    [commitRemoval]
  )

  /** Undo: restore the item and cancel the pending server commit. */
  const handleUndo = useCallback(() => {
    if (!pendingRef.current) return
    clearTimeout(pendingRef.current.timerId)
    setVisibleIds((prev) => new Set([...prev, pendingRef.current!.wineId]))
    setPendingRemoval(null)
    pendingRef.current = null
  }, [])

  /** Dismiss the toast without undoing (keeps item hidden, commits on next cycle) */
  const handleDismissToast = useCallback(() => {
    if (!pendingRef.current) return
    clearTimeout(pendingRef.current.timerId)
    const { wineId } = pendingRef.current
    setPendingRemoval(null)
    pendingRef.current = null
    commitRemoval(wineId)
  }, [commitRemoval])

  // Commit any pending removal if the component unmounts mid-countdown
  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current.timerId)
        commitRemoval(pendingRef.current.wineId)
      }
    }
  }, [commitRemoval])

  const visibleItems = initialItems.filter((item) => visibleIds.has(item.wine.id))

  if (visibleItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
        <h2 className="text-lg font-medium">Nothing here yet</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          When you find a wine that catches your eye, tap the heart to save it here.
        </p>
        <Link
          href="/wines"
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Browse wines
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        role="list"
        aria-label="Wishlist wines"
      >
        {visibleItems.map((item) => (
          <div key={item.wine.id} role="listitem">
            <WishlistCard
              wine={item.wine}
              addedAt={item.addedAt}
              onRemove={handleRemove}
            />
          </div>
        ))}
      </div>

      {/* Undo toast — rendered outside the grid so it sits at the bottom of the viewport */}
      {pendingRemoval && (
        <UndoToast
          message={`"${pendingRemoval.wineName}" removed from wishlist`}
          onUndo={handleUndo}
          onDismiss={handleDismissToast}
          durationMs={5000}
        />
      )}
    </div>
  )
}
