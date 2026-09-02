import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold mb-2">
            Ready to practice?
          </h2>
          <p className="text-muted-foreground mb-4">
            Start a new AI-powered interview session or review your past
            sessions.
          </p>
          <Link href="/interview/new">
            <Button>
              Start Practice Interview →
            </Button>
          </Link>
          <p className="text-muted-foreground">
            Start a new AI-powered interview session or review your past
            sessions.
          </p>
        </div>
      </div>
    </div>
  );
}

