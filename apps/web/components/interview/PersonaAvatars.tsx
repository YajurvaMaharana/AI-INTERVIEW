"use client";

import React from "react";

export function TechGrinderAvatar({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-[#FCE8DE] flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#FDEEE6" />
        {/* Hair back */}
        <ellipse cx="50" cy="40" rx="26" ry="24" fill="#3D2314" />
        {/* Face */}
        <ellipse cx="50" cy="46" rx="20" ry="21" fill="#FFDFC4" />
        {/* Hair front / stylish parted hair */}
        <path d="M26 38 C 30 20, 70 20, 74 38 C 72 32, 60 28, 50 30 C 40 28, 30 32, 26 38 Z" fill="#3D2314" />
        <path d="M28 35 Q 40 26 58 33 Q 48 30 34 40 Z" fill="#2C190E" />
        {/* Eyebrows */}
        <path d="M36 41 Q 42 39 46 41" stroke="#2C190E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M54 41 Q 58 39 64 41" stroke="#2C190E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx="41" cy="47" r="2.5" fill="#1F2937" />
        <circle cx="59" cy="47" r="2.5" fill="#1F2937" />
        {/* Glasses */}
        <rect x="33" y="42" width="16" height="11" rx="3" stroke="#111827" strokeWidth="2.5" fill="rgba(255,255,255,0.25)" />
        <rect x="51" y="42" width="16" height="11" rx="3" stroke="#111827" strokeWidth="2.5" fill="rgba(255,255,255,0.25)" />
        <line x1="49" y1="46" x2="51" y2="46" stroke="#111827" strokeWidth="2.5" />
        <line x1="33" y1="45" x2="28" y2="44" stroke="#111827" strokeWidth="2" />
        <line x1="67" y1="45" x2="72" y2="44" stroke="#111827" strokeWidth="2" />
        {/* Nose */}
        <path d="M50 48 L 49 53 L 52 53" stroke="#E2A684" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Focused smirk / mouth */}
        <path d="M44 59 Q 50 62 56 59" stroke="#9E4E36" strokeWidth="2" strokeLinecap="round" />
        {/* Neck & suit */}
        <rect x="43" y="64" width="14" height="12" fill="#F4C7A9" />
        <path d="M18 100 C 20 74, 34 70, 50 70 C 66 70, 80 74, 82 100 Z" fill="#1E293B" />
        {/* White shirt collar */}
        <polygon points="50,86 42,70 58,70" fill="#FFFFFF" />
        {/* Orange / red tech tie */}
        <polygon points="50,75 53,88 50,100 47,88" fill="#E8602E" />
      </svg>
    </div>
  );
}

export function HRPartnerAvatar({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-[#F8EBE3] flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#FDF3ED" />
        {/* Hair back */}
        <ellipse cx="50" cy="46" rx="30" ry="28" fill="#4A2619" />
        {/* Face */}
        <ellipse cx="50" cy="46" rx="20" ry="21" fill="#E8B298" />
        {/* Hair style wavy front */}
        <path d="M22 45 C 24 24, 76 24, 78 45 C 72 32, 62 27, 50 28 C 38 27, 28 32, 22 45 Z" fill="#5C3120" />
        <path d="M20 45 C 20 62, 28 72, 34 76 C 30 65, 30 50, 32 42 Z" fill="#4A2619" />
        <path d="M80 45 C 80 62, 72 72, 66 76 C 70 65, 70 50, 68 42 Z" fill="#4A2619" />
        {/* Eyebrows */}
        <path d="M37 41 Q 42 38 46 41" stroke="#3D2014" strokeWidth="2" strokeLinecap="round" />
        <path d="M54 41 Q 58 38 63 41" stroke="#3D2014" strokeWidth="2" strokeLinecap="round" />
        {/* Eyes & warm eyelashes */}
        <ellipse cx="42" cy="47" rx="2.5" ry="3" fill="#1F2937" />
        <ellipse cx="58" cy="47" rx="2.5" ry="3" fill="#1F2937" />
        <path d="M39 44 Q 42 43 45 44" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M55 44 Q 58 43 61 44" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
        {/* Warm blush */}
        <ellipse cx="36" cy="52" rx="4" ry="2" fill="#E88470" opacity="0.4" />
        <ellipse cx="64" cy="52" rx="4" ry="2" fill="#E88470" opacity="0.4" />
        {/* Nose */}
        <path d="M50 49 Q 49 53 51 53" stroke="#C88E75" strokeWidth="1.5" strokeLinecap="round" />
        {/* Warm smile */}
        <path d="M43 58 Q 50 65 57 58" stroke="#C24127" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Clothes - warm blazer & top */}
        <rect x="44" y="65" width="12" height="12" fill="#DE9F84" />
        <path d="M22 100 C 24 76, 35 72, 50 72 C 65 72, 76 76, 78 100 Z" fill="#B95C38" />
        <polygon points="50,88 40,72 60,72" fill="#FFFFFF" />
        <circle cx="50" cy="80" r="2.5" fill="#D97706" />
      </svg>
    </div>
  );
}

