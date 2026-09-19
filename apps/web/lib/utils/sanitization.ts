// ---------------------------------------------------------------------------
// sanitization.ts — Robust Prompt Injection Defense & Upload Safety Validation
// ---------------------------------------------------------------------------

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedText?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'text/plain',
  'text/markdown',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function validateUploadedFile(file: { name?: string; size?: number; type?: string }): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size !== undefined && file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File size exceeds maximum allowed limit of 10MB (Received: ${(file.size / (1024 * 1024)).toFixed(2)}MB).` };
  }

  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    // Also check extension as fallback
    const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
    const allowedExts = ['pdf', 'docx', 'doc', 'txt', 'md'];
    if (!ext || !allowedExts.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file type (${file.type || ext || 'unknown'}). Allowed formats: PDF, DOCX, DOC, TXT, MD.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Sanitizes untrusted text extracted from resumes, job descriptions, or user uploads
 * to neutralize prompt injection vectors and malicious control characters.
 */
export function sanitizeUntrustedText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  // 1. Remove control characters and null bytes except standard whitespace
  let cleaned = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Neutralize common prompt-injection override patterns
  const injectionPatterns = [
    /ignore previous instructions/gi,
    /disregard all prior/gi,
    /you are now a/gi,
    /system prompt:/gi,
    /new system instructions:/gi,
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
  ];

  for (const pattern of injectionPatterns) {
    cleaned = cleaned.replace(pattern, '[FILTERED_POTENTIAL_INJECTION]');
  }

  // 3. Wrap in explicit XML/markdown data boundaries to reinforce AI sandboxing
  return `--- START UNTRUSTED DOCUMENT DATA ---\n${cleaned}\n--- END UNTRUSTED DOCUMENT DATA ---`;
}
