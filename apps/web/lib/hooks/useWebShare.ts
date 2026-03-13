'use client'

import { useCallback, useMemo } from 'react'

interface ShareData {
  title: string
  text: string
  url: string
}

export function useWebShare() {
  const isSupported = useMemo(
    () => typeof navigator !== 'undefined' && !!navigator.share,
    []
  )

  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    if (!isSupported) return false

    try {
      await navigator.share(data)
      return true
    } catch (err) {
      // User cancelled — not an error
      if (err instanceof Error && err.name === 'AbortError') {
        return false
      }
      return false
    }
  }, [isSupported])

  return { isSupported, share }
}

export function buildShareUrl(baseUrl: string, platform: string): string {
  const url = new URL(baseUrl)
  url.searchParams.set('utm_source', 'share')
  url.searchParams.set('utm_medium', platform)
  url.searchParams.set('utm_campaign', 'user_share')
  return url.toString()
}
