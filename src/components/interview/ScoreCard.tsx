"use client";

import * as React from "react";
import {
  MessageSquare,
  Target,
  Layers,
  ShieldCheck,
  Award,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CategoryScores {
  clarity?: number;
  accuracy?: number;
  structure?: number;
  confidence?: number;
}

export interface ScoreCardProps {
  /** Overall score out of 100 */
  overallScore?: number;
  /** Category scores breakdown */
  categoryScores?: CategoryScores;
  /** Direct API pass-through support */
  overall_score?: number;
  category_scores?: CategoryScores;
  className?: string;
}

interface CategoryConfig {
  key: keyof CategoryScores;
  label: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  barColor: string;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    key: "clarity",
    label: "Clarity & Articulation",
    description: "Coherence, vocabulary, and conciseness",
    icon: MessageSquare,
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    barColor: "bg-blue-500 dark:bg-blue-400",
  },
  {
    key: "accuracy",
    label: "Technical Accuracy",
    description: "Correctness of concepts and depth of solutions",
    icon: Target,
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    barColor: "bg-emerald-500 dark:bg-emerald-400",
  },
  {
    key: "structure",
    label: "Response Structure",
    description: "STAR method adherence and logical flow",
    icon: Layers,
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    barColor: "bg-purple-500 dark:bg-purple-400",
  },
  {
    key: "confidence",
    label: "Confidence & Delivery",
    description: "Tone, conviction, and poise under questioning",
    icon: ShieldCheck,
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    barColor: "bg-amber-500 dark:bg-amber-400",
  },
];

/**
 * Returns rating tier label, color, and description based on overall score.
 */
function getScoreTier(score: number): {
  tier: string;
  badgeColor: string;
  strokeColor: string;
  textColor: string;
  summary: string;
} {
  if (score >= 85) {
    return {
      tier: "Exceptional",
      badgeColor:
        "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
      strokeColor: "stroke-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      summary: "Interview performance meets or exceeds senior benchmark criteria.",
    };
  }
  if (score >= 70) {
    return {
      tier: "Strong",
      badgeColor:
        "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400",
      strokeColor: "stroke-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      summary: "Solid competency demonstrated across core interview competencies.",
    };
  }
  if (score >= 55) {
    return {
      tier: "Proficient",
      badgeColor:
        "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
      strokeColor: "stroke-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      summary: "Good baseline responses with focused areas for structured improvement.",
    };
  }
  return {
    tier: "Needs Improvement",
    badgeColor:
      "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
    strokeColor: "stroke-rose-500",
    textColor: "text-rose-600 dark:text-rose-400",
    summary: "Further practice recommended before upcoming technical evaluations.",
  };
}

export function ScoreCard({
  overallScore,
  categoryScores,
  overall_score,
  category_scores,
  className,
}: ScoreCardProps) {
  // Resolve props with fallback support for both camelCase and snake_case
  const finalScore = Math.max(
    0,
    Math.min(100, Math.round(overallScore ?? overall_score ?? 0))
  );
  const categories = categoryScores ?? category_scores ?? {};

  const scoreTier = getScoreTier(finalScore);

  // SVG Circular progress gauge calculations
  const radius = 58;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Stroke offset calculated from score percentage
  const strokeDashoffset = circumference - (finalScore / 100) * circumference;

  return (
    <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-12", className)}>
      {/* ── Card 1: Overall Score Circular Gauge ── */}
      <Card className="flex flex-col justify-between border-border/80 bg-card/70 shadow-sm backdrop-blur-xs lg:col-span-5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Award className="h-5 w-5 text-primary" />
              Overall Performance
            </CardTitle>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
                scoreTier.badgeColor
              )}
            >
              {scoreTier.tier}
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Aggregate assessment generated from your simulated interview answers
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress Gauge */}
            <svg
              className="h-44 w-44 -rotate-90 transform"
              viewBox="0 0 140 140"
              aria-hidden="true"
            >
              {/* Background Track Circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-muted/40 dark:stroke-muted/25"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress Indicator Circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className={cn(
                  scoreTier.strokeColor,
                  "transition-all duration-1000 ease-out"
                )}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Centered Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground"
                aria-label={`Overall score ${finalScore} out of 100`}
              >
                {finalScore}
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Out of 100
              </span>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground max-w-xs">
              {scoreTier.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: Category Breakdown Progress Bars ── */}
      <Card className="flex flex-col justify-between border-border/80 bg-card/70 shadow-sm backdrop-blur-xs lg:col-span-7">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <TrendingUp className="h-5 w-5 text-primary" />
              Category Breakdown
            </CardTitle>
            <span className="text-xs text-muted-foreground font-medium">
              4 Core Competencies
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Granular scoring across communication, technical depth, logic, and delivery
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {CATEGORY_CONFIGS.map((config) => {
            const rawScore = categories[config.key] ?? 0;
            const score = Math.max(0, Math.min(100, Math.round(rawScore)));
            const Icon = config.icon;

            return (
              <div
                key={config.key}
                className="rounded-xl border border-border/50 bg-background/50 p-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs",
                        config.iconBg,
                        config.iconColor
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {config.label}
                      </p>
                      <p className="hidden sm:block truncate text-[11px] text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {score}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      / 100
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Bar */}
                <div
                  className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${config.label} score: ${score} percent`}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      config.barColor
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default ScoreCard;
