export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getSessionsByUserId } from "@/lib/services/db.service";
import AscendXDashboard from "@/components/dashboard/AscendXDashboard";

export default async function DashboardPage() {
  let formattedSessions: Array<{
    id: string;
    role: string;
    difficulty: string;
    status: string;
    created_at: string;
  }> = [];

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      const sessions = await getSessionsByUserId(user.id);
      if (Array.isArray(sessions)) {
        formattedSessions = sessions.map((s) => ({
          id: s.id,
          role: s.role || "Software Engineer",
          difficulty: s.difficulty || "medium",
          status: s.status || "completed",
          created_at: s.created_at || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("[DashboardPage] Server RSC load notice:", err);
  }

  return <AscendXDashboard initialSessions={formattedSessions} />;
}


