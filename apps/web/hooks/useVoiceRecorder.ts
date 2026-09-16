"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "paused" | "transcribing" | "reviewing";

export interface SpeechMetrics {
  durationSeconds: number;
  wordCount: number;
  fillerWordsCount: number;
  fillerWordsFound: string[];
  estimatedWpm: number;
}

export interface VoiceRecorderOptions {
  onTranscriptComplete?: (transcript: string) => void;
  contextRole?: string;
}

export function useVoiceRecorder(options: VoiceRecorderOptions = {}) {
  const { onTranscriptComplete, contextRole } = options;

  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [metrics, setMetrics] = useState<SpeechMetrics>({
    durationSeconds: 0,
    wordCount: 0,
    fillerWordsCount: 0,
    fillerWordsFound: [],
    estimatedWpm: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptBufferRef = useRef<string>("");

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
      }
    }
  }, []);

  // Update calculated metrics whenever transcript or duration changes
  useEffect(() => {
    const text = (transcript + " " + interimTranscript).trim();
    const words = text ? text.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    const fillerRegex = /\b(um|uh|er|ah|like|you know|basically|actually|literally|so yeah|kind of|sort of)\b/gi;
    const matches = text.match(fillerRegex) || [];
    const fillerWordsFound = Array.from(new Set(matches.map((m) => m.toLowerCase())));
    const fillerWordsCount = matches.length;

    const effectiveMinutes = durationSeconds > 0 ? durationSeconds / 60 : (wordCount > 0 ? wordCount / 140 : 0);
    const estimatedWpm = effectiveMinutes > 0 ? Math.round(wordCount / effectiveMinutes) : 0;

    setMetrics({
      durationSeconds,
      wordCount,
      fillerWordsCount,
      fillerWordsFound,
      estimatedWpm,
    });
  }, [transcript, interimTranscript, durationSeconds]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  const stopAllMedia = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  }, []);

  // Volume & visualizer loop
  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize to 0 - 100 with sensitivity boost
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn("Audio analyser setup error:", err);
    }
  };

  // Start real-time speech recognition
  const initSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          transcriptBufferRef.current += (transcriptBufferRef.current ? " " : "") + finalChunk.trim();
          setTranscript(transcriptBufferRef.current);
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          console.warn("Speech recognition warning:", event.error);
        }
      };

      recognition.onend = () => {
        // Restart if still in recording state
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Could not start Web Speech Recognition:", err);
    }
  };

  // Start Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setTranscript("");
    setInterimTranscript("");
    transcriptBufferRef.current = "";
    setDurationSeconds(0);
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Setup Web Audio Analyser
      startAudioAnalysis(stream);

      // Determine supported mime type
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setAudioBlob(recordedBlob);
        const url = URL.createObjectURL(recordedBlob);
        setAudioUrl(url);

        // Process audio with backend AI for high fidelity
        await processRecordedAudio(recordedBlob);
      };

      recorder.start(500); // chunk every 500ms
      mediaRecorderRef.current = recorder;
      setRecordingState("recording");

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);

      // Start live speech preview
      initSpeechRecognition();
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setErrorMessage(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Microphone access was denied. Please allow microphone permissions in your browser."
          : "Could not access audio device: " + (err.message || "Unknown error")
      );
      setRecordingState("idle");
    }
  };

  // Pause Recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setRecordingState("paused");
    }
  };

  // Resume Recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
      setRecordingState("recording");
    }
  };

  // Stop Recording and start transcription review
  const stopRecording = () => {
    if (recordingState === "idle" || recordingState === "reviewing") return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setRecordingState("transcribing");
    setAudioLevel(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Send audio to Gemini transcription backend
  const processRecordedAudio = async (blob: Blob) => {
    try {
      const fallback = (transcriptBufferRef.current || transcript).trim();
      const formData = new FormData();
      formData.append("audio", blob, "answer.webm");
      formData.append("durationSeconds", String(durationSeconds));
      formData.append("fallbackText", fallback);
      if (contextRole) {
        formData.append("role", contextRole);
      }

      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const finalText = data.text || fallback;
        setTranscript(finalText);
        setInterimTranscript("");
        onTranscriptComplete?.(finalText);
      } else {
        // If server failed, keep the browser speech recognition text
        if (fallback) {
          setTranscript(fallback);
          setInterimTranscript("");
        }
      }
    } catch (err) {
      console.warn("AI transcription request error, using local transcript:", err);
      const fallback = (transcriptBufferRef.current || transcript).trim();
      if (fallback) {
        setTranscript(fallback);
        setInterimTranscript("");
      }
    } finally {
      setRecordingState("reviewing");
    }
  };

  // Discard & Re-record (Retry Workflow)
  const discardAndReset = useCallback(() => {
    stopAllMedia();
    setRecordingState("idle");
    setTranscript("");
    setInterimTranscript("");
    transcriptBufferRef.current = "";
    setDurationSeconds(0);
    setAudioLevel(0);
    setAudioUrl(null);
    setAudioBlob(null);
    setErrorMessage(null);
  }, [stopAllMedia]);

  return {
    recordingState,
    transcript,
    setTranscript,
    interimTranscript,
    durationSeconds,
    audioLevel,
    audioUrl,
    audioBlob,
    errorMessage,
    isSpeechSupported,
    metrics,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    discardAndReset,
  };
}
