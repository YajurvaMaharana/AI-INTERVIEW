import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | AI Interview",
  description: "Sign in to your AI Interview Practice account",
};

export default function LoginPage() {
  return <LoginForm />;
}
