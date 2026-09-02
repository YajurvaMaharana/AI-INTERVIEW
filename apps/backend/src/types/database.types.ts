// ---------------------------------------------------------------------------
// Database types — mirrors the SQL schema in 0001_initial_schema.sql
// ---------------------------------------------------------------------------

/** Allowed interview session types */
export type InterviewType = 'behavioral' | 'technical' | 'system_design' | 'mixed';

/** Allowed difficulty levels */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Allowed session statuses */
export type SessionStatus = 'in_progress' | 'completed' | 'cancelled';

/** Allowed message sender roles */
export type SenderRole = 'user' | 'ai';

// ---------------------------------------------------------------------------
// Row types (what you SELECT back from the database)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  type: InterviewType;
  role: string;
  difficulty: Difficulty;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export interface InterviewMessage {
  id: string;
  session_id: string;
  sender_role: SenderRole;
  content: string;
  sequence_order: number;
  created_at: string;
}

export interface FeedbackReport {
  id: string;
  session_id: string;
  overall_score: number | null;
  scores: Record<string, unknown>;
  summary: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert types (what you provide when creating a new row)
// ---------------------------------------------------------------------------

export interface UserInsert {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string | null;
}

export interface InterviewSessionInsert {
  user_id: string;
  type: InterviewType;
  role?: string;
  difficulty?: Difficulty;
  status?: SessionStatus;
}

export interface InterviewMessageInsert {
  session_id: string;
  sender_role: SenderRole;
  content: string;
  sequence_order: number;
}

export interface FeedbackReportInsert {
  session_id: string;
  overall_score?: number | null;
  scores: Record<string, unknown>;
  summary?: string;
}

// ---------------------------------------------------------------------------
// Update types (all fields optional except the PK which is used as a filter)
// ---------------------------------------------------------------------------

export interface UserUpdate {
  email?: string;
  display_name?: string;
  avatar_url?: string | null;
}

export interface InterviewSessionUpdate {
  type?: InterviewType;
  role?: string;
  difficulty?: Difficulty;
  status?: SessionStatus;
}

export interface FeedbackReportUpdate {
  overall_score?: number | null;
  scores?: Record<string, unknown>;
  summary?: string;
}
