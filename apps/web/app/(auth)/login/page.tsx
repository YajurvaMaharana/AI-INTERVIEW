import { Suspense } from "react";
import type { Metadata } from "next";
import SlidingAuth from "@/components/auth/SlidingAuth";

export const metadata: Metadata = {
  title: "Sign In | AscendX",
  description: "Sign in to your AscendX account",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl h-[620px] rounded-2xl border bg-card shadow-2xl animate-pulse flex items-center justify-center text-muted-foreground text-sm">
          Loading AscendX...
        </div>
      }
    >
      <SlidingAuth initialMode="signin" />
    </Suspense>
  );
}
