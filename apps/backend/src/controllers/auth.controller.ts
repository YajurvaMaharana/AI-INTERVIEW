// ---------------------------------------------------------------------------
// auth.controller.ts — Request handlers for authentication endpoints
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { supabase, getUserById } from '../services/db.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorBody(error: string, message: string): { error: string; message: string } {
  return { error, message };
}

// ---------------------------------------------------------------------------
// POST /api/auth/register — Register a new user
// ---------------------------------------------------------------------------

/**
 * Registers a new user with email, password, and optional profile data.
 *
 * **Request body:**
 * ```json
 * {
 *   "email": "user@example.com",
 *   "password": "strongpassword",
 *   "displayName": "Jane Doe",
 *   "avatarUrl": "https://example.com/avatar.png"
 * }
 * ```
 *
 * **Responses:**
 * - `201` — User successfully registered.
 * - `400` — Missing or invalid input.
 * - `409` — Email already in use.
 * - `500` — Internal server error.
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const {
      email,
      password,
      displayName,
      display_name,
      avatarUrl,
      avatar_url,
    } = req.body as Partial<{
      email: string;
      password: string;
      displayName: string;
      display_name: string;
      avatarUrl: string;
      avatar_url: string;
    }>;

    // ---- Validation --------------------------------------------------------
    if (
      !email ||
      typeof email !== 'string' ||
      !email.trim() ||
      !password ||
      typeof password !== 'string' ||
      !password.trim()
    ) {
      const missing: string[] = [];
      if (!email || typeof email !== 'string' || !email.trim()) missing.push('email');
      if (!password || typeof password !== 'string' || !password.trim()) missing.push('password');

      res.status(400).json(
        errorBody(
          'Bad Request',
          `Missing required fields: ${missing.join(', ')}.`,
        ),
      );
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      res.status(400).json(
        errorBody('Bad Request', 'Invalid email address format.'),
      );
      return;
    }

    if (password.length < 6) {
      res.status(400).json(
        errorBody('Bad Request', 'Password must be at least 6 characters long.'),
      );
      return;
    }

    const finalDisplayName = (displayName ?? display_name ?? '').trim();
    const finalAvatarUrl = avatarUrl ?? avatar_url ?? null;

    // ---- Supabase Auth Registration ----------------------------------------
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          display_name: finalDisplayName,
          avatar_url: finalAvatarUrl,
        },
      },
    });

    if (error) {
      const isConflict =
        error.status === 422 ||
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists') ||
        (error as unknown as { code?: string }).code === 'user_already_exists';

      res.status(isConflict ? 409 : (error.status || 400)).json(
        errorBody(
          isConflict ? 'Conflict' : 'Bad Request',
          isConflict ? 'A user with this email already exists.' : error.message,
        ),
      );
      return;
    }

    // In Supabase, if email confirmation is enabled and user already exists,
    // signUp returns a user with empty identities instead of an error.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      res.status(409).json(
        errorBody('Conflict', 'A user with this email already exists.'),
      );
      return;
    }

    if (!data.user) {
      res.status(500).json(
        errorBody('Internal Server Error', 'Failed to register user.'),
      );
      return;
    }

    // ---- Persist / Upsert Public User Profile -------------------------------
    let userProfile = null;
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email ?? trimmedEmail,
          display_name: finalDisplayName,
          avatar_url: finalAvatarUrl,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Failed to create/update public user profile:', profileError.message);
      } else {
        userProfile = profile;
      }
    } catch (profileErr: unknown) {
      console.error('Profile upsert exception:', profileErr);
    }

    // ---- Respond -----------------------------------------------------------
    res.status(201).json({
      message: 'User registered successfully.',
      user: userProfile ?? {
        id: data.user.id,
        email: data.user.email ?? trimmedEmail,
        display_name: finalDisplayName,
        avatar_url: finalAvatarUrl,
      },
      session: data.session,
      token: data.session?.access_token ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(
      errorBody('Internal Server Error', message),
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/login — Authenticate user and obtain session/JWT
// ---------------------------------------------------------------------------

/**
 * Authenticates a user with email and password, returning session and JWT tokens.
 *
 * **Request body:**
 * ```json
 * {
 *   "email": "user@example.com",
 *   "password": "strongpassword"
 * }
 * ```
 *
 * **Responses:**
 * - `200` — Authenticated successfully.
 * - `400` — Missing email or password.
 * - `401` — Invalid credentials.
 * - `500` — Internal server error.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as Partial<{
      email: string;
      password: string;
    }>;

    // ---- Validation --------------------------------------------------------
    if (
      !email ||
      typeof email !== 'string' ||
      !email.trim() ||
      !password ||
      typeof password !== 'string' ||
      !password.trim()
    ) {
      const missing: string[] = [];
      if (!email || typeof email !== 'string' || !email.trim()) missing.push('email');
      if (!password || typeof password !== 'string' || !password.trim()) missing.push('password');

      res.status(400).json(
        errorBody(
          'Bad Request',
          `Missing required fields: ${missing.join(', ')}.`,
        ),
      );
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    // ---- Supabase Auth Login -----------------------------------------------
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      const isInvalidCredentials =
        error.status === 400 ||
        error.message.toLowerCase().includes('invalid login credentials') ||
        error.message.toLowerCase().includes('invalid credentials');

      res.status(isInvalidCredentials ? 401 : (error.status || 400)).json(
        errorBody(
          isInvalidCredentials ? 'Unauthorized' : 'Bad Request',
          error.message,
        ),
      );
      return;
    }

    if (!data.user) {
      res.status(401).json(
        errorBody('Unauthorized', 'Authentication failed. No user returned.'),
      );
      return;
    }

    // ---- Retrieve Public User Profile --------------------------------------
    let profile = null;
    try {
      profile = await getUserById(data.user.id);
    } catch {
      // Ignore error, fallback to metadata
    }

    // ---- Respond -----------------------------------------------------------
    res.status(200).json({
      message: 'Login successful.',
      user: profile ?? {
        id: data.user.id,
        email: data.user.email ?? trimmedEmail,
        display_name: (data.user.user_metadata?.['display_name'] as string) ?? '',
        avatar_url: (data.user.user_metadata?.['avatar_url'] as string) ?? null,
      },
      session: data.session,
      token: data.session?.access_token ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(
      errorBody('Internal Server Error', message),
    );
  }
}
