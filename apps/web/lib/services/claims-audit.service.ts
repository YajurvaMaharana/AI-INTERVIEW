// ---------------------------------------------------------------------------
// claims-audit.service.ts — Resume Claim & Metric Audit Extraction Engine
// ---------------------------------------------------------------------------

import { GoogleGenAI, Type } from '@google/genai';
import { resolveGeminiModel, generateWithModelFallback } from '@/lib/utils/gemini-model';
import type { ResumeParsedData, JobDescriptionParsedData } from '../types/database.types';
import type {
  ResumeClaimAuditItem,
  ResumeClaimsAuditResult,
  ClaimCategoryType,
} from '../types/claims-audit.types';

let cachedGenAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) return null;
  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenAI({ apiKey });
  }
  return cachedGenAI;
}

/**
 * Builds the AI prompt section instructing the interviewer persona
 * to rigorously probe and verify the candidate's resume claims.
 */
export function buildClaimsPromptGrounding(claims: ResumeClaimAuditItem[]): string {
  if (!claims || claims.length === 0) return '';

  const bulletPoints = claims
    .slice(0, 6)
    .map(
      (c, idx) =>
        `[Claim ${idx + 1} - ${c.claim_category_label}] "${c.original_statement}" (Context: ${c.context_source})
   • Interviewer Probe Focus: ${c.interviewer_probe_angle}
   • Trade-offs to Verify: ${c.key_tradeoffs_to_defend.join('; ')}
   • Verification Focus: ${c.evidence_verification_focus}`
    )
    .join('\n\n');

  return `
═══════════════════════════════════════════════════════════════════════════════
AUDITED RESUME CLAIMS & EVIDENCE-SEEKING PROBING DIRECTIVE
═══════════════════════════════════════════════════════════════════════════════

The candidate's resume presents the following specific technical, metric, and architectural claims.
You MUST actively test and probe these claims during the interview by asking evidence-seeking
follow-up questions focusing on metrics, ownership, design decisions, and technical trade-offs:

${bulletPoints}

CALIBRATION RULES FOR CLAIM PROBING:
1. When the candidate mentions one of these projects or metrics, drill down into HOW it was measured.
2. Ask about baseline metrics prior to optimization (e.g., "What was the P99 latency before your changes?").
3. Probe alternative architectures they rejected and why (e.g., "Why Redis Pub/Sub instead of Kafka or RabbitMQ?").
4. Evaluate technical honesty and depth — distinguish between surface-level familiarity and genuine hands-on ownership.
`.trim();
}

/**
 * Deterministic fallback extractor for resume claims.
 * Parses quantifiable metrics, architectural phrases, and responsibilities.
 */
