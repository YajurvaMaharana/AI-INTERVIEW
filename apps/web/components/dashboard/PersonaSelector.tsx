"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import {
  TechGrinderAvatar,
  HRPartnerAvatar,
  SimulationBossAvatar,
  SupportiveMentorAvatar,
  SkepticalInterrogatorAvatar,
} from "@/components/interview/PersonaAvatars";

export type PersonaId = "tech-grinder" | "hr-partner" | "simulation-boss" | "supportive-mentor" | "skeptical-interrogator";

interface PersonaSelectorProps {
  selectedPersona?: PersonaId;
  onSelectPersona?: (id: PersonaId) => void;
}

export default function PersonaSelector({
  selectedPersona: controlledSelected,
  onSelectPersona,
}: PersonaSelectorProps) {
  const [internalSelected, setInternalSelected] = useState<PersonaId>("tech-grinder");
  const [personaActive, setPersonaActive] = useState(true);

  const currentSelected = controlledSelected || internalSelected;

  const handleSelect = (id: PersonaId) => {
    setInternalSelected(id);
    onSelectPersona?.(id);
  };

  const personas = [
    {
      id: "tech-grinder" as PersonaId,
      name: "Alex Vance",
      title: "Strict Tech Grinder",
      avatar: <TechGrinderAvatar className="w-11 h-11" />,
      tagline: "Rigorous & Edge-Case Heavy",
      description: "Probes algorithmic bounds, latency constraints, and implementation specifics.",
    },
    {
      id: "hr-partner" as PersonaId,
      name: "Sarah Jenkins",
      title: "Warm HR Partner",
      avatar: <HRPartnerAvatar className="w-11 h-11" />,
      tagline: "STAR Behavioral Expert",
      description: "Focuses on leadership, cross-functional conflict, culture, and team empathy.",
    },
    {
      id: "skeptical-interrogator" as PersonaId,
      name: "Dr. Viktor Cole",
      title: "Skeptical Interrogator",
      avatar: <SkepticalInterrogatorAvatar className="w-11 h-11" />,
      tagline: "Challenger & Proof-Driven",
      description: "Relentlessly challenges assumptions, demands rigorous mathematical proofs, and tests failure boundaries.",
    },
    {
      id: "simulation-boss" as PersonaId,
      name: "Marcus Sterling",
      title: "Simulation AI Boss",
      avatar: <SimulationBossAvatar className="w-11 h-11" />,
      tagline: "Executive Architecture & ROI",
      description: "Direct engineering manager probing cost trade-offs, roadmap, and organizational impact.",
    },
    {
      id: "supportive-mentor" as PersonaId,
      name: "Elena Rostova",
      title: "Supportive Mentor",
      avatar: <SupportiveMentorAvatar className="w-11 h-11" />,
      tagline: "Pedagogical & Confidence Booster",
      description: "Guides you through tricky problems with constructive hints, patience, and positive reinforcement.",
    },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Header with Title and Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Interviewer Persona & Evaluator Style
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Choose who will conduct and evaluate your session
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
          5 AI Personas
        </span>
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {personas.map((p) => {
          const isSelected = currentSelected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p.id)}
              className={`relative flex flex-col items-center justify-between p-3 rounded-2xl transition-all duration-200 text-center cursor-pointer group ${
                isSelected
                  ? "border-2 border-[#E8602E] bg-[#FFF6F0] dark:bg-[#2A1D17] shadow-sm ring-2 ring-[#E8602E]/20"
                  : "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181E29] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
              }`}
            >
              {/* Checkmark badge for selected persona */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E8602E] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {/* Avatar Illustration */}
              <div className="py-1 group-hover:scale-105 transition-transform duration-200">{p.avatar}</div>

              {/* Identity Details */}
              <div className="mt-1.5 space-y-0.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {p.name}
                </p>
                <p className="text-[11px] font-semibold text-[#E8602E] leading-tight">
                  {p.title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1">
                  {p.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
