import { NextRequest, NextResponse } from "next/server";
import { transcribeAudioBuffer, analyzeSpeechMetrics } from "@/lib/services/voice-transcription.service";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let audioBase64 = "";
    let mimeType = "audio/webm";
    let durationSeconds = 0;
    let fallbackText = "";
    let role = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      audioBase64 = body.audioBase64 || "";
      mimeType = body.mimeType || "audio/webm";
      durationSeconds = body.durationSeconds || 0;
      fallbackText = body.fallbackText || "";
      role = body.role || "";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("audio") as File | null;
      durationSeconds = Number(formData.get("durationSeconds") || 0);
      fallbackText = String(formData.get("fallbackText") || "");
      role = String(formData.get("role") || "");

      if (file) {
        mimeType = file.type || "audio/webm";
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        audioBase64 = buffer.toString("base64");
      }
    }

    if (!audioBase64) {
      if (fallbackText) {
        const metrics = analyzeSpeechMetrics(fallbackText, durationSeconds);
        return NextResponse.json({
          success: true,
          text: fallbackText,
          ...metrics,
          durationSeconds,
          modelUsed: "client-speech-recognition",
        });
      }
      return NextResponse.json(
        { error: "No audio data or fallback text provided." },
        { status: 400 }
      );
    }

    // Attempt Gemini multimodal audio transcription
    try {
      const result = await transcribeAudioBuffer(
        audioBase64,
        mimeType,
        durationSeconds,
        role
      );

      // If gemini transcribed text is empty, but client provided fallback text, use fallback
      if (!result.text && fallbackText) {
        result.text = fallbackText;
      }

      return NextResponse.json({
        success: true,
        ...result,
      });
    } catch (aiError: any) {
      console.warn("AI transcription failed, utilizing fallback speech transcript:", aiError?.message);

      if (fallbackText) {
        const metrics = analyzeSpeechMetrics(fallbackText, durationSeconds);
        return NextResponse.json({
          success: true,
          text: fallbackText,
          ...metrics,
          durationSeconds,
          modelUsed: "client-speech-recognition-fallback",
        });
      }

      return NextResponse.json(
        {
          error: "Could not transcribe audio. Please type your response or try again.",
          details: aiError?.message || "AI transcription unavailable",
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("Transcription API Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during transcription" },
      { status: 500 }
    );
  }
}
