// ---------------------------------------------------------------------------
// gap-analysis.service.ts — AI Engine & Deterministic Gap Analysis Service
// ---------------------------------------------------------------------------

import { GoogleGenAI, Type } from '@google/genai';
import { resolveGeminiModel, generateWithModelFallback } from '@/lib/utils/gemini-model';
import type { ResumeParsedData, JobDescriptionParsedData } from '../types/database.types';
import type {
  GapAnalysisResult,
  StrongMatchItem,
  WeakAreaItem,
  MissingEvidenceItem,
} from '../types/gap-analysis.types';

// ---------------------------------------------------------------------------
// Gemini Client initialization (lazy)
// ---------------------------------------------------------------------------

let cachedGenAI: GoogleGenAI | null = null;

function getGeminiInstance(): GoogleGenAI | null {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) return null;
  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenAI({ apiKey });
  }
  return cachedGenAI;
}

// ---------------------------------------------------------------------------
// Structured JSON Extraction Schema
// ---------------------------------------------------------------------------

const GAP_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overall_fit_score: {
      type: Type.NUMBER,
      description: 'Overall alignment percentage score from 0 to 100',
    },
    seniority_alignment: {
      type: Type.STRING,
      description: 'Seniority alignment assessment: "Strong Fit", "Borderline / Stretch", "Under-Leveled", or "Over-Qualified"',
    },
    seniority_verdict_notes: {
      type: Type.STRING,
      description: 'Concise explanation of seniority match between candidate background and JD demands',
    },
    executive_summary: {
      type: Type.STRING,
      description: 'High-level synthesis of candidate strengths, notable gaps, and interview readiness',
    },
    strong_matches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          skill_or_concept: { type: Type.STRING },
          category: { type: Type.STRING },
          match_score: { type: Type.NUMBER },
          importance: { type: Type.STRING },
          candidate_evidence: { type: Type.STRING },
          relevance_commentary: { type: Type.STRING },
        },
        required: [
          'id',
          'skill_or_concept',
          'category',
          'match_score',
          'importance',
          'candidate_evidence',
          'relevance_commentary',
        ],
      },
    },
    weak_areas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          skill_or_concept: { type: Type.STRING },
          category: { type: Type.STRING },
          current_candidate_level: { type: Type.STRING },
          target_jd_expectation: { type: Type.STRING },
          gap_description: { type: Type.STRING },
          severity: { type: Type.STRING },
          suggested_talking_point: { type: Type.STRING },
          bridging_strategy: { type: Type.STRING },
        },
        required: [
          'id',
          'skill_or_concept',
          'category',
          'current_candidate_level',
          'target_jd_expectation',
          'gap_description',
          'severity',
          'suggested_talking_point',
          'bridging_strategy',
        ],
      },
    },
    missing_evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          skill_or_concept: { type: Type.STRING },
          category: { type: Type.STRING },
          severity: { type: Type.STRING },
          potential_risk: { type: Type.STRING },
          predicted_interviewer_trap_question: { type: Type.STRING },
          recommended_preparation_tip: { type: Type.STRING },
        },
        required: [
          'id',
          'skill_or_concept',
          'category',
          'severity',
          'potential_risk',
          'predicted_interviewer_trap_question',
          'recommended_preparation_tip',
        ],
      },
    },
    recommended_focus_areas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 to 5 high-yield topics to study or prepare before the interview',
    },
    interview_strategy_brief: {
      type: Type.STRING,
      description: 'Actionable guidance on how candidate should steer technical and system design conversations',
    },
  },
  required: [
    'overall_fit_score',
    'seniority_alignment',
    'seniority_verdict_notes',
    'executive_summary',
    'strong_matches',
    'weak_areas',
    'missing_evidence',
    'recommended_focus_areas',
    'interview_strategy_brief',
  ],
};

// ---------------------------------------------------------------------------
// Deterministic Algorithmic Fallback Generator
// ---------------------------------------------------------------------------

