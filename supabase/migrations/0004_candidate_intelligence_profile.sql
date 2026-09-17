-- ============================================================================
-- Migration: 0004_candidate_intelligence_profile.sql
-- Description: Candidate Intelligence Profile for long-term session persistence,
--              per-topic strengths, communication metrics, repeated weaknesses,
--              verified resume evidence, and recommended drills.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  per_topic_strengths         JSONB NOT NULL DEFAULT '{}'::jsonb,
  communication_metrics       JSONB NOT NULL DEFAULT '{}'::jsonb,
  repeated_weaknesses         JSONB NOT NULL DEFAULT '[]'::jsonb,
  verified_resume_evidence    JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_drills          JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_sessions_completed    INTEGER NOT NULL DEFAULT 0,
  overall_readiness_score     NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_candidate_profiles_user_id UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON public.candidate_profiles(user_id);

CREATE TRIGGER trg_candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.candidate_profiles IS 'Long-term candidate intelligence profile tracking cross-session mastery, communication telemetry, and weak points';
