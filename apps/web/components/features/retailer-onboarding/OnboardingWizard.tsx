'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { submitOnboardingAction, type OnboardingInput } from '@/lib/actions/retailer-onboarding'
import { StoreDetailsStep } from './StoreDetailsStep'
import { POSSelectionStep } from './POSSelectionStep'
import { FulfillmentStep } from './FulfillmentStep'
import { CSVUploadStep } from './CSVUploadStep'
import { ReviewStep } from './ReviewStep'

const STEPS = [
  { label: 'Store Details', number: 1 },
  { label: 'POS System', number: 2 },
  { label: 'Fulfillment', number: 3 },
  { label: 'Inventory', number: 4 },
  { label: 'Review', number: 5 },
] as const

export type WizardFormData = {
  // Step 1: Store Details
  store_name: string
  address: string
  city: string
  state: string
  zip: string
  latitude: number
  longitude: number
  phone: string
  email: string
  website: string

  // Step 2: POS Selection
  pos_type: OnboardingInput['pos_type']

  // Step 3: Fulfillment
  fulfillment_capabilities: string[]
  delivery_radius_miles: number | undefined

  // Step 4: CSV Upload
  csv_items: OnboardingInput['csv_items']
}

const INITIAL_FORM_DATA: WizardFormData = {
  store_name: '',
  address: '',
  city: '',
  state: 'CA',
  zip: '',
  latitude: 0,
  longitude: 0,
  phone: '',
  email: '',
  website: '',
  pos_type: undefined,
  fulfillment_capabilities: ['pickup'],
  delivery_radius_miles: undefined,
  csv_items: undefined,
}

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateFormData = useCallback(
    (updates: Partial<WizardFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }))
    },
    []
  )

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
  }, [])

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }, [])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step)
    }
  }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    const input: OnboardingInput = {
      store_name: formData.store_name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      latitude: formData.latitude,
      longitude: formData.longitude,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      website: formData.website || undefined,
      pos_type: formData.pos_type,
      fulfillment_capabilities: formData.fulfillment_capabilities as OnboardingInput['fulfillment_capabilities'],
      delivery_radius_miles: formData.delivery_radius_miles,
      csv_items: formData.csv_items,
    }

    const result = await submitOnboardingAction(input)

    if ('error' in result) {
      setSubmitError(result.error)
      setIsSubmitting(false)
      return
    }

    router.push(`/${result.data.org_slug}/retailers`)
  }

  return (
    <div>
      {/* Step Indicator */}
      <nav aria-label="Onboarding progress" className="mb-8">
        <ol className="flex items-center justify-between">
          {STEPS.map((step) => {
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            return (
              <li key={step.number} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => goToStep(step.number)}
                  disabled={step.number > currentStep}
                  className="flex w-full flex-col items-center gap-1"
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${step.number}: ${step.label}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </span>
                  <span
                    className={`text-xs ${
                      isActive ? 'font-medium text-purple-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {step.number < STEPS.length && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      currentStep > step.number ? 'bg-purple-300' : 'bg-gray-200'
                    }`}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {currentStep === 1 && (
          <StoreDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={goNext}
          />
        )}
        {currentStep === 2 && (
          <POSSelectionStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 3 && (
          <FulfillmentStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 4 && (
          <CSVUploadStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 5 && (
          <ReviewStep
            formData={formData}
            onBack={goBack}
            onEdit={goToStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  )
}
