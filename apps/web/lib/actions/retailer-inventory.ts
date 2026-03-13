'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  upsertStockOverride,
  clearStockOverride as dalClearStockOverride,
} from '@/lib/dal/retailer-inventory-mgmt'
import {
  StockOverrideSchema,
  ClearStockOverrideSchema,
} from '@/lib/validations/retailer-inventory'

// ---------------------------------------------------------------------------
// Helper: verify the current user is a retailer member
// Returns { userId, orgId } on success, { error } on failure.
// ---------------------------------------------------------------------------

async function verifyRetailerMember(retailerId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' } as const
  }

  // Check the user is a member of this retailer
  const { data: membership, error: memberError } = await supabase
    .from('retailer_members')
    .select('id, retailer_id')
    .eq('retailer_id', retailerId)
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return { error: 'Not authorized for this retailer' } as const
  }

  // Get the retailer's org_id
  const { data: retailer, error: retailerError } = await supabase
    .from('retailers')
    .select('org_id')
    .eq('id', retailerId)
    .single()

  if (retailerError || !retailer) {
    return { error: 'Retailer not found' } as const
  }

  return { supabase, userId: user.id, orgId: retailer.org_id } as const
}

// ---------------------------------------------------------------------------
// overrideStockStatus — Zod → auth → retailer member check → DAL upsert → revalidatePath
// ---------------------------------------------------------------------------

export async function overrideStockStatus(input: {
  retailerId: string
  wineId: string
  overrideStatus: string
}) {
  // 1. Zod validate
  const parsed = StockOverrideSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth + retailer member check
  const auth = await verifyRetailerMember(parsed.data.retailerId)
  if ('error' in auth) {
    return { error: auth.error }
  }

  // 3. DAL call
  const { data, error } = await upsertStockOverride(auth.supabase, {
    retailerId: parsed.data.retailerId,
    wineId: parsed.data.wineId,
    overrideStatus: parsed.data.overrideStatus,
    overriddenBy: auth.userId,
    orgId: auth.orgId,
  })

  if (error) {
    console.error('overrideStockStatus failed:', error)
    return { error: 'Failed to override stock status' }
  }

  // 4. Revalidate
  revalidatePath('/', 'layout')

  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// clearStockOverride — Zod → auth → retailer member check → DAL clear → revalidatePath
// ---------------------------------------------------------------------------

export async function clearStockOverride(retailerId: string, wineId: string) {
  // 1. Zod validate
  const parsed = ClearStockOverrideSchema.safeParse({ retailerId, wineId })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth + retailer member check
  const auth = await verifyRetailerMember(parsed.data.retailerId)
  if ('error' in auth) {
    return { error: auth.error }
  }

  // 3. DAL call
  const { error } = await dalClearStockOverride(
    auth.supabase,
    parsed.data.retailerId,
    parsed.data.wineId
  )

  if (error) {
    console.error('clearStockOverride failed:', error)
    return { error: 'Failed to clear stock override' }
  }

  // 4. Revalidate
  revalidatePath('/', 'layout')

  return { data: { success: true } }
}
