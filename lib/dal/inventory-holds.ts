import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// Inventory Holds DAL
// ---------------------------------------------------------------------------
//
// All functions in this module are intended to be called with the service role
// client (supabaseAdmin) because the inventory_holds table has restrictive RLS
// that denies all direct access to authenticated users.
//
// The TypedClient parameter type is preserved for consistency with the rest of
// the DAL — callers are responsible for passing the admin client.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// createHold — reserve stock during checkout
// ---------------------------------------------------------------------------

/**
 * Create an inventory hold to reserve stock while a user completes checkout.
 * Holds default to 'active' status and expire after 10 minutes (DB default).
 */
export async function createHold(
  client: TypedClient,
  input: {
    wineId: string
    retailerOrgId: string
    userId: string
    quantity: number
    stripeCheckoutSessionId?: string
  }
) {
  const { data, error } = await client
    .from('inventory_holds')
    .insert({
      wine_id: input.wineId,
      retailer_org_id: input.retailerOrgId,
      user_id: input.userId,
      quantity: input.quantity,
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('createHold failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// releaseHold — manually release a hold (e.g. user abandons cart)
// ---------------------------------------------------------------------------

/**
 * Release an active hold, making the reserved stock available again.
 * Only transitions holds with status 'active'.
 */
export async function releaseHold(client: TypedClient, holdId: string) {
  const { data, error } = await client
    .from('inventory_holds')
    .update({ status: 'released' })
    .eq('id', holdId)
    .eq('status', 'active')
    .select()
    .single()

  if (error) {
    console.error('releaseHold failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// convertHold — mark hold as converted after successful payment
// ---------------------------------------------------------------------------

/**
 * Convert an active hold to 'converted' after a successful Stripe payment.
 * Only transitions holds with status 'active'.
 */
export async function convertHold(client: TypedClient, holdId: string) {
  const { data, error } = await client
    .from('inventory_holds')
    .update({ status: 'converted' })
    .eq('id', holdId)
    .eq('status', 'active')
    .select()
    .single()

  if (error) {
    console.error('convertHold failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// expireHolds — bulk-expire all holds past their expiration time
// ---------------------------------------------------------------------------

/**
 * Expire all active holds whose expires_at has passed.
 * Intended to be called by a cron job or background task.
 *
 * Returns the count of expired holds.
 */
export async function expireHolds(client: TypedClient) {
  const now = new Date().toISOString()

  const { data, error } = await client
    .from('inventory_holds')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', now)
    .select()

  if (error) {
    console.error('expireHolds failed:', error)
    return { count: 0, error }
  }

  return { count: data?.length ?? 0, error: null }
}

// ---------------------------------------------------------------------------
// getActiveHoldsForItem — all active holds for a wine at a retailer
// ---------------------------------------------------------------------------

/**
 * Retrieve all active, non-expired holds for a specific wine at a retailer.
 * Useful for computing real-time available stock or debugging hold state.
 */
export async function getActiveHoldsForItem(
  client: TypedClient,
  wineId: string,
  retailerOrgId: string
) {
  const now = new Date().toISOString()

  const { data, error } = await client
    .from('inventory_holds')
    .select()
    .eq('wine_id', wineId)
    .eq('retailer_org_id', retailerOrgId)
    .eq('status', 'active')
    .gt('expires_at', now)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getActiveHoldsForItem query failed:', error)
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// getHoldByCheckoutSession — find hold by Stripe checkout session ID
// ---------------------------------------------------------------------------

/**
 * Look up all holds for a Stripe checkout session ID.
 * A single checkout session can have multiple holds (one per cart item).
 * Used in Stripe webhook handlers to correlate payment events with holds.
 */
export async function getHoldsByCheckoutSession(
  client: TypedClient,
  sessionId: string
) {
  const { data, error } = await client
    .from('inventory_holds')
    .select()
    .eq('stripe_checkout_session_id', sessionId)

  if (error) {
    console.error('getHoldsByCheckoutSession query failed:', error)
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}
