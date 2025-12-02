import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { ArrowLeft, Edit, Trash2, Clock, Gauge, ChefHat, BookOpen, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileLayout } from '@/components/mobile-layout';
import { useRecipe } from '@/hooks/use-recipes';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { generateRecipeSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@/hooks/use-navigation';
import { BreadRecipe } from '@shared/schema';

// Extended recipe interface to handle additional properties returned from API
interface ExtendedRecipe extends BreadRecipe {
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  yield?: string;
  author?: string;
  ratingCount?: number;
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const recipeId = parseInt(id);
  const { data: recipe, isLoading, isError } = useRecipe(recipeId);
  const navigation = useNavigation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStarterId, setSelectedStarterId] = useState<string>("none");
  
  // Fetch available starters
  const { data: starters, isLoading: isLoadingStarters } = useQuery({
    queryKey: ['/api/starters'],
    queryFn: async () => {
      const response = await fetch('/api/starters');
      if (!response.ok) {
        throw new Error('Failed to fetch starters');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return <MobileLayout showBackButton title="Recipe Details">
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-40 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-60 bg-gray-200 rounded mb-2 mx-auto"></div>
          <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    </MobileLayout>;
  }

  if (isError || !recipe) {
    return <MobileLayout showBackButton title="Recipe Details">
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Recipe Not Found</h2>
        <p className="text-gray-500 mb-4">The recipe you're looking for doesn't exist or was deleted.</p>
        <Button onClick={() => navigation.goToRecipesPage()}>Go to Recipes</Button>
      </div>
    </MobileLayout>;
  }

  const handleDelete = () => {
    // Would implement the actual delete functionality here
    toast({
      title: "Recipe deleted",
      description: "Recipe has been permanently removed",
    });
    navigation.goToRecipesPage();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Prepare recipe data for SEO
  const prepareRecipeForSEO = () => {
    // Cast recipe to ExtendedRecipe type to handle additional properties
    const extendedRecipe = recipe as unknown as ExtendedRecipe;
    
    // Extract ingredients and instructions from recipe
    const ingredients = Array.isArray(extendedRecipe.ingredients) 
      ? (extendedRecipe.ingredients as string[]) 
      : [];
    
    const instructions = Array.isArray(extendedRecipe.instructions) 
      ? (extendedRecipe.instructions as string[])
      : [];
    
    // Convert cooking times to ISO 8601 durations if available
    const prepTime = extendedRecipe.prepTimeMinutes ? `PT${extendedRecipe.prepTimeMinutes}M` : undefined;
    const cookTime = extendedRecipe.cookTimeMinutes ? `PT${extendedRecipe.cookTimeMinutes}M` : undefined;
    const totalTime = extendedRecipe.totalTimeMinutes ? `PT${extendedRecipe.totalTimeMinutes}M` : extendedRecipe.totalTime;
    
    // Generate breadcrumb items
    const breadcrumbItems = [
      { name: "Home", url: "/" },
      { name: "Recipes", url: "/recipes" },
      { name: extendedRecipe.name, url: `/recipes/${extendedRecipe.id}` }
    ];
    
    return {
      schemaData: {
        name: extendedRecipe.name,
        description: extendedRecipe.description || `${extendedRecipe.name} - Artisan bread recipe`,
        image: extendedRecipe.imageUrl || "/images/default-recipe.jpg",
        prepTime,
        cookTime,
        totalTime,
        recipeYield: extendedRecipe.yield || extendedRecipe.yields || "1 loaf",
        recipeIngredients: ingredients,
        recipeInstructions: instructions,
        recipeCategory: "Bread",
        recipeCuisine: "Artisan",
        author: extendedRecipe.author || "Bakehouse Breads",
        datePublished: extendedRecipe.createdAt || new Date().toISOString(),
        url: `/recipes/${extendedRecipe.id}`,
        keywords: [
          "sourdough recipe", 
          "artisan bread", 
          extendedRecipe.name, 
          extendedRecipe.difficulty ? `${extendedRecipe.difficulty} bread recipe` : "bread recipe",
          extendedRecipe.hydration ? `${extendedRecipe.hydration}% hydration bread` : "sourdough bread"
        ],
        recipeRating: extendedRecipe.rating ? {
          ratingValue: extendedRecipe.rating,
          ratingCount: extendedRecipe.ratingCount || 1
        } : undefined
      },
      breadcrumbs: breadcrumbItems
    };
  };
  
  const seoData = prepareRecipeForSEO();

  // Create breadcrumbs for this page
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Recipes', href: '/recipes' },
    { label: recipe.name } // Current page should not have href
  ];

  return (
    <MobileLayout 
      showBackButton 
      title="Recipe Details" 
      backHref="/recipes"
      breadcrumbs={breadcrumbItems}
      rightContent={
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigation.goToRecipeDetail(recipeId)}>
            <Edit className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      }
    >
      <SEO
        title={`${recipe.name} - Sourdough Bread Recipe | Bakehouse Breads`}
        description={recipe.description || `${recipe.name} - A delicious sourdough bread recipe with step-by-step instructions and ${recipe.hydration ? `${recipe.hydration}% hydration` : 'detailed'} baking guidance.`}
        keywords={seoData.schemaData.keywords}
        canonicalUrl={`/recipes/${recipe.id}`}
        structuredData={[
          generateRecipeSchema(seoData.schemaData),
          generateBreadcrumbSchema(seoData.breadcrumbs)
        ]}
        ogImage={recipe.imageUrl || '/images/default-recipe.jpg'}
      />
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{recipe.name}</h1>
          <p className="text-gray-500">Recipe ID: {recipe.id}</p>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {recipe.difficulty && (
              <Badge className={getDifficultyColor(String(recipe.difficulty))}>
                {recipe.difficulty}
              </Badge>
            )}
            
            {recipe.totalTime && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.totalTime}
              </Badge>
            )}
            
            {recipe.hydration && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                {recipe.hydration}% Hydration
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="details" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Method</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            {recipe.description ? (
              <div className="prose prose-sm max-w-none">
                <p>{recipe.description}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No description available</p>
            )}
          </TabsContent>
          <TabsContent value="ingredients">
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {recipe.ingredients.map((ingredient: any, i: number) => (
                  <li key={i} className="flex items-center justify-between py-1">
                    <span>{ingredient.name || 'Ingredient'}</span>
                    <span className="text-sm text-muted-foreground">
                      {ingredient.amount || ''} {ingredient.unit || ''}
                      {ingredient.bakersPercentage ? ` (${ingredient.bakersPercentage})` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No ingredients listed</p>
            )}
          </TabsContent>
          <TabsContent value="instructions">
            {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
              <ol className="list-decimal list-inside space-y-3">
                {(recipe.instructions as string[]).map((instruction: string, i: number) => (
                  <li key={i} className="pl-2">{instruction}</li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500 italic">No instructions available</p>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ChefHat className="mr-2 h-5 w-5" />
              Create Baking Log
            </CardTitle>
            <CardDescription>
              Track your results baking this recipe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select Starter (Optional)
              </label>
              <Select
                value={selectedStarterId}
                onValueChange={setSelectedStarterId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a starter..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No starter selected</SelectItem>
                  {starters?.map((starter: any) => (
                    <SelectItem key={starter.id} value={starter.id.toString()}>
                      {starter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose which sourdough starter you'll use with this recipe
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              onClick={() => {
                // Store parameters in localStorage instead of URL params
                localStorage.setItem('bakingLogRecipeId', recipeId.toString());
                if (selectedStarterId !== 'none') {
                  localStorage.setItem('bakingLogStarterId', selectedStarterId);
                } else {
                  localStorage.removeItem('bakingLogStarterId');
                }
                
                console.log("Storing in localStorage - Recipe ID:", recipeId, "Selected Starter ID:", selectedStarterId);
                navigation.goToCreateBakingLog();
              }}
            >
              Start Baking Log
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigation.goToRecipeLogs(recipeId)}
            >
              View Previous Logs
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}