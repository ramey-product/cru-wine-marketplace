'use client'

import { useState, useCallback } from 'react'
import { Share2, Copy, Mail, Check } from 'lucide-react'
import { useWebShare, buildShareUrl } from '@/lib/hooks/useWebShare'
import { trackShare } from '@/lib/actions/shares'

interface ShareButtonProps {
  shareableType: 'wine' | 'producer'
  shareableId: string
  title: string
  description: string
  url: string
}

export function ShareButton({
  shareableType,
  shareableId,
  title,
  description,
  url,
}: ShareButtonProps) {
  const { isSupported, share } = useWebShare()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const track = useCallback(
    (platform: string) => {
      trackShare({ shareableType, shareableId, platform })
    },
    [shareableType, shareableId]
  )

  const handleNativeShare = async () => {
    const shareUrl = buildShareUrl(url, 'native_share')
    const success = await share({ title, text: description, url: shareUrl })
    if (success) {
      track('native_share')
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = buildShareUrl(url, 'clipboard')
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      track('clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
    setMenuOpen(false)
  }

  const handleTwitter = () => {
    const shareUrl = buildShareUrl(url, 'twitter')
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
    track('twitter')
    setMenuOpen(false)
  }

  const handleEmail = () => {
    const shareUrl = buildShareUrl(url, 'email')
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`
    window.location.href = mailtoUrl
    track('email')
    setMenuOpen(false)
  }

  if (isSupported) {
    return (
      <button
        type="button"
        onClick={handleNativeShare}
        aria-label={`Share ${title}`}
        className="rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Share2 className="h-5 w-5" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={`Share ${title}`}
        aria-expanded={menuOpen}
        className="rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Share2 className="h-5 w-5" aria-hidden="true" />
      </button>

      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Menu */}
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-popover p-1 shadow-md"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleCopyLink}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? (
                <Check className="h-4 w-4 text-cru-success" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleTwitter}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post on X
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleEmail}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email
            </button>
          </div>
        </>
      )}
    </div>
  )
}
