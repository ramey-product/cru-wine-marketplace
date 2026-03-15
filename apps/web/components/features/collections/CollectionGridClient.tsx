'use client'

import { useState, useCallback } from 'react'
import { CollectionWineCard } from './CollectionWineCard'
import { RetailerSelectionSheet } from '@/components/features/orders/RetailerSelectionSheet'
import { useCart } from '@/lib/cart/CartContext'
import { generateLocalId } from '@/lib/cart/cart-store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CollectionWine {
  id: string
  name: string
  slug: string
  varietal: string | null
  region: string | null
  country: string | null
  vintage?: number | null
  image_url: string | null
  price_min: number | null
  price_max: number | null
  producer: { name: string; slug: string }
  description: string | null
}

interface CollectionItem {
  id: string
  wine: CollectionWine
  curator_note: string | null
  position: number
}

interface CollectionGridClientProps {
  items: CollectionItem[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Client-side collection wine grid with buy button interactions
 * and RetailerSelectionSheet state management.
 */
export function CollectionGridClient({ items }: CollectionGridClientProps) {
  const [selectedWine, setSelectedWine] = useState<CollectionWine | null>(null)
  const { addItem } = useCart()

  const handleBuy = useCallback(
    (wineId: string) => {
      const item = items.find((i) => i.wine.id === wineId)
      if (item) setSelectedWine(item.wine)
    },
    [items]
  )

  const handleAddToCart = useCallback(
    async (retailerOrgId: string) => {
      if (!selectedWine) return

      addItem(
        {
          id: generateLocalId(),
          wineId: selectedWine.id,
          wineName: selectedWine.name,
          wineSlug: selectedWine.slug,
          wineImage: selectedWine.image_url,
          producerName: selectedWine.producer.name,
          price: (selectedWine.price_min ?? 0) * 100,
          quantity: 1,
        },
        retailerOrgId,
        'Local Wine Shop'
      )
    },
    [selectedWine, addItem]
  )

  const displayName = selectedWine
    ? selectedWine.vintage
      ? `${selectedWine.name} ${selectedWine.vintage}`
      : selectedWine.name
    : ''

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <CollectionWineCard
            key={item.id}
            wine={item.wine}
            curatorNote={item.curator_note}
            onBuy={handleBuy}
          />
        ))}
      </div>

      <RetailerSelectionSheet
        open={selectedWine !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedWine(null)
        }}
        wineName={displayName}
        wineId={selectedWine?.id ?? ''}
        onAddToCart={handleAddToCart}
      />
    </>
  )
}
