-- Migration: Enable pgcrypto extension
-- Required for gen_random_bytes() used in invitation token generation.
-- gen_random_uuid() works without pgcrypto in PG 13+, but gen_random_bytes() does not.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
