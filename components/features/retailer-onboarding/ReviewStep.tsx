'use client'

import type { WizardFormData } from './OnboardingWizard'

interface ReviewStepProps {
  formData: WizardFormData
  onBack: () => void
  onEdit: (step: number) => void
  onSubmit: () => void
  isSubmitting: boolean
  submitError: string | null
}

const POS_LABELS: Record<string, string> = {
  square: 'Square',
  lightspeed: 'Lightspeed',
  shopify: 'Shopify',
  clover: 'Clover',
  csv_only: 'CSV Upload Only',
  other: 'Other',
}

const FULFILLMENT_LABELS: Record<string, string> = {
  pickup: 'In-Store Pickup',
  delivery: 'Local Delivery',
  shipping: 'Shipping',
}

function SectionHeader({
  title,
  step,
  onEdit,
}: {
  title: string
  step: number
  onEdit: (step: number) => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="text-xs font-medium text-purple-600 hover:text-purple-700"
        aria-label={`Edit ${title}`}
      >
        Edit
      </button>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '—'}</dd>
    </div>
  )
}

export function ReviewStep({
  formData,
  onBack,
  onEdit,
  onSubmit,
  isSubmitting,
  submitError,
}: ReviewStepProps) {
  const csvCount = formData.csv_items?.length ?? 0

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-gray-900">Review & Submit</h2>
      <p className="mb-6 text-sm text-gray-500">
        Review your store details before creating your account.
      </p>

      <div className="space-y-6">
        {/* Store Details */}
        <div>
          <SectionHeader title="Store Details" step={1} onEdit={onEdit} />
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="Store Name" value={formData.store_name} />
            <Field
              label="Address"
              value={`${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`}
            />
            <Field label="Phone" value={formData.phone} />
            <Field label="Email" value={formData.email} />
            <Field label="Website" value={formData.website} />
          </dl>
        </div>

        {/* POS System */}
        <div>
          <SectionHeader title="POS System" step={2} onEdit={onEdit} />
          <dl className="mt-3">
            <Field
              label="Selected POS"
              value={
                formData.pos_type
                  ? POS_LABELS[formData.pos_type] ?? formData.pos_type
                  : 'None selected'
              }
            />
          </dl>
        </div>

        {/* Fulfillment */}
        <div>
          <SectionHeader title="Fulfillment" step={3} onEdit={onEdit} />
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-gray-500">Methods</dt>
              <dd className="text-sm text-gray-900">
                {formData.fulfillment_capabilities
                  .map((c) => FULFILLMENT_LABELS[c] ?? c)
                  .join(', ')}
              </dd>
            </div>
            {formData.delivery_radius_miles != null && (
              <Field
                label="Delivery Radius"
                value={`${formData.delivery_radius_miles} miles`}
              />
            )}
          </dl>
        </div>

        {/* Inventory */}
        <div>
          <SectionHeader title="Inventory" step={4} onEdit={onEdit} />
          <dl className="mt-3">
            <Field
              label="CSV Upload"
              value={
                csvCount > 0
                  ? `${csvCount} wine${csvCount !== 1 ? 's' : ''} ready to import`
                  : 'No inventory uploaded (can be added later)'
              }
            />
          </dl>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          aria-label="Go back to inventory upload"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-purple-600 px-8 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          aria-label="Create your store"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating Store...
            </span>
          ) : (
            'Create Store'
          )}
        </button>
      </div>
    </div>
  )
}
