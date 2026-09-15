import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  cleanEnvString,
  isValidSupabaseUrl,
  isValidSupabaseKey,
  isInvalidKeyError,
} from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const urlCandidates = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_API_URL?.includes("supabase.co")
      ? process.env.NEXT_PUBLIC_API_URL.startsWith("http")
        ? process.env.NEXT_PUBLIC_API_URL
        : `https:${process.env.NEXT_PUBLIC_API_URL}`
      : undefined,
    process.env.SUPABASE_URL,
  ];

  const keyCandidates = [
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_ANON_KEY,
  ];

  const supabaseUrl =
    urlCandidates
      .map(cleanEnvString)
      .find((u) => isValidSupabaseUrl(u)) || null;

  const supabaseKey =
    keyCandidates
      .map(cleanEnvString)
      .find((k) => isValidSupabaseKey(k)) || null;

  const getMockUser = () => {
    try {
      const mockCookie = request.cookies.get("sb-mock-auth");
      if (mockCookie?.value) {
        return JSON.parse(decodeURIComponent(mockCookie.value));
      }
    } catch {
      // Ignored
    }
    return null;
  };

  if (!supabaseUrl || !supabaseKey) {
    return {
      user: getMockUser(),
      supabaseResponse,
    };
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error && isInvalidKeyError(error.message)) {
      return { user: getMockUser(), supabaseResponse };
    }

    return { user: user || getMockUser(), supabaseResponse };
  } catch (err: any) {
    if (!isInvalidKeyError(err?.message)) {
      console.warn("Middleware auth error:", err);
    }
    return { user: getMockUser(), supabaseResponse };
  }
}
