import RecommendLayout from "@/components/recommendation/RecommendLayout";
import BreadRecommendationEngine from "@/components/recommendation/BreadRecommendationEngine";
import { BreadRecipe } from "@shared/schema";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Recommend() {
  const [, navigate] = useLocation();
  const [recommendations, setRecommendations] = useState<BreadRecipe[]>([]);

  const handleRecommendationsComplete = (recipes: BreadRecipe[]) => {
    setRecommendations(recipes);
    // Could redirect to a recipes page or stay on the current page
  };

  return (
    <RecommendLayout>
      <BreadRecommendationEngine 
        onRecommendationsComplete={handleRecommendationsComplete} 
      />
    </RecommendLayout>
  );
}