// ---------------------------------------------------------------------------
// context.service.ts — Provider-agnostic context building, token budgeting,
//                      and prompt template injection
// ---------------------------------------------------------------------------

import { getMessagesBySessionId } from '../db.service';
import type { SenderRole } from '../../types/database.types';

// ---------------------------------------------------------------------------
// Types & Interfaces — reusable across any LLM provider
// ---------------------------------------------------------------------------

/** Chat-completion role compatible with OpenAI, Anthropic, and similar APIs. */
export type ChatRole = 'user' | 'assistant' | 'system';

/**
 * A single message in the chat-completion message array.
 * This is the universal format consumed by all downstream AI providers.
 */
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/**
 * Options that control how the context window is trimmed.
 *
 * Exactly one of `maxMessages` or `maxTokens` should be provided.
 * If both are supplied, `maxTokens` takes precedence.
 */
export interface TruncationOptions {
  /**
   * Maximum number of non-system messages to retain.
   * The system prompt is always preserved outside this count.
   */
  maxMessages?: number;

  /**
   * Approximate token budget for the entire message array (system prompt
   * included). Uses the `estimateTokens` heuristic — NOT a real tokeniser.
   */
  maxTokens?: number;
}

/** Variables that can be injected into a prompt template string. */
export interface PromptVariables {
  role: string;
  difficulty: string;
  [key: string]: string;
}

/**
 * Shape of a raw conversation record as stored in the database.
 *
 * This is the input format that `buildContext` accepts — it decouples the
 * context-building logic from the exact Supabase row type so it can also be
 * used with manually constructed test data or alternative data sources.
 */
export interface RawDatabaseMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

/**
 * Configuration for `buildContext`.
 */
export interface BuildContextOptions {
  /** The system prompt to place at index 0 of the returned array. */
  systemPrompt: string;

  /** Raw conversation messages from the database (in any order). */
  messages: readonly RawDatabaseMessage[];

