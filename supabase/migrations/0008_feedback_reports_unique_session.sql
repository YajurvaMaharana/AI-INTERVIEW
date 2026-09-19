-- ============================================================================
-- Migration: 0008_feedback_reports_unique_session.sql
-- Description: Add unique constraint on feedback_reports(session_id) for upsert support
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'feedback_reports_session_id_key'
  ) THEN
    ALTER TABLE public.feedback_reports ADD CONSTRAINT feedback_reports_session_id_key UNIQUE (session_id);
  END IF;
END $$;
