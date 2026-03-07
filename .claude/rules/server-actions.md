# Rules for lib/actions/**

- Every Server Action follows this pattern: Zod validate → auth check → permission check → DAL call → revalidatePath
- Always use `'use server'` directive at the top of the file
- Never trust client input — re-validate everything with Zod on the server
- Return `{ data }` on success and `{ error: string }` on failure — never throw
- Use DAL functions for all database operations — never query Supabase directly
- Check user authentication with `supabase.auth.getUser()` (not `getSession()`)
- Check authorization via `hasPermission(membership.role, 'resource:action')`
- Call `revalidatePath()` after successful mutations to refresh Server Components
