"use client";

import React from "react";

interface AscendXLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  iconOnly?: boolean;
}

export default function AscendXLogo({
  className = "",
  size = "md",
  showSubtitle = true,
  iconOnly = false,
}: AscendXLogoProps) {
  const iconSizes = {
    xs: "h-6 w-6",
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  const textSizes = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-lg sm:text-[1.18rem]",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const arrowSizes = {
    xs: "w-2.5 h-2.5 -top-1 -right-2",
    sm: "w-3 h-3 -top-1 -right-2.5",
    md: "w-3.5 h-3.5 -top-1.5 -right-3",
    lg: "w-4 h-4 -top-2 -right-3.5",
    xl: "w-5 h-5 -top-2.5 -right-4.5",
  };

  const subtextSizes = {
    xs: "text-[6.5px]",
    sm: "text-[7.5px]",
    md: "text-[8.5px]",
    lg: "text-[10px]",
    xl: "text-[12px]",
  };

  return (
    <div
      id="ascendx-brand-logo"
      className={`group flex items-center gap-2.5 select-none ${className}`}
    >
      {/* 3D Peach / Orange Gradient 'X' & Ascending Crystal Architecture Graphic */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}
      >
        <svg
          viewBox="0 0 100 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(234,88,12,0.22)] dark:drop-shadow-[0_4px_16px_rgba(251,146,60,0.35)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* 3D Peach / Apricot Gradient for Bar 1 */}
            <linearGradient
              id="bar1-grad"
              x1="12"
              y1="48"
              x2="28"
              y2="76"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#FB923C" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0.9" />
            </linearGradient>

            {/* 3D Golden-Peach Gradient for Bar 2 */}
            <linearGradient
              id="bar2-grad"
              x1="24"
              y1="30"
              x2="40"
              y2="76"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#FDBA74" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.85" />
            </linearGradient>

            {/* 3D Central Monolithic Apex Spire Left Face */}
            <linearGradient
              id="spire-left-grad"
              x1="36"
              y1="12"
              x2="50"
              y2="76"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFF7ED" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#FED7AA" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FB923C" stopOpacity="0.85" />
            </linearGradient>

            {/* 3D Central Monolithic Apex Spire Right Face */}
            <linearGradient
              id="spire-right-grad"
              x1="50"
              y1="12"
              x2="58"
              y2="76"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#EA580C" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#C2410C" stopOpacity="0.95" />
            </linearGradient>

            {/* 3D Translucent X Arm 1 (Downward-Right stroke) */}
            <linearGradient
              id="x-stroke1-grad"
              x1="46"
              y1="22"
              x2="88"
              y2="78"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FB923C" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#EA580C" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#E11D48" stopOpacity="0.9" />
            </linearGradient>

            {/* 3D Translucent X Arm 2 (Upward-Right stroke) */}
            <linearGradient
              id="x-stroke2-grad"
              x1="40"
              y1="76"
              x2="84"
              y2="20"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#FB923C" stopOpacity="0.95" />
              <stop offset="80%" stopColor="#FED7AA" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFF1E6" stopOpacity="0.98" />
            </linearGradient>

            {/* Facet Light Reflections */}
            <linearGradient
              id="facet-light"
              x1="40"
              y1="20"
              x2="70"
              y2="50"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
            </linearGradient>

            {/* Glowing Filament Stream Gradient */}
            <linearGradient
              id="filament-grad"
              x1="16"
              y1="64"
              x2="84"
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FED7AA" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Stepped Pillar 1: Outer Left Rounded Bar */}
          <rect
            x="12"
            y="48"
            width="14"
            height="28"
            rx="7"
            fill="url(#bar1-grad)"
          />
          <rect
            x="13.5"
            y="49.5"
            width="11"
            height="14"
            rx="5.5"
            fill="url(#facet-light)"
            opacity="0.6"
          />

          {/* Stepped Pillar 2: Middle Taller Rounded Bar */}
          <rect
            x="24"
            y="32"
            width="15"
            height="44"
            rx="7.5"
            fill="url(#bar2-grad)"
          />
          <rect
            x="25.5"
            y="33.5"
            width="12"
            height="20"
            rx="6"
            fill="url(#facet-light)"
            opacity="0.7"
          />

          {/* Stepped Pillar 3: Central Apex 3D Spire */}
          {/* Left Facet */}
          <polygon
            points="36,76 36,26 50,10 50,76"
            fill="url(#spire-left-grad)"
          />
          {/* Right Facet */}
          <polygon
            points="50,10 60,22 60,76 50,76"
            fill="url(#spire-right-grad)"
          />
          {/* Top Apex Highlight Edge */}
          <polygon
            points="36,26 50,10 52,14 40,28"
            fill="#FFFFFF"
            opacity="0.4"
          />

          {/* 3D 'X' Graphic - Primary Crossing Beams */}
          {/* Beam 1: Downward-Right Arm */}
          <polygon
            points="46,24 60,18 88,62 74,76"
            fill="url(#x-stroke1-grad)"
          />
          <polygon
            points="54,20 60,18 88,62 82,68"
            fill="url(#facet-light)"
            opacity="0.4"
          />

          {/* Beam 2: Upward-Right Arm */}
          <polygon
            points="44,76 58,76 86,28 72,20"
            fill="url(#x-stroke2-grad)"
          />
          <polygon
            points="72,20 86,28 80,38 68,28"
            fill="url(#facet-light)"
            opacity="0.5"
          />

          {/* Glowing Network Constellation Filaments & Energy Lines */}
          <path
            d="M 14 62 Q 32 54 50 42 T 84 26"
            stroke="url(#filament-grad)"
            strokeWidth="1.3"
            fill="none"
          />
          <path
            d="M 22 52 Q 44 48 62 34 T 80 20"
            stroke="url(#filament-grad)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="2 2"
          />

          {/* Radiant Light Nodes / Constellation Intersections */}
          <circle cx="28" cy="56" r="3" fill="#FB923C" opacity="0.4" />
          <circle cx="28" cy="56" r="1.4" fill="#FFFFFF" />

          <circle cx="48" cy="44" r="3.8" fill="#FED7AA" opacity="0.5" />
          <circle cx="48" cy="44" r="1.8" fill="#FFFFFF" />

          <circle cx="66" cy="32" r="4.2" fill="#FB923C" opacity="0.6" />
          <circle cx="66" cy="32" r="2" fill="#FFFFFF" />

          <circle cx="82" cy="22" r="3.2" fill="#F97316" opacity="0.5" />
          <circle cx="82" cy="22" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Typography Stack (Rendered when not iconOnly) */}
      {!iconOnly && (
        <div className="flex flex-col justify-center leading-none">
          <div
            className={`font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5 ${textSizes[size]}`}
          >
            {/* Mixed-Case Brand Name: Ascend */}
            <span className="font-extrabold tracking-tight">Ascend</span>

            {/* Styled 'X' with Upward Arrow Accent */}
            <span className="relative inline-flex items-center font-black">
              <span className="bg-gradient-to-tr from-[#EA580C] via-[#FB923C] to-[#F97316] bg-clip-text text-transparent">
                X
              </span>

              {/* Integrated Upward Arrow matching the reference logo */}
              <svg
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`absolute ${arrowSizes[size]} text-[#EA580C] dark:text-[#FB923C] transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}
              >
                <path
                  d="M3.5 10.5L10.5 3.5M10.5 3.5H5.5M10.5 3.5V8.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          {/* Clean Subtitle: AI INTERVIEW PLATFORM */}
          {showSubtitle && (
            <span
              className={`font-bold tracking-[0.22em] text-slate-500 dark:text-slate-400 uppercase mt-0.5 whitespace-nowrap ${subtextSizes[size]}`}
            >
              AI INTERVIEW PLATFORM
            </span>
          )}
        </div>
      )}
    </div>
  );
}
