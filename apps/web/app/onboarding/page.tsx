"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile?onboarding=true");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      <p className="text-xs text-slate-500 font-medium">Loading candidate onboarding...</p>
    </div>
  );
}
