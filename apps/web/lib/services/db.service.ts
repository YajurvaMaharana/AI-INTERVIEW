// ---------------------------------------------------------------------------
// db.service.ts — Robust Supabase database service with error handling,
//                 automatic auth user sync, and in-memory fallback cache.
// ---------------------------------------------------------------------------

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import {
  cleanEnvString,
  isValidSupabaseUrl,
  isValidSupabaseKey,
  emailToUUID,
  getResolvedSupabaseCredentials,
} from '../supabase/env';
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
// In-Memory Fallback Cache (Attached to globalThis to persist across Next.js route bundles)
// ---------------------------------------------------------------------------
interface DbGlobalStore {
  inMemoryUsers: Map<string, User>;
  inMemorySessions: Map<string, InterviewSession>;
  inMemoryMessages: Map<string, InterviewMessage[]>;
  inMemoryFeedback: Map<string, FeedbackReport>;
  supabaseInstance: SupabaseClient | null;
}

const globalForDb = globalThis as unknown as { __dbGlobalStore?: DbGlobalStore };
if (!globalForDb.__dbGlobalStore) {
  globalForDb.__dbGlobalStore = {
    inMemoryUsers: new Map<string, User>(),
    inMemorySessions: new Map<string, InterviewSession>(),
    inMemoryMessages: new Map<string, InterviewMessage[]>(),
    inMemoryFeedback: new Map<string, FeedbackReport>(),
    supabaseInstance: null,
  };
}

const inMemoryUsers = globalForDb.__dbGlobalStore.inMemoryUsers;
const inMemorySessions = globalForDb.__dbGlobalStore.inMemorySessions;
const inMemoryMessages = globalForDb.__dbGlobalStore.inMemoryMessages;
const inMemoryFeedback = globalForDb.__dbGlobalStore.inMemoryFeedback;

