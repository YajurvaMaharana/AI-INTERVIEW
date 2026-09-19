"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Building2,
  Tag,
  ListChecks,
} from "lucide-react";
import type { JobDescriptionParsedData } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

interface JobDescriptionInputProps {
  parsedJD: JobDescriptionParsedData | null;
  onJDParsed: (data: JobDescriptionParsedData | null, rawText: string) => void;
  onAutoFillRole?: (role: string, difficulty?: "Easy" | "Medium" | "Hard") => void;
}

const SAMPLE_JDS = [
  {
    title: "Staff Distributed Systems Engineer @ Fintech",
    text: `Job Title: Staff Distributed Systems Engineer
Company: Stripe (Financial Infrastructure)
Seniority: Staff / Principal

About the Role:
We are looking for a Staff Distributed Systems Engineer to design, scale, and operate our global real-time ledger and transaction processing pipeline handling over 100,000 requests per second with 99.999% uptime.

Core Responsibilities:
- Lead the architecture and end-to-end implementation of multi-region fault-tolerant payment settlement engines.
- Optimize high-throughput event streaming architectures using Kafka, gRPC, and distributed consensus protocols.
- Drive database partitioning, sharding, and ACID transaction isolation guarantees across PostgreSQL and distributed key-value stores.
- Mentor senior engineers, author comprehensive RFCs, and establish operational excellence standards for zero-downtime deployments.

Required Qualifications:
- 7+ years of experience building mission-critical distributed backend systems in Go, Rust, Java, or C++.
- Deep expertise in concurrency models, distributed transactions (2PC, Sagas), and database internals.
- Proven track record diagnosing deep Linux kernel/network bottlenecks, thread contention, and replication lag.
- Strong knowledge of Kafka, Redis, PostgreSQL, Kubernetes, and AWS/GCP cloud platforms.

Preferred Skills:
- Experience with Raft/Paxos consensus algorithms and high-frequency financial settlement.
- Prior leadership across multi-team platform architecture initiatives.`,
  },
  {
    title: "Senior Full-Stack Engineer (React & Node.js)",
    text: `Role: Senior Full-Stack Software Engineer
Company: Linear / High-Growth SaaS
Seniority: Senior

Role Overview:
Join our core product team building lightning-fast collaborative web applications. You will bridge frontend performance engineering with robust microservices and real-time synchronization engines.

Responsibilities:
- Build ultra-responsive, accessible UI components with Next.js, React 19, TypeScript, and Tailwind CSS.
- Design real-time synchronization engines using WebSockets, WebRTC, and CRDTs for multi-user collaboration.
- Maintain and scale GraphQL and REST APIs backed by Node.js, PostgreSQL, and Redis.
- Establish robust CI/CD pipelines, automated testing, and web performance tracking (Core Web Vitals).

Requirements:
- 5+ years of software development experience with modern TypeScript/JavaScript ecosystems.
- Mastery of React internals, state management, bundle optimization, and optimistic UI rendering.
- Strong backend fundamentals: relational database modeling (PostgreSQL), indexing, and Redis caching.
- Excellent communication and product intuition with a keen eye for micro-interactions and UX craft.`,
  },
];

