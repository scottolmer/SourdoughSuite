import React, { useState, useEffect } from "react";
import { BreadRecipe } from "@shared/schema";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/recipe/RecipeCard";
import TestRecipeCard from "@/components/recipe/TestRecipeCard";
import { AlertTriangle, BookmarkCheck, RefreshCw, ArrowUpDown, Clock, Star } from "lucide-react";
import { MobileLayout } from "@/components/mobile-layout";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAllRecipes, useDeleteRecipe } from "@/hooks/use-recipes";
import { useToast } from "@/hooks/use-toast";

// Extended interface for AI-generated recipes
interface SavedRecipe extends BreadRecipe {
  isAIGenerated?: boolean;
  matchScore?: number;
}

export default function MyRecipes() {
  const [sortedRecipes, setSortedRecipes] = useState<SavedRecipe[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Use the react-query hook for fetching recipes
  const { 
    data: allRecipes = [], 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useAllRecipes();
  
  // Get the mutation for deleting recipes
  const deleteMutation = useDeleteRecipe();
  
  // Set error message if query fails
  useEffect(() => {
    if (queryError) {
      setError("Failed to load your recipes from the database.");
    } else {
      setError(null);
    }
  }, [queryError]);

  // Filter the recipes that belong to the user (userId === 1) or are AI generated
  const recipes = allRecipes.filter((recipe: SavedRecipe) => 
    recipe.isAIGenerated === true || recipe.userId === 1 // Assuming user ID 1 for now, same as in original code
  );
  
  // Function to refresh recipes
  const loadRecipes = () => {
    refetch();
  };

  // Sort recipes whenever the recipes array or sortBy value changes
  useEffect(() => {
    let sorted = [...recipes];
    
    switch (sortBy) {
      case "newest":
        sorted = sorted.sort((a, b) => {
          // Assuming createdAt is a string date - parse and compare
          const dateA = new Date(a.createdAt || "");
          const dateB = new Date(b.createdAt || "");
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "oldest":
        sorted = sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || "");
          const dateB = new Date(b.createdAt || "");
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case "name_asc":
        sorted = sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        sorted = sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "difficulty":
        // Order: beginner, intermediate, advanced
        const difficultyOrder = { "beginner": 1, "intermediate": 2, "advanced": 3 };
        sorted = sorted.sort((a, b) => {
          const orderA = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 99;
          const orderB = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 99;
          return orderA - orderB;
        });
        break;
      case "match_score":
        // Use type assertion to handle the additional matchScore property
        sorted = sorted.sort((a, b) => {
          const scoreA = (a as SavedRecipe).matchScore || 0;
          const scoreB = (b as SavedRecipe).matchScore || 0;
          return scoreB - scoreA;
        });
        break;
      default:
        // Default to newest
        sorted = sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || "");
          const dateB = new Date(b.createdAt || "");
          return dateB.getTime() - dateA.getTime();
        });
    }
    
    setSortedRecipes(sorted);
  }, [recipes, sortBy]);

  const handleRemoveRecipe = async (id: number) => {
    // Display a confirmation dialog
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }
    
    try {
      // Use the delete mutation from react-query
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Recipe deleted",
        description: "Recipe has been removed from your collection.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add refresh button 
  const handleRefresh = () => {
    loadRecipes();
  };

  // Create breadcrumbs for navigation
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Recipes', url: '/recipes' },
    { name: 'My Recipes', url: '/recipes/my-recipes' }
  ];

  return (
    <MobileLayout 
      title="My Saved Recipes" 
      useBottomNav
      breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Your personal collection of saved recipes, including AI-generated and your own custom recipes.
        </p>

        <div className="flex justify-between items-center gap-4">
          <p className="text-muted-foreground">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
          </p>
          
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center">
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Newest first</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Oldest first</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name_asc">
                    <div className="flex items-center gap-2">
                      <span>Name (A-Z)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name_desc">
                    <div className="flex items-center gap-2">
                      <span>Name (Z-A)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="difficulty">
                    <div className="flex items-center gap-2">
                      <span>Difficulty (easy-hard)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="match_score">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>Match Score</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {recipes.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-md p-8 text-center">
                <BookmarkCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Saved Recipes Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't saved any recipes yet. Use the recipe generator to create custom
                  sourdough recipes or create your own recipes from scratch.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <a href="/recipes/new">Create AI Recipe</a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedRecipes.map((recipe) => (
                  <div key={recipe.id} className="relative flex flex-col">
                    <div className="flex justify-end mb-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white hover:bg-red-50 text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveRecipe(recipe.id)}
                      >
                        Remove
                      </Button>
                    </div>
                    <TestRecipeCard 
                      recipe={recipe} 
                      matchPercentage={(recipe as SavedRecipe).matchScore} 
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}