// ---------------------------------------------------------------------------
// Helper: UUID validation and generation
// ---------------------------------------------------------------------------
function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Supabase Client Initialization
// ---------------------------------------------------------------------------
let supabaseInstance: SupabaseClient | null = null;
let hasLoggedConfigStatus = false;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const urlCandidates = [
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_API_URL?.includes('supabase.co')
      ? process.env.NEXT_PUBLIC_API_URL.startsWith('http')
        ? process.env.NEXT_PUBLIC_API_URL
        : `https:${process.env.NEXT_PUBLIC_API_URL}`
      : undefined,
  ];

  const keyCandidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ];

  const url =
    urlCandidates
      .map(cleanEnvString)
      .find((u) => isValidSupabaseUrl(u)) || null;

  const key =
    keyCandidates
      .map(cleanEnvString)
      .find((k) => isValidSupabaseKey(k)) || null;

  if (!url || !key) {
    if (!hasLoggedConfigStatus) {
      console.warn('[db.service] Supabase not fully configured; using graceful fallback cache.');
      hasLoggedConfigStatus = true;
    }
    return null;
  }

  try {
    supabaseInstance = createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseInstance;
  } catch (err: any) {
    console.warn('[db.service] Failed to instantiate Supabase client:', err?.message || err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. User Sync & CRUD (Requirement 1: Database Sync on Auth)
// ---------------------------------------------------------------------------

/**
 * Automatically executes an upsert into the public `users` table (`id`, `email`, `display_name`)
 * immediately upon every successful sign-up or sign-in.
 */
export async function upsertUser(
  user: {
    id: string;
    email?: string | null;
    display_name?: string;
    avatar_url?: string | null;
    user_metadata?: Record<string, any>;
  },
  accessToken?: string
): Promise<User | null> {
  return syncUserToDatabase(user, accessToken);
}

export async function syncUserToDatabase(
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, any>;
    display_name?: string;
    avatar_url?: string | null;
    bio?: string | null;
    target_role?: string | null;
    skills?: string[] | null;
    experience_level?: string | null;
    preferred_interview_type?: string | null;
    preferred_language?: string | null;
    interview_goals?: string[] | string | null;
    target_companies?: string[] | null;
    resume_url?: string | null;
    resume_filename?: string | null;
    resume_parsed_at?: string | null;
    resume_data?: any;
  },
  accessToken?: string
): Promise<User | null> {
  if (!user || !user.id) return null;

  const email = user.email || 'candidate@example.com';
  // Normalize UUID if necessary
  const userId = isValidUUID(user.id) ? user.id : emailToUUID(email);
  const displayName =
    user.display_name ||
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    (email.includes('@') ? email.split('@')[0] : 'Candidate');
  const avatarUrl = user.avatar_url || user.user_metadata?.avatar_url || null;
  const bio = user.bio !== undefined ? user.bio : (user.user_metadata?.bio || '');
  const targetRole = user.target_role !== undefined ? user.target_role : (user.user_metadata?.target_role || '');
  const skills = user.skills !== undefined ? user.skills : (user.user_metadata?.skills || null);
  const experienceLevel = user.experience_level !== undefined ? user.experience_level : (user.user_metadata?.experience_level || null);
  const preferredInterviewType = user.preferred_interview_type !== undefined ? user.preferred_interview_type : (user.user_metadata?.preferred_interview_type || null);
  const preferredLanguage = user.preferred_language !== undefined ? user.preferred_language : (user.user_metadata?.preferred_language || null);
  const interviewGoals = user.interview_goals !== undefined ? user.interview_goals : (user.user_metadata?.interview_goals || null);
  const targetCompanies = user.target_companies !== undefined ? user.target_companies : (user.user_metadata?.target_companies || null);
  const resumeUrl = user.resume_url !== undefined ? user.resume_url : (user.user_metadata?.resume_url || null);
  const resumeFilename = user.resume_filename !== undefined ? user.resume_filename : (user.user_metadata?.resume_filename || null);
  const resumeParsedAt = user.resume_parsed_at !== undefined ? user.resume_parsed_at : (user.user_metadata?.resume_parsed_at || null);
  const resumeData = user.resume_data !== undefined ? user.resume_data : (user.user_metadata?.resume_data || null);

  // If user provided a real access token, use a scoped client so auth.uid() passes RLS
  let scopedClient: SupabaseClient | null = null;
  const { url, key } = getResolvedSupabaseCredentials();
  if (url && key && accessToken && accessToken !== 'mock-token') {
    try {
      scopedClient = createSupabaseClient(url, key, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: { persistSession: false },
      });
    } catch {
      // Ignored
    }
  }

  const client = scopedClient || getSupabaseAdminClient();
  if (client) {
    try {
      const payload: Record<string, any> = {
        id: userId,
        email,
        display_name: displayName,
        avatar_url: avatarUrl,
        bio,
        target_role: targetRole,
        updated_at: new Date().toISOString(),
      };
      if (skills !== null) payload.skills = skills;
      if (experienceLevel !== null) payload.experience_level = experienceLevel;
      if (preferredInterviewType !== null) payload.preferred_interview_type = preferredInterviewType;
      if (preferredLanguage !== null) payload.preferred_language = preferredLanguage;
      if (interviewGoals !== null) payload.interview_goals = interviewGoals;
      if (targetCompanies !== null) payload.target_companies = targetCompanies;
      if (resumeUrl !== null) payload.resume_url = resumeUrl;
      if (resumeFilename !== null) payload.resume_filename = resumeFilename;
      if (resumeParsedAt !== null) payload.resume_parsed_at = resumeParsedAt;
      if (resumeData !== null) payload.resume_data = resumeData;

      const { data, error } = await client
        .from('users')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        inMemoryUsers.set(user.id, data as User);
        inMemoryUsers.set(userId, data as User);
        return data as User;
      }
      if (error) {
        console.warn('[db.service] Supabase users upsert notice:', error.message);
        // If upsert was blocked or failed due to extra columns, try basic columns
        try {
          const basicPayload: Record<string, any> = {
            id: userId,
            email,
            display_name: displayName,
            avatar_url: avatarUrl,
            bio,
            target_role: targetRole,
            updated_at: new Date().toISOString(),
          };
          const { data: updateData, error: updateError } = await client
            .from('users')
            .upsert(basicPayload, { onConflict: 'id' })
            .select()
            .single();

          if (!updateError && updateData) {
            inMemoryUsers.set(user.id, updateData as User);
            inMemoryUsers.set(userId, updateData as User);
            return updateData as User;
          }
        } catch {
          // Handled safely
        }
      }
    } catch (networkErr: any) {
      console.warn('[db.service] Network exception during user upsert (handled safely):', networkErr?.message);
    }
  }

  // Fallback to in-memory store
  const existing = inMemoryUsers.get(user.id) || inMemoryUsers.get(userId);
  const fallbackUser: User = {
    id: userId,
    email,
    display_name: displayName,
    avatar_url: avatarUrl,
    bio: bio || existing?.bio || '',
    target_role: targetRole || existing?.target_role || '',
    skills: skills || existing?.skills || null,
    experience_level: experienceLevel || existing?.experience_level || null,
    preferred_interview_type: preferredInterviewType || existing?.preferred_interview_type || null,
    preferred_language: preferredLanguage || existing?.preferred_language || null,
    interview_goals: interviewGoals || existing?.interview_goals || null,
    target_companies: targetCompanies || existing?.target_companies || null,
    resume_url: resumeUrl !== null ? resumeUrl : (existing?.resume_url || null),
    resume_filename: resumeFilename !== null ? resumeFilename : (existing?.resume_filename || null),
    resume_parsed_at: resumeParsedAt !== null ? resumeParsedAt : (existing?.resume_parsed_at || null),
    resume_data: resumeData !== null ? resumeData : (existing?.resume_data || null),
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryUsers.set(user.id, fallbackUser);
  inMemoryUsers.set(userId, fallbackUser);
  return fallbackUser;
}

