-- Push notification subscriptions
-- Phase 6 of EPIC-11: Push Notifications

SET search_path TO 'public', 'extensions';

-- ---------------------------------------------------------------------------
-- push_subscriptions table
-- ---------------------------------------------------------------------------

CREATE TABLE public.push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each user can only have one subscription per endpoint
  CONSTRAINT push_subscriptions_user_endpoint_unique UNIQUE (user_id, endpoint)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_push_subscriptions_org_id ON public.push_subscriptions(org_id);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- ---------------------------------------------------------------------------
-- Updated_at trigger
-- ---------------------------------------------------------------------------

CREATE TRIGGER set_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create own push subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can update their own subscriptions (key rotation)
CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