export function generateDeterministicClaimsAudit(
  resume: ResumeParsedData,
  jd?: JobDescriptionParsedData | null
): ResumeClaimsAuditResult {
  const claims: ResumeClaimAuditItem[] = [];
  let claimIndex = 1;

  // 1. Audit Projects
  if (resume.projects && Array.isArray(resume.projects)) {
    for (const project of resume.projects) {
      // Check metrics and impact
      if (project.metrics_and_impact && Array.isArray(project.metrics_and_impact)) {
        for (const metric of project.metrics_and_impact) {
          const lower = metric.toLowerCase();
          let type: ClaimCategoryType = 'metric_and_scale';
          let label = 'Scale & Quantitative Metric';
          let probe = `Ask for exact baseline telemetry, profiling tools (e.g., Grafana/Datadog), and how this metric was isolated from concurrent infrastructure changes.`;
          let tradeoffs = ['Measurement accuracy vs observability overhead', 'Throughput vs latency trade-offs'];
          let verification = 'Pre/post optimization metrics, sample size, load test conditions';

          if (lower.includes('latency') || lower.includes('ms') || lower.includes('fps') || lower.includes('speed') || lower.includes('time')) {
            type = 'latency_and_performance';
            label = 'Latency & Performance Optimization';
            probe = `Probe the candidate on profiling methodologies (CPU flamegraphs, network waterfall, database query plans) and specific algorithmic or caching bottlenecks identified.`;
            tradeoffs = ['Memory consumption of caching layer vs network roundtrips', 'Cache invalidation complexity'];
            verification = 'P50 vs P95 vs P99 distribution curves and degradation under burst loads';
          } else if (lower.includes('cost') || lower.includes('$') || lower.includes('%') || lower.includes('scale')) {
            type = 'metric_and_scale';
            label = 'Scale & Resource Efficiency';
            probe = `Drill into how resource allocation was tuned, horizontal vs vertical scaling limits, and failure modes when traffic doubles.`;
            tradeoffs = ['Cost efficiency vs infrastructure redundancy', 'Over-provisioning vs SLA risk'];
            verification = 'Specific architectural changes that produced the percentage improvement';
          }

          claims.push({
            id: `claim-proj-metric-${claimIndex++}`,
            claim_type: type,
            claim_category_label: label,
            original_statement: metric,
            context_source: `${project.name} (Project)`,
            interviewer_probe_angle: probe,
            key_tradeoffs_to_defend: tradeoffs,
            evidence_verification_focus: verification,
            recommended_star_defense: `Structure response with STAR: State initial bottleneck (${metric}), tools used to diagnose, architecture chosen, and verified production outcome.`,
            verification_difficulty: 'high',
          });
        }
      }

      // Check architectural statements in project description
      if (project.description) {
        const desc = project.description;
        const lowerDesc = desc.toLowerCase();
        if (
          lowerDesc.includes('distributed') ||
          lowerDesc.includes('real-time') ||
          lowerDesc.includes('crdt') ||
          lowerDesc.includes('event-driven') ||
          lowerDesc.includes('microservice') ||
          lowerDesc.includes('websocket') ||
          lowerDesc.includes('wasm') ||
          lowerDesc.includes('webassembly')
        ) {
          claims.push({
            id: `claim-proj-arch-${claimIndex++}`,
            claim_type: 'architectural_decision',
            claim_category_label: 'Architectural Paradigm & Protocols',
            original_statement: desc,
            context_source: `${project.name} (Project Architecture)`,
            interviewer_probe_angle: `Probe why this specific architectural pattern was chosen over simpler alternatives, how network partitions or disconnection states are handled, and how consistency is guaranteed.`,
            key_tradeoffs_to_defend: [
              'Operational complexity vs throughput capabilities',
              'Eventual consistency vs immediate read consistency',
              'Memory footprint on client/server during high-concurrency spikes',
            ],
            evidence_verification_focus: 'Handling split-brain scenarios, message ordering, and connection lifecycle management',
            recommended_star_defense: 'Explain the technical constraints that ruled out standard REST polling or simpler monolith approaches.',
            verification_difficulty: 'high',
          });
        }
      }
    }
  }

  // 2. Audit Experiences
  if (resume.experiences && Array.isArray(resume.experiences)) {
    for (const exp of resume.experiences) {
      // Quantifiable metrics
      if (exp.quantifiable_metrics && Array.isArray(exp.quantifiable_metrics)) {
        for (const qMetric of exp.quantifiable_metrics) {
          claims.push({
            id: `claim-exp-metric-${claimIndex++}`,
            claim_type: 'metric_and_scale',
            claim_category_label: 'Production Scale & Traffic Volume',
            original_statement: qMetric,
            context_source: `${exp.company} (${exp.role})`,
            interviewer_probe_angle: `Ask how the candidate maintained uptime SLAs under this volume, incident response protocols, and how concurrency limits were enforced.`,
            key_tradeoffs_to_defend: [
              'Rate limiting / throttling policies vs user experience',
              'Database connection pooling and read-replica scaling',
            ],
            evidence_verification_focus: 'Incident post-mortems, automated alert thresholds, and failover runbooks',
            recommended_star_defense: 'Highlight your direct on-call or architectural role in maintaining stability at this scale.',
            verification_difficulty: 'medium',
          });
        }
      }

      // Responsibilities & Leadership
      if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
        for (const resp of exp.responsibilities) {
          const lower = resp.toLowerCase();
          if (lower.includes('architected') || lower.includes('led') || lower.includes('mentored') || lower.includes('standardized')) {
            claims.push({
              id: `claim-exp-resp-${claimIndex++}`,
              claim_type: lower.includes('mentored') || lower.includes('led') ? 'ownership_and_leadership' : 'architectural_decision',
              claim_category_label: lower.includes('mentored') || lower.includes('led') ? 'Ownership & Engineering Leadership' : 'System Architecture Leadership',
              original_statement: resp,
              context_source: `${exp.company} (${exp.role})`,
              interviewer_probe_angle: `Probe the candidate's exact level of ownership: did they design the architecture from scratch, write RFCs, or execute an existing roadmap? Ask for examples of technical disagreements resolved.`,
              key_tradeoffs_to_defend: [
                'Velocity of shipping vs technical debt accumulation',
                'Adopting modern libraries vs maintaining team familiarity',
              ],
              evidence_verification_focus: 'RFC documents, cross-team consensus building, and code review governance',
              recommended_star_defense: 'Be specific about what YOU designed versus what the team implemented collaboratively.',
              verification_difficulty: 'medium',
            });
          }
        }
      }

      // Achievements
      if (exp.achievements && Array.isArray(exp.achievements)) {
        for (const ach of exp.achievements) {
          claims.push({
            id: `claim-exp-ach-${claimIndex++}`,
            claim_type: 'reliability_and_incident',
            claim_category_label: 'High-Impact Engineering Achievement',
            original_statement: ach,
            context_source: `${exp.company} (${exp.role})`,
            interviewer_probe_angle: `Ask for detailed walkthrough of the technical levers used to accomplish this achievement, unexpected edge-cases encountered, and rollback strategies.`,
            key_tradeoffs_to_defend: [
              'Time investment into refactoring vs new feature delivery',
              'Short-term migration risk vs long-term maintainability',
            ],
            evidence_verification_focus: 'Data validation scripts, zero-downtime execution steps, and post-launch stability metrics',
            recommended_star_defense: 'Articulate the problem severity, your specific solution hypothesis, and validated business impact.',
            verification_difficulty: 'high',
          });
        }
      }
    }
  }

  // Fallback defaults if few claims found
  if (claims.length === 0) {
    claims.push(
      {
        id: 'claim-default-1',
        claim_type: 'metric_and_scale',
        claim_category_label: 'Scale & Quantitative Metric',
        original_statement: resume.summary || '5+ years building distributed web applications and high-throughput microservices.',
        context_source: 'Candidate Professional Summary',
        interviewer_probe_angle: 'Probe the candidate on largest throughput systems designed, database concurrency bottlenecks, and high-load failure modes.',
        key_tradeoffs_to_defend: ['Synchronous vs asynchronous processing', 'Data consistency vs availability under network splits'],
        evidence_verification_focus: 'Detailed architectural walkthrough of high-throughput service topologies',
        recommended_star_defense: 'Ground answers in concrete production incidents and benchmark numbers.',
        verification_difficulty: 'medium',
      },
      {
        id: 'claim-default-2',
        claim_type: 'architectural_decision',
        claim_category_label: 'TypeScript & Microservices Architecture',
        original_statement: 'Architected cloud backend services and real-time streaming endpoints.',
        context_source: 'TechFlow Systems (Experience)',
        interviewer_probe_angle: 'Ask how type safety was maintained across service boundaries, API versioning strategies, and backwards compatibility.',
        key_tradeoffs_to_defend: ['gRPC/Protobuf vs JSON/REST', 'Monolithic deployment ease vs microservice isolation'],
        evidence_verification_focus: 'Contract testing, schema validation libraries (Zod), and CI/CD automated test coverage',
        recommended_star_defense: 'Discuss schema governance and automated integration testing pipelines.',
        verification_difficulty: 'medium',
      }
    );
  }

  return {
    candidate_headline: resume.headline || 'Senior Software Engineer',
    total_claims_identified: claims.length,
    audited_claims: claims,
    high_impact_probes_summary: `Identified ${claims.length} technical and metric claims across projects and work experiences. Interview questions will focus on measurement baselines, architectural trade-offs, and failure mode mitigation.`,
    audited_at: new Date().toISOString(),
  };
}

