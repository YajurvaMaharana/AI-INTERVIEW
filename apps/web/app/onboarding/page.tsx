"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  User,
  Briefcase,
  Award,
  Code2,
  Terminal,
  Target,
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Cpu,
  Bot,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AVATAR_PRESETS = [
  {
    id: "avatar-1",
    name: "Classic Dev",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
  },
  {
    id: "avatar-2",
    name: "Tech Lead",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
  },
  {
    id: "avatar-3",
    name: "Architect",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80",
  },
  {
    id: "avatar-4",
    name: "Staff Engineer",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
  },
  {
    id: "avatar-5",
    name: "Frontend Specialist",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80",
  },
  {
    id: "avatar-6",
    name: "AI Researcher",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80",
  },
];

const POPULAR_ROLES = [
  "Senior Full-Stack Engineer",
  "Backend Systems Architect",
  "Frontend Engineer (React/Next)",
  "Distributed Systems Engineer",
  "DevOps / SRE Specialist",
  "AI / ML Solutions Engineer",
  "Engineering Manager",
];

const SENIORITY_LEVELS = [
  {
    id: "junior",
    label: "Junior / Entry",
    range: "0-2 years",
    desc: "Core algorithms, clean coding, standard design patterns",
  },
  {
    id: "mid",
    label: "Mid-Level",
    range: "2-5 years",
    desc: "Production features, clean APIs, database indexing & testing",
  },
  {
    id: "senior",
    label: "Senior Engineer",
    range: "5-8 years",
    desc: "System design, concurrency, trade-offs & scalable architectures",
  },
  {
    id: "staff",
    label: "Staff / Principal",
    range: "8+ years",
    desc: "High-scale resilience, architectural governance & cross-org impact",
  },
];

const INTERVIEW_TYPES = [
  {
    id: "technical",
    label: "Technical Problem Solving",
    badge: "Algorithms & Live Coding",
    desc: "Data structures, algorithmic efficiency, edge cases, and optimization follow-ups.",
  },
  {
    id: "system_design",
    label: "System Design & Architecture",
    badge: "High Scale & Resiliency",
    desc: "Microservices, sharding, caching strategies, asynchronous pipelines, and throughput.",
  },
  {
    id: "behavioral",
    label: "Behavioral & Leadership",
    badge: "STAR Method",
    desc: "Leadership, conflict resolution, technical ownership, and project retrospectives.",
  },
  {
    id: "mixed",
    label: "Comprehensive Full-Loop",
    badge: "Adaptive Hybrid",
    desc: "Dynamic mix of technical depth, system trade-offs, and behavioral ownership.",
  },
];

const PROGRAMMING_LANGUAGES = [
  "TypeScript",
  "Python",
  "Go",
  "Java",
  "C++",
  "Rust",
  "JavaScript",
  "SQL / Postgres",
];

const INTERVIEW_GOALS = [
  "FAANG / Tier 1 Tech Company Prep",
  "Promotion to Senior / Staff Level",
  "Master Complex System Design",
  "Polish Behavioral STAR Technique",
  "Overcome Live Interview Anxiety",
  "General Interview Practice & Feedback",
];

const TARGET_COMPANIES = [
  "Google",
  "Meta",
  "Apple",
  "Amazon",
  "Netflix",
  "Stripe",
  "OpenAI",
  "Anthropic",
  "Microsoft",
  "Databricks",
  "High-Growth Startup",
];

const CORE_SKILLS = [
  "TypeScript",
  "React / Next.js",
  "Node.js",
  "Python",
  "Go",
  "PostgreSQL",
  "System Design",
  "Distributed Systems",
  "Docker & Kubernetes",
  "Redis & Caching",
  "AWS Cloud",
  "GraphQL / REST APIs",
  "Microservices",
  "CI/CD Pipelines",
];

