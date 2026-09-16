import { createClient } from "@supabase/supabase-js";
import { cleanEnvString, isValidSupabaseUrl, isValidSupabaseKey } from "./env";

export function getSupabaseAdminClient() {
  const urlCandidates = [
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_API_URL?.includes("supabase.co")
      ? process.env.NEXT_PUBLIC_API_URL.startsWith("http")
        ? process.env.NEXT_PUBLIC_API_URL
        : `https:${process.env.NEXT_PUBLIC_API_URL}`
      : undefined,
  ];

  const keyCandidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ];

  const url =
    urlCandidates.map(cleanEnvString).find((u) => isValidSupabaseUrl(u)) || null;
  const key =
    keyCandidates.map(cleanEnvString).find((k) => isValidSupabaseKey(k)) || null;

  if (!url || !key) {
    return null;
  }

  try {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn("[getSupabaseAdminClient] Error initializing admin client:", err);
    return null;
  }
}
