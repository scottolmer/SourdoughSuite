import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
};

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 md:space-x-6 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "whitespace-nowrap py-2 md:py-3 px-2 md:px-3 border-b-2 text-xs md:text-sm font-medium transition-colors relative group flex-shrink-0",
                activeTab === tab.id
                  ? "border-[#2B2B2B] text-[#2B2B2B]"
                  : "border-transparent text-[#6E6E6E] hover:text-[#2B2B2B] hover:border-gray-300"
              )}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
