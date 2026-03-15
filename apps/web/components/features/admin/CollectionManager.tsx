'use client'

import { useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  CollectionForm,
  type CollectionFormData,
} from '@/components/features/admin/CollectionForm'
import {
  CollectionItemList,
  type CollectionItem,
} from '@/components/features/admin/CollectionItemList'

type CollectionStatus = 'active' | 'inactive' | 'scheduled'

interface CollectionManagerProps {
  collection: CollectionFormData & { id?: string }
  items: CollectionItem[]
}

function getCollectionStatus(
  data: CollectionFormData
): CollectionStatus {
  if (!data.isActive) return 'inactive'
  if (data.startDate) {
    const start = new Date(data.startDate)
    if (start > new Date()) return 'scheduled'
  }
  return 'active'
}

function statusBadgeVariant(
  status: CollectionStatus
): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'active':
      return 'default'
    case 'scheduled':
      return 'secondary'
    case 'inactive':
      return 'outline'
  }
}

const TABS = ['Details', 'Wines'] as const
type Tab = (typeof TABS)[number]

export function CollectionManager({
  collection,
  items: initialItems,
}: CollectionManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Details')
  const [formData, setFormData] = useState<CollectionFormData>(collection)
  const [items, setItems] = useState<CollectionItem[]>(initialItems)

  const status = getCollectionStatus(formData)

  const handleSave = useCallback((data: CollectionFormData) => {
    setFormData(data)
    // TODO: Call createCollection/updateCollection server action
  }, [])

  const handleReorder = useCallback(
    (orderedIds: string[]) => {
      const reordered = orderedIds
        .map((id, index) => {
          const item = items.find((i) => i.id === id)
          return item ? { ...item, position: index + 1 } : null
        })
        .filter(Boolean) as CollectionItem[]
      setItems(reordered)
      // TODO: Call reorderCollectionItems server action
    },
    [items]
  )

  const handleRemove = useCallback(
    (itemId: string) => {
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      // TODO: Call removeItemFromCollection server action
    },
    []
  )

  const handleAdd = useCallback(
    (wine: { id: string; name: string; producer: string }) => {
      const newItem: CollectionItem = {
        id: `temp-${Date.now()}`,
        wineId: wine.id,
        wineName: wine.name,
        producer: wine.producer,
        curatorNotes: '',
        position: items.length + 1,
      }
      setItems((prev) => [...prev, newItem])
      // TODO: Call addItemToCollection server action
    },
    [items.length]
  )

  const handleUpdateNotes = useCallback(
    (itemId: string, notes: string) => {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, curatorNotes: notes } : i))
      )
    },
    []
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {formData.title || 'New Collection'}
        </h2>
        <Badge variant={statusBadgeVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border" role="tablist" aria-label="Collection editor tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-md',
              activeTab === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {tab}
            {tab === 'Wines' && items.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({items.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        id="panel-details"
        role="tabpanel"
        aria-labelledby="Details"
        hidden={activeTab !== 'Details'}
      >
        {activeTab === 'Details' && (
          <CollectionForm initialData={formData} onSave={handleSave} />
        )}
      </div>

      <div
        id="panel-wines"
        role="tabpanel"
        aria-labelledby="Wines"
        hidden={activeTab !== 'Wines'}
      >
        {activeTab === 'Wines' && (
          <CollectionItemList
            items={items}
            onReorder={handleReorder}
            onRemove={handleRemove}
            onAdd={handleAdd}
            onUpdateNotes={handleUpdateNotes}
          />
        )}
      </div>
    </div>
  )
}
