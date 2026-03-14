'use client'

import { Badge } from '@/components/ui/badge'

interface SlaBadgeProps {
  createdAt: string
}

export function SlaBadge({ createdAt }: SlaBadgeProps) {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const elapsedMinutes = Math.floor((now - created) / 60000)

  if (elapsedMinutes < 60) {
    return null
  }

  if (elapsedMinutes <= 120) {
    return (
      <Badge
        variant="outline"
        className="border-yellow-500/50 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
        aria-label={`Order pending for ${elapsedMinutes} minutes, approaching SLA limit`}
      >
        <span aria-hidden="true">&#9888;</span> {elapsedMinutes}m
      </Badge>
    )
  }

  return (
    <Badge
      variant="destructive"
      aria-label={`Order pending for ${elapsedMinutes} minutes, SLA exceeded`}
    >
      <span aria-hidden="true">&#128308;</span> {elapsedMinutes}m
    </Badge>
  )
}
