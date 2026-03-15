/**
 * UndoToast — lightweight fixed-position notification with an "Undo" action.
 *
 * Renders in a portal-like position (fixed, bottom-center) so it floats
 * above page content. An animated progress bar visualises the countdown.
 *
 * Accessibility:
 *  - `role="status"` + `aria-live="polite"` announces the message to screen
 *    readers without interrupting them.
 *  - The Undo button is focusable and keyboard-operable.
 *  - Respects `prefers-reduced-motion` via the Tailwind `motion-safe:` variant.
 */
'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
  /** Duration in milliseconds — must match the parent's setTimeout duration */
  durationMs: number
}

export function UndoToast({ message, onUndo, onDismiss, durationMs }: UndoToastProps) {
  const progressRef = useRef<HTMLDivElement>(null)

  // Kick off the CSS progress-bar animation once mounted
  useEffect(() => {
    const el = progressRef.current
    if (!el) return

    // Start from 100% width, animate to 0 over durationMs
    el.style.transition = 'none'
    el.style.width = '100%'

    // Force a reflow so the transition fires from 100% → 0%
    void el.offsetWidth

    el.style.transition = `width ${durationMs}ms linear`
    el.style.width = '0%'
  }, [durationMs])

  return (
    // Fixed portal — sits above the mobile tab bar (pb-safe) and above the desktop footer
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="
        fixed bottom-20 left-1/2 z-50
        -translate-x-1/2
        w-[calc(100vw-2rem)] max-w-sm
        rounded-lg border border-border bg-popover shadow-lg
        motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:fade-in
        duration-200
      "
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-lg bg-muted">
        <div
          ref={progressRef}
          className="h-full bg-primary"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Message */}
        <p className="flex-1 text-sm text-popover-foreground">{message}</p>

        {/* Undo action */}
        <button
          type="button"
          onClick={onUndo}
          className="
            flex-shrink-0 text-sm font-semibold text-primary
            hover:text-primary/80 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
            rounded
          "
        >
          Undo
        </button>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="
            flex-shrink-0 rounded p-0.5 text-muted-foreground
            hover:text-foreground transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
          "
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
