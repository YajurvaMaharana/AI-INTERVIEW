// ---------------------------------------------------------------------------
// interview.controller.ts — Request handlers for interview endpoints
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import {
  createSession,
  getSessionById,
  createMessage,
  getMessagesBySessionId,
} from '../services/db.service';
import {
  generateOpeningQuestion,
  generateNextResponse,
  AITimeoutError,
  AIServiceError,
} from '../services/ai-engine/interviewer';
import type { InterviewType, Difficulty } from '../types/database.types';

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------

/**
 * Interview types that have a corresponding prompt template.
 * `system_design` and `mixed` are not yet supported.
 */
const SUPPORTED_TYPES: readonly InterviewType[] = ['technical', 'behavioral'];

const VALID_DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

/**
 * UUID v1–v5 format. Validates path parameters before querying the DB,
 * preventing PostgreSQL 22P02 ("invalid input syntax for type uuid") errors.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map an AI service error to the appropriate HTTP status code.
 */
function mapAIErrorToStatus(err: unknown): number {
  if (err instanceof AITimeoutError) return 504;
  if (err instanceof AIServiceError) return 502;
  return 500;
}

/**
 * Build a consistent error JSON body.
 */
function errorBody(error: string, message: string): { error: string; message: string } {
  return { error, message };
}

// ---------------------------------------------------------------------------
// POST /api/interviews — Create a new interview session
// ---------------------------------------------------------------------------

/**
 * Creates a new interview session and returns the AI interviewer's
 * opening question.
 *
 * **Request body:**
 * ```json
 * {
 *   "type": "technical" | "behavioral",
 *   "role": "Senior Frontend Developer",
 *   "difficulty": "easy" | "medium" | "hard"
 * }
 * ```
 *
 * **Responses:**
 * - `201` — Session created, opening question returned.
 * - `400` — Missing or invalid fields.
 * - `401` — Unauthorized (handled by `verifyAuth` middleware).
 * - `502` — Upstream AI service error.
 * - `504` — Upstream AI timeout.
 */
