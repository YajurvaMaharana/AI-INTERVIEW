"use client";

import React, { useState } from "react";
import { Grid, Sparkles, ArrowRight, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeatmapCell {
  competency: string;
  sessionIndex: number;
  sessionName: string;
  score: number; // 0 - 100
  feedbackSnippet: string;
  questionPrompt: string;
}

export default function WeaknessHeatmapCard() {
  const router = useRouter();
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const competencies = [
    "Technical Correctness",
    "Architectural Trade-offs",
    "STAR Impact Metrics",
    "Conceptual Depth",
    "Communication Clarity",
  ];

  const sessions = ["Session #1", "Session #2", "Session #3", "Session #4", "Latest"];

  // Mock matrix data combining historical sessions & competencies
  const matrixData: HeatmapCell[][] = [
    // Technical Correctness
    [
      { competency: "Technical Correctness", sessionIndex: 0, sessionName: "Session #1", score: 68, feedbackSnippet: "Initial syntax confusion on async promise chaining.", questionPrompt: "Explain JavaScript event loop and microtask queue." },
      { competency: "Technical Correctness", sessionIndex: 1, sessionName: "Session #2", score: 75, feedbackSnippet: "Better handling of concurrency locks.", questionPrompt: "Design a thread-safe LRU cache in TypeScript." },
      { competency: "Technical Correctness", sessionIndex: 2, sessionName: "Session #3", score: 82, feedbackSnippet: "Solid Big-O complexity breakdown.", questionPrompt: "Optimize graph traversal with memoization." },
      { competency: "Technical Correctness", sessionIndex: 3, sessionName: "Session #4", score: 88, feedbackSnippet: "Clean error handling implementation.", questionPrompt: "Implement resilient retry-with-backoff logic." },
      { competency: "Technical Correctness", sessionIndex: 4, sessionName: "Latest", score: 92, feedbackSnippet: "Flawless technical execution and syntax accuracy.", questionPrompt: "Distributed consensus & Raft heartbeat protocol." },
    ],
    // Architectural Trade-offs
    [
      { competency: "Architectural Trade-offs", sessionIndex: 0, sessionName: "Session #1", score: 58, feedbackSnippet: "Missed consistency vs availability trade-offs.", questionPrompt: "Design a real-time messaging notification pipeline." },
      { competency: "Architectural Trade-offs", sessionIndex: 1, sessionName: "Session #2", score: 64, feedbackSnippet: "Briefly mentioned caching but omitted invalidation.", questionPrompt: "Scale a high-throughput read-heavy database." },
      { competency: "Architectural Trade-offs", sessionIndex: 2, sessionName: "Session #3", score: 70, feedbackSnippet: "Improved discussion of sharding strategies.", questionPrompt: "Partitioning user tables across multi-region clusters." },
      { competency: "Architectural Trade-offs", sessionIndex: 3, sessionName: "Session #4", score: 78, feedbackSnippet: "Good latency vs throughput analysis.", questionPrompt: "Design an IoT telemetry ingestion service." },
      { competency: "Architectural Trade-offs", sessionIndex: 4, sessionName: "Latest", score: 85, feedbackSnippet: "Comprehensive evaluation of CAP theorem constraints.", questionPrompt: "Multi-master database replication & conflict resolution." },
    ],
    // STAR Impact Metrics
    [
      { competency: "STAR Impact Metrics", sessionIndex: 0, sessionName: "Session #1", score: 52, feedbackSnippet: "Omitted quantified revenue or latency metrics entirely.", questionPrompt: "Describe a time you resolved a major production incident." },
      { competency: "STAR Impact Metrics", sessionIndex: 1, sessionName: "Session #2", score: 60, feedbackSnippet: "Added timeline duration but lacked % reduction.", questionPrompt: "Tell me about a difficult architectural disagreement." },
      { competency: "STAR Impact Metrics", sessionIndex: 2, sessionName: "Session #3", score: 72, feedbackSnippet: "Included 30% speedup metric; STAR structure improving.", questionPrompt: "Lead a cross-functional migration project." },
      { competency: "STAR Impact Metrics", sessionIndex: 3, sessionName: "Session #4", score: 79, feedbackSnippet: "Strong Result component with robust business ROI.", questionPrompt: "Scale an engineering team velocity." },
      { competency: "STAR Impact Metrics", sessionIndex: 4, sessionName: "Latest", score: 90, feedbackSnippet: "Excellent STAR framing with concrete SLA reduction figures.", questionPrompt: "Deliver a high-visibility platform migration." },
    ],
    // Conceptual Depth
    [
      { competency: "Conceptual Depth", sessionIndex: 0, sessionName: "Session #1", score: 65, feedbackSnippet: "Surface-level explanation of memory primitives.", questionPrompt: "Explain garbage collection algorithms." },
      { competency: "Conceptual Depth", sessionIndex: 1, sessionName: "Session #2", score: 70, feedbackSnippet: "Moderate depth on thread pooling.", questionPrompt: "Compare process vs thread memory models." },
      { competency: "Conceptual Depth", sessionIndex: 2, sessionName: "Session #3", score: 76, feedbackSnippet: "Good explanation of lock-free data structures.", questionPrompt: "Compare optimistic vs pessimistic concurrency." },
      { competency: "Conceptual Depth", sessionIndex: 3, sessionName: "Session #4", score: 84, feedbackSnippet: "Rigorous exploration of kernel primitives.", questionPrompt: "Explain Linux epoll vs select I/O multiplexing." },
      { competency: "Conceptual Depth", sessionIndex: 4, sessionName: "Latest", score: 89, feedbackSnippet: "Deep domain mastery across distributed protocols.", questionPrompt: "Explain vector clock synchronization in distributed storage." },
    ],
    // Communication Clarity
    [
      { competency: "Communication Clarity", sessionIndex: 0, sessionName: "Session #1", score: 75, feedbackSnippet: "Clear cadence with slight pacing acceleration.", questionPrompt: "Introduction and past experience overview." },
      { competency: "Communication Clarity", sessionIndex: 1, sessionName: "Session #2", score: 80, feedbackSnippet: "Professional tone and articulate delivery.", questionPrompt: "System design rationale." },
      { competency: "Communication Clarity", sessionIndex: 2, sessionName: "Session #3", score: 85, feedbackSnippet: "Strong structural signposting during answers.", questionPrompt: "Behavioral conflict resolution." },
      { competency: "Communication Clarity", sessionIndex: 3, sessionName: "Session #4", score: 90, feedbackSnippet: "Exceptional executive presence.", questionPrompt: "Technical roadmap presentation." },
      { competency: "Communication Clarity", sessionIndex: 4, sessionName: "Latest", score: 95, feedbackSnippet: "Masterclass in articulate, concise executive delivery.", questionPrompt: "Closing defense and team vision." },
    ],
  ];

  const getCellColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    if (score >= 70) return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    return "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30";
  };

  return (
    <div className="w-full border border-slate-100 dark:border-[#242C3B] bg-white dark:bg-[#181E29] rounded-2xl p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              Longitudinal Weakness Heatmap & Skill Matrix
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Cross-reference historical session scores with competencies across chronological timeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> &lt;70</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 70-84</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 85+</span>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-slate-800 text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold">
              <th className="py-2.5 px-3">Competency / Skill</th>
              {sessions.map((s) => (
                <th key={s} className="py-2.5 px-2 text-center font-mono">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {matrixData.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-[#1C2230]/50 transition-colors">
                <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {competencies[rIdx]}
                </td>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedCell(cell)}
                      className={`w-12 h-9 mx-auto rounded-lg font-mono font-bold text-xs border flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-2xs ${getCellColor(
                        cell.score
                      )}`}
                      title={`Click to inspect ${cell.competency} in ${cell.sessionName}`}
                    >
                      {cell.score}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drilldown Modal / Detail Drawer */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white dark:bg-[#1A212D] border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#E87A42] uppercase tracking-wider font-bold">
                  {selectedCell.sessionName} • Drilldown Inspection
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCell.competency} ({selectedCell.score}/100)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131822] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Question Prompt:</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  &ldquo;{selectedCell.questionPrompt}&rdquo;
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Recorded Feedback & Mistake Analysis:</span>
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCell.feedbackSnippet}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const comp = encodeURIComponent(selectedCell.competency);
                  setSelectedCell(null);
                  router.push(`/interview/new?drill=${comp}`);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8602E] to-[#F17E45] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 hover:from-[#d85322] hover:to-[#e07038] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Targeted Remediation Drill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