function OnboardingContent() {
  const router = useRouter();
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Candidate Identity
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0].url);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);

  // Step 2: Target Role & Seniority
  const [targetRole, setTargetRole] = useState("Senior Full-Stack Engineer");
  const [experienceLevel, setExperienceLevel] = useState("senior");

  // Step 3: Interview Preferences & Goals
  const [preferredInterviewType, setPreferredInterviewType] = useState("mixed");
  const [preferredLanguage, setPreferredLanguage] = useState("TypeScript");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "FAANG / Tier 1 Tech Company Prep",
    "Master Complex System Design",
  ]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([
    "Google",
    "Meta",
    "Stripe",
  ]);

  // Step 4: Core Competencies
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "TypeScript",
    "React / Next.js",
    "PostgreSQL",
    "System Design",
  ]);

  // Submission State
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize from existing user state
  useEffect(() => {
    if (user) {
      const u = user as any;
      if (u.display_name || u.user_metadata?.display_name) {
        setDisplayName(u.display_name || u.user_metadata?.display_name);
      } else if (u.email) {
        setDisplayName(u.email.split("@")[0]);
      }

      if (u.target_role || u.user_metadata?.target_role) {
        setTargetRole(u.target_role || u.user_metadata?.target_role);
      }

      if (u.bio || u.user_metadata?.bio) {
        setBio(u.bio || u.user_metadata?.bio);
      }

      if (u.avatar_url || u.user_metadata?.avatar_url) {
        setAvatarUrl(u.avatar_url || u.user_metadata?.avatar_url);
      }

      if (u.experience_level || u.user_metadata?.experience_level) {
        setExperienceLevel(u.experience_level || u.user_metadata?.experience_level);
      }

      if (u.preferred_interview_type || u.user_metadata?.preferred_interview_type) {
        setPreferredInterviewType(
          u.preferred_interview_type || u.user_metadata?.preferred_interview_type
        );
      }

      if (u.preferred_language || u.user_metadata?.preferred_language) {
        setPreferredLanguage(
          u.preferred_language || u.user_metadata?.preferred_language
        );
      }

      if (u.skills || u.user_metadata?.skills) {
        setSelectedSkills(u.skills || u.user_metadata?.skills);
      }

      if (u.interview_goals || u.user_metadata?.interview_goals) {
        const goals = u.interview_goals || u.user_metadata?.interview_goals;
        setSelectedGoals(Array.isArray(goals) ? goals : [goals]);
      }

      if (u.target_companies || u.user_metadata?.target_companies) {
        setSelectedCompanies(u.target_companies || u.user_metadata?.target_companies);
      }
    }
  }, [user]);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const toggleCompany = (company: string) => {
    if (selectedCompanies.includes(company)) {
      setSelectedCompanies(selectedCompanies.filter((c) => c !== company));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleFinishOnboarding = async (launchTarget: string = "/dashboard") => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const success = await updateUserProfile({
        display_name: displayName.trim() || "Candidate",
        target_role: targetRole.trim() || "Software Engineer",
        bio: bio.trim() || "Passionate software engineer focused on distributed systems and clean design.",
        avatar_url: avatarUrl.trim() || null,
        skills: selectedSkills,
        experience_level: experienceLevel,
        preferred_interview_type: preferredInterviewType,
        preferred_language: preferredLanguage,
        interview_goals: selectedGoals,
        target_companies: selectedCompanies,
      });

      if (success) {
        setTimeout(() => {
          router.push(launchTarget);
        }, 500);
      } else {
        setErrorMessage("Failed to save profile. Retrying directly...");
        router.push(launchTarget);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while finishing setup.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0B0D13] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md font-black tracking-wider">
            A
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              Ascend<span className="text-orange-600">X</span> Onboarding
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personalizing your AI interviewer & evaluation rubric
            </p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                key={stepNum}
                type="button"
                onClick={() => setCurrentStep(stepNum)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-orange-600 text-white shadow-xs"
                    : isCompleted
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span>{stepNum}</span>
                )}
                <span className="hidden sm:inline">
                  {stepNum === 1 && "Identity"}
                  {stepNum === 2 && "Role"}
                  {stepNum === 3 && "Goals"}
                  {stepNum === 4 && "Stack"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl w-full mx-auto my-6 flex-1 flex flex-col justify-center">
        {errorMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* STEP 1: Candidate Identity */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                  <span>Step 1 of 4: Candidate Identity</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Welcome to AscendX! Let&apos;s personalize your profile
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  How should your AI Technical Interviewer address you during live sessions?
                </p>
              </div>

              {/* Avatar Picker */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-[#1C2230]/60 border border-slate-200/80 dark:border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Profile Avatar
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        setIsCustomAvatar(false);
                      }}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                        avatarUrl === preset.url && !isCustomAvatar
                          ? "border-orange-500 scale-110 shadow-md ring-2 ring-orange-500/30"
                          : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                      }`}
                      title={preset.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomAvatar(!isCustomAvatar)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                      isCustomAvatar
                        ? "bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Custom Image URL</span>
                  </button>
                </div>

                {isCustomAvatar && (
                  <input
                    type="url"
                    id="onboarding-custom-avatar"
                    placeholder="https://example.com/your-image.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40"
                  />
                )}
              </div>

              {/* Name & Bio */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Candidate Full Name / Display Name
                  </label>
                  <input
                    id="onboarding-name-input"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Elevator Pitch / Background Summary</span>
                    <span className="text-[11px] text-slate-400">{bio.length}/500</span>
                  </label>
                  <textarea
                    id="onboarding-bio-input"
                    rows={3}
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly state your engineering background, top technical accomplishments, or domains of expertise..."
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Target Role & Seniority */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Step 2 of 4: Target Engineering Role</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  What role and seniority are you preparing for?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  This calibrates the AI interviewer&apos;s expectations, rubric strictness, and system design complexity.
                </p>
              </div>

              {/* Target Role Input & Pills */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Engineering Role
                </label>
                <input
                  id="onboarding-target-role"
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white font-medium"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {POPULAR_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        targetRole === role
                          ? "bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400 font-semibold shadow-xs"
                          : "bg-slate-100/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seniority Cards */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span>Seniority & Experience Level</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {SENIORITY_LEVELS.map((lvl) => {
                    const isSelected = experienceLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setExperienceLevel(lvl.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-orange-500/10 border-orange-500/60 ring-2 ring-orange-500/20 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {lvl.label}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            {lvl.range}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {lvl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Interview Preferences & Goals */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold">
                  <Target className="w-3.5 h-3.5" />
                  <span>Step 3 of 4: Interview Format & Target Goals</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Configure your interview strategy
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Select your default interview mode, coding language, and company targets.
                </p>
              </div>

              {/* Preferred Interview Type */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Preferred Interview Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTERVIEW_TYPES.map((type) => {
                    const isSelected = preferredInterviewType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setPreferredInterviewType(type.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-orange-500/10 border-orange-500/60 ring-2 ring-orange-500/20 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {type.label}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-700 dark:text-orange-300 font-bold">
                            {type.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {type.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Language */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-orange-500" />
                  <span>Primary Programming Language for Coding Rounds</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROGRAMMING_LANGUAGES.map((lang) => {
                    const isSelected = preferredLanguage === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setPreferredLanguage(lang)}
                        className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-orange-600 text-white border-orange-600 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-300"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Goals & Target Companies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Primary Goals
                  </label>
                  <div className="space-y-1.5">
                    {INTERVIEW_GOALS.map((goal) => {
                      const isSelected = selectedGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleGoal(goal)}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-orange-500/10 border-orange-500/40 text-orange-700 dark:text-orange-300 font-semibold"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <span>{goal}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-orange-500" />
                    <span>Target Companies</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TARGET_COMPANIES.map((company) => {
                      const isSelected = selectedCompanies.includes(company);
                      return (
                        <button
                          key={company}
                          type="button"
                          onClick={() => toggleCompany(company)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-orange-600 text-white border-orange-600 font-semibold"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {company}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Core Tech Stack & AI Persona Preview */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Step 4 of 4: Core Stack & Calibration</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Select your core engineering competencies
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  The AI interviewer will dynamically drill into edge cases and trade-offs in your selected stack.
                </p>
              </div>

              {/* Skills Chips */}
              <div className="flex flex-wrap gap-2">
                {CORE_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-orange-600 text-white border-orange-600 font-semibold shadow-xs"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              {/* Calibrated AI Persona Preview Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-300/80 dark:border-orange-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-900 dark:text-orange-300 uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span>Real-Time AI Interview Calibration Active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1C2230] border border-slate-200/60 dark:border-slate-800">
                    <div className="text-[11px] text-slate-400 font-medium">Candidate</div>
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {displayName || "Candidate"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1C2230] border border-slate-200/60 dark:border-slate-800">
                    <div className="text-[11px] text-slate-400 font-medium">Calibrated Role</div>
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {targetRole} (<span className="capitalize">{experienceLevel}</span>)
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1C2230] border border-slate-200/60 dark:border-slate-800">
                    <div className="text-[11px] text-slate-400 font-medium">Primary Focus</div>
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {preferredLanguage} • {selectedSkills.slice(0, 2).join(", ")}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your AI interviewer is set to conduct adaptive interviews with difficulty calibrated for <strong>{experienceLevel}</strong> engineers. Probing questions will focus on {selectedSkills.slice(0, 3).join(", ")} with real-time STAR evaluation.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  id="onboarding-next-btn"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    id="onboarding-finish-dashboard-btn"
                    disabled={isSaving}
                    onClick={() => handleFinishOnboarding("/dashboard")}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isSaving ? "Saving..." : "Go to Dashboard"}
                  </button>
                  <button
                    type="button"
                    id="onboarding-finish-practice-btn"
                    disabled={isSaving}
                    onClick={() => handleFinishOnboarding("/interview/new")}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Calibrating AI...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        <span>Start First Practice Interview</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9] dark:bg-[#0B0D13]">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
