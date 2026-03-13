'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createMedusaCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  getCart,
} from '@/lib/dal/cart'
import {
  AddToCartSchema,
  UpdateCartItemSchema,
  RemoveFromCartSchema,
} from '@/lib/validations/cart'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CART_COOKIE_NAME = 'medusa_cart_id'

const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 86400, // 24 hours
}

// ---------------------------------------------------------------------------
// addToCart — add a wine to the cart (creating the cart if necessary)
// ---------------------------------------------------------------------------

export async function addToCart(input: {
  wineId: string
  retailerOrgId: string
  quantity: number
}) {
  const parsed = AddToCartSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const cookieStore = await cookies()
  const existingCartId = cookieStore.get(CART_COOKIE_NAME)?.value
  let cartId = existingCartId

  // If we have an existing cart cookie, verify the cart is still valid
  if (cartId) {
    const { data: existingCart, error: fetchError } = await getCart(cartId)

    if (fetchError || !existingCart) {
      // Cart expired or deleted — clear the stale cookie and create fresh
      cartId = undefined
    } else {
      // Verify the cart is scoped to the same retailer
      const cartSalesChannel =
        existingCart.sales_channel_id ?? existingCart.sales_channel?.id
      if (cartSalesChannel && cartSalesChannel !== parsed.data.retailerOrgId) {
        return {
          error:
            'Your cart contains items from another retailer. Please clear your cart first or complete that order.',
        }
      }
    }
  }

  // Create a new cart if we don't have one
  if (!cartId) {
    const { data: newCart, error: createError } = await createMedusaCart({
      salesChannelId: parsed.data.retailerOrgId,
    })

    if (createError || !newCart) {
      console.error('addToCart: failed to create cart:', createError)
      return { error: 'Failed to create cart' }
    }

    cartId = newCart.id as string
  }

  // Add the item to the cart
  const { data: cart, error: addError } = await addItemToCart(cartId, {
    variantId: parsed.data.wineId,
    quantity: parsed.data.quantity,
  })

  if (addError || !cart) {
    console.error('addToCart: failed to add item:', addError)
    return { error: 'Failed to add item to cart' }
  }

  // Set / refresh the cart cookie
  cookieStore.set(CART_COOKIE_NAME, cartId, CART_COOKIE_OPTIONS)

  revalidatePath('/(app)/[orgSlug]', 'layout')
  return { data: cart }
}

// ---------------------------------------------------------------------------
// updateCartItemQuantity — change quantity of an existing line item
// ---------------------------------------------------------------------------

export async function updateCartItemQuantity(input: {
  lineItemId: string
  quantity: number
}) {
  const parsed = UpdateCartItemSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const cookieStore = await cookies()
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value

  if (!cartId) {
    return { error: 'No active cart' }
  }

  const { data: cart, error: updateError } = await updateCartItem(
    cartId,
    parsed.data.lineItemId,
    { quantity: parsed.data.quantity }
  )

  if (updateError || !cart) {
    console.error('updateCartItemQuantity failed:', updateError)
    return { error: 'Failed to update cart item' }
  }

  revalidatePath('/(app)/[orgSlug]', 'layout')
  return { data: cart }
}

// ---------------------------------------------------------------------------
// removeFromCart — remove a line item from the cart
// ---------------------------------------------------------------------------

export async function removeFromCart(input: { lineItemId: string }) {
  const parsed = RemoveFromCartSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const cookieStore = await cookies()
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value

  if (!cartId) {
    return { error: 'No active cart' }
  }

  const { data: cart, error: removeError } = await removeCartItem(
    cartId,
    parsed.data.lineItemId
  )

  if (removeError || !cart) {
    console.error('removeFromCart failed:', removeError)
    return { error: 'Failed to remove item from cart' }
  }

  revalidatePath('/(app)/[orgSlug]', 'layout')
  return { data: cart }
}

// ---------------------------------------------------------------------------
// getActiveCart — retrieve the current cart (if any) from the cookie
// ---------------------------------------------------------------------------

export async function getActiveCart() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const cookieStore = await cookies()
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value

  if (!cartId) {
    return { data: null }
  }

  const { data: cart, error: fetchError } = await getCart(cartId)

  if (fetchError || !cart) {
    // Cart expired or was deleted — clear the stale cookie
    cookieStore.delete(CART_COOKIE_NAME)
    return { data: null }
  }

  return { data: cart }
}
