'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

interface WinesErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function WinesError({ error, reset }: WinesErrorProps) {
  useEffect(() => {
    console.error('Wines page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" aria-hidden="true" />

      <h2 className="text-lg font-medium mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We had trouble loading the wines. This might be a temporary issue.
      </p>

      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
                   hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
