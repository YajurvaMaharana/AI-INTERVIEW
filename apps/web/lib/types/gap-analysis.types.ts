// ---------------------------------------------------------------------------
// gap-analysis.types.ts — Type definitions for Resume & JD Grounding Gap Analysis
// ---------------------------------------------------------------------------

export type MatchSeverity = 'critical' | 'high' | 'moderate' | 'low';
export type RequirementImportance = 'required' | 'preferred' | 'bonus';

export interface StrongMatchItem {
  id: string;
  skill_or_concept: string;
  category: 'Languages' | 'Frameworks' | 'Architecture & Distributed' | 'Databases & Storage' | 'Cloud & DevOps' | 'Leadership & STAR';
  match_score: number; // 0 - 100
  importance: RequirementImportance;
  candidate_evidence: string; // Direct citation from resume projects, metrics, or roles
  relevance_commentary: string;
}

export interface WeakAreaItem {
  id: string;
  skill_or_concept: string;
  category: 'Scale & Concurrency' | 'Architecture Trade-offs' | 'Specialized Frameworks' | 'System Reliability' | 'Team Ownership';
  current_candidate_level: string; // e.g. "Basic PostgreSQL usage in monolithic app"
  target_jd_expectation: string; // e.g. "Distributed sharding, multi-region replication, and failover tuning"
  gap_description: string;
  severity: MatchSeverity;
  suggested_talking_point: string; // How to frame adjacent experience during the interview
  bridging_strategy: string; // Concrete concepts to mention to demonstrate fast adaptability
}

export interface MissingEvidenceItem {
  id: string;
  skill_or_concept: string;
  category: 'Domain & Protocols' | 'Core Infrastructure' | 'Language Deep-Dive' | 'Production Scale Metrics';
  severity: MatchSeverity;
  potential_risk: string; // Why the interviewer might ding the candidate on this
  predicted_interviewer_trap_question: string; // Realistic technical or system design question the AI will ask
  recommended_preparation_tip: string; // How candidate should answer or steer the conversation
}

export interface GapAnalysisResult {
  overall_fit_score: number; // 0 - 100
  seniority_alignment: 'Strong Fit' | 'Borderline / Stretch' | 'Under-Leveled' | 'Over-Qualified';
  seniority_verdict_notes: string;
  executive_summary: string;
  strong_matches: StrongMatchItem[];
  weak_areas: WeakAreaItem[];
  missing_evidence: MissingEvidenceItem[];
  recommended_focus_areas: string[];
  interview_strategy_brief: string;
  analyzed_at: string;
}
