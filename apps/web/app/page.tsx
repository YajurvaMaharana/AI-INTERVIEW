import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          AI Interview Practice
        </h1>
        <p className="text-lg text-muted-foreground">
          Practice your interview skills with AI-powered mock interviews.
          Get instant, actionable feedback to improve your performance.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign in
            </Button>
          </Link>
        </div>
        <div className="pt-2">
          <Link href="/interview/new">
            <Button variant="ghost" size="lg">
              Start Practice Interview →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
