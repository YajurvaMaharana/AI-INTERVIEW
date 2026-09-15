import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { getSessionsByUserId } from "@/lib/services/db.service";
import { Clock, ArrowRight, Award, MessageSquare } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load user sessions if authenticated on server; do not force redirect
  const sessions = user ? await getSessionsByUserId(user.id) : [];

  return (
    <div className="container py-10 max-w-5xl">
      <div className="space-y-8">
        <DashboardHeader
          initialUser={
            user
              ? {
                  id: user.id,
                  email: user.email,
                }
              : null
          }
        />

        {/* Start Practice Hero Card */}
        <div className="rounded-xl border bg-card p-6 sm:p-8 text-card-foreground shadow-xs">
          <div className="max-w-xl space-y-2">
            <h2 className="text-xl font-semibold">
              Ready for your next mock interview?
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Experience dynamic AI-driven technical and behavioral questions tailored to your target role and seniority level.
            </p>
            <div className="pt-2">
              <Button asChild className="gap-1.5">
                <Link href="/interview/new">
                  <span>Start New Session</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Past Sessions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Interview History</h2>
            <span className="text-xs text-muted-foreground">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"} recorded
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground space-y-3">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm">No past interview sessions yet. Complete your first session to track feedback and progress.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/interview/new">
                  Start First Interview
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {sess.role}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium uppercase text-secondary-foreground">
                        {sess.difficulty}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                          sess.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {sess.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Started on {new Date(sess.created_at).toLocaleDateString()} at{" "}
                      {new Date(sess.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Link href={`/interview/${sess.id}`}>
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant={sess.status === "completed" ? "default" : "secondary"} className="gap-1.5 text-xs">
                      <Link href={`/interview/${sess.id}/feedback`}>
                        <Award className="h-3.5 w-3.5" />
                        <span>Feedback Debrief</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
