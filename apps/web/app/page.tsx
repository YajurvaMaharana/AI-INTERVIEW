import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mountain, ArrowRight, ShieldCheck, Sparkles, Terminal } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <div className="max-w-3xl text-center space-y-8">
        {/* Brand Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide uppercase">
          <Mountain className="h-3.5 w-3.5" />
          <span>AscendX Engineering Interview Platform</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
          Ascend to Your Peak Engineering Career
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Master frontend, backend, system design, and behavioral interviews with AscendX.
          Experience real-time adaptive AI evaluations and structured, actionable debriefs.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button asChild size="lg" className="gap-2 px-8 h-12 text-base font-semibold shadow-md">
            <Link href="/auth?mode=signup">
              <span>Start Free Practice</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
            <Link href="/auth">
              Sign In
            </Link>
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t text-left">
          <div className="rounded-xl border bg-card/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Adaptive Difficulty</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dynamically drills into edge-cases, optimization, and system scale as you answer.
            </p>
          </div>
          <div className="rounded-xl border bg-card/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <Terminal className="h-4 w-4" />
              <span>Multi-Track Practice</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Frontend, Backend, Full-Stack, System Design, and STAR behavioral tracks.
            </p>
          </div>
          <div className="rounded-xl border bg-card/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Actionable Debriefs</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Comprehensive score breakdowns with clear, targeted suggestions for study and polish.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