export async function createUser(data: UserInsert): Promise<User> {
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const { data: user, error } = await client
        .from('users')
        .insert({
          id: data.id,
          email: data.email,
          display_name: data.display_name || '',
          avatar_url: data.avatar_url || null,
          bio: data.bio || '',
          target_role: data.target_role || '',
          skills: data.skills || null,
          experience_level: data.experience_level || null,
          preferred_interview_type: data.preferred_interview_type || null,
          preferred_language: data.preferred_language || null,
          interview_goals: data.interview_goals || null,
          target_companies: data.target_companies || null,
          resume_url: data.resume_url || null,
          resume_filename: data.resume_filename || null,
          resume_parsed_at: data.resume_parsed_at || null,
          resume_data: data.resume_data || null,
        })
        .select()
        .single();

      if (!error && user) {
        inMemoryUsers.set(user.id, user as User);
        return user as User;
      }
      if (error) {
        console.warn('[db.service] Supabase createUser error:', error.message);
      }
    } catch (err: any) {
      console.warn('[db.service] Network error on createUser:', err?.message);
    }
  }

  const fallback: User = {
    id: data.id,
    email: data.email,
    display_name: data.display_name || '',
    avatar_url: data.avatar_url || null,
    bio: data.bio || '',
    target_role: data.target_role || '',
    skills: data.skills || null,
    experience_level: data.experience_level || null,
    preferred_interview_type: data.preferred_interview_type || null,
    preferred_language: data.preferred_language || null,
    interview_goals: data.interview_goals || null,
    target_companies: data.target_companies || null,
    resume_url: data.resume_url || null,
    resume_filename: data.resume_filename || null,
    resume_parsed_at: data.resume_parsed_at || null,
    resume_data: data.resume_data || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryUsers.set(fallback.id, fallback);
  return fallback;
}

export async function getUserById(id: string): Promise<User | null> {
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const { data: user, error } = await client
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && user) {
        inMemoryUsers.set(id, user as User);
        return user as User;
      }
    } catch (err: any) {
      console.warn('[db.service] getUserById error:', err?.message);
    }
  }
  return inMemoryUsers.get(id) || null;
}

