import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// getActiveCollections — return currently active, time-valid collections
// ---------------------------------------------------------------------------

export async function getActiveCollections(client: TypedClient) {
  const now = new Date().toISOString()

  const { data, error } = await client
    .from('curated_collections')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('display_order', { ascending: true })

  if (error) {
    return { data: null, error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// getCollectionWithItems — return a collection by ID with joined items + wine
// ---------------------------------------------------------------------------

export async function getCollectionWithItems(
  client: TypedClient,
  collectionId: string
) {
  const { data, error } = await client
    .from('curated_collections')
    .select(
      '*, items:curated_collection_items(*, wine:wines(id, name, slug, varietal, region, image_url, price_min, price_max, producer:producers(id, name, slug)))'
    )
    .eq('id', collectionId)
    .order('position', {
      ascending: true,
      referencedTable: 'curated_collection_items',
    })
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// getCollectionBySlug — return a collection by slug with joined items + wine
// ---------------------------------------------------------------------------

export async function getCollectionBySlug(
  client: TypedClient,
  slug: string
) {
  const { data, error } = await client
    .from('curated_collections')
    .select(
      '*, items:curated_collection_items(*, wine:wines(id, name, slug, varietal, region, image_url, price_min, price_max, producer:producers(id, name, slug)))'
    )
    .eq('slug', slug)
    .order('position', {
      ascending: true,
      referencedTable: 'curated_collection_items',
    })
    .maybeSingle()

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// createCollection — insert a new curated collection
// ---------------------------------------------------------------------------

export async function createCollection(
  client: TypedClient,
  input: {
    org_id: string
    title: string
    slug: string
    description?: string
    cover_image_url?: string
    curator_id: string
    display_order?: number
    is_active?: boolean
    start_date?: string
    end_date?: string
  }
) {
  const { data, error } = await client
    .from('curated_collections')
    .insert(input)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// updateCollection — partial update of a curated collection
// ---------------------------------------------------------------------------

export async function updateCollection(
  client: TypedClient,
  collectionId: string,
  input: {
    title?: string
    slug?: string
    description?: string
    cover_image_url?: string
    display_order?: number
    is_active?: boolean
    start_date?: string | null
    end_date?: string | null
  }
) {
  const { data, error } = await client
    .from('curated_collections')
    .update(input)
    .eq('id', collectionId)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// addItemToCollection — idempotent insert using ON CONFLICT DO NOTHING
// ---------------------------------------------------------------------------

export async function addItemToCollection(
  client: TypedClient,
  input: {
    org_id: string
    collection_id: string
    wine_id: string
    position?: number
    curator_note?: string
  }
) {
  const { data, error } = await client
    .from('curated_collection_items')
    .upsert(input, {
      onConflict: 'collection_id,wine_id',
      ignoreDuplicates: true,
    })
    .select()
    .single()

  // If ignoreDuplicates triggers, .single() returns null — treat as success
  if (error && error.code === 'PGRST116') {
    return { data: null, error: null }
  }

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// removeItemFromCollection — delete a collection item by its ID
// ---------------------------------------------------------------------------

export async function removeItemFromCollection(
  client: TypedClient,
  itemId: string
) {
  const { error } = await client
    .from('curated_collection_items')
    .delete()
    .eq('id', itemId)

  return { error }
}

// ---------------------------------------------------------------------------
// reorderCollectionItems — update positions for items in a collection
// ---------------------------------------------------------------------------

export async function reorderCollectionItems(
  client: TypedClient,
  collectionId: string,
  itemIds: string[]
) {
  for (let i = 0; i < itemIds.length; i++) {
    const itemId = itemIds[i]
    if (!itemId) continue

    const { error } = await client
      .from('curated_collection_items')
      .update({ position: i })
      .eq('id', itemId)
      .eq('collection_id', collectionId)

    if (error) {
      return { error }
    }
  }

  return { error: null }
}
