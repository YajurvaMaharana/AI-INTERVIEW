import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { type Session, type User, type AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** The current Supabase session, or null if unauthenticated. */
  session: Session | null;
  /** The currently authenticated user, derived from `session`. */
  user: User | null;
  /** True while the provider is restoring a persisted session on startup. */
  isLoading: boolean;
  /** Sign in with email and password. Returns an error message on failure. */
  signIn: (email: string, password: string) => Promise<string | null>;
  /** Create a new account with email and password. Returns an error message on failure. */
  signUp: (email: string, password: string) => Promise<string | null>;
  /** Sign out the current user. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted session on mount & listen for auth state changes.
  useEffect(() => {
    // 1. Restore persisted session.
    supabase.auth.getSession().then(({ data: { session: restoredSession } }: { data: { session: Session | null } }) => {
      setSession(restoredSession);
      setIsLoading(false);
    });

    // 2. Subscribe to future auth state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ---- Auth actions -------------------------------------------------------

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error ? error.message : null;
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signUp({ email, password });
      return error ? error.message : null;
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // ---- Memoised value ----------------------------------------------------

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [session, isLoading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the authentication context. Must be used within an `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
