-- ============================================================================
-- Migration: 0006_robust_auth_sync_trigger.sql
-- Description: Robust PL/pgSQL trigger function to sync auth.users to public.users on signup/login
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'Candidate'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = CASE
      WHEN EXCLUDED.display_name <> '' AND EXCLUDED.display_name <> 'Candidate'
      THEN EXCLUDED.display_name
      ELSE public.users.display_name
    END,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth users into public.users if missing
INSERT INTO public.users (id, email, display_name, created_at, updated_at)
SELECT 
  id, 
  COALESCE(email, ''), 
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1), 'Candidate'),
  created_at,
  now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;
