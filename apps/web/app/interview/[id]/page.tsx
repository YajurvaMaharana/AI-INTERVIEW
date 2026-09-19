"use client";
export const dynamic = "force-dynamic";

/* eslint-disable react-hooks/exhaustive-deps */

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Award,
  Zap,
  Mic,
  MessageSquare,
  Target,
} from "lucide-react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ChatBubble, type ChatMessage } from "@/components/interview/ChatBubble";
import { InterviewInput } from "@/components/interview/InterviewInput";
import { LiveVoiceWorkspace } from "@/components/interview/LiveVoiceWorkspace";
import { Button } from "@/components/ui/button";
import { AdaptiveTelemetryHUD } from "@/components/interview/AdaptiveTelemetryHUD";
import { InterviewerAudioPlayer } from "@/components/interview/InterviewerAudioPlayer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import type { SessionAdaptiveTelemetry } from "@/lib/services/ai-engine/adaptive-engine.service";
import type { JobDescriptionParsedData } from "@/lib/types/database.types";

interface InterviewResponse {
  message: string;
  telemetry?: SessionAdaptiveTelemetry;
  evaluation?: any;
}

interface SessionData {
  id: string;
  role: string;
  difficulty: string;
  type: string;
  status: string;
  persona?: string | null;
  modality?: string;
  jd_data?: JobDescriptionParsedData | null;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = (params?.id as string) || "demo-session";

  const [session, setSession] = React.useState<SessionData | null>(null);
  const [telemetry, setTelemetry] = React.useState<SessionAdaptiveTelemetry | null>(null);
  const [isVoiceMode, setIsVoiceMode] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content:
        "Hello! I am your AI Interviewer today. Welcome to your mock interview session.\n\nTo get started, please tell me a bit about your background or simply say \"Ready\" when you would like me to ask the first question.",
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = React.useState<string | null>(null);

  // Spoken message tracking for Hands-Free Speech Flow
  const spokenMessageIdsRef = React.useRef<Set<string>>(new Set());

  // Text-To-Speech Interviewer Engine
  const tts = useTextToSpeech({
    defaultAutoPlay: true,
    defaultRate: 1.0,
    personaId: session?.persona || "tech-grinder",
  });

  // Latest AI message text for quick replay
  const latestAiMessage = React.useMemo(() => {
    const aiMsgs = messages.filter(
      (m) => m.role === "assistant" || m.role === "interviewer" || m.role === "system"
    );
    return aiMsgs.length > 0 ? aiMsgs[aiMsgs.length - 1] : null;
  }, [messages]);

  // Persona name resolution
  const personaDisplayName = React.useMemo(() => {
    const p = session?.persona || "tech-grinder";
    if (p === "hr-partner") return "Sarah Jenkins (HR)";
    if (p === "simulation-boss") return "Marcus Sterling (VP)";
    if (p === "supportive-mentor") return "Elena Rostova (Staff)";
    return "Alex Vance (Lead)";
  }, [session?.persona]);

  // Auto-speak new AI interviewer questions as soon as generated (Hands-Free Flow)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!latestAiMessage || !latestAiMessage.id) return;

