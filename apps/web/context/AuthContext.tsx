"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isValidUUID, emailToUUID } from "@/lib/supabase/env";

export interface NormalizedUser {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string | null;
  bio?: string;
  target_role?: string;
  user_metadata?: {
    display_name?: string;
    full_name?: string;
    bio?: string;
    target_role?: string;
    avatar_url?: string | null;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface AuthContextType {
  user: User | NormalizedUser | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  syncUser: (
    rawUser: any,
    accessToken?: string,
    displayNameOverride?: string
  ) => Promise<{ id: string; email: string; display_name: string }>;
  updateUserProfile: (updates: {
    display_name?: string;
    bio?: string;
    target_role?: string;
    avatar_url?: string | null;
  }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | NormalizedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSigningOutRef = useRef(false);

  // Synchronize user to public.users table and local persistence
  const syncUser = useCallback(
    async (
      rawUser: any,
      accessToken?: string,
      displayNameOverride?: string
    ) => {
      if (!rawUser) {
        throw new Error("Cannot sync null user");
      }

      const email = (rawUser.email || "").trim().toLowerCase();
      const id =
        rawUser.id && isValidUUID(rawUser.id)
          ? rawUser.id
          : emailToUUID(email || "candidate@example.com");

      const displayName =
        displayNameOverride ||
        rawUser.user_metadata?.display_name ||
        rawUser.user_metadata?.full_name ||
        rawUser.display_name ||
        (email.includes("@") ? email.split("@")[0] : "Candidate");

      const bio = rawUser.bio || rawUser.user_metadata?.bio || "";
      const targetRole = rawUser.target_role || rawUser.user_metadata?.target_role || "Full-Stack Software Engineer";
      const avatarUrl = rawUser.avatar_url || rawUser.user_metadata?.avatar_url || null;

      const userPayload = {
        id,
        email,
        display_name: displayName,
        avatar_url: avatarUrl,
        bio,
        target_role: targetRole,
        user_metadata: {
          display_name: displayName,
          full_name: displayName,
          bio,
          target_role: targetRole,
          avatar_url: avatarUrl,
          ...(rawUser.user_metadata || {}),
        },
      };

      // 1. Immediately persist to localStorage and Cookie for SSR & immediate client access
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sb-mock-user", JSON.stringify(userPayload));
          document.cookie = `sb-mock-auth=${encodeURIComponent(
            JSON.stringify(userPayload)
          )}; path=/; max-age=604800; SameSite=Lax`;
        } catch {
          // Ignore local storage error
        }
      }

      // 2. Perform upsert into public.users table directly and via /api/auth/sync
      const supabase = createClient();
      try {
        await Promise.allSettled([
          supabase.from("users").upsert(
            {
              id,
              email,
              display_name: displayName,
              avatar_url: userPayload.avatar_url,
              bio,
              target_role: targetRole,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          ),
          fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: userPayload,
              accessToken: accessToken || "mock-token",
            }),
          }),
        ]);
      } catch (e) {
        console.warn("[AuthContext] Background sync notice:", e);
      }

      // Update state
      setUser(userPayload as any);
      return { id, email, display_name: displayName };
    },
    []
  );

  // Update candidate profile with direct Supabase + local cache sync
  const updateUserProfile = useCallback(
    async (updates: {
      display_name?: string;
      bio?: string;
      target_role?: string;
      avatar_url?: string | null;
    }): Promise<boolean> => {
      if (!user?.id) return false;

      const currentId = user.id;
      const currentEmail = user.email || "candidate@example.com";
      const newDisplayName = updates.display_name !== undefined ? updates.display_name : (user as any).display_name || "Candidate";
      const newBio = updates.bio !== undefined ? updates.bio : (user as any).bio || "";
      const newRole = updates.target_role !== undefined ? updates.target_role : (user as any).target_role || "Full-Stack Software Engineer";
      const newAvatar = updates.avatar_url !== undefined ? updates.avatar_url : (user as any).avatar_url || null;

      const updatedUserPayload: NormalizedUser = {
        ...user,
        id: currentId,
        email: currentEmail,
        display_name: newDisplayName,
        bio: newBio,
        target_role: newRole,
        avatar_url: newAvatar,
        user_metadata: {
          ...(user.user_metadata || {}),
          display_name: newDisplayName,
          full_name: newDisplayName,
          bio: newBio,
          target_role: newRole,
          avatar_url: newAvatar,
        },
      };

      // 1. Update local state & storage immediately
      setUser(updatedUserPayload);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sb-mock-user", JSON.stringify(updatedUserPayload));
          document.cookie = `sb-mock-auth=${encodeURIComponent(
            JSON.stringify(updatedUserPayload)
          )}; path=/; max-age=604800; SameSite=Lax`;
        } catch {}
      }

      // 2. Persist to Supabase and API
      const supabase = createClient();
      try {
        await Promise.allSettled([
          supabase.from("users").upsert(
            {
              id: currentId,
              email: currentEmail,
              display_name: newDisplayName,
              bio: newBio,
              target_role: newRole,
              avatar_url: newAvatar,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          ),
          supabase.auth.updateUser({
            data: {
              display_name: newDisplayName,
              full_name: newDisplayName,
              bio: newBio,
              target_role: newRole,
              avatar_url: newAvatar,
            },
          }),
          fetch("/api/user/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: currentId,
              email: currentEmail,
              display_name: newDisplayName,
              bio: newBio,
              target_role: newRole,
              avatar_url: newAvatar,
            }),
          }),
        ]);
        return true;
      } catch (err) {
        console.warn("[AuthContext] Profile update background error:", err);
        return true; // Local state is already updated
      }
    },
    [user]
  );

  // Clean, single initialization on mount
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // 1. Check existing session
    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        if (!isMounted || isSigningOutRef.current) return;
        if (data?.session?.user) {
          setSession(data.session);
          setUser(data.session.user);
        } else {
          // Check local fallback
          if (typeof window !== "undefined") {
            try {
              const stored = localStorage.getItem("sb-mock-user");
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.id && parsed?.email) {
                  setUser(parsed);
                }
              }
            } catch {}
          }
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    // 2. Single subscription to auth state changes
    const {
      data: { subscription },
    } = (supabase.auth.onAuthStateChange as any)(
      (_event: string, newSession: Session | null) => {
        if (!isMounted || isSigningOutRef.current) return;

        const nextUser = newSession?.user ?? null;
        setSession(newSession ?? null);

        setUser((prev) => {
          if (!prev && !nextUser) return null;
          if (
            prev &&
            nextUser &&
            prev.id === nextUser.id &&
            prev.email === nextUser.email
          ) {
            return prev; // Keep same reference to prevent re-render loop
          }
          return nextUser;
        });

        setIsLoading(false);
      }
    ) as { data: { subscription: { unsubscribe: () => void } } };

    return () => {
      isMounted = false;
      try {
        subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);

  // Bulletproof Sign Out
  const signOut = useCallback(async () => {
    isSigningOutRef.current = true;
    const supabase = createClient();

    // 1. Clear local credentials immediately
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("sb-mock-user");
        document.cookie = "sb-mock-auth=; path=/; max-age=0; SameSite=Lax";
      } catch {}
    }

    setUser(null);
    setSession(null);

    // 2. Invoke Supabase signOut
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("[AuthContext] Sign out notice:", e);
    }

    // 3. Clean navigation to home on explicit sign out
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signOut,
    syncUser,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
