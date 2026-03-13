import Link from 'next/link'
import { Search } from 'lucide-react'

interface BrowseEmptyStateProps {
  message?: string
}

export function BrowseEmptyState({
  message = 'No wines match your current filters.',
}: BrowseEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Search className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />

      <h2 className="text-lg font-medium mb-2">No results found</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Try one of these instead:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/wines"
            className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-muted transition-colors"
          >
            Browse all wines
          </Link>
          <Link
            href="/wines/new"
            className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-muted transition-colors"
          >
            Newest arrivals
          </Link>
          <Link
            href="/wines/region/Napa Valley"
            className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-muted transition-colors"
          >
            Napa Valley
          </Link>
          <Link
            href="/wines/varietal/Pinot Noir"
            className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-muted transition-colors"
          >
            Pinot Noir
          </Link>
        </div>
      </div>
    </div>
  )
}
