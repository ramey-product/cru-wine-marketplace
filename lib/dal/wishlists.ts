import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { WINE_SELECT } from '@/lib/dal/wines'

type TypedClient = SupabaseClient<Database>

// ---------------------------------------------------------------------------
// Select for wishlist items with joined wine + producer data
// ---------------------------------------------------------------------------

const WISHLIST_ITEM_SELECT = `
  id,
  notes,
  added_at,
  wine:wines!inner(${WINE_SELECT.trim()})
` as const

// ---------------------------------------------------------------------------
// getOrCreateDefaultWishlist — returns the user's default wishlist,
// creating one named "My Wishlist" if none exists.
// ---------------------------------------------------------------------------

export async function getOrCreateDefaultWishlist(
  client: TypedClient,
  userId: string
) {
  // Try to get existing wishlist first
  const { data: existing, error: selectError } = await client
    .from('wishlists')
    .select('id, name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (selectError) {
    return { data: null, error: selectError }
  }

  if (existing) {
    return { data: existing, error: null }
  }

  // Create default wishlist
  const { data: created, error: insertError } = await client
    .from('wishlists')
    .insert({ user_id: userId, name: 'My Wishlist' })
    .select('id, name, created_at')
    .single()

  return { data: created, error: insertError }
}

// ---------------------------------------------------------------------------
// addToWishlist — idempotent add using ON CONFLICT DO NOTHING
// ---------------------------------------------------------------------------

export async function addToWishlist(
  client: TypedClient,
  userId: string,
  wineId: string,
  notes?: string
) {
  // Ensure wishlist exists
  const { data: wishlist, error: wishlistError } =
    await getOrCreateDefaultWishlist(client, userId)

  if (wishlistError || !wishlist) {
    return { data: null, error: wishlistError }
  }

  // Insert with ON CONFLICT DO NOTHING for idempotency.
  // Supabase's .upsert with ignoreDuplicates achieves this.
  const { data, error } = await client
    .from('wishlist_items')
    .upsert(
      {
        wishlist_id: wishlist.id,
        wine_id: wineId,
        notes: notes ?? null,
      },
      { onConflict: 'wishlist_id,wine_id', ignoreDuplicates: true }
    )
    .select('id, wine_id, added_at')
    .single()

  // If ignoreDuplicates triggers, .single() returns null — that's fine
  if (error && error.code === 'PGRST116') {
    // No rows returned means the item already existed — return success
    return { data: { existing: true }, error: null }
  }

  return { data, error }
}

// ---------------------------------------------------------------------------
// getWishlistItems — returns items with joined wine data
// ---------------------------------------------------------------------------

export async function getWishlistItems(
  client: TypedClient,
  userId: string,
  sort: 'added_at' | 'price' | 'name' = 'added_at'
) {
  // Get the user's default wishlist
  const { data: wishlist, error: wishlistError } =
    await getOrCreateDefaultWishlist(client, userId)

  if (wishlistError || !wishlist) {
    return { data: null, error: wishlistError }
  }

  let query = client
    .from('wishlist_items')
    .select(WISHLIST_ITEM_SELECT)
    .eq('wishlist_id', wishlist.id)

  switch (sort) {
    case 'price':
      query = query.order('wine(price_min)', { ascending: true })
      break
    case 'name':
      query = query.order('wine(name)', { ascending: true })
      break
    case 'added_at':
    default:
      query = query.order('added_at', { ascending: false })
      break
  }

  const { data, error } = await query

  return { data, error }
}

// ---------------------------------------------------------------------------
// isWineInWishlist — check if a specific wine is in the user's wishlist
// ---------------------------------------------------------------------------

export async function isWineInWishlist(
  client: TypedClient,
  userId: string,
  wineId: string
) {
  const { data: wishlist, error: wishlistError } =
    await getOrCreateDefaultWishlist(client, userId)

  if (wishlistError || !wishlist) {
    return { data: false, error: wishlistError }
  }

  const { data, error } = await client
    .from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wishlist.id)
    .eq('wine_id', wineId)
    .maybeSingle()

  if (error) {
    return { data: false, error }
  }

  return { data: !!data, error: null }
}

// ---------------------------------------------------------------------------
// removeFromWishlist — delete by wishlist_item_id
// RLS ensures only the owner's items are accessible.
// ---------------------------------------------------------------------------

export async function removeFromWishlist(
  client: TypedClient,
  wishlistItemId: string
) {
  const { error } = await client
    .from('wishlist_items')
    .delete()
    .eq('id', wishlistItemId)

  return { error }
}

// ---------------------------------------------------------------------------
// removeWineFromWishlist — delete by wine_id (convenience for UI)
// ---------------------------------------------------------------------------

export async function removeWineFromWishlist(
  client: TypedClient,
  userId: string,
  wineId: string
) {
  const { data: wishlist, error: wishlistError } =
    await getOrCreateDefaultWishlist(client, userId)

  if (wishlistError || !wishlist) {
    return { error: wishlistError }
  }

  const { error } = await client
    .from('wishlist_items')
    .delete()
    .eq('wishlist_id', wishlist.id)
    .eq('wine_id', wineId)

  return { error }
}

// ---------------------------------------------------------------------------
// getWishlistItemCount — returns the count of items in the user's wishlist
// ---------------------------------------------------------------------------

export async function getWishlistItemCount(
  client: TypedClient,
  userId: string
) {
  const { data: wishlist, error: wishlistError } =
    await getOrCreateDefaultWishlist(client, userId)

  if (wishlistError || !wishlist) {
    return { count: 0, error: wishlistError }
  }

  const { count, error } = await client
    .from('wishlist_items')
    .select('id', { count: 'exact', head: true })
    .eq('wishlist_id', wishlist.id)

  return { count: count ?? 0, error }
}
