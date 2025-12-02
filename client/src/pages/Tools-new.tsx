import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

// Import only the components we want
import RecipeValidator from "@/components/BreadTools/RecipeValidator";
import StarterQuiz from "@/components/BreadTools/StarterQuiz";
import TimelineCalculator from "@/components/BreadTools/TimelineCalculator";
import CustomRecipeGenerator from "@/components/BreadTools/CustomRecipeGenerator";
import AIIngredientSubstitution from "@/components/BreadTools/AIIngredientSubstitution";
import AIBakingTroubleshooter from "@/components/BreadTools/AIBakingTroubleshooter";

// Define exactly 6 tabs
const TOOL_TABS = [
  { id: "starter-quiz", label: "Starter Quiz", component: StarterQuiz },
  { id: "recipe-validator", label: "Recipe Validator", component: RecipeValidator },
  { id: "timeline-calculator", label: "Timeline Calculator", component: TimelineCalculator },
  { id: "custom-recipe-generator", label: "Custom Recipe Generator", component: CustomRecipeGenerator },
  { id: "ingredient-substitution", label: "AI Ingredient Substitution", component: AIIngredientSubstitution },
  { id: "baking-troubleshooter", label: "AI Baking Troubleshooter", component: AIBakingTroubleshooter }
];

export default function Tools() {
  const [activeTab, setActiveTab] = useState("starter-quiz");

  // Listen for custom tab change events and scroll to top on page load
  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent) => {
      const tabId = event.detail;
      if (TOOL_TABS.some(tab => tab.id === tabId)) {
        setActiveTab(tabId);
      }
    };

    document.addEventListener('switchTab', handleSwitchTab as EventListener);
    
    // Check URL query param for tab selection
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && TOOL_TABS.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
    
    return () => {
      document.removeEventListener('switchTab', handleSwitchTab as EventListener);
    };
  }, []);

  // Separate effect for scroll-to-top that runs after content loads
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const scrollToTop = () => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    };
    
    // Multiple attempts to ensure scroll works
    scrollToTop();
    setTimeout(scrollToTop, 100);
    setTimeout(scrollToTop, 500);
  }, []);

  const ActiveComponent = TOOL_TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="mb-12">
        <div className="flex items-center mb-2">
          <span className="text-xs font-mono text-[#6E6E6E] mr-2">TOOLBOX.01</span>
          <div className="h-px bg-gray-300 flex-grow"></div>
        </div>
        <h1 className="text-[#2B2B2B] text-3xl md:text-4xl font-serif tracking-tight mb-6">
          Precision Baking Instruments
        </h1>
        <p className="text-[#6E6E6E] max-w-2xl mb-8 leading-relaxed">
          A collection of digital tools designed for methodical bakers seeking precise, reproducible results 
          through scientific approach and structured experimentation.
        </p>
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-2 md:space-x-6 overflow-x-auto pb-1 scrollbar-none">
              {TOOL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`whitespace-nowrap py-2 md:py-3 px-2 md:px-3 border-b-2 text-xs md:text-sm font-medium transition-colors relative group flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-[#2B2B2B] text-[#2B2B2B]"
                      : "border-transparent text-[#6E6E6E] hover:text-[#2B2B2B] hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Featured AI Recipe Creator Card */}
      <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-4 md:mb-0 md:mr-6">
            <div className="flex items-center mb-2">
              <Sparkles size={20} className="text-amber-600 mr-2" />
              <h2 className="text-2xl font-serif text-amber-800">AI Bread Recipe Creator</h2>
            </div>
            <p className="text-amber-700 mb-4 max-w-2xl">
              Our most advanced tool yet! Create completely custom sourdough bread recipes using AI technology.
              Define your texture and flavor preferences, and our AI will generate a perfect recipe just for you.
            </p>
            <Link href="/ai-recipe-creator">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white flex items-center">
                <Sparkles size={16} className="mr-2" />
                Try the AI Recipe Creator
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
              POWERED BY AI
            </div>
          </div>
        </div>
      </div>
      
      {/* Tool Content */}
      <div className="bg-white border border-gray-100 rounded-lg p-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}