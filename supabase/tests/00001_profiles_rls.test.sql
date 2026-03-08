-- pgTAP RLS tests for profiles and user_preferences tables
-- Epic: EPIC-01 (User Accounts & Preferences)
--
-- Tests verify that RLS policies correctly enforce:
--   profiles: any authenticated user can SELECT, only owner can UPDATE
--   user_preferences: only owner can SELECT, INSERT, UPDATE

BEGIN;

SELECT plan(16);

-- =============================================================================
-- Setup: Create two test users via auth.users
-- =============================================================================

-- User A
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'user_a@test.cru',
  crypt('password123', gen_salt('bf')),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
);

-- User B
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'user_b@test.cru',
  crypt('password456', gen_salt('bf')),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
);

-- The handle_new_user() trigger auto-creates profiles for both users.
-- Insert preferences for User A.
INSERT INTO public.user_preferences (user_id, location_zip, price_range_min, price_range_max)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '90210',
  20,
  80
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
-- PROFILES: SELECT tests
-- =============================================================================

-- Test 1: User A can read their own profile
SELECT tests.authenticate_as('11111111-1111-1111-1111-111111111111');

SELECT is(
  (SELECT count(*)::integer FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111'),
  1,
  'User A can SELECT their own profile'
);

-- Test 2: User A can read User B''s profile (public read)
SELECT is(
  (SELECT count(*)::integer FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222'),
  1,
  'User A can SELECT User B profile (public read policy)'
);

-- Test 3: User A can see all profiles
SELECT is(
  (SELECT count(*)::integer FROM public.profiles),
  2,
  'User A can see all profiles'
);

-- =============================================================================
-- PROFILES: UPDATE tests
-- =============================================================================

-- Test 4: User A can update their own profile
SELECT lives_ok(
  $$UPDATE public.profiles SET full_name = 'Updated A' WHERE id = '11111111-1111-1111-1111-111111111111'$$,
  'User A can UPDATE their own profile'
);

-- Test 5: User A cannot update User B''s profile
SELECT is(
  (WITH upd AS (
    UPDATE public.profiles SET full_name = 'Hacked'
    WHERE id = '22222222-2222-2222-2222-222222222222'
    RETURNING 1
  ) SELECT count(*)::integer FROM upd),
  0,
  'User A cannot UPDATE User B profile (zero rows affected)'
);

-- Verify User B''s profile was not changed
SELECT is(
  (SELECT full_name FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222'),
  NULL::text,
  'User B profile remains unchanged after failed update attempt'
);

-- =============================================================================
-- PROFILES: DELETE tests (no DELETE policy, should be denied)
-- =============================================================================

-- Test 7: User A cannot delete any profile
SELECT throws_ok(
  $$DELETE FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  NULL,
  'User A cannot DELETE profiles (no DELETE policy)'
);

-- =============================================================================
-- USER_PREFERENCES: SELECT tests
-- =============================================================================

-- Test 8: User A can read their own preferences
SELECT is(
  (SELECT count(*)::integer FROM public.user_preferences WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'User A can SELECT their own preferences'
);

-- Test 9: Switch to User B — cannot see User A''s preferences
SELECT tests.authenticate_as('22222222-2222-2222-2222-222222222222');

SELECT is(
  (SELECT count(*)::integer FROM public.user_preferences),
  0,
  'User B cannot see any preferences (none belong to them)'
);

-- =============================================================================
-- USER_PREFERENCES: INSERT tests
-- =============================================================================

-- Test 10: User B can insert their own preferences
SELECT lives_ok(
  $$INSERT INTO public.user_preferences (user_id, location_zip) VALUES ('22222222-2222-2222-2222-222222222222', '10001')$$,
  'User B can INSERT their own preferences'
);

-- Test 11: User B cannot insert preferences for User A
SELECT throws_ok(
  $$INSERT INTO public.user_preferences (id, user_id, location_zip) VALUES (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '00000')$$,
  '42501',
  NULL,
  'User B cannot INSERT preferences for User A'
);

-- =============================================================================
-- USER_PREFERENCES: UPDATE tests
-- =============================================================================

-- Test 12: User B can update their own preferences
SELECT lives_ok(
  $$UPDATE public.user_preferences SET location_zip = '10002' WHERE user_id = '22222222-2222-2222-2222-222222222222'$$,
  'User B can UPDATE their own preferences'
);

-- Test 13: User B cannot update User A''s preferences (zero rows matched by USING clause)
SELECT is(
  (WITH upd AS (
    UPDATE public.user_preferences SET location_zip = '00000'
    WHERE user_id = '11111111-1111-1111-1111-111111111111'
    RETURNING 1
  ) SELECT count(*)::integer FROM upd),
  0,
  'User B cannot UPDATE User A preferences (zero rows affected)'
);

-- Verify User A''s preferences unchanged
SELECT tests.authenticate_as('11111111-1111-1111-1111-111111111111');

SELECT is(
  (SELECT location_zip FROM public.user_preferences WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  '90210',
  'User A preferences remain unchanged after User B update attempt'
);

-- =============================================================================
-- ANONYMOUS ACCESS: verify anon role is denied
-- =============================================================================

SELECT tests.clear_auth();

-- Test 15: Anonymous users cannot read profiles
SELECT is(
  (SELECT count(*)::integer FROM public.profiles),
  0,
  'Anonymous users cannot SELECT profiles'
);

-- Test 16: Anonymous users cannot read user_preferences
SELECT is(
  (SELECT count(*)::integer FROM public.user_preferences),
  0,
  'Anonymous users cannot SELECT user_preferences'
);

-- =============================================================================
-- Cleanup
-- =============================================================================

SELECT * FROM finish();

ROLLBACK;
