"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import {
  TechGrinderAvatar,
  HRPartnerAvatar,
  SimulationBossAvatar,
} from "@/components/interview/PersonaAvatars";

export type PersonaId = "tech-grinder" | "hr-partner" | "simulation-boss";

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
      name: "Strict Tech Grinder",
      avatar: <TechGrinderAvatar className="w-11 h-11" />,
      description: "Fast-paced deep technical drill with real-time edge case probes.",
    },
    {
      id: "hr-partner" as PersonaId,
      name: "Warm HR Partner",
      avatar: <HRPartnerAvatar className="w-11 h-11" />,
      description: "Supportive behavioral STAR methodology & culture alignment.",
    },
    {
      id: "simulation-boss" as PersonaId,
      name: "Simulation AI Boss",
      avatar: <SimulationBossAvatar className="w-11 h-11" />,
      description: "Executive engineering management & cross-functional trade-offs.",
    },
  ];

  return (
    <div className="w-full space-y-2.5">
      {/* Header with Title and Orange Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 tracking-tight">
          Select Interviewer Persona
        </h3>
        <button
          type="button"
          onClick={() => setPersonaActive(!personaActive)}
          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-hidden ${
            personaActive ? "bg-[#E87A42]" : "bg-slate-300"
          }`}
          aria-label="Toggle persona selection"
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              personaActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* 3 Personas Horizontal Grid */}
      <div className="grid grid-cols-3 gap-2">
        {personas.map((p) => {
          const isSelected = currentSelected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p.id)}
              className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl transition-all duration-200 text-center ${
                isSelected
                  ? "border-2 border-[#E87A42] bg-[#FFF6F0] shadow-sm"
                  : "border border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs"
              }`}
            >
              {/* Checkmark badge for selected persona */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#E87A42] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {/* Avatar Illustration */}
              <div className="py-1">{p.avatar}</div>

              {/* Label */}
              <span className="text-[11px] font-semibold text-slate-800 leading-tight mt-1">
                {p.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
