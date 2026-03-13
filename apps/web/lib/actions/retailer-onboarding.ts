'use server'

/**
 * Retailer Onboarding Server Action (STORY-10)
 *
 * Handles the 5-step onboarding wizard submission:
 *   Step 1: Store Details (name, address, contact)
 *   Step 2: POS Selection
 *   Step 3: Fulfillment Capabilities
 *   Step 4: Initial Inventory CSV (optional)
 *   Step 5: Review & Submit
 *
 * Pipeline:
 *   Zod validate -> auth check -> create organization (user client)
 *   -> create owner membership (admin client, bypasses RLS)
 *   -> create retailer (user client) -> optional CSV import
 *   -> revalidatePath -> return
 */

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createRetailer } from '@/lib/dal/retailers'
import { slugify } from '@/lib/utils/slugify'
import { bulkCreateMatchQueueItems } from '@/lib/dal/wine-matching'
import {
  PosTypeEnum,
  FulfillmentCapabilityEnum,
} from '@/lib/validations/retailers'

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------

const OnboardingInputSchema = z.object({
  // Step 1: Store Details
  store_name: z.string().min(1, 'Store name is required').max(255),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(200),
  state: z.string().length(2, 'State must be 2-letter code').regex(/^[A-Z]{2}$/, 'State must be uppercase letters').default('CA'),
  zip: z
    .string()
    .min(5, 'ZIP code is required')
    .max(10)
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  website: z.string().url().max(500).optional(),

  // Step 2: POS Selection
  pos_type: PosTypeEnum.optional(),

  // Step 3: Fulfillment
  fulfillment_capabilities: z
    .array(FulfillmentCapabilityEnum)
    .min(1, 'At least one fulfillment method is required')
    .default(['pickup']),
  delivery_radius_miles: z.number().int().min(0).optional(),

  // Step 4: CSV Upload (optional — raw rows already parsed client-side)
  csv_items: z
    .array(
      z.object({
        raw_wine_name: z.string().min(1),
        raw_producer: z.string().optional(),
        raw_vintage: z.string().optional(),
        raw_varietal: z.string().optional(),
        raw_sku: z.string().optional(),
        raw_price: z.number().optional(),
        raw_quantity: z.number().int().optional(),
      })
    )
    .optional(),
})

export type OnboardingInput = z.infer<typeof OnboardingInputSchema>

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

interface OnboardingResult {
  org_id: string
  org_slug: string
  retailer_id: string
  retailer_slug: string
  csv_items_queued: number
}

// ---------------------------------------------------------------------------
// submitOnboardingAction
// ---------------------------------------------------------------------------

/**
 * Server Action: Submit the retailer onboarding wizard.
 *
 * Creates a new organization, the first owner membership,
 * a retailer, and optionally queues CSV items for wine matching.
 *
 * @returns { data: OnboardingResult } on success, { error: string } on failure
 */
export async function submitOnboardingAction(
  input: OnboardingInput
): Promise<{ data: OnboardingResult } | { error: string }> {
  // 1. Validate input
  const parsed = OnboardingInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const data = parsed.data

  // 2. Auth check (authentication only — no org permission check needed because
  //    onboarding creates a brand-new org; the user becomes its first owner)
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Generate slugs
  const orgSlug = slugify(data.store_name)
  const retailerSlug = slugify(data.store_name)

  // -----------------------------------------------------------------------
  // Steps 4–6: Bootstrap direct DB access (intentional exception)
  //
  // Onboarding creates a brand-new org + first membership. There is no
  // existing org context to scope DAL functions against, so we query
  // the organizations and memberships tables directly. The admin client
  // (service-role) is used for the first membership insert because the
  // memberships INSERT RLS policy requires the user to already be an
  // admin/owner — impossible for the very first membership.
  // -----------------------------------------------------------------------

  // 4. Check slug uniqueness for organization
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .maybeSingle()

  if (existingOrg) {
    return { error: 'An organization with this name already exists. Please choose a different store name.' }
  }

  // 5. Create organization (using user's auth client — RLS allows inserts)
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: data.store_name,
      slug: orgSlug,
    })
    .select('id, slug')
    .single()

  if (orgError || !org) {
    console.error('submitOnboardingAction: failed to create organization:', orgError)
    return { error: 'Failed to create organization' }
  }

  // 6. Create owner membership using admin client (bypasses RLS)
  //    The memberships INSERT policy requires the user to already be an
  //    admin/owner in the org — impossible for the first membership.
  //    The service-role client skips RLS to bootstrap the owner row.
  const adminClient = createAdminClient()
  const { error: membershipError } = await adminClient
    .from('memberships')
    .insert({
      user_id: user.id,
      org_id: org.id,
      role: 'owner',
    })

  if (membershipError) {
    console.error('submitOnboardingAction: failed to create membership:', membershipError)
    // Attempt cleanup: delete the org we just created
    await adminClient.from('organizations').delete().eq('id', org.id)
    return { error: 'Failed to set up organization membership' }
  }

  // 7. Create retailer
  const retailerResult = await createRetailer(supabase, {
    org_id: org.id,
    name: data.store_name,
    slug: retailerSlug,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    latitude: data.latitude,
    longitude: data.longitude,
    phone: data.phone,
    email: data.email,
    website: data.website,
    pos_type: data.pos_type,
    fulfillment_capabilities: data.fulfillment_capabilities,
    delivery_radius_miles: data.delivery_radius_miles,
  })

  if (retailerResult.error || !retailerResult.data) {
    console.error('submitOnboardingAction: failed to create retailer:', retailerResult.error)
    return { error: 'Failed to create retailer' }
  }

  const retailer = retailerResult.data

  // 8. Queue CSV items for wine matching (optional Step 4)
  let csvItemsQueued = 0
  if (data.csv_items && data.csv_items.length > 0) {
    const queueItems = data.csv_items.map((item) => ({
      retailer_id: retailer.id,
      raw_wine_name: item.raw_wine_name,
      raw_producer: item.raw_producer,
      raw_vintage: item.raw_vintage,
      raw_varietal: item.raw_varietal,
      raw_sku: item.raw_sku,
      raw_price: item.raw_price,
      raw_quantity: item.raw_quantity,
      match_status: 'pending' as const,
    }))

    const { count, error: queueError } = await bulkCreateMatchQueueItems(
      supabase,
      org.id,
      queueItems
    )

    if (queueError) {
      console.error(
        'submitOnboardingAction: failed to queue CSV items (non-fatal):',
        queueError
      )
    } else {
      csvItemsQueued = count ?? 0
    }
  }

  // 9. Revalidate paths
  revalidatePath(`/(app)/${org.slug}`, 'layout')
  revalidatePath(`/(app)/${org.slug}/retailers`, 'page')

  // 10. Return result
  return {
    data: {
      org_id: org.id,
      org_slug: org.slug,
      retailer_id: retailer.id,
      retailer_slug: retailerSlug,
      csv_items_queued: csvItemsQueued,
    },
  }
}
