"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ChatBubble, type ChatMessage } from "@/components/interview/ChatBubble";
import { InterviewInput } from "@/components/interview/InterviewInput";
import { Button } from "@/components/ui/button";

interface InterviewResponse {
  message: string;
}

export default function InterviewPage() {
  const params = useParams();
  const interviewId = (params?.id as string) || "demo-session";

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

  // Auto-scroll container as messages arrive or loading status changes
  const { containerRef, bottomRef } = useAutoScroll([
    messages,
    isLoading,
    error,
  ]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
    const endpoint = `${API_URL}/interviews/${encodeURIComponent(interviewId)}/message`;

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
          : "Something went wrong. Please try again.";
      setError(`Failed to receive response from AI: ${errorMessage}`);
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      {/* ── Top Session Header ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/70 bg-card/60 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border/80" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold sm:text-base">
                  Live Mock Interview
                </h1>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Session ID: <span className="font-mono">{interviewId}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>AI Guided</span>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="text-xs">
              End Session
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Scrollable Chat Messages Area ── */}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8"
        aria-label="Interview Conversation"
      >
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Session Banner */}
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-center text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Practice mode is active. Take your time to formulate clear and structured answers.
            </p>
          </div>

          {/* Render All Chat Messages */}
          {messages.map((msg, index) => (
            <ChatBubble
              key={msg.id || `msg-${index}`}
              message={msg}
            />
          ))}

          {/* AI Typing Indicator */}
          {isLoading && (
            <div className="flex w-full items-start gap-3 py-2">
              <div
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary shadow-xs"
              >
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="font-semibold text-foreground/90">
                    AI Interviewer
                  </span>
                  <span className="text-[11px] text-muted-foreground">is formulating feedback...</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-border/80 bg-card px-4 py-3.5 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* Inline Error Message */}
          {error && (
            <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive shadow-xs">
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
                  className="shrink-0 gap-1.5 border-destructive/40 text-xs text-destructive hover:bg-destructive/15"
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

      {/* ── Fixed Bottom Message Input ── */}
      <InterviewInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Type your answer... (Press Enter to send, Shift+Enter for new line)"
      />
    </div>
  );
}
