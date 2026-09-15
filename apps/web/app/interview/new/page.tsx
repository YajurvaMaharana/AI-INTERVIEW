import type { Metadata } from "next";
import SetupForm from "@/components/interview/SetupForm";

export const metadata: Metadata = {
  title: "New Interview | AscendX",
  description:
    "Configure your mock interview — choose type, role, and difficulty to get started with AscendX",
};

export default function NewInterviewPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <SetupForm />
    </div>
  );
}
