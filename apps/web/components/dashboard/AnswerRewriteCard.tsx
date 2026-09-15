"use client";

import React, { useState } from "react";
import { Sparkles, MoreHorizontal, RotateCcw } from "lucide-react";
import Link from "next/link";

interface AnswerRewriteCardProps {
  onPracticeAgain?: () => void;
}

export default function AnswerRewriteCard({ onPracticeAgain }: AnswerRewriteCardProps) {
  const [showFullRecommendation, setShowFullRecommendation] = useState(false);

  return (
    <div className="w-full border border-slate-100 dark:border-[#242C3B] bg-white dark:bg-[#181E29] rounded-2xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
          Answer Rewrite Insight
        </h3>
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          aria-label="Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Comparative Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
        {/* Left: Weak attempt */}
        <div className="flex flex-col justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-[#131822] border border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              Weak attempt:
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
              &ldquo;I am former the same seek communication, in men snowstanding you AI recommend ideal answer.&rdquo;
            </p>
          </div>
          <div className="pt-2 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ Needs concrete STAR metrics & trade-off clarity.
          </div>
        </div>

        {/* Right: AI Recommended ideal Answer with Frosted Overlay Button */}
        <div className="relative flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br from-[#534033] to-[#392B21] text-white shadow-md overflow-hidden border border-amber-500/20">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Recommended ideal Answer</span>
            </div>
            <p className="text-[10.5px] text-slate-200/90 leading-relaxed">
              &ldquo;In my previous role, I resolved asynchronous state races by introducing optimistic updates with idempotent rollbacks, reducing API latency by 35%.&rdquo;
            </p>
          </div>

          {/* Practice Again button overlay */}
          <div className="pt-3 z-10">
            <Link
              href="/interview/new"
              onClick={onPracticeAgain}
              className="w-full py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
            >
              <RotateCcw className="w-3 h-3 text-amber-300" />
              <span>Practice Again</span>
            </Link>
          </div>

          {/* Background subtle sparkle orb */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
