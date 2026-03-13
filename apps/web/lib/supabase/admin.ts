import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Service-role Supabase client for admin operations that bypass RLS.
 * Use ONLY in:
 *   - Webhook handlers (no user session)
 *   - Background jobs / cron functions
 *   - Account deletion (CCPA compliance)
 *
 * NEVER import this in client components or Server Components.
 * NEVER expose the service role key to the browser.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
