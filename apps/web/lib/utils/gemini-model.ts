/**
 * Utility to resolve a reliable and supported Gemini model name.
 * Prevents deprecated model 404 errors (e.g. gemini-2.5-flash / gemini-1.5)
 * by safely falling back to gemini-3.7-flash.
 */
export function resolveGeminiModel(): string {
  const envModel = process.env['GEMINI_MODEL'];
  if (
    !envModel ||
    envModel.includes('2.5') ||
    envModel.includes('1.5') ||
    envModel.includes('2.0')
  ) {
    return 'gemini-3.7-flash';
  }
  return envModel.replace(/^models\//, '');
}
