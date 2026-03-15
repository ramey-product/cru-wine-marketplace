'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  ShoppingCart,
  XCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCart } from '@/lib/cart/CartContext'
import { reorderFromHistory } from '@/lib/actions/order-tracking'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReorderItem {
  wineId: string
  wineName: string
  wineSlug: string
  wineImage: string | null
  producerName: string
  price: number
  quantity: number
  available: boolean
}

type ReorderResult =
  | { status: 'all_available'; items: ReorderItem[]; retailerOrgId: string; retailerName: string }
  | { status: 'partial'; items: ReorderItem[]; retailerOrgId: string; retailerName: string }
  | { status: 'retailer_unavailable'; retailerName: string }
  | { status: 'error'; message: string }

// ---------------------------------------------------------------------------
// ReorderDialog
// ---------------------------------------------------------------------------

interface ReorderDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReorderDialog({ orderId, open, onOpenChange }: ReorderDialogProps) {
  const router = useRouter()
  const { addItem, clearCart, cart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ReorderResult | null>(null)
  const [adding, setAdding] = useState(false)

  function handleOpen(isOpen: boolean) {
    if (!isOpen) {
      setResult(null)
    }
    onOpenChange(isOpen)
  }

  function checkAvailability() {
    startTransition(async () => {
      const res = await reorderFromHistory(orderId)
      setResult(res as ReorderResult)
    })
  }

  // Trigger availability check when dialog opens
  if (open && !result && !isPending) {
    checkAvailability()
  }

  function addAvailableToCart() {
    if (!result || (result.status !== 'all_available' && result.status !== 'partial')) return

    setAdding(true)

    // If cart has items from a different retailer, clear first
    if (cart.retailerOrgId && cart.retailerOrgId !== result.retailerOrgId) {
      clearCart()
    }

    const availableItems = result.items.filter((item) => item.available)

    for (const item of availableItems) {
      addItem(
        {
          id: `reorder-${item.wineId}-${Date.now()}`,
          wineId: item.wineId,
          wineName: item.wineName,
          wineSlug: item.wineSlug,
          wineImage: item.wineImage,
          producerName: item.producerName,
          price: item.price,
          quantity: item.quantity,
        },
        result.retailerOrgId,
        result.retailerName
      )
    }

    handleOpen(false)
    setAdding(false)
    router.push('/cart')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        {/* Loading state */}
        {isPending && (
          <>
            <DialogHeader>
              <DialogTitle>Checking availability...</DialogTitle>
              <DialogDescription>
                Verifying your items are still in stock.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          </>
        )}

        {/* All available */}
        {result?.status === 'all_available' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                All items available
              </DialogTitle>
              <DialogDescription>
                All wines from your previous order are in stock.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              {result.items.map((item) => (
                <div key={item.wineId} className="flex items-center gap-3 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.wineName}</span>
                  <span className="text-muted-foreground">x{item.quantity}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => handleOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addAvailableToCart}
                disabled={adding}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    Add to Cart
                  </span>
                )}
              </button>
            </DialogFooter>
          </>
        )}

        {/* Partial availability */}
        {result?.status === 'partial' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                Some items unavailable
              </DialogTitle>
              <DialogDescription>
                A few wines from your order are no longer in stock.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              {result.items.map((item) => (
                <div
                  key={item.wineId}
                  className={`flex items-center gap-3 text-sm ${
                    !item.available ? 'opacity-50 line-through' : ''
                  }`}
                >
                  {item.available ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="flex-1 truncate">{item.wineName}</span>
                  <span className="text-muted-foreground">x{item.quantity}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => handleOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addAvailableToCart}
                disabled={adding}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Adding...
                  </span>
                ) : (
                  `Add ${result.items.filter((i) => i.available).length} Available`
                )}
              </button>
            </DialogFooter>
          </>
        )}

        {/* Retailer unavailable */}
        {result?.status === 'retailer_unavailable' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                Retailer unavailable
              </DialogTitle>
              <DialogDescription>
                {result.retailerName} is no longer available on Cru. Try browsing for similar wines from other retailers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                type="button"
                onClick={() => handleOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleOpen(false)
                  router.push('/browse')
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Browse Wines
              </button>
            </DialogFooter>
          </>
        )}

        {/* Error */}
        {result?.status === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                Something went wrong
              </DialogTitle>
              <DialogDescription>
                {result.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                type="button"
                onClick={() => handleOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult(null)
                  checkAvailability()
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
