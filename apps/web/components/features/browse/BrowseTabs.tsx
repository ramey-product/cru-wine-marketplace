'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

export type BrowseTab = 'all' | 'region' | 'varietal' | 'occasion' | 'producer'

const TABS: { value: BrowseTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'region', label: 'Region' },
  { value: 'varietal', label: 'Varietal' },
  { value: 'occasion', label: 'Occasion' },
  { value: 'producer', label: 'Producer' },
]

export function BrowseTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentTab = (searchParams.get('browse') as BrowseTab) || 'all'

  const handleTabChange = useCallback(
    (tab: BrowseTab) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'all') {
        params.delete('browse')
      } else {
        params.set('browse', tab)
      }
      // Clear filters when switching tabs since they may not apply
      params.delete('region')
      params.delete('varietal')
      params.delete('price_min')
      params.delete('price_max')
      params.delete('page')

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [searchParams, router, pathname]
  )

  return (
    <nav
      className="mb-6 border-b border-border"
      role="tablist"
      aria-label="Browse wines by category"
    >
      <div className="flex gap-1">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.value
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              aria-label={`Browse by ${tab.label}`}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors relative',
                'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-md',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
