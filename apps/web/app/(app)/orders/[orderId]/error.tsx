'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <AlertCircle
        className="h-12 w-12 text-destructive/50 mb-4"
        aria-hidden="true"
      />
      <h2 className="text-lg font-medium">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t load this order. Please try again.
      </p>
      <Button variant="outline" onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  )
}
