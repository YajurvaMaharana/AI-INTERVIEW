// ---------------------------------------------------------------------------
// interviewer.ts — AI interviewer service: prompt selection, LLM calls,
//                  real-time adaptive difficulty & branching engine
// ---------------------------------------------------------------------------

import { GoogleGenAI } from '@google/genai';
import { resolveGeminiModel, generateWithModelFallback } from '@/lib/utils/gemini-model';
import { TECHNICAL_SYSTEM_PROMPT } from './prompts/technical.prompt';
import { HR_SYSTEM_PROMPT } from './prompts/hr.prompt';
import { SYSTEM_DESIGN_SYSTEM_PROMPT } from './prompts/system-design.prompt';
import { MIXED_SYSTEM_PROMPT } from './prompts/mixed.prompt';
import {
  buildMessageHistory,
  injectPromptVariables,
  truncateContext,
} from './context.service';
import type { ChatMessage, PromptVariables } from './context.service';
import type { InterviewType, Difficulty, JobDescriptionParsedData } from '../../types/database.types';
import { getSessionById, getUserById } from '../db.service';
import { buildResumePromptGrounding } from '../resume-parser.service';
import { buildJDPromptCalibration } from '../jd-parser.service';
import {
  generateDeterministicClaimsAudit,
  buildClaimsPromptGrounding,
} from '../claims-audit.service';
import { buildCandidateProfilePromptContext } from '../candidate-profile.service';
import {
  getOrCreateSessionTelemetry,
  evaluateCandidateResponse,
  updateSessionTelemetryWithEvaluation,
  buildAdaptivePromptContext,
  type SessionAdaptiveTelemetry,
  type CandidateEvaluationResult,
} from './adaptive-engine.service';

// ---------------------------------------------------------------------------
// Typed errors
// ---------------------------------------------------------------------------

export class AITimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`AI service did not respond within ${timeoutMs}ms`);
    this.name = 'AITimeoutError';
  }
}

export class AIServiceError extends Error {
  public readonly cause?: Error;
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'AIServiceError';
    this.cause = cause;
  }
}

// ---------------------------------------------------------------------------
// Gemini client initialisation (lazy)
// ---------------------------------------------------------------------------

let cachedGenAI: GoogleGenAI | null = null;

function getGeminiClient(): { client: GoogleGenAI; modelName: string } {
  const apiKey = process.env['GEMINI_API_KEY'];
  const modelName = resolveGeminiModel();

  if (!apiKey) {
    throw new AIServiceError(
      'Missing required environment variable: GEMINI_API_KEY must be set.',
    );
  }

  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenAI({ apiKey });
  }

  return { client: cachedGenAI, modelName };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AI_TIMEOUT_MS = 30_000;
const MAX_CONTEXT_MESSAGES = 40;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getSystemPromptTemplate(type: string): string {
  const normalized = (type || '').toLowerCase().replace(/[-_]/g, ' ');
  if (normalized.includes('system design') || normalized.includes('architecture')) {
    return SYSTEM_DESIGN_SYSTEM_PROMPT;
  }
  if (normalized.includes('behavioral') || normalized.includes('hr')) {
    return HR_SYSTEM_PROMPT;
  }
  if (normalized.includes('mixed') || normalized.includes('full loop')) {
    return MIXED_SYSTEM_PROMPT;
  }
  return TECHNICAL_SYSTEM_PROMPT;
}

