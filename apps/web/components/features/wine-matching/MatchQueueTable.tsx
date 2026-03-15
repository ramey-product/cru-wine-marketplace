'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { CheckCheck, ChevronDown, ChevronRight } from 'lucide-react'
import { MatchReviewCard } from '@/components/features/wine-matching/MatchReviewCard'

export type MatchStatus =
  | 'pending'
  | 'auto_matched'
  | 'unmatched'
  | 'approved'
  | 'rejected'

export interface MatchQueueEntry {
  id: string
  retailerName: string
  rawWineName: string
  rawProducer: string
  rawVintage: string
  rawVarietal: string
  rawSku: string
  rawPrice: string
  confidence: number
  status: MatchStatus
  suggestedMatch: {
    id: string
    name: string
    producer: string
    region: string
    vintage: string
  } | null
}

// Mock data with realistic wine names
// TODO: Replace with getMatchQueue DAL call
const MOCK_QUEUE_ENTRIES: MatchQueueEntry[] = [
  {
    id: 'mq-1',
    retailerName: 'Vine & Table',
    rawWineName: 'Tempier Rose',
    rawProducer: 'Tempier',
    rawVintage: '2023',
    rawVarietal: 'Rose Blend',
    rawSku: 'VT-4521',
    rawPrice: '$38.99',
    confidence: 92,
    status: 'auto_matched',
    suggestedMatch: {
      id: 'w1',
      name: 'Domaine Tempier Bandol Rose 2023',
      producer: 'Domaine Tempier',
      region: 'Bandol, Provence',
      vintage: '2023',
    },
  },
  {
    id: 'mq-2',
    retailerName: 'The Wine Cellar',
    rawWineName: 'Ridge Monte Bello Cab',
    rawProducer: 'Ridge',
    rawVintage: '2019',
    rawVarietal: 'Cabernet Sauvignon',
    rawSku: 'TWC-8872',
    rawPrice: '$189.00',
    confidence: 88,
    status: 'auto_matched',
    suggestedMatch: {
      id: 'w2',
      name: 'Ridge Monte Bello 2019',
      producer: 'Ridge Vineyards',
      region: 'Santa Cruz Mountains',
      vintage: '2019',
    },
  },
  {
    id: 'mq-3',
    retailerName: 'Vine & Table',
    rawWineName: 'Kistler Chard Sonoma',
    rawProducer: 'Kistler',
    rawVintage: '2022',
    rawVarietal: 'Chardonnay',
    rawSku: 'VT-3310',
    rawPrice: '$62.00',
    confidence: 78,
    status: 'auto_matched',
    suggestedMatch: {
      id: 'w3',
      name: 'Kistler Sonoma Mountain Chardonnay 2022',
      producer: 'Kistler Vineyards',
      region: 'Sonoma Mountain',
      vintage: '2022',
    },
  },
  {
    id: 'mq-4',
    retailerName: 'Corkscrew Wines',
    rawWineName: 'DRC Echezeaux',
    rawProducer: 'Romanee Conti',
    rawVintage: '2020',
    rawVarietal: 'Pinot Noir',
    rawSku: 'CW-0091',
    rawPrice: '$1,250.00',
    confidence: 72,
    status: 'pending',
    suggestedMatch: {
      id: 'w4',
      name: 'Domaine de la Romanee-Conti Echezeaux 2020',
      producer: 'Domaine de la Romanee-Conti',
      region: 'Burgundy',
      vintage: '2020',
    },
  },
  {
    id: 'mq-5',
    retailerName: 'The Wine Cellar',
    rawWineName: 'Lopez Heredia Tondonia Res',
    rawProducer: 'Lopez de Heredia',
    rawVintage: '2011',
    rawVarietal: 'Tempranillo',
    rawSku: 'TWC-6455',
    rawPrice: '$48.00',
    confidence: 65,
    status: 'pending',
    suggestedMatch: {
      id: 'w5',
      name: 'Lopez de Heredia Vina Tondonia Reserva 2011',
      producer: 'Lopez de Heredia',
      region: 'Rioja',
      vintage: '2011',
    },
  },
  {
    id: 'mq-6',
    retailerName: 'Corkscrew Wines',
    rawWineName: 'Barbaresco Montestefano',
    rawProducer: 'Produttori',
    rawVintage: '2017',
    rawVarietal: 'Nebbiolo',
    rawSku: 'CW-2287',
    rawPrice: '$72.00',
    confidence: 55,
    status: 'unmatched',
    suggestedMatch: null,
  },
  {
    id: 'mq-7',
    retailerName: 'Vine & Table',
    rawWineName: 'Raveneau Chablis 1er Butteaux',
    rawProducer: 'Raveneau',
    rawVintage: '2021',
    rawVarietal: 'Chardonnay',
    rawSku: 'VT-9903',
    rawPrice: '$125.00',
    confidence: 42,
    status: 'unmatched',
    suggestedMatch: null,
  },
  {
    id: 'mq-8',
    retailerName: 'The Wine Cellar',
    rawWineName: 'Coche Dury Meursault',
    rawProducer: 'Coche-Dury',
    rawVintage: '2020',
    rawVarietal: 'Chardonnay',
    rawSku: 'TWC-1102',
    rawPrice: '$450.00',
    confidence: 90,
    status: 'approved',
    suggestedMatch: {
      id: 'w8',
      name: 'Coche-Dury Meursault 2020',
      producer: 'Domaine Coche-Dury',
      region: 'Burgundy',
      vintage: '2020',
    },
  },
  {
    id: 'mq-9',
    retailerName: 'Corkscrew Wines',
    rawWineName: 'Musar Red',
    rawProducer: 'Chateau Musar',
    rawVintage: '2016',
    rawVarietal: 'Blend',
    rawSku: 'CW-5504',
    rawPrice: '$35.00',
    confidence: 85,
    status: 'rejected',
    suggestedMatch: null,
  },
  {
    id: 'mq-10',
    retailerName: 'Vine & Table',
    rawWineName: 'Giacosa Barolo Falletto',
    rawProducer: 'Bruno Giacosa',
    rawVintage: '2018',
    rawVarietal: 'Nebbiolo',
    rawSku: 'VT-7712',
    rawPrice: '$210.00',
    confidence: 91,
    status: 'auto_matched',
    suggestedMatch: {
      id: 'w10',
      name: 'Bruno Giacosa Barolo Falletto 2018',
      producer: 'Bruno Giacosa',
      region: 'Barolo, Piedmont',
      vintage: '2018',
    },
  },
]

