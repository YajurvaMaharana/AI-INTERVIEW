"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  initialUser?: {
    id: string;
    email?: string;
  } | null;
}

export default function DashboardHeader({ initialUser }: DashboardHeaderProps) {
  const { user: clientUser } = useAuth();
  const effectiveUser = clientUser || initialUser;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {!effectiveUser && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Guest Mode
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {effectiveUser ? (
            <>
              Welcome back,{" "}
              <span className="font-medium text-foreground">
                {effectiveUser.email || "Candidate"}
              </span>
            </>
          ) : (
            <>
              Practice mock interviews anytime.{" "}
              <Link
                href="/auth"
                className="text-primary hover:underline font-medium"
              >
                Sign in or register
              </Link>{" "}
              to save interview transcripts and feedback across devices.
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {!effectiveUser && (
          <Button asChild variant="outline">
            <Link href="/auth">Sign In</Link>
          </Button>
        )}
        <Button asChild className="gap-2">
          <Link href="/interview/new">
            <Plus className="h-4 w-4" />
            <span>Start Practice Interview</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
