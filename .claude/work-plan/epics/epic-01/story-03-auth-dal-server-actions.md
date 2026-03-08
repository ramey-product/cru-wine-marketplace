### [EPIC-01/STORY-03] — Implement auth DAL and Server Actions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I need DAL functions and Server Actions for authentication so that the frontend can sign users up, log them in, and manage sessions through the standard application patterns.

#### Acceptance Criteria

```gherkin
Given a new user submits valid signup data (email, password, full_name, age_confirmed=true)
When the signup Server Action executes
Then a Supabase Auth user is created, a profile row is inserted, and a verification email is sent

Given a user submits signup with age_confirmed=false
When the signup Server Action executes
Then it returns { error: "You must confirm you are 21 or older" } and no user is created

Given a user submits login with valid credentials
When the login Server Action executes
Then a session cookie is set and the user is redirected to the app

Given a user calls the Google OAuth action
When the action executes
Then the user is redirected to Google's consent screen with the correct callback URL

Given a user submits a password reset request
When the action executes with a valid email
Then a reset email is sent regardless of whether the account exists (no email enumeration)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/users.ts` | Create |
| Action | `lib/actions/auth.ts` | Create |
| Validation | `lib/validations/auth.ts` | Create |
| Supabase | `lib/supabase/server.ts` | Verify exists (cookie-based server client) |
| Supabase | `lib/supabase/client.ts` | Verify exists (browser client for OAuth redirect) |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 (profiles table exists)
- **Blocks:** EPIC-01/STORY-06 (auth UI pages)

#### Testing Requirements

- [ ] **Unit (Vitest):** Zod schemas reject invalid email, short passwords, missing age confirmation
- [ ] **Unit (Vitest):** DAL functions return correct shapes for profile CRUD
- [ ] **Integration:** Signup action creates auth user + profile row in single transaction
- [ ] **Integration:** Login action sets session cookie correctly

#### Implementation Notes

- `lib/dal/users.ts` functions: `getProfile(client, userId)`, `updateProfile(client, userId, data)`, `createProfile(client, data)`, `deleteProfile(client, userId)`.
- `lib/actions/auth.ts` functions: `signUp(formData)`, `signIn(formData)`, `signInWithGoogle()`, `signInWithApple()`, `signOut()`, `resetPassword(formData)`, `updatePassword(formData)`.
- `lib/validations/auth.ts`: Zod schemas for `SignUpSchema`, `SignInSchema`, `ResetPasswordSchema`. Password minimum 8 chars, require email format.
- Age confirmation is a boolean field on the signup form — validated by Zod, stored as `age_confirmed_at TIMESTAMPTZ` on the profiles table.
- For OAuth: use `supabase.auth.signInWithOAuth({ provider: 'google' })` with `redirectTo` pointing to `/auth/callback` route handler.
- Auth callback route handler at `app/(auth)/callback/route.ts` exchanges code for session.
- Password reset: use `supabase.auth.resetPasswordForEmail()` — always return success to prevent email enumeration.
