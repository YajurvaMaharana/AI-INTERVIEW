"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Code2,
  Users,
  Sparkles,
  Check,
  Loader2,
  ArrowRight,
  Briefcase,
  Sliders,
  ShieldCheck,
  Zap,
  Target,
  Award,
  Mic,
  Laptop,
  Layers,
  AlertCircle,
  Network,
  Clock,
  Globe,
  Flame,
  MessageSquare,
  Compass,
  UploadCloud,
} from "lucide-react";
import {
  interviewSetupSchema,
  type InterviewSetupValues,
  type InterviewCreateResponse,
} from "@/lib/validations/interview";
import PersonaSelector, { PersonaId } from "@/components/dashboard/PersonaSelector";
import JobDescriptionInput from "@/components/interview/JobDescriptionInput";
import type { JobDescriptionParsedData } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FileCheck, Sparkles as SparklesIcon } from "lucide-react";

const INTERVIEW_FORMATS = [
  {
    id: "Technical" as const,
    title: "Technical & Core Architecture",
    subtitle: "Data structures, algorithms, concurrency, and trade-offs.",
    icon: Code2,
    badge: "Algorithms & Coding",
  },
  {
    id: "HR" as const,
    title: "Behavioral & STAR Method",
    subtitle: "Leadership, conflict resolution, ownership, and cultural alignment.",
    icon: Users,
    badge: "STAR Framework",
  },
  {
    id: "System Design" as const,
    title: "System Design & Distributed",
    subtitle: "High-throughput scaling, replication, caching, and resilience.",
    icon: Network,
    badge: "Scale & Reliability",
  },
  {
    id: "Mixed" as const,
    title: "Full-Loop Mixed Panel",
    subtitle: "Holistic evaluation spanning technical, architectural, and behavioral.",
    icon: Layers,
    badge: "Comprehensive",
  },
];

const DIFFICULTY_LEVELS = [
  {
    id: "Easy" as const,
    title: "Easy",
    tagline: "Foundational Concepts",
    description: "Core syntax, common design patterns, and standard conversational flows.",
    colorActive:
      "border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs",
    colorInactive:
      "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181E29] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700",
    badgeActive: "bg-emerald-500 text-white",
  },
  {
    id: "Medium" as const,
    title: "Medium",
    tagline: "Industry Standard",
    description: "Real-world production edge cases, performance bottlenecks, and trade-offs.",
    colorActive:
      "border-2 border-[#E8602E] bg-[#FFF6F0] dark:bg-[#2A1D17] text-[#C2410C] dark:text-[#FB923C] ring-2 ring-[#E8602E]/25 shadow-xs",
    colorInactive:
      "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181E29] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700",
    badgeActive: "bg-[#E8602E] text-white",
  },
  {
    id: "Hard" as const,
    title: "Hard",
    tagline: "Staff / Lead Scale",
    description: "High-concurrency distributed systems, deep failure modes, and architectural stress tests.",
    colorActive:
      "border-2 border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/20 shadow-xs",
    colorInactive:
      "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181E29] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700",
    badgeActive: "bg-rose-500 text-white",
  },
];

const DURATION_OPTIONS = [
  { value: 15, label: "15 min", sublabel: "Quick Sprint" },
  { value: 30, label: "30 min", sublabel: "Standard Loop" },
  { value: 45, label: "45 min", sublabel: "Deep Dive" },
  { value: 60, label: "60 min", sublabel: "Full Simulation" },
];

const PRACTICE_MODES = [
  {
    id: "standard" as const,
    title: "Realistic Interview",
    description: "Standard industry pacing and full simulated hiring assessment.",
    icon: ShieldCheck,
  },
  {
    id: "coaching" as const,
    title: "Guided Coaching",
    description: "Interactive hints, scaffolding, and step-by-step mentoring.",
    icon: Compass,
  },
  {
    id: "stress_test" as const,
    title: "Pressure & Stress Test",
    description: "Strict constraints, unexpected scale spikes, and tough pushback.",
    icon: Flame,
  },
  {
    id: "drill" as const,
    title: "Weakness Drill Mode",
    description: "Focused repetition and deep-dive probes on target domains.",
    icon: Target,
  },
  {
    id: "rapid_fire" as const,
    title: "Rapid-Fire Checks",
    description: "High-speed conceptual questions across multiple core topics.",
    icon: Zap,
  },
  {
    id: "confidence" as const,
    title: "Confidence Booster",
    description: "Supportive reinforcement and empowering mentoring tone.",
    icon: Award,
  },
];

