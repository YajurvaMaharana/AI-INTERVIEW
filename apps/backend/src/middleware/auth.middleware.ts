// ---------------------------------------------------------------------------
// auth.middleware.ts — Supabase JWT verification middleware for Express
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Type augmentation: add `user` to Express Request
// ---------------------------------------------------------------------------

declare global {
  namespace Express {
    interface Request {
      /** Authenticated Supabase user, set by `verifyAuth` middleware. */
      user?: SupabaseUser;
    }
  }
}

// ---------------------------------------------------------------------------
// Lightweight Supabase client used solely for token verification.
// Uses the *anon* key (not the service-role key) so the token's own
// permissions are respected.
// ---------------------------------------------------------------------------

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'] ?? process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be set.',
  );
}

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Express middleware that verifies a Supabase Bearer token.
 *
 * On success: sets `req.user` and calls `next()`.
 * On failure: responds with 401 JSON.
 */
export async function verifyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected "Bearer <token>".',
    });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error?.message ?? 'Invalid or expired token.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token verification failed';
    res.status(401).json({
      error: 'Unauthorized',
      message,
    });
  }
}
