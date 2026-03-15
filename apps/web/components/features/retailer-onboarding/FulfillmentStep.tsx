'use client'

import { useState } from 'react'
import type { WizardFormData } from './OnboardingWizard'

interface FulfillmentStepProps {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onBack: () => void
}

const FULFILLMENT_OPTIONS = [
  {
    value: 'pickup',
    label: 'In-Store Pickup',
    description: 'Customers pick up orders at your store',
  },
  {
    value: 'delivery',
    label: 'Local Delivery',
    description: 'You deliver orders within a local radius',
  },
  {
    value: 'shipping',
    label: 'Shipping',
    description: 'Ship orders via carrier (UPS, FedEx, etc.)',
  },
] as const

export function FulfillmentStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: FulfillmentStepProps) {
  const [error, setError] = useState<string | null>(null)

  const toggleCapability = (value: string) => {
    const current = formData.fulfillment_capabilities
    const updated = current.includes(value)
      ? current.filter((c) => c !== value)
      : [...current, value]
    updateFormData({ fulfillment_capabilities: updated })

    // Clear delivery radius if delivery is unchecked
    if (value === 'delivery' && current.includes('delivery')) {
      updateFormData({
        fulfillment_capabilities: updated,
        delivery_radius_miles: undefined,
      })
    }
  }

  const handleNext = () => {
    if (formData.fulfillment_capabilities.length === 0) {
      setError('Select at least one fulfillment method')
      return
    }
    setError(null)
    onNext()
  }

  const showDeliveryRadius = formData.fulfillment_capabilities.includes('delivery')

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-foreground">Fulfillment Capabilities</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        How will customers receive their orders? Select all that apply.
      </p>

      <div className="space-y-3">
        {FULFILLMENT_OPTIONS.map((option) => {
          const isChecked = formData.fulfillment_capabilities.includes(option.value)
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors ${
                isChecked
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleCapability(option.value)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                aria-label={`Enable ${option.label}`}
              />
              <div>
                <span
                  className={`text-sm font-medium ${
                    isChecked ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {option.label}
                </span>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </label>
          )
        })}
      </div>

      {/* Delivery Radius */}
      {showDeliveryRadius && (
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
          <label
            htmlFor="delivery_radius"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Delivery Radius (miles)
          </label>
          <input
            id="delivery_radius"
            type="number"
            min={1}
            max={100}
            value={formData.delivery_radius_miles ?? ''}
            onChange={(e) =>
              updateFormData({
                delivery_radius_miles: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
              })
            }
            className="block w-32 rounded-md border border-border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="10"
            aria-label="Delivery radius in miles"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Maximum distance you&apos;ll deliver from your store.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-border bg-background px-6 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Go back to POS selection"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Continue to inventory upload"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
