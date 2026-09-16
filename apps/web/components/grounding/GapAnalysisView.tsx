"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  FileText,
  Target,
  ArrowRight,
  RefreshCw,
  Layers,
  Award,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bot,
  Sliders,
  Filter,
  Code2,
  BookOpen,
  Briefcase,
  Cpu,
  Flame,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ResumeParsedData, JobDescriptionParsedData } from "@/lib/types/database.types";
import type {
  GapAnalysisResult,
  StrongMatchItem,
  WeakAreaItem,
  MissingEvidenceItem,
} from "@/lib/types/gap-analysis.types";
import { generateDeterministicGapAnalysis } from "@/lib/services/gap-analysis.service";

interface GapAnalysisViewProps {
  initialResume?: ResumeParsedData | null;
  initialJD?: JobDescriptionParsedData | null;
}

export default function GapAnalysisView({
  initialResume,
  initialJD,
}: GapAnalysisViewProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Active filter tab: all | strong | weak | missing
  const [activeFilter, setActiveFilter] = useState<"all" | "strong" | "weak" | "missing">("all");
  const [activeSubTab, setActiveSubTab] = useState<"matrix" | "resume" | "jd">("matrix");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("fullstack");

  // Local state for candidate resume and target JD
  const [currentResume, setCurrentResume] = useState<ResumeParsedData | null>(
    initialResume || (user as any)?.resume_data || null
  );
  const [currentJD, setCurrentJD] = useState<JobDescriptionParsedData | null>(
    initialJD || (user as any)?.saved_jd_data || null
  );
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);

  // Preset scenarios
  const presets: Record<
    string,
    { label: string; resumeTitle: string; jdTitle: string; resume: ResumeParsedData; jd: JobDescriptionParsedData }
  > = {
    fullstack: {
      label: "Senior Full-Stack Engineer (Apex / Stripe Scale)",
      resumeTitle: "Alex Rivera — Senior Full-Stack (5 YOE)",
      jdTitle: "Senior Full-Stack & Distributed Systems Engineer",
      resume: {
        headline: "Senior Full-Stack & Distributed Systems Engineer",
        summary: "5+ years building distributed web applications, high-throughput WebSockets, and ACID PostgreSQL pipelines.",
        skills: {
          languages: ["TypeScript", "JavaScript", "Go", "Python", "SQL"],
          frameworks: ["React", "Next.js", "Node.js", "Express", "Tailwind CSS"],
          databases: ["PostgreSQL", "Redis", "Supabase"],
          cloud_and_devops: ["Docker", "AWS (S3, ECS, Lambda)", "CI/CD GitHub Actions"],
          tools_and_architecture: ["Microservices", "REST APIs", "WebSockets", "GraphQL", "System Design"],
        },
        projects: [
          {
            name: "Distributed Event Streaming Hub",
            description: "Scalable event-driven messaging service handling 120,000 WebSocket connections with sub-20ms latency.",
            technologies: ["TypeScript", "Node.js", "Redis Pub/Sub", "PostgreSQL", "Docker"],
            metrics_and_impact: ["Reduced P99 message delivery latency by 45%", "Scaled to 5M messages daily without downtime"],
          },
          {
            name: "Collaborative Real-Time Workspace",
            description: "CRDT-powered multi-user canvas with operational transforms and optimistic UI state synchronization.",
            technologies: ["React", "Next.js", "WebSockets", "Tailwind CSS"],
            metrics_and_impact: ["50 concurrent editors per room with <15ms sync latency"],
          },
        ],
        experiences: [
          {
            company: "TechFlow Systems",
            role: "Senior Software Engineer",
            duration: "2022 - Present",
            responsibilities: [
              "Architected cloud backend services and real-time streaming endpoints.",
              "Mentored 4 junior engineers and led quarterly architecture reviews.",
            ],
            achievements: ["Decreased AWS cloud operational cost by 32% via query optimization."],
            quantifiable_metrics: ["10M+ daily active requests", "99.99% service uptime SLA"],
            technologies: ["TypeScript", "Next.js", "PostgreSQL", "AWS"],
          },
        ],
        education: [
          {
            institution: "UC Berkeley",
            degree: "B.S. in Computer Science",
            graduation_year: "2019",
          },
        ],
        grounding_summary: "High-performing senior engineer with strong React, Node.js, and Redis experience, with growth areas in multi-region Kafka consensus.",
      },
      jd: {
        job_title: "Senior Full-Stack & Distributed Systems Engineer",
        company_name: "Apex Scale Cloud",
        seniority_level: "Senior",
        domain_or_industry: "Cloud Infrastructure & High-Scale Web Apps",
        required_skills: [
          "TypeScript",
          "React / Next.js",
          "Distributed Systems Design",
          "PostgreSQL & ACID Transactions",
          "High-Throughput Caching (Redis)",
          "REST & WebSocket Protocol Engineering",
        ],
        preferred_skills: [
          "Go / Rust",
          "Kubernetes Orchestration",
          "Kafka Event Streaming",
          "Multi-Region Database Replication",
          "Observability (Prometheus / Datadog)",
        ],
        core_responsibilities: [
          "Design and maintain low-latency APIs serving millions of concurrent requests.",
          "Lead technical architecture discussions, write RFCs, and drive zero-downtime migrations.",
          "Collaborate across product, design, and infrastructure teams to deliver high-impact features.",
        ],
        critical_keywords: ["CAP Theorem", "Eventual Consistency", "Sharding", "WebSockets", "P99 Latency", "Rate Limiting", "Idempotency"],
        evaluation_rubric_focus: [
          "Concurrency & Race Condition Mitigation",
          "System Design Scalability & Bottleneck Identification",
          "Code Modularity & Type Safety in TypeScript",
          "STAR Behavioral Communication & Ownership",
        ],
        calibration_summary: "Evaluate the candidate on high-scale distributed architecture, caching strategies, and handling edge-case failure modes.",
      },
    },
    staffBackend: {
      label: "Staff Distributed Backend Engineer (Datadog / Netflix Scale)",
      resumeTitle: "Jordan Chen — Senior Backend / Infra Engineer",
      jdTitle: "Staff Backend Infrastructure Engineer",
      resume: {
        headline: "Staff Backend & Distributed Infrastructure Engineer",
        summary: "7+ years designing distributed consensus engines, Raft protocols, and high-throughput data processing layers.",
        skills: {
          languages: ["Go", "Rust", "C++", "Python", "SQL"],
          frameworks: ["gRPC", "Protobuf", "Kafka", "Tokio"],
          databases: ["PostgreSQL", "Cassandra", "Redis", "CockroachDB"],
          cloud_and_devops: ["Kubernetes", "Terraform", "AWS", "Prometheus", "Envoy"],
          tools_and_architecture: ["Distributed Systems", "Raft Consensus", "LSM Trees", "CDC Pipelines"],
        },
        projects: [
          {
            name: "High-Throughput Distributed WAL Engine",
            description: "Custom Write-Ahead Log in Rust processing 850,000 writes/sec with zero disk fragmentation.",
            technologies: ["Rust", "Raft", "gRPC", "RocksDB"],
            metrics_and_impact: ["Achieved 99.999% data durability across 3 availability zones"],
          },
        ],
        experiences: [
          {
            company: "HyperScale Corp",
            role: "Lead Infrastructure Engineer",
            duration: "2021 - Present",
            responsibilities: ["Led cloud migration of 40+ microservices to Kubernetes with automated canary deployments."],
            achievements: ["Reduced cross-region networking egress costs by $180k/yr."],
            quantifiable_metrics: ["850k ops/sec", "<2ms P99 latency"],
            technologies: ["Go", "Kubernetes", "Kafka", "Prometheus"],
          },
        ],
        education: [
          {
            institution: "Stanford University",
            degree: "M.S. in Computer Science",
            graduation_year: "2018",
          },
        ],
        grounding_summary: "Deep infrastructure expertise in consensus, storage engines, and low-level concurrency optimization.",
      },
      jd: {
        job_title: "Staff Backend Infrastructure Engineer",
        company_name: "Nexus Distributed Cloud",
        seniority_level: "Staff/Principal",
        domain_or_industry: "Distributed Storage & High-Concurrency Systems",
        required_skills: [
          "Go or Rust Mastery",
          "Distributed Consensus (Raft / Paxos)",
          "gRPC & Binary Serialization",
          "Kubernetes & Service Mesh (Envoy)",
          "High-Scale Telemetry & Profiling",
        ],
        preferred_skills: [
          "Linux Kernel eBPF Tuning",
          "Zero-Copy Memory Networking (io_uring)",
          "Distributed Transaction Coordinators (2PC)",
        ],
        core_responsibilities: [
          "Architect the next-generation multi-tenant storage engine with microsecond latency guarantees.",
          "Set company-wide architectural standards, conduct principal-level system reviews, and mentor team leads.",
        ],
        critical_keywords: ["Raft", "WAL", "eBPF", "gRPC", "LSM Tree", "P99.9 SLA", "Linearizability"],
        evaluation_rubric_focus: [
          "Deep understanding of distributed consensus trade-offs",
          "Ability to reason through split-brain and network partition failure scenarios",
          "Staff-level leadership, cross-organizational influence, and clear technical communication",
        ],
        calibration_summary: "Challenge candidate on edge-case partition scenarios, linearizable reads, and cross-AZ write latency mitigation.",
      },
    },
    frontendArch: {
      label: "Frontend & UI Architect (Vercel / Figma Scale)",
      resumeTitle: "Morgan Lee — Principal Frontend Engineer",
      jdTitle: "Principal Frontend Architect",
      resume: {
        headline: "Principal Frontend & Web Performance Architect",
        summary: "6+ years architecting web applications, WebAssembly rendering pipelines, and enterprise design systems.",
        skills: {
          languages: ["TypeScript", "JavaScript", "Rust (WASM)", "HTML5/CSS3"],
          frameworks: ["React", "Next.js", "Vue", "Solid.js", "Tailwind CSS"],
          databases: ["IndexedDB", "Supabase", "GraphQL APIs"],
          cloud_and_devops: ["Vercel Edge", "Cloudflare Workers", "GitHub Actions CI/CD"],
          tools_and_architecture: ["Design Systems", "WebAssembly", "Canvas 2D/WebGL", "Micro-Frontends", "Web Workers"],
        },
        projects: [
          {
            name: "High-Performance Canvas Graphics Engine",
            description: "WebAssembly-accelerated vector drawing pipeline rendering 60,000 shapes at consistent 60 FPS in browser.",
            technologies: ["TypeScript", "Rust", "WASM", "WebGL", "React"],
            metrics_and_impact: ["Reduced memory footprint by 65% compared to DOM-based approaches"],
          },
        ],
        experiences: [
          {
            company: "CreativeCloud UI",
            role: "Principal UI Architect",
            duration: "2020 - Present",
            responsibilities: ["Standardized design tokens and component architecture across 8 product teams."],
            achievements: ["Improved Core Web Vitals (LCP) from 3.2s to 0.8s on primary customer portals."],
            quantifiable_metrics: ["60 FPS smooth rendering", "100/100 Lighthouse Performance"],
            technologies: ["React", "Next.js", "TypeScript", "WASM"],
          },
        ],
        education: [
          {
            institution: "University of Washington",
            degree: "B.S. in Informatics & HCI",
            graduation_year: "2018",
          },
        ],
        grounding_summary: "World-class frontend authority in WebAssembly, performance profiling, and accessible design system architecture.",
      },
      jd: {
        job_title: "Principal Frontend Architect",
        company_name: "Vertex Design Technologies",
        seniority_level: "Staff/Principal",
        domain_or_industry: "Next-Gen Web Applications & Creative Tools",
        required_skills: [
          "Expert TypeScript & Modern React Architecture",
          "Web Performance Optimization (Core Web Vitals, Memory Profiling)",
          "Client-Side State Synchronization (CRDTs / Optimistic UI)",
          "Design Systems & Token Architecture at Scale",
        ],
        preferred_skills: [
          "WebAssembly (Rust / C++) Integration",
          "WebGL / WebGPU Shader Pipelines",
          "Edge Rendering & Streaming SSR",
        ],
        core_responsibilities: [
          "Set frontend architectural direction, lead performance benchmarks, and champion UX craftsmanship.",
          "Build scalable component primitives used by millions of daily active creators.",
        ],
        critical_keywords: ["Core Web Vitals", "WASM", "CRDT", "SSR Streaming", "Atomic Design", "Reflow Mitigation", "Bundle Splitting"],
        evaluation_rubric_focus: [
          "Deep understanding of browser rendering pipelines and event loops",
          "Ability to architect resilient client-side state models for collaboration",
          "Leadership in engineering excellence, accessibility (WCAG AAA), and design fidelity",
        ],
        calibration_summary: "Assess candidate on browser rendering bottlenecks, hydration strategies, and scalable component encapsulation.",
      },
    },
  };

  // Run Gap Analysis
  const runAnalysis = async (resume: ResumeParsedData, jd: JobDescriptionParsedData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/grounding/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: resume, jdData: jd }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAnalysisResult(data.analysis);
          setIsLoading(false);
          return;
        }
      }
      // Fallback
      const fallback = generateDeterministicGapAnalysis(resume, jd);
      setAnalysisResult(fallback);
    } catch (err) {
      console.warn("[GapAnalysisView] Fallback to deterministic analysis:", err);
      const fallback = generateDeterministicGapAnalysis(resume, jd);
      setAnalysisResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const activeResume = currentResume || presets.fullstack.resume;
    const activeJD = currentJD || presets.fullstack.jd;

    if (!currentResume) setCurrentResume(activeResume);
    if (!currentJD) setCurrentJD(activeJD);

    runAnalysis(activeResume, activeJD);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    const preset = presets[key];
    if (preset) {
      setCurrentResume(preset.resume);
      setCurrentJD(preset.jd);
      runAnalysis(preset.resume, preset.jd);
    }
  };

  const toggleItemExpanded = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLaunchGroundedInterview = () => {
    const roleParam = currentJD?.job_title ? encodeURIComponent(currentJD.job_title) : "Full-Stack Engineer";
    const difficultyParam = currentJD?.seniority_level?.toLowerCase().includes("staff")
      ? "hard"
      : currentJD?.seniority_level?.toLowerCase().includes("senior")
      ? "hard"
      : "medium";
    router.push(`/interview/new?role=${roleParam}&difficulty=${difficultyParam}&grounded=true`);
  };

  // Filter items
  const strongMatches = analysisResult?.strong_matches || [];
  const weakAreas = analysisResult?.weak_areas || [];
  const missingEvidence = analysisResult?.missing_evidence || [];

  const fitScore = analysisResult?.overall_fit_score || 84;
  const seniorityVerdict = analysisResult?.seniority_alignment || "Strong Fit";

  return (
    <div id="gap-analysis-root-container" className="w-full space-y-6">
      {/* ── Top Grounding Context Header & Preset Switcher ── */}
      <div className="bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#E8602E]">
                <Target className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Resume & JD Grounding Matrix
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                Live Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Deep competency gap analysis comparing candidate verified resume projects and achievements against target job requirements.
              The AI Mock Interviewer directly grounds its questions to test your weak points and missing evidence.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="refresh-gap-analysis-btn"
              onClick={() => {
                if (currentResume && currentJD) {
                  runAnalysis(currentResume, currentJD);
                }
              }}
              disabled={isLoading}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2230] dark:hover:bg-[#283144] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#E8602E]" : ""}`} />
              <span>Recalculate Gaps</span>
            </button>

            <button
              type="button"
              id="launch-grounded-interview-btn"
              onClick={handleLaunchGroundedInterview}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#E8602E] hover:bg-[#d85322] text-white shadow-md shadow-orange-950/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Start Calibrated Interview</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Preset Role Pairing Selector */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Calibrated Role Benchmark:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedPreset === key
                    ? "bg-[#E8602E] text-white font-semibold shadow-xs"
                    : "bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#283144] border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                {preset.label.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Key Metrics & Executive Overview Bento ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Score & Seniority Alignment Card (~4 cols) */}
        <div className="md:col-span-4 bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Role Fit Index
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  seniorityVerdict === "Strong Fit"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                }`}
              >
                {seniorityVerdict}
              </span>
            </div>

            {/* Score Ring / Display */}
            <div className="flex items-center gap-4 py-2">
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FFF6F0] to-[#FFEDD5] dark:from-[#2A1D17] dark:to-[#382218] border border-[#FDBA74]/60 dark:border-[#EA580C]/40 flex flex-col items-center justify-center shadow-xs">
                <span className="text-2xl font-black text-[#E8602E] dark:text-[#FB923C] tracking-tight">
                  {fitScore}%
                </span>
                <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  Match Score
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentJD?.job_title || "Target Role"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentJD?.company_name ? `${currentJD.company_name} • ` : ""}
                  Seniority Level: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentJD?.seniority_level || "Senior"}</span>
                </p>
              </div>
            </div>

            {/* Breakdown Pill Counts */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20">
                <span className="block text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {strongMatches.length}
                </span>
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                  Strong
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20">
                <span className="block text-base font-extrabold text-amber-600 dark:text-amber-400">
                  {weakAreas.length}
                </span>
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                  Weak
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20">
                <span className="block text-base font-extrabold text-rose-600 dark:text-rose-400">
                  {missingEvidence.length}
                </span>
                <span className="text-[10px] font-medium text-rose-700 dark:text-rose-300">
                  Missing
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-400 italic">
            Calibrated on {analysisResult?.analyzed_at ? new Date(analysisResult.analyzed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
          </p>
        </div>

        {/* Executive Summary & Interview Strategy (~8 cols) */}
        <div className="md:col-span-8 bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                AI Interviewer Grounding Directive
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-[#1A212D] border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4">
              {analysisResult?.executive_summary ||
                "Candidate has extensive verified background in TypeScript, React, and Node.js with strong project evidence. The AI mock interviewer will focus inquiries on distributed caching failure modes, ACID transactions, and high-concurrency architecture."}
            </p>

            {/* Focus Tags */}
            {analysisResult?.recommended_focus_areas && analysisResult.recommended_focus_areas.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  High-Priority Interview Practice Focus:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.recommended_focus_areas.map((focus, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[#E8602E] dark:text-[#FB923C] font-medium"
                    >
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Tactical Strategy: </strong>
              {analysisResult?.interview_strategy_brief ||
                "Lead with flagship real-time project metrics to build immediate credibility. When asked about missing or preferred tools, bridge to core engineering trade-offs."}
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs for Gap Analysis Categories ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C2230]"
            }`}
          >
            All Competencies ({strongMatches.length + weakAreas.length + missingEvidence.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("strong")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "strong"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Strong Matches ({strongMatches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("weak")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "weak"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Weak Areas ({weakAreas.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("missing")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "missing"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Missing Evidence ({missingEvidence.length})</span>
          </button>
        </div>

        {/* View Switcher: Matrix vs Full Raw Content */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1C2230] p-1 rounded-xl self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("matrix")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeSubTab === "matrix"
                ? "bg-white dark:bg-[#283144] text-slate-900 dark:text-white shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Gap Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("resume")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeSubTab === "resume"
                ? "bg-white dark:bg-[#283144] text-slate-900 dark:text-white shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Resume Evidence
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("jd")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeSubTab === "jd"
                ? "bg-white dark:bg-[#283144] text-slate-900 dark:text-white shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Target JD Criteria
          </button>
        </div>
      </div>

      {/* ── Tab 1: Detailed Gap Analysis Cards ── */}
      {activeSubTab === "matrix" && (
        <div className="space-y-4">
          {/* 1. STRONG MATCHES SECTION */}
          {(activeFilter === "all" || activeFilter === "strong") && strongMatches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Strong Matches — Verified Resume Evidence ({strongMatches.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {strongMatches.map((item) => {
                  const isExpanded = expandedItems[item.id] !== false; // default expanded

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#151922] border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-4 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                              {item.category} • {item.importance.toUpperCase()}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {item.skill_or_concept}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            <span>{item.match_score}% Match</span>
                          </div>
                        </div>

                        {/* Citation quote from candidate projects */}
                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-[#14231E] border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                            Verified Candidate Evidence:
                          </span>
                          <p className="leading-relaxed font-normal">{item.candidate_evidence}</p>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.relevance_commentary}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Validated for technical interviews
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. WEAK AREAS SECTION */}
          {(activeFilter === "all" || activeFilter === "weak") && weakAreas.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Weak Areas — Growth Opportunities & Talking Points ({weakAreas.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {weakAreas.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#151922] border border-amber-500/40 dark:border-amber-500/30 rounded-2xl p-4 shadow-xs hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                            {item.category} • {item.severity.toUpperCase()} PRIORITY
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.skill_or_concept}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20 uppercase">
                          Partial Proof
                        </span>
                      </div>

                      {/* Delta Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A212D] border border-slate-200/80 dark:border-slate-800 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Candidate Current:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-snug">
                            {item.current_candidate_level}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 space-y-0.5">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                            JD Expectation:
                          </span>
                          <p className="text-slate-800 dark:text-amber-200 text-[11px] leading-snug">
                            {item.target_jd_expectation}
                          </p>
                        </div>
                      </div>

                      {/* Talking Point advice */}
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                          Suggested Interview Talking Point:
                        </span>
                        <p className="text-slate-800 dark:text-amber-100 font-medium leading-relaxed">
                          &ldquo;{item.suggested_talking_point}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        Bridging: {item.bridging_strategy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. MISSING EVIDENCE SECTION */}
          {(activeFilter === "all" || activeFilter === "missing") && missingEvidence.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-5 h-5 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Missing Evidence — Predicted Interviewer Trap Questions ({missingEvidence.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {missingEvidence.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#151922] border border-rose-500/40 dark:border-rose-500/30 rounded-2xl p-4 shadow-xs hover:border-rose-500/60 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
                            {item.category} • {item.severity.toUpperCase()} RISK
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.skill_or_concept}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/20 uppercase">
                          No Mention
                        </span>
                      </div>

                      {/* Predicted Question */}
                      <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-[#2A161A] border border-rose-200/70 dark:border-rose-900/40 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-[10px] uppercase">
                          <Bot className="w-3.5 h-3.5" />
                          <span>Predicted Interviewer Probe:</span>
                        </div>
                        <p className="text-slate-900 dark:text-rose-100 font-medium italic leading-relaxed">
                          &ldquo;{item.predicted_interviewer_trap_question}&rdquo;
                        </p>
                      </div>

                      {/* Defense Tip */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A212D] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Defense & Prep Recommendation:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                          {item.recommended_preparation_tip}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        Risk: {item.potential_risk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Structured Resume Explorer ── */}
      {activeSubTab === "resume" && currentResume && (
        <div className="bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentResume.headline || "Candidate Profile"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extracted skills, flagship projects, and work history for grounding.
              </p>
            </div>
            <Link
              href="/profile"
              className="px-3 py-1.5 text-xs font-semibold text-[#E8602E] bg-orange-500/10 hover:bg-orange-500/20 rounded-xl transition-colors"
            >
              Edit Resume in Profile
            </Link>
          </div>

          {/* Project Evidence Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Flagship Project Evidence ({currentResume.projects?.length || 0})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentResume.projects?.map((proj, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A212D] border border-slate-200/80 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{proj.name}</h5>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                      Project {i + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies?.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#12161F] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Target JD Criteria ── */}
      {activeSubTab === "jd" && currentJD && (
        <div className="bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentJD.job_title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentJD.company_name} • Seniority: {currentJD.seniority_level} • Domain: {currentJD.domain_or_industry}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A212D] border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Required Technical Skills
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {currentJD.required_skills?.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8602E]" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A212D] border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Preferred & Bonus Criteria
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {currentJD.preferred_skills?.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {currentJD.evaluation_rubric_focus && (
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#E8602E] dark:text-[#FB923C]">
                Evaluation Rubric Focus
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentJD.evaluation_rubric_focus.map((rubric, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Award className="w-3.5 h-3.5 text-[#E8602E] shrink-0" />
                    <span>{rubric}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Call To Action Banner ── */}
      <div className="bg-gradient-to-r from-[#E8602E] to-[#F17E45] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-950/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <h3 className="text-lg sm:text-xl font-black tracking-tight">
              Ready to Practice With Your Grounded Gaps?
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-orange-100 max-w-2xl leading-relaxed">
            AscendX will dynamically ask technical and architecture questions designed to test your {weakAreas.length} weak areas and probe your {missingEvidence.length} missing evidence points in a realistic, adaptive mock interview.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLaunchGroundedInterview}
          className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-orange-50 text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Bot className="w-4 h-4 text-[#E8602E]" />
          <span>Launch Calibrated Interview</span>
          <ArrowRight className="w-4 h-4 text-[#E8602E]" />
        </button>
      </div>
    </div>
  );
}
