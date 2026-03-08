-- Migration: Wine-to-Medusa sync webhook trigger
--
-- Uses Supabase Database Webhooks (pg_net extension) to fire an HTTP POST
-- to the wine-sync endpoint whenever a wine row is inserted or updated.
-- This keeps the Medusa commerce catalog in sync with the content catalog.
--
-- NOTE: The actual webhook URL is configured via Supabase Dashboard or
-- supabase_functions.http_request(). The trigger function below sends the
-- full row payload as JSON to the configured endpoint.
--
-- In Supabase hosted, Database Webhooks are configured in the Dashboard
-- under Database → Webhooks rather than via raw SQL triggers. This migration
-- creates the pg_net-based trigger for local development and self-hosted
-- deployments. For Supabase hosted, configure via Dashboard:
--   Table: wines
--   Events: INSERT, UPDATE
--   Type: HTTP Request
--   Method: POST
--   URL: https://<your-domain>/api/webhooks/supabase/wine-sync
--   Headers: x-webhook-secret = <SUPABASE_WEBHOOK_SECRET>

SET search_path TO '';

-- Enable pg_net extension (required for HTTP requests from triggers)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Trigger function: sends wine row to sync endpoint via pg_net
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.notify_wine_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _webhook_url TEXT;
  _webhook_secret TEXT;
  _payload JSONB;
BEGIN
  -- Read config from app settings (set via Supabase Dashboard > Settings > Vault)
  _webhook_url := current_setting('app.wine_sync_webhook_url', true);
  _webhook_secret := current_setting('app.wine_sync_webhook_secret', true);

  -- If webhook URL is not configured, skip silently
  IF _webhook_url IS NULL OR _webhook_url = '' THEN
    RETURN NEW;
  END IF;

  -- Build the webhook payload matching Supabase Database Webhook format
  _payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', to_jsonb(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END
  );

  -- Fire async HTTP POST via pg_net
  PERFORM extensions.http_post(
    url := _webhook_url,
    body := _payload::TEXT,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', COALESCE(_webhook_secret, '')
    )
  );

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Trigger: fires on INSERT or UPDATE of wines
-- ---------------------------------------------------------------------------

CREATE TRIGGER trg_wine_medusa_sync
  AFTER INSERT OR UPDATE ON public.wines
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_wine_sync();

-- ---------------------------------------------------------------------------
-- Comment for documentation
-- ---------------------------------------------------------------------------

COMMENT ON FUNCTION public.notify_wine_sync() IS
  'Sends wine row data to the Medusa sync webhook endpoint via pg_net. '
  'Configure app.wine_sync_webhook_url and app.wine_sync_webhook_secret '
  'in Supabase Vault or postgresql.conf to enable.';