function buildPersonaGrounding(persona?: string | null): string {
  switch (persona) {
    case 'tech-grinder':
      return `
═══════════════════════════════════════════════════════════════════════════════
ACTIVE PERSONA: Alex Vance — Strict Tech Grinder
═══════════════════════════════════════════════════════════════════════════════
• Character tone: Highly rigorous, fast-paced, latency & complexity conscious, uncompromising on precision.
• Probing style: Immediately challenge hand-waving or vague approximations. Demand concrete Big-O analysis, memory allocations, concurrency constraints, and edge case handling.
• Direct opening: "I'm Alex Vance. Let's dive straight into the technical architecture and algorithmic depth."`.trim();

    case 'hr-partner':
      return `
═══════════════════════════════════════════════════════════════════════════════
ACTIVE PERSONA: Sarah Jenkins — Warm HR Partner
═══════════════════════════════════════════════════════════════════════════════
• Character tone: Empathetic, psychologically safe, structured STAR framework coach.
• Probing style: Probe for emotional intelligence, cross-functional collaboration, resolving difficult workplace conflict, stakeholder management, and ownership.
• Direct opening: "Hi there! I'm Sarah Jenkins. I'm excited to learn more about your leadership journey and experiences."`.trim();

    case 'simulation-boss':
      return `
═══════════════════════════════════════════════════════════════════════════════
ACTIVE PERSONA: Marcus Sterling — Simulation AI Boss
═══════════════════════════════════════════════════════════════════════════════
• Character tone: Seasoned Engineering VP & Director. Direct, outcome-driven, ROI & architecture focused.
• Probing style: Probe engineering trade-offs, roadmap prioritization, cost vs scalability decisions, and executive clarity.
• Direct opening: "Hello, I'm Marcus Sterling. Let's examine how your technical choices drive production reliability and business outcomes."`.trim();

    case 'supportive-mentor':
      return `
═══════════════════════════════════════════════════════════════════════════════
ACTIVE PERSONA: Elena Rostova — Supportive Mentor
═══════════════════════════════════════════════════════════════════════════════
• Character tone: Pedagogical, encouraging, patient, constructive confidence-builder.
• Probing style: Break complex questions down into digestible parts. If the candidate struggles, provide gentle conceptual hints to guide them forward.
• Direct opening: "Welcome! I'm Elena Rostova. Let's work through this problem together and demonstrate your strongest thinking."`.trim();

    default:
      return '';
  }
}

function buildPracticeModeGrounding(mode?: string | null): string {
  switch (mode) {
    case 'stress_test':
      return `
═══════════════════════════════════════════════════════════════════════════════
PRACTICE MODE: Stress Test & Interruption Calibration
═══════════════════════════════════════════════════════════════════════════════
• Introduce sudden constraint shifts, unexpected scale spikes, or edge cases.
• Probe weak assumptions aggressively to test composure and adaptability.`.trim();

    case 'coaching':
      return `
═══════════════════════════════════════════════════════════════════════════════
PRACTICE MODE: Guided Coaching & Real-time Hints
═══════════════════════════════════════════════════════════════════════════════
• Acknowledge great answers immediately with positive reinforcement.
• If the candidate encounters ambiguity, provide subtle hints to keep momentum going.`.trim();

    case 'simulation_day':
      return `
═══════════════════════════════════════════════════════════════════════════════
PRACTICE MODE: Real-World Day Simulation / Incident Triage
═══════════════════════════════════════════════════════════════════════════════
• Frame questions around real production scenarios (e.g., P0 outage triage, PR architectural review, legacy migration).`.trim();

    default:
      return '';
  }
}

function buildSessionMetaGrounding(
  language?: string | null,
  duration?: number | null,
  modality?: string | null
): string {
  const parts: string[] = [];
  if (language && language.toLowerCase() !== 'english') {
    parts.push(`CRITICAL LANGUAGE REQUIREMENT: You MUST conduct the entire interview fluently in ${language}. All questions, feedback, and greetings must be in ${language}.`);
  }
  if (duration) {
    parts.push(`TARGET SESSION DURATION: ${duration} minutes. Pace your questioning accordingly.`);
  }
  if (modality === 'voice') {
    parts.push(`INPUT/OUTPUT MODALITY: Voice-Active Mode. Keep your responses conversational, punchy, and natural for text-to-speech rendering (avoid oversized code dumps unless requested).`);
  }
  return parts.length > 0 ? `\n\n═══════════════════════════════════════════════════════════════════════════════\nSESSION CALIBRATION\n═══════════════════════════════════════════════════════════════════════════════\n${parts.join('\n')}` : '';
}

function buildSystemPrompt(
  type: string,
  role: string,
  difficulty: string,
  adaptivePromptContext?: string,
  resumeGrounding?: string,
  jdCalibration?: string,
  claimsGrounding?: string,
  personaGrounding?: string,
  practiceModeGrounding?: string,
  metaGrounding?: string,
  candidateProfileContext?: string,
): string {
  const template = getSystemPromptTemplate(type);
  const variables: PromptVariables = { role, difficulty };
  let basePrompt = injectPromptVariables(template, variables);

  if (personaGrounding) {
    basePrompt = `${basePrompt}\n\n${personaGrounding}`;
  }

  if (practiceModeGrounding) {
    basePrompt = `${basePrompt}\n\n${practiceModeGrounding}`;
  }

  if (metaGrounding) {
    basePrompt = `${basePrompt}\n\n${metaGrounding}`;
  }

  if (jdCalibration) {
    basePrompt = `${basePrompt}\n\n${jdCalibration}`;
  }

  if (resumeGrounding) {
    basePrompt = `${basePrompt}\n\n${resumeGrounding}`;
  }

  if (claimsGrounding) {
    basePrompt = `${basePrompt}\n\n${claimsGrounding}`;
  }

  if (candidateProfileContext) {
    basePrompt = `${basePrompt}\n\n${candidateProfileContext}`;
  }

  if (adaptivePromptContext) {
    return `${basePrompt}\n\n${adaptivePromptContext}`;
  }
  return basePrompt;
}