export function SimulationBossAvatar({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-[#EAEFF5] flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#F1F5F9" />
        {/* Silver Hair back */}
        <ellipse cx="50" cy="40" rx="27" ry="23" fill="#94A3B8" />
        {/* Face */}
        <ellipse cx="50" cy="47" rx="21" ry="22" fill="#F8D3B8" />
        {/* Silver hair top */}
        <path d="M24 38 C 28 20, 72 20, 76 38 C 72 30, 60 26, 50 27 C 40 26, 28 30, 24 38 Z" fill="#CBD5E1" />
        <path d="M26 36 C 36 24, 64 24, 74 36" stroke="#E2E8F0" strokeWidth="3" />
        {/* Eyebrows */}
        <path d="M35 41 Q 42 39 46 42" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M54 42 Q 58 39 65 41" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        {/* Eyes with seasoned look */}
        <circle cx="41" cy="48" r="2.5" fill="#0F172A" />
        <circle cx="59" cy="48" r="2.5" fill="#0F172A" />
        {/* Nose */}
        <path d="M50 49 L 49 54 L 52 54" stroke="#D19876" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Serious composed mouth */}
        <line x1="43" y1="60" x2="57" y2="60" stroke="#8A4E38" strokeWidth="2" strokeLinecap="round" />
        {/* Grey mustache / beard accents */}
        <path d="M44 58 Q 50 56 56 58" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        {/* Executive Navy Suit */}
        <rect x="43" y="65" width="14" height="12" fill="#F0C3A5" />
        <path d="M16 100 C 18 74, 32 68, 50 68 C 68 68, 82 74, 84 100 Z" fill="#1E3A5F" />
        {/* Crisp white dress shirt */}
        <polygon points="50,88 40,68 60,68" fill="#FFFFFF" />
        {/* Executive Blue / Gold Tie */}
        <polygon points="50,72 54,88 50,100 46,88" fill="#0284C7" />
        {/* Lapel details */}
        <path d="M32 75 L 42 92" stroke="#0F2844" strokeWidth="2" />
        <path d="M68 75 L 58 92" stroke="#0F2844" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function SupportiveMentorAvatar({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-[#E6F4EA] dark:bg-[#132A1C] flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#EAF7EE" />
        {/* Hair back */}
        <ellipse cx="50" cy="44" rx="28" ry="26" fill="#2E4A3E" />
        {/* Face */}
        <ellipse cx="50" cy="46" rx="20" ry="21" fill="#FCE2D2" />
        {/* Stylish wavy dark-teal hair */}
        <path d="M24 42 C 26 22, 74 22, 76 42 C 70 30, 60 25, 50 26 C 40 25, 30 30, 24 42 Z" fill="#1B382B" />
        <path d="M22 42 C 22 58, 28 68, 34 72 C 30 62, 30 48, 32 40 Z" fill="#2E4A3E" />
        <path d="M78 42 C 78 58, 72 68, 66 72 C 70 62, 70 48, 68 40 Z" fill="#2E4A3E" />
        {/* Eyebrows */}
        <path d="M36 40 Q 42 37 46 40" stroke="#1B382B" strokeWidth="2" strokeLinecap="round" />
        <path d="M54 40 Q 58 37 64 40" stroke="#1B382B" strokeWidth="2" strokeLinecap="round" />
        {/* Warm patient eyes */}
        <ellipse cx="41" cy="46" rx="2.5" ry="3" fill="#0F172A" />
        <ellipse cx="59" cy="46" rx="2.5" ry="3" fill="#0F172A" />
        <circle cx="42" cy="45" r="0.8" fill="#FFFFFF" />
        <circle cx="60" cy="45" r="0.8" fill="#FFFFFF" />
        {/* Modern wireframe glasses */}
        <circle cx="41" cy="46" r="7" stroke="#10B981" strokeWidth="1.5" fill="rgba(16,185,129,0.08)" />
        <circle cx="59" cy="46" r="7" stroke="#10B981" strokeWidth="1.5" fill="rgba(16,185,129,0.08)" />
        <line x1="48" y1="46" x2="52" y2="46" stroke="#10B981" strokeWidth="1.5" />
        {/* Gentle smiling mouth */}
        <path d="M44 58 Q 50 64 56 58" stroke="#A84C32" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Mentorship teal cardigan */}
        <rect x="44" y="65" width="12" height="12" fill="#F0C7AF" />
        <path d="M20 100 C 22 75, 34 71, 50 71 C 66 71, 78 75, 80 100 Z" fill="#059669" />
        <polygon points="50,86 42,71 58,71" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function CandidateProfileAvatar({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden border-2 border-white shadow-xs flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#2C2F36" />
        {/* Background gradient effect */}
        <rect width="100" height="100" fill="url(#candidate-bg)" />
        {/* Face */}
        <ellipse cx="50" cy="46" rx="22" ry="24" fill="#E5AA8A" />
        {/* Dark curly / styled hair */}
        <path d="M25 40 C 25 18, 75 18, 75 40 C 72 26, 60 22, 50 22 C 40 22, 28 26, 25 40 Z" fill="#1C1410" />
        {/* Eyebrows */}
        <path d="M36 39 Q 42 37 46 39" stroke="#1C1410" strokeWidth="3" strokeLinecap="round" />
        <path d="M54 39 Q 58 37 64 39" stroke="#1C1410" strokeWidth="3" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx="41" cy="44" r="3" fill="#111827" />
        <circle cx="59" cy="44" r="3" fill="#111827" />
        <circle cx="42" cy="43" r="1" fill="#FFFFFF" />
        <circle cx="60" cy="43" r="1" fill="#FFFFFF" />
        {/* Nose */}
        <path d="M50 45 L 48 51 L 52 51" stroke="#BA7857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Beard & Mustache */}
        <path d="M42 54 Q 50 52 58 54 Q 59 66 50 68 Q 41 66 42 54 Z" fill="#1F1713" />
        {/* Mouth line inside beard */}
        <path d="M45 58 Q 50 61 55 58" stroke="#BA7857" strokeWidth="1.5" strokeLinecap="round" />
        {/* Neck & black professional t-shirt / blazer */}
        <rect x="42" y="66" width="16" height="12" fill="#D39775" />
        <path d="M15 100 C 18 76, 32 72, 50 72 C 68 72, 82 76, 85 100 Z" fill="#171923" />
        <path d="M38 72 Q 50 82 62 72" stroke="#2D3748" strokeWidth="2" fill="none" />
        <defs>
          <linearGradient id="candidate-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#374151" />
            <stop offset="1" stopColor="#111827" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