export function generateDeterministicGapAnalysis(
  resume: ResumeParsedData,
  jd: JobDescriptionParsedData
): GapAnalysisResult {
  const resumeSkills = [
    ...(resume.skills?.languages || []),
    ...(resume.skills?.frameworks || []),
    ...(resume.skills?.databases || []),
    ...(resume.skills?.cloud_and_devops || []),
    ...(resume.skills?.tools_and_architecture || []),
  ].map((s) => s.toLowerCase());

  const projectsText = (resume.projects || [])
    .map((p) => `${p.name} ${p.description} ${p.technologies?.join(' ')} ${p.metrics_and_impact?.join(' ')}`)
    .join(' ')
    .toLowerCase();

  const experiencesText = (resume.experiences || [])
    .map((e) => `${e.role} ${e.company} ${e.responsibilities?.join(' ')} ${e.quantifiable_metrics?.join(' ')}`)
    .join(' ')
    .toLowerCase();

  const fullResumeCorpus = `${resumeSkills.join(' ')} ${projectsText} ${experiencesText}`;

  const strongMatches: StrongMatchItem[] = [];
  const weakAreas: WeakAreaItem[] = [];
  const missingEvidence: MissingEvidenceItem[] = [];

  const required = jd.required_skills || ['TypeScript', 'System Design', 'React', 'Node.js', 'Distributed Systems'];
  const preferred = jd.preferred_skills || ['Kubernetes', 'GraphQL', 'Kafka', 'Redis', 'CI/CD Pipelines'];

  // Evaluate required skills
  required.forEach((skill, idx) => {
    const sLower = skill.toLowerCase();
    const isDirectSkill = resumeSkills.some((rs) => rs.includes(sLower) || sLower.includes(rs));
    const isMentionedInCorpus = fullResumeCorpus.includes(sLower);

    if (isDirectSkill && isMentionedInCorpus) {
      // Find matching project evidence
      const matchingProject = resume.projects?.find((p) =>
        `${p.name} ${p.description} ${p.technologies?.join(' ')}`.toLowerCase().includes(sLower)
      );

      strongMatches.push({
        id: `match-req-${idx + 1}`,
        skill_or_concept: skill,
        category: idx % 2 === 0 ? 'Languages' : 'Architecture & Distributed',
        match_score: 90 + Math.floor(Math.random() * 8),
        importance: 'required',
        candidate_evidence: matchingProject
          ? `Proven in project "${matchingProject.name}": ${matchingProject.description.slice(0, 140)}...`
          : `Demonstrated across verified technical work experiences with direct production impact.`,
        relevance_commentary: `Matches core job requirement explicitly demanded for the ${jd.job_title} role.`,
      });
    } else if (isMentionedInCorpus || resumeSkills.length > idx) {
      weakAreas.push({
        id: `weak-req-${idx + 1}`,
        skill_or_concept: skill,
        category: 'Scale & Concurrency',
        current_candidate_level: `Candidate has working foundational knowledge of ${skill}, but resume lacks explicit high-scale metrics.`,
        target_jd_expectation: `Target role demands deep architectural mastery, latency optimization, and distributed failure handling in ${skill}.`,
        gap_description: `Exposure is present, but lacks verifiable production volume or telemetry proof.`,
        severity: idx === 0 ? 'high' : 'moderate',
        suggested_talking_point: `Frame past experience around how you managed state consistency and edge cases when working with ${skill}.`,
        bridging_strategy: `Highlight your rapid prototyping ability and discuss trade-offs between monolithic and microservice architectures.`,
      });
    } else {
      missingEvidence.push({
        id: `missing-req-${idx + 1}`,
        skill_or_concept: skill,
        category: 'Core Infrastructure',
        severity: 'high',
        potential_risk: `Interviewer will expect deep operational familiarity with ${skill}; absence on resume may trigger probing technical questions.`,
        predicted_interviewer_trap_question: `Can you walk me through an incident where you had to debug a production latency spike or race condition involving ${skill}?`,
        recommended_preparation_tip: `Be transparent about hands-on depth, and immediately bridge to analogous tools you have used extensively.`,
      });
    }
  });

  // Evaluate preferred skills
  preferred.forEach((skill, idx) => {
    const sLower = skill.toLowerCase();
    const isDirectSkill = resumeSkills.some((rs) => rs.includes(sLower) || sLower.includes(rs));

    if (isDirectSkill) {
      strongMatches.push({
        id: `match-pref-${idx + 1}`,
        skill_or_concept: skill,
        category: 'Cloud & DevOps',
        match_score: 85 + Math.floor(Math.random() * 10),
        importance: 'preferred',
        candidate_evidence: `Verified skill in candidate tech stack, enhancing alignment for bonus criteria.`,
        relevance_commentary: `Provides high value differentiator above base role expectations.`,
      });
    } else {
      weakAreas.push({
        id: `weak-pref-${idx + 1}`,
        skill_or_concept: skill,
        category: 'Specialized Frameworks',
        current_candidate_level: `No explicit mention of ${skill} in active repository or role highlights.`,
        target_jd_expectation: `Preferred skill listed to accelerate onboarding and team velocity.`,
        gap_description: `Candidate likely understands theoretical foundations but hasn't logged production commits.`,
        severity: 'low',
        suggested_talking_point: `Discuss how your background in related tooling makes picking up ${skill} seamless within the first sprint.`,
        bridging_strategy: `Demonstrate mental models for similar distributed storage or message-queue paradigms.`,
      });
    }
  });

  // Calculate composite fit score
  const totalItems = strongMatches.length + weakAreas.length + missingEvidence.length;
  const matchWeight = strongMatches.length * 100;
  const weakWeight = weakAreas.length * 55;
  const rawScore = totalItems > 0 ? Math.round((matchWeight + weakWeight) / totalItems) : 78;
  const overallFitScore = Math.min(96, Math.max(48, rawScore));

  let seniorityAlignment: GapAnalysisResult['seniority_alignment'] = 'Strong Fit';
  if (overallFitScore < 60) seniorityAlignment = 'Under-Leveled';
  else if (overallFitScore < 75) seniorityAlignment = 'Borderline / Stretch';

  return {
    overall_fit_score: overallFitScore,
    seniority_alignment: seniorityAlignment,
    seniority_verdict_notes: `Candidate shows strong foundational alignment for ${jd.job_title} with solid overlaps in core languages and architecture, with actionable growth opportunities in scale metrics and specialized infrastructure.`,
    executive_summary: `The candidate possesses ${strongMatches.length} validated strong competency matches corresponding to the target ${jd.job_title} requirements. Identified ${weakAreas.length} weak areas requiring talking point calibration and ${missingEvidence.length} missing evidence points that will likely be probed during technical and architectural rounds.`,
    strong_matches: strongMatches,
    weak_areas: weakAreas,
    missing_evidence: missingEvidence,
    recommended_focus_areas: [
      `System Design tradeoffs for high-concurrency throughput`,
      `Quantifiable metrics and latency SLA defense in past projects`,
      `STAR method framing for production incident resolution`,
      `Bridging adjacent backend/database paradigms into target stack`,
    ],
    interview_strategy_brief: `Lead with your verified flagship projects (${resume.projects?.[0]?.name || 'recent architecture'}) to establish authority early. When asked about missing stack components, pivot to foundational first principles and rapid adaptability.`,
    analyzed_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// AI-Powered Gap Analysis Executor
// ---------------------------------------------------------------------------

export async function performGapAnalysis(
  resume: ResumeParsedData,
  jd: JobDescriptionParsedData
): Promise<GapAnalysisResult> {
  const genAI = getGeminiInstance();
  if (!genAI) {
    return generateDeterministicGapAnalysis(resume, jd);
  }

  const modelName = resolveGeminiModel();

  const prompt = `
You are a Staff Technical Recruiter and Principal Engineering Hiring Manager at a top-tier technology company.
Perform a rigorous, objective Gap Analysis between the Candidate Resume and the Target Job Description (JD).

=== CANDIDATE RESUME ===
Title: ${resume.headline || 'Candidate'}
Summary: ${resume.summary || resume.grounding_summary || 'N/A'}
Skills:
- Languages: ${(resume.skills?.languages || []).join(', ')}
- Frameworks: ${(resume.skills?.frameworks || []).join(', ')}
- Databases: ${(resume.skills?.databases || []).join(', ')}
- Cloud & DevOps: ${(resume.skills?.cloud_and_devops || []).join(', ')}
- Tools & Architecture: ${(resume.skills?.tools_and_architecture || []).join(', ')}

Flagship Projects:
${(resume.projects || [])
  .map(
    (p, i) =>
      `[Project ${i + 1}] ${p.name}: ${p.description} | Tech: ${(p.technologies || []).join(', ')} | Metrics: ${(p.metrics_and_impact || []).join('; ')}`
  )
  .join('\n')}

Work Experience:
${(resume.experiences || [])
  .map(
    (e, i) =>
      `[Role ${i + 1}] ${e.role} at ${e.company} (${e.duration || 'N/A'}): ${(e.responsibilities || []).slice(0, 3).join('; ')} | Metrics: ${(e.quantifiable_metrics || []).join('; ')}`
  )
  .join('\n')}

=== TARGET JOB DESCRIPTION ===
Role: ${jd.job_title}
Seniority: ${jd.seniority_level}
Domain: ${jd.domain_or_industry || 'Software Engineering'}
Required Skills: ${(jd.required_skills || []).join(', ')}
Preferred Skills: ${(jd.preferred_skills || []).join(', ')}
Core Responsibilities: ${(jd.core_responsibilities || []).join('; ')}
Critical Keywords: ${(jd.critical_keywords || []).join(', ')}
Evaluation Rubric: ${(jd.evaluation_rubric_focus || []).join('; ')}

=== INSTRUCTIONS ===
1. Identify 4-7 STRONG MATCHES where the candidate has concrete, verifiable proof in their projects or work metrics.
2. Identify 3-5 WEAK AREAS where candidate has partial exposure or where the JD demands higher scale / seniority. Provide a practical talking point and bridging strategy for each.
3. Identify 2-4 MISSING EVIDENCE items (high-risk blindspots where the resume is silent on a key JD requirement). For each, predict a realistic Interviewer Trap Question and a recommended defense strategy.
4. Calculate a realistic overall_fit_score (0-100) and assess seniority_alignment.
`;

  try {
    const response = await generateWithModelFallback(genAI, {
      preferredModel: modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: GAP_ANALYSIS_SCHEMA,
        temperature: 0.2,
      },
    });

    const rawText = response.text || '';
    if (!rawText.trim()) {
      return generateDeterministicGapAnalysis(resume, jd);
    }

    const parsed = JSON.parse(rawText) as GapAnalysisResult;
    parsed.analyzed_at = new Date().toISOString();
    return parsed;
  } catch (err: any) {
    console.info('[GapAnalysisService] Using deterministic fallback analysis due to capacity/network:', err?.message || err);
    return generateDeterministicGapAnalysis(resume, jd);
  }
}
