import React from 'react';
import { useParams, Link } from 'wouter';
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, CalendarDays, ArrowRight, Clock, PlusCircle, FileSpreadsheet } from 'lucide-react';
import { useRecipe } from '@/hooks/use-recipes';
import { format } from 'date-fns';
import { SEO } from '@/components/SEO';
import { generateWebpageSEO } from '@/lib/schema';
import { useNavigation } from '@/hooks/use-navigation';
import ErrorDisplay from '@/components/ui/error-display';

// Would normally fetch from API:
const useBakingLogs = (recipeId: number) => {
  // Simulate API request
  const [logs, setLogs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      // Empty logs for now
      setLogs([]);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [recipeId]);
  
  return { logs, isLoading };
};

export default function BakingLogsPage() {
  const { id } = useParams<{ id: string }>();
  const recipeId = parseInt(id);
  const { data: recipe, isLoading: isLoadingRecipe, isError } = useRecipe(recipeId);
  const { logs, isLoading: isLoadingLogs } = useBakingLogs(recipeId);
  const navigation = useNavigation();

  // Generate SEO data
  const seoData = generateWebpageSEO({
    title: recipe ? `${recipe.name} Baking Logs | Bakehouse Breads` : 'Baking Logs | Bakehouse Breads',
    description: recipe ? `View your baking logs for ${recipe.name} with detailed tracking of oven spring, crumb structure, and flavor` : 'Track your bread baking results',
    canonicalUrl: `/recipes/${recipeId}/logs`,
    type: 'website',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Recipes', url: '/recipes' },
      { name: recipe?.name || 'Recipe', url: `/recipes/${recipeId}` },
      { name: 'Baking Logs', url: `/recipes/${recipeId}/logs` }
    ]
  });

  // Handle error state
  if (isError) {
    // Error state breadcrumbs
    const errorBreadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Recipes', url: '/recipes' },
      { name: 'Baking Logs', url: `/recipes/${recipeId}/logs` }
    ];
    
    return (
      <MobileLayout 
        showBackButton 
        title="Baking Logs" 
        backHref="/recipes"
        breadcrumbs={errorBreadcrumbs}
      >
        <div className="p-4">
          <ErrorDisplay
            title="Could not load recipe"
            description="We couldn't find the recipe information for these baking logs."
            retry={() => navigation.goToRecipesPage()}
          >
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigation.goToRecipesPage()}>
                Go to Recipes
              </Button>
            </div>
          </ErrorDisplay>
        </div>
      </MobileLayout>
    );
  }

  // Create breadcrumbs
  const breadcrumbItems = recipe ? [
    { name: 'Home', url: '/' },
    { name: 'Recipes', url: '/recipes' },
    { name: recipe.name, url: `/recipes/${recipeId}` },
    { name: 'Baking Logs', url: `/recipes/${recipeId}/logs` }
  ] : [
    { name: 'Home', url: '/' },
    { name: 'Recipes', url: '/recipes' },
    { name: 'Baking Logs', url: `/recipes/${recipeId}/logs` }
  ];

  return (
    <>
      <SEO 
        title={recipe ? `${recipe.name} Baking Logs | Bakehouse Breads` : 'Baking Logs | Bakehouse Breads'}
        description={recipe ? `View your baking logs for ${recipe.name} with detailed tracking of oven spring, crumb structure, and flavor` : 'Track your bread baking results'}
        canonicalUrl={`/recipes/${recipeId}/logs`}
        structuredData={seoData}
      />
      <MobileLayout 
        title={recipe ? `${recipe.name} Logs` : 'Baking Logs'} 
        showBackButton 
        breadcrumbs={breadcrumbItems}
        backHref={`/recipes/${recipeId}`}
      >
        <div className="p-4 space-y-6">
          {/* Recipe Info */}
          {isLoadingRecipe ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{recipe?.name}</CardTitle>
                <CardDescription>Baking logs for this recipe</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {recipe?.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => {
                    // Store recipe ID in localStorage for the form
                    localStorage.setItem('bakingLogRecipeId', recipeId.toString());
                    navigation.goToCreateBakingLog();
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Baking Log
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Logs List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Baking Logs</h2>
              <Badge variant="outline" className="ml-2">
                {isLoadingLogs ? '...' : logs.length}
              </Badge>
            </div>

            {isLoadingLogs ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-4/5" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Baking Logs Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't created any baking logs for this recipe yet. 
                      Start tracking your bakes to improve your results!
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      localStorage.setItem('bakingLogRecipeId', recipeId.toString());
                      navigation.goToCreateBakingLog();
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Log
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200">
                    <div onClick={() => navigation.goToBakingLogDetail(log.id)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{format(new Date(log.bakingDate), 'MMMM d, yyyy')}</CardTitle>
                          {log.isFavorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <CardDescription className="flex items-center text-xs">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {log.starterName || 'No starter specified'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{log.bulkFermentationTime} + {log.proofingTime}</span>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {log.ovenSpring}/5
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {log.flavor}/5
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{log.notes || 'No notes'}</p>
                        <div className="flex justify-end mt-2">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </MobileLayout>
    </>
  );
}