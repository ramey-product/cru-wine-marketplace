-- Fix handle_new_user() to use NULL instead of empty strings
-- for optional fields (display_name, avatar_url, full_name)
--
-- HIGH-01: Previously, COALESCE fallback to '' wrote empty strings,
-- which is semantically incorrect (NULL = "not set", '' = "explicitly blank").

SET search_path TO 'public', 'extensions';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'display_name', ''), ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
