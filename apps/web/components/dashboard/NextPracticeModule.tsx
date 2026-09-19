"use client";

import React, { useState } from "react";
import { ArrowRight, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PracticeDrill {
  id: string;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  rationale: string;
  targetDimension: string;
  recommendedPersona: string;
}

export default function NextPracticeModule() {
  const router = useRouter();
  const [selectedDrill, setSelectedDrill] = useState<string>("drill-1");

  const diagnosticDrills: PracticeDrill[] = [
    {
      id: "drill-1",
      title: "Distributed Systems Scale & Partitioning Drill",
      category: "System Design & Architecture",
      difficulty: "hard",
      rationale: "Identified gap in proactive latency vs throughput trade-offs and high-load edge case reconciliation.",
      targetDimension: "Architectural Trade-offs",
      recommendedPersona: "tech-grinder"
    },
    {
      id: "drill-2",
      title: "STAR Method Impact & Quantification Refinement",
      category: "Behavioral & Leadership",
      difficulty: "medium",
      rationale: "Result components frequently omitted quantifiable latency reduction or revenue impact metrics.",
      targetDimension: "Structured Reasoning",
      recommendedPersona: "hr-partner"
    },
    {
      id: "drill-3",
      title: "Asynchronous Concurrency & Error Recovery Mode",
      category: "Backend Engineering",
      difficulty: "hard",
      rationale: "Conceptual depth on race condition mitigation and failure recovery modes can be sharpened.",
      targetDimension: "Conceptual Depth",
      recommendedPersona: "supportive-mentor"
    }
  ];

  const currentDrill = diagnosticDrills.find(d => d.id === selectedDrill) || diagnosticDrills[0];

  const handleStartDrill = () => {
    router.push(`/interview/new?persona=${currentDrill.recommendedPersona}&drill=${encodeURIComponent(currentDrill.title)}`);
  };

  return (
    <div className="w-full border border-slate-100 dark:border-[#242C3B] bg-white dark:bg-[#181E29] rounded-2xl p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              Personalized Next-Practice Recommendations
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              AI Diagnostic Engine • Based on recent session telemetry & weak points
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
          Active Action Plan
        </span>
      </div>

      {/* Drill Selection Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {diagnosticDrills.map((drill) => (
          <button
            key={drill.id}
            type="button"
            onClick={() => setSelectedDrill(drill.id)}
            className={`p-2.5 rounded-xl text-left border transition-all ${
              selectedDrill === drill.id
                ? "bg-[#FFF6F0] dark:bg-[#2F2119] border-[#E87A42]/50 text-slate-900 dark:text-white shadow-2xs"
                : "bg-slate-50/60 dark:bg-[#131822] border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <div className="text-[11px] font-bold truncate">{drill.category}</div>
            <div className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Focus: {drill.targetDimension}
            </div>
          </button>
        ))}
      </div>

      {/* Active Drill Diagnostic Summary & One-Click Launch */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131822] border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {currentDrill.title}
            </span>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              {currentDrill.difficulty}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-1.5 pt-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span><strong>Diagnostic Rationale:</strong> {currentDrill.rationale}</span>
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Targeted 15-minute simulated scenario</span>
          </div>

          <button
            type="button"
            onClick={handleStartDrill}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#E8602E] to-[#F17E45] hover:from-[#d85322] hover:to-[#e07038] text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Launch Improvement Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
