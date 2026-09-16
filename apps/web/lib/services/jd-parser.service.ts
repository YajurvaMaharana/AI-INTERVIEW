// ---------------------------------------------------------------------------
// jd-parser.service.ts — Robust AI-Powered Job Description (JD) Parsing & Calibration Engine
//                        Powered by Gemini 3.8 Flash
// ---------------------------------------------------------------------------

import { GoogleGenAI, Type } from '@google/genai';
import { resolveGeminiModel } from '@/lib/utils/gemini-model';
import type { JobDescriptionParsedData } from '../types/database.types';

// ---------------------------------------------------------------------------
// Gemini Client initialization (lazy)
// ---------------------------------------------------------------------------

let cachedGenAI: GoogleGenAI | null = null;

function getGeminiInstance(): GoogleGenAI | null {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) {
    return null;
  }
  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenAI({ apiKey });
  }
  return cachedGenAI;
}

// ---------------------------------------------------------------------------
// JSON Schema for Structured JD Extraction
// ---------------------------------------------------------------------------

const JD_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    job_title: {
      type: Type.STRING,
      description: 'Extracted canonical job title (e.g., Staff Distributed Systems Engineer, Senior Full-Stack Engineer)',
    },
    company_name: {
      type: Type.STRING,
      description: 'Hiring company or organization name if mentioned in the JD',
    },
    seniority_level: {
      type: Type.STRING,
      description: 'Seniority level: Junior, Mid, Senior, Staff/Principal, or Lead/Manager',
    },
    domain_or_industry: {
      type: Type.STRING,
      description: 'Industry domain (e.g. Fintech, Cloud Infrastructure, AI & ML, Healthcare, E-Commerce)',
    },
    required_skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Essential mandatory technical skills, languages, frameworks, and architecture patterns explicitly required',
    },
    preferred_skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Nice-to-have or bonus technical qualifications and background',
    },
    core_responsibilities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Core day-to-day duties, architectural ownership, and team responsibilities',
    },
    critical_keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Key technical buzzwords, protocols, architectural terms, and domain acronyms (e.g., gRPC, Kafka, ACID, Kubernetes, GraphQL, Raft, Sharding)',
    },
    evaluation_rubric_focus: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '4 to 6 specific interview rubric evaluation criteria to assess candidate fitness against this JD',
    },
    calibration_summary: {
      type: Type.STRING,
      description: 'A concise 2-3 sentence directive for the AI interviewer detailing what real-world scenarios, scale bottlenecks, and skills to probe',
    },
  },
  required: [
    'job_title',
    'seniority_level',
    'required_skills',
    'core_responsibilities',
    'critical_keywords',
    'evaluation_rubric_focus',
    'calibration_summary',
  ],
};

// ---------------------------------------------------------------------------
// Fallback Sample Data Generator (Deterministic fallback for offline mode)
// ---------------------------------------------------------------------------

