"use client";

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
  RotateCcw,
  CheckCircle,
  Inbox,
  Share2,
  Printer,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreCard } from "@/components/interview/ScoreCard";
import { FeedbackList } from "@/components/interview/FeedbackList";
import {
  fetchInterviewFeedback,
  type InterviewFeedback,
  type FeedbackFetchResult,
} from "@/lib/api/feedback";

type PageState = "loading" | "generating" | "ready" | "empty" | "error";

const MAX_POLL_ATTEMPTS = 30; // Max ~90s of polling before timing out gracefully
const POLL_INTERVAL_MS = 3000;

export default function InterviewFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = (params?.id as string) || "demo-session";

  const [state, setState] = React.useState<PageState>("loading");
  const [feedback, setFeedback] = React.useState<InterviewFeedback | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [generatingMessage, setGeneratingMessage] = React.useState<string>(
    "Synthesizing your interview responses and generating performance analytics..."
  );
  const [pollCount, setPollCount] = React.useState<number>(0);
  const [copied, setCopied] = React.useState<boolean>(false);

  // Keep ref to timeout to cancel safely on unmount or retry
  const pollTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = React.useRef<boolean>(true);

  // Clear timers on unmount
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, []);

  const loadFeedback = React.useCallback(
    async (currentPollAttempt: number = 0) => {
      if (!isMountedRef.current) return;

      try {
        const result: FeedbackFetchResult = await fetchInterviewFeedback(
          interviewId
        );

        if (!isMountedRef.current) return;

        if (result.status === "ready") {
          setFeedback(result.data);
          setState("ready");
          setErrorMessage(null);
        } else if (result.status === "generating") {
          setState("generating");
          if (result.message) {
            setGeneratingMessage(result.message);
          }
          setPollCount(currentPollAttempt + 1);

          // Check if polling limit reached
          if (currentPollAttempt >= MAX_POLL_ATTEMPTS) {
            setState("error");
            setErrorMessage(
              "Report generation is taking longer than expected. Please try refreshing in a few moments."
            );
            return;
          }

          // Schedule next poll
          pollTimerRef.current = setTimeout(() => {
            loadFeedback(currentPollAttempt + 1);
          }, POLL_INTERVAL_MS);
        } else if (result.status === "empty") {
          setState("empty");
          setErrorMessage(result.message || null);
        } else if (result.status === "error") {
          setState("error");
          setErrorMessage(result.message);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        const msg =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while fetching your feedback.";
        setState("error");
        setErrorMessage(msg);
      }
    },
    [interviewId]
  );

  // Initial fetch on mount or when interviewId changes
  React.useEffect(() => {
    setState("loading");
    setPollCount(0);
    loadFeedback(0);

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [loadFeedback]);

  const handleRetry = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
    }
    setState("loading");
    setPollCount(0);
    setErrorMessage(null);
    loadFeedback(0);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top Navigation / Header ── */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-card/75 px-4 py-3 backdrop-blur-md sm:px-6 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
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

            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-semibold sm:text-base">
                    Interview Feedback
                  </h1>
                  {state === "ready" && (
                    <span className="hidden items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 sm:inline-flex">
                      Ready
                    </span>
                  )}
                  {state === "generating" && (
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      Generating
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  Session ID: <span className="font-mono">{interviewId}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {state === "ready" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="hidden sm:inline-flex gap-1.5 text-xs"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Share"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="hidden md:inline-flex gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
              </>
            )}

            <Link href="/interview/new">
              <Button size="sm" className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Practice Again</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
        {/* ── STATE 1: INITIAL LOADING & POLLING/GENERATING STATE ── */}
        {(state === "loading" || state === "generating") && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
            <div className="relative mb-6 flex items-center justify-center">
              {/* Outer Pulsing Rings */}
              <div
                className="absolute h-28 w-28 rounded-full bg-primary/10 animate-ping"
                style={{ animationDuration: "2.5s" }}
              />
              <div
                className="absolute h-20 w-20 rounded-full bg-primary/15 animate-pulse"
                style={{ animationDuration: "1.8s" }}
              />

              {/* Center Icon Container */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-card text-primary shadow-lg shadow-primary/10">
                <Sparkles className="h-8 w-8 animate-spin text-primary [animation-duration:6s]" />
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
                {state === "generating"
                  ? "Generating Feedback Report"
                  : "Loading Interview Data"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {generatingMessage}
              </p>
            </div>

            {/* Polling progress animation */}
            <div className="mt-6 w-full max-w-xs space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/5 rounded-full bg-primary animate-pulse transition-all" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Analyzing responses
                </span>
                {pollCount > 0 && (
                  <span className="font-mono text-[10px]">
                    Polling cycle {pollCount}/{MAX_POLL_ATTEMPTS}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-8 text-xs text-muted-foreground max-w-sm">
              Our AI evaluation engine is analyzing your articulation, technical depth, and response structure.
            </p>
          </div>
        )}

        {/* ── STATE 2: EMPTY STATE ── */}
        {state === "empty" && (
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center px-4">
            <Card className="w-full max-w-lg border-border/80 bg-card/80 p-8 shadow-sm">
              <CardContent className="flex flex-col items-center p-0">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Inbox className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  No Feedback Report Found
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {errorMessage ||
                    `We couldn't find an evaluation report for interview session "${interviewId}". This may occur if the session was completed without any recorded answers.`}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="gap-1.5 text-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Check Again
                  </Button>
                  <Link href="/interview/new">
                    <Button size="sm" className="gap-1.5 text-xs">
                      Start Practice Interview
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Return to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── STATE 3: ERROR STATE ── */}
        {state === "error" && (
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center px-4">
            <Card className="w-full max-w-lg border-destructive/30 bg-destructive/5 p-8 shadow-sm">
              <CardContent className="flex flex-col items-center p-0">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-destructive">
                  Unable to Load Report
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {errorMessage ||
                    `The interview session "${interviewId}" does not exist, has expired, or the server encountered an error.`}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </Button>
                  <Link href="/dashboard">
                    <Button size="sm" variant="default" className="text-xs">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/interview/new">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Start New Interview
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── STATE 4: SUCCESS STATE WITH DATA ── */}
        {state === "ready" && feedback && (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Banner Header */}
            <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 shadow-xs sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      AI Generated Insights
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {new Date().toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    Performance Summary
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    Review your comprehensive interview evaluation below. Use the category breakdown to identify targeted improvement areas and study the concrete recommendations before your next interview.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/interview/new">
                    <Button className="gap-2 shadow-xs">
                      <RotateCcw className="h-4 w-4" />
                      Start Another Session
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 1. ScoreCard Component */}
            <section aria-label="Score Overview">
              <ScoreCard
                overallScore={feedback.overall_score}
                categoryScores={feedback.category_scores}
              />
            </section>

            {/* 2. FeedbackList Component */}
            <section aria-label="Detailed Feedback Breakdown">
              <div className="mb-4">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Detailed Feedback & Action Plan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Categorized breakdown of observed strengths, growth opportunities, and recommended drills
                </p>
              </div>

              <FeedbackList
                strengths={feedback.strengths}
                weaknesses={feedback.weaknesses}
                suggestions={feedback.suggestions}
              />
            </section>

            {/* Bottom Next Step Call-To-Action */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-6 text-center sm:p-8">
              <h4 className="text-base font-semibold text-foreground">
                Ready to practice your targeted improvements?
              </h4>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                Repetition is key to mastery. Configure another practice scenario to apply the recommendations above.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Link href="/interview/new">
                  <Button size="sm" className="gap-1.5 text-xs">
                    Start Next Session
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="text-xs">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
