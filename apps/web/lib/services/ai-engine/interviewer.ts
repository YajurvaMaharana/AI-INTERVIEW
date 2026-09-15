// ---------------------------------------------------------------------------
// interviewer.ts — AI interviewer service: prompt selection, LLM calls,
//                  and typed error handling
// ---------------------------------------------------------------------------

import { GoogleGenAI } from '@google/genai';
import { TECHNICAL_SYSTEM_PROMPT } from './prompts/technical.prompt';
import { HR_SYSTEM_PROMPT } from './prompts/hr.prompt';
import {
  buildMessageHistory,
  injectPromptVariables,
  truncateContext,
} from './context.service';
import type { ChatMessage, PromptVariables } from './context.service';
import type { InterviewType, Difficulty } from '../../types/database.types';
import { getSessionById } from '../db.service';

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
  const modelName = process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash';

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

function getSystemPromptTemplate(type: InterviewType): string {
  switch (type.toLowerCase()) {
    case 'technical':
      return TECHNICAL_SYSTEM_PROMPT;
    case 'behavioral':
    case 'hr':
      return HR_SYSTEM_PROMPT;
    default:
      throw new Error(
        `Unsupported interview type "${type}". Only "technical" and "behavioral/hr" are supported.`,
      );
  }
}

function buildSystemPrompt(
  type: InterviewType,
  role: string,
  difficulty: string,
): string {
  const template = getSystemPromptTemplate(type);
  const variables: PromptVariables = { role, difficulty };
  return injectPromptVariables(template, variables);
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

    const result = await client.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: systemMessage?.content,
      }
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
  type: InterviewType,
  role: string,
  difficulty: Difficulty,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(type, role, difficulty);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  return callGeminiAPI(messages);
}

export async function generateNextResponse(
  sessionId: string,
  userMessage: string,
): Promise<string> {
  const session = await getSessionById(sessionId);

  if (!session) {
    throw new Error(`Session "${sessionId}" not found`);
  }

  const systemPrompt = buildSystemPrompt(
    session.type,
    session.role,
    session.difficulty,
  );

  const history = await buildMessageHistory(sessionId);

  const fullContext: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const truncated = truncateContext(fullContext, {
    maxMessages: MAX_CONTEXT_MESSAGES,
  });

  return callGeminiAPI(truncated);
}
