'use client'

import { useTransition } from 'react'
import { dismissRecommendation } from '@/lib/actions/curation'

interface DismissButtonProps {
  wineId: string
  onDismissed?: () => void
}

export function DismissButton({ wineId, onDismissed }: DismissButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      const result = await dismissRecommendation(wineId)
      if (!result.error) {
        onDismissed?.()
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDismiss}
      disabled={isPending}
      aria-label="Not for me — dismiss this recommendation"
      className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
    >
      {isPending ? 'Dismissing...' : 'Not for me'}
    </button>
  )
}
