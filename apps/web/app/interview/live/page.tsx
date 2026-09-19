"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mic, Volume2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiveInterviewGatewayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState("Initializing live voice interview workspace...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function launchLiveInterview() {
      try {
        setStatusText("Calibrating AI interviewer voice engine & audio pipeline...");

        const role = searchParams?.get("role") || "Full Stack Software Engineer";
        const type = searchParams?.get("type") || "technical";
        const difficulty = searchParams?.get("difficulty") || "medium";
        const persona = searchParams?.get("persona") || "tech-grinder";

        const res = await fetch("/api/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            type,
            difficulty,
            persona,
            modality: "voice",
            practiceMode: "standard",
            duration: 30,
          }),
        });

        if (!res.ok) {
          throw new Error("Could not initialize live session");
        }

        const data = await res.json();
        if (!isCancelled && data.sessionId) {
          setStatusText("Session ready! Connecting audio stream...");
          router.replace(`/interview/${encodeURIComponent(data.sessionId)}?modality=voice&autoSpeak=true`);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn("Live gateway init error, falling back to new session:", err);
          setError("Failed to auto-launch live session. Redirecting to configuration...");
          setTimeout(() => {
            router.replace("/interview/new?modality=voice");
          }, 1500);
        }
      }
    }

    launchLiveInterview();

    return () => {
      isCancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECEEF2] dark:bg-[#0B0F15] p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E8602E] to-[#F17E45] text-white shadow-lg shadow-orange-500/25">
          <Mic className="h-8 w-8 animate-pulse" />
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
            <Volume2 className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            AscendX Live Voice Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {statusText}
          </p>
        </div>

        {error ? (
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        ) : (
          <div className="flex justify-center items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Engaging Speech Synthesis & Hands-Free Audio...</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          Hands-free auto-playback is enabled by default for all interviewer questions.
        </div>
      </div>
    </div>
  );
}
