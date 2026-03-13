-- pgTAP RLS tests for retailer dashboard tables
-- Epic: EPIC-09 (Retailer Dashboard)
--
-- Tests verify that RLS policies correctly enforce:
--   retailer_members: scoped to own retailer, only owners can insert
--   retailer_stock_overrides: scoped to own retailer
--   retailer_notification_preferences: scoped to own member record
--   Anonymous access denied for all new tables

BEGIN;

SELECT plan(18);

-- =============================================================================
-- Setup: Create three test users via auth.users
-- (handle_new_user trigger auto-creates profiles)
-- =============================================================================

-- User X (will be owner of Retailer A)
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'retailer_x@test.cru',
  crypt('password123', gen_salt('bf')),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
);

-- User Y (will be staff of Retailer A)
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'retailer_y@test.cru',
  crypt('password456', gen_salt('bf')),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
);

-- User Z (will be owner of Retailer B)
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  'retailer_z@test.cru',
  crypt('password789', gen_salt('bf')),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
);

-- =============================================================================
-- Setup: Organization, memberships, retailers, wines
-- =============================================================================

-- Organization
INSERT INTO public.organizations (id, name, slug)
VALUES (
  '66660000-0000-0000-0000-000000000000',
  'Test Retailer Org',
  'test-retailer-org-09'
);

-- Org memberships (so users can access org-scoped data)
INSERT INTO public.memberships (id, user_id, org_id, role)
VALUES
  ('66660001-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', '66660000-0000-0000-0000-000000000000', 'owner'),
  ('66660002-0000-0000-0000-000000000000', '77777777-7777-7777-7777-777777777777', '66660000-0000-0000-0000-000000000000', 'member'),
  ('66660003-0000-0000-0000-000000000000', '88888888-8888-8888-8888-888888888888', '66660000-0000-0000-0000-000000000000', 'member');

-- Retailer A
INSERT INTO public.retailers (id, org_id, name, slug, address, city, state, zip, location)
VALUES (
  '66661111-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  'Retailer A',
  'retailer-a-09',
  '123 Main St',
  'Napa',
  'CA',
  '94558',
  ST_SetSRID(ST_MakePoint(-122.2869, 38.2975), 4326)
);

-- Retailer B
INSERT INTO public.retailers (id, org_id, name, slug, address, city, state, zip, location)
VALUES (
  '66662222-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  'Retailer B',
  'retailer-b-09',
  '456 Oak Ave',
  'Sonoma',
  'CA',
  '95476',
  ST_SetSRID(ST_MakePoint(-122.4580, 38.2919), 4326)
);

-- Producer (needed for wine FK)
INSERT INTO public.producers (id, org_id, name, slug)
VALUES (
  '66663333-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  'Test Producer',
  'test-producer-09'
);

-- Wine (needed for stock overrides FK)
INSERT INTO public.wines (id, org_id, producer_id, name, slug)
VALUES (
  '66664444-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  '66663333-0000-0000-0000-000000000000',
  'Test Cabernet',
  'test-cabernet-09'
);

-- =============================================================================
-- Setup: Retailer members
-- =============================================================================

-- User X = owner of Retailer A
INSERT INTO public.retailer_members (id, org_id, retailer_id, user_id, role)
VALUES (
  '66665555-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  '66661111-0000-0000-0000-000000000000',
  '66666666-6666-6666-6666-666666666666',
  'owner'
);

-- User Y = staff of Retailer A
INSERT INTO public.retailer_members (id, org_id, retailer_id, user_id, role)
VALUES (
  '66666600-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  '66661111-0000-0000-0000-000000000000',
  '77777777-7777-7777-7777-777777777777',
  'staff'
);

-- User Z = owner of Retailer B
INSERT INTO public.retailer_members (id, org_id, retailer_id, user_id, role)
VALUES (
  '66667700-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  '66662222-0000-0000-0000-000000000000',
  '88888888-8888-8888-8888-888888888888',
  'owner'
);

-- =============================================================================
-- Setup: Stock overrides (seeded as superuser, bypasses RLS)
-- =============================================================================

INSERT INTO public.retailer_stock_overrides (id, org_id, retailer_id, wine_id, override_status, overridden_by)
VALUES (
  '66668800-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  '66661111-0000-0000-0000-000000000000',
  '66664444-0000-0000-0000-000000000000',
  'out_of_stock',
  '66666666-6666-6666-6666-666666666666'
);

-- =============================================================================
-- Setup: Notification preferences (seeded as superuser)
-- =============================================================================

