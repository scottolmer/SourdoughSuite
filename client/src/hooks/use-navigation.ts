import { useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom hook to standardize navigation paths throughout the application
 * This ensures consistent URL structure and prevents navigation issues
 */
export function useNavigation() {
  const [, navigate] = useLocation();

  // Recipe-related navigation
  const goToRecipeDetail = useCallback((recipeId: number | string) => {
    navigate(`/recipes/${recipeId}`);
  }, [navigate]);

  const goToRecipeLogs = useCallback((recipeId: number | string) => {
    navigate(`/recipes/${recipeId}/logs`);
  }, [navigate]);

  // Starter-related navigation
  const goToStarterDetail = useCallback((starterId: number | string, slug?: string) => {
    if (slug) {
      navigate(`/starter-product/${slug}`);
    } else {
      navigate(`/starter/${starterId}`);
    }
  }, [navigate]);

  const goToStarterBakingLog = useCallback((starterId: number | string) => {
    navigate(`/starter/baking-log/${starterId}`);
  }, [navigate]);

  // Baking log navigation
  const goToCreateBakingLog = useCallback((recipeId?: number | string, starterId?: number | string) => {
    if (recipeId) {
      // Store in localStorage for retrieval in the form
      localStorage.setItem('bakingLogRecipeId', recipeId.toString());
      
      if (starterId) {
        localStorage.setItem('bakingLogStarterId', starterId.toString());
      } else {
        localStorage.removeItem('bakingLogStarterId');
      }
    }
    
    navigate('/baking-logs/new');
  }, [navigate]);

  const goToBakingLogDetail = useCallback((logId: number | string) => {
    navigate(`/baking-logs/${logId}`);
  }, [navigate]);

  const goToAllBakingLogs = useCallback(() => {
    navigate('/baking-logs');
  }, [navigate]);

  // Tool-related navigation
  const goToBakingJournal = useCallback(() => {
    navigate('/starter/baking-journal');
  }, [navigate]);

  const goToToolsPage = useCallback(() => {
    navigate('/tools');
  }, [navigate]);

  const goToTimeline = useCallback(() => {
    navigate('/tools/timeline-calculator');
  }, [navigate]);

  // General navigation
  const goToHomePage = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goToRecipesPage = useCallback(() => {
    navigate('/recipes');
  }, [navigate]);

  return {
    goToRecipeDetail,
    goToRecipeLogs,
    goToStarterDetail,
    goToStarterBakingLog,
    goToCreateBakingLog,
    goToBakingLogDetail,
    goToAllBakingLogs,
    goToBakingJournal,
    goToToolsPage,
    goToTimeline,
    goToHomePage,
    goToRecipesPage
  };
}