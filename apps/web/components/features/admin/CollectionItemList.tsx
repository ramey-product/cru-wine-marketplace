'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowUp, ArrowDown, X, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CollectionItem {
  id: string
  wineId: string
  wineName: string
  producer: string
  curatorNotes: string
  position: number
}

// Mock wine search results
// TODO: Replace with searchWinesAction
const MOCK_SEARCH_WINES = [
  { id: 'w1', name: 'Domaine Tempier Bandol Rose 2023', producer: 'Domaine Tempier' },
  { id: 'w2', name: 'Ridge Monte Bello 2019', producer: 'Ridge Vineyards' },
  { id: 'w3', name: 'Kistler Sonoma Mountain Chardonnay 2022', producer: 'Kistler Vineyards' },
  { id: 'w4', name: 'Domaine de la Romanee-Conti Echezeaux 2020', producer: 'DRC' },
  { id: 'w5', name: 'Lopez de Heredia Vina Tondonia Reserva 2011', producer: 'Lopez de Heredia' },
  { id: 'w6', name: 'Produttori del Barbaresco Riserva Montestefano 2017', producer: 'Produttori del Barbaresco' },
]

interface CollectionItemListProps {
  items: CollectionItem[]
  onReorder: (ids: string[]) => void
  onRemove: (itemId: string) => void
  onAdd?: (wine: { id: string; name: string; producer: string }) => void
  onUpdateNotes?: (itemId: string, notes: string) => void
}

export function CollectionItemList({
  items,
  onReorder,
  onRemove,
  onAdd,
  onUpdateNotes,
}: CollectionItemListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const sortedItems = [...items].sort((a, b) => a.position - b.position)

  function moveItem(index: number, direction: 'up' | 'down') {
    const newItems = [...sortedItems]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return

    // Swap positions
    const temp = newItems[index]!
    newItems[index] = newItems[targetIndex]!
    newItems[targetIndex] = temp

    onReorder(newItems.map((item) => item.id))
  }

  const filteredSearchResults = MOCK_SEARCH_WINES.filter((wine) => {
    if (!searchQuery.trim()) return false
    const query = searchQuery.toLowerCase()
    const alreadyAdded = items.some((item) => item.wineId === wine.id)
    return (
      !alreadyAdded &&
      (wine.name.toLowerCase().includes(query) ||
        wine.producer.toLowerCase().includes(query))
    )
  })

  function handleAddWine(wine: { id: string; name: string; producer: string }) {
    onAdd?.(wine)
    setSearchQuery('')
    setShowSearch(false)
  }

  return (
    <div className="space-y-4">
      {/* Item count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sortedItems.length} {sortedItems.length === 1 ? 'wine' : 'wines'} in
          this collection
        </p>
      </div>

      {/* Items list */}
      {sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
          <p className="text-sm text-muted-foreground">
            No wines added yet. Use the search below to add wines.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
            >
              {/* Position number */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground">
                {index + 1}
              </div>

              {/* Wine info */}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.wineName}
                </p>
                <p className="text-xs text-muted-foreground">{item.producer}</p>

                {/* Editable curator notes */}
                <div className="pt-1">
                  <textarea
                    value={item.curatorNotes}
                    onChange={(e) =>
                      onUpdateNotes?.(item.id, e.target.value)
                    }
                    placeholder="Add curator notes..."
                    aria-label={`Curator notes for ${item.wineName}`}
                    rows={2}
                    className={cn(
                      'w-full rounded-md border border-input bg-muted/50 px-2 py-1.5 text-xs',
                      'placeholder:text-muted-foreground/60',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      'resize-none'
                    )}
                  />
                </div>
              </div>

              {/* Reorder + remove controls */}
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  aria-label={`Move ${item.wineName} up`}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === sortedItems.length - 1}
                  aria-label={`Move ${item.wineName} down`}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Separator className="my-0.5" />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.wineName} from collection`}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Add wine search */}
      <div className="space-y-3">
        {!showSearch ? (
          <Button
            variant="outline"
            onClick={() => setShowSearch(true)}
            aria-label="Add a wine to this collection"
          >
            <Plus className="h-4 w-4" />
            Add Wine
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wines by name or producer..."
                aria-label="Search wines to add to collection"
                autoFocus
                className={cn(
                  'flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1 text-sm',
                  'placeholder:text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
              />
            </div>

            {/* Search results */}
            {filteredSearchResults.length > 0 && (
              <div className="rounded-lg border border-border divide-y divide-border">
                {filteredSearchResults.map((wine) => (
                  <button
                    key={wine.id}
                    type="button"
                    onClick={() => handleAddWine(wine)}
                    aria-label={`Add ${wine.name} to collection`}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:bg-muted'
                    )}
                  >
                    <div>
                      <p className="font-medium text-foreground">{wine.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {wine.producer}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim() && filteredSearchResults.length === 0 && (
              <p className="text-sm text-muted-foreground px-1">
                No wines found matching &ldquo;{searchQuery}&rdquo;
              </p>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearch(false)
                setSearchQuery('')
              }}
              aria-label="Cancel adding wine"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
