import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Clock, Users, ChefHat } from 'lucide-react';

interface RecommendedRecipesProps {
  starterId: string | number;
  starterName: string;
}

interface Recipe {
  id: number;
  name: string;
  description: string;
  totalTime: string;
  difficulty: string;
  hydration: number;
  yields: string;
  imageUrl?: string;
}

// Starter-specific recipe recommendations
const starterRecipeMap: Record<number, number[]> = {
  7: [1, 2, 3], // San Francisco Style - Classic recipes
  1: [4, 5, 6], // Homemade Starter - Beginner recipes
  6: [7, 8, 9], // Koji Starter - Advanced recipes
  8: [10, 11, 12], // Kombucha Starter - Experimental recipes
  10: [13, 14, 15], // House Blend - Versatile recipes
};

export default function RecommendedRecipes({ starterId, starterName }: RecommendedRecipesProps) {
  const { data: allRecipes } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
    staleTime: 5 * 60 * 1000,
  });

  // Convert starterId to number for lookup
  const numericStarterId = typeof starterId === 'string' ? parseInt(starterId) : starterId;
  
  // Get recommended recipe IDs for this starter
  const recommendedIds = starterRecipeMap[numericStarterId] || [];
  
  // Filter recipes to get the recommended ones, or fallback to first 3 public recipes
  let recommendedRecipes: Recipe[] = [];
  
  if (allRecipes && allRecipes.length > 0) {
    // Try to get specific recommended recipes first
    recommendedRecipes = allRecipes.filter(recipe => recommendedIds.includes(recipe.id)).slice(0, 3);
    
    // If we don't have enough recommended recipes, add popular ones
    if (recommendedRecipes.length < 3) {
      const additionalRecipes = allRecipes
        .filter(recipe => !recommendedIds.includes(recipe.id))
        .slice(0, 3 - recommendedRecipes.length);
      recommendedRecipes = [...recommendedRecipes, ...additionalRecipes];
    }
  }

  if (!recommendedRecipes.length) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Recommended Recipes for {starterName}
        </h2>
        <p className="text-gray-600">
          These recipes are specifically chosen to showcase the unique characteristics of your {starterName.toLowerCase()}.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {recommendedRecipes.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  {recipe.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {recipe.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {recipe.totalTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{recipe.totalTime}</span>
                    </div>
                  )}
                  
                  {recipe.difficulty && (
                    <div className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3" />
                      <span>{recipe.difficulty}</span>
                    </div>
                  )}
                  
                  {recipe.yields && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{recipe.yields}</span>
                    </div>
                  )}
                </div>
                
                {recipe.hydration && (
                  <div className="mt-2 text-xs text-amber-600 font-medium">
                    {recipe.hydration}% Hydration
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Link href="/recipes">
          <button className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors">
            View All Recipes
          </button>
        </Link>
      </div>
    </div>
  );
}