async function callGeminiAPI(messages: ChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const { client, modelName } = getGeminiClient();

    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    const contents = conversationMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Please greet the candidate and ask the opening question to begin the interview.' }],
      });
    }

    const result = await generateWithModelFallback(client, {
      preferredModel: modelName,
      contents,
      config: {
        systemInstruction: systemMessage?.content,
      },
    });

    const text = result.text;

    if (!text) {
      throw new AIServiceError('AI returned an empty response');
    }

    return text;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AITimeoutError(AI_TIMEOUT_MS);
    }
    if (err instanceof AITimeoutError || err instanceof AIServiceError) {
      throw err;
    }
    const cause = err instanceof Error ? err : new Error(String(err));
    throw new AIServiceError(`AI service call failed: ${cause.message}`, cause);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateOpeningQuestion(
  type: string,
  role: string,
  difficulty: Difficulty,
  sessionId?: string,
  jdDataOverride?: JobDescriptionParsedData | null,
): Promise<string> {
  let resumeGrounding = '';
  let jdCalibration = '';
  let claimsGrounding = '';
  let personaGrounding = '';
  let practiceModeGrounding = '';
  let metaGrounding = '';

  if (jdDataOverride) {
    jdCalibration = buildJDPromptCalibration(jdDataOverride);
  }

  if (sessionId) {
    getOrCreateSessionTelemetry(sessionId, type as InterviewType, difficulty);
    try {
      const session = await getSessionById(sessionId);
      if (session) {
        personaGrounding = buildPersonaGrounding(session.persona);
        practiceModeGrounding = buildPracticeModeGrounding(session.practice_mode);
        metaGrounding = buildSessionMetaGrounding(session.language, session.target_duration, session.modality);
      }
      if (session?.jd_data && !jdCalibration) {
        jdCalibration = buildJDPromptCalibration(session.jd_data);
      }
      if (session?.user_id) {
        const user = await getUserById(session.user_id);
        if (user?.resume_data) {
          resumeGrounding = buildResumePromptGrounding(user.resume_data);
          const claimsAudit = generateDeterministicClaimsAudit(
            user.resume_data,
            session?.jd_data || user.saved_jd_data
          );
          if (claimsAudit?.audited_claims?.length > 0) {
            claimsGrounding = buildClaimsPromptGrounding(claimsAudit.audited_claims);
          }
        }
      }
    } catch {
      // Ignore background grounding fetch error
    }
  }

  try {
    const systemPrompt = buildSystemPrompt(
      type,
      role,
      difficulty,
      undefined,
      resumeGrounding,
      jdCalibration,
      claimsGrounding,
      personaGrounding,
      practiceModeGrounding,
      metaGrounding,
    );

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Start the ${difficulty} ${type} interview for the ${role} position. Introduce yourself in character and ask your opening question.` },
    ];

    return await callGeminiAPI(messages);
  } catch (err: any) {
    console.warn('[interviewer] Fallback for opening question:', err?.message);
    const normalized = (type || '').toLowerCase();
    if (normalized.includes('system design') || normalized.includes('architecture')) {
      return `Welcome to your System Design interview for the ${role} position (${difficulty} level). Let's design a high-throughput, fault-tolerant distributed system. To start, how would you approach gathering requirements and defining latency budgets?`;
    } else if (normalized.includes('technical')) {
      return `Welcome to your technical mock interview for the ${role} position (${difficulty} level). To kick off, could you briefly introduce yourself, explain a complex technical challenge you solved recently, and walk me through the key architectural trade-offs you made?`;
    } else if (normalized.includes('mixed')) {
      return `Hello and welcome to your Full-Loop interview for the ${role} position. Let's begin: Could you describe an impactful project where you made key architectural decisions while collaborating closely across product and engineering teams?`;
    } else {
      return `Hello and welcome! I am your interviewer for the ${role} position. Let's begin with a behavioral question using the STAR framework: Can you describe a challenging project or cross-functional disagreement you navigated in your recent work, and what specific actions you took to deliver results?`;
    }
  }
}

export interface AdaptiveResponseResult {
  message: string;
  telemetry: SessionAdaptiveTelemetry;
  evaluation: CandidateEvaluationResult;
}