    if (!spokenMessageIdsRef.current.has(latestAiMessage.id)) {
      spokenMessageIdsRef.current.add(latestAiMessage.id);

      if (tts.autoPlayEnabled && !tts.isMuted) {
        // Subtle delay to ensure smooth UI transition before speech begins
        const timer = setTimeout(() => {
          tts.speak(latestAiMessage.content);
        }, 250);
        return () => clearTimeout(timer);
      }
    }
  }, [latestAiMessage]);

  // Load existing session, messages, and initial telemetry
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    let isMounted = true;

    async function loadSessionData() {
      try {
        const [sessionRes, telemetryRes] = await Promise.all([
          fetch(`/api/interviews/${encodeURIComponent(interviewId)}`),
          fetch(`/api/interviews/${encodeURIComponent(interviewId)}/telemetry`),
        ]);

        if (sessionRes.ok) {
          const data = await sessionRes.json();
          if (isMounted) {
            if (data.session) {
              setSession(data.session);
              if (data.session.modality === "voice") {
                setIsVoiceMode(true);
              }
            }
            if (Array.isArray(data.messages) && data.messages.length > 0) {
              const formattedMsgs: ChatMessage[] = data.messages.map((m: any, i: number) => ({
                id: m.id || `msg-${i}`,
                role: m.sender_role === "ai" ? "assistant" : "user",
                content: m.content,
                timestamp: m.created_at ? new Date(m.created_at) : new Date(),
              }));
              setMessages(formattedMsgs);
            }
          }
        }

        if (telemetryRes.ok) {
          const teleData = await telemetryRes.json();
          if (isMounted && teleData.telemetry) {
            setTelemetry(teleData.telemetry);
          }
        }
      } catch (err) {
        console.warn("Could not preload session messages or telemetry:", err);
      }
    }

    loadSessionData();
    return () => {
      isMounted = false;
      tts.stop();
    };
  }, [interviewId]);

  // Auto-scroll container as messages arrive or loading status changes
  const { containerRef, bottomRef } = useAutoScroll([
    messages,
    isLoading,
    error,
  ]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Stop ongoing speech before user speaks/sends
    tts.stop();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    // Optimistically update conversation
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setLastFailedMessage(null);

    const endpoint = `/api/interviews/${encodeURIComponent(interviewId)}/message`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        let errMsg = `Server returned status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.message) {
            errMsg = errData.message;
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(errMsg);
      }

      const data: InterviewResponse = await response.json();

      if (data.telemetry) {
        setTelemetry(data.telemetry);
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Network connection issue. Please try again.";
      setError(`Failed to receive response: ${errorMessage}`);
      setLastFailedMessage(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    } else {
      setError(null);
    }
  };

  const handleEndSession = () => {
    tts.stop();
    router.push(`/interview/${encodeURIComponent(interviewId)}/feedback`);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#ECEEF2] dark:bg-[#0B0F15] transition-colors duration-300 overflow-hidden">
      {/* ── Top Session Header ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-[#222B3A] bg-white/80 dark:bg-[#151922]/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#E8602E] to-[#F17E45] text-white shadow-2xs">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold sm:text-base text-slate-900 dark:text-white">
                  {session?.role ? `${session.role} Interview` : "Adaptive AI Mock Interview"}
                </h1>
                <span className="inline-flex items-center rounded-full bg-[#FFF7ED] dark:bg-[#2A1D17] border border-[#FDBA74]/80 dark:border-[#EA580C]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#C2410C] dark:text-[#FB923C]">
                  {session?.difficulty ? `${session.difficulty.toUpperCase()}` : "ADAPTIVE"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Session ID: <span className="font-mono">{interviewId}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switcher in header */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsVoiceMode(false)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                !isVoiceMode
                  ? "bg-white dark:bg-[#181E29] text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Text Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setIsVoiceMode(true)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                isVoiceMode
                  ? "bg-gradient-to-r from-[#E8602E] to-[#F17E45] text-white shadow-2xs"
                  : "text-slate-500 hover:text-orange-600 dark:hover:text-orange-400"
              )}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Voice Mode</span>
            </button>
          </div>

          <div className="hidden items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 md:flex bg-white/80 dark:bg-[#1C2230]/80 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700/80">
            <Zap className="h-3.5 w-3.5 text-[#E87A42]" />
            <span>Adaptive Engine Live</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEndSession}
            className="gap-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-[#181E29] border-slate-200 dark:border-slate-800 hover:bg-[#FFF6F0] dark:hover:bg-[#2A1D17] hover:text-[#E8602E] transition-colors cursor-pointer shadow-2xs"
          >
            <Award className="h-3.5 w-3.5 text-[#E8602E]" />
            <span>End & View Feedback</span>
          </Button>
        </div>
      </header>

      {/* ── Real-Time Adaptive Difficulty & Telemetry HUD ── */}
      <div className="px-4 sm:px-6 md:px-8 pt-3 pb-1 max-w-4xl mx-auto w-full space-y-2">
        <AdaptiveTelemetryHUD telemetry={telemetry} />

        {/* Visible Adaptation Reason Notification Banner */}
        {telemetry?.branchDescription && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent dark:from-amber-500/15 dark:via-orange-500/15 border border-amber-500/30 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-300">
            <Sparkles className="h-4 w-4 shrink-0 text-[#E8602E] animate-pulse" />
            <div className="flex-1 font-medium leading-relaxed">
              <span className="font-extrabold mr-1 text-[#E8602E]">AI Adaptation Rationale:</span>
              <span>{telemetry.branchDescription}</span>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 dark:bg-[#1C2230] text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20 shadow-2xs">
              Live Shift
            </span>
          </div>
        )}
      </div>

      {/* ── Scrollable Chat Messages Area ── */}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 md:px-8"
        aria-label="Interview Conversation"
      >
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Session & JD Grounding Banner */}
          {session?.jd_data ? (
            <div className="rounded-2xl border border-[#FDBA74]/80 dark:border-[#EA580C]/40 bg-[#FFF7ED]/90 dark:bg-[#2A1D17]/80 p-3.5 text-xs text-[#9A3412] dark:text-[#FDBA74] shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-[#E8602E]" />
                  <span>JD Calibrated: {session.jd_data.job_title} {session.jd_data.company_name ? `(${session.jd_data.company_name})` : ""}</span>
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#E8602E] text-white">
                  {session.jd_data.seniority_level}
                </span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Questions are strictly grounded in target criteria: {session.jd_data.required_skills?.slice(0, 5).join(", ")}.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#151922]/80 p-3 text-center text-xs text-slate-600 dark:text-slate-400 shadow-2xs">
              <p className="flex items-center justify-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5 text-[#E8602E]" />
                Real-time adaptive difficulty is active. Answers are scored live across concurrency, system design, and STAR framework dimensions.
              </p>
            </div>
          )}

          {/* Render All Chat Messages */}
          {messages.map((msg, index) => (
            <ChatBubble
              key={msg.id || `msg-${index}`}
              message={msg}
            />
          ))}

          {/* AI Typing Indicator with Adaptive Evaluation Note */}
          {isLoading && (
            <div className="flex w-full items-start gap-3 py-2">
              <div
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E8602E] to-[#F17E45] text-white shadow-xs"
              >
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1 px-1 text-xs text-slate-500 dark:text-slate-400">
                  <Sparkles className="h-3 w-3 text-[#E8602E]" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    AscendX Adaptive Engine
                  </span>
                  <span className="text-[11px] text-slate-500">evaluating competency matrix & branching...</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181E29] px-4 py-3.5 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-[#E8602E] animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-[#E8602E] animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-[#E8602E] animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* Inline Error Message */}
          {error && (
            <div className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-600 dark:text-rose-400 shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
              {lastFailedMessage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="shrink-0 gap-1.5 border-rose-500/40 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/15"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* Bottom scroll marker */}
          <div ref={bottomRef} className="h-1" />
        </div>
      </main>

      {/* ── Fixed Bottom Message Input / Voice Workspace ── */}
      <div className="bg-white/90 dark:bg-[#151922]/90 border-t border-slate-200/80 dark:border-[#222B3A] backdrop-blur-md">
        {isVoiceMode ? (
          <div className="max-w-4xl mx-auto p-3 sm:p-4">
            <LiveVoiceWorkspace
              onSendAnswer={handleSendMessage}
              disabled={isLoading}
              contextRole={session?.role}
              onSwitchToTextMode={() => setIsVoiceMode(false)}
            />
          </div>
        ) : (
          <InterviewInput
            onSend={handleSendMessage}
            disabled={isLoading}
            onToggleVoiceMode={() => setIsVoiceMode(true)}
            isVoiceMode={isVoiceMode}
            placeholder="Type your answer... (Press Enter to send, Shift+Enter for new line)"
          />
        )}
      </div>
    </div>
  );
}
