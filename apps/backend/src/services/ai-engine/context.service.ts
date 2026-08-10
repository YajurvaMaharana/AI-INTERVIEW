// ---------------------------------------------------------------------------
// context.service.ts — Conversation context builder & token budget manager
// ---------------------------------------------------------------------------
//
// Provider-agnostic: exports types and pure functions that work with any
// Claude / OpenAI-style chat completion API.
// ---------------------------------------------------------------------------

import { getMessagesBySessionId } from '../db.service';
import type { InterviewMessage, Difficulty } from '../../types/database.types';

// ---------------------------------------------------------------------------
// 1. Provider-agnostic types
// ---------------------------------------------------------------------------

/** Standard chat message format used by Claude & OpenAI APIs. */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Variables that can be injected into prompt templates. */
export interface PromptVariables {
  role: string;
  difficulty: Difficulty;
  [key: string]: string;
}

/** Options for the context budget trimmer. */
export interface ContextBudgetOptions {
  /**
   * Maximum number of messages (including the system prompt) to retain.
   * Defaults to 40.
   */
  maxMessages?: number;

  /**
   * Approximate maximum token count for all messages combined.
   * Uses a rough 1 token ≈ 4 characters heuristic.
   * Defaults to 100 000 (~400 000 chars).
   */
  maxTokens?: number;
}

// ---------------------------------------------------------------------------
// 2. Prompt template injection
// ---------------------------------------------------------------------------

/**
 * Replace `{{variable}}` placeholders in a prompt template with values from
 * the supplied `variables` map.
 *
 * Unknown placeholders are left untouched so downstream code can detect
 * missing injections.
 *
 * @example
 * ```ts
 * const filled = injectPromptVariables(TECHNICAL_PROMPT, {
 *   role: 'Backend Engineer',
 *   difficulty: 'hard',
 * });
 * ```
 */
export function injectPromptVariables(
  template: string,
  variables: PromptVariables,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    return key in variables ? variables[key] : `{{${key}}}`;
  });
}

// ---------------------------------------------------------------------------
// 3. DB → ChatMessage[] conversion
// ---------------------------------------------------------------------------

/**
 * Map a database `SenderRole` to the chat-API `role`.
 *
 * - `'user'`  → `'user'`
 * - `'ai'`    → `'assistant'`
 */
function mapSenderRole(senderRole: InterviewMessage['sender_role']): 'user' | 'assistant' {
  return senderRole === 'ai' ? 'assistant' : 'user';
}

/**
 * Fetch stored conversation messages for a session and convert them into
 * the provider-agnostic `ChatMessage[]` format, ordered chronologically
 * by `sequence_order`.
 *
 * **Does NOT include the system prompt** — callers should prepend it via
 * `applyContextBudget()` or manually.
 */
export async function buildMessageHistory(sessionId: string): Promise<ChatMessage[]> {
  const dbMessages: InterviewMessage[] = await getMessagesBySessionId(sessionId);

  return dbMessages.map((msg): ChatMessage => ({
    role: mapSenderRole(msg.sender_role),
    content: msg.content,
  }));
}

// ---------------------------------------------------------------------------
// 4. Context / token budget management (pure, testable function)
// ---------------------------------------------------------------------------

/** Rough token estimate: ~4 characters per token for English text. */
const CHARS_PER_TOKEN = 4;

/**
 * Estimate the token count of a single message (content + role overhead).
 * Adds a small overhead (~4 tokens) per message for role/metadata framing.
 */
function estimateTokens(message: ChatMessage): number {
  const overhead = 4; // role label + separators
  return overhead + Math.ceil(message.content.length / CHARS_PER_TOKEN);
}

