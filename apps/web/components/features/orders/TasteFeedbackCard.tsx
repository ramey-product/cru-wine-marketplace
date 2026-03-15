'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Wine } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TasteFeedbackCardProps {
  orderItemId: string
  wineId: string
  wineName: string
  producer: string
  varietal?: string | null
  vintage?: string | null
  imageUrl?: string | null
  sentiment: 'positive' | 'negative' | null
  note: string
  onSentimentChange: (sentiment: 'positive' | 'negative') => void
  onNoteChange: (note: string) => void
}

export function TasteFeedbackCard({
  wineName,
  producer,
  varietal,
  vintage,
  imageUrl,
  sentiment,
  note,
  onSentimentChange,
  onNoteChange,
}: TasteFeedbackCardProps) {
  const [showNote, setShowNote] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Wine info */}
      <div className="flex gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={wineName}
              className="h-14 w-14 rounded-lg object-cover"
            />
          ) : (
            <Wine className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{wineName}</p>
          <p className="text-xs text-muted-foreground truncate">{producer}</p>
          {(varietal || vintage) && (
            <p className="text-xs text-muted-foreground">
              {[varietal, vintage].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Thumbs buttons */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => onSentimentChange('positive')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
            sentiment === 'positive'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'border-border hover:bg-muted'
          )}
          aria-pressed={sentiment === 'positive'}
          aria-label={`Thumbs up for ${wineName}`}
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          Loved it
        </button>
        <button
          type="button"
          onClick={() => onSentimentChange('negative')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
            sentiment === 'negative'
              ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/50 dark:text-red-400'
              : 'border-border hover:bg-muted'
          )}
          aria-pressed={sentiment === 'negative'}
          aria-label={`Thumbs down for ${wineName}`}
        >
          <ThumbsDown className="h-4 w-4" aria-hidden="true" />
          Not for me
        </button>
      </div>

      {/* Optional note */}
      {sentiment && (
        <div className="mt-3">
          {!showNote ? (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-xs text-primary hover:underline"
            >
              Add a note (optional)
            </button>
          ) : (
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="What did you think?"
              maxLength={500}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              aria-label={`Note about ${wineName}`}
            />
          )}
        </div>
      )}
    </div>
  )
}
