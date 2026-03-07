# Rules for **/*.test.ts, **/*.spec.ts, supabase/tests/**

- Test the contract, not the implementation — test what functions return, not internal mechanics
- RLS tests are mandatory for every new table: positive (own org) AND negative (other org) cases
- E2E tests cover critical business paths only — signup, create org, invite member, core feature flows
- Accessibility scans (axe-core) required on every new page
- Use test fixtures and factories — no inline test data
- Unit tests: Vitest for DAL functions, utilities, Zod schemas, permission logic
- Integration tests: Vitest + Supabase local for Server Actions end-to-end
- E2E tests: Playwright for critical user flows
- RLS tests: pgTAP SQL tests in `supabase/tests/`
