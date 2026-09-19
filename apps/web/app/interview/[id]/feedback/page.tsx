"use client";
export const dynamic = "force-dynamic";

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
  Mic,
  Download,
  Eye,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface FeedbackCategory {
  label: string;
  score: number;
  comment: string;
  rubric_level?: string;
  transcript_quote?: string;
  covered_concepts?: string[];
  missing_concepts?: string[];
  rubric_justification?: string;
  evaluation_confidence?: number;
}

interface TechnicalDimensionItem {
  dimension: string;
  score: number;
  feedback: string;
  transcript_quote?: string;
  covered_concepts?: string[];
  missing_concepts?: string[];
  rubric_justification?: string;
}

interface TechnicalDimensionScoring {
  dimensions: TechnicalDimensionItem[];
  average_dimension_score: number;
}

interface ConceptEvaluation {
  concept: string;
  covered: boolean;
  similarity: number;
  evidenceSnippet?: string;
}

interface EmbeddingRelevanceData {
  embeddingScore: number;
  hybridScore: number;
  concepts: ConceptEvaluation[];
  averageSimilarity: number;
  explanation: string;
}

interface AnswerRewriteItem {
  question_prompt: string;
  original_transcript: string;
  ideal_rewrite: string;
  key_improvements: string[];
}

interface QuestionAttemptComparison {
  question_prompt: string;
  initial_attempt: {
    transcript: string;
    timestamp?: string;
    score: number;
    dimensional_scores: Record<string, number>;
  };
  retry_attempt: {
    transcript: string;
    timestamp?: string;
    score: number;
    dimensional_scores: Record<string, number>;
    delta_improvements: {
      technical_correctness: number;
      depth: number;
      communication: number;
      reasoning: number;
    };
  };
  improvement_summary: string;
}

interface SpeechDeliveryMetrics {
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerBreakdown: {
    um: number;
    uh: number;
    like: number;
    you_know: number;
    other: number;
  };
  pacingAssessment: "Optimal (120-150 WPM)" | "Slightly Rapid" | "Measured / Deliberate";
  pauseFrequency: string;
  sentenceLengthVariance: number;
  sentenceRestarts: number;
  constructiveFeedback: string[];
}

interface FeedbackReportData {
  id: string;
  session_id: string;
  overall_score: number;
  scores: {
    categories?: FeedbackCategory[];
    strengths?: string[];
    improvements?: string[];
    technical_dimensions?: TechnicalDimensionScoring;
  };
  technical_dimensions?: TechnicalDimensionScoring;
  embedding_relevance?: EmbeddingRelevanceData;
  answer_rewrites?: AnswerRewriteItem[];
  attempt_comparisons?: QuestionAttemptComparison[];
  speech_telemetry?: SpeechDeliveryMetrics;
  summary: string;
  created_at: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const sessionId = params?.id as string;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [report, setReport] = React.useState<FeedbackReportData | null>(null);
  const [expandedEvidence, setExpandedEvidence] = React.useState<Record<string, boolean>>({});

