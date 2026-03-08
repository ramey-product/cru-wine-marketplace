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
      // Delete auth user (service role required).
      // The profiles.id FK has ON DELETE CASCADE, which automatically
      // removes the profile row and its user_preferences.
      // If this fails, deletion_scheduled_at markers remain intact
      // so the cron job will retry on the next run.
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
