'use client'

import type { WizardFormData } from './OnboardingWizard'

interface POSSelectionStepProps {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onBack: () => void
}

const POS_OPTIONS = [
  {
    value: 'square',
    label: 'Square',
    description: 'Square POS for retail and restaurants',
  },
  {
    value: 'lightspeed',
    label: 'Lightspeed',
    description: 'Lightspeed Retail POS system',
  },
  {
    value: 'shopify',
    label: 'Shopify',
    description: 'Shopify POS for retail',
  },
  {
    value: 'clover',
    label: 'Clover',
    description: 'Clover POS system by Fiserv',
  },
  {
    value: 'csv_only',
    label: 'CSV Upload Only',
    description: 'No POS integration — manage inventory via CSV uploads',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'A different POS system not listed here',
  },
] as const

export function POSSelectionStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: POSSelectionStepProps) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-gray-900">Point of Sale System</h2>
      <p className="mb-6 text-sm text-gray-500">
        Select your POS system for inventory sync. You can skip this step and add it later.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {POS_OPTIONS.map((option) => {
          const isSelected = formData.pos_type === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                updateFormData({
                  pos_type: isSelected ? undefined : (option.value as WizardFormData['pos_type']),
                })
              }
              className={`flex flex-col rounded-lg border-2 p-4 text-left transition-colors ${
                isSelected
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-pressed={isSelected}
              aria-label={`Select ${option.label} as your POS system`}
            >
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-purple-700' : 'text-gray-900'
                }`}
              >
                {option.label}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                {option.description}
              </span>
            </button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Go back to store details"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-purple-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Continue to fulfillment options"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