/**
 * Performs full AI-powered Claim Audit with fallback cascade.
 */
export async function auditResumeClaims(
  resume: ResumeParsedData,
  jd?: JobDescriptionParsedData | null
): Promise<ResumeClaimsAuditResult> {
  const genAI = getGenAI();
  if (!genAI) {
    return generateDeterministicClaimsAudit(resume, jd);
  }

  const modelName = resolveGeminiModel();

  const prompt = `
You are an expert technical interviewer and executive talent assessor.
Perform an objective, neutral audit of the candidate's verified resume claims, quantifiable metrics, and architectural statements.

For each significant claim found in the candidate's projects or experiences:
1. Extract the exact statement quote and context source.
2. Formulate the precise, neutral probe angle a staff-level technical interviewer will ask to test depth and authenticity.
3. List 2-3 critical engineering trade-offs the candidate must be prepared to articulate and defend.
4. Specify the evidence verification focus (baselines, profiling, error rates).
5. Provide recommended STAR framework defense tips.

Candidate Resume Data:
${JSON.stringify(resume, null, 2)}

Target Job Description Context:
${jd ? JSON.stringify(jd, null, 2) : 'General Senior Software Engineering standards'}

Respond ONLY with valid JSON conforming to the requested schema.
`;

  try {
    const response = await generateWithModelFallback(genAI, {
      preferredModel: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction:
          'You are an objective technical talent auditor. Return strictly valid JSON containing audited resume claims, probe angles, and trade-offs.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidate_headline: { type: Type.STRING },
            total_claims_identified: { type: Type.INTEGER },
            high_impact_probes_summary: { type: Type.STRING },
            audited_claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  claim_type: {
                    type: Type.STRING,
                    enum: [
                      'metric_and_scale',
                      'architectural_decision',
                      'latency_and_performance',
                      'ownership_and_leadership',
                      'reliability_and_incident',
                    ],
                  },
                  claim_category_label: { type: Type.STRING },
                  original_statement: { type: Type.STRING },
                  context_source: { type: Type.STRING },
                  interviewer_probe_angle: { type: Type.STRING },
                  key_tradeoffs_to_defend: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  evidence_verification_focus: { type: Type.STRING },
                  recommended_star_defense: { type: Type.STRING },
                  verification_difficulty: {
                    type: Type.STRING,
                    enum: ['high', 'medium', 'low'],
                  },
                },
                required: [
                  'id',
                  'claim_type',
                  'claim_category_label',
                  'original_statement',
                  'context_source',
                  'interviewer_probe_angle',
                  'key_tradeoffs_to_defend',
                  'evidence_verification_focus',
                  'recommended_star_defense',
                  'verification_difficulty',
                ],
              },
            },
          },
          required: [
            'candidate_headline',
            'total_claims_identified',
            'high_impact_probes_summary',
            'audited_claims',
          ],
        },
      },
    });

    const rawText = response.text || '';
    const parsed = JSON.parse(rawText) as ResumeClaimsAuditResult;
    parsed.audited_at = new Date().toISOString();
    return parsed;
  } catch (err: any) {
    console.info('[ClaimsAuditService] Using deterministic fallback due to capacity/network:', err?.message || err);
    return generateDeterministicClaimsAudit(resume, jd);
  }
}
