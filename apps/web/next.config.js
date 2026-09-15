function cleanValue(val) {
  if (!val) return '';
  let cleaned = String(val).trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
    (cleaned.startsWith('“') && cleaned.endsWith('”'))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function isPlaceholder(val) {
  if (!val) return true;
  const s = cleanValue(val).toLowerCase();
  return (
    !s ||
    s === 'undefined' ||
    s === 'null' ||
    s.includes('your-') ||
    s.includes('your_') ||
    s.includes('placeholder') ||
    s.includes('example.com') ||
    s.includes('dummy')
  );
}

function resolveSupabaseUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_API_URL?.includes('supabase.co')
      ? process.env.NEXT_PUBLIC_API_URL.startsWith('http')
        ? process.env.NEXT_PUBLIC_API_URL
        : `https:${process.env.NEXT_PUBLIC_API_URL}`
      : '',
    process.env.SUPABASE_URL,
  ];

  for (const raw of candidates) {
    const cleaned = cleanValue(raw);
    if (cleaned && !isPlaceholder(cleaned) && (cleaned.startsWith('http://') || cleaned.startsWith('https://'))) {
      return cleaned;
    }
  }
  return '';
}

function resolveSupabaseKey() {
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_ANON_KEY,
  ];

  for (const raw of candidates) {
    const cleaned = cleanValue(raw);
    if (cleaned && !isPlaceholder(cleaned) && cleaned.length >= 20) {
      return cleaned;
    }
  }
  return '';
}

const resolvedSupabaseUrl = resolveSupabaseUrl();
const resolvedSupabaseKey = resolveSupabaseKey();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: resolvedSupabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: resolvedSupabaseKey,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: resolvedSupabaseKey,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

