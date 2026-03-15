'use client'

import { useCart } from '@/lib/cart/CartContext'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Store } from 'lucide-react'

/**
 * Dialog shown when user tries to add an item from a different retailer
 * than the one already in their cart. Enforces single-retailer cart.
 */
export function RetailerConflictDialog() {
  const { retailerConflict, resolveConflict } = useCart()

  return (
    <Sheet
      open={retailerConflict !== null}
      onOpenChange={(open) => {
        if (!open) resolveConflict(false)
      }}
    >
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Store className="h-6 w-6 text-amber-600" aria-hidden="true" />
          </div>
          <SheetTitle className="text-center">Switch stores?</SheetTitle>
          <SheetDescription className="text-center">
            You have items from{' '}
            <span className="font-medium text-foreground">
              {retailerConflict?.currentRetailerName}
            </span>
            . Starting an order from{' '}
            <span className="font-medium text-foreground">
              {retailerConflict?.newRetailerName}
            </span>{' '}
            will clear your current cart.
          </SheetDescription>
        </SheetHeader>

        <SheetFooter className="mt-6 flex flex-col gap-3 pb-6 sm:flex-col">
          <Button
            size="lg"
            className="min-h-[44px] w-full"
            onClick={() => resolveConflict(true)}
            aria-label={`Switch to ${retailerConflict?.newRetailerName}`}
          >
            Switch to {retailerConflict?.newRetailerName}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-h-[44px] w-full"
            onClick={() => resolveConflict(false)}
            aria-label="Keep current cart"
          >
            Keep current cart
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
