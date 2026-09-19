export const dynamic = "force-dynamic";

import React from "react";

import GapAnalysisView from "@/components/grounding/GapAnalysisView";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/lib/services/db.service";



export default async function ResumeJdGroundingPage() {
  let initialResume = null;
  let initialJD = null;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      const dbUser = await getUserById(user.id);
      if (dbUser) {
        initialResume = dbUser.resume_data || null;
        initialJD = dbUser.saved_jd_data || null;
      }
    }
  } catch (err) {
    console.warn("[ResumeJdGroundingPage] Server load notice:", err);
  }

  return (
    <main className="w-full min-h-[calc(100vh-5rem)] bg-[#ECEEF2] dark:bg-[#0B0F15] py-4 sm:py-6 px-3 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-[1380px] mx-auto">
        <GapAnalysisView
          initialResume={initialResume}
          initialJD={initialJD}
        />
      </div>
    </main>
  );
}
