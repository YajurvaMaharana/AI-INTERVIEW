import { createClient } from "@/lib/supabase/server";
import { getSessionsByUserId } from "@/lib/services/db.service";
import AscendXDashboard from "@/components/dashboard/AscendXDashboard";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