-- Notification prefs for User X
INSERT INTO public.retailer_notification_preferences (id, org_id, retailer_member_id, new_order_email, daily_summary_email)
VALUES (
  '66669900-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  '66665555-0000-0000-0000-000000000000',
  true,
  true
);

-- Notification prefs for User Y
INSERT INTO public.retailer_notification_preferences (id, org_id, retailer_member_id, new_order_email, daily_summary_email)
VALUES (
  '6666aa00-0000-0000-0000-000000000000',
  '66660000-0000-0000-0000-000000000000',
  '66666600-0000-0000-0000-000000000000',
  false,
  true
);

-- =============================================================================
-- Helper: set authenticated role with a specific user's JWT claims
-- =============================================================================

CREATE OR REPLACE FUNCTION tests.authenticate_as(user_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', user_id, 'role', 'authenticated')::text,
    true
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tests.clear_auth()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '', true);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RETAILER_MEMBERS: SELECT tests
-- =============================================================================

-- Test 1: User X can see Retailer A members
SELECT tests.authenticate_as('66666666-6666-6666-6666-666666666666');

SELECT is(
  (SELECT count(*)::integer FROM public.retailer_members
   WHERE retailer_id = '66661111-0000-0000-0000-000000000000'),
  2,
  'User X can see Retailer A members (owner + staff)'
);

-- Test 2: User X cannot see Retailer B members
SELECT is(
  (SELECT count(*)::integer FROM public.retailer_members
   WHERE retailer_id = '66662222-0000-0000-0000-000000000000'),
  0,
  'User X cannot see Retailer B members'
);

-- Test 3: User Z can see Retailer B members
SELECT tests.authenticate_as('88888888-8888-8888-8888-888888888888');

SELECT is(
  (SELECT count(*)::integer FROM public.retailer_members
   WHERE retailer_id = '66662222-0000-0000-0000-000000000000'),
  1,
  'User Z can see Retailer B members'
);

-- =============================================================================
-- RETAILER_MEMBERS: INSERT tests
-- =============================================================================

-- Test 4: User X (owner) can insert a new member for Retailer A
SELECT tests.authenticate_as('66666666-6666-6666-6666-666666666666');

SELECT lives_ok(
  $$INSERT INTO public.retailer_members (org_id, retailer_id, user_id, role)
    VALUES (
      '66660000-0000-0000-0000-000000000000',
      '66661111-0000-0000-0000-000000000000',
      '88888888-8888-8888-8888-888888888888',
      'staff'
    )$$,
  'User X (owner) can insert a new member for Retailer A'
);

-- Clean up the inserted member to avoid unique constraint issues later
DELETE FROM public.retailer_members
WHERE retailer_id = '66661111-0000-0000-0000-000000000000'
  AND user_id = '88888888-8888-8888-8888-888888888888';

-- Test 5: User Y (staff) cannot insert members for Retailer A
SELECT tests.authenticate_as('77777777-7777-7777-7777-777777777777');

SELECT throws_ok(
  $$INSERT INTO public.retailer_members (org_id, retailer_id, user_id, role)
    VALUES (
      '66660000-0000-0000-0000-000000000000',
      '66661111-0000-0000-0000-000000000000',
      '88888888-8888-8888-8888-888888888888',
      'staff'
    )$$,
  '42501',
  NULL,
  'User Y (staff) cannot insert members for Retailer A'
);

-- =============================================================================
-- RETAILER_STOCK_OVERRIDES: SELECT tests
-- =============================================================================

-- Test 6: User X can see Retailer A stock overrides
SELECT tests.authenticate_as('66666666-6666-6666-6666-666666666666');

SELECT is(
  (SELECT count(*)::integer FROM public.retailer_stock_overrides
   WHERE retailer_id = '66661111-0000-0000-0000-000000000000'),
  1,
  'User X can see Retailer A stock overrides'
);

-- Test 7: User Z cannot see Retailer A stock overrides
SELECT tests.authenticate_as('88888888-8888-8888-8888-888888888888');

SELECT is(
  (SELECT count(*)::integer FROM public.retailer_stock_overrides
   WHERE retailer_id = '66661111-0000-0000-0000-000000000000'),
  0,
  'User Z cannot see Retailer A stock overrides'
);

-- =============================================================================
-- RETAILER_STOCK_OVERRIDES: INSERT tests
-- =============================================================================

-- Test 8: User X can create overrides for Retailer A
SELECT tests.authenticate_as('66666666-6666-6666-6666-666666666666');

