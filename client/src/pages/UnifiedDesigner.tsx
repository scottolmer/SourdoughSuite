import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import AIRecipeCreator from "@/components/BreadTools/AIRecipeCreator";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";

// Import the AIEnhancedRecipe interface from our component
interface AIEnhancedRecipe {
  id: number;
  name: string;
  isAIGenerated: boolean;
  matchScore?: number;
  [key: string]: any; // Allow for other BreadRecipe properties
}

export default function AIBreadRecipeCreatorPage() {
  const [, navigate] = useLocation();
  const [generatedRecipe, setGeneratedRecipe] = useState<AIEnhancedRecipe | null>(null);

  const handleRecipeGenerated = (recipe: AIEnhancedRecipe) => {
    setGeneratedRecipe(recipe);
    console.log("AI recipe generated:", recipe);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="text-xs font-mono text-[#6E6E6E] mr-2">AI.BREAD</span>
              <div className="h-px bg-gray-300 flex-grow"></div>
            </div>
            <div className="flex items-center mb-2">
              <h1 className="text-3xl md:text-4xl font-serif text-[#2B2B2B] tracking-tight mr-3">
                AI Bread Recipe Creator
              </h1>
              <div className="bg-amber-100 rounded-full px-3 py-1 flex items-center">
                <Sparkles size={16} className="text-amber-600 mr-1.5" />
                <span className="text-xs font-semibold text-amber-700">AI POWERED</span>
              </div>
            </div>
            <p className="text-[#6E6E6E] max-w-3xl">
              Design your perfect sourdough bread with our AI-powered recipe generator. Simply define your texture 
              and flavor preferences, and our AI will create a custom recipe crafted to your exact specifications.
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <AIRecipeCreator onRecipeGenerated={handleRecipeGenerated} />
        </div>
      </div>
    </Layout>
  );
}