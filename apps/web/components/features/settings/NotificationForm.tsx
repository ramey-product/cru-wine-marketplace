'use client'

import { useState, useTransition } from 'react'

interface NotificationFormProps {
  initialFrequency: 'daily' | 'weekly' | 'off'
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'Get a daily digest of recommendations and activity' },
  { value: 'weekly', label: 'Weekly', description: 'A weekly roundup of what you missed' },
  { value: 'off', label: 'Off', description: 'No email notifications' },
] as const

export function NotificationForm({ initialFrequency }: NotificationFormProps) {
  const [isPending, startTransition] = useTransition()
  const [frequency, setFrequency] = useState(initialFrequency)
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)

    startTransition(async () => {
      // TODO: Call updatePreferences server action with notification_email_frequency
      await new Promise((r) => setTimeout(r, 500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium mb-3">Email frequency</legend>
        <div className="space-y-3">
          {FREQUENCY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                frequency === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-foreground/20'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={frequency === option.value}
                onChange={() => setFrequency(option.value as typeof frequency)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {saved && <p className="text-sm text-cru-success" role="status">Notification settings updated!</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
