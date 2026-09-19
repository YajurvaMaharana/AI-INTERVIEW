-- ============================================================================
-- Migration: 0007_disable_rls_feedback.sql
-- Description: Disable RLS on application tables to ensure smooth AI evaluation persistence
-- ============================================================================

ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interview_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interview_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback_rubrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.technical_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.star_evaluations DISABLE ROW LEVEL SECURITY;
