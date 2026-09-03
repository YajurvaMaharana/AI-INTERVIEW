-- ============================================================================
-- Migration: 0001_initial_schema.sql
-- Description: Initial schema for the AI Interview Practice Platform
-- ============================================================================

-- --------------------------------------------------------------------------
-- Helper: auto-update `updated_at` on row modification
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- --------------------------------------------------------------------------
-- Table: users
-- Extends Supabase Auth's auth.users with public profile data.
-- --------------------------------------------------------------------------
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  display_name TEXT       NOT NULL DEFAULT '',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.users IS 'Public profile data linked 1-to-1 with auth.users';

-- --------------------------------------------------------------------------
-- Table: interview_sessions
-- --------------------------------------------------------------------------
CREATE TABLE public.interview_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  type        TEXT        NOT NULL
    CHECK (type IN ('behavioral', 'technical', 'system_design', 'mixed')),

  role        TEXT        NOT NULL DEFAULT '',

  difficulty  TEXT        NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),

  status      TEXT        NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'cancelled')),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);

CREATE TRIGGER trg_interview_sessions_updated_at
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.interview_sessions
  IS 'Each row represents one interview practice session';

-- --------------------------------------------------------------------------
-- Table: interview_messages
-- --------------------------------------------------------------------------
CREATE TABLE public.interview_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID        NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,

  sender_role     TEXT        NOT NULL
    CHECK (sender_role IN ('user', 'ai')),

  content         TEXT        NOT NULL,
  sequence_order  INTEGER     NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interview_messages_session_id ON public.interview_messages(session_id);

COMMENT ON TABLE public.interview_messages
  IS 'Ordered chat messages within an interview session';

-- --------------------------------------------------------------------------
-- Table: feedback_reports
-- --------------------------------------------------------------------------
CREATE TABLE public.feedback_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID        NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,

  overall_score   NUMERIC(4,2),
  scores          JSONB       NOT NULL DEFAULT '{}'::jsonb,
  summary         TEXT        NOT NULL DEFAULT '',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_reports_session_id ON public.feedback_reports(session_id);

CREATE TRIGGER trg_feedback_reports_updated_at
  BEFORE UPDATE ON public.feedback_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.feedback_reports
  IS 'AI-generated feedback for a completed interview session';

-- ============================================================================
-- OPTIONAL: Row Level Security (RLS)
-- Uncomment the block below to restrict access so authenticated users can
-- only read/write their own data.  Requires Supabase Auth context (JWT).
-- ============================================================================

/*
-- Enable RLS on all public tables
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reports   ENABLE ROW LEVEL SECURITY;

-- users: each user can only access their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- interview_sessions: only the owning user
CREATE POLICY "Users can view own sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- interview_messages: only if user owns the parent session
CREATE POLICY "Users can view own messages"
  ON public.interview_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON public.interview_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- feedback_reports: only if user owns the parent session
CREATE POLICY "Users can view own feedback"
  ON public.feedback_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );
*/
