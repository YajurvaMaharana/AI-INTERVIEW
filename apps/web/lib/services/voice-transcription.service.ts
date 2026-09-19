// ---------------------------------------------------------------------------
// voice-transcription.service.ts — Robust audio transcription service using Gemini
// ---------------------------------------------------------------------------

import { GoogleGenAI } from '@google/genai';
import { resolveGeminiModel, generateWithModelFallback } from '@/lib/utils/gemini-model';

let cachedGenAI: GoogleGenAI | null = null;

function getGeminiClient(): { client: GoogleGenAI; modelName: string } {
  const apiKey = process.env['GEMINI_API_KEY'];
  const modelName = resolveGeminiModel();

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }

  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenAI({ apiKey });
  }

  return { client: cachedGenAI, modelName };
}

export interface TranscriptionResult {
  text: string;
  durationSeconds?: number;
  wordCount: number;
  fillerWordsCount: number;
  fillerWordsFound: string[];
  estimatedWpm: number;
  modelUsed: string;
  confidenceScore: number;
  qualityStatus: "optimal" | "low_confidence" | "silent" | "corrupted";
  qualityMessage?: string;
  isProtectedFromLowScore: boolean;
}

const FILLER_WORDS_REGEX = /\b(um|uh|er|ah|like|you know|basically|actually|literally|so yeah|kind of|sort of)\b/gi;

export function analyzeSpeechMetrics(text: string, durationSeconds: number = 0) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const matches = text.match(FILLER_WORDS_REGEX) || [];
  const fillerWordsFound = Array.from(new Set(matches.map((m) => m.toLowerCase())));
  const fillerWordsCount = matches.length;

  const effectiveDurationMinutes = durationSeconds > 0 ? durationSeconds / 60 : wordCount / 140;
  const estimatedWpm = effectiveDurationMinutes > 0 ? Math.round(wordCount / effectiveDurationMinutes) : 0;

  // Quality gate calculation
  let confidenceScore = 95;
  let qualityStatus: "optimal" | "low_confidence" | "silent" | "corrupted" = "optimal";
  let qualityMessage = "Audio and transcription quality verified successfully.";
  let isProtectedFromLowScore = false;

  if (wordCount === 0 && durationSeconds > 2) {
    confidenceScore = 15;
    qualityStatus = "silent";
    qualityMessage = "Excessive background silence or no speech detected. Please speak closer to your microphone.";
    isProtectedFromLowScore = true;
  } else if (durationSeconds > 5 && wordCount < 4) {
    confidenceScore = 45;
    qualityStatus = "low_confidence";
    qualityMessage = "Low speech density detected. Transcription confidence is low.";
    isProtectedFromLowScore = true;
  } else if (text.includes("[inaudible]") || text.length < 3 && durationSeconds > 3) {
    confidenceScore = 30;
    qualityStatus = "corrupted";
    qualityMessage = "Audio stream appears corrupted or unintelligible.";
    isProtectedFromLowScore = true;
  } else if (confidenceScore < 70) {
    isProtectedFromLowScore = true;
  }

  return {
    wordCount,
    fillerWordsCount,
    fillerWordsFound,
    estimatedWpm,
    confidenceScore,
    qualityStatus,
    qualityMessage,
    isProtectedFromLowScore,
  };
}

/**
 * Transcribes audio base64 data using Gemini multimodal audio model
 */
export async function transcribeAudioBuffer(
  audioBase64: string,
  mimeType: string = 'audio/webm',
  durationSeconds: number = 0,
  contextRole?: string
): Promise<TranscriptionResult> {
  const { client, modelName } = getGeminiClient();

  const systemInstruction = `You are a precision speech-to-text audio transcriber specialized in technical, engineering, and behavioral job interviews.
Your job is to transcribe the candidate's audio recording verbatim with 100% fidelity.
Instructions:
1. Accurately transcribe all technical terminology, programming languages, algorithms, data structures, cloud architectures, frameworks, and metrics (e.g., "O(N log N)", "Kubernetes", "PostgreSQL", "Kafka", "STAR method", "p99 latency", "microservices").
2. Transcribe natural speech faithfully including fillers if spoken.
3. Fix obvious phonetic misunderstandings in technical jargon.
4. Return ONLY the transcribed text. Do not add conversational remarks, prefixes, or markdown quotation marks.`;

  try {
    const prompt = contextRole
      ? `The speaker is a candidate in a ${contextRole} job interview. Transcribe their spoken answer verbatim.`
      : `Transcribe this interview candidate's spoken response verbatim.`;

    const { text, modelUsed } = await generateWithModelFallback(client, {
      preferredModel: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    const cleanedText = (text || '').trim();
    const metrics = analyzeSpeechMetrics(cleanedText, durationSeconds);

    return {
      text: cleanedText,
      durationSeconds,
      ...metrics,
      modelUsed,
    };
  } catch (err: any) {
    console.error('Gemini audio transcription error:', err);
    throw err;
  }
}
