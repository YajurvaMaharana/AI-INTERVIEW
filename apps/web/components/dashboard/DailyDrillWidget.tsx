"use client";

import React, { useState } from "react";
import { Zap, Mic, Play, Square, Sparkles, CheckCircle2, Flame, ArrowRight, RotateCcw, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DailyDrillWidget() {
  const router = useRouter();
  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    feedback: string;
  } | null>(null);

  // Weakest skill isolated by backend telemetry engine
  const weakestSkill = "Architectural Trade-offs & CAP Consistency";
  const dailyQuestion = "Design a multi-region distributed cache invalidation strategy for 500k writes/sec while maintaining eventual consistency across replica nodes.";

  const handleStartRecording = () => {
    setIsRecording(true);
    setEvaluationResult(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordedAudio(true);
    // Simulate AI grading
    setTimeout(() => {
      setEvaluationResult({
        score: 89,
        feedback: "Strong architectural trade-off analysis! Explicitly highlighted cache-aside vs write-through latency profiles. Consider adding explicit TTL fallback logic for partition split-brain scenarios.",
      });
    }, 1200);
  };

  return (
    <>
      {/* Dashboard Card */}
      <div className="w-full border border-[#E87A42]/30 bg-gradient-to-br from-[#FFF8F5] to-[#FFEEEC] dark:from-[#2A1E18] dark:to-[#1E1410] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E87A42]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E8602E] to-[#F17E45] text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Daily Five-Minute Drill
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-[#E87A42]/20 text-[#E87A42] px-2 py-0.5 rounded-full border border-[#E87A42]/30">
                  <Flame className="w-3 h-3 fill-[#E87A42]" /> 5-Day Streak
                </span>
              </div>
              <p className="text-[10.5px] text-slate-600 dark:text-slate-300">
                Targeted practice isolating your weakest evaluated skill: <strong className="text-[#E87A42]">{weakestSkill}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrillModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8602E] to-[#F17E45] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 hover:from-[#d85322] hover:to-[#e07038] transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Launch Today&apos;s 5-Min Drill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile-First Voice Delivery Modal / Drawer */}
      {isDrillModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
          <div className="bg-white dark:bg-[#181E29] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#E87A42] uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" /> Daily 5-Min Micro-Drill
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Focus: {weakestSkill}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsDrillModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Question Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131822] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Targeted Question:</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                &ldquo;{dailyQuestion}&rdquo;
              </p>
            </div>

            {/* Mobile Voice Simulation Interface */}
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              {!evaluationResult ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? "bg-rose-500/20 text-rose-500 border-4 border-rose-500 animate-pulse shadow-lg shadow-rose-500/30" 
                      : "bg-[#E87A42]/10 text-[#E87A42] border-2 border-[#E87A42]/30"
                  }`}>
                    <Mic className="w-8 h-8" />
                  </div>

                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {isRecording ? "Recording your voice response (Speak clearly)..." : "Tap to record your voice answer"}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Optimized for mobile-first low friction daily habit loops (60-90s max)
                    </p>
                  </div>

                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="px-6 py-3 rounded-2xl bg-[#E87A42] text-white font-bold text-xs shadow-md flex items-center gap-2 hover:bg-[#d85322] transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" /> Start Voice Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="px-6 py-3 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-md flex items-center gap-2 hover:bg-rose-700 transition-all cursor-pointer animate-bounce"
                    >
                      <Square className="w-4 h-4 fill-white" /> Stop & Evaluate Answer
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-4 animate-in fade-in-50">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" /> Drill Successfully Evaluated
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {evaluationResult.score}/100
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-left">
                      {evaluationResult.feedback}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEvaluationResult(null);
                        setRecordedAudio(false);
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry Drill
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrillModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-[#E87A42] text-white text-xs font-bold shadow-sm hover:bg-[#d85322] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Complete & Update Streak
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