  /**
   * Maximum number of *conversation* messages (excluding the system prompt)
   * to include in the result. Oldest messages are dropped first, always in
   * user/assistant pairs to preserve conversational continuity.
   *
   * When omitted, all messages are retained.
   */
  maxMessages?: number;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Convert the database's `SenderRole` to the provider-agnostic `ChatRole`.
 *
 * The DB stores `'user'` and `'ai'`; chat APIs expect `'user'` and
 * `'assistant'`.
 */
function mapSenderRoleToChatRole(senderRole: SenderRole): ChatRole {
  switch (senderRole) {
    case 'user':
      return 'user';
    case 'ai':
      return 'assistant';
    default: {
      // Exhaustive check — TypeScript will flag unhandled values at compile time.
      const _exhaustive: never = senderRole;
      throw new Error(`Unknown sender_role: ${_exhaustive}`);
    }
  }
}

/**
 * Map the raw DB sender value (`'user'` | `'ai'`) to the LLM API role.
 * Identical logic to `mapSenderRoleToChatRole` but accepts the looser
 * `RawDatabaseMessage.sender` type so callers don't need to cast.
 */
function mapRawSenderToChatRole(sender: RawDatabaseMessage['sender']): ChatRole {
  return sender === 'ai' ? 'assistant' : 'user';
}

// ---------------------------------------------------------------------------
// buildMessageHistory — fetches from DB and converts to ChatMessage[]
// ---------------------------------------------------------------------------

/**
 * Fetch all conversation messages for a session from the database and
 * return them as a chronologically ordered `ChatMessage[]`.
 *
 * The returned array does **not** include a system prompt — prepend one
 * yourself before sending to the LLM.
 *
 * @param sessionId - The UUID of the interview session.
 * @returns Ordered array of `{ role, content }` objects.
 */
export async function buildMessageHistory(sessionId: string): Promise<ChatMessage[]> {
  const dbMessages = await getMessagesBySessionId(sessionId);

  return dbMessages.map((msg) => ({
    role: mapSenderRoleToChatRole(msg.sender_role),
    content: msg.content,
  }));
}

// ---------------------------------------------------------------------------
// Token estimation (lightweight heuristic)
// ---------------------------------------------------------------------------

/**
 * Rough token-count estimate: ~4 characters per token for English text.
 *
 * This is intentionally a simple heuristic so the module has zero external
 * dependencies. Swap in `tiktoken` or a provider SDK if you need precision.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Sum the estimated token count for an array of messages.
 */
function sumTokens(messages: ChatMessage[]): number {
  return messages.reduce((total, msg) => total + estimateTokens(msg.content), 0);
}

// ---------------------------------------------------------------------------
// truncateContext — pure, testable context-window trimming
// ---------------------------------------------------------------------------

/**
 * Trim a message array to fit within a budget while preserving:
 *
 * 1. **The system prompt** — always kept at position 0.
 * 2. **Conversation continuity** — messages are removed in pairs
 *    (user + assistant) from the *oldest* end so that a question is never
 *    orphaned from its answer.
 * 3. **The most recent exchange** — the newest messages are always retained.
 *
 * ### Algorithm
 *
 * ```
 * [ system | …oldest pairs… | …newest pairs… ]
 *            ↑ removed first   ↑ kept
 * ```
 *
 * @param messages  – Full message array. The first element **must** have
 *                    `role: 'system'`; the rest are user/assistant turns.
 * @param options   – Truncation budget (see `TruncationOptions`).
 * @returns A new array (never mutates the input) fitting the budget.
 */
export function truncateContext(
  messages: readonly ChatMessage[],
  options: TruncationOptions,
): ChatMessage[] {
  if (messages.length === 0) {
    return [];
  }

  // Separate system prompt from conversation turns.
  const systemMessage: ChatMessage | undefined =
    messages[0].role === 'system' ? messages[0] : undefined;

  const conversation: ChatMessage[] = systemMessage
    ? messages.slice(1)
    : [...messages];

  // ---- Group conversation into exchange pairs (user + assistant) ----------

  const pairs: ChatMessage[][] = [];
  let i = 0;

  while (i < conversation.length) {
    const current = conversation[i];

    // If a user message is immediately followed by an assistant message,
    // group them as a pair. Otherwise treat the message as a solo unit
    // (e.g. trailing user message awaiting an AI reply).
    if (
      current.role === 'user' &&
      i + 1 < conversation.length &&
      conversation[i + 1].role === 'assistant'
    ) {
      pairs.push([current, conversation[i + 1]]);
      i += 2;
    } else {
      pairs.push([current]);
      i += 1;
    }
  }

  // ---- Apply budget -------------------------------------------------------

  const { maxMessages, maxTokens } = options;

  // Token-based truncation takes precedence when both options are supplied.
  if (maxTokens !== undefined) {
    return truncateByTokens(systemMessage, pairs, maxTokens);
  }

  if (maxMessages !== undefined) {
    return truncateByMessageCount(systemMessage, pairs, maxMessages);
  }

  // No truncation requested — return a shallow copy.
  return [...messages];
}

// ---- Internal truncation strategies ---------------------------------------

function truncateByMessageCount(
  systemMessage: ChatMessage | undefined,
  pairs: ChatMessage[][],
  maxNonSystemMessages: number,
): ChatMessage[] {
  const result: ChatMessage[] = [];

  // Work backwards from the newest pairs, accumulating until we hit the limit.
  let count = 0;

  for (let idx = pairs.length - 1; idx >= 0; idx--) {
    const pair = pairs[idx];
    if (count + pair.length > maxNonSystemMessages) break;
    result.unshift(...pair);
    count += pair.length;
  }

  if (systemMessage) {
    result.unshift(systemMessage);
  }

  return result;
}

function truncateByTokens(
  systemMessage: ChatMessage | undefined,
  pairs: ChatMessage[][],
  tokenBudget: number,
): ChatMessage[] {
  let remaining = tokenBudget;

  // Reserve budget for the system prompt first.
  if (systemMessage) {
    remaining -= estimateTokens(systemMessage.content);
    if (remaining <= 0) {
      // Edge case: system prompt alone exceeds budget. Return it anyway.
      return [systemMessage];
    }
  }

  const result: ChatMessage[] = [];

  // Work backwards from the newest pairs.
  for (let idx = pairs.length - 1; idx >= 0; idx--) {
    const pair = pairs[idx];
    const pairTokens = sumTokens(pair);

    if (pairTokens > remaining) break;

    result.unshift(...pair);
    remaining -= pairTokens;
  }

  if (systemMessage) {
    result.unshift(systemMessage);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Prompt template injection
// ---------------------------------------------------------------------------

/**
 * Replace `{{variable}}` placeholders in a prompt template string with the
 * corresponding values from a `PromptVariables` map.
 *
 * Unmatched placeholders are left as-is so downstream code can detect them.
 *
 * @example
 * ```ts
 * const prompt = injectPromptVariables(
 *   TECHNICAL_SYSTEM_PROMPT,
 *   { role: 'Senior Frontend Developer', difficulty: 'hard' },
 * );
 * ```
 */
export function injectPromptVariables(
  template: string,
  variables: PromptVariables,
): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (_match: string, key: string): string => {
      if (key in variables) {
        return variables[key];
      }
      // Leave unmatched placeholders intact for visibility.
      return `{{${key}}}`;
    },
  );
}

// ---------------------------------------------------------------------------
// buildContext — high-level, all-in-one context builder
// ---------------------------------------------------------------------------

/**
 * Build a complete, LLM-ready message array from raw database records.
 *
 * This is the primary entry point for preparing a chat-completion request.
 * It performs three steps in a single call:
 *
 * 1. **Map** each raw DB message (`sender` / `text`) into the strict
 *    `ChatMessage` format (`role` / `content`).
 * 2. **Sort** messages chronologically by `timestamp`.
 * 3. **Prepend** the system prompt at index 0.
 * 4. **Truncate** — if `maxMessages` is set, drop the oldest conversation
 *    messages (in user/assistant pairs) while always preserving the system
 *    prompt and the most recent exchanges.
 *
 * @example
 * ```ts
 * const context = buildContext({
 *   systemPrompt: injectedTechnicalPrompt,
 *   messages: rawDbRows,
 *   maxMessages: 20,
 * });
 * // → [{ role: 'system', … }, { role: 'user', … }, { role: 'assistant', … }, …]
 * ```
 */
export function buildContext(options: BuildContextOptions): ChatMessage[] {
  const { systemPrompt, messages, maxMessages } = options;

  // 1. Sort raw messages by timestamp (oldest first).
  const sorted = [...messages].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  // 2. Map DB shape → ChatMessage shape.
  const mapped: ChatMessage[] = sorted.map((msg) => ({
    role: mapRawSenderToChatRole(msg.sender),
    content: msg.text,
  }));

  // 3. Prepend system prompt.
  const full: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...mapped,
  ];

  // 4. Truncate if a budget was specified.
  if (maxMessages !== undefined) {
    return truncateContext(full, { maxMessages });
  }

  return full;
}
