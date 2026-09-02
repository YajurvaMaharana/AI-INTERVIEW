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
      </div>
    </div>
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-50 dark:bg-zinc-950">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center tracking-tight text-zinc-900 dark:text-zinc-50">
          Ace Your Next Interview
        </h1>
        <p className="text-lg text-center text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Practice with our AI interviewer to get real-time feedback, build confidence, and land your dream job.
        </p>
        
        <div className="flex gap-4 mt-8">
          <Link 
            href="/interview/new" 
            className="rounded-full bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 px-8 py-3 font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Start Practice Interview
          </Link>
        </div>
      </div>
    </main>
  );
}