export function generateFallbackJDParsedData(rawText: string, jobTitleOverride?: string): JobDescriptionParsedData {
  const textLower = rawText.toLowerCase();

  // Basic heuristic keyword detection
  const detectedSkills: string[] = [];
  const skillKeywords = [
    'typescript', 'react', 'next.js', 'node.js', 'python', 'go', 'golang', 'java',
    'rust', 'postgresql', 'mysql', 'mongodb', 'redis', 'kafka', 'docker', 'kubernetes',
    'aws', 'gcp', 'azure', 'graphql', 'rest', 'grpc', 'microservices', 'distributed systems',
    'system design', 'ci/cd', 'terraform', 'elasticsearch', 'dynamodb'
  ];

  for (const kw of skillKeywords) {
    if (textLower.includes(kw)) {
      detectedSkills.push(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  }

  // Detect seniority
  let seniority: 'Junior' | 'Mid' | 'Senior' | 'Staff/Principal' | 'Lead/Manager' = 'Senior';
  if (textLower.includes('staff') || textLower.includes('principal')) {
    seniority = 'Staff/Principal';
  } else if (textLower.includes('lead') || textLower.includes('manager') || textLower.includes('director')) {
    seniority = 'Lead/Manager';
  } else if (textLower.includes('junior') || textLower.includes('entry') || textLower.includes('intern')) {
    seniority = 'Junior';
  } else if (textLower.includes('mid') || textLower.includes('associate')) {
    seniority = 'Mid';
  }

  // Detect company
  let company = 'Target Tech Company';
  const companyPatterns = ['at stripe', 'at google', 'at meta', 'at amazon', 'at apple', 'at netflix', 'at uber', 'at airbnb'];
  for (const cp of companyPatterns) {
    if (textLower.includes(cp)) {
      company = cp.replace('at ', '').toUpperCase();
    }
  }

  const title = jobTitleOverride || (textLower.includes('backend')
    ? `${seniority} Backend Systems Engineer`
    : textLower.includes('frontend')
    ? `${seniority} Frontend Engineer`
    : textLower.includes('full')
    ? `${seniority} Full-Stack Engineer`
    : textLower.includes('devops') || textLower.includes('sre')
    ? `${seniority} Site Reliability & Infrastructure Engineer`
    : `${seniority} Software Engineer`);

  return {
    job_title: title,
    company_name: company,
    seniority_level: seniority,
    domain_or_industry: textLower.includes('payment') || textLower.includes('fintech')
      ? 'Fintech & Payment Infrastructure'
      : textLower.includes('cloud') || textLower.includes('infra')
      ? 'Cloud Infrastructure & Platform'
      : 'High-Growth Software Engineering',
    required_skills: detectedSkills.length > 0 ? detectedSkills.slice(0, 8) : ['TypeScript', 'Node.js', 'PostgreSQL', 'System Architecture', 'Distributed Systems'],
    preferred_skills: ['High-throughput message queues (Kafka)', 'Cloud-native orchestration (Kubernetes)', 'Observability & Distributed Tracing'],
    core_responsibilities: [
      'Design, build, and maintain highly scalable, fault-tolerant services and critical user journeys.',
      'Lead technical design discussions and conduct rigorous code and architecture reviews across engineering teams.',
      'Diagnose production bottlenecks, reduce latency, and ensure 99.99% system reliability.',
      'Mentor junior and mid-level engineers on sound software craftsmanship and clean architecture.',
    ],
    critical_keywords: detectedSkills.concat(['Concurrency', 'Fault Tolerance', 'API Design', 'Data Consistency', 'Latency Optimization']).slice(0, 10),
    evaluation_rubric_focus: [
      'Architectural modularity, isolation, and handling high-concurrency workloads',
      'Defensive error handling, database locking strategies, and data consistency models',
      'STAR-method behavioral examples of cross-functional alignment and resolving technical disagreements',
      'System design trade-offs between latency, throughput, cost, and maintainability',
    ],
    calibration_summary: `Interviewer calibration: Focus on real-world engineering trade-offs required for ${title}. Challenge candidate on failure recovery, database partitioning, and architectural trade-offs using ${detectedSkills.slice(0, 3).join(', ') || 'modern backend frameworks'}.`,
  };
}

// ---------------------------------------------------------------------------
// Core Extraction Function
// ---------------------------------------------------------------------------

export async function parseJobDescription(
  input: { rawText?: string; fileBuffer?: Buffer; mimeType?: string; filename?: string }
): Promise<JobDescriptionParsedData> {
  const genAI = getGeminiInstance();
  const modelName = resolveGeminiModel();

  const rawText = input.rawText || '';

  if (!genAI) {
    console.warn('[jd-parser] GEMINI_API_KEY not configured. Utilizing NLP fallback extraction.');
    return generateFallbackJDParsedData(rawText, undefined);
  }

  const extractionPrompt = `
You are an expert technical recruiter and senior principal engineering hiring manager.
Analyze the following Job Description (JD) text and extract rich, structured criteria to calibrate an AI mock interviewer.

Extract:
1. Canonical Job Title and Seniority Level (Junior, Mid, Senior, Staff/Principal, Lead/Manager).
2. Hiring Company name (if mentioned).
3. Domain / Industry.
4. Required Skills (mandatory hard tech skills, languages, database tools, frameworks).
5. Preferred Skills (nice-to-have bonuses).
6. Core Responsibilities (concrete engineering duties and architectural ownership).
7. Critical Keywords (technical terms, protocols, buzzwords, e.g., Kafka, gRPC, ACID, Kubernetes, GraphQL).
8. Evaluation Rubric Focus (4 to 6 specific areas the interviewer should probe).
9. Calibration Summary (2-3 concise sentences guiding the AI interviewer on how to structure its technical scenarios and STAR questions).

Strictly follow the JSON schema provided.

--- JOB DESCRIPTION ---
${rawText.slice(0, 25000)}
--- END JOB DESCRIPTION ---
`;

  try {
    const contents: any[] = [];

    // If PDF or image buffer provided with mimeType
    if (input.fileBuffer && input.mimeType && input.mimeType.startsWith('application/pdf')) {
      contents.push({
        role: 'user',
        parts: [
          {
            inlineData: {
              data: input.fileBuffer.toString('base64'),
              mimeType: input.mimeType,
            },
          },
          { text: extractionPrompt },
        ],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: extractionPrompt }],
      });
    }

    const response = await genAI.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction:
          'You are a high-precision recruitment intelligence engine. Extract structured job description criteria into strict JSON adhering to the provided schema.',
        responseMimeType: 'application/json',
        responseSchema: JD_RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini JD extraction model');
    }

    const parsedJson = JSON.parse(responseText);

    // Sanitize and format data
    const result: JobDescriptionParsedData = {
      job_title: parsedJson.job_title || 'Software Engineer',
      company_name: parsedJson.company_name || undefined,
      seniority_level: parsedJson.seniority_level || 'Senior',
      domain_or_industry: parsedJson.domain_or_industry || undefined,
      required_skills: Array.isArray(parsedJson.required_skills) ? parsedJson.required_skills : [],
      preferred_skills: Array.isArray(parsedJson.preferred_skills) ? parsedJson.preferred_skills : [],
      core_responsibilities: Array.isArray(parsedJson.core_responsibilities) ? parsedJson.core_responsibilities : [],
      critical_keywords: Array.isArray(parsedJson.critical_keywords) ? parsedJson.critical_keywords : [],
      evaluation_rubric_focus: Array.isArray(parsedJson.evaluation_rubric_focus) ? parsedJson.evaluation_rubric_focus : [],
      calibration_summary: parsedJson.calibration_summary || `Targeted interview for ${parsedJson.job_title || 'Software Engineer'}.`,
    };

    return result;
  } catch (err: any) {
    console.warn('[jd-parser] Gemini extraction notice:', err?.message || err);
    return generateFallbackJDParsedData(rawText, undefined);
  }
}

