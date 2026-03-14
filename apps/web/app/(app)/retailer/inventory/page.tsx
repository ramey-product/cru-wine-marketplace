import { Suspense } from 'react'
import { SyncStatusCard } from '@/components/features/retailer/SyncStatusCard'
import { SyncErrorBanner } from '@/components/features/retailer/SyncErrorBanner'
import { InventorySummary } from '@/components/features/retailer/InventorySummary'
import { QuickStockSearch } from '@/components/features/retailer/QuickStockSearch'
import { Separator } from '@/components/ui/separator'

// ---------------------------------------------------------------------------
// Mock data
// TODO: Replace with getInventoryHealth and getInventorySummary DAL calls,
//       passing the authenticated org's supabase client and orgId.
// ---------------------------------------------------------------------------

const MOCK_SYNC = {
  syncSource: 'Lightspeed',
  lastSyncedAt: new Date(Date.now() - 4 * 60 * 60 * 1_000).toISOString(), // 4 hours ago
  nextSyncAt: new Date(Date.now() + 2 * 60 * 60 * 1_000).toISOString(),   // in 2 hours
  status: 'healthy' as const,
}

const MOCK_INVENTORY = {
  totalListed: 142,
  inStock: 98,
  lowStock: 31,
  outOfStock: 13,
}

/**
 * Retailer Inventory page — Server Component.
 *
 * Displays the POS sync health card, inventory summary stats,
 * and a quick search tool for inline stock status updates.
 *
 * TODO: Fetch real data:
 *   const syncHealth = await getInventoryHealth(supabase, orgId)
 *   const summary   = await getInventorySummary(supabase, orgId)
 */
export default function RetailerInventoryPage() {
  // TODO: Derive sync error state from real sync health data
  const syncStatus: string = MOCK_SYNC.status
  const hasSyncError = syncStatus === 'error'

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your stock levels and POS sync status.
        </p>
      </div>

      <Separator />

      {/* Sync status */}
      <Suspense fallback={<div className="h-28 animate-pulse rounded-lg bg-muted" />}>
        <SyncStatusCard
          syncSource={MOCK_SYNC.syncSource}
          lastSyncedAt={MOCK_SYNC.lastSyncedAt}
          nextSyncAt={MOCK_SYNC.nextSyncAt}
          status={MOCK_SYNC.status}
        />
      </Suspense>

      {/* Sync error banner — only rendered when last sync failed */}
      {hasSyncError && (
        <SyncErrorBanner
          syncSource={MOCK_SYNC.syncSource}
          // TODO: Replace with real error message from getInventoryHealth DAL call
          errorMessage="Could not connect to Lightspeed POS. Please check your API credentials."
        />
      )}

      {/* Inventory summary stats */}
      <Suspense fallback={<div className="h-44 animate-pulse rounded-lg bg-muted" />}>
        <InventorySummary
          totalListed={MOCK_INVENTORY.totalListed}
          inStock={MOCK_INVENTORY.inStock}
          lowStock={MOCK_INVENTORY.lowStock}
          outOfStock={MOCK_INVENTORY.outOfStock}
        />
      </Suspense>

      <Separator />

      {/* Quick stock search — client component, no Suspense needed */}
      <QuickStockSearch />
    </div>
  )
}
