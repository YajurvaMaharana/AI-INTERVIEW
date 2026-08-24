import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Session | AI Interview",
  description: "Your active AI Interview practice session",
};

export default function InterviewSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return (
    <div className="container py-10">
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Interview Session
        </h1>
        <p className="text-muted-foreground text-lg">
          Session ID: <span className="font-mono bg-muted px-2 py-1 rounded">{params.sessionId}</span>
        </p>
        <p className="max-w-[600px] text-muted-foreground">
          The interview environment for this session is successfully loading. Your setup was complete!
        </p>
      </div>
    </div>
  );
}
