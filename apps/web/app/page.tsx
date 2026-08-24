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