export async function generateNextAdaptiveResponse(
  sessionId: string,
  userMessage: string,
): Promise<AdaptiveResponseResult> {
  const session = await getSessionById(sessionId);

  if (!session) {
    throw new Error(`Session "${sessionId}" not found`);
  }

  // Look up candidate resume for personalized grounding & JD calibration
  let resumeGrounding = '';
  let jdCalibration = '';
  let claimsGrounding = '';
  const personaGrounding = buildPersonaGrounding(session.persona);
  const practiceModeGrounding = buildPracticeModeGrounding(session.practice_mode);
  const metaGrounding = buildSessionMetaGrounding(session.language, session.target_duration, session.modality);

  if (session.jd_data) {
    jdCalibration = buildJDPromptCalibration(session.jd_data);
  }

  if (session.user_id) {
    try {
      const user = await getUserById(session.user_id);
      if (user?.resume_data) {
        resumeGrounding = buildResumePromptGrounding(user.resume_data);
        const claimsAudit = generateDeterministicClaimsAudit(
          user.resume_data,
          session.jd_data || user.saved_jd_data
        );
        if (claimsAudit?.audited_claims?.length > 0) {
          claimsGrounding = buildClaimsPromptGrounding(claimsAudit.audited_claims);
        }
      }
      if (!jdCalibration && user?.saved_jd_data) {
        jdCalibration = buildJDPromptCalibration(user.saved_jd_data);
      }
    } catch {
      // Ignore background fetch error
    }
  }

  // 1. Retrieve current session telemetry
  const currentTelemetry = getOrCreateSessionTelemetry(
    sessionId,
    session.type,
    session.difficulty,
  );

  // 2. Perform Real-Time Scoring & Branching Evaluation
  const evaluation = evaluateCandidateResponse(
    userMessage,
    currentTelemetry.currentTopic,
    session.type,
  );

  // 3. Update Running Session Telemetry with Evaluation
  const updatedTelemetry = updateSessionTelemetryWithEvaluation(
    sessionId,
    evaluation,
  );

  // 4. Construct Dynamic Prompt with Adaptive Matrix, Branching Instructions, Grounding, Persona & Mode
  const adaptivePromptContext = buildAdaptivePromptContext(updatedTelemetry);
  const systemPrompt = buildSystemPrompt(
    session.type,
    session.role,
    updatedTelemetry.currentDifficultyTier,
    adaptivePromptContext,
    resumeGrounding,
    jdCalibration,
    claimsGrounding,
    personaGrounding,
    practiceModeGrounding,
    metaGrounding,
  );

  let responseText = '';

  try {
    const history = await buildMessageHistory(sessionId);

    const fullContext: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    const truncated = truncateContext(fullContext, {
      maxMessages: MAX_CONTEXT_MESSAGES,
    });

    responseText = await callGeminiAPI(truncated);
  } catch (err: any) {
    console.warn('[interviewer] Fallback for adaptive next response:', err?.message);

    if (session.type.toLowerCase() === 'technical') {
      if (evaluation.branchDecision === 'LEVEL_UP') {
        responseText = `Excellent explanation of ${userMessage.slice(0, 35)}... Let's scale this up to a hard constraint: if we suddenly experience a 50x spike in concurrent writes with strict consistency requirements across regions, how would you prevent split-brain and minimize replication lag?`;
      } else if (evaluation.branchDecision === 'PROBE_DEEPER') {
        responseText = `That covers the baseline. However, digging into the trade-offs: what happens if the worker thread pool is exhausted or a deadlock occurs in that exact flow? Walk me through how you'd diagnose and mitigate that.`;
      } else {
        responseText = `Good point. Let's transition to the next dimension: how would you structure the schema and indexing strategy for high-frequency queries on this dataset?`;
      }
    } else {
      if (evaluation.branchDecision === 'LEVEL_UP') {
        responseText = `That's a very clear summary of the Situation and Task. Now, looking at the Result and leadership dimensions: how did you measure success, what pushback did you handle from executive stakeholders, and what would you improve today?`;
      } else {
        responseText = `Thank you for sharing that context. Focusing specifically on the Action step of the STAR framework: what specific technical or interpersonal decisions did you personally spearhead to resolve the deadlock?`;
      }
    }
  }

  return {
    message: responseText,
    telemetry: updatedTelemetry,
    evaluation,
  };
}

export async function generateNextResponse(
  sessionId: string,
  userMessage: string,
): Promise<string> {
  const result = await generateNextAdaptiveResponse(sessionId, userMessage);
  return result.message;
}
