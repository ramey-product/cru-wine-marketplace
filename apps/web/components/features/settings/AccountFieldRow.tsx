'use client'

import { useState, useTransition } from 'react'

interface AccountFieldRowProps {
  /** Visible field label (e.g. "Name", "Email") */
  label: string
  /** Unique id for the input element — required for accessibility */
  fieldId: string
  /** Controls input type and editing behaviour */
  type: 'name' | 'email' | 'password'
  /** Current display value shown in read-only state */
  currentValue: string
  /** Button label in read-only state; defaults to "Save" */
  actionLabel?: string
}

/**
 * A single settings row that toggles between read-only display and an inline
 * edit form.  Name fields render an input inline; Email and Password fields
 * show a button that opens an inline form below the row.
 */
export function AccountFieldRow({
  label,
  fieldId,
  type,
  currentValue,
  actionLabel = 'Save',
}: AccountFieldRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(currentValue)
  const [pendingValue, setPendingValue] = useState(currentValue)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Password type always shows masked value; never allow direct editing of the mask
  const displayValue = type === 'password' ? '••••••••' : value

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      // TODO: Wire to the appropriate server action (updateProfile / updateEmail / updatePassword)
      await new Promise((r) => setTimeout(r, 400))
      setValue(pendingValue)
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const handleCancel = () => {
    setPendingValue(value)
    setIsEditing(false)
    setError(null)
  }

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Label + value */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {!isEditing && (
            <p className="mt-0.5 text-sm text-muted-foreground truncate">
              {displayValue}
              {saved && (
                <span className="ml-2 text-xs text-green-600" role="status">
                  Saved
                </span>
              )}
            </p>
          )}
        </div>

        {/* Action button — only shown in read-only state */}
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setPendingValue(type === 'password' ? '' : value)
              setIsEditing(true)
            }}
            aria-label={`${actionLabel} ${label.toLowerCase()}`}
            className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {actionLabel === 'Save' ? 'Edit' : actionLabel}
          </button>
        )}
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <form onSubmit={handleSave} className="mt-3 space-y-3">
          <div>
            <label htmlFor={fieldId} className="sr-only">
              {label}
            </label>
            <input
              id={fieldId}
              type={type === 'password' ? 'password' : type === 'email' ? 'email' : 'text'}
              value={pendingValue}
              onChange={(e) => setPendingValue(e.target.value)}
              autoFocus
              autoComplete={type === 'password' ? 'new-password' : type === 'email' ? 'email' : 'name'}
              placeholder={type === 'password' ? 'New password' : undefined}
              className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending || pendingValue.length === 0}
              aria-label={`Save ${label.toLowerCase()}`}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              aria-label={`Cancel editing ${label.toLowerCase()}`}
              className="rounded-lg px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