export async function createInterview(req: Request, res: Response): Promise<void> {
  try {
    // ---- Extract & validate ------------------------------------------------

    const { type, role, difficulty } = req.body as Partial<{
      type: string;
      role: string;
      difficulty: string;
    }>;

    const missing: string[] = [];
    if (!type) missing.push('type');
    if (!role || typeof role !== 'string' || role.trim().length === 0) missing.push('role');
    if (!difficulty) missing.push('difficulty');

    if (missing.length > 0) {
      res.status(400).json(
        errorBody(
          'Bad Request',
          `Missing required fields: ${missing.join(', ')}. ` +
          `Expected: type (${SUPPORTED_TYPES.join(' | ')}), ` +
          `role (string), difficulty (${VALID_DIFFICULTIES.join(' | ')}).`,
        ),
      );
      return;
    }

    if (!SUPPORTED_TYPES.includes(type as InterviewType)) {
      res.status(400).json(
        errorBody(
          'Bad Request',
          `Invalid type "${type}". Must be one of: ${SUPPORTED_TYPES.join(', ')}.`,
        ),
      );
      return;
    }

    if (!VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
      res.status(400).json(
        errorBody(
          'Bad Request',
          `Invalid difficulty "${difficulty}". Must be one of: ${VALID_DIFFICULTIES.join(', ')}.`,
        ),
      );
      return;
    }

    // ---- Create session ----------------------------------------------------

    const userId = req.user!.id;

    const session = await createSession({
      user_id: userId,
      type: type as InterviewType,
      role: role,
      difficulty: difficulty as Difficulty,
      status: 'in_progress',
    });

    // ---- Generate AI opening question --------------------------------------

    const openingQuestion = await generateOpeningQuestion(
      type as InterviewType,
      role!,
      difficulty as Difficulty,
    );

    // ---- Persist the AI's opening message ----------------------------------

    await createMessage({
      session_id: session.id,
      sender_role: 'ai',
      content: openingQuestion,
      sequence_order: 1,
    });

    // ---- Respond -----------------------------------------------------------

    res.status(201).json({
      sessionId: session.id,
      message: openingQuestion,
    });
  } catch (err: unknown) {
    const status = mapAIErrorToStatus(err);
    const message = err instanceof Error ? err.message : 'Unknown error';

    res.status(status).json(
      errorBody(
        status === 502
          ? 'Bad Gateway'
          : status === 504
            ? 'Gateway Timeout'
            : 'Internal Server Error',
        message,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/interviews/:id/message — Send a message in an interview session
// ---------------------------------------------------------------------------

/**
 * Accepts the user's message, generates the AI interviewer's response,
 * persists both, and returns the AI response.
 *
 * **Request body:**
 * ```json
 * { "message": "My answer to the question is..." }
 * ```
 *
 * **Responses:**
 * - `200` — AI response returned.
 * - `400` — Missing or invalid message body.
 * - `401` — Unauthorized (handled by `verifyAuth` middleware).
 * - `404` — Session not found.
 * - `502` — Upstream AI service error.
 * - `504` — Upstream AI timeout.
 */
export async function postMessage(req: Request, res: Response): Promise<void> {
  try {
    const sessionId = req.params['id'] as string;

    // ---- Validate UUID format (Fix #3) -------------------------------------
    // Reject malformed IDs early to prevent PostgreSQL 22P02 errors from
    // bubbling up as 500 Internal Server Error.

    if (!UUID_REGEX.test(sessionId)) {
      res.status(404).json(
        errorBody('Not Found', `Interview session "${sessionId}" not found.`),
      );
      return;
    }

    // ---- Validate session exists -------------------------------------------

    const session = await getSessionById(sessionId);

    if (!session) {
      res.status(404).json(
        errorBody('Not Found', `Interview session "${sessionId}" not found.`),
      );
      return;
    }

    // ---- Verify ownership — IDOR protection (Fix #2) -----------------------
    // Ensure the authenticated user owns this session. Without this check,
    // any authenticated user could interact with another user's session.

    if (session.user_id !== req.user!.id) {
      res.status(403).json(
        errorBody('Forbidden', 'You do not have access to this interview session.'),
      );
      return;
    }

    // ---- Extract & validate user message -----------------------------------

    const { message } = req.body as Partial<{ message: string }>;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json(
        errorBody(
          'Bad Request',
          'Missing or invalid "message" field. Must be a non-empty string.',
        ),
      );
      return;
    }

    // ---- Determine sequence order ------------------------------------------

    const existingMessages = await getMessagesBySessionId(sessionId);
    const nextOrder = existingMessages.length + 1;

    // ---- Generate AI response BEFORE persisting (Fix #1 + #4) --------------
    // The user message is NOT saved to the DB yet. generateNextResponse()
    // fetches existing history from the DB (which does not yet include this
    // new message) and appends the user message exactly once before calling
    // the LLM. This fixes two defects simultaneously:
    //   • Fix #1: No duplicate user message in the LLM context.
    //   • Fix #4: If the AI call fails/times out, no orphaned user message
    //             is left in the database.

    const aiResponse = await generateNextResponse(sessionId, message.trim());

    // ---- Persist both messages after successful AI generation ---------------

    await createMessage({
      session_id: sessionId,
      sender_role: 'user',
      content: message.trim(),
      sequence_order: nextOrder,
    });

    await createMessage({
      session_id: sessionId,
      sender_role: 'ai',
      content: aiResponse,
      sequence_order: nextOrder + 1,
    });

    // ---- Respond -----------------------------------------------------------

    res.status(200).json({
      message: aiResponse,
    });
  } catch (err: unknown) {
    const status = mapAIErrorToStatus(err);
    const message = err instanceof Error ? err.message : 'Unknown error';

    res.status(status).json(
      errorBody(
        status === 502
          ? 'Bad Gateway'
          : status === 504
            ? 'Gateway Timeout'
            : 'Internal Server Error',
        message,
      ),
    );
  }
}
