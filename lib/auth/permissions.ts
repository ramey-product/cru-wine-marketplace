import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type TypedClient = SupabaseClient<Database>

/**
 * Check if a user has an admin or owner role in the specified organization.
 * Used to gate content-management write operations (producers, wines, etc.).
 */
export async function isPlatformOrgAdmin(
  client: TypedClient,
  userId: string,
  orgId: string
): Promise<boolean> {
  const { data, error } = await client
    .from('memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .in('role', ['owner', 'admin'])
    .maybeSingle()

  if (error || !data) return false
  return true
}
