'use client'

import { useState, useTransition } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shareUrl } from '@/lib/utils/share'

interface ShareButtonProps {
  /** The canonical URL to share. */
  url: string
  /** Optional page title passed to navigator.share(). */
  title?: string
  /** Optional description text passed to navigator.share(). */
  text?: string
}

/**
 * ShareButton — renders a small ghost button with a Share2 icon.
 *
 * Behaviour:
 *  - Tries the Web Share API first (mobile / PWA).
 *  - Falls back to copying the URL to the clipboard.
 *  - Shows brief "Copied!" label after a successful clipboard copy.
 */
export function ShareButton({ url, title, text }: ShareButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  function handleShare() {
    startTransition(async () => {
      const result = await shareUrl({ url, title, text })

      if (result === 'copied') {
        setCopied(true)
        // Reset the label after 2 s so it doesn't linger
        setTimeout(() => setCopied(false), 2000)
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={isPending}
      aria-label={copied ? 'Link copied to clipboard' : 'Share this producer profile'}
      className="gap-1.5"
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </Button>
  )
}
