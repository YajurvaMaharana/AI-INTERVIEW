"use client";

import React, { useState } from "react";
import { X, Mic, AudioLines, Sparkles, Check, ArrowRight } from "lucide-react";
import { LiveVoiceWorkspace } from "@/components/interview/LiveVoiceWorkspace";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface VoiceCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceCoachModal({ isOpen, onClose }: VoiceCoachModalProps) {
  const router = useRouter();
  const [recordedTranscripts, setRecordedTranscripts] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSendSpokenAnswer = (text: string) => {
    setRecordedTranscripts((prev) => [text, ...prev]);
  };

  const handleStartCalibratedInterview = () => {
    onClose();
    router.push("/interview/new?modality=voice");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1C2230]/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E8602E] to-[#F17E45] text-white shadow-xs">
              <AudioLines className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Voice & Speech Delivery Coach
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  AI Speech-to-Text
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Practice speech cadence, test technical transcription accuracy, and eliminate filler words.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Workspace Component */}
          <LiveVoiceWorkspace
            onSendAnswer={handleSendSpokenAnswer}
            contextRole="Software Engineer"
          />

          {/* Practice History in Modal */}
          {recordedTranscripts.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                Recent Spoken Transcripts Practice ({recordedTranscripts.length})
              </h4>
              <div className="space-y-2">
                {recordedTranscripts.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-800 dark:text-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Take #{recordedTranscripts.length - idx}</span>
                      <span>{t.split(" ").length} words</span>
                    </div>
                    <p className="leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1C2230]/50 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ready for a full simulated technical interview?
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-xl"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleStartCalibratedInterview}
              className="gap-1.5 text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl shadow-xs"
            >
              Start Live Voice Interview
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceCoachModal;