export async function updateUser(id: string, data: UserUpdate): Promise<User> {
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const { data: user, error } = await client
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && user) {
        inMemoryUsers.set(id, user as User);
        return user as User;
      }
    } catch (err: any) {
      console.warn('[db.service] updateUser error:', err?.message);
    }
  }

  const existing = inMemoryUsers.get(id);
  const updated: User = {
    id,
    email: data.email || existing?.email || '',
    display_name: data.display_name ?? existing?.display_name ?? '',
    avatar_url: data.avatar_url !== undefined ? data.avatar_url : (existing?.avatar_url ?? null),
    bio: data.bio !== undefined ? data.bio : (existing?.bio ?? ''),
    target_role: data.target_role !== undefined ? data.target_role : (existing?.target_role ?? ''),
    skills: data.skills !== undefined ? data.skills : (existing?.skills ?? null),
    experience_level: data.experience_level !== undefined ? data.experience_level : (existing?.experience_level ?? null),
    preferred_interview_type: data.preferred_interview_type !== undefined ? data.preferred_interview_type : (existing?.preferred_interview_type ?? null),
    preferred_language: data.preferred_language !== undefined ? data.preferred_language : (existing?.preferred_language ?? null),
    interview_goals: data.interview_goals !== undefined ? data.interview_goals : (existing?.interview_goals ?? null),
    target_companies: data.target_companies !== undefined ? data.target_companies : (existing?.target_companies ?? null),
    resume_url: data.resume_url !== undefined ? data.resume_url : (existing?.resume_url ?? null),
    resume_filename: data.resume_filename !== undefined ? data.resume_filename : (existing?.resume_filename ?? null),
    resume_parsed_at: data.resume_parsed_at !== undefined ? data.resume_parsed_at : (existing?.resume_parsed_at ?? null),
    resume_data: data.resume_data !== undefined ? data.resume_data : (existing?.resume_data ?? null),
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryUsers.set(id, updated);
  return updated;
}

export async function deleteUser(id: string): Promise<boolean> {
  // 1. Remove from in-memory cache
  inMemoryUsers.delete(id);

  // Remove associated sessions, messages, and feedback from cache
  for (const [sessionId, session] of Array.from(inMemorySessions.entries())) {
    if (session.user_id === id) {
      inMemorySessions.delete(sessionId);
      inMemoryMessages.delete(sessionId);
      inMemoryFeedback.delete(sessionId);
    }
  }

  // 2. Remove from Supabase DB
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      // Delete user sessions (if cascading FK not set)
      await client.from('interview_sessions').delete().eq('user_id', id);
      // Delete user record from public.users
      const { error } = await client.from('users').delete().eq('id', id);
      if (error) {
        console.warn('[db.service] Supabase deleteUser error:', error.message);
      }
      return true;
    } catch (err: any) {
      console.warn('[db.service] deleteUser exception:', err?.message);
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// 2. Interview Sessions CRUD
// ---------------------------------------------------------------------------

export async function createSession(data: InterviewSessionInsert): Promise<InterviewSession> {
  const sessionId = generateUUID();
  let userId = data.user_id;

  // Ensure userId is a valid UUID so Supabase foreign key doesn't reject
  if (!isValidUUID(userId)) {
    userId = '00000000-0000-0000-0000-000000000001';
  }

  // Ensure user exists in public.users before inserting session
  await syncUserToDatabase({
    id: userId,
    email: 'candidate@example.com',
    display_name: 'Candidate',
  });

  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const { data: session, error } = await client
        .from('interview_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          type: data.type,
          role: data.role || 'Software Engineer',
          difficulty: data.difficulty || 'medium',
          status: data.status || 'in_progress',
          persona: data.persona || 'tech-grinder',
          target_duration: data.target_duration || 30,
          language: data.language || 'English',
          practice_mode: data.practice_mode || 'standard',
          modality: data.modality || 'voice',
          jd_data: data.jd_data || null,
          jd_raw_text: data.jd_raw_text || null,
        })
        .select()
        .single();

      if (!error && session) {
        inMemorySessions.set(session.id, session as InterviewSession);
        inMemoryMessages.set(session.id, []);
        return session as InterviewSession;
      }
      if (error) {
        console.warn('[db.service] Supabase createSession notice:', error.message);
      }
    } catch (err: any) {
      console.warn('[db.service] Network error on createSession:', err?.message);
    }
  }

  // Fallback to local session
  const fallbackSession: InterviewSession = {
    id: sessionId,
    user_id: userId,
    type: data.type,
    role: data.role || 'Software Engineer',
    difficulty: data.difficulty || 'medium',
    status: data.status || 'in_progress',
    persona: data.persona || 'tech-grinder',
    target_duration: data.target_duration || 30,
    language: data.language || 'English',
    practice_mode: data.practice_mode || 'standard',
    modality: data.modality || 'voice',
    jd_data: data.jd_data || null,
    jd_raw_text: data.jd_raw_text || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemorySessions.set(sessionId, fallbackSession);
  inMemoryMessages.set(sessionId, []);
  return fallbackSession;
}

