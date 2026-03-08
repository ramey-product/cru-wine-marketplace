'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  addToWishlist,
  removeFromWishlist,
  removeWineFromWishlist,
  getWishlistItems,
  isWineInWishlist,
  getWishlistItemCount,
} from '@/lib/dal/wishlists'
import {
  AddToWishlistSchema,
  RemoveFromWishlistSchema,
  WishlistItemsSortSchema,
} from '@/lib/validations/wishlists'

// ---------------------------------------------------------------------------
// addWineToWishlist — add a wine to the user's default wishlist
// ---------------------------------------------------------------------------

export async function addWineToWishlist(wineId: string, notes?: string) {
  const parsed = AddToWishlistSchema.safeParse({ wine_id: wineId, notes })
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await addToWishlist(
    supabase,
    user.id,
    parsed.data.wine_id,
    parsed.data.notes
  )
  if (error) {
    console.error('addWineToWishlist failed:', error)
    return { error: 'Failed to add wine to wishlist' }
  }

  revalidatePath('/', 'layout')
  return { data }
}

// ---------------------------------------------------------------------------
// removeWishlistItem — remove an item by its wishlist_item_id
// ---------------------------------------------------------------------------

export async function removeWishlistItem(wishlistItemId: string) {
  const parsed = RemoveFromWishlistSchema.safeParse({
    wishlist_item_id: wishlistItemId,
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await removeFromWishlist(
    supabase,
    parsed.data.wishlist_item_id
  )
  if (error) {
    console.error('removeWishlistItem failed:', error)
    return { error: 'Failed to remove item from wishlist' }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// removeWineFromWishlistAction — remove by wine_id (convenience for UI)
// ---------------------------------------------------------------------------

export async function removeWineFromWishlistAction(wineId: string) {
  const parsed = AddToWishlistSchema.pick({ wine_id: true }).safeParse({
    wine_id: wineId,
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await removeWineFromWishlist(
    supabase,
    user.id,
    parsed.data.wine_id
  )
  if (error) {
    console.error('removeWineFromWishlist failed:', error)
    return { error: 'Failed to remove wine from wishlist' }
  }

  revalidatePath('/', 'layout')
  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// fetchWishlistItems — get all items with wine details
// ---------------------------------------------------------------------------

export async function fetchWishlistItems(
  sort?: 'added_at' | 'price' | 'name'
) {
  const parsedSort = WishlistItemsSortSchema.safeParse(sort)

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await getWishlistItems(
    supabase,
    user.id,
    parsedSort.success ? parsedSort.data : 'added_at'
  )
  if (error) {
    console.error('fetchWishlistItems failed:', error)
    return { error: 'Failed to load wishlist' }
  }

  return { data }
}

// ---------------------------------------------------------------------------
// checkWineInWishlist — check if a wine is in the current user's wishlist
// ---------------------------------------------------------------------------

export async function checkWineInWishlist(wineId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: false }
  }

  const { data } = await isWineInWishlist(supabase, user.id, wineId)
  return { data: data ?? false }
}

// ---------------------------------------------------------------------------
// fetchWishlistCount — get the number of items in the user's wishlist
// ---------------------------------------------------------------------------

export async function fetchWishlistCount() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { count: 0 }
  }

  const { count } = await getWishlistItemCount(supabase, user.id)
  return { count }
}
