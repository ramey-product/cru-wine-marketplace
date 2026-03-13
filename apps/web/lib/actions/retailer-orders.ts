'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateOrderStatus } from '@/lib/dal/retailer-orders'
import {
  UpdateOrderStatusSchema,
  VALID_STATUS_TRANSITIONS,
  type OrderStatus,
} from '@/lib/validations/retailer-orders'

// ---------------------------------------------------------------------------
// Helper: verify the current user is a retailer member for the order's retailer
// Returns { retailerId, userId } on success, { error } on failure.
// ---------------------------------------------------------------------------

async function verifyRetailerMemberForOrder(orderId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' } as const
  }

  // Get the order's org_id
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('org_id, status')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { error: 'Order not found' } as const
  }

  // Find the retailer for this org
  const { data: retailer, error: retailerError } = await supabase
    .from('retailers')
    .select('id')
    .eq('org_id', order.org_id)
    .single()

  if (retailerError || !retailer) {
    return { error: 'Retailer not found for this order' } as const
  }

  // Check the user is a member of this retailer
  const { data: membership, error: memberError } = await supabase
    .from('retailer_members')
    .select('id')
    .eq('retailer_id', retailer.id)
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return { error: 'Not authorized for this retailer' } as const
  }

  return {
    supabase,
    userId: user.id,
    retailerId: retailer.id,
    orgId: order.org_id,
    currentStatus: order.status as OrderStatus,
  } as const
}

// ---------------------------------------------------------------------------
// Helper: validate transition and execute status update
// ---------------------------------------------------------------------------

async function executeStatusTransition(
  orderId: string,
  targetStatus: OrderStatus,
  reason?: string
) {
  // 1. Zod validate
  const parsed = UpdateOrderStatusSchema.safeParse({
    orderId,
    status: targetStatus,
    reason,
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth + retailer member check
  const auth = await verifyRetailerMemberForOrder(orderId)
  if ('error' in auth) {
    return { error: auth.error }
  }

  // 3. Valid transition check
  const allowedTransitions =
    VALID_STATUS_TRANSITIONS[auth.currentStatus] ?? []
  if (!allowedTransitions.includes(targetStatus)) {
    return {
      error: `Cannot transition from "${auth.currentStatus}" to "${targetStatus}"`,
    }
  }

  // 4. DAL call
  const { data, error } = await updateOrderStatus(
    auth.supabase,
    orderId,
    auth.orgId,
    targetStatus,
    auth.userId,
    reason
  )
  if (error) {
    console.error(`${targetStatus} order failed:`, error)
    return { error: `Failed to update order status` }
  }

  // 5. Revalidate
  revalidatePath('/', 'layout')

  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// confirmOrder — pending → confirmed
// ---------------------------------------------------------------------------

export async function confirmOrder(orderId: string) {
  return executeStatusTransition(orderId, 'confirmed')
}

// ---------------------------------------------------------------------------
// markReadyForPickup — confirmed → ready_for_pickup
// ---------------------------------------------------------------------------

export async function markReadyForPickup(orderId: string) {
  return executeStatusTransition(orderId, 'ready_for_pickup')
}

// ---------------------------------------------------------------------------
// markOutForDelivery — confirmed → out_for_delivery
// ---------------------------------------------------------------------------

export async function markOutForDelivery(orderId: string) {
  return executeStatusTransition(orderId, 'out_for_delivery')
}

// ---------------------------------------------------------------------------
// markCompleted — ready_for_pickup|out_for_delivery → completed
// ---------------------------------------------------------------------------

export async function markCompleted(orderId: string) {
  return executeStatusTransition(orderId, 'completed')
}

// ---------------------------------------------------------------------------
// cancelOrder — any active status → cancelled
// ---------------------------------------------------------------------------

export async function cancelOrder(orderId: string, reason: string) {
  return executeStatusTransition(orderId, 'cancelled', reason)
}
