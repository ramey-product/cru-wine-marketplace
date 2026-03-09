'use client'

import { useState } from 'react'
import type { WizardFormData } from './OnboardingWizard'

interface StoreDetailsStepProps {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
  onNext: () => void
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
]

export function StoreDetailsStep({
  formData,
  updateFormData,
  onNext,
}: StoreDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.store_name.trim()) {
      newErrors.store_name = 'Store name is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.state) {
      newErrors.state = 'State is required'
    }
    if (!formData.zip.trim()) {
      newErrors.zip = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      newErrors.zip = 'Invalid ZIP code format (e.g. 90210 or 90210-1234)'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  const inputClass = (field: string) =>
    `block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-purple-500'
    }`

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-gray-900">Store Details</h2>
      <p className="mb-6 text-sm text-gray-500">
        Tell us about your wine store.
      </p>

      <div className="space-y-4">
        {/* Store Name */}
        <div>
          <label htmlFor="store_name" className="mb-1 block text-sm font-medium text-gray-700">
            Store Name <span className="text-red-500">*</span>
          </label>
          <input
            id="store_name"
            type="text"
            value={formData.store_name}
            onChange={(e) => updateFormData({ store_name: e.target.value })}
            className={inputClass('store_name')}
            placeholder="e.g. Napa Valley Wine Co."
            aria-label="Store name"
          />
          {errors.store_name && (
            <p className="mt-1 text-xs text-red-600">{errors.store_name}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            className={inputClass('address')}
            placeholder="123 Main St"
            aria-label="Street address"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-600">{errors.address}</p>
          )}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-3">
            <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              className={inputClass('city')}
              placeholder="San Francisco"
              aria-label="City"
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-600">{errors.city}</p>
            )}
          </div>

          <div className="col-span-1">
            <label htmlFor="state" className="mb-1 block text-sm font-medium text-gray-700">
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => updateFormData({ state: e.target.value })}
              className={inputClass('state')}
              aria-label="State"
            >
              {US_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label htmlFor="zip" className="mb-1 block text-sm font-medium text-gray-700">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              id="zip"
              type="text"
              value={formData.zip}
              onChange={(e) => updateFormData({ zip: e.target.value })}
              className={inputClass('zip')}
              placeholder="94102"
              aria-label="ZIP code"
            />
            {errors.zip && (
              <p className="mt-1 text-xs text-red-600">{errors.zip}</p>
            )}
          </div>
        </div>

        {/* Lat / Lng — hidden for now, geocoded from address in production */}
        <input type="hidden" value={formData.latitude} />
        <input type="hidden" value={formData.longitude} />

        {/* Contact Info (optional) */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            Contact Information (optional)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                className={inputClass('phone')}
                placeholder="(415) 555-0100"
                aria-label="Phone number"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className={inputClass('email')}
                placeholder="info@store.com"
                aria-label="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="website" className="mb-1 block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData({ website: e.target.value })}
                className={inputClass('website')}
                placeholder="https://store.com"
                aria-label="Website URL"
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-600">{errors.website}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="rounded-md bg-purple-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Continue to POS selection"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
