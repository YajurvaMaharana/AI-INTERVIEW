"use client";

import React, { useState } from "react";

interface DataPoint {
  x: number; // 0, 50, 100, 150, 200, 250
  y: number; // 0-100
  label: string;
}

const defaultData: DataPoint[] = [
  { x: 0, y: 20, label: "Baseline Diagnostic" },
  { x: 50, y: 48, label: "50m - Core Algorithms" },
  { x: 100, y: 39, label: "100m - Hard Concurrency" },
  { x: 150, y: 68, label: "150m - System Design" },
  { x: 200, y: 72, label: "200m - Behavioral STAR" },
  { x: 250, y: 92, label: "250m - Master Lead Mock" },
];

export default function CompetencyGrowthLineChart() {
  const [activeToggle, setActiveToggle] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  // SVG Chart Dimensions
  const svgWidth = 320;
  const svgHeight = 220;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Coordinate mappers
  const mapX = (xVal: number) => paddingLeft + (xVal / 250) * chartWidth;
  const mapY = (yVal: number) => paddingTop + chartHeight - (yVal / 100) * chartHeight;

  // Points
  const points = defaultData.map((d) => ({
    xCoord: mapX(d.x),
    yCoord: mapY(d.y),
    raw: d,
  }));

  // Build SVG path
  let pathD = `M ${points[0].xCoord} ${points[0].yCoord}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX1 = current.xCoord + (next.xCoord - current.xCoord) * 0.45;
    const controlY1 = current.yCoord;
    const controlX2 = next.xCoord - (next.xCoord - current.xCoord) * 0.45;
    const controlY2 = next.yCoord;
    pathD += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.xCoord} ${next.yCoord}`;
  }

  // Area under curve
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const baselineY = mapY(0);
  const areaD = `${pathD} L ${lastPoint.xCoord} ${baselineY} L ${firstPoint.xCoord} ${baselineY} Z`;

  const yTicks = [100, 80, 60, 40, 20, 0];
  const xTicks = [0, 50, 100, 150, 200, 250];

  return (
    <div className="flex flex-col justify-between w-full h-full min-h-[300px]">
      {/* Header with Title and Toggle */}
      <div className="flex items-center justify-between w-full pb-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-snug max-w-[200px]">
          Competency Score Growth Over Time
        </h3>
        <button
          type="button"
          onClick={() => setActiveToggle(!activeToggle)}
          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-hidden ${
            activeToggle ? "bg-slate-300 dark:bg-slate-700" : "bg-slate-200 dark:bg-slate-800"
          }`}
          aria-label="Toggle growth metric"
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              activeToggle ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full py-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Orange gradient area beneath curve */}
            <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#F97316" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.02" />
            </linearGradient>

            <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#EA580C" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Horizontal Grid lines & Y-Axis Labels */}
          {yTicks.map((val) => {
            const y = mapY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-500 dark:fill-slate-400 font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {xTicks.map((val) => {
            const x = mapX(val);
            return (
              <text
                key={val}
                x={x}
                y={svgHeight - 10}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 dark:fill-slate-400 font-medium"
              >
                {val}
              </text>
            );
          })}

          {/* Area under curve */}
          <path d={areaD} fill="url(#lineAreaGrad)" />

          {/* Orange Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#E87A42"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Point Dots */}
          {points.map((pt, idx) => (
            <g
              key={idx}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredPoint(pt.raw)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle cx={pt.xCoord} cy={pt.yCoord} r="12" fill="transparent" />
              <circle
                cx={pt.xCoord}
                cy={pt.yCoord}
                r="4.5"
                fill="#FFFFFF"
                stroke="#E87A42"
                strokeWidth="2.5"
                filter="url(#pointGlow)"
                className="transition-transform duration-150 group-hover:scale-125"
              />
              <circle
                cx={pt.xCoord}
                cy={pt.yCoord}
                r="1.8"
                fill="#E87A42"
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-0 right-2 bg-slate-900 dark:bg-slate-800 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-md shadow-md animate-fade-in pointer-events-none">
            <div className="font-bold text-amber-400">Score: {hoveredPoint.y}/100</div>
            <div className="text-[10px] text-slate-300 dark:text-slate-400">{hoveredPoint.label}</div>
          </div>
        )}
      </div>
    </div>
  );
}
