'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

export interface FulfillmentSettingsData {
  pickupEnabled: boolean
  deliveryEnabled: boolean
  /** Delivery radius in miles — only relevant when deliveryEnabled is true */
  deliveryRadiusMiles: number
  /** Delivery fee in dollars */
  deliveryFeeDollars: number
  /** Estimated delivery time in minutes */
  estimatedDeliveryMinutes: number
}

interface FulfillmentSettingsFormProps {
  initialData: FulfillmentSettingsData
}

type FormErrors = Partial<{
  deliveryRadiusMiles: string
  deliveryFeeDollars: string
  estimatedDeliveryMinutes: string
}>

export function FulfillmentSettingsForm({ initialData }: FulfillmentSettingsFormProps) {
  const [isPending, startTransition] = useTransition()

  const [pickupEnabled, setPickupEnabled] = useState(initialData.pickupEnabled)
  const [deliveryEnabled, setDeliveryEnabled] = useState(initialData.deliveryEnabled)
  const [deliveryRadiusMiles, setDeliveryRadiusMiles] = useState(
    String(initialData.deliveryRadiusMiles)
  )
  const [deliveryFeeDollars, setDeliveryFeeDollars] = useState(
    String(initialData.deliveryFeeDollars)
  )
  const [estimatedDeliveryMinutes, setEstimatedDeliveryMinutes] = useState(
    String(initialData.estimatedDeliveryMinutes)
  )

  const [errors, setErrors] = useState<FormErrors>({})
  const [saved, setSaved] = useState(false)

  // Detect dirty state by comparing against initial values
  const isDirty =
    pickupEnabled !== initialData.pickupEnabled ||
    deliveryEnabled !== initialData.deliveryEnabled ||
    deliveryRadiusMiles !== String(initialData.deliveryRadiusMiles) ||
    deliveryFeeDollars !== String(initialData.deliveryFeeDollars) ||
    estimatedDeliveryMinutes !== String(initialData.estimatedDeliveryMinutes)

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (deliveryEnabled) {
      const radius = Number(deliveryRadiusMiles)
      if (!deliveryRadiusMiles.trim() || isNaN(radius) || radius <= 0) {
        newErrors.deliveryRadiusMiles = 'Enter a delivery radius greater than 0'
      } else if (radius > 200) {
        newErrors.deliveryRadiusMiles = 'Delivery radius cannot exceed 200 miles'
      }

      const fee = Number(deliveryFeeDollars)
      if (!deliveryFeeDollars.trim() || isNaN(fee) || fee < 0) {
        newErrors.deliveryFeeDollars = 'Enter a valid delivery fee (0 or more)'
      }

      const minutes = Number(estimatedDeliveryMinutes)
      if (!estimatedDeliveryMinutes.trim() || isNaN(minutes) || minutes <= 0) {
        newErrors.estimatedDeliveryMinutes = 'Enter an estimated delivery time greater than 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)

    if (!validate()) return

    startTransition(async () => {
      // TODO: Call updateRetailerSettings server action with fulfillment payload
      console.log('Saving fulfillment settings:', {
        pickupEnabled,
        deliveryEnabled,
        deliveryRadiusMiles: Number(deliveryRadiusMiles),
        deliveryFeeDollars: Number(deliveryFeeDollars),
        estimatedDeliveryMinutes: Number(estimatedDeliveryMinutes),
      })
      await new Promise((r) => setTimeout(r, 500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const numberInputClass = (field: keyof FormErrors) =>
    cn(
      'block w-full rounded-lg border bg-background px-3 py-2 text-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      errors[field]
        ? 'border-destructive focus-visible:ring-destructive/30'
        : 'border-border'
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Pickup toggle */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="pickupEnabled"
          checked={pickupEnabled}
          onCheckedChange={(checked) => setPickupEnabled(checked === true)}
          aria-describedby="pickupEnabled-desc"
        />
        <div>
          <label
            htmlFor="pickupEnabled"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            In-Store Pickup
          </label>
          <p id="pickupEnabled-desc" className="mt-1 text-xs text-muted-foreground">
            Customers can pick up orders directly at your store location.
          </p>
        </div>
      </div>

      {/* Delivery toggle */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="deliveryEnabled"
          checked={deliveryEnabled}
          onCheckedChange={(checked) => setDeliveryEnabled(checked === true)}
          aria-describedby="deliveryEnabled-desc"
        />
        <div>
          <label
            htmlFor="deliveryEnabled"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Local Delivery
          </label>
          <p id="deliveryEnabled-desc" className="mt-1 text-xs text-muted-foreground">
            You deliver orders within a local radius.
          </p>
        </div>
      </div>

      {/* Delivery detail fields — conditionally shown when delivery is enabled */}
      {deliveryEnabled && (
        <div
          className="ml-7 space-y-4 rounded-lg border border-border bg-muted/30 p-4"
          aria-label="Delivery configuration"
        >
          {/* Delivery radius */}
          <div>
            <label htmlFor="deliveryRadiusMiles" className="block text-sm font-medium mb-1">
              Delivery Radius (miles){' '}
              <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="deliveryRadiusMiles"
                type="number"
                min={1}
                max={200}
                step={1}
                value={deliveryRadiusMiles}
                onChange={(e) => setDeliveryRadiusMiles(e.target.value)}
                className={cn(numberInputClass('deliveryRadiusMiles'), 'w-28')}
                placeholder="10"
                aria-required="true"
                aria-describedby={
                  errors.deliveryRadiusMiles ? 'radius-error' : undefined
                }
              />
              <span className="text-sm text-muted-foreground">miles</span>
            </div>
            {errors.deliveryRadiusMiles && (
              <p id="radius-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.deliveryRadiusMiles}
              </p>
            )}
          </div>

          {/* Delivery fee */}
          <div>
            <label htmlFor="deliveryFeeDollars" className="block text-sm font-medium mb-1">
              Delivery Fee{' '}
              <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground" aria-hidden="true">$</span>
              <input
                id="deliveryFeeDollars"
                type="number"
                min={0}
                step={0.01}
                value={deliveryFeeDollars}
                onChange={(e) => setDeliveryFeeDollars(e.target.value)}
                className={cn(numberInputClass('deliveryFeeDollars'), 'w-28')}
                placeholder="9.99"
                aria-required="true"
                aria-label="Delivery fee in dollars"
                aria-describedby={
                  errors.deliveryFeeDollars ? 'fee-error' : undefined
                }
              />
            </div>
            {errors.deliveryFeeDollars && (
              <p id="fee-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.deliveryFeeDollars}
              </p>
            )}
          </div>

          {/* Estimated delivery time */}
          <div>
            <label
              htmlFor="estimatedDeliveryMinutes"
              className="block text-sm font-medium mb-1"
            >
              Estimated Delivery Time{' '}
              <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="estimatedDeliveryMinutes"
                type="number"
                min={1}
                step={5}
                value={estimatedDeliveryMinutes}
                onChange={(e) => setEstimatedDeliveryMinutes(e.target.value)}
                className={cn(numberInputClass('estimatedDeliveryMinutes'), 'w-28')}
                placeholder="45"
                aria-required="true"
                aria-describedby={
                  errors.estimatedDeliveryMinutes ? 'minutes-error' : undefined
                }
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
            {errors.estimatedDeliveryMinutes && (
              <p id="minutes-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.estimatedDeliveryMinutes}
              </p>
            )}
          </div>
        </div>
      )}

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
              Settings saved!
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
            aria-label="Save fulfillment settings"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