const LANGUAGE_OPTIONS = [
  { code: "English", label: "English (US/UK)" },
  { code: "Spanish", label: "Español" },
  { code: "French", label: "Français" },
  { code: "German", label: "Deutsch" },
  { code: "Mandarin", label: "中文 (Mandarin)" },
  { code: "Japanese", label: "日本語" },
  { code: "Hindi", label: "हिन्दी (Hindi)" },
  { code: "Portuguese", label: "Português" },
];

const PRESET_ROLES = [
  "Senior Full-Stack Engineer",
  "Frontend & UI Architecture",
  "Backend & Distributed Systems",
  "AI & ML Solutions Engineer",
  "DevOps / Cloud Architect",
  "Product & Engineering Manager",
];

async function createInterview(
  data: InterviewSetupValues,
  jdData?: JobDescriptionParsedData | null,
  jdRawText?: string
): Promise<InterviewCreateResponse> {
  const res = await fetch("/api/interviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      jdData,
      jdRawText,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.message ?? `Server responded with status ${res.status}`
    );
  }

  return res.json() as Promise<InterviewCreateResponse>;
}

export default function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshProfile, updateUserProfile } = useAuth();
  const initialPersonaParam = searchParams.get("persona") as PersonaId | null;
  const initialModeParam = searchParams.get("mode") as string | null;

  const resumeData = (user as any)?.resume_data;
  const resumeFilename = (user as any)?.resume_filename;

  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(
    initialPersonaParam || "tech-grinder"
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [parsedJD, setParsedJD] = useState<JobDescriptionParsedData | null>(null);
  const [jdRawText, setJdRawText] = useState<string>("");

  // Manual override state
  const [showOverride, setShowOverride] = useState(false);
  const [overrideText, setOverrideText] = useState("");
  const [isUploadingOverride, setIsUploadingOverride] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const overrideFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Auto-fetch profile resume on load
  useEffect(() => {
    if (refreshProfile) {
      refreshProfile().catch(() => {});
    }
  }, [refreshProfile]);

  const handleOverrideUpload = async (file: File) => {
    if (!file) return;
    setOverrideError(null);
    setIsUploadingOverride(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (user?.id) {
        formData.append("userId", user.id);
      }
      const res = await fetch("/api/user/resume/parse", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to parse resume");
      }
      if (updateUserProfile && json.resumeData) {
        await updateUserProfile({
          resume_url: json.resumeUrl,
          resume_filename: json.fileName,
          resume_parsed_at: json.parsedAt,
          resume_data: json.resumeData,
          target_role: json.resumeData.headline || currentRole,
        });
      }
      if (refreshProfile) await refreshProfile();
      setShowOverride(false);
    } catch (err: any) {
      setOverrideError(err?.message || "Failed to upload resume");
    } finally {
      setIsUploadingOverride(false);
    }
  };

  const handleOverridePaste = async () => {
    if (!overrideText.trim() || overrideText.length < 30) {
      setOverrideError("Please paste at least 30 characters of resume text.");
      return;
    }
    setOverrideError(null);
    setIsUploadingOverride(true);
    try {
      const res = await fetch("/api/user/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: overrideText,
          userId: user?.id,
          filename: "Pasted_Resume.txt",
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to parse pasted resume");
      }
      if (updateUserProfile && json.resumeData) {
        await updateUserProfile({
          resume_url: json.resumeUrl,
          resume_filename: json.fileName,
          resume_parsed_at: json.parsedAt,
          resume_data: json.resumeData,
          target_role: json.resumeData.headline || currentRole,
        });
      }
      if (refreshProfile) await refreshProfile();
      setOverrideText("");
      setShowOverride(false);
    } catch (err: any) {
      setOverrideError(err?.message || "Failed to parse pasted resume");
    } finally {
      setIsUploadingOverride(false);
    }
  };

  const defaultRole = (user as any)?.target_role || resumeData?.headline || "Senior Full-Stack Engineer";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InterviewSetupValues>({
    resolver: zodResolver(interviewSetupSchema),
    defaultValues: {
      type: initialPersonaParam === "hr-partner" ? "HR" : "Technical",
      role: defaultRole,
      difficulty: "Medium",
      persona: initialPersonaParam || "tech-grinder",
      duration: 30,
      language: "English",
      practiceMode: initialModeParam === "simulation" ? "simulation_day" : "standard",
      modality: "voice",
    },
  });

  const selectedType = watch("type");
  const selectedDifficulty = watch("difficulty");
  const currentRole = watch("role");
  const selectedDuration = watch("duration");
  const selectedLanguage = watch("language");
  const selectedPracticeMode = watch("practiceMode");
  const selectedModality = watch("modality");

  // Pre-fill role when user loads
  useEffect(() => {
    if ((user as any)?.target_role) {
      setValue("role", (user as any).target_role, { shouldValidate: true });
    }
  }, [user, setValue]);

  // Sync persona changes with form values and interview type
  useEffect(() => {
    setValue("persona", selectedPersona, { shouldValidate: true });
    if (selectedPersona === "hr-partner") {
      setValue("type", "HR", { shouldValidate: true });
    } else if (selectedPersona === "tech-grinder") {
      setValue("type", "Technical", { shouldValidate: true });
    }
  }, [selectedPersona, setValue]);

  async function onSubmit(data: InterviewSetupValues) {
    setServerError(null);

    try {
      const { sessionId } = await createInterview(
        {
          ...data,
          persona: selectedPersona,
        },
        parsedJD,
        jdRawText
      );
      router.push(`/interview/${sessionId}`);
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong initializing the interview session. Please try again."
      );
    }
  }

  return (
    <div className="w-full">
      {/* ── Main Setup Card ── */}
      <div className="bg-[#F9FAFC] dark:bg-[#151922] border border-slate-200/80 dark:border-[#222B3A] rounded-[28px] p-5 sm:p-8 lg:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.6)] space-y-7 transition-colors duration-300">
        
        {/* ── Card Header ── */}
        <div className="space-y-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] dark:bg-[#2A1D17] border border-[#FDBA74]/80 dark:border-[#EA580C]/40 text-[#C2410C] dark:text-[#FB923C] text-xs font-bold tracking-wide uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interview Setup & Calibration Studio</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-[#1C2230]/80 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-700/80">
              <Zap className="w-3.5 h-3.5 text-[#E87A42]" />
              <span>Adaptive Branching Engine Active</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Configure Your Mock Interview
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Select your domain, evaluation style, target duration, persona, and preferred practice mode. AscendX will dynamically tailor questions and real-time probes to your specific parameters.
            </p>
          </div>
        </div>

        {/* ── Resume Grounding Context Banner & Mandatory Guardrail ── */}
        <div className="space-y-3">
          {resumeData ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Resume Grounded: {resumeFilename || "Candidate Profile Active"}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Claims & Metrics Calibrated
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {resumeData.headline || "Questions will reference your verified projects, technical stack, and audited resume claims."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowOverride(!showOverride)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C2230] text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  {showOverride ? "Close Override" : "Override / Update Resume"}
                </button>
                <Link
                  href="/resume-jd-grounding"
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline px-2"
                >
                  View Claims
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block">
                    Resume Required: No Profile Resume Found
                  </span>
                  <p className="text-[11px] opacity-90">
                    AscendX requires a grounded resume to tailor technical and behavioral questions. Please upload or paste your resume below.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOverride(!showOverride)}
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0"
              >
                {showOverride ? "Close Form" : "Upload / Paste Resume"}
              </button>
            </div>
          )}

          {/* Manual Override & Upload/Paste Panel */}
          {showOverride && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#E8602E]" />
                  <span>Manual Resume Override & Grounding</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  Upload PDF or paste text to update profile
                </span>
              </div>

              {overrideError && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{overrideError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload Box */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#E8602E] rounded-xl p-4 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/40">
                  <input
                    ref={overrideFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleOverrideUpload(file);
                    }}
                  />
                  <div className="w-9 h-9 rounded-full bg-[#E8602E]/10 text-[#E8602E] flex items-center justify-center">
                    {isUploadingOverride ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Upload PDF Resume
                    </p>
                    <p className="text-[10px] text-slate-500">Max 10MB • Auto-parsed by Gemini 3.8 Flash</p>
                  </div>
                  <button
                    type="button"
                    disabled={isUploadingOverride}
                    onClick={() => overrideFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#E8602E] text-white text-xs font-semibold hover:bg-[#d85322] transition-colors"
                  >
                    Select PDF
                  </button>
                </div>

                {/* Paste Text Box */}
                <div className="flex flex-col space-y-2">
                  <textarea
                    rows={4}
                    value={overrideText}
                    onChange={(e) => setOverrideText(e.target.value)}
                    placeholder="Or paste resume raw text here (include work history, tech stack, and achievements)..."
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#E8602E]/30 focus:border-[#E8602E] resize-none"
                  />
                  <button
                    type="button"
                    disabled={isUploadingOverride || !overrideText.trim()}
                    onClick={handleOverridePaste}
                    className="w-full py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUploadingOverride ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Parsing & Grounding...</span>
                      </>
                    ) : (
                      <span>Parse & Ground Pasted Text</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Error Banner ── */}
        {serverError && (
          <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Failed to start interview</p>
              <p className="text-xs opacity-90">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          
          {/* ========================================================= */}
          {/* 1. INTERVIEW FORMAT & SCOPE                               */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#E87A42]" />
                <span>1. Interview Format & Scope</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Choose evaluation discipline
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTERVIEW_FORMATS.map((typeObj) => {
                const Icon = typeObj.icon;
                const isSelected = selectedType === typeObj.id;

                return (
                  <button
                    key={typeObj.id}
                    type="button"
                    onClick={() => setValue("type", typeObj.id, { shouldValidate: true })}
                    className={cn(
                      "relative text-left p-4 rounded-2xl transition-all duration-200 flex flex-col justify-between group cursor-pointer",
                      isSelected
                        ? "border-2 border-[#E8602E] bg-[#FFF6F0] dark:bg-[#2A1D17] shadow-sm ring-2 ring-[#E8602E]/20"
                        : "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181E29] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                    )}
                  >
                    {/* Top row with icon & badge */}
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-[#E8602E] text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-[#E8602E]"
                        )}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#E8602E] text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {typeObj.badge}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h3
                        className={cn(
                          "text-sm font-bold tracking-tight mb-1",
                          isSelected
                            ? "text-slate-900 dark:text-white font-extrabold"
                            : "text-slate-800 dark:text-slate-200"
                        )}
                      >
                        {typeObj.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {typeObj.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.type && (
              <p className="text-xs font-semibold text-rose-500">{errors.type.message}</p>
            )}
          </div>

          {/* ========================================================= */}
          {/* 2. TARGET JOB DESCRIPTION (JD) CALIBRATION                */}
          {/* ========================================================= */}
          <JobDescriptionInput
            parsedJD={parsedJD}
            onJDParsed={(extracted, raw) => {
              setParsedJD(extracted);
              setJdRawText(raw);
            }}
            onAutoFillRole={(newRole, suggestedDiff) => {
              setValue("role", newRole, { shouldValidate: true });
              if (suggestedDiff) {
                setValue("difficulty", suggestedDiff, { shouldValidate: true });
              }
            }}
          />

          {/* ========================================================= */}
          {/* 3. INTERVIEWER PERSONA & EVALUATOR STYLE                  */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="bg-white dark:bg-[#181E29] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
              <PersonaSelector
                selectedPersona={selectedPersona}
                onSelectPersona={(id) => setSelectedPersona(id)}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. ROLE & DOMAIN INPUT                                    */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="setup-role-input"
                className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#E87A42]" />
                <span>3. Target Role / Domain</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Calibrates terminology & depth
              </span>
            </div>

            {/* Input with Leading Icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Laptop className="w-4 h-4" />
              </div>
              <input
                id="setup-role-input"
                type="text"
                placeholder="e.g. Senior Full-Stack Engineer, Distributed Systems Lead"
                disabled={isSubmitting}
                className={cn(
                  "w-full h-12 pl-10 pr-4 rounded-xl text-sm font-medium transition-all duration-200",
                  "bg-white dark:bg-[#181E29] border border-slate-200 dark:border-slate-700/90 text-slate-900 dark:text-white",
                  "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E8602E]/30 focus:border-[#E8602E]",
                  "disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                )}
                {...register("role")}
              />
            </div>

            {errors.role && (
              <p className="text-xs font-semibold text-rose-500">{errors.role.message}</p>
            )}

            {/* Quick Preset Role Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Quick Select Suggested Roles:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ROLES.map((roleName) => {
                  const isActive = currentRole === roleName;
                  return (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => setValue("role", roleName, { shouldValidate: true })}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full transition-all duration-150 font-medium cursor-pointer",
                        isActive
                          ? "bg-[#E8602E] text-white font-semibold shadow-2xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#FFF6F0] dark:hover:bg-[#2A1D17] hover:text-[#C2410C] dark:hover:text-[#FB923C] border border-slate-200/60 dark:border-slate-700"
                      )}
                    >
                      {roleName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. DIFFICULTY & TARGET DURATION                           */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Difficulty Calibration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#E87A42]" />
                  <span>4. Difficulty Tier</span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTY_LEVELS.map((diff) => {
                  const isSelected = selectedDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setValue("difficulty", diff.id, { shouldValidate: true })}
                      className={cn(
                        "p-3 rounded-xl text-left transition-all duration-200 flex flex-col justify-between cursor-pointer",
                        isSelected ? diff.colorActive : diff.colorInactive
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold uppercase">{diff.title}</span>
                        {isSelected && (
                          <div className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]", diff.badgeActive)}>
                            <Check className="w-2 h-2 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold opacity-90 truncate">{diff.tagline}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Duration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#E87A42]" />
                  <span>5. Session Duration</span>
                </label>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((dur) => {
                  const isSelected = selectedDuration === dur.value;
                  return (
                    <button
                      key={dur.value}
                      type="button"
                      onClick={() => setValue("duration", dur.value, { shouldValidate: true })}
                      className={cn(
                        "p-2.5 rounded-xl text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center",
                        isSelected
                          ? "border-2 border-[#E8602E] bg-[#FFF6F0] dark:bg-[#2A1D17] text-[#C2410C] dark:text-[#FB923C] font-bold shadow-2xs ring-2 ring-[#E8602E]/20"
                          : "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181E29] text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      )}
                    >
                      <span className="text-xs font-bold">{dur.label}</span>
                      <span className="text-[9px] opacity-75">{dur.sublabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 6. PRACTICE MODE & SESSION LANGUAGE                       */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Practice Mode */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#E87A42]" />
                <span>6. Practice Mode</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRACTICE_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedPracticeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setValue("practiceMode", mode.id, { shouldValidate: true })}
                      className={cn(
                        "p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between",
                        isSelected
                          ? "border-2 border-[#E8602E] bg-[#FFF6F0] dark:bg-[#2A1D17] text-[#C2410C] dark:text-[#FB923C] shadow-2xs ring-2 ring-[#E8602E]/20"
                          : "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181E29] text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3.5 h-3.5 text-[#E87A42]" />
                        <span className="text-xs font-bold truncate">{mode.title}</span>
                      </div>
                      <p className="text-[10px] opacity-75 leading-tight line-clamp-2">{mode.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Language & Modality */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#E87A42]" />
                <span>7. Language & Modality</span>
              </label>

              <div className="space-y-2">
                {/* Language Select */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setValue("language", e.target.value, { shouldValidate: true })}
                  className="w-full h-10 px-3 rounded-xl text-xs font-medium bg-white dark:bg-[#181E29] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#E8602E]/30 focus:border-[#E8602E]"
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                {/* Modality Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue("modality", "voice", { shouldValidate: true })}
                    className={cn(
                      "p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                      selectedModality === "voice"
                        ? "bg-[#E8602E] text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice-Active</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("modality", "text", { shouldValidate: true })}
                    className={cn(
                      "p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                      selectedModality === "text"
                        ? "bg-[#E8602E] text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Text & Chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 7. PRIMARY ACTION BUTTON & SUMMARY                        */}
          {/* ========================================================= */}
          <div className="pt-2 space-y-3">
            {!resumeData && (
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 text-center animate-pulse">
                ⚠️ Resume Required: Please upload or paste your resume above to enable interview calibration.
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !resumeData}
              className={cn(
                "w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl",
                !resumeData
                  ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-[#E8602E] to-[#F17E45] hover:from-[#d85322] hover:to-[#e07038] text-white font-bold text-base shadow-[0_6px_24px_rgba(232,96,46,0.38)] dark:shadow-[0_6px_28px_rgba(232,96,46,0.45)] cursor-pointer active:scale-[0.99]",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Calibrating AI Interview Session...</span>
                </>
              ) : !resumeData ? (
                <>
                  <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>Resume Required to Start Interview</span>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-xl bg-black/20 dark:bg-black/30 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    <Mic className="w-4 h-4" />
                  </div>
                  <span>Start Calibrated Interview</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Under-button telemetry badges */}
            <div className="flex flex-wrap items-center justify-between px-1 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Mic className="w-3.5 h-3.5 text-[#E87A42]" />
                <span>{selectedModality === "voice" ? "Voice-Active Input & Output Enabled" : "Interactive Chat & Code Mode"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live Adaptive Difficulty & Full STAR Debrief</span>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

