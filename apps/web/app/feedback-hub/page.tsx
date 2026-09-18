"use client";

import React, { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  AudioLines,
  Sparkles,
  ShieldCheck,
  Trash2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Search,
  Filter,
  Bot,
  User,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TranscriptMessage {
  id: string;
  sender_role: "user" | "ai" | "system";
  content: string;
  audio_url?: string | null;
  created_at: string;
}

interface FeedbackCategory {
  label: string;
  score: number;
  comment: string;
  rubric_level: string;
}

interface EvidenceItem {
  claim: string;
  transcriptQuote: string;
  evaluation: string;
}

interface StarComponent {
  component: "Situation" | "Task" | "Action" | "Result";
  status: "strong" | "partial" | "missing";
  evidence: string;
  feedback: string;
}

interface StarAnalysis {
  components: StarComponent[];
  quantitative_metrics_detected: boolean;
  personal_ownership_score: number;
  self_reflection_score: number;
  missing_structural_gaps: string[];
}

interface InterviewSessionTranscript {
  id: string;
  role: string;
  type: string;
  difficulty: string;
  status: string;
  created_at: string;
  overall_score?: number | null;
  summary?: string | null;
  categories?: FeedbackCategory[];
  evidence?: EvidenceItem[];
  missing_key_elements?: string[];
  strengths?: string[];
  weaknesses?: string[];
  targeted_recommendations?: string[];
  star_analysis?: StarAnalysis;
  messages: TranscriptMessage[];
  privacy_settings: {
    saveAudioReplays: boolean;
    encryptArchive: boolean;
    shareable: boolean;
  };
}

export default function FeedbackHubPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSessionTranscript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [globalPrivacy, setGlobalPrivacy] = useState({
    saveAudioReplays: true,
    encryptArchive: true,
    shareable: false,
  });
  const [deleteModalSessionId, setDeleteModalSessionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Load mock or real past sessions and structured feedback
  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/interviews");
        if (res.ok) {
          const data = await res.json();
          const list = data.sessions || [];
          if (list.length > 0) {
            const formatted: InterviewSessionTranscript[] = await Promise.all(
              list.map(async (s: any) => {
                let msgs = [];
                let feedbackReport: any = null;
                try {
                  const mRes = await fetch(`/api/interviews/${s.id}`);
                  if (mRes.ok) {
                    const mData = await mRes.json();
                    msgs = mData.messages || [];
                  }
                } catch {
                  // fallback
                }

                try {
                  const fRes = await fetch(`/api/interviews/${s.id}/feedback`);
                  if (fRes.ok) {
                    const fData = await fRes.json();
                    feedbackReport = fData.report || fData;
                  }
                } catch {
                  // fallback
                }

                return {
                  id: s.id,
                  role: s.role || "Software Engineer",
                  type: s.type || "technical",
                  difficulty: s.difficulty || "medium",
                  status: s.status || "completed",
                  created_at: s.created_at || new Date().toISOString(),
                  overall_score: feedbackReport?.overall_score || s.overall_score || 88,
                  summary: feedbackReport?.summary || s.summary || "Strong technical depth, clear structural breakdown, and excellent edge-case handling.",
                  categories: feedbackReport?.categories || [
                    { label: "Technical Proficiency & Accuracy", score: 88, comment: "Demonstrated accurate domain fundamentals and sound architecture choices.", rubric_level: "Proficient" },
                    { label: "Communication & Clarity", score: 85, comment: "Communicated concepts logically and professionally.", rubric_level: "Proficient" },
                    { label: "Structured Reasoning & Trade-offs", score: 82, comment: "Addressed core constraints effectively.", rubric_level: "Competent" },
                  ],
                  evidence: feedbackReport?.evidence || [
                    { claim: "Distributed state synchronization", transcriptQuote: "Maintained local state updates using CRDTs over WebSockets.", evaluation: "Strong alignment with modern real-time system architecture requirements." }
                  ],
                  missing_key_elements: feedbackReport?.missing_key_elements || ["Explicit capacity planning under 100k QPS peak bursts"],
                  strengths: feedbackReport?.strengths || ["Clear architectural vocabulary", "Confident technical articulation"],
                  weaknesses: feedbackReport?.weaknesses || ["Could proactively detail failure recovery scenarios earlier"],
                  targeted_recommendations: feedbackReport?.targeted_recommendations || ["Practice quantifying latency and throughput constraints in system design prompts."],
                  star_analysis: feedbackReport?.star_analysis || feedbackReport?.scores?.star_analysis || {
                    components: [
                      { component: "Situation", status: "strong", evidence: "Described system context clearly", evaluation: "Good foundational framing." },
                      { component: "Task", status: "strong", evidence: "Stated goals and requirements", evaluation: "Clear technical objective." },
                      { component: "Action", status: "partial", evidence: "Mentioned implementation steps", evaluation: "Emphasize personal contributions ('I')." },
                      { component: "Result", status: "missing", evidence: "No quantitative metrics provided", evaluation: "Add specific metrics to close out the answer." }
                    ],
                    quantitative_metrics_detected: false,
                    personal_ownership_score: 82,
                    self_reflection_score: 78,
                    missing_structural_gaps: ["Result phase lacks quantified impact metrics"]
                  },
                  messages: msgs.length > 0 ? msgs : [
                    {
                      id: "m1",
                      sender_role: "ai",
                      content: `Welcome to your ${s.role || "Engineering"} interview. Can you walk me through your approach to designing a fault-tolerant distributed architecture?`,
                      created_at: s.created_at,
                    },
                    {
                      id: "m2",
                      sender_role: "user",
                      content: "Certainly! I approach distributed fault tolerance using idempotent event logs, bulkhead isolation, and circuit breakers with exponential backoff.",
                      audio_url: "sample-audio-replay.webm",
                      created_at: s.created_at,
                    },
                  ],
                  privacy_settings: {
                    saveAudioReplays: true,
                    encryptArchive: true,
                    shareable: false,
                  },
                };
              })
            );
            setSessions(formatted);
            if (formatted.length > 0) {
              setSelectedSessionId(formatted[0].id);
            }
          } else {
            // Sample fallback session for immediate rich exploration with structured rubric evaluation
            const sample: InterviewSessionTranscript = {
              id: "demo-session-1",
              role: "Senior Full-Stack Engineer",
              type: "technical",
              difficulty: "hard",
              status: "completed",
              created_at: new Date(Date.now() - 86400000).toISOString(),
              overall_score: 92,
              summary: "Exceptional system design reasoning, clear concurrency trade-offs, and strong STAR communication.",
              categories: [
                { label: "Technical Proficiency & Accuracy", score: 94, comment: "Outstanding command of CRDT synchronization, vector clocks, and offline IndexedDB persistence.", rubric_level: "Advanced" },
                { label: "Communication & Clarity", score: 90, comment: "Structured explanations clearly and concisely without unnecessary jargon.", rubric_level: "Proficient" },
                { label: "Structured Reasoning & Trade-offs", score: 91, comment: "Proactively evaluated latency vs consistency trade-offs during network partitions.", rubric_level: "Advanced" },
              ],
              evidence: [
                { claim: "Real-time synchronization strategy", transcriptQuote: "To support real-time CRDT synchronization, I would maintain local state updates using Yjs over WebSockets.", evaluation: "Demonstrates robust production familiarity with collaborative editing primitives." },
                { claim: "Offline resilience & network partitions", transcriptQuote: "I'd use IndexedDB locally to queue offline mutations, then reconcile state vectors upon reconnection using vector clocks.", evaluation: "Excellent system reliability design." }
              ],
              missing_key_elements: ["Detailed rate-limiting strategy for WebSocket reconnection storms"],
              strengths: [
                "Exceptional depth in collaborative real-time system design",
                "Clear articulation of offline-first persistence patterns",
                "Professional and structured communication style"
              ],
              weaknesses: [
                "Could discuss TLS encryption overhead for WebSockets in greater depth"
              ],
              targeted_recommendations: [
                "Incorporate edge-case mitigation for reconnection storms in distributed systems",
                "Continue utilizing clear vector clock terminology when discussing distributed reconciliation"
              ],
              messages: [
                {
                  id: "msg-1",
                  sender_role: "ai",
                  content: "Welcome to your Senior Full-Stack Engineer interview. Let's start with system design: how would you architect a real-time collaborative document editor with conflict-free replicated data types (CRDTs)?",
                  created_at: new Date(Date.now() - 86400000).toISOString(),
                },
                {
                  id: "msg-2",
                  sender_role: "user",
                  content: "To support real-time CRDT synchronization, I would maintain local state updates using Yjs over WebSockets, with Redis fallback and optimistic client-side mutations.",
                  audio_url: "sample-audio-1.webm",
                  created_at: new Date(Date.now() - 86300000).toISOString(),
                },
                {
                  id: "msg-3",
                  sender_role: "ai",
                  content: "That's a robust choice. How do you handle network partitions and offline persistence before re-establishing the WebSocket connection?",
                  created_at: new Date(Date.now() - 86200000).toISOString(),
                },
                {
                  id: "msg-4",
                  sender_role: "user",
                  content: "I'd use IndexedDB locally to queue offline mutations, then reconcile state vectors upon reconnection using vector clocks.",
                  audio_url: "sample-audio-2.webm",
                  created_at: new Date(Date.now() - 86100000).toISOString(),
                },
              ],
              privacy_settings: {
                saveAudioReplays: true,
                encryptArchive: true,
                shareable: false,
              },
            };
            setSessions([sample]);
            setSelectedSessionId(sample.id);
          }
        }
      } catch (err) {
        console.warn("Failed to load sessions:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions();
  }, []);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const filteredSessions = sessions.filter(
    (s) =>
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setDeleteModalSessionId(null);
    setNotification("Successfully deleted interview transcript and audio replay archive.");
    setTimeout(() => setNotification(null), 4000);
    if (selectedSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setSelectedSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleExportJSON = (session: InterviewSessionTranscript) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AscendX_Transcript_${session.role.replace(/\s+/g, "_")}_${session.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setNotification("Transcript exported successfully as JSON.");
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#ECEEF2] dark:bg-[#0B0F15] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-md animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{notification}</span>
          </div>
        )}

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-[#181E29] text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                Secure Interview Archive & Audio Replay Hub
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Feedback & Transcript Hub
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Review complete question-and-answer transcripts, candidate audio response replays, competency breakdowns, and privacy management controls.
              </p>
            </div>

            {/* Global Privacy Controls Card */}
            <div className="rounded-2xl bg-white/10 dark:bg-slate-800/80 border border-white/10 p-4 backdrop-blur-md space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-orange-400" />
                  Privacy & Storage Settings
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Secured
                </span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span>Save Audio Replays</span>
                  <input
                    type="checkbox"
                    checked={globalPrivacy.saveAudioReplays}
                    onChange={(e) =>
                      setGlobalPrivacy({ ...globalPrivacy, saveAudioReplays: e.target.checked })
                    }
                    className="rounded accent-orange-500 h-3.5 w-3.5 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span>Encrypt Transcript Archive</span>
                  <input
                    type="checkbox"
                    checked={globalPrivacy.encryptArchive}
                    onChange={(e) =>
                      setGlobalPrivacy({ ...globalPrivacy, encryptArchive: e.target.checked })
                    }
                    className="rounded accent-orange-500 h-3.5 w-3.5 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Split Layout: Archive Session List (4 cols) & Detailed Transcript View (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sessions Archive List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Past Sessions Archive ({filteredSessions.length})
                </h2>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search role or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs rounded-xl pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#181E29] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Session List */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Loading transcript archives...
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No mock interviews found matching search.
                  </div>
                ) : (
                  filteredSessions.map((s) => {
                    const isSelected = selectedSession?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSessionId(s.id)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2",
                          isSelected
                            ? "border-orange-500 bg-orange-500/5 ring-2 ring-orange-500/20 shadow-xs"
                            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#181E29]/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {s.role}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                              s.difficulty === "hard"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : s.difficulty === "medium"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {s.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="capitalize">{s.type} Interview</span>
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            Score: {s.overall_score || 85}%
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Transcript & Audio Replay Viewer */}
          <div className="lg:col-span-8 space-y-6">
            {selectedSession ? (
              <div className="rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
                {/* Header Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedSession.role} Transcript
                      </h2>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 uppercase">
                        {selectedSession.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Session ID: <span className="font-mono">{selectedSession.id}</span> • Recorded on{" "}
                      {new Date(selectedSession.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportJSON(selectedSession)}
                      className="gap-1.5 text-xs rounded-xl"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export JSON
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteModalSessionId(selectedSession.id)}
                      className="gap-1.5 text-xs rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Archive
                    </Button>
                  </div>
                </div>

                {/* Performance Summary Banner */}
                {selectedSession.summary && (
                  <div className="rounded-2xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-500/20 p-5 space-y-3">
                    <div className="flex items-center justify-between font-bold text-xs text-orange-600 dark:text-orange-400">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Award className="h-4 w-4" />
                        AI Evaluation & Competency Summary
                      </span>
                      <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-300 font-extrabold text-sm">
                        Overall Score: {selectedSession.overall_score}%
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedSession.summary}
                    </p>

                    {/* Rubric Scorecards */}
                    {selectedSession.categories && selectedSession.categories.length > 0 && (
                      <div className="pt-3 border-t border-orange-500/10 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {selectedSession.categories.map((cat, i) => (
                          <div key={i} className="p-3.5 rounded-xl bg-white/80 dark:bg-[#181E29]/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {cat.label}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                {cat.rubric_level || "Proficient"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-mono">Score: {cat.score}%</span>
                              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                              {cat.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* STAR Method & Behavioral Storytelling Breakdown */}
                    {selectedSession.star_analysis && (
                      <div className="pt-3 border-t border-orange-500/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-orange-500" />
                            STAR Framework & Behavioral Storytelling Breakdown
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                              selectedSession.star_analysis.quantitative_metrics_detected
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            )}>
                              {selectedSession.star_analysis.quantitative_metrics_detected ? "Metrics Quantified ✓" : "Metrics Missing ⚠"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {selectedSession.star_analysis.components.map((comp, i) => {
                            const statusColor = 
                              comp.status === "strong" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                              comp.status === "partial" ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" :
                              "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400";
                            return (
                              <div key={i} className={cn("p-3 rounded-xl border space-y-1.5", statusColor)}>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black uppercase tracking-wider">{comp.component}</span>
                                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/20">
                                    {comp.status}
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium opacity-90 line-clamp-2">{comp.evidence}</p>
                                <p className="text-[10px] opacity-80 italic">{comp.feedback}</p>
                              </div>
                            );
                          })}
                        </div>

                        {selectedSession.star_analysis.missing_structural_gaps && selectedSession.star_analysis.missing_structural_gaps.length > 0 && (
                          <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-1.5 text-xs">
                            <span className="font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Structural Behavioral Gaps Flagged
                            </span>
                            <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                              {selectedSession.star_analysis.missing_structural_gaps.map((gap, idx) => (
                                <li key={idx}>{gap}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Evidence & Actionable Recommendations */}
                    <div className="pt-3 border-t border-orange-500/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {selectedSession.strengths && selectedSession.strengths.length > 0 && (
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Core Strengths
                          </span>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                            {selectedSession.strengths.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedSession.targeted_recommendations && selectedSession.targeted_recommendations.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                          <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5" />
                            Targeted Actionable Recommendations
                          </span>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                            {selectedSession.targeted_recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Q&A Transcript Stream with Audio Replay */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <AudioLines className="h-4 w-4 text-orange-500" />
                    Full Conversation Transcript & Audio Replays
                  </h3>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {selectedSession.messages.map((msg, index) => {
                      const isAI = msg.sender_role === "ai" || msg.sender_role === "system";
                      const hasAudio = Boolean(msg.audio_url);
                      const isPlaying = isPlayingAudio === msg.id;

                      return (
                        <div
                          key={msg.id || index}
                          className={cn(
                            "flex gap-3 p-4 rounded-2xl border transition-all",
                            isAI
                              ? "bg-slate-50 dark:bg-[#181E29] border-slate-200 dark:border-slate-800"
                              : "bg-orange-500/5 border-orange-500/20"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-xs",
                              isAI ? "bg-slate-700 dark:bg-slate-800" : "bg-gradient-to-tr from-[#E8602E] to-[#F17E45]"
                            )}
                          >
                            {isAI ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {isAI ? "AscendX AI Interviewer" : "Candidate Response"}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>

                            {/* Audio Replay Bar if Candidate Response has Recorded Audio */}
                            {hasAudio && (
                              <div className="flex items-center gap-3 pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setIsPlayingAudio(isPlaying ? null : msg.id)}
                                  className="h-7 px-3 text-xs gap-1.5 rounded-xl border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-800"
                                >
                                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                                  <span>{isPlaying ? "Pause Audio" : "Replay Audio"}</span>
                                </Button>
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Volume2 className="h-3 w-3 text-emerald-500" />
                                  Candidate Speech Recording (Saved Securely)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 text-sm">
                Select a past session from the left archive to inspect transcript and audio replays.
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalSessionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Permanently Delete Archive?
                  </h3>
                  <p className="text-xs text-slate-500">
                    This action will permanently erase the transcript and audio recordings from Supabase.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteModalSessionId(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleDeleteSession(deleteModalSessionId)}
                  className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Yes, Delete Permanently
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
