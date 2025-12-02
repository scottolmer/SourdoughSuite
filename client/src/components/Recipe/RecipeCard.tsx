import { BreadRecipe } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Gauge, Clock, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface RecipeCardProps {
  recipe: BreadRecipe & { 
    isAIGenerated?: boolean;
    matchScore?: number;
  };
  matchPercentage?: number;
}

export default function RecipeCard({ recipe, matchPercentage }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row">
        
        <div className="w-full md:w-full p-4 md:p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle className="text-xl md:text-2xl font-serif mb-1">{recipe.name}</CardTitle>
              <div className="text-sm text-gray-500">
                {(recipe as any).author ? (
                  <span>By <span className="font-medium">{(recipe as any).author}</span></span>
                ) : (
                  <span>Custom Recipe</span>
                )}
              </div>
            </div>
            
            {matchPercentage !== undefined && (
              <div className="bg-amber-50 px-3 py-1.5 rounded-full flex items-center">
                <Gauge size={16} className="text-amber-600 mr-1.5" />
                <span className="font-mono text-sm font-semibold text-amber-700">{matchPercentage}% Match</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 md:line-clamp-3">
            {recipe.description || "A delicious sourdough bread recipe."}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.isAIGenerated && (
              <Badge variant="outline" className="text-xs font-medium bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 flex items-center">
                <Sparkles size={12} className="mr-1 text-amber-500" />
                AI-Generated
              </Badge>
            )}
            
            {recipe.difficulty && (
              <Badge variant="outline" className="text-xs font-mono bg-gray-50">
                {recipe.difficulty}
              </Badge>
            )}
            
            {recipe.totalTime && (
              <Badge variant="outline" className="text-xs font-mono bg-gray-50 flex items-center">
                <Clock size={12} className="mr-1" />
                {recipe.totalTime}
              </Badge>
            )}
            
            {recipe.hydration && (
              <Badge variant="outline" className="text-xs font-mono bg-gray-50">
                {recipe.hydration}% Hydration
              </Badge>
            )}
          </div>
          
          {matchPercentage !== undefined && (
            <div className="mt-2 mb-4 text-sm text-gray-600">
              <div className="mb-1 font-medium">Match Details:</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-500">Texture:</span>{" "}
                  <span className={getMatchColor(matchPercentage)}>
                    {matchPercentage >= 80 ? "Excellent" : 
                      matchPercentage >= 60 ? "Good" : 
                      matchPercentage >= 40 ? "Fair" : "Poor"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Flavor:</span>{" "}
                  <span className={getMatchColor(matchPercentage)}>
                    {matchPercentage >= 80 ? "Excellent" : 
                      matchPercentage >= 60 ? "Good" : 
                      matchPercentage >= 40 ? "Fair" : "Poor"}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            {recipe.isAIGenerated ? (
              <Link href={`/ai-recipe/${recipe.id}`}>
                <Button 
                  variant="ghost" 
                  className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-4"
                >
                  View Recipe <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            ) : (
              <Link href={`/recipes/${recipe.id}`}>
                <Button variant="ghost" className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-4">
                  View Recipe <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function getMatchColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600 font-medium";
  if (percentage >= 60) return "text-amber-600 font-medium";
  if (percentage >= 40) return "text-orange-600 font-medium";
  return "text-red-600 font-medium";
}