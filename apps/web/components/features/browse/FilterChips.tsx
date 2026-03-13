'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'

interface FilterChip {
  key: string
  value: string
  label: string
}

export function FilterChips() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const chips: FilterChip[] = []

  for (const region of searchParams.getAll('region')) {
    chips.push({ key: 'region', value: region, label: `Region: ${region}` })
  }
  for (const varietal of searchParams.getAll('varietal')) {
    chips.push({ key: 'varietal', value: varietal, label: `Varietal: ${varietal}` })
  }
  const priceMin = searchParams.get('price_min')
  if (priceMin) {
    chips.push({ key: 'price_min', value: priceMin, label: `Min: $${priceMin}` })
  }
  const priceMax = searchParams.get('price_max')
  if (priceMax) {
    chips.push({ key: 'price_max', value: priceMax, label: `Max: $${priceMax}` })
  }

  const removeChip = useCallback(
    (chip: FilterChip) => {
      const params = new URLSearchParams(searchParams.toString())

      if (chip.key === 'price_min' || chip.key === 'price_max') {
        params.delete(chip.key)
      } else {
        // For multi-value params (region, varietal), remove only the specific value
        const current = params.getAll(chip.key)
        params.delete(chip.key)
        current.filter((v) => v !== chip.value).forEach((v) => params.append(chip.key, v))
      }

      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [router, pathname])

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4" role="list" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          onClick={() => removeChip(chip)}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm
                     text-foreground hover:bg-muted/80 transition-colors"
          role="listitem"
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label}
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ))}

      <button
        onClick={clearAll}
        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        aria-label="Clear all filters"
      >
        Clear all
      </button>
    </div>
  )
}
