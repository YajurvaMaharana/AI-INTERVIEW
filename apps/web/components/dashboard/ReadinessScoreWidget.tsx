"use client";

import React, { useState } from "react";
import { Award, ShieldCheck, Info, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

interface ReadinessDimension {
  name: string;
  score: number; // 0 - 100
  status: "Proficient" | "Developing" | "Needs Focus";
  description: string;
}

export default function ReadinessScoreWidget() {
  const [activeTab, setActiveTab] = useState<"overview" | "breakdown">("overview");

  const dimensions: ReadinessDimension[] = [
    {
      name: "Technical Competence",
      score: 84,
      status: "Proficient",
      description: "Algorithmic depth, data structures, and architecture scalability patterns.",
    },
    {
      name: "Behavioral & STAR Method",
      score: 78,
      status: "Developing",
      description: "Structured conflict resolution, leadership, and ownership narratives.",
    },
    {
      name: "Communication Clarity",
      score: 91,
      status: "Proficient",
      description: "Executive delivery pacing, concise signposting, and verbal discipline.",
    },
    {
      name: "Resume-to-JD Alignment",
      score: 86,
      status: "Proficient",
      description: "Direct match between past experience and target role technical keywords.",
    },
    {
      name: "Target-Role Readiness",
      score: 83,
      status: "Proficient",
      description: "Overall composite index for Senior / L5 interview benchmarks.",
    },
  ];

  const overallComposite = Math.round(
    dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length
  );

  return (
    <div className="w-full border border-slate-100 dark:border-[#242C3B] bg-white dark:bg-[#181E29] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8602E] to-[#F17E45] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Multi-Axis Readiness Index
              </h3>
              <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                Diagnostic Practice Estimate
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Aggregated across session performance, resume JD matching, and domain telemetry
            </p>
          </div>
        </div>

        {/* Toggle Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-[#131822] p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              activeTab === "overview"
                ? "bg-white dark:bg-[#1E2433] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("breakdown")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              activeTab === "breakdown"
                ? "bg-white dark:bg-[#1E2433] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Granular Breakdown
          </button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Big Score Card */}
          <div className="md:col-span-4 p-4 rounded-2xl bg-gradient-to-br from-[#FFF6F0] to-[#FFECE0] dark:from-[#2F2119] dark:to-[#221610] border border-[#E87A42]/30 flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-[11px] font-bold text-[#E87A42] uppercase tracking-wider">
              Composite Readiness Score
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono">
              {overallComposite}%
            </div>
            <div className="text-[10.5px] text-slate-600 dark:text-slate-300 font-medium">
              Ready for L5/Senior Interview Simulation
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-3 h-3" /> +4.5% vs Last Week
              </span>
            </div>
          </div>

          {/* Quick Progress Bars */}
          <div className="md:col-span-8 space-y-2.5">
            {dimensions.map((dim) => (
              <div key={dim.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{dim.name}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{dim.score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dim.score >= 85
                        ? "bg-emerald-500"
                        : dim.score >= 75
                        ? "bg-[#E87A42]"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dimensions.map((dim) => (
            <div
              key={dim.name}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131822] border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{dim.name}</span>
                <span className="text-xs font-mono font-extrabold text-[#E87A42]">{dim.score}%</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {dim.description}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Status: {dim.status}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Calibrated
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transparent Practice Labeling Notice */}
      <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-[#131822] border border-slate-200/60 dark:border-slate-800 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong>Transparent Disclaimer:</strong> This metric is a <em>diagnostic practice estimate</em> computed from simulated interview sessions and AI rubric evaluations. It does not constitute a definitive hiring guarantee or formal corporate endorsement.
        </p>
      </div>
    </div>
  );
}
