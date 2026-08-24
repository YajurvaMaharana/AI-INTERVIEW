// ---------------------------------------------------------------------------
// interviewer.ts — AI interviewer service: prompt selection, LLM calls,
//                  and typed error handling
// ---------------------------------------------------------------------------

import { GoogleGenerativeAI } from '@google/generative-ai';
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
// Typed errors — allow the controller to map failures to HTTP status codes
// ---------------------------------------------------------------------------

/**
 * Thrown when the AI provider does not respond within the configured timeout.
 * The controller should map this to **504 Gateway Timeout**.
 */
export class AITimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`AI service did not respond within ${timeoutMs}ms`);
    this.name = 'AITimeoutError';
  }
}

/**
 * Thrown when the AI provider returns a non-timeout error (auth failure,
 * rate limit, malformed response, etc.).
 * The controller should map this to **502 Bad Gateway**.
 */
export class AIServiceError extends Error {
  /** The original upstream error, if available. */
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'AIServiceError';
    this.cause = cause;
  }
}

// ---------------------------------------------------------------------------
// Gemini client initialisation
// ---------------------------------------------------------------------------

const apiKey = process.env['GEMINI_API_KEY'];
const modelName = process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash';

if (!apiKey) {
  throw new Error(
    'Missing required environment variable: GEMINI_API_KEY must be set.',
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Timeout for a single AI call (ms). Generous to cover 5–10s normal latency. */
const AI_TIMEOUT_MS = 30_000;

/** Maximum number of non-system messages to retain in context. */
const MAX_CONTEXT_MESSAGES = 40;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the correct raw system prompt template for a given interview type.
 * Only `'technical'` and `'behavioral'` are currently supported — other types
 * will cause the caller to return 400 before reaching this function.
 */
function getSystemPromptTemplate(type: InterviewType): string {
  switch (type) {
    case 'technical':
      return TECHNICAL_SYSTEM_PROMPT;
    case 'behavioral':
      return HR_SYSTEM_PROMPT;
    default:
      throw new Error(
        `Unsupported interview type "${type}". Only "technical" and "behavioral" are supported.`,
      );
  }
}

/**
 * Build a hydrated system prompt by injecting role and difficulty into
 * the selected template.
 */
function buildSystemPrompt(
  type: InterviewType,
  role: string,
  difficulty: string,
): string {
  const template = getSystemPromptTemplate(type);
  const variables: PromptVariables = { role, difficulty };
  return injectPromptVariables(template, variables);
}

/**
 * Call the Gemini API with the given message array.
 *
 * Wraps the call with an `AbortController` timeout so the server never
 * hangs indefinitely. Maps known failure modes to the typed error classes.
 */
async function callGeminiAPI(messages: ChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    // Separate the system instruction from the conversation history.
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    // Build the contents array for Gemini.
    const contents = conversationMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent(
      {
        contents,
        systemInstruction: systemMessage
          ? { role: 'user', parts: [{ text: systemMessage.content }] }
          : undefined,
      },
      { signal: controller.signal } as RequestOptions,
    );

    const text = result.response.text();

    if (!text) {
      throw new AIServiceError('AI returned an empty response');
    }

    return text;
  } catch (err: unknown) {
    // Abort signal triggered → timeout
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AITimeoutError(AI_TIMEOUT_MS);
    }

    // Already a typed error we threw — re-throw as-is
    if (err instanceof AITimeoutError || err instanceof AIServiceError) {
      throw err;
    }

    // Wrap any other upstream failure
    const cause = err instanceof Error ? err : new Error(String(err));
    throw new AIServiceError(`AI service call failed: ${cause.message}`, cause);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Workaround: Gemini SDK RequestOptions type import
// ---------------------------------------------------------------------------
// The @google/generative-ai SDK exports `RequestOptions` but the exact
// import path varies by version. We define a minimal compatible interface
// here so the abort signal can be forwarded.

interface RequestOptions {
  signal?: AbortSignal;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate the AI interviewer's opening question for a new session.
 *
 * @param type       - The interview type (`'technical'` or `'behavioral'`).
 * @param role       - Target job role, e.g. `"Senior Frontend Developer"`.
 * @param difficulty - Difficulty tier (`'easy'` | `'medium'` | `'hard'`).
 * @returns The AI's first interview question.
 *
 * @throws {AITimeoutError}  If the AI does not respond in time (→ 504).
 * @throws {AIServiceError}  If the AI returns an error (→ 502).
 */
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

/**
 * Generate the AI interviewer's next response in an ongoing conversation.
 *
 * 1. Fetches the session to determine interview type, role, and difficulty.
 * 2. Builds the message history from the database.
 * 3. Appends the new user message.
 * 4. Truncates the context to fit the token budget.
 * 5. Calls the AI and returns the response.
 *
 * @param sessionId   - UUID of the interview session.
 * @param userMessage - The candidate's latest message.
 * @returns The AI interviewer's response.
 *
 * @throws {AITimeoutError}  If the AI does not respond in time (→ 504).
 * @throws {AIServiceError}  If the AI returns an error (→ 502).
 * @throws {Error}           If the session is not found (should be caught
 *                           by the controller before calling this).
 */
export async function generateNextResponse(
  sessionId: string,
  userMessage: string,
): Promise<string> {
  // 1. Fetch session metadata to determine the prompt type.
  const session = await getSessionById(sessionId);

  if (!session) {
    throw new Error(`Session "${sessionId}" not found`);
  }

  // 2. Build the hydrated system prompt.
  const systemPrompt = buildSystemPrompt(
    session.type,
    session.role,
    session.difficulty,
  );

  // 3. Fetch existing conversation history.
  const history = await buildMessageHistory(sessionId);

  // 4. Assemble full context: system + history + new user message.
  const fullContext: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  // 5. Truncate to fit within context budget.
  const truncated = truncateContext(fullContext, {
    maxMessages: MAX_CONTEXT_MESSAGES,
  });

  return callGeminiAPI(truncated);
}
