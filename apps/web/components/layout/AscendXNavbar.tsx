"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AscendXLogo from "@/components/layout/AscendXLogo";
import { CandidateProfileAvatar } from "@/components/interview/PersonaAvatars";
import ProfileEditModal from "@/components/profile/ProfileEditModal";
import VoiceCoachModal from "@/components/interview/VoiceCoachModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  Bot,
  FileText,
  AudioLines,
  Laptop,
  TrendingUp,
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  SlidersHorizontal,
  ChevronRight,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Edit3,
} from "lucide-react";

interface AscendXNavbarProps {
  onOpenGroundingModal?: () => void;
  onOpenVoiceModal?: () => void;
}

export default function AscendXNavbar({
  onOpenGroundingModal,
  onOpenVoiceModal,
}: AscendXNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // State for mobile drawer, expandable labels, profile menu and modal
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandAllLabels, setExpandAllLabels] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVoiceCoachOpen, setIsVoiceCoachOpen] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Mock Interviews",
      href: "/interview/new",
      icon: Bot,
    },
    {
      name: "Resume & JD Grounding",
      href: "/resume-jd-grounding",
      icon: FileText,
    },
    {
      name: "Voice & Speech Coach",
      href: "/voice-coach",
      icon: AudioLines,
      action: () => router.push("/voice-coach"),
    },
    {
      name: "Day Simulations",
      href: "/interview/simulation",
      icon: Laptop,
      action: () => router.push("/interview/new?mode=simulation"),
    },
    {
      name: "Insights & Trends",
      href: "/dashboard/insights",
      icon: TrendingUp,
      action: () => router.push("/dashboard?view=insights"),
    },
    {
      name: "Feedback Hub",
      href: "/feedback-hub",
      icon: Sparkles,
      action: () => router.push("/feedback-hub"),
    },
  ];

  const u = user as any;
  const candidateDisplayName =
    u?.display_name ||
    u?.user_metadata?.display_name ||
    u?.user_metadata?.full_name ||
    u?.email?.split("@")[0] ||
    "Candidate";

  const candidateTargetRole =
    u?.target_role ||
    u?.user_metadata?.target_role ||
    "Full-Stack Engineer";

  return (
    <>
      <header className="sticky top-2 sm:top-3 z-50 w-full px-3 sm:px-6 lg:px-8">
        {/* Floating Rounded Navbar Container */}
        <div className="max-w-[1400px] mx-auto rounded-2xl sm:rounded-full bg-white/95 dark:bg-[#151922]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-3.5 sm:px-5 py-2 transition-all duration-300">
          <div className="flex items-center justify-between h-12">
            {/* Logo on the far left */}
            <Link
              href="/dashboard"
              className="flex items-center transition-transform hover:scale-[1.02]"
            >
              <AscendXLogo size="md" />
            </Link>

            {/* Desktop Navigation: Collapsible Icons & Interactive Expansion */}
            <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5 bg-slate-100/70 dark:bg-[#1C2230]/70 p-1 rounded-full border border-slate-200/60 dark:border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : item.href === "/interview/new"
                    ? pathname.startsWith("/interview") || pathname.startsWith("/mock-interviews")
                    : item.href === "/resume-jd-grounding"
                    ? pathname.startsWith("/resume-jd-grounding")
                    : pathname === item.href;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out cursor-pointer select-none ${
                      isActive
                        ? "bg-[#E8602E] text-white font-semibold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#283144]"
                    }`}
                    title={item.name}
                  >
                    {/* Clean Feature Icon */}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? "text-white"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-[#E87A42]"
                      }`}
                    />

                    {/* Collapsible Label: expands smoothly on active, hover, or when global expand is on */}
                    <span
                      className={`transition-all duration-300 ease-out whitespace-nowrap overflow-hidden ${
                        isActive || expandAllLabels
                          ? "max-w-[200px] opacity-100"
                          : "max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}

              {/* Icon Label Expand Toggle Switch */}
              <button
                type="button"
                onClick={() => setExpandAllLabels(!expandAllLabels)}
                className="p-1.5 ml-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-[#283144] transition-colors"
                title={
                  expandAllLabels
                    ? "Collapse Feature Labels"
                    : "Expand All Labels"
                }
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </nav>

            {/* Right Section: Theme Toggle + Candidate Profile Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dark Mode / Light Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="relative p-2 rounded-full bg-slate-100 dark:bg-[#1E2433] text-slate-700 dark:text-amber-400 hover:bg-[#FFF6F0] dark:hover:bg-[#2A3245] border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200 shadow-2xs group"
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 text-slate-700" />
                )}
              </button>

              {/* Candidate Profile Avatar & Interactive Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  id="profile-dropdown-trigger"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1.5 p-0.5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-2 hover:ring-[#E87A42] transition-all focus:outline-hidden"
                  aria-expanded={isProfileMenuOpen}
                  title="Candidate profile and options"
                >
                  <CandidateProfileAvatar className="w-8 h-8 sm:w-9 sm:h-9" />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block mr-1" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div
                    id="profile-dropdown-menu"
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#181D28] border border-slate-200/90 dark:border-slate-800 shadow-xl py-2 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                  >
                    {/* User Header */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {candidateDisplayName}
                      </p>
                      <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium truncate">
                        {candidateTargetRole}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {user?.email || "candidate@example.com"}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1 text-xs">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800/60 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <User className="w-4 h-4 text-orange-500" />
                        <span>Candidate Profile Page</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800/60 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left"
                      >
                        <Edit3 className="w-4 h-4 text-orange-500" />
                        <span>Quick Edit Profile</span>
                      </button>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800/60 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        href="/interview/new"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800/60 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <Bot className="w-4 h-4 text-slate-400" />
                        <span>Start Mock Interview</span>
                      </Link>
                    </div>

                    {/* Footer: Sign Out */}
                    <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        type="button"
                        id="navbar-logout-button"
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                type="button"
                className="xl:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="xl:hidden border-t border-slate-100 dark:border-slate-800 mt-2 pt-3 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {/* Profile Shortcut on mobile */}
              <div className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CandidateProfileAvatar className="w-8 h-8" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {candidateDisplayName}
                    </p>
                    <p className="text-[11px] text-orange-600 dark:text-orange-400">
                      {candidateTargetRole}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20"
                >
                  Edit
                </Link>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (item.action) {
                        item.action();
                      } else if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#E8602E] text-white font-semibold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#E87A42]"}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 px-1">
                <Link
                  href="/profile"
                  id="mobile-nav-profile-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Candidate Profile Page</span>
                </Link>

                <button
                  type="button"
                  id="mobile-nav-quick-edit-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-xl text-left"
                >
                  <Edit3 className="w-4 h-4 text-orange-500" />
                  <span>Quick Edit Profile</span>
                </button>

                <Link
                  href="/interview/new"
                  id="mobile-nav-start-interview-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  <Bot className="w-4 h-4 text-slate-400" />
                  <span>Start Mock Interview</span>
                </Link>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    id="mobile-nav-logout-btn"
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Quick Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Voice & Speech Coach Modal */}
      <VoiceCoachModal
        isOpen={isVoiceCoachOpen}
        onClose={() => setIsVoiceCoachOpen(false)}
      />
    </>
  );
}
