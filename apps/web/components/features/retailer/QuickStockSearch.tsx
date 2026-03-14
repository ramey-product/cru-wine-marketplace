'use client'

import { useState, useTransition, useCallback, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { StockStatusToggle, type StockStatus } from './StockStatusToggle'

// ---------------------------------------------------------------------------
// Mock data
// TODO: Replace with search API call (DAL: searchInventoryWines)
// ---------------------------------------------------------------------------

interface InventoryWine {
  id: string
  name: string
  producer: string
  status: StockStatus
}

const MOCK_WINES: InventoryWine[] = [
  { id: 'w-001', name: 'Bandol Rosé', producer: 'Domaine Tempier', status: 'in_stock' },
  { id: 'w-002', name: 'Monte Bello', producer: 'Ridge Vineyards', status: 'in_stock' },
  { id: 'w-003', name: 'Sonoma Mountain Chardonnay', producer: 'Kistler Vineyards', status: 'low_stock' },
  { id: 'w-004', name: 'Opus One', producer: 'Opus One Winery', status: 'in_stock' },
  { id: 'w-005', name: 'Special Selection Cabernet', producer: 'Caymus Vineyards', status: 'out_of_stock' },
  { id: 'w-006', name: 'To-Kalon Vineyard Cabernet', producer: 'Robert Mondavi', status: 'in_stock' },
  { id: 'w-007', name: 'Screaming Eagle Cabernet', producer: 'Screaming Eagle', status: 'low_stock' },
  { id: 'w-008', name: 'Staglin Family Estate Cabernet', producer: 'Staglin Family Vineyard', status: 'in_stock' },
  { id: 'w-009', name: 'Rayas Châteauneuf-du-Pape', producer: 'Château Rayas', status: 'out_of_stock' },
  { id: 'w-010', name: 'Grand Cru Chablis', producer: 'Dauvissat', status: 'low_stock' },
]

/**
 * Returns wines whose name or producer contains all query words (case-insensitive).
 * Empty query returns all wines.
 */
function filterWines(wines: InventoryWine[], query: string): InventoryWine[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return wines
  const words = trimmed.split(/\s+/)
  return wines.filter((w) => {
    const haystack = `${w.name} ${w.producer}`.toLowerCase()
    return words.every((word) => haystack.includes(word))
  })
}

/**
 * QuickStockSearch — Client Component.
 *
 * Debounced search input (300ms) that filters a wine list inline.
 * Each result row includes a StockStatusToggle for fast status updates.
 * useTransition keeps the toggle interactions non-blocking.
 *
 * TODO: Replace MOCK_WINES with search API call.
 * TODO: Wire handleToggle to overrideStockStatus server action.
 */
export function QuickStockSearch() {
  // Local state for the debounced search term and wine list
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const [wines, setWines] = useState<InventoryWine[]>(MOCK_WINES)
  const [isPending, startTransition] = useTransition()

  // Debounce: update `query` 300ms after the user stops typing
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setQuery(val), 300)
  }, [])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  /**
   * Optimistically update local wine status, then call the server action.
   *
   * TODO: Replace the optimistic update block below with:
   *   startTransition(async () => {
   *     const result = await overrideStockStatus({ wineId, status: newStatus })
   *     if (result.error) { revert local state + toast }
   *   })
   */
  function handleToggle(wineId: string, newStatus: StockStatus) {
    startTransition(() => {
      // Optimistic local update
      setWines((prev) =>
        prev.map((w) => (w.id === wineId ? { ...w, status: newStatus } : w))
      )
      // TODO: Replace with overrideStockStatus server action call
    })
  }

  const results = filterWines(wines, query)

  return (
    <section aria-label="Quick stock search">
      <h2 className="text-base font-semibold mb-3">Quick Stock Update</h2>

      {/* Search input */}
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search wines by name or producer…"
          aria-label="Search inventory wines"
          aria-controls="stock-search-results"
          className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Results list */}
      <div
        id="stock-search-results"
        role="region"
        aria-label="Search results"
        aria-live="polite"
        aria-busy={isPending}
      >
        {results.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No wines found matching &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {results.map((wine) => (
              <li
                key={wine.id}
                className="flex items-center justify-between gap-4 bg-card px-4 py-3"
              >
                {/* Wine info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{wine.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{wine.producer}</p>
                </div>

                {/* Stock status toggle */}
                <StockStatusToggle
                  wineId={wine.id}
                  currentStatus={wine.status}
                  onToggle={handleToggle}
                  disabled={isPending}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Result count */}
      <p className="mt-2 text-xs text-muted-foreground text-right">
        {results.length} {results.length === 1 ? 'wine' : 'wines'}
        {query ? ` matching "${query}"` : ' in inventory'}
      </p>
    </section>
  )
}
