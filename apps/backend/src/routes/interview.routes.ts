// ---------------------------------------------------------------------------
// interview.routes.ts — POST /api/interview/generate
// ---------------------------------------------------------------------------

import { Router, Request, Response } from 'express';

const router: Router = Router();

// ---- Types ----------------------------------------------------------------

type InterviewType = 'technical' | 'hr';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface GenerateRequestBody {
  role: string;
  difficulty: Difficulty;
  type: InterviewType;
}

// ---- System prompts -------------------------------------------------------

const SYSTEM_PROMPTS: Record<InterviewType, string> = {
  technical: [
    'You are a senior technical interviewer.',
    'Generate a single, focused coding or system-design interview question.',
    'Tailor the difficulty and topic to the candidate\'s target role and level.',
    'Return ONLY the question text — no preamble, no answer.',
  ].join(' '),

  hr: [
    'You are an experienced HR interviewer.',
    'Generate a single behavioural or situational interview question.',
    'Tailor the question to the candidate\'s target role and seniority.',
    'Return ONLY the question text — no preamble, no answer.',
  ].join(' '),
};

// ---- Helpers --------------------------------------------------------------

const VALID_TYPES: InterviewType[] = ['technical', 'hr'];
const VALID_DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

/**
 * Placeholder for the real LLM service call.
 *
 * Replace this with an actual API call to your LLM provider
 * (e.g. OpenAI, Gemini, Anthropic) once the service layer is ready.
 */
async function callLLMService(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  // TODO: Replace with real LLM API call.
  // Example:
  //   const response = await llmClient.chat({
  //     system: systemPrompt,
  //     user: userPrompt,
  //   });
  //   return response.text;

  return `[Simulated LLM response] — System prompt: "${systemPrompt.slice(0, 60)}…" | User prompt: "${userPrompt}"`;
}

// ---- Route ----------------------------------------------------------------

/**
 * POST /api/interview/generate
 *
 * Body (JSON):
 *   - role       (string)  – e.g. "Senior Frontend Developer"
 *   - difficulty  (string)  – "beginner" | "intermediate" | "advanced"
 *   - type       (string)  – "technical" | "hr"
 *
 * Returns 200 with the generated question, or 400 on validation errors.
 */
router.post(
  '/api/interview/generate',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { role, difficulty, type } = req.body as Partial<GenerateRequestBody>;

      // --- Validate required fields ----------------------------------------

      const missing: string[] = [];
      if (!role) missing.push('role');
      if (!difficulty) missing.push('difficulty');
      if (!type) missing.push('type');

      if (missing.length > 0) {
        res.status(400).json({
          error: 'Missing required fields',
          missing,
          expected: {
            role: 'string — e.g. "Junior Backend Developer"',
            difficulty: VALID_DIFFICULTIES.join(' | '),
            type: VALID_TYPES.join(' | '),
          },
        });
        return;
      }

      // --- Validate enum values --------------------------------------------

      if (!VALID_TYPES.includes(type!)) {
        res.status(400).json({
          error: `Invalid type "${type}". Must be one of: ${VALID_TYPES.join(', ')}`,
        });
        return;
      }

      if (!VALID_DIFFICULTIES.includes(difficulty!)) {
        res.status(400).json({
          error: `Invalid difficulty "${difficulty}". Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
        });
        return;
      }

      // --- Build prompts & call LLM ----------------------------------------

      const systemPrompt = SYSTEM_PROMPTS[type!];
      const userPrompt = `Role: ${role} | Difficulty: ${difficulty}`;

      const question = await callLLMService(systemPrompt, userPrompt);

      // --- Respond ----------------------------------------------------------

      res.status(200).json({
        question,
        meta: {
          role,
          difficulty,
          type,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({
        error: 'Failed to generate interview question',
        details: message,
      });
    }
  },
);

export default router;
