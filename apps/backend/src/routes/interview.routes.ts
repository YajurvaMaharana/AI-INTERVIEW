// ---------------------------------------------------------------------------
// interview.routes.ts — Interview session and messaging endpoints
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.middleware';
import { createInterview, postMessage } from '../controllers/interview.controller';

const router: Router = Router();

// ---------------------------------------------------------------------------
// POST /api/interviews
//   Create a new interview session and receive the AI's opening question.
// ---------------------------------------------------------------------------
router.post('/api/interviews', verifyAuth, createInterview);

// ---------------------------------------------------------------------------
// POST /api/interviews/:id/message
//   Send a candidate message and receive the AI interviewer's response.
// ---------------------------------------------------------------------------
router.post('/api/interviews/:id/message', verifyAuth, postMessage);

export default router;
