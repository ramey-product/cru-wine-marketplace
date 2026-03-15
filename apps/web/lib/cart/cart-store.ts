import type { CartState } from '@/lib/cart/types'
import { CART_VERSION, EMPTY_CART } from '@/lib/cart/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOCAL_STORAGE_KEY = 'cru-cart-v1'

// ---------------------------------------------------------------------------
// saveCart — persist cart state to localStorage
// ---------------------------------------------------------------------------

export function saveCart(state: CartState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (SSR, private browsing, quota exceeded)
  }
}

// ---------------------------------------------------------------------------
// getStoredCart — retrieve cart state from localStorage
// ---------------------------------------------------------------------------

export function getStoredCart(): CartState | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as CartState

    // Validate schema version — discard stale data on version mismatch
    if (typeof parsed.version !== 'number' || parsed.version !== CART_VERSION) {
      clearStoredCart()
      return null
    }

    // Basic shape validation
    if (!Array.isArray(parsed.items)) {
      clearStoredCart()
      return null
    }

    return parsed
  } catch {
    // Corrupted data — clear and return null
    clearStoredCart()
    return null
  }
}

// ---------------------------------------------------------------------------
// clearStoredCart — remove cart from localStorage
// ---------------------------------------------------------------------------

export function clearStoredCart(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  } catch {
    // localStorage unavailable
  }
}

// ---------------------------------------------------------------------------
// computeCartTotals — recalculate subtotal and itemCount from items
// ---------------------------------------------------------------------------

export function computeCartTotals(
  state: Pick<CartState, 'items' | 'retailerOrgId' | 'retailerName'>
): CartState {
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const itemCount = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return {
    items: state.items,
    retailerOrgId: state.retailerOrgId,
    retailerName: state.retailerName,
    subtotal,
    itemCount,
    version: CART_VERSION,
  }
}

// ---------------------------------------------------------------------------
// formatCartPrice — format cents to dollar string
// ---------------------------------------------------------------------------

export function formatCartPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// ---------------------------------------------------------------------------
// generateLocalId — create a temporary local ID for optimistic items
// ---------------------------------------------------------------------------

let idCounter = 0
export function generateLocalId(): string {
  idCounter += 1
  return `local_${Date.now()}_${idCounter}`
}

// ---------------------------------------------------------------------------
// emptyCartState — convenience re-export
// ---------------------------------------------------------------------------

export { EMPTY_CART }
