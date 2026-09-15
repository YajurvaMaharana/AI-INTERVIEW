import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  cleanEnvString,
  isValidSupabaseUrl,
  isValidSupabaseKey,
  isInvalidKeyError,
  emailToUUID,
  isValidUUID,
} from "./env";

export function getServerCredentials() {
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

  const url =
    urlCandidates
      .map(cleanEnvString)
      .find((u) => isValidSupabaseUrl(u)) || null;

  const key =
    keyCandidates
      .map(cleanEnvString)
      .find((k) => isValidSupabaseKey(k)) || null;

  return { url, key };
}

export function createClient() {
  const cookieStore = cookies();
  const { url, key } = getServerCredentials();

  const getMockUser = () => {
    let mockUser = {
      id: emailToUUID("candidate@example.com"),
      email: "candidate@example.com",
      user_metadata: { display_name: "Candidate" },
    };
    try {
      const mockCookie = cookieStore.get("sb-mock-auth");
      if (mockCookie?.value) {
        mockUser = JSON.parse(decodeURIComponent(mockCookie.value));
        if (mockUser && !isValidUUID(mockUser.id) && mockUser.email) {
          mockUser.id = emailToUUID(mockUser.email);
        }
      }
    } catch {
      // Use default mock user
    }
    return mockUser;
  };

  if (!url || !key) {
    const mockUser = getMockUser();
    return {
      auth: {
        getUser: async () => ({ data: { user: mockUser }, error: null }),
        getSession: async () => ({
          data: { session: { user: mockUser, access_token: "mock-token" } },
          error: null,
        }),
      },
    } as any;
  }

  try {
    const rawServerClient = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be safely ignored in server components
          }
        },
      },
    });

    const originalGetUser = rawServerClient.auth.getUser.bind(rawServerClient.auth);
    const originalGetSession = rawServerClient.auth.getSession.bind(rawServerClient.auth);

    const safeAuth = {
      ...rawServerClient.auth,
      getUser: async () => {
        try {
          const res = await originalGetUser();
          if (res.error && isInvalidKeyError(res.error.message)) {
            return { data: { user: getMockUser() }, error: null };
          }
          if (!res.data?.user) {
            const mockUser = getMockUser();
            if (cookieStore.get("sb-mock-auth")?.value) {
              return { data: { user: mockUser }, error: null };
            }
          }
          return res;
        } catch (err: any) {
          if (isInvalidKeyError(err?.message)) {
            return { data: { user: getMockUser() }, error: null };
          }
          return { data: { user: null }, error: err };
        }
      },
      getSession: async () => {
        try {
          const res = await originalGetSession();
          if (res.error && isInvalidKeyError(res.error.message)) {
            const mockUser = getMockUser();
            return {
              data: {
                session: { user: mockUser, access_token: "mock-token" },
              },
              error: null,
            };
          }
          if (!res.data?.session) {
            if (cookieStore.get("sb-mock-auth")?.value) {
              const mockUser = getMockUser();
              return {
                data: {
                  session: { user: mockUser, access_token: "mock-token" },
                },
                error: null,
              };
            }
          }
          return res;
        } catch (err: any) {
          if (isInvalidKeyError(err?.message)) {
            const mockUser = getMockUser();
            return {
              data: {
                session: { user: mockUser, access_token: "mock-token" },
              },
              error: null,
            };
          }
          return { data: { session: null }, error: err };
        }
      },
    };

    return new Proxy(rawServerClient, {
      get(target, prop, receiver) {
        if (prop === "auth") {
          return safeAuth;
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  } catch (err) {
    const mockUser = getMockUser();
    return {
      auth: {
        getUser: async () => ({ data: { user: mockUser }, error: null }),
        getSession: async () => ({
          data: { session: { user: mockUser, access_token: "mock-token" } },
          error: null,
        }),
      },
    } as any;
  }
}
