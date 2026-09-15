"use client";

import React, { useState } from "react";

interface SkillReadinessRadarProps {
  communication?: number; // 0-100
  techDepth?: number;
  deliveryPace?: number;
  starStorytelling?: number;
}

export default function SkillReadinessRadar({
  communication = 88,
  techDepth = 78,
  deliveryPace = 84,
  starStorytelling = 92,
}: SkillReadinessRadarProps) {
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  // Radar parameters
  const size = 260;
  const center = size / 2;
  const radius = 90;

  // Scale 0-100 to coordinates
  // Top: Communication (angle = -90 deg / -PI/2)
  // Right: STAR Storytelling (angle = 0 deg)
  // Bottom: Delivery Pace (angle = 90 deg / PI/2)
  // Left: Tech Depth (angle = 180 deg / PI)
  const topX = center;
  const topY = center - (radius * communication) / 100;

  const rightX = center + (radius * starStorytelling) / 100;
  const rightY = center;

  const bottomX = center;
  const bottomY = center + (radius * deliveryPace) / 100;

  const leftX = center - (radius * techDepth) / 100;
  const leftY = center;

  const polygonPoints = `${topX},${topY} ${rightX},${rightY} ${bottomX},${bottomY} ${leftX},${leftY}`;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full min-h-[300px]">
      <div className="w-full flex items-center justify-between pb-1">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Skill Readiness Radar Chart
        </h3>
      </div>

      <div className="relative flex items-center justify-center w-full py-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[270px] h-auto overflow-visible select-none"
        >
          <defs>
            {/* Soft olive/greenish radial backdrop matching reference image */}
            <radialGradient id="radarBackdrop" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A4B998" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#BACDB0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#E2EBE0" stopOpacity="0.05" />
            </radialGradient>

            {/* Warm Orange Gradient for the active skill polygon */}
            <linearGradient id="radarPolygonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#EA580C" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.45" />
            </linearGradient>

            {/* Dot Glow filter */}
            <filter id="radarDotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#EA580C" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Organic soft green circular backdrop glow */}
          <circle cx={center} cy={center} r={radius + 4} fill="url(#radarBackdrop)" />

          {/* Concentric rings */}
          {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="0.8"
              strokeDasharray={level === 1 ? "none" : "2,2"}
              opacity="0.75"
            />
          ))}

          {/* Cross Axes Lines */}
          <line
            x1={center}
            y1={center - radius}
            x2={center}
            y2={center + radius}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.6"
          />
          <line
            x1={center - radius}
            y1={center}
            x2={center + radius}
            y2={center}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.6"
          />

          {/* Radar Skill Shape Polygon */}
          <polygon
            points={polygonPoints}
            fill="url(#radarPolygonGrad)"
            stroke="#E87A42"
            strokeWidth="2.2"
            strokeLinejoin="round"
            className="transition-all duration-300 drop-shadow-sm"
          />

          {/* Internal diagonal lines for organic facet effect */}
          <line x1={center} y1={center} x2={topX} y2={topY} stroke="#E87A42" strokeWidth="1" opacity="0.4" />
          <line x1={center} y1={center} x2={rightX} y2={rightY} stroke="#E87A42" strokeWidth="1" opacity="0.4" />
          <line x1={center} y1={center} x2={bottomX} y2={bottomY} stroke="#E87A42" strokeWidth="1" opacity="0.4" />
          <line x1={center} y1={center} x2={leftX} y2={leftY} stroke="#E87A42" strokeWidth="1" opacity="0.4" />

          {/* Nodes */}
          {/* Top: Communication */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredAxis("Communication")}
            onMouseLeave={() => setHoveredAxis(null)}
          >
            <circle cx={topX} cy={topY} r="5" fill="#FFFFFF" stroke="#E87A42" strokeWidth="2.5" filter="url(#radarDotGlow)" />
            <circle cx={topX} cy={topY} r="2" fill="#E87A42" />
          </g>

          {/* Right: STAR Storytelling */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredAxis("STAR Storytelling")}
            onMouseLeave={() => setHoveredAxis(null)}
          >
            <circle cx={rightX} cy={rightY} r="5" fill="#FFFFFF" stroke="#E87A42" strokeWidth="2.5" filter="url(#radarDotGlow)" />
            <circle cx={rightX} cy={rightY} r="2" fill="#E87A42" />
          </g>

          {/* Bottom: Delivery Pace */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredAxis("Delivery Pace")}
            onMouseLeave={() => setHoveredAxis(null)}
          >
            <circle cx={bottomX} cy={bottomY} r="5" fill="#FFFFFF" stroke="#E87A42" strokeWidth="2.5" filter="url(#radarDotGlow)" />
            <circle cx={bottomX} cy={bottomY} r="2" fill="#E87A42" />
          </g>

          {/* Left: Tech Depth */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredAxis("Tech Depth")}
            onMouseLeave={() => setHoveredAxis(null)}
          >
            <circle cx={leftX} cy={leftY} r="5" fill="#FFFFFF" stroke="#E87A42" strokeWidth="2.5" filter="url(#radarDotGlow)" />
            <circle cx={leftX} cy={leftY} r="2" fill="#E87A42" />
          </g>

          {/* Axis Text Labels */}
          {/* Top */}
          <text
            x={center}
            y={center - radius - 12}
            textAnchor="middle"
            className="text-[11px] font-semibold fill-slate-800 tracking-tight"
          >
            Communication
          </text>

          {/* Bottom */}
          <text
            x={center}
            y={center + radius + 18}
            textAnchor="middle"
            className="text-[11px] font-semibold fill-slate-800 tracking-tight"
          >
            Delivery Pace
          </text>

          {/* Left - Vertical / Rotated */}
          <text
            x={center - radius - 16}
            y={center}
            textAnchor="middle"
            transform={`rotate(-90 ${center - radius - 16} ${center})`}
            className="text-[11px] font-semibold fill-slate-800 tracking-tight"
          >
            Tech Depth
          </text>

          {/* Right - Vertical / Rotated */}
          <text
            x={center + radius + 16}
            y={center}
            textAnchor="middle"
            transform={`rotate(90 ${center + radius + 16} ${center})`}
            className="text-[11px] font-semibold fill-slate-800 tracking-tight"
          >
            STAR Storytelling
          </text>
        </svg>

        {/* Hover Tooltip / Score Badge */}
        {hoveredAxis && (
          <div className="absolute top-2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md shadow-md animate-fade-in pointer-events-none">
            {hoveredAxis}:{" "}
            <span className="font-bold text-amber-400">
              {hoveredAxis === "Communication"
                ? `${communication}%`
                : hoveredAxis === "Tech Depth"
                ? `${techDepth}%`
                : hoveredAxis === "Delivery Pace"
                ? `${deliveryPace}%`
                : `${starStorytelling}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
