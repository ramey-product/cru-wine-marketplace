import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { TasteProfileInput } from '@/lib/validations/taste-profile'

type TypedClient = SupabaseClient<Database>

// ---------------------------------------------------------------------------
// Wine select for taste profile wines join
// ---------------------------------------------------------------------------

const WINE_JOIN_SELECT = `
  id,
  user_id,
  wine_id,
  source,
  created_at,
  wine:wines!inner(id, name, slug, varietal, region, image_url)
` as const

// ---------------------------------------------------------------------------
// getTasteProfile — return the user's taste profile
// ---------------------------------------------------------------------------

export async function getTasteProfile(client: TypedClient, userId: string) {
  const { data, error } = await client
    .from('taste_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// upsertTasteProfile — create or update the user's taste profile
// Increments profile_version on update
// ---------------------------------------------------------------------------

export async function upsertTasteProfile(
  client: TypedClient,
  userId: string,
  input: TasteProfileInput
) {
  // Check if profile already exists to handle version increment
  const { data: existing } = await client
    .from('taste_profiles')
    .select('id, profile_version')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    // Update existing profile, increment version
    const { data, error } = await client
      .from('taste_profiles')
      .update({
        flavor_affinities: input.flavor_affinities,
        flavor_aversions: input.flavor_aversions,
        drinking_contexts: input.drinking_contexts,
        adventurousness_score: input.adventurousness_score,
        profile_version: existing.profile_version + 1,
      })
      .eq('id', existing.id)
      .select()
      .single()

    return { data, error }
  }

  // Insert new profile
  const { data, error } = await client
    .from('taste_profiles')
    .insert({
      user_id: userId,
      flavor_affinities: input.flavor_affinities,
      flavor_aversions: input.flavor_aversions,
      drinking_contexts: input.drinking_contexts,
      adventurousness_score: input.adventurousness_score,
    })
    .select()
    .single()

  return { data, error }
}

// ---------------------------------------------------------------------------
// getTasteProfileWines — return wines the user has loved, with wine details
// ---------------------------------------------------------------------------

export async function getTasteProfileWines(
  client: TypedClient,
  userId: string
) {
  const { data, error } = await client
    .from('taste_profile_wines')
    .select(WINE_JOIN_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// addTasteProfileWine — add a wine to the user's loved wines
// ---------------------------------------------------------------------------

export async function addTasteProfileWine(
  client: TypedClient,
  userId: string,
  wineId: string,
  source: 'onboarding' | 'manual_add' = 'manual_add'
) {
  const { data, error } = await client
    .from('taste_profile_wines')
    .upsert(
      { user_id: userId, wine_id: wineId, source },
      { onConflict: 'user_id,wine_id' }
    )
    .select()
    .single()

  return { data, error }
}

// ---------------------------------------------------------------------------
// removeTasteProfileWine — remove a wine from the user's loved wines
// ---------------------------------------------------------------------------

export async function removeTasteProfileWine(
  client: TypedClient,
  userId: string,
  wineId: string
) {
  return client
    .from('taste_profile_wines')
    .delete()
    .eq('user_id', userId)
    .eq('wine_id', wineId)
}
