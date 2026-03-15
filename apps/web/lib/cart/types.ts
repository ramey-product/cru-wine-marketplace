// ---------------------------------------------------------------------------
// Cart state types
// ---------------------------------------------------------------------------

/** A single item in the cart. */
export interface CartItem {
  /** Line item ID (from Medusa or locally generated). */
  id: string
  wineId: string
  wineName: string
  wineSlug: string
  wineImage: string | null
  producerName: string
  /** Price per bottle in cents. */
  price: number
  quantity: number
}

/** Full cart state persisted in localStorage. */
export interface CartState {
  items: CartItem[]
  retailerOrgId: string | null
  retailerName: string | null
  /** Subtotal in cents. */
  subtotal: number
  /** Total number of bottles (sum of all quantities). */
  itemCount: number
  /** Schema version for safe localStorage migrations. */
  version: number
}

/** Pending retailer conflict awaiting user resolution. */
export interface RetailerConflict {
  /** The item the user is trying to add. */
  pendingItem: CartItem
  /** The new retailer org ID. */
  newRetailerOrgId: string
  /** The new retailer name. */
  newRetailerName: string
  /** The current retailer name in the cart. */
  currentRetailerName: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CART_VERSION = 1

export const EMPTY_CART: CartState = {
  items: [],
  retailerOrgId: null,
  retailerName: null,
  subtotal: 0,
  itemCount: 0,
  version: CART_VERSION,
}
