"use client";

import React from "react";

interface TelemetryBoxProps {
  label: string;
  value: string;
  barColor: "green" | "orange";
  bgColor: "olive" | "bronze";
  barHeights: number[]; // relative heights 1-5
}

function TelemetryBox({ label, value, barColor, bgColor, barHeights }: TelemetryBoxProps) {
  const bgClasses = {
    olive: "bg-[#384434]",
    bronze: "bg-[#524134]",
  };

  const barColorClasses = {
    green: "bg-[#72C063]",
    orange: "bg-[#E67E48]",
  };

  return (
    <div
      className={`${bgClasses[bgColor]} text-white rounded-xl p-2.5 flex flex-col justify-between h-[68px] shadow-sm transition-transform hover:scale-[1.02]`}
    >
      <span className="text-[10.5px] font-medium text-slate-300/90 leading-none">
        {label}
      </span>
      <div className="flex items-end justify-between">
        <span className="text-xs font-bold text-white tracking-tight">{value}</span>
        {/* Equalizer Audio Bar Visualizer */}
        <div className="flex items-end gap-[2px] h-4 pb-0.5">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className={`w-[2.5px] rounded-full transition-all duration-300 ${barColorClasses[barColor]}`}
              style={{ height: `${Math.max(3, h * 3)}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DeliveryTelemetry() {
  return (
    <div className="w-full space-y-2">
      <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
        Delivery Telemetry
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <TelemetryBox
          label="Speech Pods"
          value="130 WPM"
          barColor="green"
          bgColor="olive"
          barHeights={[2, 3, 5, 4, 3]}
        />
        <TelemetryBox
          label="Filler Words"
          value="Low"
          barColor="orange"
          bgColor="olive"
          barHeights={[1, 2, 4, 3, 2]}
        />
        <TelemetryBox
          label="Filler Words"
          value="Low"
          barColor="green"
          bgColor="olive"
          barHeights={[2, 4, 5, 3, 1]}
        />
        <TelemetryBox
          label="Filler Words"
          value="Low"
          barColor="orange"
          bgColor="bronze"
          barHeights={[2, 3, 5, 4, 5]}
        />
      </div>
    </div>
  );
}
