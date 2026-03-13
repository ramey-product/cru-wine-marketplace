'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { RetailerCard } from './RetailerCard'

interface Retailer {
  id: string
  orgId: string
  name: string
  distanceMiles: number
  price: number
  fulfillment: ('pickup' | 'delivery')[]
  inStock: boolean
}

interface RetailerSelectionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wineName: string
  wineId: string
  onAddToCart: (retailerOrgId: string) => Promise<void>
}

// TODO: Replace with real retailer availability data from DAL
const MOCK_RETAILERS: Retailer[] = [
  {
    id: 'r1',
    orgId: 'org-1',
    name: 'Wine House Los Angeles',
    distanceMiles: 1.2,
    price: 28.0,
    fulfillment: ['pickup', 'delivery'],
    inStock: true,
  },
  {
    id: 'r2',
    orgId: 'org-2',
    name: 'The Cork & Bottle',
    distanceMiles: 2.8,
    price: 30.0,
    fulfillment: ['pickup'],
    inStock: true,
  },
  {
    id: 'r3',
    orgId: 'org-3',
    name: 'Vino Locale',
    distanceMiles: 4.5,
    price: 27.5,
    fulfillment: ['delivery'],
    inStock: false,
  },
]

export function RetailerSelectionSheet({
  open,
  onOpenChange,
  wineName,
  wineId,
  onAddToCart,
}: RetailerSelectionSheetProps) {
  const inStockCount = MOCK_RETAILERS.filter((r) => r.inStock).length

  const handleAddToCart = async (retailerOrgId: string) => {
    await onAddToCart(retailerOrgId)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl sm:rounded-t-none sm:max-w-lg sm:data-[side=bottom]:inset-x-auto sm:data-[side=bottom]:right-0 sm:data-[side=bottom]:left-auto">
        <SheetHeader>
          <SheetTitle>Buy {wineName}</SheetTitle>
          <SheetDescription>
            {inStockCount} {inStockCount === 1 ? 'retailer' : 'retailers'} nearby
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 px-4 pb-6">
          {MOCK_RETAILERS.map((retailer) => (
            <RetailerCard
              key={retailer.id}
              retailer={retailer}
              wineId={wineId}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
