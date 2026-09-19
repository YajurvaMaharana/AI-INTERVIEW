import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TabProvider } from "@/context/TabContext";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                var msg = e && (e.message || (e.target && e.target.src));
                if (msg && (String(msg).includes('Loading chunk') || String(msg).includes('ChunkLoadError') || String(msg).includes('error.js'))) {
                  var key = 'ascendx_chunk_reload_' + window.location.pathname;
                  if (!sessionStorage.getItem(key)) {
                    sessionStorage.setItem(key, 'true');
                    window.location.reload();
                  }
                }
              }, true);
              window.addEventListener('unhandledrejection', function(e) {
                var reason = e && e.reason ? (e.reason.message || String(e.reason)) : '';
                if (reason.includes('Loading chunk') || reason.includes('ChunkLoadError')) {
                  var key = 'ascendx_chunk_reload_' + window.location.pathname;
                  if (!sessionStorage.getItem(key)) {
                    sessionStorage.setItem(key, 'true');
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen transition-colors duration-200 bg-[#ECEEF2] dark:bg-[#0B0F15] text-slate-900 dark:text-slate-100`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <TabProvider>
              <Navbar />
              <Suspense fallback={null}>
                <main>{children}</main>
              </Suspense>
            </TabProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
