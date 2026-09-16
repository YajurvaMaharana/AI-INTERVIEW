"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Briefcase,
  Sparkles,
  Check,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  Code2,
  Target,
  Terminal,
  Building2,
  Award,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

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

const EXPERIENCE_LEVELS = [
  { id: "junior", label: "Junior (0-2 yrs)" },
  { id: "mid", label: "Mid-Level (2-5 yrs)" },
  { id: "senior", label: "Senior (5-8 yrs)" },
  { id: "staff", label: "Staff / Principal (8+ yrs)" },
];

const AVAILABLE_SKILLS = [
  "TypeScript",
  "React / Next.js",
  "Node.js",
  "Python",
  "Go",
  "PostgreSQL",
  "System Design",
  "Docker / K8s",
  "AWS Cloud",
  "GraphQL",
  "Microservices",
  "Distributed Systems",
];

const LANGUAGES = [
  "TypeScript",
  "Python",
  "Go",
  "Java",
  "C++",
  "Rust",
  "JavaScript",
  "SQL",
];

export default function ProfileEditModal({
  isOpen,
  onClose,
  onSaved,
}: ProfileEditModalProps) {
  const { user, updateUserProfile } = useAuth();

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
  ]);
  const [customAvatarInput, setCustomAvatarInput] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
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
        "Software Engineer focused on high-performance distributed systems, clean architecture, and product scalability.";
      const currentAvatar =
        u.avatar_url || u.user_metadata?.avatar_url || AVATAR_PRESETS[0].url;
      const currentSkills =
        u.skills ||
        u.user_metadata?.skills || [
          "TypeScript",
          "React / Next.js",
          "System Design",
        ];
      const currentExp = u.experience_level || u.user_metadata?.experience_level || "senior";
      const currentType = u.preferred_interview_type || u.user_metadata?.preferred_interview_type || "mixed";
      const currentLang = u.preferred_language || u.user_metadata?.preferred_language || "TypeScript";

      setDisplayName(currentDisplayName);
      setTargetRole(currentRole);
      setBio(currentBio);
      setAvatarUrl(currentAvatar);
      setSelectedSkills(currentSkills);
      setExperienceLevel(currentExp);
      setPreferredInterviewType(currentType);
      setPreferredLanguage(currentLang);
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
      });

      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          if (onSaved) onSaved();
          onClose();
        }, 600);
      } else {
        setErrorMessage("Unable to update profile in Supabase. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="profile-edit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="profile-edit-modal-content"
        className="w-full max-w-xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Candidate Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ground your AI interviewer with your credentials and target role
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Profile updated successfully to Supabase!</span>
            </div>
          )}

          {/* Avatar Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Candidate Avatar</span>
              <button
                type="button"
                onClick={() => setCustomAvatarInput(!customAvatarInput)}
                className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <ImageIcon className="w-3 h-3" />
                <span>{customAvatarInput ? "Choose Preset" : "Custom Image URL"}</span>
              </button>
            </label>

            {customAvatarInput ? (
              <div className="space-y-2">
                <input
                  type="url"
                  id="modal-avatar-url-input"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                        isSelected
                          ? "border-orange-500 ring-2 ring-orange-500/30 scale-105"
                          : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-400"
                      }`}
                      title={preset.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-xs" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Candidate Display Name
            </label>
            <input
              type="text"
              id="modal-display-name-input"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Jordan Miller"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
            />
          </div>

          {/* Target Role & Seniority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Role
              </label>
              <input
                type="text"
                id="modal-target-role-input"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Experience Level
              </label>
              <select
                id="modal-exp-level-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
              >
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Language & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Primary Language
              </label>
              <select
                id="modal-pref-lang-select"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Interview Mode
              </label>
              <select
                id="modal-pref-type-select"
                value={preferredInterviewType}
                onChange={(e) => setPreferredInterviewType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
              >
                <option value="technical">Technical Coding</option>
                <option value="system_design">System Design</option>
                <option value="behavioral">Behavioral (STAR)</option>
                <option value="mixed">Full-Loop Adaptive</option>
              </select>
            </div>
          </div>

          {/* Core Technical Skills */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-orange-500" />
                <span>Core Technical Skills</span>
              </span>
              <span className="text-[11px] text-slate-400">{selectedSkills.length} selected</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-orange-600 text-white border-orange-600 shadow-xs font-semibold"
                        : "bg-slate-100/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio / Candidate Pitch */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Candidate Bio & Technical Strengths</span>
              <span className="text-[11px] text-slate-400">{bio.length}/500</span>
            </label>
            <textarea
              rows={3}
              id="modal-bio-input"
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your primary stack, years of experience, or past projects to help the AI tailor its probing questions..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              id="modal-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="modal-save-profile-btn"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
