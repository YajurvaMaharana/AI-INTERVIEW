"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Zap,
  Cpu,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Check,
  Target,
  Sliders,
  Scale,
  Sparkles,
  Search,
} from "lucide-react";
import type { ResumeClaimAuditItem, ClaimCategoryType } from "@/lib/types/claims-audit.types";

interface ResumeClaimsAuditCardProps {
  claims: ResumeClaimAuditItem[];
  highImpactSummary?: string;
  candidateHeadline?: string;
  onLaunchCalibratedInterview?: (claimFocus?: string) => void;
}

export function ResumeClaimsAuditCard({
  claims,
  highImpactSummary,
  candidateHeadline,
  onLaunchCalibratedInterview,
}: ResumeClaimsAuditCardProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<"all" | ClaimCategoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClaimIds, setExpandedClaimIds] = useState<Record<string, boolean>>({
    [claims[0]?.id || ""]: true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedClaimIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyProbe = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesCat = selectedCategory === "all" || claim.claim_type === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      claim.original_statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.interviewer_probe_angle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.context_source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.key_tradeoffs_to_defend.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (type: ClaimCategoryType) => {
    switch (type) {
      case "latency_and_performance":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "metric_and_scale":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "architectural_decision":
        return <Cpu className="w-4 h-4 text-blue-500" />;
      case "ownership_and_leadership":
        return <Award className="w-4 h-4 text-purple-500" />;
      case "reliability_and_incident":
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Target className="w-4 h-4 text-slate-500" />;
    }
  };

  const getDifficultyBadge = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            High Probe Depth
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Standard Technical Probe
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Verification Check
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[#E8602E]">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
                Grounded Evaluation Layer
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Resume Claims & Metrics Audit
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Objective extraction of quantifiable performance figures, architectural decisions, and
              ownership claims. The AI interviewer cross-examines these specific claims during the mock session.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium">Claims Identified</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">{claims.length}</span>
              <span className="text-xs text-orange-400 font-semibold">Probed Areas</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Grounded in Active Session
            </span>
          </div>
        </div>

        {highImpactSummary && (
          <div className="mt-4 pt-4 border-t border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
            <Sliders className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <span>
              <strong>Interviewer Calibration Focus: </strong>
              {highImpactSummary}
            </span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C2230]"
            }`}
          >
            All Claims ({claims.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("metric_and_scale")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "metric_and_scale"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Scale & Metrics
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("architectural_decision")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "architectural_decision"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Architecture
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("latency_and_performance")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "latency_and_performance"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Performance
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("ownership_and_leadership")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "ownership_and_leadership"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Ownership
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search claims or trade-offs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1A212D] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              No claims match your filter criteria
            </p>
            <p className="text-xs text-slate-400">Try resetting the category filter or search query.</p>
          </div>
        ) : (
          filteredClaims.map((claim) => {
            const isExpanded = !!expandedClaimIds[claim.id];

            return (
              <div
                key={claim.id}
                className="bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 overflow-hidden"
              >
                {/* Collapsible Header */}
                <div
                  onClick={() => toggleExpand(claim.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-[#1A212D]/40 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        {getCategoryIcon(claim.claim_type)}
                        <span>{claim.claim_category_label}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Source: <span className="font-semibold text-slate-700 dark:text-slate-300">{claim.context_source}</span>
                      </span>
                      {getDifficultyBadge(claim.verification_difficulty)}
                    </div>

                    {/* Original Statement Quote */}
                    <div className="pl-3 border-l-2 border-orange-500/80">
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        &ldquo;{claim.original_statement}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onLaunchCalibratedInterview) {
                          onLaunchCalibratedInterview(claim.original_statement);
                        } else {
                          router.push(`/interview/new?type=technical&difficulty=hard`);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-[#E8602E] dark:text-[#FB923C] border border-orange-500/20 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Practice Probe</span>
                    </button>

                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1C2230] flex items-center justify-center text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Inspection Detail */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-[#131720] space-y-5">
                    {/* Primary Probe Angle */}
                    <div className="bg-white dark:bg-[#181E29] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#E8602E]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Interviewer Probe Angle (Evidence-Seeking)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyProbe(claim.interviewer_probe_angle, claim.id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {copiedId === claim.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Probe</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                        {claim.interviewer_probe_angle}
                      </p>
                    </div>

                    {/* Trade-offs & Verification Focus Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Key Trade-offs */}
                      <div className="bg-white dark:bg-[#181E29] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Key Architectural Trade-offs to Defend:
                        </span>
                        <div className="space-y-1.5">
                          {claim.key_tradeoffs_to_defend.map((tradeoff, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1F2633] p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
                            >
                              <span className="text-orange-500 font-bold">•</span>
                              <span>{tradeoff}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Evidence Verification & STAR Defense */}
                      <div className="bg-white dark:bg-[#181E29] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            Evidence & Telemetry Verification Focus:
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                            {claim.evidence_verification_focus}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                            Recommended STAR Articulation:
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                            {claim.recommended_star_defense}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
