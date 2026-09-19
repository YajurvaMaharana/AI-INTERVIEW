"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Briefcase,
  FileText,
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
  Code2,
  Cpu,
  Award,
  AlertCircle,
  LayoutDashboard,
  Bot,
  LogOut,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Trash2,
  Target,
  Terminal,
  Building2,
  KeyRound,
  X,
  UploadCloud,
  Download,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ResumeManager } from "@/components/profile/ResumeManager";

// Pre-configured avatar presets
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
  "DevOps / Site Reliability Engineer",
  "AI / ML Solutions Engineer",
  "Engineering Manager",
];

const EXPERIENCE_LEVELS = [
  { id: "junior", label: "Junior / Entry (0-2 yrs)", desc: "Fundamentals & core algorithms" },
  { id: "mid", label: "Mid-Level (2-5 yrs)", desc: "Production features & clean architecture" },
  { id: "senior", label: "Senior (5-8 yrs)", desc: "System design, trade-offs & scale" },
  { id: "staff", label: "Staff / Principal (8+ yrs)", desc: "High-scale resiliency & org impact" },
];

const TECH_SKILLS = [
  "TypeScript",
  "React / Next.js",
  "Node.js",
  "Python",
  "Go",
  "PostgreSQL",
  "Distributed Systems",
  "System Design",
  "Docker & Kubernetes",
  "AWS Cloud",
  "GraphQL / REST",
  "Microservices",
  "Redis & Caching",
  "CI/CD Pipelines",
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

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams?.get("onboarding") === "true";
  const {
    user,
    updateUserProfile,
    signOut,
    updatePassword,
    resetPasswordEmail,
    deleteAccount,
  } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("senior");
  const [preferredInterviewType, setPreferredInterviewType] = useState("mixed");
  const [preferredLanguage, setPreferredLanguage] = useState("TypeScript");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "TypeScript",
    "React / Next.js",
    "System Design",
    "PostgreSQL",
  ]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "FAANG / Tier 1 Tech Company Prep",
  ]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([
    "Google",
    "Meta",
    "Stripe",
  ]);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);

  // Security / Password modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Granular Consent & Privacy States
  const [resumeConsent, setResumeConsent] = useState(true);
  const [voiceConsent, setVoiceConsent] = useState(true);
  const [webcamConsent, setWebcamConsent] = useState(true);
  const [peerBenchmarkConsent, setPeerBenchmarkConsent] = useState(true);

  const handleExportDataArchive = () => {
    const exportData = {
      user: {
        email: user?.email,
        displayName,
        targetRole,
        experienceLevel,
        skills: selectedSkills,
        goals: selectedGoals,
      },
      consents: {
        resumeParsingAndStorage: resumeConsent,
        voiceRecordingAndTelemetry: voiceConsent,
        webcamGazeAndEngagementTracking: webcamConsent,
        anonymizedPeerBenchmarking: peerBenchmarkConsent,
      },
      exportedAt: new Date().toISOString(),
      platform: "AI Interview Coach & Evaluation Engine",
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI-Interview-Coach-Data-Archive-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initialize from auth context
  useEffect(() => {
    if (user) {
      const u = user as any;
      const currentDisplayName =
        u.display_name ||
        u.user_metadata?.display_name ||
        u.user_metadata?.full_name ||
        u.email?.split("@")[0] ||
        "Candidate";
      const currentRole =
        u.target_role ||
        u.user_metadata?.target_role ||
        "Senior Full-Stack Engineer";
      const currentBio =
        u.bio ||
        u.user_metadata?.bio ||
        "Software Engineer passionate about high-concurrency distributed systems, clean architecture, and technical problem solving.";
      const currentAvatar =
        u.avatar_url || u.user_metadata?.avatar_url || AVATAR_PRESETS[0].url;
      const currentExpLevel =
        u.experience_level || u.user_metadata?.experience_level || "senior";
      const currentSkills =
        u.skills ||
        u.user_metadata?.skills || [
          "TypeScript",
          "React / Next.js",
          "System Design",
          "PostgreSQL",
        ];
      const currentPrefType =
        u.preferred_interview_type ||
        u.user_metadata?.preferred_interview_type ||
        "mixed";
      const currentPrefLang =
        u.preferred_language ||
        u.user_metadata?.preferred_language ||
        "TypeScript";

      setDisplayName(currentDisplayName);
      setTargetRole(currentRole);
      setBio(currentBio);
      setAvatarUrl(currentAvatar);
      setExperienceLevel(currentExpLevel);
      setSelectedSkills(currentSkills);
      setPreferredInterviewType(currentPrefType);
      setPreferredLanguage(currentPrefLang);

      if (u.interview_goals || u.user_metadata?.interview_goals) {
        const goals = u.interview_goals || u.user_metadata?.interview_goals;
        setSelectedGoals(Array.isArray(goals) ? goals : [goals]);
      }
      if (u.target_companies || u.user_metadata?.target_companies) {
        setSelectedCompanies(u.target_companies || u.user_metadata?.target_companies);
      }
    }
  }, [user]);

  const handleResumeParsed = (parsed: any) => {
    if (parsed) {
      if (parsed.full_name && (!displayName || displayName === "Candidate")) {
        setDisplayName(parsed.full_name);
      }
      if (parsed.headline) {
        setTargetRole(parsed.headline);
      }
      if (parsed.summary && (!bio || bio.length < 30)) {
        setBio(parsed.summary.slice(0, 480));
      }
      const extractedSkills = [
        ...(parsed.skills?.languages || []),
        ...(parsed.skills?.frameworks || []),
        ...(parsed.skills?.databases || []),
        ...(parsed.skills?.cloud_and_devops || []),
      ];
      if (extractedSkills.length > 0) {
        setSelectedSkills((prev) => Array.from(new Set([...prev, ...extractedSkills.slice(0, 8)])));
      }
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

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

  const handleSave = async (redirectTarget?: string) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const success = await updateUserProfile({
        display_name: displayName.trim() || "Candidate",
        target_role: targetRole.trim() || "Software Engineer",
        bio: bio.trim(),
        avatar_url: avatarUrl.trim() || null,
        skills: selectedSkills,
        experience_level: experienceLevel,
        preferred_interview_type: preferredInterviewType,
        preferred_language: preferredLanguage,
        interview_goals: selectedGoals,
        target_companies: selectedCompanies,
      });

      if (success) {
        setSaveSuccess(true);
        setTimeout(() => {
          if (redirectTarget) {
            router.push(redirectTarget);
          } else if (isOnboarding) {
            router.push("/dashboard");
          } else {
            setSaveSuccess(false);
          }
        }, 800);
      } else {
        setErrorMessage("Failed to save profile changes to Supabase. Please retry.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    setPasswordFeedback(null);

    const res = await updatePassword(newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setPasswordFeedback("Password updated successfully!");
      setTimeout(() => {
        setPasswordModalOpen(false);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordFeedback(null);
      }, 1200);
    } else {
      setPasswordFeedback(res.error || "Failed to update password.");
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setPasswordLoading(true);
    const res = await resetPasswordEmail(user.email);
    setPasswordLoading(false);
    if (res.success) {
      setPasswordFeedback("Password reset link dispatched to your email!");
    } else {
      setPasswordFeedback(res.error || "Failed to send reset link.");
    }
  };

  const handleDeleteAccountSubmit = async () => {
    if (deleteConfirmationInput !== "DELETE") {
      return;
    }
    setIsDeleting(true);
    await deleteAccount();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 pt-4 px-3 sm:px-6 lg:px-8 bg-[#FDFBF9] dark:bg-[#0B0D13]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Onboarding Welcome Banner */}
        {isOnboarding && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/5 border border-orange-300 dark:border-orange-500/30 shadow-xs animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Account Registered Successfully</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome to AscendX! Complete Your Profile
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Tailor your adaptive mock interview evaluations by configuring your target role, experience level, and core tech stack before entering the dashboard.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline underline-offset-2"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regular Header */}
        {!isOnboarding && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Candidate Profile & Account Settings</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Candidate Profile & Calibration
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Ground the AI interviewer with your competencies, seniority, and target company goals.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/interview/new")}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Practice Interview</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
                title="Sign out of AscendX"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Feedback Notifications */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile successfully updated and synced to Supabase!</span>
          </div>
        )}

        {/* Main Profile Configuration Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-8">
          {/* 1. Avatar Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              <span>1. Profile Avatar & Visual Representation</span>
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-[#1C2230]/60 border border-slate-200/80 dark:border-slate-800">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500 shadow-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80";
                      }}
                    />
                  ) : (
                    <span className="text-2xl font-black text-slate-700 dark:text-slate-200">
                      {displayName.charAt(0).toUpperCase() || "A"}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 flex-1 w-full">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Select a preset profile avatar or enter a custom image URL:
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        setIsCustomAvatar(false);
                      }}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                        avatarUrl === preset.url && !isCustomAvatar
                          ? "border-orange-500 scale-110 shadow-md ring-2 ring-orange-500/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-slate-400 opacity-80 hover:opacity-100"
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
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                      isCustomAvatar
                        ? "bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Custom URL</span>
                  </button>
                </div>

                {isCustomAvatar && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <input
                      id="profile-avatar-url-input"
                      type="url"
                      placeholder="https://example.com/your-image.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Resume Upload & AI Grounding Engine */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-orange-500" />
                <span>2. Resume Upload & AI Grounding Pipeline</span>
              </div>
              <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powers Interview Personalization
              </span>
            </label>

            <ResumeManager onParsedSuccess={handleResumeParsed} />
          </div>

          {/* 3. Identity & Contact */}
          <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-500" />
              <span>3. Basic Information & Target Engineering Role</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Display / Full Name
                </label>
                <input
                  id="profile-display-name-input"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Registered Email Address
                </label>
                <input
                  id="profile-email-input"
                  type="email"
                  disabled
                  value={user?.email || "candidate@example.com"}
                  className="w-full px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Target Engineering Role</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Calibrates AI interviewer persona & technical evaluation rubric
                </span>
              </label>
              <input
                id="profile-target-role-input"
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Staff Distributed Systems Engineer"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
              />
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {POPULAR_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      targetRole === role
                        ? "bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400 font-semibold"
                        : "bg-slate-100/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Seniority / Experience Level */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              <span>3. Seniority & Interview Calibration Depth</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EXPERIENCE_LEVELS.map((lvl) => {
                const isSelected = experienceLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500/60 ring-2 ring-orange-500/20 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      {lvl.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {lvl.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Preferred Format & Language */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-orange-500" />
              <span>4. Interview Format & Language Defaults</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Coding Language
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setPreferredLanguage(lang)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                        preferredLanguage === lang
                          ? "bg-orange-600 text-white border-orange-600 font-bold shadow-xs"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Default Interview Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "technical", label: "Technical Coding" },
                    { id: "system_design", label: "System Design" },
                    { id: "behavioral", label: "Behavioral (STAR)" },
                    { id: "mixed", label: "Full-Loop Adaptive" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPreferredInterviewType(m.id)}
                      className={`text-xs p-2.5 rounded-xl border text-center font-medium transition-all ${
                        preferredInterviewType === m.id
                          ? "bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-300 font-bold"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Goals & Target Companies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-orange-500" />
                <span>Interview Goals</span>
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-orange-500" />
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
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
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

          {/* 6. Tech Stack & Core Competencies */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-orange-500" />
              <span>6. Core Tech Stack & Focus Areas</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {TECH_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-orange-600 text-white border-orange-600 font-semibold shadow-xs"
                        : "bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Bio / Career Summary */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>7. Candidate Background & Interview Pitch</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">
                {bio.length}/500 chars
              </span>
            </label>
            <textarea
              id="profile-bio-textarea"
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight previous companies, architectural achievements, or specific technical topics you'd like the AI interviewer to probe..."
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* AI Calibration Insight Card */}
          <div className="p-5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-900 dark:text-orange-300">
              <Cpu className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Real-Time AI Interview Calibration Engine</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Configured for <strong>{targetRole}</strong> (
              <span className="capitalize">{experienceLevel}</span>) in <strong>{preferredLanguage}</strong>. The AI interviewer will calibrate its questioning strategy accordingly: behavioral questions follow the STAR framework with depth on engineering decisions, while technical questions target {selectedSkills.slice(0, 3).join(", ")} failure modes and trade-offs.
            </p>
          </div>

          {/* 8. Granular Consent Management & Data Governance */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>8. Granular Consent & Data Governance</span>
            </label>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1C2230]/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Data Collection & Processing Consents</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Configure upfront consent gates and toggles for sensitive candidate data processing. All video and audio streams are processed locally with privacy-first guarantees.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resumeConsent}
                    onChange={(e) => setResumeConsent(e.target.checked)}
                    className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Resume Parsing & Storage</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Allow AI extraction and vector indexing of resume contents.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceConsent}
                    onChange={(e) => setVoiceConsent(e.target.checked)}
                    className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Voice Recording & Telemetry</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Speech-to-text transcription and confidence analysis.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webcamConsent}
                    onChange={(e) => setWebcamConsent(e.target.checked)}
                    className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Webcam Gaze & Engagement</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Local gaze orientation and head posture estimation.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={peerBenchmarkConsent}
                    onChange={(e) => setPeerBenchmarkConsent(e.target.checked)}
                    className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Anonymized Peer Benchmarks</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Contribute anonymized session scores to global percentiles.</span>
                  </div>
                </label>
              </div>

              {/* Data Export Archive & AI Limitation Disclosures */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Personal Data Archive Export</span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Download a complete JSON archive of your profile, interview metrics, and consents.</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportDataArchive}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Data Archive</span>
                </button>
              </div>

              {/* AI Limitation Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>AI Evaluation Transparency & Limitations Disclaimer</span>
                </div>
                <p>
                  Scores, rubrics, and feedback generated by the platform are non-binding AI estimates designed for mock interview coaching and skill refinement. They do not constitute official employment evaluations or guarantee hiring outcomes.
                </p>
              </div>
            </div>
          </div>

          {/* 9. Account & Security Settings */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-500" />
              <span>9. Account Security & Privacy</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1C2230]/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-orange-500" />
                    <span>Password & Authentication</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Update your password directly or request a password reset email to your registered address.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordModalOpen(true);
                      setPasswordFeedback(null);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 shadow-2xs"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={passwordLoading}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Candidate Account</span>
                  </h4>
                  <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                    Permanently delete your candidate profile, interview histories, and analytics from Supabase.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Return to Dashboard
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="profile-save-btn"
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>

              <button
                id="profile-save-and-practice-btn"
                type="button"
                onClick={() => handleSave(isOnboarding ? "/dashboard" : "/interview/new")}
                disabled={isSaving}
                className="flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <span>{isOnboarding ? "Save & Launch Dashboard" : "Save & Practice"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Change Password
              </h3>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passwordFeedback.includes("success") || passwordFeedback.includes("dispatched")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300"
                }`}
              >
                <span>{passwordFeedback}</span>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#151922] border border-rose-300 dark:border-rose-900/60 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Confirm Account Deletion</span>
              </h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action is permanent and cannot be undone. All your mock interview recordings, session transcripts, analytical performance scores, and personalized calibration data will be purged.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Type <span className="text-rose-600 font-mono">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500/40"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationInput !== "DELETE" || isDeleting}
                onClick={handleDeleteAccountSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl shadow-xs"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
