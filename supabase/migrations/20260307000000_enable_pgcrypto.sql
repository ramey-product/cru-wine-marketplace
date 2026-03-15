-- Migration: Enable pgcrypto extension
-- Required for gen_random_bytes() used in invitation token generation.
-- gen_random_uuid() is built-in to PG 13+, but gen_random_bytes() requires pgcrypto.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