// ---------------------------------------------------------------------------
// AI Interview Calibration Prompt Builder
// ---------------------------------------------------------------------------

/**
 * Formats parsed JD criteria into an authoritative system prompt injection.
 * Calibrates the AI interviewer to abandon generic questions and focus
 * strictly on the specific JD technical requirements, responsibilities, and scenarios.
 */
export function buildJDPromptCalibration(jd: JobDescriptionParsedData): string {
  const lines: string[] = [];

  lines.push('=== TARGET JOB DESCRIPTION (JD) CALIBRATION INSTRUCTIONS ===');
  lines.push(`Target Role: ${jd.job_title} ${jd.company_name ? `at ${jd.company_name}` : ''}`);
  lines.push(`Calibrated Seniority: ${jd.seniority_level}`);
  if (jd.domain_or_industry) {
    lines.push(`Domain / Industry Focus: ${jd.domain_or_industry}`);
  }

  if (jd.calibration_summary) {
    lines.push(`Interviewer Directive: ${jd.calibration_summary}`);
  }

  if (jd.required_skills && jd.required_skills.length > 0) {
    lines.push(`\nMANDATORY REQUIRED SKILLS TO TEST: ${jd.required_skills.join(', ')}`);
  }

  if (jd.critical_keywords && jd.critical_keywords.length > 0) {
    lines.push(`CRITICAL DOMAIN & ARCHITECTURAL KEYWORDS: ${jd.critical_keywords.join(', ')}`);
  }

  if (jd.core_responsibilities && jd.core_responsibilities.length > 0) {
    lines.push('\nTARGET ROLE RESPONSIBILITIES (Base your technical scenarios and STAR probes on these):');
    jd.core_responsibilities.forEach((resp) => {
      lines.push(`- ${resp}`);
    });
  }

  if (jd.evaluation_rubric_focus && jd.evaluation_rubric_focus.length > 0) {
    lines.push('\nEVALUATION CRITERIA & SCORING RUBRIC:');
    jd.evaluation_rubric_focus.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  lines.push(`
CRITICAL INTERVIEW CALIBRATION RULES:
1. SHIFT AWAY FROM GENERIC INTERVIEW PROMPTS: Do NOT ask generic "tell me about yourself" or textbook theory questions without anchoring them in the target role's core responsibilities and tech stack above.
2. GROUND PROBLEM SCENARIOS IN THE JD: Formulate complex architectural trade-offs, concurrency challenges, and operational failure modes that mirror the actual tech stack and domain (e.g., if ${jd.required_skills.slice(0, 2).join(' or ') || 'the JD tech stack'} is required, test its internal mechanics and trade-offs).
3. BEHAVIORAL STAR PROBING: For behavioral questions, probe past experiences that specifically demonstrate mastery of the responsibilities listed above.
4. ADAPT DIFFICULTY TO SENIORITY: Strictly calibrate questioning depth to ${jd.seniority_level} level expectations.
=== END JD CALIBRATION INSTRUCTIONS ===
`);

  return lines.join('\n');
}
