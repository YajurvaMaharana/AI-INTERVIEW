"use client";

import React, { useState } from "react";
import { MessageSquareText, Sparkles, CheckCircle2, ArrowRight, UserCheck, ShieldAlert, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AsyncCoachNotesCard() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Longitudinal synthesized coaching data
  const coachNote = {
    mentorName: "Alex Vance",
    mentorRole: "Principal Staff Engineer & Lead Interview Coach",
    lastUpdated: "Generated 12 hours ago (After Session #4)",
    executiveSummary: "Your technical depth and communication pacing have strengthened remarkably over the last 4 sessions (+14% composite readiness). However, a persistent cross-session pattern emerges around distributed cache invalidation trade-offs and omitting quantified % ROI metrics in STAR results.",
    longitudinalPatterns: [
      {
        category: "Technical Architecture",
        observation: "Consistently skips discussing partition split-brain resilience when designing asynchronous messaging pipelines.",
        recommendation: "Review Raft consensus heartbeat intervals and two-phase commit fallbacks before your next system design drill.",
      },
      {
        category: "Behavioral & STAR Method",
        observation: "Action and Result sections are sometimes conflated, occasionally omitting hard business metrics (e.g. latency reduction %).",
        recommendation: "Always anchor your STAR outcomes with concrete SLAs (e.g., 'reduced API response latency by 42ms').",
      },
    ],
    prioritizedTrainingPlan: [
      "Drill 1: Read Chapter 4 of Designing Data-Intensive Applications on Partitioning.",
      "Drill 2: Complete 2 asynchronous STAR behavioral drills focused on quantifiable impact.",
      "Drill 3: Schedule a Senior-level L5 mock system design session.",
    ],
  };

  return (
    <div className="w-full border border-indigo-500/30 bg-gradient-to-br from-[#F5F7FF] to-[#EEF2FF] dark:from-[#191E2E] dark:to-[#151926] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Async Coach Notes & Mentorship Synthesis
              </h3>
              <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Longitudinal AI Analysis
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Coach: <strong>{coachNote.mentorName}</strong> ({coachNote.mentorRole}) • {coachNote.lastUpdated}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
        >
          {isExpanded ? "Collapse Note" : "Read Full Coaching Note"}
        </button>
      </div>

      {/* Executive Summary Preview */}
      <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#131822]/80 border border-indigo-500/20 space-y-2">
        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          Coach&apos;s Longitudinal Synthesis:
        </span>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          &ldquo;{coachNote.executiveSummary}&rdquo;
        </p>
      </div>

      {/* Expanded Longitudinal Details */}
      {isExpanded && (
        <div className="space-y-4 pt-2 animate-in fade-in-50">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Recurring Patterns & Technical Gaps
            </h4>
            <div className="grid gap-2.5">
              {coachNote.longitudinalPatterns.map((pat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white dark:bg-[#151A26] border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10.5px] font-bold text-indigo-700 dark:text-indigo-300">
                    {pat.category}
                  </span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300">
                    <strong>Observation:</strong> {pat.observation}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    <strong>Coach Recommendation:</strong> {pat.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#E87A42]" /> Prioritized Training Plan for Next Session
            </h4>
            <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
              {coachNote.prioritizedTrainingPlan.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-indigo-500/10">
        <span className="text-[10.5px] text-slate-500">
          Transforming fragmented practice sessions into a unified mentorship journey.
        </span>
        <button
          type="button"
          onClick={() => router.push("/interview/new")}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Apply Coaching Plan in Next Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
