'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Check, X, Search, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WineSearchModal } from '@/components/features/wine-matching/WineSearchModal'
import { CreateWineForm } from '@/components/features/wine-matching/CreateWineForm'
import type { MatchQueueEntry } from '@/components/features/wine-matching/MatchQueueTable'

interface MatchReviewCardProps {
  entry: MatchQueueEntry
  onApprove: () => void
  onReject: () => void
  onManualMatch: (wine: {
    id: string
    name: string
    producer: string
    region: string
    vintage: string
  }) => void
}

export function MatchReviewCard({
  entry,
  onApprove,
  onReject,
  onManualMatch,
}: MatchReviewCardProps) {
  const [isApprovePending, startApproveTransition] = useTransition()
  const [isRejectPending, startRejectTransition] = useTransition()
  const [showSearch, setShowSearch] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const isResolved =
    entry.status === 'approved' || entry.status === 'rejected'

  function handleApprove() {
    startApproveTransition(() => {
      // TODO: Call approveMatchAction server action
      onApprove()
    })
  }

  function handleReject() {
    startRejectTransition(() => {
      // TODO: Call rejectMatchAction server action
      onReject()
    })
  }

  function handleSearchSelect(wine: {
    id: string
    name: string
    producer: string
    region: string
    vintage: string
  }) {
    setShowSearch(false)
    // TODO: Call manualMatchAction server action
    onManualMatch(wine)
  }

  function handleCreateWine(wine: {
    name: string
    producer: string
    vintage: string
    varietal: string
    region: string
    country: string
    description: string
  }) {
    setShowCreateForm(false)
    // TODO: Call createWineFromQueueAction server action
    onManualMatch({
      id: `new-${Date.now()}`,
      name: wine.name,
      producer: wine.producer,
      region: wine.region,
      vintage: wine.vintage,
    })
  }

  return (
    <div className="space-y-4">
      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Raw CSV data */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Raw CSV Data
          </h4>
          <div className="rounded-lg border border-border bg-background p-4 space-y-2.5">
            <DataRow label="Wine Name" value={entry.rawWineName} />
            <DataRow label="Producer" value={entry.rawProducer} />
            <DataRow label="Vintage" value={entry.rawVintage} />
            <DataRow label="Varietal" value={entry.rawVarietal} />
            <DataRow label="SKU" value={entry.rawSku} />
            <DataRow label="Price" value={entry.rawPrice} />
          </div>
        </div>

        {/* Right: Suggested match */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Suggested Cru Match
          </h4>
          {entry.suggestedMatch ? (
            <div className="rounded-lg border border-border bg-background p-4 space-y-2.5">
              <DataRow label="Wine Name" value={entry.suggestedMatch.name} />
              <DataRow label="Producer" value={entry.suggestedMatch.producer} />
              <DataRow label="Region" value={entry.suggestedMatch.region} />
              <DataRow label="Vintage" value={entry.suggestedMatch.vintage} />
              <div className="pt-1">
                <Badge
                  variant={
                    entry.confidence >= 85 ? 'default' : 'secondary'
                  }
                >
                  {entry.confidence}% confidence
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background p-8">
              <p className="text-sm text-muted-foreground">No match found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Search for a wine or create a new record below.
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Action buttons */}
      {!isResolved && (
        <div className="flex flex-wrap items-center gap-2">
          {entry.suggestedMatch && (
            <Button
              onClick={handleApprove}
              disabled={isApprovePending || isRejectPending}
              aria-label="Approve this match"
            >
              {isApprovePending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve Match
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isApprovePending || isRejectPending}
            aria-label="Reject this match"
          >
            {isRejectPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Reject
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowSearch(true)}
            disabled={isApprovePending || isRejectPending}
            aria-label="Search for a different wine to match"
          >
            <Search className="h-4 w-4" />
            Search Different Wine
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowCreateForm(true)}
            disabled={isApprovePending || isRejectPending}
            aria-label="Create a new wine record"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Wine
          </Button>
        </div>
      )}

      {isResolved && (
        <div className="flex items-center gap-2">
          <Badge
            variant={entry.status === 'approved' ? 'default' : 'destructive'}
          >
            {entry.status === 'approved' ? 'Approved' : 'Rejected'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            This match has been resolved.
          </span>
        </div>
      )}

      {/* Wine search modal */}
      <WineSearchModal
        open={showSearch}
        onOpenChange={setShowSearch}
        onSelect={handleSearchSelect}
      />

      {/* Create wine form (inline) */}
      {showCreateForm && (
        <div className="rounded-lg border border-border bg-background p-4">
          <CreateWineForm
            prefill={{
              name: entry.rawWineName,
              producer: entry.rawProducer,
              vintage: entry.rawVintage,
              varietal: entry.rawVarietal,
            }}
            onSubmit={handleCreateWine}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs font-medium text-muted-foreground shrink-0">
        {label}
      </span>
      <span className={cn('text-sm text-foreground text-right', !value && 'text-muted-foreground italic')}>
        {value || 'N/A'}
      </span>
    </div>
  )
}
