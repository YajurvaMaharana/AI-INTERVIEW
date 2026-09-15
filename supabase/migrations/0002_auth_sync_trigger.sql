-- ============================================================================
-- Migration: 0002_auth_sync_trigger.sql
-- Description: Automatically synchronizes Supabase Auth users to public.users
-- ============================================================================

-- Function to handle new user insertion and updates from auth.users
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

-- Trigger to execute whenever a user signs up or updates in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure policy allows user profile inserts/upserts if RLS is active
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    -- Allow users to insert their own profile
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can insert own profile'
    ) THEN
      CREATE POLICY "Users can insert own profile"
        ON public.users FOR INSERT
        WITH CHECK (auth.uid() = id);
    END IF;
  END IF;
END $$;
