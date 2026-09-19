"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";

import SlidingAuth from "@/components/auth/SlidingAuth";



export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl h-[620px] rounded-2xl border bg-card shadow-2xl animate-pulse flex items-center justify-center text-muted-foreground text-sm">
          Loading AscendX...
        </div>
      }
    >
      <SlidingAuth initialMode="signup" />
    </Suspense>
  );
}
