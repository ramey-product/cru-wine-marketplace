'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { TasteFeedbackCard } from './TasteFeedbackCard'
import { submitTasteFeedback } from '@/lib/actions/order-tracking'

interface WineItem {
  orderItemId: string
  wineId: string
  wineName: string
  producer: string
  varietal?: string | null
  vintage?: string | null
  imageUrl?: string | null
}

interface TasteFeedbackFormProps {
  orderId: string
  items: WineItem[]
}

interface FeedbackState {
  sentiment: 'positive' | 'negative' | null
  note: string
}

export function TasteFeedbackForm({ orderId, items }: TasteFeedbackFormProps) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, FeedbackState>>(
    () => Object.fromEntries(items.map((item) => [item.orderItemId, { sentiment: null, note: '' }]))
  )

  const allRated = items.every((item) => feedback[item.orderItemId]?.sentiment !== null)

  function handleSubmit() {
    if (!allRated) return

    startTransition(async () => {
      setError(null)
      const feedbackItems = items
        .map((item) => ({
          orderItemId: item.orderItemId,
          wineId: item.wineId,
          sentiment: feedback[item.orderItemId]!.sentiment!,
          note: feedback[item.orderItemId]!.note || undefined,
        }))

      const result = await submitTasteFeedback({ orderId, items: feedbackItems })

      if (result.error) {
        setError(result.error)
      } else {
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-medium">Thank you for your feedback!</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your taste preferences help us recommend better wines for you.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Rate your wines</h2>
        <p className="text-sm text-muted-foreground">
          Let us know what you thought — it helps us pick better wines for you.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <TasteFeedbackCard
            key={item.orderItemId}
            orderItemId={item.orderItemId}
            wineId={item.wineId}
            wineName={item.wineName}
            producer={item.producer}
            varietal={item.varietal}
            vintage={item.vintage}
            imageUrl={item.imageUrl}
            sentiment={feedback[item.orderItemId]?.sentiment ?? null}
            note={feedback[item.orderItemId]?.note ?? ''}
            onSentimentChange={(sentiment) =>
              setFeedback((prev) => ({
                ...prev,
                [item.orderItemId]: { ...prev[item.orderItemId]!, sentiment },
              }))
            }
            onNoteChange={(note) =>
              setFeedback((prev) => ({
                ...prev,
                [item.orderItemId]: { ...prev[item.orderItemId]!, note },
              }))
            }
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allRated || isPending}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Submitting...
          </span>
        ) : (
          'Submit Feedback'
        )}
      </button>
    </div>
  )
}
