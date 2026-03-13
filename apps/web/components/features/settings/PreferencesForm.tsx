'use client'

import { useState, useTransition } from 'react'
import { OCCASION_CATEGORIES } from '@/lib/validations/preferences'

interface PreferencesFormProps {
  initialData: {
    locationZip: string
    priceRangeMin: number | null
    priceRangeMax: number | null
    occasionTags: string[]
  }
}

const PRICE_RANGES = [
  { label: 'Under $15', min: 0, max: 15 },
  { label: '$15 - $25', min: 15, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100+', min: 100, max: null },
] as const

export function PreferencesForm({ initialData }: PreferencesFormProps) {
  const [isPending, startTransition] = useTransition()
  const [locationZip, setLocationZip] = useState(initialData.locationZip)
  const [selectedPriceIndex, setSelectedPriceIndex] = useState<number | null>(() => {
    return PRICE_RANGES.findIndex(
      (r) => r.min === initialData.priceRangeMin && r.max === initialData.priceRangeMax
    )
  })
  const [occasionTags, setOccasionTags] = useState<string[]>(initialData.occasionTags)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleOccasion = (tag: string) => {
    setOccasionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)

    startTransition(async () => {
      // TODO: Call updatePreferences server action
      await new Promise((r) => setTimeout(r, 500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Location */}
      <div>
        <label htmlFor="locationZip" className="block text-sm font-medium mb-1">
          Zip code
        </label>
        <input
          id="locationZip"
          type="text"
          inputMode="numeric"
          value={locationZip}
          onChange={(e) => setLocationZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder="e.g. 94105"
          className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <p className="mt-1 text-xs text-muted-foreground">Used to find wines near you.</p>
      </div>

      {/* Price range */}
      <fieldset>
        <legend className="text-sm font-medium mb-2">Preferred price range</legend>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((range, i) => (
            <button
              key={range.label}
              type="button"
              onClick={() => setSelectedPriceIndex(selectedPriceIndex === i ? null : i)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selectedPriceIndex === i
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Occasions */}
      <fieldset>
        <legend className="text-sm font-medium mb-2">When do you usually drink wine?</legend>
        <div className="flex flex-wrap gap-2">
          {OCCASION_CATEGORIES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleOccasion(tag)}
              className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                occasionTags.includes(tag)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {saved && <p className="text-sm text-cru-success" role="status">Preferences updated!</p>}

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
