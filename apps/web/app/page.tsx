import { createClient } from "@/lib/supabase/server";
import { getSessionsByUserId, getUserById } from "@/lib/services/db.service";
import TabSwitchContainer from "@/components/layout/TabSwitchContainer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let formattedSessions: Array<{
    id: string;
    role: string;
    difficulty: string;
    status: string;
    created_at: string;
  }> = [];
  let initialResume = null;
  let initialJD = null;

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

      const dbUser = await getUserById(user.id);
      if (dbUser) {
        initialResume = dbUser.resume_data || null;
        initialJD = dbUser.saved_jd_data || null;
      }
    }
  } catch (err) {
    console.warn("[HomePage] Server load notice:", err);
  }

  return (
    <TabSwitchContainer
      initialSessions={formattedSessions}
      initialResume={initialResume}
      initialJD={initialJD}
    />
  );
}


