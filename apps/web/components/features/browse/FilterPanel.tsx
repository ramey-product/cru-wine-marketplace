'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { SlidersHorizontal } from 'lucide-react'

interface FilterPanelProps {
  availableRegions: string[]
  availableVarietals: string[]
}

export function FilterPanel({ availableRegions, availableVarietals }: FilterPanelProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const selectedRegions = searchParams.getAll('region')
  const selectedVarietals = searchParams.getAll('varietal')
  const priceMin = searchParams.get('price_min') ?? ''
  const priceMax = searchParams.get('price_max') ?? ''

  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)
      // Reset to page 1 when filters change
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  const toggleCheckbox = useCallback(
    (key: string, value: string) => {
      updateParams((params) => {
        const current = params.getAll(key)
        if (current.includes(value)) {
          params.delete(key)
          current.filter((v) => v !== value).forEach((v) => params.append(key, v))
        } else {
          params.append(key, value)
        }
      })
    },
    [updateParams]
  )

  const handlePriceChange = useCallback(
    (key: 'price_min' | 'price_max', value: string) => {
      updateParams((params) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
    },
    [updateParams]
  )

  return (
    <aside className="w-60 shrink-0 space-y-6" aria-label="Wine filters">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filters
      </div>

      {/* Region filter */}
      {availableRegions.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium mb-2">Region</legend>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {availableRegions.map((region) => (
              <label key={region} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={() => toggleCheckbox('region', region)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                {region}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Varietal filter */}
      {availableVarietals.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium mb-2">Varietal</legend>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {availableVarietals.map((varietal) => (
              <label key={varietal} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedVarietals.includes(varietal)}
                  onChange={() => toggleCheckbox('varietal', varietal)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                {varietal}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Price range */}
      <fieldset>
        <legend className="text-sm font-medium mb-2">Price Range</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => handlePriceChange('price_min', e.target.value)}
            min={0}
            aria-label="Minimum price"
            className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-muted-foreground text-sm">&ndash;</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => handlePriceChange('price_max', e.target.value)}
            min={0}
            aria-label="Maximum price"
            className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </fieldset>
    </aside>
  )
}
