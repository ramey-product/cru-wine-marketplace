'use client'

/**
 * WinesTableClient — Client component for the producer wines sub-page.
 *
 * Owns the Sheet open state and renders:
 *   - Page header with producer name and "Add Wine" button
 *   - Wines table (Name, Vintage, Varietal, Price, Status, Edit)
 *   - Sheet containing WineForm for create / edit
 */

import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { WineForm } from '@/components/features/admin/WineForm'
import type { WineFormValues } from '@/components/features/admin/WineForm'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WineRow {
  id: string
  name: string
  vintage: number | null
  varietal: string | null
  /** Price stored as cents */
  price_min: number | null
  is_active: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(cents: number | null): string {
  if (cents === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

/** Convert a WineRow to initial WineForm values for editing. */
function wineRowToFormValues(wine: WineRow): Partial<WineFormValues> {
  return {
    name: wine.name,
    vintage: wine.vintage?.toString() ?? '',
    varietal: wine.varietal ?? '',
    price_display: wine.price_min != null
      ? (wine.price_min / 100).toFixed(2)
      : '',
    is_active: wine.is_active,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type SheetMode = 'create' | 'edit'

interface WinesTableClientProps {
  producerId: string
  producerName: string
  initialWines: WineRow[]
}

export function WinesTableClient({
  producerId,
  producerName,
  initialWines,
}: WinesTableClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<SheetMode>('create')
  const [editingWine, setEditingWine] = useState<WineRow | null>(null)

  function openCreateSheet() {
    setEditingWine(null)
    setSheetMode('create')
    setSheetOpen(true)
  }

  function openEditSheet(wine: WineRow) {
    setEditingWine(wine)
    setSheetMode('edit')
    setSheetOpen(true)
  }

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wine Portfolio</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {producerName} — {initialWines.length} wine{initialWines.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreateSheet} aria-label="Add new wine">
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Wine
        </Button>
      </div>

      {/* Wines table */}
      {initialWines.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-muted-foreground">No wines yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Add the first wine to this producer&apos;s portfolio.
          </p>
          <Button variant="secondary" onClick={openCreateSheet} aria-label="Add first wine">
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Add Wine
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm" aria-label={`Wines for ${producerName}`}>
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Vintage
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Varietal
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Price
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
              {initialWines.map((wine) => (
                <tr
                  key={wine.id}
                  className="bg-card hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-foreground">
                    {wine.name}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {wine.vintage ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {wine.varietal ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPrice(wine.price_min)}
                  </td>
                  <td className="px-4 py-3">
                    {wine.is_active ? (
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
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditSheet(wine)}
                      aria-label={`Edit ${wine.name}`}
                    >
                      <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wine form Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle>
              {sheetMode === 'create' ? 'Add Wine' : `Edit ${editingWine?.name ?? 'Wine'}`}
            </SheetTitle>
          </SheetHeader>

          <WineForm
            producerId={producerId}
            wineId={sheetMode === 'edit' ? editingWine?.id : undefined}
            initialData={editingWine ? wineRowToFormValues(editingWine) : undefined}
            onSuccess={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
