// ---------------------------------------------------------------------------
// resilience.ts — Resilient API Retry Loops, Local State Caching & Fallback Mode
// ---------------------------------------------------------------------------

export interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  backoffMs?: number;
  cacheKey?: string;
  fallbackValue?: any;
}

/**
 * Executes a fetch request with automatic exponential backoff retries and local cache fallback.
 */
export async function fetchWithRetry(url: string, options: FetchWithRetryOptions = {}): Promise<any> {
  const { retries = 3, backoffMs = 1000, cacheKey, fallbackValue, ...fetchOptions } = options;

  let attempt = 0;
  while (attempt < retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Cache successful response if cacheKey is provided
      if (cacheKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(`cache_${cacheKey}`, JSON.stringify({ data, timestamp: Date.now() }));
        } catch {}
      }

      return data;
    } catch (err: any) {
      attempt++;
      console.warn(`[Resilience] Attempt ${attempt}/${retries} failed for ${url}:`, err?.message || err);

      if (attempt >= retries) {
        // Check local cache fallback if available
        if (cacheKey && typeof window !== 'undefined') {
          try {
            const cached = localStorage.getItem(`cache_${cacheKey}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              console.info(`[Resilience] Serving stale cached data for ${url} due to network failure.`);
              return parsed.data;
            }
          } catch {}
        }

        if (fallbackValue !== undefined) {
          console.info(`[Resilience] Returning fallback value for ${url}.`);
          return fallbackValue;
        }

        throw err;
      }

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, backoffMs * Math.pow(2, attempt - 1)));
    }
  }

  throw new Error(`Failed to fetch ${url} after ${retries} attempts.`);
}