-- First clear the existing override so we can insert a new one
UPDATE public.retailer_stock_overrides
SET cleared_at = now()
WHERE id = '66668800-0000-0000-0000-000000000000';

SELECT lives_ok(
  $$INSERT INTO public.retailer_stock_overrides (org_id, retailer_id, wine_id, override_status, overridden_by)
    VALUES (
      '66660000-0000-0000-0000-000000000000',
      '66661111-0000-0000-0000-000000000000',
      '66664444-0000-0000-0000-000000000000',
      'in_stock',
      '66666666-6666-6666-6666-666666666666'
    )$$,
  'User X can create stock overrides for Retailer A'
);

-- Test 9: User X cannot create overrides for Retailer B
SELECT throws_ok(
  $$INSERT INTO public.retailer_stock_overrides (org_id, retailer_id, wine_id, override_status, overridden_by)
    VALUES (
      '66660000-0000-0000-0000-000000000000',
      '66662222-0000-0000-0000-000000000000',
      '66664444-0000-0000-0000-000000000000',
      'low_stock',
      '66666666-6666-6666-6666-666666666666'
    )$$,
  '42501',
  NULL,
  'User X cannot create stock overrides for Retailer B'
);

-- =============================================================================
-- RETAILER_NOTIFICATION_PREFERENCES: SELECT tests
-- =============================================================================

-- Test 10: User X can see their own notification preferences
SELECT tests.authenticate_as('66666666-6666-6666-6666-666666666666');

SELECT is(
  (SELECT count(*)::integer FROM public.retailer_notification_preferences),
  1,
  'User X can see their own notification preferences'
);

-- Test 11: User X cannot see User Y notification preferences
SELECT is(
  (SELECT count(*)::integer FROM public.retailer_notification_preferences
   WHERE retailer_member_id = '66666600-0000-0000-0000-000000000000'),
  0,
  'User X cannot see User Y notification preferences'
);

-- Test 12: User Y can see their own notification preferences
SELECT tests.authenticate_as('77777777-7777-7777-7777-777777777777');

SELECT is(
  (SELECT count(*)::integer FROM public.retailer_notification_preferences),
  1,
  'User Y can see their own notification preferences'
);

-- Test 13: User Y cannot see User X notification preferences
SELECT is(
  (SELECT count(*)::integer FROM public.retailer_notification_preferences
   WHERE retailer_member_id = '66665555-0000-0000-0000-000000000000'),
  0,
  'User Y cannot see User X notification preferences'
);

-- =============================================================================
-- ANONYMOUS ACCESS: verify anon role is denied for all new tables
-- =============================================================================

SELECT tests.clear_auth();

-- Test 14: Anonymous cannot read retailer_members
SELECT is(
  (SELECT count(*)::integer FROM public.retailer_members),
  0,
  'Anonymous cannot read retailer_members'
);

-- Test 15: Anonymous cannot read retailer_stock_overrides
SELECT is(
  (SELECT count(*)::integer FROM public.retailer_stock_overrides),
  0,
  'Anonymous cannot read retailer_stock_overrides'
);

-- Test 16: Anonymous cannot read retailer_notification_preferences
SELECT is(
  (SELECT count(*)::integer FROM public.retailer_notification_preferences),
  0,
  'Anonymous cannot read retailer_notification_preferences'
);

-- Test 17: Anonymous cannot insert retailer_members
SELECT throws_ok(
  $$INSERT INTO public.retailer_members (org_id, retailer_id, user_id, role)
    VALUES (
      '66660000-0000-0000-0000-000000000000',
      '66661111-0000-0000-0000-000000000000',
      '66666666-6666-6666-6666-666666666666',
      'staff'
    )$$,
  '42501',
  NULL,
  'Anonymous cannot insert retailer_members'
);

-- Test 18: Anonymous cannot insert retailer_stock_overrides
SELECT throws_ok(
  $$INSERT INTO public.retailer_stock_overrides (org_id, retailer_id, wine_id, override_status, overridden_by)
    VALUES (
      '66660000-0000-0000-0000-000000000000',
      '66661111-0000-0000-0000-000000000000',
      '66664444-0000-0000-0000-000000000000',
      'out_of_stock',
      '66666666-6666-6666-6666-666666666666'
    )$$,
  '42501',
  NULL,
  'Anonymous cannot insert retailer_stock_overrides'
);

-- =============================================================================
-- Cleanup
-- =============================================================================

SELECT * FROM finish();

ROLLBACK;
