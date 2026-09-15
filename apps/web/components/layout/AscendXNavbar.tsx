"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AscendXLogo from "@/components/layout/AscendXLogo";
import { CandidateProfileAvatar } from "@/components/interview/PersonaAvatars";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Mic, Volume2 } from "lucide-react";

interface AscendXNavbarProps {
  onOpenGroundingModal?: () => void;
  onOpenVoiceModal?: () => void;
}

export default function AscendXNavbar({
  onOpenGroundingModal,
  onOpenVoiceModal,
}: AscendXNavbarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Mock Interviews", href: "/interview/new" },
    { name: "Resume & JD Grounding", href: "#grounding", action: onOpenGroundingModal },
    { name: "Voice & Speech Coach", href: "#voice-coach", action: onOpenVoiceModal },
    { name: "Day Simulations", href: "/interview/new" },
    { name: "Insights & Trends", href: "/dashboard" },
    { name: "Feedback Hub", href: "/dashboard" },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-100/80 sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo on the far left */}
          <Link href="/dashboard" className="flex items-center">
            <AscendXLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
            {navLinks.map((link) => {
              const isActive =
                activeTab === link.name ||
                (link.href === "/dashboard" && pathname === "/dashboard" && activeTab === "Dashboard");

              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => {
                    setActiveTab(link.name);
                    if (link.action) {
                      link.action();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? "bg-black text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Right Section: User Avatar & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* User Profile Avatar */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group p-0.5 rounded-full hover:ring-2 hover:ring-[#E87A42]/30 transition-all"
              title={user?.email || "Candidate Profile"}
            >
              <CandidateProfileAvatar className="w-9 h-9" />
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-100 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => {
                  setActiveTab(link.name);
                  setIsMobileMenuOpen(false);
                  if (link.action) link.action();
                }}
                className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium ${
                  activeTab === link.name
                    ? "bg-black text-white font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
