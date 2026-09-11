// ---------------------------------------------------------------------------
// db.service.ts — Supabase client + typed CRUD helpers
// ---------------------------------------------------------------------------

import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  User,
  UserInsert,
  UserUpdate,
  InterviewSession,
  InterviewSessionInsert,
  InterviewSessionUpdate,
  InterviewMessage,
  InterviewMessageInsert,
  FeedbackReport,
  FeedbackReportInsert,
  FeedbackReportUpdate,
} from '../types/database.types';

// ---------------------------------------------------------------------------
// Supabase client initialization & environment validation
// ---------------------------------------------------------------------------

function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

const supabaseUrl = cleanEnv(process.env.SUPABASE_URL);
const supabaseAnonKey = cleanEnv(process.env.SUPABASE_ANON_KEY);
const supabaseServiceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseKey = supabaseAnonKey || supabaseServiceKey;

if (!supabaseUrl) {
  throw new Error(
    '[db.service] Missing required environment variable: SUPABASE_URL must be set in apps/backend/.env.',
  );
}

if (!supabaseKey) {
  throw new Error(
    '[db.service] Missing required environment variable: SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY must be set in apps/backend/.env.',
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export interface HealthCheckResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
}

/**
 * Run a lightweight query (`SELECT 1`) to verify the database is reachable.
 */
export async function checkDatabaseConnection(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    const latencyMs = Date.now() - start;

    if (error) {
      return { ok: false, latencyMs, error: error.message };
    }
    return { ok: true, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, latencyMs, error: message };
  }
}

// ---------------------------------------------------------------------------
// Users CRUD
// ---------------------------------------------------------------------------

export async function createUser(data: UserInsert): Promise<User> {
  const { data: user, error } = await supabase
    .from('users')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`createUser failed: ${error.message}`);
  return user as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data: user, error } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`getUserById failed: ${error.message}`);
  }
  return (user as User) ?? null;
}

export async function updateUser(id: string, data: UserUpdate): Promise<User> {
  const { data: user, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateUser failed: ${error.message}`);
  return user as User;
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw new Error(`deleteUser failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Interview Sessions CRUD
// ---------------------------------------------------------------------------

export async function createSession(data: InterviewSessionInsert): Promise<InterviewSession> {
  const { data: session, error } = await supabase
    .from('interview_sessions')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`createSession failed: ${error.message}`);
  return session as InterviewSession;
}

export async function getSessionById(id: string): Promise<InterviewSession | null> {
  const { data: session, error } = await supabase
    .from('interview_sessions')
    .select()
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`getSessionById failed: ${error.message}`);
  }
  return (session as InterviewSession) ?? null;
}

export async function getSessionsByUserId(userId: string): Promise<InterviewSession[]> {
  const { data: sessions, error } = await supabase
    .from('interview_sessions')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getSessionsByUserId failed: ${error.message}`);
  return (sessions as InterviewSession[]) ?? [];
}

export async function updateSession(
  id: string,
  data: InterviewSessionUpdate,
): Promise<InterviewSession> {
  const { data: session, error } = await supabase
    .from('interview_sessions')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateSession failed: ${error.message}`);
  return session as InterviewSession;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from('interview_sessions').delete().eq('id', id);
  if (error) throw new Error(`deleteSession failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Interview Messages CRUD
// ---------------------------------------------------------------------------

export async function createMessage(data: InterviewMessageInsert): Promise<InterviewMessage> {
  const { data: message, error } = await supabase
    .from('interview_messages')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`createMessage failed: ${error.message}`);
  return message as InterviewMessage;
}

export async function getMessagesBySessionId(sessionId: string): Promise<InterviewMessage[]> {
  const { data: messages, error } = await supabase
    .from('interview_messages')
    .select()
    .eq('session_id', sessionId)
    .order('sequence_order', { ascending: true });

  if (error) throw new Error(`getMessagesBySessionId failed: ${error.message}`);
  return (messages as InterviewMessage[]) ?? [];
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase.from('interview_messages').delete().eq('id', id);
  if (error) throw new Error(`deleteMessage failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Feedback Reports CRUD
// ---------------------------------------------------------------------------

export async function createFeedbackReport(data: FeedbackReportInsert): Promise<FeedbackReport> {
  const { data: report, error } = await supabase
    .from('feedback_reports')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`createFeedbackReport failed: ${error.message}`);
  return report as FeedbackReport;
}

export async function getFeedbackBySessionId(sessionId: string): Promise<FeedbackReport | null> {
  const { data: report, error } = await supabase
    .from('feedback_reports')
    .select()
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`getFeedbackBySessionId failed: ${error.message}`);
  }
  return (report as FeedbackReport) ?? null;
}

export async function updateFeedbackReport(
  id: string,
  data: FeedbackReportUpdate,
): Promise<FeedbackReport> {
  const { data: report, error } = await supabase
    .from('feedback_reports')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateFeedbackReport failed: ${error.message}`);
  return report as FeedbackReport;
}

export async function deleteFeedbackReport(id: string): Promise<void> {
  const { error } = await supabase.from('feedback_reports').delete().eq('id', id);
  if (error) throw new Error(`deleteFeedbackReport failed: ${error.message}`);
}
