-- pgTAP RLS tests for follows and share_events tables
-- Epic: EPIC-08 (Social/Community Layer)
--
-- Tests verify that RLS policies correctly enforce:
--   follows: visible to both parties, insertable/deletable by follower only
--   share_events: user-scoped (own events only)

BEGIN;

SELECT plan(15);

-- =============================================================================
-- Setup: Create three test users via auth.users
-- =============================================================================

-- User A
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'social_a@test.cru',
  crypt('password123', gen_salt('bf')),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
);

-- User B
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'social_b@test.cru',
  crypt('password456', gen_salt('bf')),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
);

-- User C
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'social_c@test.cru',
  crypt('password789', gen_salt('bf')),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
);

-- Seed data: User B follows User C (inserted as superuser, bypasses RLS)
INSERT INTO public.follows (id, follower_id, following_id)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- Seed data: User B has a share event
INSERT INTO public.share_events (id, user_id, shareable_type, shareable_id, platform)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '44444444-4444-4444-4444-444444444444',
  'wine',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'clipboard'
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
-- FOLLOWS: SELECT tests
-- =============================================================================

-- Test 1: User A can see follows where they are the follower
-- (User A has no follows yet, so insert one first as superuser)
INSERT INTO public.follows (id, follower_id, following_id)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

SELECT tests.authenticate_as('33333333-3333-3333-3333-333333333333');

SELECT is(
  (SELECT count(*)::integer FROM public.follows WHERE follower_id = '33333333-3333-3333-3333-333333333333'),
  1,
  'User A can see their own follows (as follower)'
);

-- Test 2: User A can see follows where they are the following target
-- User B follows User A? No — let's use the fact that User A follows User B,
-- so User B should see that follow too. Switch to User B perspective.
SELECT tests.authenticate_as('44444444-4444-4444-4444-444444444444');

SELECT is(
  (SELECT count(*)::integer FROM public.follows WHERE following_id = '44444444-4444-4444-4444-444444444444'),
  1,
  'User B can see follows where they are the following target'
);

-- Test 3: User A cannot see follows between two other users (B follows C)
SELECT tests.authenticate_as('33333333-3333-3333-3333-333333333333');

SELECT is(
  (SELECT count(*)::integer FROM public.follows
   WHERE follower_id = '44444444-4444-4444-4444-444444444444'
     AND following_id = '55555555-5555-5555-5555-555555555555'),
  0,
  'User A cannot see follows between two other users'
);

-- =============================================================================
-- FOLLOWS: INSERT tests
-- =============================================================================

-- Test 4: User A can insert a follow as themselves
SELECT tests.authenticate_as('33333333-3333-3333-3333-333333333333');

SELECT lives_ok(
  $$INSERT INTO public.follows (follower_id, following_id) VALUES ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555')$$,
  'User A can insert a follow as themselves'
);

-- Test 5: User A cannot insert a follow as someone else
SELECT throws_ok(
  $$INSERT INTO public.follows (follower_id, following_id) VALUES ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333')$$,
  '42501',
  NULL,
  'User A cannot insert a follow as someone else'
);

-- =============================================================================
-- FOLLOWS: DELETE tests
-- =============================================================================

-- Test 6: User A can delete their own follow
SELECT lives_ok(
  $$DELETE FROM public.follows WHERE follower_id = '33333333-3333-3333-3333-333333333333' AND following_id = '44444444-4444-4444-4444-444444444444'$$,
  'User A can delete their own follow'
);

-- =============================================================================
-- FOLLOWS: CHECK constraint tests (run as superuser to bypass RLS)
-- =============================================================================

-- Test 7: Self-follow prevented by CHECK constraint
SELECT tests.clear_auth();
RESET ROLE;

SELECT throws_ok(
  $$INSERT INTO public.follows (follower_id, following_id) VALUES ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333')$$,
  '23514',
  NULL,
  'Self-follow prevented by CHECK constraint'
);

-- Test 8: Duplicate follow prevented by UNIQUE constraint
SELECT throws_ok(
  $$INSERT INTO public.follows (follower_id, following_id) VALUES ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555')$$,
  '23505',
  NULL,
  'Duplicate follow prevented by UNIQUE constraint'
);

-- =============================================================================
-- SHARE_EVENTS: SELECT tests
-- =============================================================================

-- Test 9: User B can see their own share events
SELECT tests.authenticate_as('44444444-4444-4444-4444-444444444444');

SELECT is(
  (SELECT count(*)::integer FROM public.share_events WHERE user_id = '44444444-4444-4444-4444-444444444444'),
  1,
  'User B can see their own share events'
);

-- Test 10: User A cannot see User B''s share events
SELECT tests.authenticate_as('33333333-3333-3333-3333-333333333333');

SELECT is(
  (SELECT count(*)::integer FROM public.share_events),
  0,
  'User A cannot see another user share events'
);

-- =============================================================================
-- SHARE_EVENTS: INSERT tests
-- =============================================================================

-- Test 11: User A can insert their own share events
SELECT tests.authenticate_as('33333333-3333-3333-3333-333333333333');

SELECT lives_ok(
  $$INSERT INTO public.share_events (user_id, shareable_type, shareable_id, platform) VALUES ('33333333-3333-3333-3333-333333333333', 'producer', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'email')$$,
  'User A can insert their own share events'
);

-- Test 12: User A cannot insert share events for another user
SELECT throws_ok(
  $$INSERT INTO public.share_events (user_id, shareable_type, shareable_id, platform) VALUES ('44444444-4444-4444-4444-444444444444', 'wine', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'twitter')$$,
  '42501',
  NULL,
  'User A cannot insert share events for another user'
);

-- =============================================================================
-- ANONYMOUS ACCESS: verify anon role is denied
-- =============================================================================

SELECT tests.clear_auth();

-- Test 13: Anonymous cannot read follows
SELECT is(
  (SELECT count(*)::integer FROM public.follows),
  0,
  'Anonymous cannot read follows'
);

-- Test 14: Anonymous cannot read share_events
SELECT is(
  (SELECT count(*)::integer FROM public.share_events),
  0,
  'Anonymous cannot read share_events'
);

-- Test 15: Anonymous cannot insert follows
SELECT throws_ok(
  $$INSERT INTO public.follows (follower_id, following_id) VALUES ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444')$$,
  '42501',
  NULL,
  'Anonymous cannot insert follows'
);

-- =============================================================================
-- Cleanup
-- =============================================================================

SELECT * FROM finish();

ROLLBACK;
