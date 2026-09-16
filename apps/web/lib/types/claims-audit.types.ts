// ---------------------------------------------------------------------------
// claims-audit.types.ts — Data definitions for Resume Claim & Metric Auditing
// ---------------------------------------------------------------------------

export type ClaimCategoryType =
  | 'metric_and_scale'
  | 'architectural_decision'
  | 'latency_and_performance'
  | 'ownership_and_leadership'
  | 'reliability_and_incident';

export interface ResumeClaimAuditItem {
  id: string;
  claim_type: ClaimCategoryType;
  claim_category_label: string;
  original_statement: string;
  context_source: string; // e.g. "Distributed Event Streaming Hub (Project)" or "TechFlow Systems"
  interviewer_probe_angle: string;
  key_tradeoffs_to_defend: string[];
  evidence_verification_focus: string;
  recommended_star_defense: string;
  verification_difficulty: 'high' | 'medium' | 'low';
}

export interface ResumeClaimsAuditResult {
  candidate_headline: string;
  total_claims_identified: number;
  audited_claims: ResumeClaimAuditItem[];
  high_impact_probes_summary: string;
  audited_at: string;
}
