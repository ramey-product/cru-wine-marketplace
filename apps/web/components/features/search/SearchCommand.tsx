'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Wine, User, Grape, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  type: 'wine' | 'producer' | 'varietal'
  label: string
  slug?: string
}

interface RecentSearch {
  id: string
  query: string
}

export function SearchCommand() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Open/close handlers
  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setResults([])
    setActiveIndex(-1)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    setActiveIndex(-1)
    // Restore focus to trigger button
    triggerRef.current?.focus()
  }, [])

  // Focus trap within dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return
    const dialog = dialogRef.current
    const focusableSelector = 'input, button, [tabindex]:not([tabindex="-1"])'

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      if (focusable.length === 0) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', handleTab)
    return () => dialog.removeEventListener('keydown', handleTab)
  }, [isOpen])

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          close()
        } else {
          open()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, open, close])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow the dialog to render
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim()) {
      setResults([])
      setActiveIndex(-1)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call to getSearchSuggestions
        // const suggestions = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        // setResults(await suggestions.json())

        // Placeholder: simulate search results based on query
        const placeholder: SearchResult[] = [
          { type: 'wine', label: `${query} Reserve Cabernet`, slug: `${query.toLowerCase().replace(/\s+/g, '-')}-reserve-cabernet` },
          { type: 'wine', label: `${query} Estate Blend`, slug: `${query.toLowerCase().replace(/\s+/g, '-')}-estate-blend` },
          { type: 'producer', label: `${query} Vineyards`, slug: `${query.toLowerCase().replace(/\s+/g, '-')}-vineyards` },
          { type: 'varietal', label: query.charAt(0).toUpperCase() + query.slice(1) },
        ]
        setResults(placeholder)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Navigate to a result
  const navigateToResult = useCallback(
    (result: SearchResult) => {
      close()
      switch (result.type) {
        case 'wine':
          if (result.slug) {
            router.push(`/wines/${result.slug}`)
          }
          break
        case 'producer':
          if (result.slug) {
            router.push(`/producers/${result.slug}`)
          }
          break
        case 'varietal':
          router.push(`/wines/varietal/${encodeURIComponent(result.label)}`)
          break
      }
    },
    [close, router]
  )

  // Submit search query
  const submitSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return
      close()
      router.push(`/wines/search?q=${encodeURIComponent(searchQuery.trim())}`)
    },
    [close, router]
  )

  // Keyboard navigation
  const totalItems = results.length
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
          break
        case 'Enter':
          e.preventDefault()
          const selectedResult = results[activeIndex]
          if (activeIndex >= 0 && selectedResult) {
            navigateToResult(selectedResult)
          } else {
            submitSearch(query)
          }
          break
        case 'Escape':
          e.preventDefault()
          close()
          break
      }
    },
    [activeIndex, totalItems, results, navigateToResult, submitSearch, query, close]
  )

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]')
      items[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'wine':
        return <Wine className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      case 'producer':
        return <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      case 'varietal':
        return <Grape className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    }
  }

  const getCategoryLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'wine':
        return 'Wines'
      case 'producer':
        return 'Producers'
      case 'varietal':
        return 'Varietals'
    }
  }

  // Group results by type
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    const key = result.type
    if (!acc[key]) acc[key] = []
    acc[key].push(result)
    return acc
  }, {})

  // Map from grouped results back to flat index
  let flatIndex = -1

  if (!isOpen) {
    return (
      <button
        ref={triggerRef}
        onClick={open}
        className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm
                   text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Search wines (Cmd+K)"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search wines...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="fixed inset-x-0 top-[20%] z-50 mx-auto w-full max-w-lg px-4"
        role="dialog"
        aria-label="Search wines"
        aria-modal="true"
      >
        <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search wines, producers, varietals..."
              className="w-full py-3 bg-transparent text-foreground placeholder:text-muted-foreground
                         focus:outline-none text-base"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-listbox"
              aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
              aria-autocomplete="list"
            />
            <button
              onClick={close}
              className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Results */}
          <ul
            ref={listRef}
            id="search-listbox"
            role="listbox"
            className="max-h-72 overflow-y-auto p-2"
          >
            {/* Loading state */}
            {isLoading && query.trim() && (
              <li className="px-3 py-2 text-sm text-muted-foreground">Searching...</li>
            )}

            {/* No results */}
            {!isLoading && query.trim() && results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </li>
            )}

            {/* Grouped results */}
            {!isLoading &&
              Object.entries(groupedResults).map(([type, items]) => (
                <li key={type} role="presentation">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {getCategoryLabel(type as SearchResult['type'])}
                  </div>
                  <ul role="group" aria-label={getCategoryLabel(type as SearchResult['type'])}>
                    {items.map((result) => {
                      flatIndex++
                      const currentIndex = flatIndex
                      return (
                        <li
                          key={`${result.type}-${result.label}`}
                          id={`search-option-${currentIndex}`}
                          role="option"
                          aria-selected={activeIndex === currentIndex}
                          className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors',
                            activeIndex === currentIndex
                              ? 'bg-muted text-foreground'
                              : 'text-foreground hover:bg-muted/50'
                          )}
                          onClick={() => navigateToResult(result)}
                          onMouseEnter={() => setActiveIndex(currentIndex)}
                        >
                          {getIcon(result.type)}
                          <span>{result.label}</span>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}

            {/* Empty state: recent searches */}
            {!query.trim() && recentSearches.length > 0 && (
              <li role="presentation">
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Recent Searches
                </div>
                <ul role="group" aria-label="Recent searches">
                  {recentSearches.map((recent) => (
                    <li
                      key={recent.id}
                      role="option"
                      aria-selected={false}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer
                                 text-foreground hover:bg-muted/50 transition-colors"
                      onClick={() => submitSearch(recent.query)}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span>{recent.query}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {/* Empty state: no query, no recents */}
            {!query.trim() && recentSearches.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Start typing to search wines, producers, and varietals
              </li>
            )}
          </ul>

          {/* Footer hint */}
          <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">&uarr;</kbd>
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">&darr;</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">Enter</kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">Esc</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
