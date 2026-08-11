import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up | AI Interview",
  description: "Create your AI Interview Practice account",
};

export default function SignupPage() {
  return <SignupForm />;
}
