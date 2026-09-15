"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  Search,
  ChevronDown,
  Info,
  Sparkles,
  ArrowDown,
  Volume2,
  CheckCircle2,
  ExternalLink,
  History,
  Play,
  RotateCcw,
} from "lucide-react";
import PersonaSelector, { PersonaId } from "@/components/dashboard/PersonaSelector";
import ResumeJDCard from "@/components/dashboard/ResumeJDCard";
import SkillReadinessRadar from "@/components/dashboard/SkillReadinessRadar";
import CompetencyGrowthLineChart from "@/components/dashboard/CompetencyGrowthLineChart";
import DeliveryTelemetry from "@/components/dashboard/DeliveryTelemetry";
import AnswerRewriteCard from "@/components/dashboard/AnswerRewriteCard";
import { useAuth } from "@/context/AuthContext";

interface AscendXDashboardProps {
  initialSessions?: Array<{
    id: string;
    role: string;
    difficulty: string;
    status: string;
    created_at: string;
  }>;
}

export default function AscendXDashboard({ initialSessions = [] }: AscendXDashboardProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Dashboard interactive state
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("tech-grinder");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGraduation, setSelectedGraduation] = useState("All graduations");
  const [isGraduationOpen, setIsGraduationOpen] = useState(false);
  const [isAdaptiveOn, setIsAdaptiveOn] = useState(true);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // User display name
  const userDisplayName = user?.email ? user.email.split("@")[0] : "[User]";

  // Launch AI Interview
  const handleLaunchInterview = async () => {
    setIsLaunching(true);
    // Route to new interview session setup or start with persona
    router.push(`/interview/new?persona=${selectedPersona}`);
  };

  const graduationOptions = [
    "All graduations",
    "Senior Full-Stack (L5/Staff)",
    "Backend & Distributed Systems",
    "Frontend & UI Architecture",
    "System Design & Scale",
    "Behavioral (STAR Method)",
  ];

  return (
    <div className="w-full bg-[#ECEEF2] py-4 sm:py-6 px-2 sm:px-4 lg:px-6">
      {/* Outer Card Container with soft diffuse shadows and generous rounded corners */}
      <div className="max-w-[1380px] mx-auto bg-[#F9FAFC] border border-slate-200/70 rounded-[28px] p-4 sm:p-6 lg:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.06)] space-y-6">
        {/* Top Floating Control Bar: Voice Active Switch */}
        <div className="flex items-center justify-end w-full">
          <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-slate-700">Voice Active</span>
            <button
              type="button"
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isVoiceActive ? "bg-[#E87A42]" : "bg-slate-300"
              }`}
              aria-label="Toggle Voice Active"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  isVoiceActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3-Column Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* ========================================================= */}
          {/* COLUMN 1: LEFT COLUMN (Persona, Resume/JD, Launch) (~28%) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-between space-y-5">
            {/* Welcome Card & Title */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                Welcome Back, {userDisplayName}
              </h1>

              {/* Interviewer Persona Section */}
              <PersonaSelector
                selectedPersona={selectedPersona}
                onSelectPersona={(id) => setSelectedPersona(id)}
              />

              {/* Resume / JD Grounding Card */}
              <ResumeJDCard />
            </div>

            {/* Launch Action Section */}
            <div className="space-y-2.5 pt-2">
              {/* Prominent Orange Launch Button */}
              <button
                type="button"
                onClick={handleLaunchInterview}
                disabled={isLaunching}
                className="w-full group relative flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#E8602E] to-[#F17E45] hover:from-[#d85322] hover:to-[#e07038] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(232,96,46,0.35)] transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                {/* Microphone Icon in dark accent square container */}
                <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <span>+ Launch Adaptive AI Interview</span>
              </button>

              {/* Status Toggles & Details Row */}
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1 text-slate-700">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Text & Full Voice</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Adaptive Difficulty:</span>
                  <button
                    type="button"
                    onClick={() => setIsAdaptiveOn(!isAdaptiveOn)}
                    className="text-[#E87A42] hover:underline font-bold"
                  >
                    {isAdaptiveOn ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: CENTER COLUMN (Live Analytics, Radar, Line Chart) (~44%) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between space-y-4">
            {/* Header: Title + Search & Dropdown Filter */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Live Prep Analytics
                </h2>

                {/* Right Header Controls: Search + Dropdown */}
                <div className="flex items-center gap-2">
                  {/* Search input with icon */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search"
                      className="w-24 sm:w-28 text-xs py-1.5 pl-2.5 pr-7 rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#E87A42] focus:w-36 transition-all"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                  </div>

                  {/* Graduation Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsGraduationOpen(!isGraduationOpen)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-slate-300 shadow-2xs whitespace-nowrap"
                    >
                      <span className="truncate max-w-[90px]">{selectedGraduation}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {isGraduationOpen && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 animate-in fade-in-50 zoom-in-95">
                        {graduationOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setSelectedGraduation(opt);
                              setIsGraduationOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                              selectedGraduation === opt
                                ? "bg-[#FFF6F0] text-[#E87A42] font-semibold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-badge: Live Interview Workspace Info */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-[#FCE8DE] text-[#E87A42] flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Live Interview</span>
                    <Info className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    AI Interview Practice and workspace.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Analytics 2-Chart Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              {/* Radar Chart */}
              <div className="flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-3">
                <SkillReadinessRadar
                  communication={88}
                  techDepth={78}
                  deliveryPace={84}
                  starStorytelling={92}
                />
              </div>

              {/* Line Chart */}
              <div className="flex items-center justify-center pt-2 md:pt-0 md:pl-3">
                <CompetencyGrowthLineChart />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3: RIGHT COLUMN (Insights & Feedback, Telemetry, Rewrite) (~28%) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col justify-between space-y-4">
            {/* Header Title */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Insights & Feedbacks
              </h2>
            </div>

            {/* Delivery Telemetry (4-Box Grid) */}
            <DeliveryTelemetry />

            {/* AI Coaching Card: STAR Rubric Feedback */}
            <div className="border border-slate-100 bg-white rounded-2xl p-4 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                AI Coaching: STAR Rubric Feedback
              </h3>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-800 block">
                  AI Coaching: STAR Rubric Feedback:
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tracking our live view snippets of matters, and assets converted according to STAR method standards with concrete metrics.
                </p>
              </div>
            </div>

            {/* Answer Rewrite Insight Card */}
            <AnswerRewriteCard
              onPracticeAgain={() => router.push(`/interview/new?persona=${selectedPersona}`)}
            />
          </div>
        </div>

        {/* Past Sessions Drawer Toggle if sessions exist */}
        {initialSessions.length > 0 && (
          <div className="pt-2 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-black transition-colors"
            >
              <History className="w-4 h-4 text-[#E87A42]" />
              <span>
                {showHistoryDrawer ? "Hide" : "View"} Recent Practice Sessions ({initialSessions.length})
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showHistoryDrawer ? "rotate-180" : ""
                }`}
              />
            </button>

            {showHistoryDrawer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                {initialSessions.slice(0, 6).map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{sess.role}</div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {sess.difficulty} • {sess.status}
                      </div>
                    </div>
                    <Link
                      href={`/interview/${sess.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#FFF6F0] hover:text-[#E87A42] font-semibold transition-colors"
                    >
                      Resume
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
