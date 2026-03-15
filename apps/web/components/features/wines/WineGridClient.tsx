'use client'

import { useState, useCallback } from 'react'
import { WineCard, type WineAvailability } from './WineCard'
import { RetailerSelectionSheet } from '@/components/features/orders/RetailerSelectionSheet'
import { useCart } from '@/lib/cart/CartContext'
import { generateLocalId } from '@/lib/cart/cart-store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WineGridWine {
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

interface WineGridClientProps {
  wines: WineGridWine[]
  /** Show availability on wine cards. */
  showAvailability?: boolean
  /** Show buy button on wine cards. */
  showBuyButton?: boolean
  /** Availability data keyed by wine ID. */
  availabilityMap?: Record<string, WineAvailability>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Client-side wine grid that enables buy button interactions and
 * manages the RetailerSelectionSheet state.
 */
export function WineGridClient({
  wines,
  showAvailability = true,
  showBuyButton = true,
  availabilityMap,
}: WineGridClientProps) {
  const [selectedWine, setSelectedWine] = useState<WineGridWine | null>(null)
  const { addItem } = useCart()

  const handleBuy = useCallback(
    (wineId: string) => {
      const wine = wines.find((w) => w.id === wineId)
      if (wine) setSelectedWine(wine)
    },
    [wines]
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
          price: (selectedWine.price_min ?? 0) * 100, // Convert dollars to cents
          quantity: 1,
        },
        retailerOrgId,
        // Retailer name will come from the RetailerSelectionSheet mock data for now
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wines.map((wine) => (
          <WineCard
            key={wine.id}
            wine={wine}
            showAvailability={showAvailability}
            availability={availabilityMap?.[wine.id]}
            onBuy={showBuyButton ? handleBuy : undefined}
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
