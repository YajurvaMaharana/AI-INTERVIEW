/**
 * Utility functions to sanitize and validate Supabase environment variables.
 * Handles surrounding quotes, leading/trailing whitespace, placeholder values,
 * and key format validation to prevent "Invalid API key" crashes.
 */

export function cleanEnvString(val?: string | null): string {
  if (!val) return '';
  let s = String(val).trim();
  // Strip outer quotes if present: "value" or 'value' or “value”
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith('“') && s.endsWith('”'))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export function isPlaceholder(val?: string | null): boolean {
  if (!val) return true;
  const s = cleanEnvString(val).toLowerCase();
  if (
    !s ||
    s === 'undefined' ||
    s === 'null' ||
    s === 'none' ||
    s === 'false' ||
    s === 'true'
  ) {
    return true;
  }

  return (
    s.includes('your-') ||
    s.includes('your_') ||
    s.includes('yourproject') ||
    s.includes('yourkey') ||
    s.includes('placeholder') ||
    s.includes('example.com') ||
    s.includes('<your-') ||
    s.includes('todo') ||
    s.includes('change-me') ||
    s.includes('changeme') ||
    s.includes('dummy')
  );
}

export function isValidSupabaseUrl(url?: string | null): boolean {
  const cleaned = cleanEnvString(url);
  if (!cleaned || isPlaceholder(cleaned)) return false;
  return cleaned.startsWith('http://') || cleaned.startsWith('https://');
}

export function isValidSupabaseKey(key?: string | null): boolean {
  const cleaned = cleanEnvString(key);
  if (!cleaned || isPlaceholder(cleaned)) return false;
  if (cleaned.length < 20) return false;

  // Supabase JWT token: starts with 'eyJ' and has 3 segments separated by dots
  if (cleaned.startsWith('eyJ')) {
    const parts = cleaned.split('.');
    return parts.length === 3 && parts[1].length > 0;
  }

  // Modern Supabase publishable key format: 'sbp_...'
  if (cleaned.startsWith('sbp_') && cleaned.length >= 25) {
    return true;
  }

  // Generic key: ensure it's not a known placeholder and has reasonable length
  return !isPlaceholder(cleaned) && cleaned.length >= 20;
}

export function isInvalidKeyError(msg?: string | null): boolean {
  if (!msg) return false;
  const lower = String(msg).toLowerCase();
  return (
    lower.includes('invalid api key') ||
    lower.includes('invalid key') ||
    lower.includes('api key not found') ||
    lower.includes('invalid jwt') ||
    lower.includes('jwt expired') ||
    lower.includes('jwserror') ||
    lower.includes('invalid token')
  );
}

export function getResolvedSupabaseCredentials() {
  const urlCandidates = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_API_URL?.includes('supabase.co')
      ? process.env.NEXT_PUBLIC_API_URL.startsWith('http')
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

export function isValidUUID(uuid?: string | null): boolean {
  if (!uuid) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export function emailToUUID(email: string): string {
  const clean = (email || 'candidate@example.com').toLowerCase().trim();
  let hash = 0;
  let hash2 = 5381;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
    hash2 = (hash2 << 5) + hash2 + char;
    hash2 |= 0;
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0').slice(0, 8);
  const hex3 = Math.abs(hash ^ hash2).toString(16).padStart(8, '0').slice(0, 8);
  const hex4 = Math.abs((hash * 31) ^ hash2).toString(16).padStart(8, '0').slice(0, 8);

  const p1 = (hex1 + hex2).slice(0, 8);
  const p2 = (hex2 + hex3).slice(0, 4);
  const p3 = '4' + (hex3 + hex4).slice(0, 3);
  const p4 = 'a' + (hex4 + hex1).slice(0, 3);
  const p5 = (hex1 + hex3 + hex4).slice(0, 12).padEnd(12, '0');

  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}