/**
 * Trim the conversation to fit within a **message count** and
 * **approximate token budget**, while preserving:
 *
 * 1. The **system prompt** (always the first element, never trimmed).
 * 2. **Recent conversation** — keeps the most recent messages.
 * 3. **Question/answer pair integrity** — never splits a user message
 *    from its immediately following assistant reply (or vice-versa).
 *
 * ### Algorithm
 *
 * Starting from the most recent message, walk backwards and include
 * messages as long as both budgets allow. If including a message would
 * split a user↔assistant pair, include the paired message too (or drop
 * both if neither fits).
 *
 * @param systemPrompt - The system-level instruction message.
 * @param conversation - The user/assistant messages (no system messages).
 * @param options      - Budget limits.
 * @returns A trimmed `ChatMessage[]` array starting with the system prompt.
 *
 * @example
 * ```ts
 * const history = await buildMessageHistory(sessionId);
 * const systemMsg: ChatMessage = { role: 'system', content: filledPrompt };
 * const trimmed = applyContextBudget(systemMsg, history, { maxMessages: 20 });
 * // trimmed[0] is always the system prompt
 * ```
 */
export function applyContextBudget(
  systemPrompt: ChatMessage,
  conversation: ChatMessage[],
  options: ContextBudgetOptions = {},
): ChatMessage[] {
  const maxMessages = options.maxMessages ?? 40;
  const maxTokens = options.maxTokens ?? 100_000;

  // Reserve budget for the system prompt.
  const systemTokens = estimateTokens(systemPrompt);
  let remainingTokens = maxTokens - systemTokens;
  // -1 because the system prompt takes one message slot.
  let remainingSlots = maxMessages - 1;

  if (remainingTokens <= 0 || remainingSlots <= 0) {
    // Budget only fits the system prompt itself.
    return [systemPrompt];
  }

  // Walk backwards through the conversation, collecting messages.
  const kept: ChatMessage[] = [];
  let i = conversation.length - 1;

  while (i >= 0 && remainingSlots > 0 && remainingTokens > 0) {
    const current = conversation[i];
    const currentTokens = estimateTokens(current);

    // Check if we need to keep a paired message to avoid splitting an exchange.
    // A "pair" is a user message followed by an assistant message (or vice-versa).
    const hasPrev = i - 1 >= 0;
    const prevMsg = hasPrev ? conversation[i - 1] : null;
    const isPairedWithPrev =
      prevMsg !== null &&
      ((current.role === 'assistant' && prevMsg.role === 'user') ||
        (current.role === 'user' && prevMsg.role === 'assistant'));

    if (isPairedWithPrev && prevMsg !== null) {
      // Try to include both the current message and its pair.
      const prevTokens = estimateTokens(prevMsg);
      const pairTokens = currentTokens + prevTokens;

      if (pairTokens <= remainingTokens && remainingSlots >= 2) {
        // Both fit — include the pair.
        kept.unshift(current);
        kept.unshift(prevMsg);
        remainingTokens -= pairTokens;
        remainingSlots -= 2;
        i -= 2;
      } else {
        // The pair doesn't fit as a whole — stop to avoid orphaning.
        break;
      }
    } else {
      // No pair constraint (e.g. first message is user with no preceding assistant).
      if (currentTokens <= remainingTokens) {
        kept.unshift(current);
        remainingTokens -= currentTokens;
        remainingSlots -= 1;
        i -= 1;
      } else {
        break;
      }
    }
  }

  return [systemPrompt, ...kept];
}

// ---------------------------------------------------------------------------
// 5. Convenience: build the full context array in one call
// ---------------------------------------------------------------------------

/**
 * High-level helper that:
 * 1. Fetches conversation history from the DB.
 * 2. Prepends a system prompt (with variables injected).
 * 3. Trims to fit within the context budget.
 *
 * @returns A `ChatMessage[]` ready to send to Claude / OpenAI.
 */
export async function buildContext(
  sessionId: string,
  promptTemplate: string,
  variables: PromptVariables,
  budgetOptions?: ContextBudgetOptions,
): Promise<ChatMessage[]> {
  const systemContent = injectPromptVariables(promptTemplate, variables);
  const systemMessage: ChatMessage = { role: 'system', content: systemContent };

  const history = await buildMessageHistory(sessionId);

  return applyContextBudget(systemMessage, history, budgetOptions);
}
