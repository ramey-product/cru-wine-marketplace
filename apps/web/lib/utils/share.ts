/**
 * shareUrl — attempts the Web Share API, then falls back to clipboard copy.
 *
 * Returns:
 *   'shared'  — native share sheet was opened
 *   'copied'  — URL was written to the clipboard
 *   'failed'  — clipboard write failed (permissions denied, insecure context, etc.)
 */
export async function shareUrl({
  url,
  title,
  text,
}: {
  url: string
  title?: string
  text?: string
}): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator === 'undefined') return 'failed'

  // Prefer native share on devices that support it (iOS Safari, Android Chrome)
  if (navigator.share) {
    try {
      await navigator.share({ url, title, text })
      return 'shared'
    } catch (err) {
      // AbortError means the user dismissed the sheet — treat as no-op but still
      // return 'shared' so the caller doesn't show a redundant "Copied!" toast.
      if (err instanceof Error && err.name === 'AbortError') return 'shared'
      // For any other error, fall through to clipboard copy.
    }
  }

  // Clipboard copy fallback (desktop and browsers without Web Share)
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
