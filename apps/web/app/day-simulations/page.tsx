"use client";
export const dynamic = "force-dynamic";

import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Laptop,
  Play,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Cpu,
  Users,
  Briefcase,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DaySimulationsPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [selectedSeniority, setSelectedSeniority] = useState("Senior");
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSimulation = () => {
    setIsStarting(true);
    router.push(`/interview/new?mode=simulation&role=${encodeURIComponent(selectedRole)}&difficulty=${encodeURIComponent(selectedSeniority.toLowerCase())}`);
  };

  const rounds = [
    {
      round: "Round 1",
      title: "Technical & System Design",
      duration: "45 Mins",
      icon: Cpu,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      description: "In-depth problem solving, algorithm design, system scalability trade-offs, and architecture evaluation.",
    },
    {
      round: "Round 2",
      title: "Behavioral & STAR Evaluation",
      duration: "30 Mins",
      icon: Users,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      description: "Situational prompts assessing leadership, conflict resolution, ownership, and handling failure using STAR framework.",
    },
    {
      round: "Round 3",
      title: "HR, Culture & Compensation",
      duration: "30 Mins",
      icon: Briefcase,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description: "Professional motivation, core strengths & weaknesses, salary expectations, negotiation communication, and role-fit alignment.",
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-[#ECEEF2] dark:bg-[#0B0F15] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#1C2230]/90 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-[#252E40] transition-colors shadow-2xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>AscendX</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Day Simulations</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-[#222B3A] rounded-[24px] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E8602E]/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8602E]/10 text-[#E8602E] dark:text-[#E87A42] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Continuous On-Site Loop
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Full Interview-Day Simulation
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Experience a rigorous, uninterrupted multi-round interview loop. Seamlessly transition from rigorous technical problem-solving and architectural design into behavioral STAR evaluations and executive HR negotiations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1C2230]">
                <Clock className="w-5 h-5 text-[#E8602E]" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Duration</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">~105 Minutes</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1C2230]">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Stamina Tracking</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Cross-Round Telemetry</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1C2230]">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Master Report</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Unified Scoring Hub</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chained Sequence Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white px-1">
            Simulation Sequence & Modules
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {rounds.map((r, idx) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.round}
                  className="bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-[#222B3A] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#E8602E]/40"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border ${r.color} shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#E8602E]">
                          {r.round}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {r.duration}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {r.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {r.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center self-end sm:self-center">
                    <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-300">
                      Step {idx + 1} of 3
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration & Launch Card */}
        <div className="bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-[#222B3A] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Configure Your Simulation Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Target Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E8602E]"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Full-Stack Engineer">Full-Stack Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="DevOps & Cloud Architect">DevOps & Cloud Architect</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Seniority Level
              </label>
              <select
                value={selectedSeniority}
                onChange={(e) => setSelectedSeniority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E8602E]"
              >
                <option value="Junior">Junior (L3)</option>
                <option value="Mid-Level">Mid-Level (L4)</option>
                <option value="Senior">Senior (L5)</option>
                <option value="Staff">Staff / Principal (L6+)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <Button
              onClick={handleStartSimulation}
              disabled={isStarting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E8602E] hover:bg-[#d45525] text-white font-bold text-sm shadow-[0_4px_20px_rgba(232,96,46,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Initializing Simulation Loop...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Full Simulation Day</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
