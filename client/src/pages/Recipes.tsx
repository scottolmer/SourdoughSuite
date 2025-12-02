import { useState } from 'react';
import { Link } from 'wouter';
import { useAllRecipes, usePublicRecipes, useUserRecipes } from '@/hooks/use-recipes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Plus, BookOpen } from "lucide-react";
import ModernistRecipeTemplate from '@/components/Recipe/ModernistRecipeTemplate';
import UserRecipeList from '@/components/Recipe/UserRecipeList';
import Layout from '@/components/Layout';
import { BreadRecipe } from '@shared/schema';

export default function Recipes() {
  const [selectedRecipe, setSelectedRecipe] = useState<BreadRecipe | null>(null);
  const [currentTab, setCurrentTab] = useState('public');
  
  const { data: allRecipes = [], isLoading: isLoadingAll } = useAllRecipes();
  const { data: publicRecipes = [], isLoading: isLoadingPublic } = usePublicRecipes();
  const { data: userRecipes = [], isLoading: isLoadingUser } = useUserRecipes(1); // Using demo user ID 1

  const handleViewRecipe = (recipe: BreadRecipe) => {
    setSelectedRecipe(recipe);
    setCurrentTab('selected');
  };

  // Sample recipe data based on Second-Chance Sourdough
  const sourdoughExampleRecipe = {
    title: "SECOND-CHANCE SOURDOUGH",
    description: "With this revolutionary recipe, you give leftover or inactive levain a second chance. Levain may be a leavener first, but it also contributes flavor. This recipe uses inactive levain that you have frozen and thawed (see page 52). It will have little or no leavening power left—thus the addition of instant yeast. Ultimately, this is an inactive-preferment direct dough flavored with levain, evoking sourdough flavor in much less time.",
    ingredients: [
      { name: "Water", weight: "315 g", volume: "1½ cups", percentage: 65.63 },
      { name: "Instant dry yeast", weight: "4 g", volume: "1½ tsp", percentage: 0.83 },
      { name: "Inactive levain, thawed", weight: "195 g", volume: "¾ cup + 2 Tbsp", percentage: 40.63, notes: "see page 53" },
      { name: "Bread flour", weight: "480 g", volume: "3½ cups", percentage: 100 },
      { name: "Wheat bran", weight: "10 g", volume: "3 Tbsp", percentage: 2.08 },
      { name: "Fine salt", weight: "12 g", volume: "2 tsp", percentage: 2.5 },
      { name: "Diastatic malt powder", weight: "1 g", volume: "⅛ tsp", percentage: 0.21 },
    ],
    yields: "~1,000 kg", // This is a different field than stats.yield
    process: [
      { 
        name: "MIX", 
        description: "combine the water and yeast in the mixer's bowl, and stir to dissolve yeast; add the inactive levain, flour, bran, salt, and diastatic malt powder, and mix on low speed to a shaggy mass; mix on medium speed to medium gluten development, 4-5 min; transfer to a lightly oiled tub or bowl, and cover well with a lid or plastic wrap" 
      },
      { 
        name: "BULK FERMENT", 
        description: "bulk ferment, covered, for 2½ h at 21° C / 70° F; perform 4 four-edge folds (1 fold every 30 min after the first 30 min; see page 76); rest the dough, covered, for 30 min after the final fold; check for full gluten development using the windowpane test (see page 60)"
      },
      { 
        name: "PRESHAPE", 
        description: "boule (see page 88)" 
      },
      { 
        name: "REST", 
        description: "20 min, well covered" 
      },
      { 
        name: "SHAPE", 
        description: "boule (see page 88)" 
      },
      { 
        name: "FINAL PROOF", 
        description: "proof (see page 94) for 1-2 h at 21° C / 70° F, well covered" 
      },
      { 
        name: "SCORE", 
        description: "transfer to the base of a cast-iron combination cooker (see pages 140-141); score as desired (see page 112); cover with the preheated (optional) lid (see page 134)" 
      },
      { 
        name: "BAKE", 
        description: "place the pan into a 260° C / 500° F oven; drop the temperature to 245° C / 470° F, and bake for 45 min with the lid on; remove the lid, and bake for an additional 10 min" 
      },
    ],
    stats: {
      totalTime: "",
      activeTime: "35-40 min",
      inactiveTime: "7¾ h",
      difficulty: "Easy: mixing, shaping",
      yield: "1 kg boule",
      storage: "2-3 room temp 2 mo frozen"
    },
    tips: [
      "If you'd like to warm-proof your dough, you can proof it at 27° C / 80° F for 1-1½ h for large loaves, 30-45 min for small loaves, 30-45 min for rolls, or 1-1½ h for a home-sized miche."
    ],
    notes: ["For salt, flour, and other substitutions, see pages xviii-xx."],
    imageUrl: "https://images.unsplash.com/photo-1604080072035-97c364f7edac?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
  };

  // Convert database recipe to format needed for the ModernistRecipeTemplate
  const convertRecipeForTemplate = (recipe: BreadRecipe) => {
    try {
      // First, calculate flour weight for baker's percentage reference
      let totalFlourWeight = 0;
      if (Array.isArray(recipe.ingredients)) {
        const flourIngredients = recipe.ingredients.filter((ing: any) => 
          ing.name.toLowerCase().includes('flour') || 
          ing.isFlour === true
        );
        
        if (flourIngredients.length > 0) {
          totalFlourWeight = flourIngredients.reduce((sum: number, ing: any) => {
            const amount = parseFloat(ing.amount) || 0;
            return sum + amount;
          }, 0);
        }
      }
      
      const ingredients = Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.map((ingredient: any) => {
            // If percentage is already provided, use it
            let percentage = ingredient.percentage;
            
            // If no percentage but we have flour weight, calculate baker's percentage
            if (percentage === undefined && totalFlourWeight > 0) {
              const amount = parseFloat(ingredient.amount) || 0;
              percentage = (amount / totalFlourWeight) * 100;
            }
            
            return {
              name: ingredient.name,
              weight: ingredient.amount,
              volume: ingredient.volume || "",
              percentage: percentage !== undefined ? Number(percentage) : (
                // If it's flour, default to 100%
                ingredient.name.toLowerCase().includes('flour') ? 100 : 0
              )
            };
          })
        : [];

      const instructions = Array.isArray(recipe.instructions)
        ? recipe.instructions.map((instruction: string, index: number) => ({
            name: `STEP ${index + 1}`,
            description: instruction
          }))
        : [];

      return {
        title: recipe.name,
        description: recipe.description || "",
        ingredients,
        process: instructions,
        stats: {
          yield: "1 loaf",
          difficulty: "Custom Recipe",
          activeTime: "30-40 min",
          inactiveTime: "8-10 h",
          totalTime: "10-12 h",
          storage: "3-5 days at room temperature"
        },
        yields: "1 loaf",
        tips: [],
        notes: [],
        imageUrl: recipe.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300"
      };
    } catch (error) {
      console.error("Error converting recipe:", error);
      return sourdoughExampleRecipe;
    }
  };

  // Render recipe cards
  const renderRecipeCards = (recipes: BreadRecipe[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden flex flex-col h-full">
              <div className="h-48 bg-stone-100" />
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex flex-wrap gap-1 mt-2">
                  <Skeleton className="h-5 w-16 mb-1 mr-1" />
                  <Skeleton className="h-5 w-16 mb-1 mr-1" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="pt-2">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (!recipes || recipes.length === 0) {
      return (
        <div className="p-8 border rounded-lg bg-amber-50 border-amber-200 text-amber-800 text-center">
          <h3 className="text-lg font-medium mb-2">No Recipes Found</h3>
          <p>There are no recipes available in this category.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden flex flex-col h-full">
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ 
                backgroundImage: `url(${recipe.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300"})` 
              }}
            />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{recipe.name}</CardTitle>
              <div className="flex flex-wrap gap-1 mt-2">
                {recipe.isPublic && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 mb-1 mr-1">
                    Public
                  </Badge>
                )}
                {recipe.tags && Array.isArray(recipe.tags) && recipe.tags.map((tag: any, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 mb-1 mr-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm line-clamp-3">
                {recipe.description || "No description available"}
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleViewRecipe(recipe)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" /> View Recipe
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-semibold mb-2">Bread Recipes</h1>
            <p className="text-muted-foreground max-w-2xl">
              Explore a collection of artisanal bread recipes, including community contributions and expert formulations. Find the perfect bread to bake next.
            </p>
          </div>
          
          <Button className="md:self-start" asChild>
            <Link href="/tools">
              <Plus className="mr-2 h-4 w-4" />
              Create New Recipe
            </Link>
          </Button>
        </div>
      </header>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="mb-8 flex flex-wrap gap-1 md:gap-2">
          <TabsTrigger value="public" className="flex-1">Public Recipes</TabsTrigger>
          <TabsTrigger value="user" className="flex-1">My Recipes</TabsTrigger>
          <TabsTrigger value="all" className="flex-1">All Recipes</TabsTrigger>
          <TabsTrigger value="selected" disabled={!selectedRecipe} className="flex-1">
            Selected Recipe
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="public" className="space-y-6">
          {renderRecipeCards(publicRecipes, isLoadingPublic)}
        </TabsContent>
        
        <TabsContent value="user" className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <UserRecipeList 
              userId={1} // For demo purposes. In a real app, use the logged-in user's ID
              onViewRecipe={handleViewRecipe}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-6">
          {renderRecipeCards(allRecipes, isLoadingAll)}
        </TabsContent>
        
        <TabsContent value="selected" className="space-y-6">
          {selectedRecipe ? (
            <>
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentTab('all')}
                  className="mb-4"
                >
                  ← Back to Recipes
                </Button>
              </div>
              <ModernistRecipeTemplate {...convertRecipeForTemplate(selectedRecipe)} />
            </>
          ) : (
            <div className="p-8 border rounded-lg bg-amber-50 border-amber-200 text-amber-800 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Recipe Selected</h3>
              <p>Select a recipe from one of the tabs to view its details here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}