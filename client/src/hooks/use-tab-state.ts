import { useState } from "react";

export function useTabState(initialTab: string) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const setTab = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  return {
    activeTab,
    setTab
  };
}
