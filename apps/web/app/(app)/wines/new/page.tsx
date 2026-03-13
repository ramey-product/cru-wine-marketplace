import type { Metadata } from 'next'
import { WineGrid } from '@/components/features/browse/WineGrid'
import { BrowseEmptyState } from '@/components/features/browse/BrowseEmptyState'
import { PLACEHOLDER_WINES } from '../_lib/placeholder-wines'

export const metadata: Metadata = {
  title: 'New Wines | Cru',
  description: 'Discover the newest wines added to our curated marketplace.',
}

export default async function NewWinesPage() {
  // TODO: Replace with real DAL call: getNewWines(client, 24)
  // const client = createServerClient()
  // const { data: wines } = await getNewWines(client, 24)

  // Sort by created_at descending (newest first)
  const wines = [...PLACEHOLDER_WINES].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateB - dateA
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Arrivals</h1>
        <p className="text-muted-foreground mt-1">
          The latest additions to our curated collection.
        </p>
      </div>

      {wines.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {wines.length} {wines.length === 1 ? 'wine' : 'wines'}
          </p>
          <WineGrid wines={wines} />
        </>
      ) : (
        <BrowseEmptyState message="No new wines yet. Check back soon for new arrivals." />
      )}
    </>
  )
}
