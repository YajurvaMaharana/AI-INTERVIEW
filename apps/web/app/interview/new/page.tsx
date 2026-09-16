import type { Metadata } from "next";
import Link from "next/link";
import React, { Suspense } from "react";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import SetupForm from "@/components/interview/SetupForm";

export const metadata: Metadata = {
  title: "Set Up Your Interview | AscendX",
  description:
    "Configure your mock interview session — choose type, role, and difficulty to get started with AscendX AI.",
};

export default function NewInterviewPage() {
  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-[#ECEEF2] dark:bg-[#0B0F15] py-4 sm:py-7 px-3 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-[760px] mx-auto space-y-3 sm:space-y-4">
        {/* Top Breadcrumb / Back Link */}
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
            <span className="text-slate-800 dark:text-slate-200 font-semibold">New Interview</span>
          </div>
        </div>

        {/* Form Container */}
        <Suspense
          fallback={
            <div className="max-w-[760px] mx-auto bg-[#F9FAFC] dark:bg-[#151922] border border-slate-200/80 dark:border-[#222B3A] rounded-[28px] p-12 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-[#E8602E]" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Loading interview setup studio...
              </p>
            </div>
          }
        >
          <SetupForm />
        </Suspense>
      </div>
    </div>
  );
}
