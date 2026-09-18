"use client";

import React from "react";
import { useTab } from "@/context/TabContext";
import AscendXDashboard from "@/components/dashboard/AscendXDashboard";
import SetupForm from "@/components/interview/SetupForm";
import GapAnalysisView from "@/components/grounding/GapAnalysisView";
import DaySimulationsPage from "@/app/day-simulations/page";
import FeedbackHubPage from "@/app/feedback-hub/page";
import VoiceCoachPage from "@/app/voice-coach/page";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

interface TabSwitchContainerProps {
  initialSessions: Array<{
    id: string;
    role: string;
    difficulty: string;
    status: string;
    created_at: string;
  }>;
  initialResume: any;
  initialJD: any;
}

export default function TabSwitchContainer({
  initialSessions,
  initialResume,
  initialJD,
}: TabSwitchContainerProps) {
  const { activeTab, setActiveTab } = useTab();
  const currentTab = activeTab || "dashboard";

  switch (currentTab) {
    case "dashboard":
    case "insights":
      return <AscendXDashboard initialSessions={initialSessions} />;

    case "mock-interviews":
      return (
        <div className="w-full min-h-[calc(100vh-5rem)] bg-[#ECEEF2] dark:bg-[#0B0F15] py-4 sm:py-7 px-3 sm:px-6 lg:px-8 transition-colors duration-300">
          <div className="max-w-[760px] mx-auto space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#1C2230]/90 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-[#252E40] transition-colors shadow-2xs group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Dashboard</span>
              </button>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>AscendX</span>
                <span>/</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">Mock Interview Setup</span>
              </div>
            </div>
            <SetupForm />
          </div>
        </div>
      );

    case "resume-grounding":
      return (
        <main className="w-full min-h-[calc(100vh-5rem)] bg-[#ECEEF2] dark:bg-[#0B0F15] py-4 sm:py-6 px-3 sm:px-6 lg:px-8 transition-colors duration-300">
          <div className="max-w-[1380px] mx-auto space-y-4">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#1C2230]/90 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-[#252E40] transition-colors shadow-2xs group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <GapAnalysisView initialResume={initialResume} initialJD={initialJD} />
          </div>
        </main>
      );

    case "day-simulations":
      return <DaySimulationsPage />;

    case "feedback-hub":
      return <FeedbackHubPage />;

    case "voice-coach":
      return <VoiceCoachPage />;

    default:
      return <AscendXDashboard initialSessions={initialSessions} />;
  }
}
