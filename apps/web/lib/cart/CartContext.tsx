'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useTransition,
  type ReactNode,
} from 'react'
import type { CartItem, CartState, RetailerConflict } from '@/lib/cart/types'
import { EMPTY_CART } from '@/lib/cart/types'
import {
  saveCart,
  getStoredCart,
  clearStoredCart,
  computeCartTotals,
} from '@/lib/cart/cart-store'
import {
  addToCart as addToCartAction,
  updateCartItemQuantity as updateCartItemAction,
  removeFromCart as removeFromCartAction,
} from '@/lib/actions/cart'

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

interface CartContextValue {
  /** Current cart state. */
  cart: CartState
  /** Whether a server action is in progress. */
  isPending: boolean
  /** Pending retailer conflict (null if none). */
  retailerConflict: RetailerConflict | null

  // Mutations
  addItem: (
    item: CartItem,
    retailerOrgId: string,
    retailerName: string
  ) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void

  // Conflict resolution
  resolveConflict: (switchRetailer: boolean) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(EMPTY_CART)
  const [retailerConflict, setRetailerConflict] =
    useState<RetailerConflict | null>(null)
  const [isPending, startTransition] = useTransition()
  const [hydrated, setHydrated] = useState(false)

  // ---------------------------------------------------------------------------
  // Mount: hydrate from localStorage
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const stored = getStoredCart()
    if (stored) {
      setCart(stored)
    }
    setHydrated(true)
  }, [])

  // ---------------------------------------------------------------------------
  // Persist to localStorage on every change (after hydration)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (hydrated) {
      saveCart(cart)
    }
  }, [cart, hydrated])

  // ---------------------------------------------------------------------------
  // updateCart — helper to compute totals and set state
  // ---------------------------------------------------------------------------

  const updateCart = useCallback(
    (
      updater: (
        prev: CartState
      ) => Pick<CartState, 'items' | 'retailerOrgId' | 'retailerName'>
    ) => {
      setCart((prev) => computeCartTotals(updater(prev)))
    },
    []
  )

  // ---------------------------------------------------------------------------
  // addItem — optimistic add with single-retailer enforcement
  // ---------------------------------------------------------------------------

  const addItem = useCallback(
    (item: CartItem, retailerOrgId: string, retailerName: string) => {
      // Single-retailer check
      setCart((prev) => {
        if (
          prev.retailerOrgId &&
          prev.retailerOrgId !== retailerOrgId &&
          prev.items.length > 0
        ) {
          // Conflict: different retailer — surface dialog
          setRetailerConflict({
            pendingItem: item,
            newRetailerOrgId: retailerOrgId,
            newRetailerName: retailerName,
            currentRetailerName: prev.retailerName ?? 'Unknown Store',
          })
          return prev // Don't modify cart yet
        }

        // Same retailer or empty cart — add item
        const existingIdx = prev.items.findIndex(
          (i) => i.wineId === item.wineId
        )
        let newItems: CartItem[]

        if (existingIdx >= 0) {
          // Update quantity of existing item
          newItems = prev.items.map((i, idx) =>
            idx === existingIdx
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        } else {
          newItems = [...prev.items, item]
        }

        return computeCartTotals({
          items: newItems,
          retailerOrgId,
          retailerName,
        })
      })

      // Fire server action in background (non-blocking)
      startTransition(async () => {
        await addToCartAction({
          wineId: item.wineId,
          retailerOrgId,
          quantity: item.quantity,
        })
      })
    },
    []
  )

  // ---------------------------------------------------------------------------
  // removeItem — optimistic remove
  // ---------------------------------------------------------------------------

  const removeItem = useCallback(
    (itemId: string) => {
      updateCart((prev) => {
        const newItems = prev.items.filter((i) => i.id !== itemId)
        return {
          items: newItems,
          retailerOrgId: newItems.length > 0 ? prev.retailerOrgId : null,
          retailerName: newItems.length > 0 ? prev.retailerName : null,
        }
      })

      startTransition(async () => {
        await removeFromCartAction({ lineItemId: itemId })
      })
    },
    [updateCart]
  )

  // ---------------------------------------------------------------------------
  // updateQuantity — optimistic update
  // ---------------------------------------------------------------------------

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId)
        return
      }

      updateCart((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      }))

      startTransition(async () => {
        await updateCartItemAction({ lineItemId: itemId, quantity })
      })
    },
    [updateCart, removeItem]
  )

  // ---------------------------------------------------------------------------
  // clearCart — reset to empty
  // ---------------------------------------------------------------------------

  const clearCart = useCallback(() => {
    setCart(EMPTY_CART)
    clearStoredCart()
  }, [])

  // ---------------------------------------------------------------------------
  // resolveConflict — handle retailer switch dialog
  // ---------------------------------------------------------------------------

  const resolveConflict = useCallback(
    (switchRetailer: boolean) => {
      if (!retailerConflict) return

      if (switchRetailer) {
        // Clear old cart and add the pending item
        const newCart = computeCartTotals({
          items: [retailerConflict.pendingItem],
          retailerOrgId: retailerConflict.newRetailerOrgId,
          retailerName: retailerConflict.newRetailerName,
        })
        setCart(newCart)

        // Fire server action for the new item
        startTransition(async () => {
          await addToCartAction({
            wineId: retailerConflict.pendingItem.wineId,
            retailerOrgId: retailerConflict.newRetailerOrgId,
            quantity: retailerConflict.pendingItem.quantity,
          })
        })
      }
      // else: keep current cart, discard pending item

      setRetailerConflict(null)
    },
    [retailerConflict]
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <CartContext.Provider
      value={{
        cart,
        isPending,
        retailerConflict,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        resolveConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
