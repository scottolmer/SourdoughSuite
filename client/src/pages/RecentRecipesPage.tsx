import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import RecipeCard from '@/components/recipe/RecipeCard';
import ErrorDisplay from '@/components/ui/error-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { MobileLayout } from '@/components/mobile-layout';

// Define interface for baking log
interface BakingLog {
  id: number;
  recipeId: number;
  recipeName: string;
  starterId: number;
  bakeDate: string;
  overallRating?: number;
  // Add other fields as needed
}

export default function RecentRecipesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Get all baking logs to find recent recipes
  const { 
    data: bakingLogs, 
    isLoading: isLoadingLogs, 
    error: logsError 
  } = useQuery<BakingLog[]>({
    queryKey: ['/api/baking-logs'],
  });
  
  // Set to store unique recipe IDs
  const [recentRecipeIds, setRecentRecipeIds] = useState<number[]>([]);
  
  // Extract unique recipe IDs from the baking logs
  useEffect(() => {
    if (bakingLogs && Array.isArray(bakingLogs)) {
      const uniqueRecipeIds = Array.from(new Set(
        bakingLogs
          .filter(log => log.recipeId !== null)
          .map(log => log.recipeId)
      )) as number[];
      
      // Sort by most recent logs first
      const sortedRecipeIds = uniqueRecipeIds.sort((a, b) => {
        const aLogs = bakingLogs.filter(log => log.recipeId === a);
        const bLogs = bakingLogs.filter(log => log.recipeId === b);
        
        // Get the most recent log date for each recipe
        const aDate = Math.max(...aLogs.map(log => new Date(log.bakeDate).getTime()));
        const bDate = Math.max(...bLogs.map(log => new Date(log.bakeDate).getTime()));
        
        return bDate - aDate; // Most recent first
      });
      
      setRecentRecipeIds(sortedRecipeIds);
    }
  }, [bakingLogs]);
  
  // After getting unique recipe IDs, fetch recipe details
  const { 
    data: recentRecipes, 
    isLoading: isLoadingRecipes, 
    error: recipesError 
  } = useQuery({
    queryKey: ['/api/recipes/batch', recentRecipeIds],
    enabled: recentRecipeIds.length > 0,
    queryFn: async () => {
      if (recentRecipeIds.length === 0) return [];
      
      // Fetch each recipe individually (could be optimized with a batch endpoint)
      const recipes = await Promise.all(
        recentRecipeIds.map(async (id) => {
          const response = await fetch(`/api/recipes/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch recipe ${id}`);
          }
          return response.json();
        })
      );
      
      return recipes;
    }
  });
  
  // Handle any errors
  useEffect(() => {
    if (logsError) {
      toast({
        title: "Failed to load baking logs",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
    
    if (recipesError) {
      toast({
        title: "Failed to load recipe details",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  }, [logsError, recipesError, toast]);

  // Track page view
  useEffect(() => {
    trackEvent('view_recent_recipes', 'recipes', 'recent_recipes_page');
  }, []);
  
  const isLoading = isLoadingLogs || isLoadingRecipes;
  const error = logsError || recipesError;
  
  // View all baking logs
  const handleViewAllLogs = () => {
    trackEvent('view_all_baking_logs', 'recipes', 'recent_recipes_page');
    navigate('/baking-logs');
  };
  
  // Create breadcrumbs for navigation
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Recipes', url: '/recipes' },
    { name: 'Recent Recipes', url: '/recipes/recent' }
  ];

  return (
    <MobileLayout 
      title="Recently Baked Recipes"
      showBackButton
      backHref="/recipes"
      breadcrumbs={breadcrumbs}
      useBottomNav
      rightContent={
        <Button size="sm" onClick={handleViewAllLogs}>
          View All Logs
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorDisplay 
          title="Could not load recent recipes" 
          error="Please try again later" 
        />
      ) : recentRecipes && recentRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold">No baking history found</h2>
          <p className="text-muted-foreground mt-2">
            You haven't baked any recipes yet. Create a timeline and complete a bake to track your baking history.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <Button onClick={() => navigate('/tools/timeline-calculator')}>
              Create a Baking Timeline
            </Button>
            <Button variant="outline" onClick={() => navigate('/recipes')}>
              Browse Recipes
            </Button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}