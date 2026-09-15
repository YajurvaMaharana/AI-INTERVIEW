-- ============================================================================
-- Migration: 0003_add_user_profile_fields.sql
-- Description: Adds bio and target_role columns to public.users table
-- ============================================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT '';

-- Update trigger function to also handle bio and target_role if provided in raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url, bio, target_role, updated_at)
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
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'target_role', ''),
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
    bio = COALESCE(NULLIF(EXCLUDED.bio, ''), public.users.bio),
    target_role = COALESCE(NULLIF(EXCLUDED.target_role, ''), public.users.target_role),
    updated_at = now();
  RETURN NEW;
END;
$$;