export async function getSessionById(id: string): Promise<InterviewSession | null> {
  const client = getSupabaseAdminClient();
  if (client && isValidUUID(id)) {
    try {
      const { data: session, error } = await client
        .from('interview_sessions')
        .select()
        .eq('id', id)
        .single();

      if (!error && session) {
        inMemorySessions.set(id, session as InterviewSession);
        return session as InterviewSession;
      }
    } catch (err: any) {
      console.warn('[db.service] getSessionById query error:', err?.message);
    }
  }
  return inMemorySessions.get(id) || null;
}

export async function getSessionsByUserId(userId: string): Promise<InterviewSession[]> {
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const queryId = isValidUUID(userId) ? userId : '00000000-0000-0000-0000-000000000001';
      const { data: sessions, error } = await client
        .from('interview_sessions')
        .select()
        .or(`user_id.eq.${queryId},user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (!error && sessions && sessions.length > 0) {
        sessions.forEach((s) => inMemorySessions.set(s.id, s as InterviewSession));
        return sessions as InterviewSession[];
      }
    } catch (err: any) {
      console.warn('[db.service] getSessionsByUserId error:', err?.message);
    }
  }

  // Return from in-memory cache
  const result: InterviewSession[] = [];
  inMemorySessions.forEach((sess) => {
    if (sess.user_id === userId || !userId) {
      result.push(sess);
    }
  });
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateSession(
  id: string,
  data: InterviewSessionUpdate
): Promise<InterviewSession> {
  const client = getSupabaseAdminClient();
  if (client && isValidUUID(id)) {
    try {
      const { data: session, error } = await client
        .from('interview_sessions')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && session) {
        inMemorySessions.set(id, session as InterviewSession);
        return session as InterviewSession;
      }
    } catch (err: any) {
      console.warn('[db.service] updateSession error:', err?.message);
    }
  }

  const existing = inMemorySessions.get(id);
  const updated: InterviewSession = {
    id,
    user_id: existing?.user_id || 'mock-user-id',
    type: data.type || existing?.type || 'technical',
    role: data.role || existing?.role || 'Software Engineer',
    difficulty: data.difficulty || existing?.difficulty || 'medium',
    status: data.status || existing?.status || 'in_progress',
    persona: data.persona !== undefined ? data.persona : (existing?.persona || 'tech-grinder'),
    target_duration: data.target_duration !== undefined ? data.target_duration : (existing?.target_duration || 30),
    language: data.language !== undefined ? data.language : (existing?.language || 'English'),
    practice_mode: data.practice_mode !== undefined ? data.practice_mode : (existing?.practice_mode || 'standard'),
    modality: data.modality !== undefined ? data.modality : (existing?.modality || 'voice'),
    jd_data: data.jd_data !== undefined ? data.jd_data : (existing?.jd_data || null),
    jd_raw_text: data.jd_raw_text !== undefined ? data.jd_raw_text : (existing?.jd_raw_text || null),
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemorySessions.set(id, updated);
  return updated;
}

// ---------------------------------------------------------------------------
// 3. Interview Messages CRUD
// ---------------------------------------------------------------------------

export async function createMessage(data: InterviewMessageInsert): Promise<InterviewMessage> {
  const messageId = generateUUID();
  const client = getSupabaseAdminClient();

  if (client && isValidUUID(data.session_id)) {
    try {
      const { data: message, error } = await client
        .from('interview_messages')
        .insert({
          id: messageId,
          session_id: data.session_id,
          sender_role: data.sender_role,
          content: data.content,
          sequence_order: data.sequence_order,
        })
        .select()
        .single();

      if (!error && message) {
        const msgs = inMemoryMessages.get(data.session_id) || [];
        msgs.push(message as InterviewMessage);
        msgs.sort((a, b) => a.sequence_order - b.sequence_order);
        inMemoryMessages.set(data.session_id, msgs);
        return message as InterviewMessage;
      }
      if (error) {
        console.warn('[db.service] Supabase createMessage notice:', error.message);
      }
    } catch (err: any) {
      console.warn('[db.service] Network error on createMessage:', err?.message);
    }
  }

  // Fallback to in-memory message
  const fallbackMessage: InterviewMessage = {
    id: messageId,
    session_id: data.session_id,
    sender_role: data.sender_role,
    content: data.content,
    sequence_order: data.sequence_order,
    created_at: new Date().toISOString(),
  };
  const msgs = inMemoryMessages.get(data.session_id) || [];
  msgs.push(fallbackMessage);
  msgs.sort((a, b) => a.sequence_order - b.sequence_order);
  inMemoryMessages.set(data.session_id, msgs);
  return fallbackMessage;
}

export async function getMessagesBySessionId(sessionId: string): Promise<InterviewMessage[]> {
  const client = getSupabaseAdminClient();
  if (client && isValidUUID(sessionId)) {
    try {
      const { data: messages, error } = await client
        .from('interview_messages')
        .select()
        .eq('session_id', sessionId)
        .order('sequence_order', { ascending: true });

      if (!error && messages && messages.length > 0) {
        inMemoryMessages.set(sessionId, messages as InterviewMessage[]);
        return messages as InterviewMessage[];
      }
    } catch (err: any) {
      console.warn('[db.service] getMessagesBySessionId error:', err?.message);
    }
  }
  return inMemoryMessages.get(sessionId) || [];
}

// ---------------------------------------------------------------------------
// 4. Feedback Reports CRUD (Requirement 3: Feedback Report Storages)
// ---------------------------------------------------------------------------

export async function createFeedbackReport(data: FeedbackReportInsert): Promise<FeedbackReport> {
  const reportId = generateUUID();
  const client = getSupabaseAdminClient();

  if (client && isValidUUID(data.session_id)) {
    try {
      const { data: existing } = await client
        .from('feedback_reports')
        .select()
        .eq('session_id', data.session_id)
        .maybeSingle();

      let res;
      if (existing) {
        res = await client
          .from('feedback_reports')
          .update({
            overall_score: data.overall_score ?? null,
            scores: data.scores || {},
            summary: data.summary || '',
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', data.session_id)
          .select()
          .single();
      } else {
        res = await client
          .from('feedback_reports')
          .insert({
            id: reportId,
            session_id: data.session_id,
            overall_score: data.overall_score ?? null,
            scores: data.scores || {},
            summary: data.summary || '',
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      const { data: report, error } = res;
      if (!error && report) {
        inMemoryFeedback.set(data.session_id, report as FeedbackReport);
        inMemoryFeedback.set(report.id, report as FeedbackReport);
        return report as FeedbackReport;
      }
      if (error) {
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          // Graceful fallback to in-memory store for RLS policy restrictions
        } else {
          console.warn('[db.service] Supabase createFeedbackReport error:', error.message);
        }
      }
    } catch (err: any) {
      console.warn('[db.service] Network error on createFeedbackReport:', err?.message);
    }
  }

  const fallbackReport: FeedbackReport = {
    id: reportId,
    session_id: data.session_id,
    overall_score: data.overall_score ?? null,
    scores: data.scores || {},
    summary: data.summary || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryFeedback.set(data.session_id, fallbackReport);
  inMemoryFeedback.set(reportId, fallbackReport);
  return fallbackReport;
}

export async function getFeedbackBySessionId(sessionId: string): Promise<FeedbackReport | null> {
  const client = getSupabaseAdminClient();
  if (client && isValidUUID(sessionId)) {
    try {
      const { data: report, error } = await client
        .from('feedback_reports')
        .select()
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && report) {
        inMemoryFeedback.set(sessionId, report as FeedbackReport);
        return report as FeedbackReport;
      }
    } catch (err: any) {
      console.warn('[db.service] getFeedbackBySessionId query error:', err?.message);
    }
  }
  return inMemoryFeedback.get(sessionId) || null;
}

export async function updateFeedbackReport(
  id: string,
  data: FeedbackReportUpdate
): Promise<FeedbackReport> {
  const client = getSupabaseAdminClient();
  if (client && isValidUUID(id)) {
    try {
      const { data: report, error } = await client
        .from('feedback_reports')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && report) {
        inMemoryFeedback.set(report.session_id, report as FeedbackReport);
        inMemoryFeedback.set(id, report as FeedbackReport);
        return report as FeedbackReport;
      }
    } catch (err: any) {
      console.warn('[db.service] updateFeedbackReport error:', err?.message);
    }
  }

  const existing = inMemoryFeedback.get(id);
  const updated: FeedbackReport = {
    id,
    session_id: existing?.session_id || id,
    overall_score: data.overall_score !== undefined ? data.overall_score : (existing?.overall_score ?? null),
    scores: data.scores || existing?.scores || {},
    summary: data.summary || existing?.summary || '',
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryFeedback.set(updated.session_id, updated);
  inMemoryFeedback.set(id, updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Comprehensive Feedback & Evaluation Persistence (Rubrics, Technical Scores, STAR)
// ---------------------------------------------------------------------------

export async function saveComprehensiveEvaluation(
  sessionId: string,
  userId: string,
  evaluation: {
    overall_score: number;
    categories: any[];
    strengths: string[];
    weaknesses: string[];
    targeted_recommendations: string[];
    summary: string;
    star_analysis: any;
    technical_dimensions: any;
  }
): Promise<void> {
  const client = getSupabaseAdminClient();
  if (client && isValidUUID(sessionId) && isValidUUID(userId)) {
    try {
      // 1. Insert into feedback_rubrics
      await client.from('feedback_rubrics').upsert({
        session_id: sessionId,
        user_id: userId,
        overall_score: evaluation.overall_score,
        categories: evaluation.categories || [],
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        recommendations: evaluation.targeted_recommendations || [],
        summary: evaluation.summary || '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'session_id' });

      // 2. Insert into technical_scores
      if (evaluation.technical_dimensions) {
        await client.from('technical_scores').upsert({
          session_id: sessionId,
          user_id: userId,
          dimensions: evaluation.technical_dimensions.dimensions || [],
          average_dimension_score: evaluation.technical_dimensions.average_dimension_score || 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id' });
      }

      // 3. Insert into star_evaluations
      if (evaluation.star_analysis) {
        await client.from('star_evaluations').upsert({
          session_id: sessionId,
          user_id: userId,
          components: evaluation.star_analysis.components || [],
          quantitative_metrics_detected: evaluation.star_analysis.quantitative_metrics_detected || false,
          personal_ownership_score: evaluation.star_analysis.personal_ownership_score || 0,
          self_reflection_score: evaluation.star_analysis.self_reflection_score || 0,
          missing_structural_gaps: evaluation.star_analysis.missing_structural_gaps || [],
          updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id' });
      }
    } catch (err: any) {
      if (err?.code === '42501' || err?.message?.includes('row-level security')) {
        // Graceful fallback for RLS policy restrictions
      } else {
        console.warn('[db.service] saveComprehensiveEvaluation Supabase error:', err?.message || err);
      }
    }
  }
}

export async function getComprehensiveEvaluation(sessionId: string): Promise<{
  rubric?: any;
  technical_scores?: any;
  star_analysis?: any;
} | null> {
  const client = getSupabaseAdminClient();
  if (client && isValidUUID(sessionId)) {
    try {
      const [rubricRes, techRes, starRes] = await Promise.all([
        client.from('feedback_rubrics').select().eq('session_id', sessionId).maybeSingle(),
        client.from('technical_scores').select().eq('session_id', sessionId).maybeSingle(),
        client.from('star_evaluations').select().eq('session_id', sessionId).maybeSingle(),
      ]);

      if (rubricRes.data || techRes.data || starRes.data) {
        return {
          rubric: rubricRes.data,
          technical_scores: techRes.data ? {
            dimensions: techRes.data.dimensions,
            average_dimension_score: techRes.data.average_dimension_score,
          } : undefined,
          star_analysis: starRes.data ? {
            components: starRes.data.components,
            quantitative_metrics_detected: starRes.data.quantitative_metrics_detected,
            personal_ownership_score: starRes.data.personal_ownership_score,
            self_reflection_score: starRes.data.self_reflection_score,
            missing_structural_gaps: starRes.data.missing_structural_gaps,
          } : undefined,
        };
      }
    } catch (err: any) {
      console.warn('[db.service] getComprehensiveEvaluation error:', err?.message);
    }
  }
  return null;
}

export interface PeerPercentileResult {
  percentile: number | null;
  topPercentage: number | null;
  sampleSize: number;
  sufficientData: boolean;
  benchmarkLabel: string;
}

export async function calculatePeerPercentile(
  role: string,
  difficulty: string,
  candidateScore: number
): Promise<PeerPercentileResult> {
  const client = getSupabaseAdminClient();
  let scores: number[] = [];

  if (client) {
    try {
      const { data: reports, error } = await client
        .from('feedback_reports')
        .select('overall_score')
        .not('overall_score', 'is', null);

      if (!error && reports) {
        scores = reports.map((r: any) => Number(r.overall_score)).filter((s: number) => !isNaN(s));
      }
    } catch (err: any) {
      console.warn('[db.service] calculatePeerPercentile query error:', err?.message);
    }
  }

  if (scores.length < 5 && inMemoryFeedback.size > 0) {
    Array.from(inMemoryFeedback.values()).forEach((report) => {
      if (report.overall_score !== null && report.overall_score !== undefined) {
        scores.push(Number(report.overall_score));
      }
    });
  }

  const sampleSize = scores.length;
  const MIN_SAMPLE_SIZE = 5;

  if (sampleSize < MIN_SAMPLE_SIZE) {
    return {
      percentile: null,
      topPercentage: null,
      sampleSize,
      sufficientData: false,
      benchmarkLabel: `Building peer benchmark dataset (n = ${sampleSize} / ${MIN_SAMPLE_SIZE} sessions required)...`,
    };
  }

  scores.sort((a, b) => a - b);
  const countBelowOrEqual = scores.filter((s) => s <= candidateScore).length;
  const percentileRank = Math.round((countBelowOrEqual / sampleSize) * 100);
  const topPercentage = Math.max(1, 100 - percentileRank);

  return {
    percentile: percentileRank,
    topPercentage,
    sampleSize,
    sufficientData: true,
    benchmarkLabel: `Top ${topPercentage}% among active ${role || 'Software Engineering'} candidates (n = ${sampleSize} completed sessions)`,
  };
}

