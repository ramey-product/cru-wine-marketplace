import { Badge } from '@/components/ui/badge'
import { MatchQueueTable } from '@/components/features/wine-matching/MatchQueueTable'

// TODO: Replace with getMatchQueueStats DAL call
const MOCK_STATS = {
  pending: 2,
  autoMatched: 4,
  unmatched: 2,
  resolved: 2,
}

export default function WineMatchingPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Wine Matching Review
        </h2>
        <p className="text-sm text-muted-foreground">
          Review and resolve wine matches from retailer inventory imports.
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Review"
          count={MOCK_STATS.pending}
          variant="outline"
        />
        <StatCard
          label="Auto-Matched"
          count={MOCK_STATS.autoMatched}
          variant="secondary"
        />
        <StatCard
          label="Unmatched"
          count={MOCK_STATS.unmatched}
          variant="destructive"
        />
        <StatCard
          label="Resolved"
          count={MOCK_STATS.resolved}
          variant="default"
        />
      </div>

      {/* Match queue table */}
      <MatchQueueTable />
    </div>
  )
}

function StatCard({
  label,
  count,
  variant,
}: {
  label: string
  count: number
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-2xl font-semibold text-foreground">{count}</span>
        <Badge variant={variant}>{label}</Badge>
      </div>
    </div>
  )
}
