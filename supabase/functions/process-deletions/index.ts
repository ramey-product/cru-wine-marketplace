import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  // Verify the request is authorized using the service role key
  const authHeader = req.headers.get('Authorization')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const expectedToken = `Bearer ${serviceRoleKey}`

  if (!authHeader || authHeader !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Find all profiles past their scheduled deletion date
  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id, email')
    .not('deletion_scheduled_at', 'is', null)
    .lte('deletion_scheduled_at', new Date().toISOString())
    .limit(100)

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!profiles || profiles.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const results: { userId: string; success: boolean; error?: string }[] = []

  for (const profile of profiles) {
    try {
      // Step 1: Anonymize PII on the profile row.
      // This ensures personal data is scrubbed even if the auth deletion
      // fails — the profile row will have no PII on next retry.
      const { error: anonymizeError } = await supabase
        .from('profiles')
        .update({
          email: `deleted-${profile.id}@deleted.cru`,
          full_name: 'Deleted User',
          display_name: null,
          avatar_url: null,
          deletion_requested_at: null,
          deletion_scheduled_at: null,
        })
        .eq('id', profile.id)

      if (anonymizeError) {
        results.push({ userId: profile.id, success: false, error: anonymizeError.message })
        continue
      }

      // Step 2: Clear user preferences
      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', profile.id)

      // Step 3: Remove wishlist items and wishlists
      // Wishlist items cascade from wishlists, so deleting wishlists is sufficient.
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', profile.id)

      // Step 4: Delete auth user (service role required).
      // The profiles.id FK has ON DELETE CASCADE, which removes the
      // now-anonymized profile row. If this fails, the profile remains
      // anonymized (PII already scrubbed) and deletion_scheduled_at is
      // cleared, so it won't be re-processed.
      const { error: authDeleteError } =
        await supabase.auth.admin.deleteUser(profile.id)

      if (authDeleteError) {
        results.push({ userId: profile.id, success: false, error: authDeleteError.message })
        continue
      }

      results.push({ userId: profile.id, success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      results.push({ userId: profile.id, success: false, error: message })
    }
  }

  const processed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success)

  return new Response(
    JSON.stringify({ processed, failed: failed.length, errors: failed }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
