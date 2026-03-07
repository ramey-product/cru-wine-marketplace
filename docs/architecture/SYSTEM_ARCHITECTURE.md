# System Architecture: Multi-Tenant B2B SaaS

> **Stack:** Next.js 15 (App Router) + Supabase + Vercel
> **Auth:** Supabase Auth with SSO/SAML 2.0 + social + email/password
> **Multi-tenancy:** Shared database with Row Level Security (RLS) + org_id isolation
> **Updated:** March 2026

---

## How to Use This Document

This document serves two purposes: (1) a human-readable system design reference, and (2) a context document you can load into Claude to bootstrap prototyping sessions. When starting a new Claude session, paste the relevant sections (or the whole doc) to give Claude full architectural context before generating code.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Multi-Tenancy Model](#3-multi-tenancy-model)
4. [Database Schema](#4-database-schema)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Layer Design](#6-api-layer-design)
7. [Data Access Layer (DAL)](#7-data-access-layer-dal)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Real-time & Subscriptions](#9-real-time--subscriptions)
10. [File Storage](#10-file-storage)
11. [Billing & Subscriptions](#11-billing--subscriptions)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Observability & Error Handling](#13-observability--error-handling)
14. [Testing Strategy](#14-testing-strategy)
15. [Security Checklist](#15-security-checklist)
16. [Decision Log](#16-decision-log)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                             │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Next.js   │  │   Next.js    │  │   Vercel Edge    │ │
│  │  Frontend  │  │ Route Handlers│  │   Middleware      │ │
│  │  (RSC +    │  │  (Public API) │  │  (Auth refresh)  │ │
│  │  Client)   │  │              │  │                  │ │
│  └─────┬──────┘  └──────┬───────┘  └────────┬─────────┘ │
│        │                │                    │           │
│  ┌─────┴────────────────┴────────────────────┴─────────┐ │
│  │              Server Actions (Mutations)              │ │
│  │              Data Access Layer (DAL)                 │ │
│  └─────────────────────┬───────────────────────────────┘ │
└────────────────────────┼────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
    ┌─────────────┐ ┌─────────┐ ┌──────────┐
    │  Supabase   │ │Supabase │ │ Supabase │
    │  PostgreSQL │ │  Auth   │ │ Storage  │
    │  (+ RLS)    │ │ (SSO)   │ │ (Files)  │
    └─────────────┘ └─────────┘ └──────────┘
           │
    ┌──────┴──────┐
    │  Supabase   │
    │  Realtime   │
    └─────────────┘
```

**Key Architectural Principles:**

- Server-first rendering: use React Server Components (RSC) by default, client components only when interactivity is needed
- Database-level security: every table has RLS policies; never rely solely on application-level auth checks
- Shared data access layer: all database operations go through a DAL that both Server Actions and Route Handlers call
- Cookie-based auth: use `@supabase/ssr` for cookie-based sessions (not localStorage) across SSR, middleware, and client components
- Type safety end-to-end: TypeScript everywhere, Supabase generates types from your schema, Zod validates inputs

---

## 2. Project Structure

### Decision: Turborepo Monorepo

Use a Turborepo monorepo to separate the main web app, marketing site, and shared packages. This pays off immediately when you need a landing page with different performance characteristics than your app, or when you eventually add a mobile app or admin portal.

```
/
├── apps/
│   ├── web/                          # Main SaaS application
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (auth)/               # Auth route group (login, signup, callback, sso)
│   │   │   ├── (marketing)/          # Public pages (landing, pricing, docs)
│   │   │   ├── (app)/                # Authenticated app pages
│   │   │   │   ├── [orgSlug]/        # Org-scoped dynamic segment
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   ├── general/
│   │   │   │   │   │   ├── members/
│   │   │   │   │   │   ├── billing/
│   │   │   │   │   │   └── sso/
│   │   │   │   │   └── [feature]/    # Your product features
│   │   │   │   └── layout.tsx        # Auth guard + org context provider
│   │   │   ├── api/                  # Route Handlers (webhooks, public API)
│   │   │   │   ├── webhooks/
│   │   │   │   │   └── stripe/
│   │   │   │   └── v1/              # Versioned public API (if needed)
│   │   │   ├── layout.tsx           # Root layout
│   │   │   └── middleware.ts        # Supabase auth token refresh
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts        # Browser client (createBrowserClient)
│   │   │   │   ├── server.ts        # Server client (createServerClient)
│   │   │   │   ├── middleware.ts     # Middleware client
│   │   │   │   └── admin.ts         # Service role client (bypasses RLS)
│   │   │   ├── dal/                 # Data Access Layer
│   │   │   │   ├── organizations.ts
│   │   │   │   ├── members.ts
│   │   │   │   ├── billing.ts
│   │   │   │   └── [feature].ts
│   │   │   ├── actions/             # Server Actions (call DAL)
│   │   │   │   ├── org-actions.ts
│   │   │   │   ├── member-actions.ts
│   │   │   │   └── [feature]-actions.ts
│   │   │   ├── validations/         # Zod schemas
│   │   │   │   ├── org.ts
│   │   │   │   └── [feature].ts
│   │   │   ├── hooks/               # Client-side React hooks
│   │   │   ├── utils/               # Pure utility functions
│   │   │   └── constants.ts
│   │   ├── components/
│   │   │   ├── ui/                  # Shadcn/ui primitives
│   │   │   ├── layouts/             # Shell, sidebar, nav
│   │   │   ├── forms/               # Reusable form components
│   │   │   └── [feature]/           # Feature-specific components
│   │   └── types/
│   │       ├── database.ts          # Auto-generated: `supabase gen types`
│   │       └── app.ts              # App-specific derived types
│   │
│   └── marketing/                   # Marketing/landing site (optional, can start in web)
│
├── packages/
│   ├── ui/                          # Shared component library
│   ├── config/                      # Shared configs (tsconfig, eslint, tailwind)
│   └── shared/                      # Shared utilities and types
│
├── supabase/
│   ├── migrations/                  # SQL migration files (version controlled)
│   ├── seed.sql                     # Development seed data
│   ├── config.toml                  # Supabase local dev config
│   └── functions/                   # Supabase Edge Functions (if needed)
│
├── turbo.json
├── package.json
└── .env.local                       # Never committed
```

### Key Structural Decisions

**Route Groups** `(auth)`, `(marketing)`, `(app)`: These create logical groupings without affecting URL paths. The `(app)` group gets a layout with auth guards and org context; `(marketing)` gets a public layout with different nav.

**Dynamic Org Segment** `[orgSlug]`: Every authenticated route is scoped to an organization. This enforces org context in the URL (e.g., `/acme-corp/dashboard`), makes deep-linking to org-specific pages work correctly, and makes the active org explicit rather than relying on hidden state.

**Separate `dal/` and `actions/` directories**: The DAL contains pure data-fetching functions. Server Actions in `actions/` handle validation, call the DAL, and return results. Route Handlers in `api/` also call the DAL. This prevents logic duplication.

---

## 3. Multi-Tenancy Model

### Decision: Shared Database + RLS + org_id Column

Every data table includes an `org_id` column. Supabase Row Level Security policies filter data automatically based on the authenticated user's organization membership. This is the most cost-effective and maintainable approach for B2B SaaS at the early-to-mid scale.

**Why not schema-per-tenant:** Schema isolation adds operational complexity (migrations must run per-schema), increases costs (connection pooling issues), and is only warranted at extreme isolation requirements (healthcare, finance with regulatory mandates). Shared DB + RLS gives you production-grade isolation for the vast majority of B2B SaaS.

### Tenant Context Flow

```
1. User authenticates → Supabase Auth issues JWT
2. JWT includes user_id (sub claim) via auth.uid()
3. RLS policies join auth.uid() → memberships → org_id
4. Every SELECT/INSERT/UPDATE/DELETE is automatically filtered
5. Application code NEVER manually filters by org_id (RLS handles it)
```

### RLS Policy Pattern (applied to every data table)

```sql
-- Enable RLS on the table
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- SELECT: user can only read rows belonging to orgs they're a member of
CREATE POLICY "Users can view their org data"
  ON your_table FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: user can only insert into orgs they belong to
CREATE POLICY "Users can insert into their org"
  ON your_table FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: same pattern
CREATE POLICY "Users can update their org data"
  ON your_table FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: restrict to admins
CREATE POLICY "Admins can delete their org data"
  ON your_table FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
```

### Performance Optimization

Create a composite index on `(org_id, id)` for every data table, and index the `memberships` table on `(user_id, org_id)`. The RLS subquery on `memberships` runs on every row access, so this index is critical.

```sql
CREATE INDEX idx_memberships_user_org ON memberships (user_id, org_id);
CREATE INDEX idx_your_table_org ON your_table (org_id);
```

---

## 4. Database Schema

### Core Tables

```sql
-- ══════════════════════════════════════
-- ORGANIZATIONS
-- ══════════════════════════════════════
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,       -- URL-safe identifier (acme-corp)
  logo_url    TEXT,
  plan        TEXT NOT NULL DEFAULT 'free', -- free | pro | enterprise
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  sso_provider_id       TEXT,             -- links to Supabase SSO provider
  metadata    JSONB DEFAULT '{}',         -- flexible org settings
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- USER PROFILES (extends Supabase auth.users)
-- ══════════════════════════════════════
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  email       TEXT NOT NULL,              -- denormalized from auth.users for convenience
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- MEMBERSHIPS (join table: users ↔ orgs)
-- ══════════════════════════════════════
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE memberships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role        member_role NOT NULL DEFAULT 'member',
  invited_by  UUID REFERENCES profiles(id),
  joined_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, org_id)                -- one membership per user per org
);

-- ══════════════════════════════════════
-- INVITATIONS
-- ══════════════════════════════════════
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

CREATE TABLE invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        member_role NOT NULL DEFAULT 'member',
  status      invite_status NOT NULL DEFAULT 'pending',
  invited_by  UUID NOT NULL REFERENCES profiles(id),
  token       TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════
CREATE INDEX idx_memberships_user_org ON memberships (user_id, org_id);
CREATE INDEX idx_memberships_org ON memberships (org_id);
CREATE INDEX idx_organizations_slug ON organizations (slug);
CREATE INDEX idx_invitations_email ON invitations (email) WHERE status = 'pending';
CREATE INDEX idx_invitations_token ON invitations (token) WHERE status = 'pending';

-- ══════════════════════════════════════
-- TRIGGERS: auto-update updated_at
-- ══════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Auto-Create Profile on Signup

```sql
-- Trigger: when a new user signs up, auto-create their profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Feature Table Template

When you add a new feature, follow this pattern:

```sql
CREATE TABLE your_feature_table (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- your feature columns here --
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Always add org_id index
CREATE INDEX idx_your_feature_org ON your_feature_table (org_id);

-- Always enable RLS
ALTER TABLE your_feature_table ENABLE ROW LEVEL SECURITY;

-- Apply standard org-scoped policies (see Section 3)
```

---

## 5. Authentication & Authorization

### Auth Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Authentication Flows                 │
├──────────────┬───────────────┬───────────────────────┤
│ Email/Pass   │ Social OAuth  │ Enterprise SSO        │
│ (standard)   │ (Google, etc) │ (SAML 2.0)           │
├──────────────┴───────────────┴───────────────────────┤
│              Supabase Auth (GoTrue)                  │
│         Cookie-based sessions via @supabase/ssr      │
├──────────────────────────────────────────────────────┤
│              Next.js Middleware                       │
│         Token refresh on every request               │
├──────────────────────────────────────────────────────┤
│              Authorization Layer                     │
│    RLS (database)  +  RBAC (application logic)       │
└──────────────────────────────────────────────────────┘
```

### Supabase Client Setup

**`lib/supabase/client.ts`** — Browser client (used in Client Components)

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** — Server client (used in Server Components, Server Actions, Route Handlers)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — ignore
            // middleware will handle the refresh
          }
        },
      },
    }
  )
}
```

**`lib/supabase/admin.ts`** — Service role client (bypasses RLS — use sparingly)

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// DANGER: This bypasses RLS. Only use for:
// - Webhooks (Stripe, etc.) where there's no user session
// - Background jobs / cron tasks
// - Admin operations that explicitly need to cross org boundaries
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // NEVER expose this to the client
)
```

**`middleware.ts`** — Refresh auth tokens on every request

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: call getUser() — not getSession() — to validate the token
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from app routes
  if (!user && request.nextUrl.pathname.startsWith('/(app)')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Enterprise SSO (SAML 2.0)

Supabase supports SAML 2.0 SSO on Pro plans and above. Configuration is done via the Supabase CLI.

```bash
# Add an SSO identity provider for an org
supabase sso add \
  --type saml \
  --metadata-url "https://login.microsoftonline.com/{tenant}/federationmetadata/2007-06/federationmetadata.xml" \
  --domains "acme-corp.com" \
  --project-ref your-project-ref
```

**SSO Login Flow (client-side):**

```typescript
// Initiate SSO login based on the user's email domain
const { data, error } = await supabase.auth.signInWithSSO({
  domain: 'acme-corp.com'  // Supabase matches this to the configured provider
})

if (data?.url) {
  window.location.href = data.url  // Redirect to identity provider
}
```

**SSO Configuration Page (org settings):** Allow org admins to self-service configure their SSO provider. Use the Supabase Management API (service role) to manage SSO providers per-org. Store the `sso_provider_id` on the organizations table.

### Role-Based Access Control (RBAC)

Authorization happens at two levels:

**Level 1 — Database (RLS):** Handles data isolation (see Section 3). A user cannot query data from an org they don't belong to, period.

**Level 2 — Application (RBAC):** Handles feature-level permissions within an org. Implemented as a helper function:

```typescript
// lib/dal/permissions.ts
export type Permission =
  | 'org:manage'        // Update org settings, billing
  | 'members:invite'    // Invite new members
  | 'members:remove'    // Remove members
  | 'members:manage_roles' // Change member roles
  | 'feature:create'    // Create feature resources
  | 'feature:edit'      // Edit feature resources
  | 'feature:delete'    // Delete feature resources

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner:  ['org:manage', 'members:invite', 'members:remove', 'members:manage_roles',
           'feature:create', 'feature:edit', 'feature:delete'],
  admin:  ['members:invite', 'members:remove',
           'feature:create', 'feature:edit', 'feature:delete'],
  member: ['feature:create', 'feature:edit'],
  viewer: [],
}

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
```

---

## 6. API Layer Design

### Decision: Server Actions for Mutations + Route Handlers for External APIs

| Use Case | Approach | Why |
|---|---|---|
| Form submissions from UI | Server Actions | Simpler, automatic type safety, optimized by Next.js |
| Data mutations from UI | Server Actions | Direct function calls, no HTTP overhead |
| Data fetching in Server Components | Direct DAL calls | No need for an API — server already has access |
| Webhooks (Stripe, etc.) | Route Handlers | External services need HTTP endpoints |
| Public API (if needed later) | Route Handlers (versioned: `/api/v1/`) | Standard REST for third-party consumers |
| File uploads | Route Handlers | Need streaming/multipart support |

### Server Action Pattern

```typescript
// lib/actions/feature-actions.ts
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createFeatureItem, getOrgMembership } from '@/lib/dal/features'
import { hasPermission } from '@/lib/dal/permissions'
import { revalidatePath } from 'next/cache'

const CreateItemSchema = z.object({
  orgId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
})

export async function createItem(input: z.infer<typeof CreateItemSchema>) {
  // 1. Validate input
  const parsed = CreateItemSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Invalid input', details: parsed.error.flatten() }
  }

  // 2. Authenticate
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 3. Authorize (check role permission)
  const membership = await getOrgMembership(supabase, user.id, parsed.data.orgId)
  if (!membership || !hasPermission(membership.role, 'feature:create')) {
    return { error: 'Forbidden' }
  }

  // 4. Execute via DAL (RLS also enforces at DB level)
  const { data, error } = await createFeatureItem(supabase, parsed.data)
  if (error) return { error: error.message }

  // 5. Revalidate cache
  revalidatePath(`/${membership.org_slug}/features`)

  return { data }
}
```

### Route Handler Pattern (for webhooks)

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body, signature, process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  // Handle event with supabaseAdmin (bypasses RLS — no user session in webhooks)
  switch (event.type) {
    case 'checkout.session.completed':
      // Update org plan in database
      break
    case 'customer.subscription.updated':
      // Sync subscription status
      break
  }

  return new Response('OK', { status: 200 })
}
```

---

## 7. Data Access Layer (DAL)

The DAL is the single source of truth for all database operations. Both Server Actions and Route Handlers call into the DAL. This prevents logic duplication and makes testing easier.

```typescript
// lib/dal/organizations.ts
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type TypedClient = SupabaseClient<Database>

export async function getOrganization(supabase: TypedClient, slug: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()

  return { data, error }
}

export async function getOrgMembership(
  supabase: TypedClient, userId: string, orgId: string
) {
  const { data, error } = await supabase
    .from('memberships')
    .select('*, organizations(slug)')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .single()

  return data  // null if not a member (RLS also enforces this)
}

export async function getUserOrganizations(supabase: TypedClient, userId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('role, joined_at, organizations(*)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })

  return { data, error }
}

export async function createOrganization(
  supabase: TypedClient,
  input: { name: string; slug: string },
  userId: string
) {
  // Create org + owner membership in a transaction via RPC
  const { data, error } = await supabase.rpc('create_organization_with_owner', {
    org_name: input.name,
    org_slug: input.slug,
    owner_user_id: userId,
  })

  return { data, error }
}
```

**Database function for atomic org creation:**

```sql
CREATE OR REPLACE FUNCTION create_organization_with_owner(
  org_name TEXT,
  org_slug TEXT,
  owner_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
BEGIN
  INSERT INTO organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;

  INSERT INTO memberships (user_id, org_id, role)
  VALUES (owner_user_id, new_org_id, 'owner');

  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 8. Frontend Architecture

### Server vs. Client Component Boundaries

```
Server Components (default — no 'use client')
├── Layouts (fetch org, user, check auth)
├── Page components (fetch data, render)
├── Data display components (tables, cards, lists)
└── Static UI (headers, footers, nav structure)

Client Components ('use client')
├── Interactive forms (inputs, selects, date pickers)
├── Modals and dialogs
├── Real-time subscriptions (Supabase Realtime)
├── Client-side state (filters, sort, search)
├── Components using browser APIs (clipboard, drag-drop)
└── Third-party libs requiring browser (charts, rich text editors)
```

### Org Context Pattern

```typescript
// app/(app)/[orgSlug]/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { getOrganization, getOrgMembership } from '@/lib/dal/organizations'
import { redirect, notFound } from 'next/navigation'
import { OrgProvider } from '@/components/providers/org-provider'

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await getOrganization(supabase, orgSlug)
  if (!org) notFound()

  const membership = await getOrgMembership(supabase, user.id, org.id)
  if (!membership) notFound()  // user isn't a member of this org

  return (
    <OrgProvider org={org} membership={membership} user={user}>
      <AppShell>{children}</AppShell>
    </OrgProvider>
  )
}
```

### State Management

| State Type | Solution |
|---|---|
| Server data | React Server Components (fetch in component, pass as props) |
| Mutations + optimistic updates | Server Actions + `useTransition` + `useOptimistic` |
| Client-side UI state | React `useState` / `useReducer` (local to component) |
| Cross-component client state | React Context (for org/user context passed from server) |
| URL state (filters, pagination) | `nuqs` library or `useSearchParams` |
| Real-time data | Supabase Realtime subscriptions in Client Components |

**Avoid** global state libraries (Redux, Zustand) unless you have a specific need. RSC + Server Actions + Context covers 95% of SaaS use cases.

---

## 9. Real-time & Subscriptions

Use Supabase Realtime for features that benefit from live updates (collaborative editing, notifications, activity feeds, live dashboards).

```typescript
// components/features/live-feed.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LiveFeed({ orgId }: { orgId: string }) {
  const [items, setItems] = useState<Item[]>([])
  const supabase = createClient()

  useEffect(() => {
    // RLS automatically filters to the user's org
    const channel = supabase
      .channel('feed-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feed_items',
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems(prev => [payload.new as Item, ...prev])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orgId, supabase])

  return <div>{/* render items */}</div>
}
```

---

## 10. File Storage

Supabase Storage uses the same RLS model as the database. Create storage buckets with policies tied to org membership.

```sql
-- Storage bucket policy: users can only access files in their org's folder
-- Bucket structure: {org_id}/{feature}/{filename}
CREATE POLICY "Users can read their org files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'org-files' AND
    (storage.foldername(name))[1]::UUID IN (
      SELECT org_id FROM memberships WHERE user_id = auth.uid()
    )
  );
```

**Upload pattern:**

```typescript
const filePath = `${orgId}/avatars/${fileName}`
const { data, error } = await supabase.storage
  .from('org-files')
  .upload(filePath, file, { upsert: true })
```

---

## 11. Billing & Subscriptions

### Decision: Stripe Checkout + Customer Portal + Webhooks

Stripe is the standard for SaaS billing. Use Stripe Checkout for payment collection (hosted by Stripe — PCI compliant with zero effort) and Stripe Customer Portal for subscription management.

**Key integration points:**

| Event | Action |
|---|---|
| Org created | Create Stripe Customer, store `stripe_customer_id` on org |
| User clicks "Upgrade" | Create Stripe Checkout Session, redirect to Stripe |
| `checkout.session.completed` webhook | Update org `plan` and `stripe_subscription_id` |
| `customer.subscription.updated` webhook | Sync plan changes (upgrades/downgrades) |
| `customer.subscription.deleted` webhook | Downgrade org to free plan |
| User clicks "Manage Billing" | Create Stripe Customer Portal Session, redirect |

**Feature gating pattern:**

```typescript
// lib/dal/billing.ts
const PLAN_LIMITS = {
  free:       { members: 5,   storage_mb: 100,  features: ['basic'] },
  pro:        { members: 25,  storage_mb: 5000, features: ['basic', 'advanced', 'api'] },
  enterprise: { members: -1,  storage_mb: -1,   features: ['basic', 'advanced', 'api', 'sso', 'audit_log'] },
} as const

export function canUseFeature(plan: string, feature: string): boolean {
  return PLAN_LIMITS[plan]?.features.includes(feature) ?? false
}

export function getMemberLimit(plan: string): number {
  return PLAN_LIMITS[plan]?.members ?? 5
}
```

---

## 12. Deployment & Infrastructure

### Vercel Configuration

```
Environment Variables (set in Vercel dashboard):

NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY       # Server-only — never exposed to client
STRIPE_SECRET_KEY               # Server-only
STRIPE_WEBHOOK_SECRET           # Server-only
NEXT_PUBLIC_APP_URL             # Your app domain (for OAuth callbacks)
```

### Environments

| Environment | Supabase Project | Vercel Branch | Purpose |
|---|---|---|---|
| Local | `supabase start` (local Docker) | localhost:3000 | Development |
| Preview | Staging Supabase project | PR branches | PR review + testing |
| Production | Production Supabase project | `main` branch | Live users |

### Database Migrations

All schema changes go through versioned migration files in `supabase/migrations/`. Never modify production schemas via the Supabase dashboard.

```bash
# Create a new migration
supabase migration new add_feature_table

# Apply locally
supabase db reset  # destroys and recreates local DB from migrations

# Apply to production (via CI/CD or manual)
supabase db push --project-ref your-project-ref

# Generate TypeScript types from schema
supabase gen types typescript --project-id your-project-ref > types/database.ts
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run typecheck        # tsc --noEmit
      - run: npm run lint              # eslint
      - run: npm run test              # vitest
      - run: npx supabase db lint      # Lint SQL migrations
```

---

## 13. Observability & Error Handling

### Error Handling Pattern

```typescript
// lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
  }
}

// In Server Actions — return errors, don't throw
export async function someAction(input: Input) {
  try {
    // ... business logic
    return { data: result }
  } catch (err) {
    // Log to monitoring (Sentry, LogFlare, etc.)
    console.error('Action failed:', err)
    return { error: err instanceof AppError ? err.message : 'Something went wrong' }
  }
}
```

### Recommended Monitoring Stack (all have free tiers)

| Tool | Purpose | Free Tier |
|---|---|---|
| Sentry | Error tracking + performance | 5K errors/mo |
| Vercel Analytics | Web vitals + page performance | Included in Pro |
| Supabase Dashboard | DB metrics, auth logs, API usage | Included |
| LogFlare (via Supabase) | Structured logging | Included |

---

## 14. Testing Strategy

| Layer | Tool | What to Test |
|---|---|---|
| Unit | Vitest | DAL functions, utility functions, Zod schemas, permission logic |
| Integration | Vitest + Supabase local | Server Actions end-to-end, RLS policies, database functions |
| E2E | Playwright | Critical user flows (signup, create org, invite member, core feature) |
| RLS | pgTAP or SQL tests | Every RLS policy with positive and negative cases |

**RLS Testing Example:**

```sql
-- Test: member of org A cannot read org B's data
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-in-org-a"}';
SELECT count(*) FROM your_table WHERE org_id = 'org-b-id';
-- Expected: 0
```

---

## 15. Security Checklist

- [ ] RLS enabled on every table (no exceptions)
- [ ] RLS policies tested with both positive and negative cases
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only used in Route Handlers for webhooks and background jobs
- [ ] All user inputs validated with Zod before hitting the database
- [ ] `supabase.auth.getUser()` (not `getSession()`) used for auth checks (validates JWT server-side)
- [ ] CORS configured on Supabase if exposing a public API
- [ ] Stripe webhook signatures verified before processing
- [ ] Invitation tokens are single-use and expire after 7 days
- [ ] Org slugs are validated (no reserved words, URL-safe characters only)
- [ ] Rate limiting on auth endpoints (Supabase handles this, but verify config)
- [ ] Environment variables never exposed to client (only `NEXT_PUBLIC_*` are safe)
- [ ] Database migrations version-controlled; no manual dashboard changes to production

---

## 16. Decision Log

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Meta-framework | Next.js 15 App Router | RSC, SSR/SSG, API routes, Vercel integration, largest ecosystem |
| 2 | Auth provider | Supabase Auth | Integrated with DB, SSO/SAML support, cookie-based SSR auth |
| 3 | Database | Supabase (PostgreSQL) | Managed, RLS, Realtime, Storage, Auth — all-in-one platform |
| 4 | Multi-tenancy | Shared DB + RLS + org_id | Cost-effective, standard pattern, database-level isolation |
| 5 | Hosting | Vercel | Zero-config for Next.js, preview deployments, edge middleware |
| 6 | Monorepo | Turborepo | Separate web app from marketing site, share packages |
| 7 | Styling | Tailwind CSS + Shadcn/ui | Utility-first CSS, accessible components, no vendor lock-in |
| 8 | Validation | Zod | TypeScript-native, works with Server Actions, generates types |
| 9 | Billing | Stripe Checkout + Webhooks | Industry standard, hosted checkout (PCI-free), webhooks for sync |
| 10 | Mutations | Server Actions (internal) + Route Handlers (external) | Simpler than REST for internal use; HTTP endpoints only where needed |
| 11 | State management | RSC + Context + URL state | No global state library needed; RSC eliminates most client state |
| 12 | SSO | Supabase SAML 2.0 | Native integration, supports Azure AD/Okta/Google Workspace |
| 13 | Error monitoring | Sentry | Industry standard, generous free tier, Next.js plugin |
| 14 | Testing | Vitest + Playwright | Fast unit/integration tests + E2E for critical paths |
| 15 | Type generation | `supabase gen types` | Single source of truth from database schema |

---

## Quick Reference: Loading This Into Claude

When starting a prototyping session, paste this prompt:

```
I'm building a multi-tenant B2B SaaS on Next.js 15 (App Router) + Supabase + Vercel.

Architecture context:
- Multi-tenancy via shared DB with RLS and org_id on every table
- Auth: Supabase Auth with @supabase/ssr (cookie-based), supports SSO/SAML
- Roles: owner | admin | member | viewer via memberships table
- API: Server Actions for UI mutations, Route Handlers for webhooks/external
- DAL pattern: all DB operations go through lib/dal/ functions
- Org context: [orgSlug] dynamic route segment, OrgProvider wraps app shell
- Billing: Stripe Checkout + Customer Portal + webhooks
- Styling: Tailwind CSS + Shadcn/ui
- Validation: Zod schemas in lib/validations/
- Types: auto-generated from Supabase schema via `supabase gen types`

Key schema tables: organizations, profiles (extends auth.users), memberships (user↔org join with role enum), invitations

For any new feature, always:
1. Create migration with org_id FK + RLS policies
2. Add DAL functions in lib/dal/
3. Add Zod validation schema
4. Add Server Action in lib/actions/
5. Create Server Component page + Client Component forms
```

Then describe the specific feature you want to build.