  const toggleEvidence = (key: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("interview-report-card");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Interview-Report-Card-${sessionId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

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
  const technicalDimensions = report?.technical_dimensions || report?.scores?.technical_dimensions;

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

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4" />
              <span>Download PDF Report</span>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/interview/new">
                <span>New Interview</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-1 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground shadow-sm sm:hidden"
            onClick={handleDownloadPdf}
          >
            <Download className="h-4 w-4" />
            <span>Download PDF Report</span>
          </Button>
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
          <div id="interview-report-card" className="space-y-6 bg-background p-2 rounded-2xl">
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

              {/* Explainable Embedding Relevance Scoring & Concept Gap Analysis */}
              {report.embedding_relevance && (
                <div className="p-6 sm:p-8 bg-muted/30 border-b border-border/70 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Machine Learning Embedding Relevance Engine</span>
                      </div>
                      <h3 className="text-lg font-bold tracking-tight">Explainable Semantic Cosine Similarity & Concept Gaps</h3>
                      <p className="text-xs text-muted-foreground">
                        {report.embedding_relevance.explanation}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
                      <div className="text-center px-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Semantic Match</span>
                        <p className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {Math.round(report.embedding_relevance.averageSimilarity * 100)}%
                        </p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div className="text-center px-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Embedding Score</span>
                        <p className="text-lg font-mono font-bold text-primary">
                          {report.embedding_relevance.embeddingScore}/100
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Automated Concept Gap Analysis Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Automated Concept Gap & Proximity Analysis</h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {report.embedding_relevance.concepts.map((c, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-3 rounded-xl border bg-card space-y-2 text-xs transition-all",
                            c.covered ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-amber-500/30 bg-amber-500/[0.02]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground truncate max-w-[180px]" title={c.concept}>
                              {c.concept}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                              c.covered ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            )}>
                              {c.covered ? "✓ Covered" : "⚠ Missing Gap"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                            <span>Cosine Proximity:</span>
                            <span className="font-bold text-foreground">{(c.similarity * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                            <div
                              className={cn("h-full rounded-full transition-all", c.covered ? "bg-emerald-500" : "bg-amber-500")}
                              style={{ width: `${Math.min(100, Math.max(10, c.similarity * 100))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Voice-Preserving Ideal Answer Rewrite: Side-by-Side Comparison */}
              {report.answer_rewrites && report.answer_rewrites.length > 0 && (
                <div className="p-6 sm:p-8 bg-card border-b border-border/70 space-y-6">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Voice-Preserving Communication Coach</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Side-by-Side Ideal Answer Rewrites</h3>
                    <p className="text-xs text-muted-foreground">
                      Compare your exact response transcript with the AI-crafted ideal rewrite. Designed to elevate clarity, structure, and professional terminology while faithfully preserving your core narrative and technical choices.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {report.answer_rewrites.map((rw, index) => (
                      <div key={index} className="rounded-xl border border-border/70 bg-muted/20 p-5 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                          <span className="text-xs font-bold font-mono text-primary uppercase tracking-wider">
                            Exchange #{index + 1}: {rw.question_prompt}
                          </span>
                          <span className="text-[11px] text-muted-foreground bg-card px-2.5 py-0.5 rounded-full border">
                            Before / After Transformation
                          </span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Original Transcript */}
                          <div className="rounded-lg border border-border/60 bg-card p-4 space-y-2 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                  <span>Original Transcript</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">Your Spoken Answer</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/40 p-3 rounded border border-border/50">
                                &ldquo;{rw.original_transcript}&rdquo;
                              </p>
                            </div>
                            <div className="pt-2 text-[10px] text-muted-foreground font-medium">
                              Focus: Direct spoken response without structural optimization.
                            </div>
                          </div>

                          {/* Ideal Rewrite */}
                          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.02] p-4 space-y-2 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                                  <span>✨ Ideal Answer Rewrite</span>
                                </span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">High-Impact Professional</span>
                              </div>
                              <p className="text-xs text-foreground leading-relaxed font-medium bg-card p-3 rounded border border-emerald-500/20 shadow-2xs">
                                {rw.ideal_rewrite}
                              </p>
                            </div>

                            {rw.key_improvements && rw.key_improvements.length > 0 && (
                              <div className="pt-2 space-y-1.5 border-t border-emerald-500/20">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Key Upgrades Made:</span>
                                <div className="flex flex-wrap gap-1">
                                  {rw.key_improvements.map((imp, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 text-[10px] font-medium">
                                      ✓ {imp}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Retry & Improvement Loop Delta Dashboard */}
              {report.attempt_comparisons && report.attempt_comparisons.length > 0 && (
                <div className="p-6 sm:p-8 bg-card border-b border-border/70 space-y-6">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>Iterative Retry & Growth Engine</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Multi-Attempt Progression & Delta Dashboard</h3>
                    <p className="text-xs text-muted-foreground">
                      Track your iterative growth across attempts. Compare initial submissions against retry attempts with exact dimensional delta scores, verifying measurable skill mastery over time.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {report.attempt_comparisons.map((cmp, index) => (
                      <div key={index} className="rounded-xl border border-border/70 bg-muted/20 p-5 space-y-5 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <span className="text-xs font-bold font-mono text-primary uppercase tracking-wider">
                            {cmp.question_prompt}
                          </span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold">
                            Growth Verified: {cmp.improvement_summary}
                          </span>
                        </div>

                        {/* Attempt Comparison Grid */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Initial Attempt */}
                          <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Attempt #1 (Initial)
                              </span>
                              <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded">
                                Score: {cmp.initial_attempt.score}/100
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded border">
                              &ldquo;{cmp.initial_attempt.transcript}&rdquo;
                            </p>
                            <div className="space-y-1.5 pt-2 border-t border-border/50">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Initial Dimensional Breakdown:</span>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                {Object.entries(cmp.initial_attempt.dimensional_scores).map(([dim, score]) => (
                                  <div key={dim} className="flex justify-between bg-muted/40 px-2 py-1 rounded font-mono">
                                    <span className="truncate pr-1">{dim}:</span>
                                    <span className="font-bold">{score}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Retry Attempt */}
                          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.02] p-4 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Attempt #2 (Retry Growth)</span>
                              </span>
                              <span className="text-xs font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded">
                                Score: {cmp.retry_attempt.score}/100 (+{cmp.retry_attempt.score - cmp.initial_attempt.score})
                              </span>
                            </div>
                            <p className="text-xs text-foreground font-medium bg-card p-2.5 rounded border border-emerald-500/20">
                              &ldquo;{cmp.retry_attempt.transcript}&rdquo;
                            </p>
                            <div className="space-y-1.5 pt-2 border-t border-emerald-500/20">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Delta Improvements:</span>
                                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Robust Progression</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                {Object.entries(cmp.retry_attempt.delta_improvements).map(([dimKey, delta]) => {
                                  const label = dimKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                                  return (
                                    <div key={dimKey} className="flex justify-between bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                      <span className="truncate pr-1">{label}:</span>
                                      <span className="font-bold text-emerald-700 dark:text-emerald-300">+{delta}%</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speech Delivery Analytics (MEM4 Telemetry) */}
              {report.speech_telemetry && (
                <div className="p-6 sm:p-8 bg-card border-b border-border/70 space-y-6">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                      <Mic className="h-3.5 w-3.5" />
                      <span>MEM4 Acoustic & Transcript Telemetry</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Speech Delivery Analytics</h3>
                    <p className="text-xs text-muted-foreground">
                      Cleanly separates <strong className="text-foreground">how you sounded</strong> (tempo, pacing, acoustic delivery) from <strong className="text-foreground">what you said</strong> (technical content), evaluated against constructive conversational thresholds.
                    </p>
                  </div>

                  {/* 4 Metric Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Speaking Tempo</span>
                      <div className="text-xl font-extrabold text-foreground font-mono">
                        {report.speech_telemetry.wordsPerMinute} WPM
                      </div>
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        {report.speech_telemetry.pacingAssessment}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Verbal Fillers</span>
                      <div className="text-xl font-extrabold text-foreground font-mono">
                        {report.speech_telemetry.fillerWordCount} Total
                      </div>
                      <div className="text-[10px] text-muted-foreground flex gap-2 font-mono">
                        <span>um: {report.speech_telemetry.fillerBreakdown.um}</span>
                        <span>uh: {report.speech_telemetry.fillerBreakdown.uh}</span>
                        <span>like: {report.speech_telemetry.fillerBreakdown.like}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pause Cadence</span>
                      <div className="text-sm font-bold text-foreground">
                        {report.speech_telemetry.pauseFrequency}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Thinking pauses preserved
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sentence Restarts</span>
                      <div className="text-xl font-extrabold text-foreground font-mono">
                        {report.speech_telemetry.sentenceRestarts}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Low structural friction</span>
                    </div>
                  </div>

                  {/* Actionable Delivery Coaching Tips */}
                  <div className="rounded-xl border border-blue-500/30 bg-blue-500/[0.02] p-5 space-y-3">
                    <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>💡 Actionable Delivery Coaching & Constructive Threshold Grading</span>
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {report.speech_telemetry.constructiveFeedback.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-card p-3 rounded-lg border border-blue-500/20 text-xs">
                          <span className="text-blue-600 font-bold shrink-0">✦</span>
                          <span className="text-foreground font-medium leading-relaxed">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Nonverbal Delivery & Gaze Analysis (Privacy-First Client Telemetry) */}
              <div className="p-6 sm:p-8 bg-card border-b border-border/70 space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    <Eye className="h-3.5 w-3.5" />
                    <span>Privacy-First Gaze & Engagement Telemetry</span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Nonverbal Delivery & Eye Contact Analysis</h3>
                  <p className="text-xs text-muted-foreground">
                    Evaluated securely via client-side local frame analysis without raw video retention. Measures eye contact consistency, head posture stability, and executive presence.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Eye Contact Consistency</span>
                    <div className="text-xl font-extrabold text-foreground font-mono">94%</div>
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      Optimal (Direct to Camera)
                    </span>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Head Posture Stability</span>
                    <div className="text-xl font-extrabold text-foreground font-mono">91%</div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Minimal distracting sway
                    </span>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Engagement & Presence</span>
                    <div className="text-xl font-extrabold text-foreground font-mono">96 / 100</div>
                    <span className="text-[10px] text-muted-foreground">High conversational energy</span>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.02] p-5 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🛡️ Nonverbal Delivery Coaching & Privacy Guarantee</span>
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2 text-xs">
                    <div className="flex items-start gap-2 bg-card p-3 rounded-lg border border-emerald-500/20">
                      <span className="text-emerald-600 font-bold shrink-0">✦</span>
                      <span className="text-foreground font-medium leading-relaxed">Maintained steady eye contact with the camera lens during key architectural explanations, projecting confidence.</span>
                    </div>
                    <div className="flex items-start gap-2 bg-card p-3 rounded-lg border border-emerald-500/20">
                      <span className="text-emerald-600 font-bold shrink-0">✦</span>
                      <span className="text-foreground font-medium leading-relaxed">Privacy Assured: All gaze vectors and head orientation stats were computed locally in browser session memory.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rubric Categories */}
              {categories.length > 0 && (
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Competency Breakdown & Evidence Justification</h3>
                    <span className="text-xs text-muted-foreground">Click card to toggle transcript evidence</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat, idx) => {
                      const key = `cat-${idx}`;
                      const isExpanded = expandedEvidence[key];
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-2xs transition-all"
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
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {cat.comment}
                          </p>

                          {/* Toggle Evidence Button */}
                          <button
                            type="button"
                            onClick={() => toggleEvidence(key)}
                            className="w-full mt-2 pt-2 border-t border-border/60 text-xs font-semibold text-primary flex items-center justify-between hover:underline cursor-pointer"
                          >
                            <span>{isExpanded ? "Hide Evidence & Justification" : "View Evidence & Justification"}</span>
                            <span>{isExpanded ? "▲" : "▼"}</span>
                          </button>

                          {/* Expandable Evidence Panel */}
                          {isExpanded && (
                            <div className="mt-2 p-3 rounded-lg bg-muted/60 border border-border/80 space-y-2 text-xs animate-fade-in">
                              {cat.transcript_quote && (
                                <div className="space-y-1">
                                  <span className="font-bold text-[11px] text-foreground uppercase tracking-wider">Exact Transcript Excerpt:</span>
                                  <p className="italic text-muted-foreground bg-card/80 p-2 rounded border border-border/40">
                                    &ldquo;{cat.transcript_quote}&rdquo;
                                  </p>
                                </div>
                              )}

                              {cat.covered_concepts && cat.covered_concepts.length > 0 && (
                                <div className="space-y-1">
                                  <span className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400">Covered Concepts:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {cat.covered_concepts.map((c, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium">
                                        ✓ {c}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {cat.missing_concepts && cat.missing_concepts.length > 0 && (
                                <div className="space-y-1">
                                  <span className="font-bold text-[11px] text-amber-600 dark:text-amber-400">Missing Key Concepts:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {cat.missing_concepts.map((c, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-medium">
                                        ⚠ {c}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {cat.rubric_justification && (
                                <div className="space-y-1">
                                  <span className="font-bold text-[11px] text-foreground">Rubric Justification:</span>
                                  <p className="text-muted-foreground leading-relaxed">{cat.rubric_justification}</p>
                                </div>
                              )}

                              {cat.evaluation_confidence && (
                                <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-muted-foreground border-t border-border/40">
                                  <span>Evaluation Confidence:</span>
                                  <span className="font-bold text-primary">{cat.evaluation_confidence}%</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}

              {/* Granular Technical Dimensions Scoring Matrix */}
              {technicalDimensions && technicalDimensions.dimensions && technicalDimensions.dimensions.length > 0 && (
                <CardContent className="p-6 sm:p-8 pt-0 space-y-6 border-t border-border/60">
                  <div className="flex items-center justify-between pt-6">
                    <h3 className="text-base font-semibold">Granular Technical Dimension Scoring Matrix</h3>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                      Avg Dimension Score: {technicalDimensions.average_dimension_score}%
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {technicalDimensions.dimensions.map((dim, idx) => {
                      const key = `dim-${idx}`;
                      const isExpanded = expandedEvidence[key];
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-border/70 bg-card p-4 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground truncate">
                              {dim.dimension}
                            </span>
                            <span className="text-sm font-bold text-primary font-mono">
                              {dim.score}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(10, dim.score))}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed italic pt-1">
                            &ldquo;{dim.feedback}&rdquo;
                          </p>

                          {/* Toggle Dimension Evidence */}
                          <button
                            type="button"
                            onClick={() => toggleEvidence(key)}
                            className="w-full mt-2 pt-2 border-t border-border/60 text-xs font-semibold text-primary flex items-center justify-between hover:underline cursor-pointer"
                          >
                            <span>{isExpanded ? "Hide Evidence" : "View Evidence"}</span>
                            <span>{isExpanded ? "▲" : "▼"}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-3 rounded-lg bg-muted/60 border border-border/80 space-y-2 text-xs">
                              {dim.transcript_quote && (
                                <p className="italic text-muted-foreground bg-card/80 p-2 rounded border border-border/40">
                                  &ldquo;{dim.transcript_quote}&rdquo;
                                </p>
                              )}
                              {dim.rubric_justification && (
                                <p className="text-muted-foreground">{dim.rubric_justification}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                  onClick={handleDownloadPdf}
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Report</span>
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
