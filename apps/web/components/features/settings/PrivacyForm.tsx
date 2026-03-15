'use client'

import { useState, useTransition } from 'react'

interface PrivacyFormProps {
  initialData: {
    /** Whether the user's profile is publicly visible */
    isPublic: boolean
  }
}

/**
 * Privacy settings form.
 * Controls profile visibility (public / private).
 * TODO: Wire to updateProfileVisibility server action once DAL is implemented.
 */
export function PrivacyForm({ initialData }: PrivacyFormProps) {
  const [isPublic, setIsPublic] = useState(initialData.isPublic)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)

    startTransition(async () => {
      // TODO: Call updateProfileVisibility server action
      await new Promise((r) => setTimeout(r, 400))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile visibility */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Profile visibility</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose whether other Cru members can find and view your profile.
          </p>
        </div>

        <div className="space-y-3">
          {/* Public option */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={isPublic}
              onChange={() => setIsPublic(true)}
              className="mt-0.5 h-4 w-4 border-border text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Public profile"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Public</p>
              <p className="text-sm text-muted-foreground">
                Anyone on Cru can see your profile, reviews, and activity.
              </p>
            </div>
          </label>

          {/* Private option */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={!isPublic}
              onChange={() => setIsPublic(false)}
              className="mt-0.5 h-4 w-4 border-border text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Private profile"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Private</p>
              <p className="text-sm text-muted-foreground">
                Only people you follow can see your profile and activity.
              </p>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-green-600" role="status">
          Privacy settings saved.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        aria-label="Save privacy settings"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
