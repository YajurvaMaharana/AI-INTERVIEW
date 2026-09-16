"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
  Flame,
  HelpCircle,
  BarChart2,
} from "lucide-react";
import type {
  SessionAdaptiveTelemetry,
  TopicCompetency,
  BranchDecision,
} from "@/lib/services/ai-engine/adaptive-engine.service";
import { cn } from "@/lib/utils";

interface AdaptiveTelemetryHUDProps {
  telemetry: SessionAdaptiveTelemetry | null;
  className?: string;
}

const BRANCH_CONFIG: Record<
  BranchDecision,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  LEVEL_UP: {
    label: "Level Up: High Scale",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: Flame,
  },
  PROBE_DEEPER: {
    label: "Probing Edge-Cases",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Target,
  },
  TRANSITION_TOPIC: {
    label: "Domain Transition",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: Layers,
  },
  PROVIDE_HINT: {
    label: "Constructive Hint Active",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    icon: HelpCircle,
  },
};

export function AdaptiveTelemetryHUD({ telemetry, className }: AdaptiveTelemetryHUDProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!telemetry) {
    return (
      <div className={cn("rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#151922]/90 backdrop-blur-md p-3.5 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shadow-2xs", className)}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#E8602E] animate-pulse" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Adaptive Difficulty Engine:</span>
          <span>Calibrating baseline...</span>
        </div>
      </div>
    );
  }

  const branchInfo = BRANCH_CONFIG[telemetry.activeBranch] || BRANCH_CONFIG.LEVEL_UP;
  const BranchIcon = branchInfo.icon;
  const numericProgress = Math.min(100, Math.max(0, ((telemetry.numericDifficulty - 1.0) / 2.0) * 100));

  const competenciesList = Object.values(telemetry.competencies);

  return (
    <div
      className={cn(
        "rounded-[22px] border border-slate-200/90 dark:border-[#222B3A] bg-[#F9FAFC]/95 dark:bg-[#151922]/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] transition-all duration-300 overflow-hidden",
        className
      )}
    >
      {/* ── Top Bar / Summary (Always Visible) ── */}
      <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Overall Proficiency & Difficulty Tier */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E8602E] to-[#F17E45] text-white font-extrabold text-sm shadow-[0_4px_14px_rgba(232,96,46,0.35)] shrink-0">
            {telemetry.overallScore}%
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-[#151922] flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-[#E8602E]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {telemetry.difficultyLabel}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                Tier {telemetry.numericDifficulty.toFixed(1)} / 3.0
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Focus: <strong>{telemetry.currentTopic}</strong></span>
            </p>
          </div>
        </div>

        {/* Right: Branch Pill & Expand Button */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs",
              branchInfo.badgeClass
            )}
          >
            <BranchIcon className="w-3.5 h-3.5" />
            <span>{branchInfo.label}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252E40] transition-colors cursor-pointer shadow-2xs"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#E8602E]" />
            <span className="hidden sm:inline">{isExpanded ? "Hide Telemetry" : "Live Skill Radar"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Difficulty Slider Meter ── */}
      <div className="px-4 pb-2">
        <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#E8602E] to-rose-500 transition-all duration-500 ease-out"
            style={{ width: `${numericProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">
          <span>Foundational (L3)</span>
          <span>Mid-Level (L4)</span>
          <span>Senior (L5)</span>
          <span>Staff/Principal (L6+)</span>
        </div>
      </div>

      {/* ── Expanded Detail View: Per-Topic Competencies & Evaluation Stream ── */}
      {isExpanded && (
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 bg-white/50 dark:bg-[#181E29]/60 space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {/* Branch Rationale Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFF7ED] dark:bg-[#2A1D17] border border-[#FDBA74]/70 dark:border-[#EA580C]/40 text-xs text-[#C2410C] dark:text-[#FB923C]">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#E8602E]" />
            <div>
              <span className="font-bold">Adaptive Branch Reason: </span>
              <span className="opacity-90">{telemetry.branchDescription}</span>
            </div>
          </div>

          {/* Per-Topic Competencies Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#E8602E]" />
                <span>Running Competency Breakdown</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Calibrated per response
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {competenciesList.map((comp) => {
                const TrendIcon =
                  comp.trend === "up"
                    ? TrendingUp
                    : comp.trend === "down"
                    ? TrendingDown
                    : Minus;

                const trendColor =
                  comp.trend === "up"
                    ? "text-emerald-500"
                    : comp.trend === "down"
                    ? "text-rose-500"
                    : "text-slate-400";

                return (
                  <div
                    key={comp.topic}
                    className="p-3 rounded-xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-slate-800/90 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                        {comp.topic}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {comp.score}%
                        </span>
                        <TrendIcon className={cn("w-3.5 h-3.5", trendColor)} />
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E8602E] rounded-full transition-all duration-300"
                        style={{ width: `${comp.score}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        Level: {comp.level}
                      </span>
                      <span>Assessed {comp.dataPoints}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Evaluations Feed */}
          {telemetry.recentEvaluations.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Recent Adaptive Decisions:
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                {telemetry.recentEvaluations.map((ev, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#151922] border border-slate-200/60 dark:border-slate-800/60 text-[11px]"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {ev.topic}:
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 truncate">
                        {ev.focus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {ev.score}%
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ev.decision}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
