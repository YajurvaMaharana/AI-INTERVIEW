import { createClient } from "@/lib/supabase/server";
import { getSessionsByUserId } from "@/lib/services/db.service";
import AscendXDashboard from "@/components/dashboard/AscendXDashboard";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load user sessions if authenticated on server; do not force redirect
  const sessions = user ? await getSessionsByUserId(user.id) : [];

  const formattedSessions = sessions.map((s) => ({
    id: s.id,
    role: s.role,
    difficulty: s.difficulty,
    status: s.status,
    created_at: s.created_at,
  }));

  return <AscendXDashboard initialSessions={formattedSessions} />;
}

