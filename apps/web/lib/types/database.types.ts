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
// Resume & Grounding types
// ---------------------------------------------------------------------------

export interface ResumeProject {
  name: string;
  role?: string;
  description: string;
  technologies: string[];
  metrics_and_impact: string[];
  github_or_link?: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  duration?: string;
  location?: string;
  responsibilities: string[];
  achievements: string[];
  quantifiable_metrics: string[];
  technologies: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field_of_study?: string;
  graduation_year?: string;
  gpa_or_honors?: string;
}

export interface ResumeSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloud_and_devops: string[];
  tools_and_architecture: string[];
}

export interface ResumeParsedData {
  full_name?: string;
  headline?: string;
  summary?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  skills: ResumeSkills;
  experiences: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications?: string[];
  key_achievements?: string[];
  quantifiable_highlights?: string[];
  grounding_summary?: string;
}

// ---------------------------------------------------------------------------
// Job Description (JD) & Role Calibration types
// ---------------------------------------------------------------------------

export interface JobDescriptionParsedData {
  job_title: string;
  company_name?: string;
  seniority_level: 'Junior' | 'Mid' | 'Senior' | 'Staff/Principal' | 'Lead/Manager' | string;
  required_skills: string[];
  preferred_skills: string[];
  core_responsibilities: string[];
  critical_keywords: string[];
  domain_or_industry?: string;
  evaluation_rubric_focus: string[];
  calibration_summary: string;
}

// ---------------------------------------------------------------------------
// Row types (what you SELECT back from the database)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
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
  resume_data?: ResumeParsedData | null;
  saved_jd_data?: JobDescriptionParsedData | null;
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
  jd_data?: JobDescriptionParsedData | null;
  jd_raw_text?: string | null;
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
  resume_data?: ResumeParsedData | null;
  saved_jd_data?: JobDescriptionParsedData | null;
}

export interface InterviewSessionInsert {
  user_id: string;
  type: InterviewType;
  role?: string;
  difficulty?: Difficulty;
  status?: SessionStatus;
  jd_data?: JobDescriptionParsedData | null;
  jd_raw_text?: string | null;
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
  resume_data?: ResumeParsedData | null;
  saved_jd_data?: JobDescriptionParsedData | null;
}

export interface InterviewSessionUpdate {
  type?: InterviewType;
  role?: string;
  difficulty?: Difficulty;
  status?: SessionStatus;
  jd_data?: JobDescriptionParsedData | null;
  jd_raw_text?: string | null;
}

export interface FeedbackReportUpdate {
  overall_score?: number | null;
  scores?: Record<string, unknown>;
  summary?: string;
}
