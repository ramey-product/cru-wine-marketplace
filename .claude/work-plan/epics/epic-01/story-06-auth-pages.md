### [EPIC-01/STORY-06] — Build auth pages (signup, login, password reset, OAuth callback)

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want to create an account or sign in so that I can access personalized wine recommendations and save my preferences.

#### Acceptance Criteria

```gherkin
Given I am an unauthenticated visitor
When I navigate to /signup
Then I see a signup form with email, password, full name, age confirmation checkbox, and OAuth buttons (Google, Apple)

Given I fill in valid signup details and check the age confirmation
When I submit the form
Then I see a "Check your email for verification" message

Given I click "Sign in with Google"
When I authorize on Google's consent screen
Then I am redirected back and logged in with my Google profile data pre-populated

Given I am on the login page with valid credentials
When I submit the form
Then I am redirected to the app home page with a valid session

Given I enter an email on the password reset page
When I submit
Then I see "If an account exists, we've sent a reset link" (no email enumeration)

Given I am on any auth page
When I inspect the page with axe-core
Then there are zero accessibility violations
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(auth)/signup/page.tsx` | Create |
| Page | `app/(auth)/login/page.tsx` | Create |
| Page | `app/(auth)/reset-password/page.tsx` | Create |
| Page | `app/(auth)/callback/route.ts` | Create |
| Page | `app/(auth)/layout.tsx` | Create |
| Component | `components/features/auth/SignupForm.tsx` | Create |
| Component | `components/features/auth/LoginForm.tsx` | Create |
| Component | `components/features/auth/ResetPasswordForm.tsx` | Create |
| Component | `components/features/auth/OAuthButtons.tsx` | Create |
| Component | `components/features/auth/AgeGateCheckbox.tsx` | Create |
| Loading | `app/(auth)/signup/loading.tsx` | Create |
| Error | `app/(auth)/signup/error.tsx` | Create |
| Loading | `app/(auth)/login/loading.tsx` | Create |
| Error | `app/(auth)/login/error.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-03 (auth Server Actions), EPIC-01/STORY-09 (copy for auth pages)
- **Blocks:** EPIC-01/STORY-08 (settings pages depend on auth layout pattern)

#### Testing Requirements

- [ ] **E2E (Playwright):** Complete signup flow via email — form → submit → verification message
- [ ] **E2E (Playwright):** Login with valid credentials → redirect to app
- [ ] **E2E (Playwright):** Login with invalid credentials → error message
- [ ] **Accessibility:** axe-core scan on signup, login, and reset-password pages
- [ ] **Unit:** Form validation client-side matches Zod schemas

#### Implementation Notes

- Auth pages use `(auth)` route group with its own layout (centered card, Cru branding, no nav).
- Forms are Client Components (`'use client'`) since they need interactivity (form state, validation, submission).
- Use Shadcn `<Form>`, `<Input>`, `<Button>`, `<Checkbox>` components.
- OAuth callback route handler (`/auth/callback/route.ts`) exchanges the auth code for a session using `supabase.auth.exchangeCodeForSession(code)`.
- After signup, redirect to onboarding preferences flow (EPIC-01/STORY-08). After login, redirect to `/(app)/[orgSlug]/` or app home.
- Age gate checkbox: must be checked to enable submit button. Label text from marketing-writer (STORY-09).
- Error states: duplicate email ("An account with this email already exists"), invalid password format, network errors.
- All pages need `loading.tsx` (skeleton card) and `error.tsx` (error boundary with retry).
