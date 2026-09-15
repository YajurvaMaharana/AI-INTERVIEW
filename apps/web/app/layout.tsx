import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AscendX - AI Mock Interview Platform",
  description:
    "Master technical and behavioral interviews with AscendX. Adaptive AI mock interviews with real-time feedback.",
  openGraph: {
    title: "AscendX - AI Mock Interview Platform",
    description:
      "Master technical and behavioral interviews with AscendX. Adaptive AI mock interviews with real-time feedback.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <Suspense fallback={null}>
            <main>{children}</main>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
