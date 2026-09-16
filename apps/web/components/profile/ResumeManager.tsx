"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  ExternalLink,
  Code2,
  Briefcase,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Cpu,
  Award,
  Zap,
  Check,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ResumeParsedData } from "@/lib/types/database.types";
import Link from "next/link";

interface ResumeManagerProps {
  onParsedSuccess?: (parsedData: ResumeParsedData) => void;
}

export function ResumeManager({ onParsedSuccess }: ResumeManagerProps) {
  const { user, updateUserProfile, refreshProfile } = useAuth();

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [expandedSection, setExpandedSection] = useState<string>("projects");
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resumeData = (user as any)?.resume_data as ResumeParsedData | null;
  const resumeFilename = (user as any)?.resume_filename || (user as any)?.user_metadata?.resume_filename;
  const resumeParsedAt = (user as any)?.resume_parsed_at || (user as any)?.user_metadata?.resume_parsed_at;

  const uploadSteps = [
    "Validating PDF file & preparing buffer...",
    "Securing file to Supabase Storage...",
    "Gemini 3.8 Flash extracting projects & metrics...",
    "Structuring skills, experiences & education...",
    "Grounding AI Mock Interviewer with candidate evidence...",
  ];

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setUploadError("Please upload a standard PDF resume file (.pdf).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit. Please upload a smaller PDF.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadStep(0);

    // Progressive step simulation for UX while Gemini processes
    const stepInterval = setInterval(() => {
      setUploadStep((prev) => (prev < uploadSteps.length - 1 ? prev + 1 : prev));
    }, 1200);

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

      clearInterval(stepInterval);

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to process resume");
      }

      setUploadStep(4);

      // Update Auth context and local state
      if (updateUserProfile && json.resumeData) {
        await updateUserProfile({
          resume_url: json.resumeUrl,
          resume_filename: json.fileName,
          resume_parsed_at: json.parsedAt,
          resume_data: json.resumeData,
          target_role: json.resumeData.headline || (user as any)?.target_role,
        });
      }

      setSuccessMessage("Resume successfully parsed and grounded into your AI Interview profile!");
      if (onParsedSuccess) {
        onParsedSuccess(json.resumeData);
      }
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error("[ResumeManager] Upload error:", err);
      setUploadError(err?.message || "An error occurred while uploading and parsing your resume.");
    } finally {
      setIsUploading(false);
      setUploadStep(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedText.trim() || pastedText.length < 50) {
      setUploadError("Please paste at least 50 characters of resume text.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadStep(1);

    const stepInterval = setInterval(() => {
      setUploadStep((prev) => (prev < uploadSteps.length - 1 ? prev + 1 : prev));
    }, 1000);

    try {
      const res = await fetch("/api/user/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: pastedText,
          filename: "Pasted_Resume_Text.pdf",
          userId: user?.id,
          isPdf: false,
        }),
      });

      clearInterval(stepInterval);

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to parse text");
      }

      setUploadStep(4);

      if (updateUserProfile && json.resumeData) {
        await updateUserProfile({
          resume_url: json.resumeUrl,
          resume_filename: json.fileName,
          resume_parsed_at: json.parsedAt,
          resume_data: json.resumeData,
          target_role: json.resumeData.headline || (user as any)?.target_role,
        });
      }

      setPastedText("");
      setSuccessMessage("Resume text parsed and candidate profile grounded successfully!");
      if (onParsedSuccess) {
        onParsedSuccess(json.resumeData);
      }
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      clearInterval(stepInterval);
      setUploadError(err?.message || "Failed to parse pasted resume text.");
    } finally {
      setIsUploading(false);
      setUploadStep(0);
    }
  };

  const handleLoadSampleResume = async () => {
    setIsUploading(true);
    setUploadStep(1);
    setUploadError(null);

    try {
      const res = await fetch("/api/user/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: `Alex Rivera - Senior Full-Stack & Distributed Systems Engineer. 5+ years experience building high-scale real-time systems. Languages: TypeScript, Go, Python, SQL. Frameworks: React, Next.js, Node.js. Projects: 1. Distributed Event Streaming Engine (Kafka, Go, PostgreSQL, Redis) - 120,000 events/sec, reduced P99 latency by 58%. 2. Real-Time Collaborative Code Studio (CRDTs, WebSockets, Next.js) - 50 concurrent editors per room with <15ms sync latency. Work: Senior Engineer at Apex Cloud Systems (2023-Present) - Decreased P99 API latency by 42%, scaled system to 15M daily requests. Education: B.S. in Computer Science, UC Berkeley.`,
          filename: "Alex_Rivera_Sample_Resume.pdf",
          userId: user?.id,
          isPdf: false,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Sample load failed");

      if (updateUserProfile && json.resumeData) {
        await updateUserProfile({
          resume_url: json.resumeUrl,
          resume_filename: json.fileName,
          resume_parsed_at: json.parsedAt,
          resume_data: json.resumeData,
          target_role: json.resumeData.headline || "Senior Full-Stack Engineer",
        });
      }

      setSuccessMessage("Sample verified engineering resume loaded and grounded successfully!");
      if (onParsedSuccess) onParsedSuccess(json.resumeData);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setUploadError(err?.message || "Could not load sample resume.");
    } finally {
      setIsUploading(false);
      setUploadStep(0);
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm("Are you sure you want to remove your resume and candidate grounding context?")) {
      return;
    }

    setIsDeleting(true);
    try {
      if (user?.id) {
        await fetch("/api/user/resume/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
      }

      if (updateUserProfile) {
        await updateUserProfile({
          resume_url: null,
          resume_filename: null,
          resume_parsed_at: null,
          resume_data: null,
        });
      }

      setSuccessMessage("Resume successfully removed from your profile.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("[ResumeManager] Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div id="resume-manager-container" className="space-y-6">
      {/* Active Grounding Status Banner */}
      {resumeData ? (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 md:p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/50">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {resumeFilename || "Candidate Resume Grounded"}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3" />
                    Interviewer Grounded
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {resumeParsedAt
                    ? `Parsed & structured on ${new Date(resumeParsedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
                    : "Ready for personalized mock interview questions & code follow-ups"}
                  {" • "}
                  <span className="text-emerald-400 font-medium">
                    {resumeData.projects?.length || 0} projects, {resumeData.experiences?.length || 0} roles extracted
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <button
                id="reupload-resume-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Replace PDF
              </button>
              <button
                id="delete-resume-btn"
                type="button"
                onClick={handleDeleteResume}
                disabled={isDeleting}
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-800/60 rounded-lg transition-colors"
                title="Delete Resume"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Error & Success Messages */}
      {uploadError && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Box (Visible if no resume OR if user is replacing) */}
      {!resumeData && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Upload Your Resume</h2>
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                Upload your PDF resume to automatically extract your technical projects, tech stack, and quantifiable metrics.
                The AI Mock Interviewer will directly ground interview questions on your verified background.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-neutral-950/80 border border-neutral-800 rounded-xl self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "upload"
                    ? "bg-neutral-800 text-white shadow"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                PDF Upload
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "paste"
                    ? "bg-neutral-800 text-white shadow"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {activeTab === "upload" ? (
            <div>
              <div
                id="resume-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/30 scale-[0.99]"
                    : "border-neutral-700/80 hover:border-neutral-600 bg-neutral-950/40 hover:bg-neutral-950/60"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileSelect(files[0]);
                    }
                  }}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center py-4 space-y-4 max-w-md w-full">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 animate-pulse">
                      <Cpu className="w-7 h-7 animate-spin text-orange-400" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium text-white">
                        {uploadSteps[uploadStep] || "Processing resume..."}
                      </p>
                      <p className="text-xs text-neutral-400">
                        AI pipeline extracting projects, metrics & technical skills
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${((uploadStep + 1) / uploadSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-neutral-300 mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7 text-orange-400" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">
                      Click to upload or drag & drop your PDF resume
                    </p>
                    <p className="text-xs text-neutral-400 max-w-sm mb-4">
                      Supports PDF up to 10MB. We extract your actual projects, technologies, and achievements for AI interview calibration.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        Gemini 3.8 Flash Parser
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium">
                        <Layers className="w-3.5 h-3.5" />
                        Supabase Storage
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Sample resume button */}
              <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 px-1">
                <span>Want to test without a PDF?</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSampleResume();
                  }}
                  disabled={isUploading}
                  className="text-orange-400 hover:text-orange-300 font-medium hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Load Sample Staff Engineer Resume
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the raw text of your resume here (include work history, flagship projects, and technical skills)..."
                rows={8}
                className="w-full rounded-xl bg-neutral-950/80 border border-neutral-800 p-4 text-xs font-mono text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all resize-y"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLoadSampleResume}
                  disabled={isUploading}
                  className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Insert Sample Text
                </button>
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  disabled={isUploading || pastedText.length < 50}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-orange-950/40 transition-all flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parsing Resume Text...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Parse & Ground Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input for Re-uploading when already grounded */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            handleFileSelect(files[0]);
          }
        }}
      />

      {/* Extracted Structured Resume Evidence Display */}
      {resumeData && (
        <div className="space-y-5">
          {/* Grounding Summary Briefing Card */}
          {resumeData.grounding_summary && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 md:p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  AI Interviewer Executive Briefing
                </h3>
              </div>
              <p className="text-sm text-neutral-200 leading-relaxed bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 font-normal">
                {resumeData.grounding_summary}
              </p>

              {/* Quantifiable highlights row */}
              {resumeData.quantifiable_highlights && resumeData.quantifiable_highlights.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {resumeData.quantifiable_highlights.slice(0, 4).map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-neutral-300 bg-neutral-950/40 border border-neutral-800/50 rounded-lg p-2.5"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categorized Skills Matrix */}
          {resumeData.skills && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 md:p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Code2 className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Extracted Technical Skills Matrix
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500">Auto-categorized by Gemini</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resumeData.skills.languages?.length > 0 && (
                  <div className="space-y-2 bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Languages
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills.languages.map((lang, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-blue-950/40 text-blue-300 border border-blue-800/40 text-xs font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.skills.frameworks?.length > 0 && (
                  <div className="space-y-2 bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Frameworks & Libs
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills.frameworks.map((fw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 text-xs font-medium"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.skills.databases?.length > 0 && (
                  <div className="space-y-2 bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Databases & Stores
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills.databases.map((db, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-xs font-medium"
                        >
                          {db}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.skills.cloud_and_devops?.length > 0 && (
                  <div className="space-y-2 bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Cloud & DevOps
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills.cloud_and_devops.map((cloud, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/40 text-xs font-medium"
                        >
                          {cloud}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.skills.tools_and_architecture?.length > 0 && (
                  <div className="space-y-2 bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3.5 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Architecture & Design Concepts
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills.tools_and_architecture.map((arch, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/40 text-xs font-medium"
                        >
                          {arch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flagship Projects Section */}
          {resumeData.projects && resumeData.projects.length > 0 && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 md:p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Extracted Candidate Projects ({resumeData.projects.length})
                  </h3>
                </div>
                <span className="text-[11px] text-orange-400 font-medium">
                  Used for Code & Architecture Questions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumeData.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-4.5 flex flex-col justify-between hover:border-neutral-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-semibold text-white">{proj.name}</h4>
                        {proj.role && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 shrink-0">
                            {proj.role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed mb-3">{proj.description}</p>

                      {/* Tech Chips */}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {proj.technologies.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Metrics & Impact */}
                      {proj.metrics_and_impact && proj.metrics_and_impact.length > 0 && (
                        <div className="space-y-1 text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-2.5">
                          {proj.metrics_and_impact.map((m, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px]">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {proj.github_or_link && (
                      <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center text-[11px] text-neutral-400">
                        <ExternalLink className="w-3 h-3 mr-1 text-neutral-500" />
                        <span className="truncate">{proj.github_or_link}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience Section */}
          {resumeData.experiences && resumeData.experiences.length > 0 && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 md:p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Professional Experience & Responsibilities
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500">Used for STAR Behavioral Questions</span>
              </div>

              <div className="space-y-4">
                {resumeData.experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{exp.role}</h4>
                        <p className="text-xs text-orange-400 font-medium">
                          {exp.company}
                          {exp.location ? ` • ${exp.location}` : ""}
                        </p>
                      </div>
                      {exp.duration && (
                        <span className="text-[11px] text-neutral-400 font-mono bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 self-start sm:self-auto">
                          {exp.duration}
                        </span>
                      )}
                    </div>

                    {/* Quantifiable Metrics */}
                    {exp.quantifiable_metrics && exp.quantifiable_metrics.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {exp.quantifiable_metrics.map((qm, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/40 text-amber-200"
                          >
                            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                            {qm}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Responsibilities */}
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <ul className="space-y-1 text-xs text-neutral-300 pt-1">
                        {exp.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-neutral-500 mt-1">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education & Certifications */}
          {((resumeData.education && resumeData.education.length > 0) || (resumeData.certifications && resumeData.certifications.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumeData.education && resumeData.education.length > 0 && (
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Education
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="text-xs space-y-0.5">
                        <p className="font-semibold text-white">
                          {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ""}
                        </p>
                        <p className="text-neutral-400">{edu.institution}</p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                          {edu.graduation_year && <span>{edu.graduation_year}</span>}
                          {edu.gpa_or_honors && <span>• {edu.gpa_or_honors}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.certifications && resumeData.certifications.length > 0 && (
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Certifications & Badges
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {resumeData.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950/40 border border-neutral-800/60 rounded-lg p-2.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Launch Grounded Mock Interview CTA */}
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Ready to practice with your grounded resume?
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                The AI interviewer will test your actual systems, projects, and architecture trade-offs.
              </p>
            </div>
            <Link
              href="/interview"
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-orange-950/50 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              Start Grounded Interview
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
