'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WineSearchResult {
  id: string
  name: string
  producer: string
  region: string
  vintage: string
}

// Mock wine search results
// TODO: Replace with searchWinesAction
const MOCK_WINE_DATABASE: WineSearchResult[] = [
  {
    id: 'ws-1',
    name: 'Domaine Tempier Bandol Rose 2023',
    producer: 'Domaine Tempier',
    region: 'Bandol, Provence',
    vintage: '2023',
  },
  {
    id: 'ws-2',
    name: 'Ridge Monte Bello 2019',
    producer: 'Ridge Vineyards',
    region: 'Santa Cruz Mountains',
    vintage: '2019',
  },
  {
    id: 'ws-3',
    name: 'Kistler Sonoma Mountain Chardonnay 2022',
    producer: 'Kistler Vineyards',
    region: 'Sonoma Mountain',
    vintage: '2022',
  },
  {
    id: 'ws-4',
    name: 'Produttori del Barbaresco Riserva Montestefano 2017',
    producer: 'Produttori del Barbaresco',
    region: 'Barbaresco, Piedmont',
    vintage: '2017',
  },
  {
    id: 'ws-5',
    name: 'Francois Raveneau Chablis 1er Cru Butteaux 2021',
    producer: 'Francois Raveneau',
    region: 'Chablis, Burgundy',
    vintage: '2021',
  },
  {
    id: 'ws-6',
    name: 'Chateau Musar Red 2016',
    producer: 'Chateau Musar',
    region: 'Bekaa Valley, Lebanon',
    vintage: '2016',
  },
]

interface WineSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (wine: WineSearchResult) => void
}

export function WineSearchModal({
  open,
  onOpenChange,
  onSelect,
}: WineSearchModalProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('')
      setDebouncedQuery('')
    }
  }, [open])

  // Focus input on open
  useEffect(() => {
    if (open) {
      // Small delay to allow dialog animation
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  const results = debouncedQuery.trim()
    ? MOCK_WINE_DATABASE.filter((wine) => {
        const q = debouncedQuery.toLowerCase()
        return (
          wine.name.toLowerCase().includes(q) ||
          wine.producer.toLowerCase().includes(q) ||
          wine.region.toLowerCase().includes(q)
        )
      })
    : []

  function handleSelect(wine: WineSearchResult) {
    onSelect(wine)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Wines</DialogTitle>
          <DialogDescription>
            Find a wine in the Cru database to match with the retailer
            listing.
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by wine name, producer, or region..."
            aria-label="Search wines in database"
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto">
          {debouncedQuery.trim() && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No wines found matching &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y divide-border rounded-lg border border-border">
              {results.map((wine) => (
                <button
                  key={wine.id}
                  type="button"
                  onClick={() => handleSelect(wine)}
                  aria-label={`Select ${wine.name}`}
                  className={cn(
                    'flex w-full flex-col items-start px-4 py-3 text-left transition-colors',
                    'hover:bg-muted focus-visible:outline-none focus-visible:bg-muted'
                  )}
                >
                  <span className="text-sm font-medium text-foreground">
                    {wine.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {wine.producer} &middot; {wine.region} &middot;{' '}
                    {wine.vintage}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!debouncedQuery.trim() && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Start typing to search the wine database.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
