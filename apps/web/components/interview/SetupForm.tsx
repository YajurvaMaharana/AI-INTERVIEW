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
  Mic,
  Laptop,
  Layers,
  AlertCircle,
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

const INTERVIEW_TYPES = [
  {
    id: "Technical" as const,
    title: "Technical & System Architecture",
    subtitle: "Data structures, algorithms, concurrency & scalable system design trade-offs.",
    icon: Code2,
    badge: "Core Technical",
  },
  {
    id: "HR" as const,
    title: "Behavioral & STAR Method",
    subtitle: "Situation, Task, Action, Result framework with culture and leadership alignment.",
    icon: Users,
    badge: "Culture & Leadership",
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
  const { user } = useAuth();
  const initialPersonaParam = searchParams.get("persona") as PersonaId | null;

  const resumeData = (user as any)?.resume_data;
  const resumeFilename = (user as any)?.resume_filename;

  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(
    initialPersonaParam || "tech-grinder"
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [parsedJD, setParsedJD] = useState<JobDescriptionParsedData | null>(null);
  const [jdRawText, setJdRawText] = useState<string>("");

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
    },
  });

  const selectedType = watch("type");
  const selectedDifficulty = watch("difficulty");
  const currentRole = watch("role");

  // Pre-fill role when user loads
  useEffect(() => {
    if ((user as any)?.target_role) {
      setValue("role", (user as any).target_role, { shouldValidate: true });
    }
  }, [user, setValue]);

  // Sync persona changes with interview type default if user switches persona
  useEffect(() => {
    if (selectedPersona === "hr-partner") {
      setValue("type", "HR", { shouldValidate: true });
    } else if (selectedPersona === "tech-grinder") {
      setValue("type", "Technical", { shouldValidate: true });
    }
  }, [selectedPersona, setValue]);

  async function onSubmit(data: InterviewSetupValues) {
    setServerError(null);

    try {
      const { sessionId } = await createInterview(data, parsedJD, jdRawText);
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
              <span>Adaptive Interview Studio</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-[#1C2230]/80 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-700/80">
              <Zap className="w-3.5 h-3.5 text-[#E87A42]" />
              <span>Gemini 2.0 Engine Active</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Set Up Your Interview
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Configure your mock interview session. AscendX will dynamically calibrate question difficulty, follow-up depth, and post-session feedback based on your chosen parameters.
            </p>
          </div>
        </div>

        {/* ── Resume Grounding Context Banner ── */}
        {resumeData ? (
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 animate-in fade-in duration-200">
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
                    Live Grounding
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Questions will reference your {resumeData.projects?.length || 0} projects, {resumeData.skills?.languages?.slice(0, 3).join(", ") || "tech stack"}, and metrics.
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
            >
              Manage
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-[#1C2230]/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <SparklesIcon className="w-4 h-4 text-[#E8602E]" />
              <span>Want personalized questions targeting your real projects & metrics?</span>
            </div>
            <Link
              href="/profile"
              className="text-xs font-bold text-[#E8602E] hover:text-[#d85322] hover:underline shrink-0"
            >
              Upload Resume
            </Link>
          </div>
        )}

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* ========================================================= */}
          {/* 1. INTERVIEW TYPE SELECTOR                                */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#E87A42]" />
                <span>1. Interview Format & Scope</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Choose evaluation style
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {INTERVIEW_TYPES.map((typeObj) => {
                const Icon = typeObj.icon;
                const isSelected = selectedType === typeObj.id;

                return (
                  <button
                    key={typeObj.id}
                    type="button"
                    onClick={() => setValue("type", typeObj.id, { shouldValidate: true })}
                    className={cn(
                      "relative text-left p-4 sm:p-4.5 rounded-2xl transition-all duration-200 flex flex-col justify-between group cursor-pointer",
                      isSelected
                        ? "border-2 border-[#E8602E] bg-[#FFF6F0] dark:bg-[#2A1D17] shadow-sm ring-2 ring-[#E8602E]/20"
                        : "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181E29] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                    )}
                  >
                    {/* Top row with icon & badge */}
                    <div className="flex items-center justify-between w-full mb-2.5">
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
          {/* 3. INTERVIEWER PERSONA SELECTOR                           */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-[#181E29] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <PersonaSelector
              selectedPersona={selectedPersona}
              onSelectPersona={(id) => setSelectedPersona(id)}
            />
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
                Tailors technical domain & terminology
              </span>
            </div>

            {/* Input with Leading Icon & Peach Focus Ring */}
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
          {/* 5. DIFFICULTY SELECTOR PILLS                              */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#E87A42]" />
                <span>4. Difficulty Calibration</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Dynamic follow-up rigor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DIFFICULTY_LEVELS.map((diff) => {
                const isSelected = selectedDifficulty === diff.id;

                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setValue("difficulty", diff.id, { shouldValidate: true })}
                    className={cn(
                      "relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between cursor-pointer",
                      isSelected ? diff.colorActive : diff.colorInactive
                    )}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {diff.title}
                      </span>
                      {isSelected && (
                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px]", diff.badgeActive)}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Tagline & Description */}
                    <div>
                      <p className="text-xs font-bold mb-1 opacity-95">
                        {diff.tagline}
                      </p>
                      <p className="text-[11px] opacity-75 leading-relaxed">
                        {diff.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.difficulty && (
              <p className="text-xs font-semibold text-rose-500">{errors.difficulty.message}</p>
            )}
          </div>

          {/* ========================================================= */}
          {/* 5. PRIMARY ACTION BUTTON (Orange/Peach Gradient)          */}
          {/* ========================================================= */}
          <div className="pt-3 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl",
                "bg-gradient-to-r from-[#E8602E] to-[#F17E45] hover:from-[#d85322] hover:to-[#e07038]",
                "text-white font-bold text-base shadow-[0_6px_24px_rgba(232,96,46,0.38)] dark:shadow-[0_6px_28px_rgba(232,96,46,0.45)]",
                "transition-all duration-200 active:scale-[0.99] cursor-pointer",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Calibrating AI Interview Session...</span>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-xl bg-black/20 dark:bg-black/30 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    <Mic className="w-4 h-4" />
                  </div>
                  <span>Start Interview</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Under-button telemetry badges */}
            <div className="flex flex-wrap items-center justify-between px-1 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Mic className="w-3.5 h-3.5 text-[#E87A42]" />
                <span>Real-Time Voice & Text Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Comprehensive STAR Debrief on Finish</span>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
