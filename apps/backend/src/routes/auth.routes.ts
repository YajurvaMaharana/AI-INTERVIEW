// ---------------------------------------------------------------------------
// auth.routes.ts — Authentication endpoints (register & login)
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router: Router = Router();

// ---------------------------------------------------------------------------
// POST /register
//   Create a new user account.
// ---------------------------------------------------------------------------
router.post('/register', register);

// ---------------------------------------------------------------------------
// POST /login
//   Authenticate user and return JWT / session.
// ---------------------------------------------------------------------------
router.post('/login', login);

export default router;
