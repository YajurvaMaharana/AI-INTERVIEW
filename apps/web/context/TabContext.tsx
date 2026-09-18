"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type TabType =
  | "dashboard"
  | "mock-interviews"
  | "resume-grounding"
  | "voice-coach"
  | "day-simulations"
  | "insights"
  | "feedback-hub";

interface TabContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabContext = createContext<TabContextType>({
  activeTab: "dashboard",
  setActiveTab: () => {},
});

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const safeSetActiveTab = (tab: TabType) => {
    if (tab && typeof tab === "string") {
      setActiveTab(tab);
    } else {
      setActiveTab("dashboard");
    }
  };

  return (
    <TabContext.Provider
      value={{
        activeTab: activeTab || "dashboard",
        setActiveTab: safeSetActiveTab,
      }}
    >
      {children}
    </TabContext.Provider>
  );
}

export function useTab() {
  return useContext(TabContext);
}
