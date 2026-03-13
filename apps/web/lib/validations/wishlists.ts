import { z } from 'zod'

// ---------------------------------------------------------------------------
// Wishlist validation schemas
// ---------------------------------------------------------------------------

export const AddToWishlistSchema = z.object({
  wine_id: z.string().uuid('Invalid wine ID'),
  notes: z.string().max(500).optional(),
})

export type AddToWishlistInput = z.infer<typeof AddToWishlistSchema>

export const RemoveFromWishlistSchema = z.object({
  wishlist_item_id: z.string().uuid('Invalid wishlist item ID'),
})

export type RemoveFromWishlistInput = z.infer<typeof RemoveFromWishlistSchema>

export const UpdateWishlistItemSchema = z.object({
  wishlist_item_id: z.string().uuid('Invalid wishlist item ID'),
  notes: z.string().max(500).nullable(),
})

export type UpdateWishlistItemInput = z.infer<typeof UpdateWishlistItemSchema>

export const WishlistItemsSortSchema = z.enum(['added_at', 'price', 'name']).default('added_at')

export type WishlistItemsSort = z.infer<typeof WishlistItemsSortSchema>
