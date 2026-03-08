-- Migration: Create organizations, memberships, and invitations tables
-- These are the multi-tenancy infrastructure tables required by SYSTEM_ARCHITECTURE.md
-- All content-scoped and org-scoped tables depend on organizations(id).

SET search_path TO '';

-- =============================================================================
-- 1. Organizations table
-- =============================================================================

CREATE TABLE public.organizations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  slug                   TEXT UNIQUE NOT NULL,
  logo_url               TEXT,
  plan                   TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  sso_provider_id        TEXT,
  metadata               JSONB DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON public.organizations (slug);

CREATE TRIGGER trg_organizations_updated
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 2. member_role enum
-- =============================================================================

CREATE TYPE public.member_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- =============================================================================
-- 3. Memberships table (join: users <-> orgs)
-- =============================================================================

CREATE TABLE public.memberships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role        public.member_role NOT NULL DEFAULT 'member',
  invited_by  UUID REFERENCES public.profiles(id),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

CREATE INDEX idx_memberships_user_org ON public.memberships (user_id, org_id);
CREATE INDEX idx_memberships_org ON public.memberships (org_id);

-- =============================================================================
-- 4. invite_status enum + invitations table
-- =============================================================================

CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

CREATE TABLE public.invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        public.member_role NOT NULL DEFAULT 'member',
  status      public.invite_status NOT NULL DEFAULT 'pending',
  invited_by  UUID NOT NULL REFERENCES public.profiles(id),
  token       TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_org ON public.invitations (org_id);
CREATE INDEX idx_invitations_email_pending ON public.invitations (email) WHERE status = 'pending';
CREATE INDEX idx_invitations_token_pending ON public.invitations (token) WHERE status = 'pending';

-- =============================================================================
-- 5. Row Level Security
-- =============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Organizations: users can see orgs they belong to
CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
    )
  );

-- Organizations: only owners can update their org
CREATE POLICY "Owners can update their organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
        AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- Organizations: any authenticated user can create (org creation flow)
CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Memberships: users can see memberships in their orgs
CREATE POLICY "Members can view org memberships"
  ON public.memberships FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
    )
  );

-- Memberships: admins/owners can insert new memberships
CREATE POLICY "Admins can add members"
  ON public.memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Memberships: admins/owners can update roles
CREATE POLICY "Admins can update memberships"
  ON public.memberships FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Memberships: admins/owners can remove members
CREATE POLICY "Admins can remove members"
  ON public.memberships FOR DELETE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Invitations: members can see invitations for their org
CREATE POLICY "Members can view org invitations"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
    )
  );

-- Invitations: admins/owners can create invitations
CREATE POLICY "Admins can create invitations"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Invitations: admins/owners can update invitations (revoke, etc.)
CREATE POLICY "Admins can update invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