export default function JobDescriptionInput({
  parsedJD,
  onJDParsed,
  onAutoFillRole,
}: JobDescriptionInputProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [jdText, setJdText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showFullRubric, setShowFullRubric] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse JD
  async function handleParse(textOverride?: string, fileOverride?: File) {
    const textToSubmit = textOverride !== undefined ? textOverride : jdText;
    const fileToSubmit = fileOverride !== undefined ? fileOverride : selectedFile;

    if (!textToSubmit.trim() && !fileToSubmit) {
      setError("Please paste the job description text or upload a document file.");
      return;
    }

    setError(null);
    setIsParsing(true);
    setParsingStep("Analyzing Job Description structure...");

    try {
      const stepTimer1 = setTimeout(() => {
        setParsingStep("Extracting mandatory skills & critical keywords...");
      }, 1000);

      const stepTimer2 = setTimeout(() => {
        setParsingStep("Synthesizing interviewer evaluation rubric & calibration...");
      }, 2200);

      let res: Response;

      if (fileToSubmit) {
        const formData = new FormData();
        formData.append("file", fileToSubmit);
        if (textToSubmit.trim()) {
          formData.append("rawText", textToSubmit.trim());
        }
        res = await fetch("/api/interviews/jd/parse", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/interviews/jd/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: textToSubmit.trim() }),
        });
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        const errText = await res.text().catch(() => "");
        console.warn("[JobDescriptionInput] Non-JSON or error response from parse API, using client fallback:", errText.slice(0, 200));
        
        // Client-side fallback extraction so user experiences zero friction
        const extracted = generateClientFallbackJD(textToSubmit || "Software Engineer");
        onJDParsed(extracted, textToSubmit || fileToSubmit?.name || "Uploaded JD");

        if (onAutoFillRole && extracted.job_title) {
          onAutoFillRole(extracted.job_title, "Medium");
        }
        return;
      }

      const result = await res.json();
      const extracted: JobDescriptionParsedData = result.data;

      onJDParsed(extracted, textToSubmit || fileToSubmit?.name || "Uploaded JD");

      // Auto-fill target role in setup form
      if (onAutoFillRole && extracted.job_title) {
        let suggestedDifficulty: "Easy" | "Medium" | "Hard" = "Medium";
        if (
          extracted.seniority_level.toLowerCase().includes("staff") ||
          extracted.seniority_level.toLowerCase().includes("principal") ||
          extracted.seniority_level.toLowerCase().includes("lead")
        ) {
          suggestedDifficulty = "Hard";
        } else if (
          extracted.seniority_level.toLowerCase().includes("junior") ||
          extracted.seniority_level.toLowerCase().includes("entry")
        ) {
          suggestedDifficulty = "Easy";
        }
        onAutoFillRole(extracted.job_title, suggestedDifficulty);
      }
    } catch (err: any) {
      console.warn("[JobDescriptionInput] Network/parse exception, using client fallback:", err);
      const extracted = generateClientFallbackJD(textToSubmit || "Software Engineer");
      onJDParsed(extracted, textToSubmit || fileToSubmit?.name || "Uploaded JD");
      if (onAutoFillRole && extracted.job_title) {
        onAutoFillRole(extracted.job_title, "Medium");
      }
    } finally {
      setIsParsing(false);
      setParsingStep("");
    }
  }

  function generateClientFallbackJD(rawText: string): JobDescriptionParsedData {
    const textLower = rawText.toLowerCase();
    const detectedSkills: string[] = [];
    const skillKeywords = [
      'typescript', 'react', 'next.js', 'node.js', 'python', 'go', 'golang', 'java',
      'rust', 'postgresql', 'mysql', 'mongodb', 'redis', 'kafka', 'docker', 'kubernetes',
      'aws', 'gcp', 'azure', 'graphql', 'rest', 'grpc', 'microservices', 'distributed systems',
      'system design', 'ci/cd', 'terraform'
    ];
    for (const kw of skillKeywords) {
      if (textLower.includes(kw)) {
        detectedSkills.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }

    let seniority = 'Senior';
    if (textLower.includes('staff') || textLower.includes('principal')) seniority = 'Staff/Principal';
    else if (textLower.includes('lead') || textLower.includes('manager')) seniority = 'Lead/Manager';
    else if (textLower.includes('junior') || textLower.includes('entry')) seniority = 'Junior';

    const title = textLower.includes('backend') ? `${seniority} Backend Engineer` :
                  textLower.includes('frontend') ? `${seniority} Frontend Engineer` :
                  textLower.includes('full') ? `${seniority} Full-Stack Engineer` : `${seniority} Software Engineer`;

    return {
      job_title: title,
      company_name: 'Target Tech Company',
      seniority_level: seniority,
      domain_or_industry: 'Software Engineering',
      required_skills: detectedSkills.length > 0 ? detectedSkills : ['TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
      preferred_skills: ['Cloud Architecture', 'Distributed Systems', 'CI/CD'],
      core_responsibilities: [
        'Design, build, and scale reliable backend and frontend features.',
        'Collaborate across cross-functional engineering teams.',
        'Ensure high availability, test coverage, and performance.'
      ],
      critical_keywords: detectedSkills.length > 0 ? detectedSkills : ['Architecture', 'Scalability', 'Reliability'],
      evaluation_rubric_focus: [
        'System design architecture and scalability trade-offs',
        'Clean code, modularity, and error handling',
        'STAR behavioral examples and cross-functional communication'
      ],
      calibration_summary: `Calibrated interview for ${title}. Focus on architecture, concurrency, and real-world system trade-offs.`,
    };
  }

  function handleFileUpload(file: File) {
    setSelectedFile(file);
    setError(null);

    // If it's a plain text file, read into textarea
    if (file.type.includes("text/plain") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || "";
        setJdText(text);
      };
      reader.readAsText(file);
    }

    handleParse(undefined, file);
  }

  function handleClear() {
    setJdText("");
    setSelectedFile(null);
    setError(null);
    onJDParsed(null, "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Section Title & Badge ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-[#E8602E]" />
          <span>Target Job Description (JD) Calibration</span>
        </label>
        <span className="text-[11px] font-semibold text-[#E8602E] bg-[#FFF6F0] dark:bg-[#2A1D17] px-2.5 py-0.5 rounded-full border border-[#FDBA74]/60 dark:border-[#EA580C]/40">
          Tailors All AI Questions & Scoring
        </span>
      </div>

      {/* ── Parsed Active State Banner ── */}
      {parsedJD ? (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#181E29] border-2 border-emerald-500/80 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold tracking-wide uppercase shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>JD Calibrated</span>
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {parsedJD.seniority_level} Level
                </span>
                {parsedJD.company_name && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FFF6F0] dark:bg-[#2A1D17] text-[#C2410C] dark:text-[#FB923C] border border-[#FDBA74]/50">
                    <Building2 className="w-3 h-3 inline mr-1" />
                    {parsedJD.company_name}
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white pt-1">
                {parsedJD.job_title}
              </h3>
              {parsedJD.domain_or_industry && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Domain: <span className="font-semibold text-slate-700 dark:text-slate-300">{parsedJD.domain_or_industry}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Remove calibrated JD"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Interview Calibration Directive */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <Cpu className="w-3.5 h-3.5 text-[#E8602E]" />
              <span>Active Interviewer Directive:</span>
            </div>
            <p className="text-[11px] leading-relaxed italic text-slate-600 dark:text-slate-400">
              &ldquo;{parsedJD.calibration_summary}&rdquo;
            </p>
          </div>

          {/* Extracted Required Skills Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#E87A42]" />
                Target Skills Being Tested ({parsedJD.required_skills?.length || 0}):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedJD.required_skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                >
                  {skill}
                </span>
              ))}
              {parsedJD.critical_keywords?.slice(0, 4).map((kw, idx) => (
                <span
                  key={`kw-${idx}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FFF6F0] dark:bg-[#2A1D17] text-[#C2410C] dark:text-[#FB923C] border border-[#FDBA74]/50"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Collapsible Rubric & Responsibilities Breakdown */}
          <div>
            <button
              type="button"
              onClick={() => setShowFullRubric(!showFullRubric)}
              className="text-xs font-bold text-[#E8602E] hover:text-[#d85322] flex items-center gap-1 transition-colors"
            >
              <span>{showFullRubric ? "Hide Full Calibration Rubric" : "View Extracted Responsibilities & Rubric"}</span>
              {showFullRubric ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showFullRubric && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
                {parsedJD.core_responsibilities?.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5 text-slate-500" />
                      Core Role Responsibilities:
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pl-4 list-disc">
                      {parsedJD.core_responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedJD.evaluation_rubric_focus?.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      Evaluation Rubric Criteria:
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pl-4 list-disc">
                      {parsedJD.evaluation_rubric_focus.map((crit, i) => (
                        <li key={i}>{crit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Input Card (Paste / Upload Tabs) ── */
        <div className="bg-white dark:bg-[#181E29] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          
          {/* Tabs header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#141822] border border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer",
                  activeTab === "paste"
                    ? "bg-white dark:bg-[#1E2533] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Text</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer",
                  activeTab === "upload"
                    ? "bg-white dark:bg-[#1E2533] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                )}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            {/* Quick preset dropdown/pills */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Sample JDs:</span>
              {SAMPLE_JDS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setJdText(sample.text);
                    setActiveTab("paste");
                    handleParse(sample.text);
                  }}
                  className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#FFF6F0] dark:hover:bg-[#2A1D17] hover:text-[#C2410C] dark:hover:text-[#FB923C] border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  {sample.title.split("@")[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Paste Text */}
          {activeTab === "paste" && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the target job description here (e.g. Job Title, Requirements, Required Skills, Responsibilities, Architecture focus)..."
                  rows={5}
                  disabled={isParsing}
                  className={cn(
                    "w-full p-3.5 rounded-xl text-xs font-mono leading-relaxed transition-all duration-200 resize-y",
                    "bg-[#F9FAFC] dark:bg-[#141822] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans",
                    "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E8602E]/30 focus:border-[#E8602E]"
                  )}
                />
                {jdText.length > 0 && (
                  <div className="absolute bottom-2.5 right-3 text-[10px] font-medium text-slate-400 bg-white/80 dark:bg-[#141822]/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {jdText.length} characters
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  AscendX will extract key technical competencies, seniority rigor, and calibrate all questions.
                </p>

                <button
                  type="button"
                  onClick={() => handleParse()}
                  disabled={isParsing || !jdText.trim()}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-xs cursor-pointer",
                    "bg-[#E8602E] hover:bg-[#d85322] text-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Criteria...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse & Calibrate Interview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Upload Document */}
          {activeTab === "upload" && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2",
                  isDragOver
                    ? "border-[#E8602E] bg-[#FFF6F0] dark:bg-[#2A1D17]"
                    : "border-slate-200 dark:border-slate-800 bg-[#F9FAFC] dark:bg-[#141822] hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-10 h-10 rounded-2xl bg-[#FFF6F0] dark:bg-[#2A1D17] text-[#E8602E] flex items-center justify-center border border-[#FDBA74]/40">
                  <UploadCloud className="w-5 h-5" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedFile ? selectedFile.name : "Click to upload JD or drag and drop"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    PDF, TXT, MD or DOC files up to 10MB
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 truncate">
                    <FileText className="w-4 h-4 text-[#E87A42] shrink-0" />
                    <span className="truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleParse()}
                    disabled={isParsing}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8602E] text-white hover:bg-[#d85322] disabled:opacity-50"
                  >
                    {isParsing ? "Parsing..." : "Extract Criteria"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Live Progress Feedback State */}
          {isParsing && (
            <div className="p-3.5 rounded-xl bg-[#FFF6F0] dark:bg-[#2A1D17] border border-[#FDBA74]/60 dark:border-[#EA580C]/40 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-bold text-[#C2410C] dark:text-[#FB923C]">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E8602E]" />
                  <span>{parsingStep || "Processing with Gemini NLP Engine..."}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold">Analyzing</span>
              </div>
              <div className="w-full bg-orange-200 dark:bg-orange-950/60 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#E8602E] h-1.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
