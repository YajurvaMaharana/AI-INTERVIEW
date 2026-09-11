// ---------------------------------------------------------------------------
// auth.middleware.ts — Supabase JWT verification middleware for Express
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../services/db.service';

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
    } = await supabase.auth.getUser(token);

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
