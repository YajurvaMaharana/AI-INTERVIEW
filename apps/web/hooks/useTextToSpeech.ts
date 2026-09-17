"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type PlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5;

export interface UseTextToSpeechOptions {
  defaultAutoPlay?: boolean;
  defaultRate?: PlaybackSpeed;
  personaId?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    defaultAutoPlay = true,
    defaultRate = 1.0,
    personaId = "tech-grinder",
    onStart,
    onEnd,
    onError,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRateState] = useState<PlaybackSpeed>(defaultRate);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(defaultAutoPlay);
  const [isSupported, setIsSupported] = useState(true);
  const [currentText, setCurrentText] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentTextRef = useRef<string>("");
  const rateRef = useRef<PlaybackSpeed>(defaultRate);
  const isMutedRef = useRef<boolean>(false);
  const personaRef = useRef<string>(personaId);

  rateRef.current = rate;
  isMutedRef.current = isMuted;
  personaRef.current = personaId;

  // Initialize available voices
  const pickPersonaVoice = useCallback(
    (voiceList: SpeechSynthesisVoice[], persona: string) => {
      if (!voiceList.length) return null;

      // Filter for English voices first
      const englishVoices = voiceList.filter((v) =>
        v.lang.toLowerCase().startsWith("en")
      );
      const candidates = englishVoices.length ? englishVoices : voiceList;

      if (persona === "hr-partner") {
        // Prefer natural female voice
        const femaleVoice = candidates.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("victoria") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("karen") ||
            v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("google us english")
        );
        return femaleVoice || candidates[0];
      }

      if (persona === "simulation-boss") {
        // Prefer authoritative/executive voice
        const execVoice = candidates.find(
          (v) =>
            v.name.toLowerCase().includes("david") ||
            v.name.toLowerCase().includes("daniel") ||
            v.name.toLowerCase().includes("george") ||
            v.name.toLowerCase().includes("alex") ||
            v.name.toLowerCase().includes("guy")
        );
        return execVoice || candidates[0];
      }

      if (persona === "supportive-mentor") {
        // Prefer warm friendly voice
        const mentorVoice = candidates.find(
          (v) =>
            v.name.toLowerCase().includes("friendly") ||
            v.name.toLowerCase().includes("siri") ||
            v.name.toLowerCase().includes("serena") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("fiona")
        );
        return mentorVoice || candidates[0];
      }

      // Default / Tech Grinder: crisp standard voice
      const crispVoice = candidates.find(
        (v) =>
          v.name.toLowerCase().includes("google us english") ||
          v.name.toLowerCase().includes("alex") ||
          v.name.toLowerCase().includes("natural") ||
          v.name.toLowerCase().includes("tom")
      );
      return crispVoice || candidates[0];
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        const best = pickPersonaVoice(available, personaRef.current);
        setSelectedVoice(best);
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [pickPersonaVoice]);

  // Clean raw markdown / code blocks before reading aloud
  const sanitizeTextForSpeech = (rawText: string): string => {
    return rawText
      .replace(/```[\s\S]*?```/g, "Code block provided on screen.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#+\s/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "link")
      .replace(/\s+/g, " ")
      .trim();
  };

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const speak = useCallback(
    (textToSpeak: string, customRate?: PlaybackSpeed) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const cleanText = sanitizeTextForSpeech(textToSpeak);
      if (!cleanText) return;

      currentTextRef.current = textToSpeak;
      setCurrentText(textToSpeak);

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      if (isMutedRef.current) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const effectiveRate = customRate || rateRef.current;
      utterance.rate = effectiveRate;
      utterance.pitch = personaRef.current === "hr-partner" ? 1.05 : personaRef.current === "tech-grinder" ? 0.98 : 1.0;
      utterance.volume = 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        if (event.error !== "canceled" && event.error !== "interrupted") {
          console.warn("Speech synthesis error event:", event);
          onError?.(event);
        }
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, onStart, onEnd, onError]
  );

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const replay = useCallback(
    (text?: string) => {
      const target = text || currentTextRef.current || currentText;
      if (target) {
        speak(target, rateRef.current);
      }
    },
    [currentText, speak]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      if (next) {
        stop();
      }
      return next;
    });
  }, [stop]);

  const setRate = useCallback(
    (newRate: PlaybackSpeed) => {
      setRateState(newRate);
      rateRef.current = newRate;
      // If currently speaking, restart with new rate
      if (isSpeaking && currentTextRef.current) {
        speak(currentTextRef.current, newRate);
      }
    },
    [isSpeaking, speak]
  );

  return {
    isSpeaking,
    isPaused,
    isMuted,
    rate,
    autoPlayEnabled,
    isSupported,
    currentText,
    voices,
    selectedVoice,
    speak,
    pause,
    resume,
    stop,
    replay,
    toggleMute,
    setRate,
    setAutoPlayEnabled,
  };
}

export default useTextToSpeech;
