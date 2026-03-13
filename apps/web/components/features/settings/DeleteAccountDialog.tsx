'use client'

import { useState, useTransition } from 'react'

export function DeleteAccountDialog() {
  const [showDialog, setShowDialog] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    if (confirmation !== 'DELETE') return
    setError(null)

    startTransition(async () => {
      // TODO: Call initiateDeletion server action, then sign out
      // For now, just show error since we can't actually delete
      setError('Account deletion is not yet available. Contact support for help.')
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDialog(true)}
        className="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Delete account
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowDialog(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            role="alertdialog"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            className="relative z-50 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 id="delete-title" className="text-lg font-semibold">
              Delete your account?
            </h3>
            <p id="delete-desc" className="mt-2 text-sm text-muted-foreground">
              This action is permanent. All your data — wishlists, taste profile,
              follows — will be removed. This cannot be undone.
            </p>

            <div className="mt-4">
              <label htmlFor="delete-confirm" className="block text-sm font-medium mb-1">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                autoComplete="off"
              />
            </div>

            {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDialog(false)
                  setConfirmation('')
                  setError(null)
                }}
                className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmation !== 'DELETE' || isPending}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {isPending ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
