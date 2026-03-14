'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'

// Hours configuration for each day of the week
const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const

type DayKey = (typeof DAYS_OF_WEEK)[number]['key']

interface DayHours {
  open: string
  close: string
  closed: boolean
}

export interface StoreInfoData {
  storeName: string
  street: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  hours: Record<DayKey, DayHours>
}

interface StoreInfoFormProps {
  initialData: StoreInfoData
}

// Validate a US phone number in formats like (323) 555-0142 or 323-555-0142
function isValidPhone(value: string): boolean {
  return /^(\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10})$/.test(value.trim())
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidZip(value: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(value.trim())
}

type FormErrors = Partial<Record<string, string>>

export function StoreInfoForm({ initialData }: StoreInfoFormProps) {
  const [isPending, startTransition] = useTransition()

  // Controlled field state
  const [storeName, setStoreName] = useState(initialData.storeName)
  const [street, setStreet] = useState(initialData.street)
  const [city, setCity] = useState(initialData.city)
  const [state, setState] = useState(initialData.state)
  const [zip, setZip] = useState(initialData.zip)
  const [phone, setPhone] = useState(initialData.phone)
  const [email, setEmail] = useState(initialData.email)
  const [hours, setHours] = useState<Record<DayKey, DayHours>>(initialData.hours)

  const [errors, setErrors] = useState<FormErrors>({})
  const [saved, setSaved] = useState(false)

  // Track whether the form has been modified from the initial values
  const isDirty =
    storeName !== initialData.storeName ||
    street !== initialData.street ||
    city !== initialData.city ||
    state !== initialData.state ||
    zip !== initialData.zip ||
    phone !== initialData.phone ||
    email !== initialData.email ||
    JSON.stringify(hours) !== JSON.stringify(initialData.hours)

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!storeName.trim()) {
      newErrors.storeName = 'Store name is required'
    }
    if (!street.trim()) {
      newErrors.street = 'Street address is required'
    }
    if (!city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!state.trim()) {
      newErrors.state = 'State is required'
    }
    if (!zip.trim()) {
      newErrors.zip = 'ZIP code is required'
    } else if (!isValidZip(zip)) {
      newErrors.zip = 'Enter a valid ZIP code (e.g. 90210 or 90210-1234)'
    }
    if (phone.trim() && !isValidPhone(phone)) {
      newErrors.phone = 'Enter a valid phone number (e.g. (323) 555-0142)'
    }
    if (email.trim() && !isValidEmail(email)) {
      newErrors.email = 'Enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleDayHoursChange(day: DayKey, field: keyof DayHours, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)

    if (!validate()) return

    startTransition(async () => {
      // TODO: Call updateRetailerSettings server action with store info payload
      console.log('Saving store info:', { storeName, street, city, state, zip, phone, email, hours })
      await new Promise((r) => setTimeout(r, 500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  // Shared input class — highlights the border red when the field has an error
  const inputClass = (field: string) =>
    cn(
      'block w-full rounded-lg border bg-background px-3 py-2 text-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      errors[field]
        ? 'border-destructive focus-visible:ring-destructive/30'
        : 'border-border'
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Store Name */}
      <div>
        <label htmlFor="storeName" className="block text-sm font-medium mb-1">
          Store Name <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="storeName"
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className={inputClass('storeName')}
          placeholder="e.g. Wine House LA"
          aria-required="true"
          aria-describedby={errors.storeName ? 'storeName-error' : undefined}
        />
        {errors.storeName && (
          <p id="storeName-error" className="mt-1 text-xs text-destructive" role="alert">
            {errors.storeName}
          </p>
        )}
      </div>

      {/* Address */}
      <fieldset>
        <legend className="text-sm font-medium mb-3">Address</legend>
        <div className="space-y-3">
          {/* Street */}
          <div>
            <label htmlFor="street" className="block text-sm font-medium mb-1">
              Street Address <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <input
              id="street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className={inputClass('street')}
              placeholder="456 Vine Street"
              aria-required="true"
              aria-describedby={errors.street ? 'street-error' : undefined}
            />
            {errors.street && (
              <p id="street-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.street}
              </p>
            )}
          </div>

          {/* City / State / ZIP */}
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-3">
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                City <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass('city')}
                placeholder="Los Angeles"
                aria-required="true"
                aria-describedby={errors.city ? 'city-error' : undefined}
              />
              {errors.city && (
                <p id="city-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.city}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label htmlFor="state" className="block text-sm font-medium mb-1">
                State <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                className={inputClass('state')}
                placeholder="CA"
                maxLength={2}
                aria-required="true"
                aria-describedby={errors.state ? 'state-error' : undefined}
              />
              {errors.state && (
                <p id="state-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.state}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label htmlFor="zip" className="block text-sm font-medium mb-1">
                ZIP <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <input
                id="zip"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className={inputClass('zip')}
                placeholder="90028"
                aria-required="true"
                aria-describedby={errors.zip ? 'zip-error' : undefined}
              />
              {errors.zip && (
                <p id="zip-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.zip}
                </p>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      {/* Contact */}
      <fieldset>
        <legend className="text-sm font-medium mb-3">Contact Information</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass('phone')}
              placeholder="(323) 555-0142"
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="storeEmail" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="storeEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass('email')}
              placeholder="orders@winehousela.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.email}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Hours of Operation */}
      <fieldset>
        <legend className="text-sm font-medium mb-3">Hours of Operation</legend>
        <div className="space-y-2">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const day = hours[key]
            return (
              <div key={key} className="flex items-center gap-3">
                {/* Day label — fixed width keeps the grid aligned */}
                <span className="w-24 text-sm text-muted-foreground shrink-0">{label}</span>

                {/* Closed toggle */}
                <div className="flex items-center gap-1.5">
                  <input
                    id={`${key}-closed`}
                    type="checkbox"
                    checked={day.closed}
                    onChange={(e) => handleDayHoursChange(key, 'closed', e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                    aria-label={`${label} closed`}
                  />
                  <label htmlFor={`${key}-closed`} className="text-xs text-muted-foreground select-none">
                    Closed
                  </label>
                </div>

                {/* Open / close time inputs — hidden when closed */}
                {!day.closed && (
                  <div className="flex items-center gap-2 flex-1">
                    <div>
                      <label htmlFor={`${key}-open`} className="sr-only">
                        {label} opening time
                      </label>
                      <input
                        id={`${key}-open`}
                        type="time"
                        value={day.open}
                        onChange={(e) => handleDayHoursChange(key, 'open', e.target.value)}
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground" aria-hidden="true">–</span>
                    <div>
                      <label htmlFor={`${key}-close`} className="sr-only">
                        {label} closing time
                      </label>
                      <input
                        id={`${key}-close`}
                        type="time"
                        value={day.close}
                        onChange={(e) => handleDayHoursChange(key, 'close', e.target.value)}
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </fieldset>

      {/* Footer: unsaved indicator + save button */}
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
            aria-label="Save store information"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
