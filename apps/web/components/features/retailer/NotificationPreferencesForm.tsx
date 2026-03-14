'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

export interface NotificationPreferencesData {
  newOrderEmail: boolean
  dailySummaryEmail: boolean
}

interface NotificationPreferencesFormProps {
  initialData: NotificationPreferencesData
}

/**
 * Retailer notification preferences form.
 * Available to all retailer members (owner + staff).
 * Each preference is an independent toggle stored per-user via upsertNotificationPreferences.
 */
export function NotificationPreferencesForm({
  initialData,
}: NotificationPreferencesFormProps) {
  const [isPending, startTransition] = useTransition()

  const [newOrderEmail, setNewOrderEmail] = useState(initialData.newOrderEmail)
  const [dailySummaryEmail, setDailySummaryEmail] = useState(initialData.dailySummaryEmail)
  const [saved, setSaved] = useState(false)

  const isDirty =
    newOrderEmail !== initialData.newOrderEmail ||
    dailySummaryEmail !== initialData.dailySummaryEmail

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)

    startTransition(async () => {
      // TODO: Call upsertNotificationPreferences server action
      console.log('Saving notification preferences:', { newOrderEmail, dailySummaryEmail })
      await new Promise((r) => setTimeout(r, 500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-4">
        {/* New order email */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="newOrderEmail"
            checked={newOrderEmail}
            onCheckedChange={(checked) => setNewOrderEmail(checked === true)}
            aria-describedby="newOrderEmail-desc"
          />
          <div>
            <label
              htmlFor="newOrderEmail"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              New order alerts
            </label>
            <p id="newOrderEmail-desc" className="mt-1 text-xs text-muted-foreground">
              Receive an email each time a new order is placed at your store.
            </p>
          </div>
        </div>

        {/* Daily summary email */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="dailySummaryEmail"
            checked={dailySummaryEmail}
            onCheckedChange={(checked) => setDailySummaryEmail(checked === true)}
            aria-describedby="dailySummaryEmail-desc"
          />
          <div>
            <label
              htmlFor="dailySummaryEmail"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Daily summary
            </label>
            <p id="dailySummaryEmail-desc" className="mt-1 text-xs text-muted-foreground">
              Receive a daily digest of orders, revenue, and inventory activity.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        {isDirty && !saved ? (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Unsaved changes
          </p>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          {saved && (
            <p className="text-sm text-cru-success" role="status" aria-live="polite">
              Preferences saved!
            </p>
          )}
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className={cn(
              'rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
            aria-label="Save notification preferences"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
