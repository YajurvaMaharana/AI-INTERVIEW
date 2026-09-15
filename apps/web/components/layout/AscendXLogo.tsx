"use client";

import React from "react";

interface AscendXLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function AscendXLogo({ className = "", size = "md" }: AscendXLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const subtextSizes = {
    sm: "text-[7.5px]",
    md: "text-[8.5px]",
    lg: "text-[9.5px]",
  };

  return (
    <div id="ascendx-brand-logo" className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Stylized Mountain / Layered Geometric Triangle 'A' Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 44 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_4px_rgba(232,96,46,0.2)]"
        >
          {/* Back soft triangle */}
          <polygon
            points="12,36 24,10 36,36"
            fill="url(#ascendx-grad-1)"
            opacity="0.85"
          />
          {/* Left foreground peak */}
          <polygon
            points="4,36 18,16 28,36"
            fill="url(#ascendx-grad-2)"
          />
          {/* Right dominant peak */}
          <polygon
            points="16,36 30,4 42,36"
            fill="url(#ascendx-grad-3)"
          />
          {/* Subtle facet overlay */}
          <polygon
            points="22,36 30,4 34,36"
            fill="#FFFFFF"
            opacity="0.25"
          />
          <defs>
            <linearGradient id="ascendx-grad-1" x1="12" y1="10" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5A070" />
              <stop offset="1" stopColor="#E8602E" />
            </linearGradient>
            <linearGradient id="ascendx-grad-2" x1="4" y1="16" x2="28" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EE7D47" />
              <stop offset="1" stopColor="#C9491B" />
            </linearGradient>
            <linearGradient id="ascendx-grad-3" x1="16" y1="4" x2="42" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F38D56" />
              <stop offset="0.5" stopColor="#E8602E" />
              <stop offset="1" stopColor="#A83610" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text Stack */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-black tracking-tight text-slate-900 dark:text-white flex items-center ${textSizes[size]}`}>
          <span>ASCEND</span>
          <span className="text-[#E8602E] font-black">X</span>
        </div>
        <span
          className={`font-bold tracking-[0.18em] text-slate-500 dark:text-slate-400 uppercase mt-0.5 ${subtextSizes[size]}`}
        >
          AI INTERVIEW PLATFORM
        </span>
      </div>
    </div>
  );
}
