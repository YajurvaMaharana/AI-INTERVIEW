-- ============================================================================
-- Migration: 0005_comprehensive_feedback_tables.sql
-- Description: Robust dedicated tables for feedback_rubrics, technical_scores, and star_evaluations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feedback_rubrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  overall_score   NUMERIC(5,2),
  categories      JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths       JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses      JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_rubrics_session_id ON public.feedback_rubrics(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rubrics_user_id ON public.feedback_rubrics(user_id);

CREATE TABLE IF NOT EXISTS public.technical_scores (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id              UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  dimensions              JSONB NOT NULL DEFAULT '[]'::jsonb,
  average_dimension_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_technical_scores_session_id ON public.technical_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_technical_scores_user_id ON public.technical_scores(user_id);

CREATE TABLE IF NOT EXISTS public.star_evaluations (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                    UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_id                       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  components                    JSONB NOT NULL DEFAULT '[]'::jsonb,
  quantitative_metrics_detected BOOLEAN NOT NULL DEFAULT false,
  personal_ownership_score      NUMERIC(5,2) NOT NULL DEFAULT 0,
  self_reflection_score         NUMERIC(5,2) NOT NULL DEFAULT 0,
  missing_structural_gaps       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_star_evaluations_session_id ON public.star_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_star_evaluations_user_id ON public.star_evaluations(user_id);
