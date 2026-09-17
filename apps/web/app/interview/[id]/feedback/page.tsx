"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Home,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface FeedbackCategory {
  label: string;
  score: number;
  comment: string;
}

interface FeedbackReportData {
  id: string;
  session_id: string;
  overall_score: number;
  scores: {
    categories?: FeedbackCategory[];
    strengths?: string[];
    improvements?: string[];
  };
  summary: string;
  created_at: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const sessionId = params?.id as string;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [report, setReport] = React.useState<FeedbackReportData | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchOrGenerateFeedback() {
      setLoading(true);
      setError(null);
      try {
        // Try to generate or retrieve the report
        const res = await fetch(`/api/interviews/${encodeURIComponent(sessionId)}/feedback`, {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const data = await res.json();
        if (isMounted) {
          setReport(data.report);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to generate evaluation report.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (sessionId) {
      fetchOrGenerateFeedback();
    }

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const categories = report?.scores?.categories || [];
  const strengths = report?.scores?.strengths || [];
  const improvements = report?.scores?.improvements || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <span>/</span>
            <Link href={`/interview/${sessionId}`} className="hover:text-foreground flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>Session</span>
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">Feedback Debrief</span>
          </div>

          <Button asChild size="sm" className="gap-1.5">
            <Link href="/interview/new">
              <span>New Interview</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Header Title */}
        <div className="space-y-1 border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Interview Evaluation Debrief</h1>
              <p className="text-sm text-muted-foreground">
                Structured post-interview performance breakdown and actionable recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Sparkles className="h-6 w-6 text-primary absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Analyzing Interview Performance</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Evaluating your technical accuracy, communication clarity, and architectural trade-offs...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-sm text-destructive font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Generation</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loaded Feedback Report */}
        {!loading && report && (
          <div className="space-y-6">
            {/* Overall Score Card */}
            <Card className="border-border/70 overflow-hidden shadow-xs">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-b">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Overall Performance
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    {report.overall_score >= 85
                      ? "Strong Hire Candidate"
                      : report.overall_score >= 70
                      ? "Passing / Competent"
                      : "Needs Practice"}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                    {report.summary}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary bg-card shadow-xs">
                    <span className="text-4xl font-extrabold text-foreground">
                      {report.overall_score}
                    </span>
                    <span className="text-xs text-muted-foreground absolute bottom-3">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Rubric Categories */}
              {categories.length > 0 && (
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <h3 className="text-base font-semibold">Competency Breakdown</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/70 bg-card p-4 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            {cat.label}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {cat.score}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(10, cat.score))}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                          {cat.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Strengths & Actionable Improvements Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Strengths */}
              <Card className="border-border/70 shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <CardTitle className="text-base">Key Strengths</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Demonstrated proficiencies observed by the AI evaluator.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strengths.map((st, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{st}</span>
                    </div>
                  ))}
                  {strengths.length === 0 && (
                    <p className="text-xs text-muted-foreground">None recorded.</p>
                  )}
                </CardContent>
              </Card>

              {/* Actionable Improvements */}
              <Card className="border-border/70 shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Actionable Next Steps</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Targeted focus areas to practice for upcoming real interviews.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{imp}</span>
                    </div>
                  ))}
                  {improvements.length === 0 && (
                    <p className="text-xs text-muted-foreground">None recorded.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href={`/interview/${sessionId}`}>
                    <MessageSquare className="h-4 w-4" />
                    <span>Review Transcript</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5 border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-800">
                  <Link href="/feedback-hub">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    <span>Feedback Hub & Replays</span>
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild size="sm" className="gap-1.5">
                  <Link href="/interview/new">
                    <span>Start Another Interview</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
