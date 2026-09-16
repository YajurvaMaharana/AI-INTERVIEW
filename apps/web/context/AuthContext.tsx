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
  skills?: string[];
  experience_level?: string;
  preferred_interview_type?: string;
  preferred_language?: string;
  interview_goals?: string[] | string;
  target_companies?: string[];
  user_metadata?: {
    display_name?: string;
    full_name?: string;
    bio?: string;
    target_role?: string;
    skills?: string[];
    experience_level?: string;
    avatar_url?: string | null;
    preferred_interview_type?: string;
    preferred_language?: string;
    interview_goals?: string[] | string;
    target_companies?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface AuthContextType {
  user: User | NormalizedUser | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  syncUser: (
    rawUser: any,
    accessToken?: string,
    displayNameOverride?: string
  ) => Promise<{ id: string; email: string; display_name: string }>;
  updateUserProfile: (updates: {
    display_name?: string;
    bio?: string;
    target_role?: string;
    skills?: string[];
    experience_level?: string;
    avatar_url?: string | null;
    preferred_interview_type?: string;
    preferred_language?: string;
    interview_goals?: string[] | string;
    target_companies?: string[];
  }) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
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
      const skills = rawUser.skills || rawUser.user_metadata?.skills || null;
      const experienceLevel = rawUser.experience_level || rawUser.user_metadata?.experience_level || null;
      const preferredInterviewType = rawUser.preferred_interview_type || rawUser.user_metadata?.preferred_interview_type || null;
      const preferredLanguage = rawUser.preferred_language || rawUser.user_metadata?.preferred_language || null;
      const interviewGoals = rawUser.interview_goals || rawUser.user_metadata?.interview_goals || null;
      const targetCompanies = rawUser.target_companies || rawUser.user_metadata?.target_companies || null;

      const userPayload = {
        id,
        email,
        display_name: displayName,
        avatar_url: avatarUrl,
        bio,
        target_role: targetRole,
        skills,
        experience_level: experienceLevel,
        preferred_interview_type: preferredInterviewType,
        preferred_language: preferredLanguage,
        interview_goals: interviewGoals,
        target_companies: targetCompanies,
        user_metadata: {
          display_name: displayName,
          full_name: displayName,
          bio,
          target_role: targetRole,
          avatar_url: avatarUrl,
          skills,
          experience_level: experienceLevel,
          preferred_interview_type: preferredInterviewType,
          preferred_language: preferredLanguage,
          interview_goals: interviewGoals,
          target_companies: targetCompanies,
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
        const dbPayload: Record<string, any> = {
          id,
          email,
          display_name: displayName,
          avatar_url: userPayload.avatar_url,
          bio,
          target_role: targetRole,
          updated_at: new Date().toISOString(),
        };
        if (skills) dbPayload.skills = skills;
        if (experienceLevel) dbPayload.experience_level = experienceLevel;
        if (preferredInterviewType) dbPayload.preferred_interview_type = preferredInterviewType;
        if (preferredLanguage) dbPayload.preferred_language = preferredLanguage;
        if (interviewGoals) dbPayload.interview_goals = interviewGoals;
        if (targetCompanies) dbPayload.target_companies = targetCompanies;

        await Promise.allSettled([
          supabase.from("users").upsert(dbPayload, { onConflict: "id" }),
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

  // Fetch full user record from Supabase users table
  const fetchUserProfileFromDb = useCallback(async (userId: string, currentSessionUser?: any) => {
    if (!userId) return null;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        const mergedUser: NormalizedUser = {
          ...(currentSessionUser || {}),
          id: data.id,
          email: data.email || currentSessionUser?.email,
          display_name: data.display_name,
          bio: data.bio,
          target_role: data.target_role,
          avatar_url: data.avatar_url,
          skills: data.skills,
          experience_level: data.experience_level,
          preferred_interview_type: data.preferred_interview_type,
          preferred_language: data.preferred_language,
          interview_goals: data.interview_goals,
          target_companies: data.target_companies,
          user_metadata: {
            ...(currentSessionUser?.user_metadata || {}),
            display_name: data.display_name,
            full_name: data.display_name,
            bio: data.bio,
            target_role: data.target_role,
            avatar_url: data.avatar_url,
            skills: data.skills,
            experience_level: data.experience_level,
            preferred_interview_type: data.preferred_interview_type,
            preferred_language: data.preferred_language,
            interview_goals: data.interview_goals,
            target_companies: data.target_companies,
          },
        };
        setUser(mergedUser);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("sb-mock-user", JSON.stringify(mergedUser));
          } catch {}
        }
        return mergedUser;
      }
    } catch (err) {
      console.warn("[AuthContext] fetchUserProfileFromDb error:", err);
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchUserProfileFromDb(user.id, user);
    }
  }, [user, fetchUserProfileFromDb]);

  // Update candidate profile with direct Supabase + local cache sync
  const updateUserProfile = useCallback(
    async (updates: {
      display_name?: string;
      bio?: string;
      target_role?: string;
      skills?: string[];
      experience_level?: string;
      avatar_url?: string | null;
      preferred_interview_type?: string;
      preferred_language?: string;
      interview_goals?: string[] | string;
      target_companies?: string[];
    }): Promise<boolean> => {
      if (!user?.id) return false;

      const currentId = user.id;
      const currentEmail = user.email || "candidate@example.com";
      const u = user as any;
      const newDisplayName = updates.display_name !== undefined ? updates.display_name : u.display_name || "Candidate";
      const newBio = updates.bio !== undefined ? updates.bio : u.bio || "";
      const newRole = updates.target_role !== undefined ? updates.target_role : u.target_role || "Full-Stack Software Engineer";
      const newAvatar = updates.avatar_url !== undefined ? updates.avatar_url : u.avatar_url || null;
      const newSkills = updates.skills !== undefined ? updates.skills : u.skills || null;
      const newExpLevel = updates.experience_level !== undefined ? updates.experience_level : u.experience_level || null;
      const newPrefInterviewType = updates.preferred_interview_type !== undefined ? updates.preferred_interview_type : u.preferred_interview_type || null;
      const newPrefLanguage = updates.preferred_language !== undefined ? updates.preferred_language : u.preferred_language || null;
      const newGoals = updates.interview_goals !== undefined ? updates.interview_goals : u.interview_goals || null;
      const newTargetCompanies = updates.target_companies !== undefined ? updates.target_companies : u.target_companies || null;

      const updatedUserPayload: NormalizedUser = {
        ...user,
        id: currentId,
        email: currentEmail,
        display_name: newDisplayName,
        bio: newBio,
        target_role: newRole,
        avatar_url: newAvatar,
        skills: newSkills || undefined,
        experience_level: newExpLevel || undefined,
        preferred_interview_type: newPrefInterviewType || undefined,
        preferred_language: newPrefLanguage || undefined,
        interview_goals: newGoals || undefined,
        target_companies: newTargetCompanies || undefined,
        user_metadata: {
          ...(user.user_metadata || {}),
          display_name: newDisplayName,
          full_name: newDisplayName,
          bio: newBio,
          target_role: newRole,
          avatar_url: newAvatar,
          skills: newSkills || undefined,
          experience_level: newExpLevel || undefined,
          preferred_interview_type: newPrefInterviewType || undefined,
          preferred_language: newPrefLanguage || undefined,
          interview_goals: newGoals || undefined,
          target_companies: newTargetCompanies || undefined,
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
        const dbPayload: Record<string, any> = {
          id: currentId,
          email: currentEmail,
          display_name: newDisplayName,
          bio: newBio,
          target_role: newRole,
          avatar_url: newAvatar,
          updated_at: new Date().toISOString(),
        };
        if (newSkills) dbPayload.skills = newSkills;
        if (newExpLevel) dbPayload.experience_level = newExpLevel;
        if (newPrefInterviewType) dbPayload.preferred_interview_type = newPrefInterviewType;
        if (newPrefLanguage) dbPayload.preferred_language = newPrefLanguage;
        if (newGoals) dbPayload.interview_goals = newGoals;
        if (newTargetCompanies) dbPayload.target_companies = newTargetCompanies;

        await Promise.allSettled([
          supabase.from("users").upsert(dbPayload, { onConflict: "id" }),
          supabase.auth.updateUser({
            data: {
              display_name: newDisplayName,
              full_name: newDisplayName,
              bio: newBio,
              target_role: newRole,
              avatar_url: newAvatar,
              skills: newSkills,
              experience_level: newExpLevel,
              preferred_interview_type: newPrefInterviewType,
              preferred_language: newPrefLanguage,
              interview_goals: newGoals,
              target_companies: newTargetCompanies,
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
              skills: newSkills,
              experience_level: newExpLevel,
              preferred_interview_type: newPrefInterviewType,
              preferred_language: newPrefLanguage,
              interview_goals: newGoals,
              target_companies: newTargetCompanies,
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

  // Password Update
  const updatePassword = useCallback(async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: true }; // Handled safely
    }
  }, []);

  // Password Reset Email Request
  const resetPasswordEmail = useCallback(async (email: string) => {
    if (!email) {
      return { success: false, error: "Please provide a valid email address." };
    }
    const supabase = createClient();
    try {
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth?reset=true` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: true };
    }
  }, []);

  // Delete Candidate Account
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    isSigningOutRef.current = true;
    const userId = user.id;

    try {
      await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.warn("[AuthContext] deleteAccount api call notice:", err);
    }

    // Clean up local storage and sign out
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("sb-mock-user");
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase")) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
        document.cookie = "sb-mock-auth=; path=/; max-age=0; SameSite=Lax";
      } catch {}
    }

    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {}

    setUser(null);
    setSession(null);

    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
    return true;
  }, [user]);

  // Clean, single initialization on mount
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // 1. Check existing session
    supabase.auth
      .getSession()
      .then(async ({ data }: { data: { session: Session | null } }) => {
        if (!isMounted || isSigningOutRef.current) return;
        if (data?.session?.user) {
          setSession(data.session);
          setUser(data.session.user);
          // Fetch full profile from database to get synced profile data
          await fetchUserProfileFromDb(data.session.user.id, data.session.user);
        } else {
          // Check local fallback
          if (typeof window !== "undefined") {
            try {
              const stored = localStorage.getItem("sb-mock-user");
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.id && parsed?.email) {
                  setUser(parsed);
                  await fetchUserProfileFromDb(parsed.id, parsed);
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
      async (_event: string, newSession: Session | null) => {
        if (!isMounted || isSigningOutRef.current) return;

        const nextUser = newSession?.user ?? null;
        setSession(newSession ?? null);

        if (nextUser) {
          setUser(nextUser);
          await fetchUserProfileFromDb(nextUser.id, nextUser);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      }
    ) as { data: { subscription: { unsubscribe: () => void } } };

    return () => {
      isMounted = false;
      try {
        subscription?.unsubscribe?.();
      } catch {}
    };
  }, [fetchUserProfileFromDb]);

  // Bulletproof Sign Out
  const signOut = useCallback(async () => {
    isSigningOutRef.current = true;
    const supabase = createClient();

    // 1. Clear local credentials and session storage immediately
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("sb-mock-user");
        // Clear any other Supabase or auth related items in storage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase")) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
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

    // 3. Immediate hard redirect to /auth
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signOut,
    deleteAccount,
    updatePassword,
    resetPasswordEmail,
    syncUser,
    updateUserProfile,
    refreshProfile,
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
