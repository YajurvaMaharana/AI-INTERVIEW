"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FeedbackListProps {
  /** Highlights of strong performance */
  strengths?: string[];
  /** Key areas requiring development */
  weaknesses?: string[];
  /** Concrete next steps and recommendations */
  suggestions?: string[];
  className?: string;
}

interface FeedbackSectionConfig {
  title: string;
  badgeLabel: string;
  description: string;
  icon: React.ElementType;
  iconContainerClass: string;
  badgeClass: string;
  bulletClass: string;
  emptyMessage: string;
  data: string[];
}

export function FeedbackList({
  strengths = [],
  weaknesses = [],
  suggestions = [],
  className,
}: FeedbackListProps) {
  const sections: FeedbackSectionConfig[] = [
    {
      title: "Key Strengths",
      badgeLabel: `${strengths.length} Identified`,
      description: "Areas where your communication and technical reasoning excelled",
      icon: CheckCircle2,
      iconContainerClass:
        "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      badgeClass:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      bulletClass:
        "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400",
      emptyMessage: "No specific strengths recorded for this session.",
      data: strengths,
    },
    {
      title: "Areas for Growth",
      badgeLabel: `${weaknesses.length} To Refine`,
      description: "Opportunities to strengthen your responses and technical edge",
      icon: AlertTriangle,
      iconContainerClass:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      badgeClass:
        "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      bulletClass:
        "bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400",
      emptyMessage:
        "No significant weaknesses identified. Outstanding overall performance!",
      data: weaknesses,
    },
    {
      title: "Actionable Recommendations",
      badgeLabel: `${suggestions.length} Suggested`,
      description: "Actionable tips and strategic drills for your next interview",
      icon: Lightbulb,
      iconContainerClass:
        "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      badgeClass:
        "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
      bulletClass:
        "bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400",
      emptyMessage: "No specific recommendations provided for this session.",
      data: suggestions,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {sections.map((section, idx) => {
        const Icon = section.icon;
        const hasItems = section.data && section.data.length > 0;

        return (
          <Card
            key={idx}
            className="flex flex-col border-border/80 bg-card/70 shadow-sm backdrop-blur-xs transition-shadow hover:shadow-md min-w-0 overflow-hidden"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-2xs",
                      section.iconContainerClass
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base font-semibold tracking-tight text-foreground">
                      {section.title}
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground line-clamp-1">
                      {section.badgeLabel}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                    section.badgeClass
                  )}
                >
                  {section.badgeLabel}
                </span>
              </div>
              <CardDescription className="text-xs text-muted-foreground pt-1 line-clamp-2">
                {section.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 pt-1 min-w-0">
              {hasItems ? (
                <ul className="space-y-3 min-w-0" role="list">
                  {section.data.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="group flex items-start gap-2.5 rounded-xl border border-border/40 bg-background/50 p-3 transition-colors hover:bg-muted/40 min-w-0"
                    >
                      {/* Stylized Bullet Index */}
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 select-none items-center justify-center rounded-full text-[10px] font-bold shadow-2xs",
                          section.bulletClass
                        )}
                        aria-hidden="true"
                      >
                        {itemIdx + 1}
                      </span>

                      {/* Long text content: robust wrapping to ensure AI generated text never overflows */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                          {item}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-6 text-center">
                  <Sparkles className="h-6 w-6 text-muted-foreground/60 mb-2" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {section.emptyMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default FeedbackList;
