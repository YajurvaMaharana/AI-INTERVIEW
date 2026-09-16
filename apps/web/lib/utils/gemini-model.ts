/**
 * Utility to resolve reliable and supported Gemini model names with resilient fallback cascade.
 * Prevents deprecated model 404 errors (e.g. gemini-2.5-flash / gemini-1.5)
 * and handles 503 high-demand / 429 rate limit errors by failing over to alternative models.
 */

export function resolveGeminiModel(): string {
  const envModel = process.env['GEMINI_MODEL'];
  if (
    !envModel ||
    envModel.includes('2.5') ||
    envModel.includes('1.5') ||
    envModel.includes('2.0')
  ) {
    return 'gemini-3.8-flash';
  }
  return envModel.replace(/^models\//, '');
}

/**
 * Returns an ordered cascade list of supported Gemini models to try in sequence.
 */
export function getGeminiModelCascade(): string[] {
  const primary = resolveGeminiModel();
  const models = [
    primary,
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.7-flash',
  ];

  // Return unique list preserving order
  return Array.from(new Set(models));
}

/**
 * Helper to determine if an error is a transient capacity/rate-limit/availability error.
 */
export function isTransientGeminiError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.code || err.statusCode;
  const message = String(err.message || err.error?.message || err);

  if (status === 503 || status === 429 || status === 404 || status === 500) return true;
  if (
    message.includes('503') ||
    message.includes('429') ||
    message.includes('404') ||
    message.includes('UNAVAILABLE') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('high demand') ||
    message.includes('temporarily unavailable') ||
    message.includes('overloaded') ||
    message.includes('not found') ||
    message.includes('is no longer available')
  ) {
    return true;
  }

  return false;
}

/**
 * Executes a generateContent call across the model fallback cascade.
 * If a 503 (high demand) or 404/429 error occurs on a model, it transparently
 * retries and tries the next candidate model in the cascade with brief backoff.
 */
export async function generateWithModelFallback(
  genAI: any,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
): Promise<{ text: string | undefined; modelUsed: string }> {
  const cascade = params.preferredModel
    ? [params.preferredModel, ...getGeminiModelCascade().filter((m) => m !== params.preferredModel)]
    : getGeminiModelCascade();

  let lastError: any = null;

  for (let i = 0; i < cascade.length; i++) {
    const currentModel = cascade[i];

    // Try up to 2 attempts per candidate model (immediate + 1 quick retry for transient 503)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await genAI.models.generateContent({
          model: currentModel,
          contents: params.contents,
          config: params.config,
        });

        if (response && (response.text !== undefined || response.candidates?.length > 0)) {
          return {
            text: response.text,
            modelUsed: currentModel,
          };
        }
      } catch (err: any) {
        lastError = err;
        const isTransient = isTransientGeminiError(err);

        if (isTransient) {
          if (attempt === 0) {
            // Quick backoff before second attempt on same model
            await new Promise((resolve) => setTimeout(resolve, 400));
            continue;
          } else {
            // Move on to next model in cascade
            break;
          }
        } else {
          // Non-transient error (e.g. invalid arguments/syntax)
          throw err;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini models in fallback cascade were unavailable.');
}
