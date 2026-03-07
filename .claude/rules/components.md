# Rules for components/**

- Server Components by default — only add `'use client'` when interactivity is required
- Never call Supabase directly from components — always use DAL functions in `lib/dal/`
- Use Shadcn/ui primitives — don't build custom UI when a Shadcn component exists
- All components must be typed — use the generated `Database` types from `types/database.ts`
- Feature components go in `components/features/[feature-name]/`
- Shared UI primitives stay in `components/ui/`
- Include `aria-label` attributes on interactive elements
- Use `<Suspense fallback={<Skeleton />}>` for async data boundaries