type FilterTab = 'all' | 'pending' | 'auto_matched' | 'unmatched' | 'resolved'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'auto_matched', label: 'Auto-Matched' },
  { key: 'unmatched', label: 'Unmatched' },
  { key: 'resolved', label: 'Resolved' },
]

function confidenceBadgeClasses(confidence: number): string {
  if (confidence >= 85) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (confidence >= 70) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

function statusLabel(status: MatchStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'auto_matched':
      return 'Auto-Matched'
    case 'unmatched':
      return 'Unmatched'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
  }
}

function statusBadgeVariant(
  status: MatchStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'approved':
      return 'default'
    case 'auto_matched':
      return 'secondary'
    case 'pending':
    case 'unmatched':
      return 'outline'
    case 'rejected':
      return 'destructive'
  }
}

export function MatchQueueTable() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [entries, setEntries] = useState(MOCK_QUEUE_ENTRIES)
  const [isBatchPending, startBatchTransition] = useTransition()

  const filteredEntries = entries.filter((entry) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'resolved')
      return entry.status === 'approved' || entry.status === 'rejected'
    return entry.status === activeFilter
  })

  const highConfidenceCount = entries.filter(
    (e) =>
      e.confidence >= 85 &&
      (e.status === 'auto_matched' || e.status === 'pending')
  ).length

  function toggleRow(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleBatchApprove() {
    startBatchTransition(() => {
      // TODO: Call batchApproveMatchesAction
      setEntries((prev) =>
        prev.map((e) =>
          e.confidence >= 85 &&
          (e.status === 'auto_matched' || e.status === 'pending')
            ? { ...e, status: 'approved' as MatchStatus }
            : e
        )
      )
      setSelectedIds(new Set())
    })
  }

  function handleApprove(id: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'approved' as MatchStatus } : e))
    )
    setExpandedId(null)
  }

  function handleReject(id: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'rejected' as MatchStatus } : e))
    )
    setExpandedId(null)
  }

  function handleManualMatch(id: string, wine: { id: string; name: string; producer: string; region: string; vintage: string }) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: 'approved' as MatchStatus, suggestedMatch: wine, confidence: 100 }
          : e
      )
    )
    setExpandedId(null)
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center justify-between gap-4">
        <div
          className="flex gap-1 overflow-x-auto"
          role="tablist"
          aria-label="Match queue filters"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeFilter === tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                activeFilter === tab.key
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {highConfidenceCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchApprove}
            disabled={isBatchPending}
            aria-label={`Batch approve ${highConfidenceCount} high-confidence matches`}
          >
            <CheckCheck className="h-4 w-4" />
            Batch Approve ({highConfidenceCount})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-10 px-3 py-3">
                <span className="sr-only">Select</span>
              </th>
              <th className="w-8 px-1 py-3">
                <span className="sr-only">Expand</span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Retailer
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Raw Wine Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Raw Producer
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Confidence
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Suggested Match
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredEntries.map((entry) => {
              const isExpanded = expandedId === entry.id
              const isResolved =
                entry.status === 'approved' || entry.status === 'rejected'

              return (
                <tr key={entry.id} className="group">
                  <td colSpan={8} className="p-0">
                    {/* Main row */}
                    <div
                      className={cn(
                        'flex items-center transition-colors',
                        isExpanded && 'bg-muted/30',
                        !isExpanded && 'hover:bg-muted/20',
                        isResolved && 'opacity-60'
                      )}
                    >
                      {/* Checkbox */}
                      <div className="w-10 px-3 py-3 flex items-center">
                        <Checkbox
                          checked={selectedIds.has(entry.id)}
                          onCheckedChange={() => toggleSelect(entry.id)}
                          aria-label={`Select ${entry.rawWineName}`}
                          disabled={isResolved}
                        />
                      </div>

                      {/* Expand toggle */}
                      <div className="w-8 px-1 py-3">
                        <button
                          onClick={() => toggleRow(entry.id)}
                          aria-label={
                            isExpanded
                              ? `Collapse ${entry.rawWineName}`
                              : `Expand ${entry.rawWineName}`
                          }
                          aria-expanded={isExpanded}
                          className="p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Retailer */}
                      <div className="flex-1 px-4 py-3 min-w-0">
                        <span className="text-foreground text-sm">
                          {entry.retailerName}
                        </span>
                      </div>

                      {/* Raw Wine Name */}
                      <div className="flex-[2] px-4 py-3 min-w-0">
                        <span className="font-medium text-foreground truncate block">
                          {entry.rawWineName}
                        </span>
                      </div>

                      {/* Raw Producer */}
                      <div className="flex-1 px-4 py-3 min-w-0">
                        <span className="text-muted-foreground">
                          {entry.rawProducer}
                        </span>
                      </div>

                      {/* Confidence */}
                      <div className="w-24 px-4 py-3">
                        {entry.confidence > 0 ? (
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                              confidenceBadgeClasses(entry.confidence)
                            )}
                          >
                            {entry.confidence}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            --
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="w-28 px-4 py-3">
                        <Badge variant={statusBadgeVariant(entry.status)}>
                          {statusLabel(entry.status)}
                        </Badge>
                      </div>

                      {/* Suggested Match */}
                      <div className="flex-[2] px-4 py-3 min-w-0">
                        {entry.suggestedMatch ? (
                          <span className="text-sm text-foreground truncate block">
                            {entry.suggestedMatch.name}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            No match found
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded review card */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/10 px-6 py-4">
                        <MatchReviewCard
                          entry={entry}
                          onApprove={() => handleApprove(entry.id)}
                          onReject={() => handleReject(entry.id)}
                          onManualMatch={(wine) =>
                            handleManualMatch(entry.id, wine)
                          }
                        />
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}

            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No entries match the selected filter.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
