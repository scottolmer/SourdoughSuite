import React, { useState } from 'react';
import ModernistRecipeTemplate from '@/components/Recipe/ModernistRecipeTemplate';
import UserRecipeList from '@/components/Recipe/UserRecipeList';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadRecipe } from '@shared/schema';

export default function RecipeExample() {
  const [selectedRecipe, setSelectedRecipe] = useState<BreadRecipe | null>(null);
  const [currentTab, setCurrentTab] = useState('example');
  
  const handleViewRecipe = (recipe: BreadRecipe) => {
    setSelectedRecipe(recipe);
    setCurrentTab('selected');
  };
  
  // Sample recipe data based on Second-Chance Sourdough
  const sourdoughRecipe = {
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

  const convertRecipeForTemplate = (recipe: BreadRecipe) => {
    // This is a simplified conversion. In a real app, you'd need to map all properties correctly
    // and handle possible null values appropriately
    try {
      const ingredients = Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.map((ingredient: any) => ({
            name: ingredient.name,
            weight: ingredient.amount,
            volume: "",
            percentage: 0
          }))
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
      return sourdoughRecipe;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 left-4 z-10">
        <Link href="/">
          <span className="px-4 py-2 bg-white rounded-md shadow-sm text-sm font-medium border border-gray-300 hover:bg-gray-50 cursor-pointer">
            ← Back to Home
          </span>
        </Link>
      </div>
      
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="example">Example Recipe</TabsTrigger>
            <TabsTrigger value="user">My Recipes</TabsTrigger>
            <TabsTrigger value="selected" disabled={!selectedRecipe}>
              Selected Recipe
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="example" className="space-y-6">
            <ModernistRecipeTemplate {...sourdoughRecipe} />
          </TabsContent>
          
          <TabsContent value="user" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <UserRecipeList 
                userId={1} // For demo purposes. In a real app, use the logged-in user's ID
                onViewRecipe={handleViewRecipe}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="selected" className="space-y-6">
            {selectedRecipe && (
              <ModernistRecipeTemplate {...convertRecipeForTemplate(selectedRecipe)} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}