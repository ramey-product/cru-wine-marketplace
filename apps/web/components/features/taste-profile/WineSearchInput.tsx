'use client'

import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { PLACEHOLDER_WINES } from '@/app/(app)/wines/_lib/placeholder-wines'

interface WineSearchResult {
  id: string
  name: string
  varietal: string | null
  producer: { name: string }
}

interface WineSearchInputProps {
  onWineSelect: (wine: WineSearchResult) => void
  excludeIds?: string[]
}

export function WineSearchInput({ onWineSelect, excludeIds = [] }: WineSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WineSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const search = useCallback(
    (term: string) => {
      if (term.length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      const lower = term.toLowerCase()
      // TODO: Replace with real DAL search call
      const matches = PLACEHOLDER_WINES.filter(
        (w) =>
          !excludeIds.includes(w.id) &&
          (w.name.toLowerCase().includes(lower) ||
            w.producer.name.toLowerCase().includes(lower) ||
            (w.varietal?.toLowerCase().includes(lower) ?? false))
      ).map((w) => ({
        id: w.id,
        name: w.name,
        varietal: w.varietal,
        producer: { name: w.producer.name },
      }))

      setResults(matches)
      setIsOpen(matches.length > 0 || term.length >= 2)
      setActiveIndex(-1)
    },
    [excludeIds]
  )

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSelect = (wine: WineSearchResult) => {
    onWineSelect(wine)
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && results[activeIndex]) {
          handleSelect(results[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const instanceId = useId()
  const listboxId = `wine-search-results-${instanceId}`
  const inputId = `wine-search-${instanceId}`

  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search for wines
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-autocomplete="list"
        placeholder="Search for a wine you've loved..."
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true)
        }}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-background shadow-lg"
        >
          {results.length > 0 ? (
            results.map((wine, index) => (
              <li
                key={wine.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={() => handleSelect(wine)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`cursor-pointer px-4 py-3 text-sm ${
                  index === activeIndex ? 'bg-muted' : ''
                } ${index !== results.length - 1 ? 'border-b border-border' : ''}`}
              >
                <p className="font-medium">{wine.name}</p>
                <p className="text-xs text-muted-foreground">
                  {wine.varietal} &middot; {wine.producer.name}
                </p>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              We couldn&apos;t find that wine &mdash; try a different name
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
