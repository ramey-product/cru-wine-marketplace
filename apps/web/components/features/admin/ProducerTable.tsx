'use client'

/**
 * ProducerTable — Admin client component.
 *
 * Renders a searchable, sortable table of all producers using only
 * native React state (no @tanstack/react-table dependency).
 *
 * Clicking a row or the Edit action navigates to /admin/producers/[id].
 *
 * TODO: Replace MOCK_PRODUCERS with a getProducers DAL call passed as a prop.
 */

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Pencil, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProducerRow {
  id: string
  name: string
  slug: string
  region: string | null
  country: string | null
  wine_count: number
  is_active: boolean
}

type SortKey = 'name' | 'region' | 'wine_count'
type SortDir = 'asc' | 'desc'

// ---------------------------------------------------------------------------
// Mock data — TODO: Replace with getProducers DAL call
// ---------------------------------------------------------------------------

const MOCK_PRODUCERS: ProducerRow[] = [
  {
    id: '1',
    name: 'Domaine Tempier',
    slug: 'domaine-tempier',
    region: 'Bandol',
    country: 'France',
    wine_count: 8,
    is_active: true,
  },
  {
    id: '2',
    name: 'Ridge Vineyards',
    slug: 'ridge-vineyards',
    region: 'Santa Cruz Mountains',
    country: 'United States',
    wine_count: 14,
    is_active: true,
  },
  {
    id: '3',
    name: 'Kistler Vineyards',
    slug: 'kistler-vineyards',
    region: 'Sonoma Coast',
    country: 'United States',
    wine_count: 6,
    is_active: true,
  },
  {
    id: '4',
    name: 'Opus One Winery',
    slug: 'opus-one-winery',
    region: 'Oakville',
    country: 'United States',
    wine_count: 2,
    is_active: true,
  },
  {
    id: '5',
    name: 'Caymus Vineyards',
    slug: 'caymus-vineyards',
    region: 'Napa Valley',
    country: 'United States',
    wine_count: 5,
    is_active: false,
  },
]

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

function sortProducers(
  producers: ProducerRow[],
  key: SortKey,
  dir: SortDir
): ProducerRow[] {
  return [...producers].sort((a, b) => {
    let aVal: string | number
    let bVal: string | number

    if (key === 'wine_count') {
      aVal = a.wine_count
      bVal = b.wine_count
    } else {
      aVal = (a[key] ?? '').toLowerCase()
      bVal = (b[key] ?? '').toLowerCase()
    }

    if (aVal < bVal) return dir === 'asc' ? -1 : 1
    if (aVal > bVal) return dir === 'asc' ? 1 : -1
    return 0
  })
}

// ---------------------------------------------------------------------------
// SortButton — column header with sort indicators
// ---------------------------------------------------------------------------

interface SortButtonProps {
  label: string
  sortKey: SortKey
  currentKey: SortKey | null
  currentDir: SortDir
  onClick: (key: SortKey) => void
}

function SortButton({ label, sortKey, currentKey, currentDir, onClick }: SortButtonProps) {
  const isActive = currentKey === sortKey
  const Icon = isActive
    ? currentDir === 'asc'
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown

  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
      aria-label={`Sort by ${label}${isActive ? `, currently ${currentDir === 'asc' ? 'ascending' : 'descending'}` : ''}`}
    >
      {label}
      <Icon
        className={cn('h-3.5 w-3.5', !isActive && 'opacity-40')}
        aria-hidden="true"
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ProducerTableProps {
  /** Optional: pass real data from the server. Falls back to mock data. */
  producers?: ProducerRow[]
}

export function ProducerTable({ producers = MOCK_PRODUCERS }: ProducerTableProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // -------------------------------------------------------------------------
  // Derived: filter + sort
  // -------------------------------------------------------------------------

  const visibleRows = useMemo(() => {
    const q = query.toLowerCase().trim()

    const filtered = q
      ? producers.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.region ?? '').toLowerCase().includes(q) ||
            (p.country ?? '').toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q)
        )
      : producers

    return sortKey ? sortProducers(filtered, sortKey, sortDir) : filtered
  }, [producers, query, sortKey, sortDir])

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search producers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search producers"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm" aria-label="Producers list">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="px-5 py-3 text-left">
                <SortButton
                  label="Name"
                  sortKey="name"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onClick={handleSort}
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <SortButton
                  label="Region"
                  sortKey="region"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onClick={handleSort}
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Country
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                <SortButton
                  label="Wines"
                  sortKey="wine_count"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onClick={handleSort}
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th scope="col" className="px-5 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {visibleRows.length > 0 ? (
              visibleRows.map((producer) => (
                <tr
                  key={producer.id}
                  className="bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/producers/${producer.id}`)}
                  aria-label={`Open ${producer.name}`}
                >
                  {/* Name + slug */}
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{producer.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{producer.slug}</p>
                  </td>

                  {/* Region */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {producer.region ?? '—'}
                  </td>

                  {/* Country */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {producer.country ?? '—'}
                  </td>

                  {/* Wine count */}
                  <td className="px-4 py-3 text-right tabular-nums">
                    {producer.wine_count}
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3">
                    {producer.is_active ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/producers/${producer.id}`)
                        }}
                        aria-label={`Edit ${producer.name}`}
                      >
                        <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/producers/${producer.id}/wines`)
                        }}
                        aria-label={`View wines for ${producer.name}`}
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">View wines</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <p className="font-medium text-muted-foreground">No producers found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {query
                      ? 'Try a different search term.'
                      : 'Add your first producer to get started.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Row count */}
      <p className="text-xs text-muted-foreground">
        {visibleRows.length} producer{visibleRows.length !== 1 ? 's' : ''}
        {query && ` matching "${query}"`}
      </p>
    </div>
  )
}
