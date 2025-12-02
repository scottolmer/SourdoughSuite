import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { BreadRecipe } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Clock, 
  Gauge, 
  Sparkles, 
  Printer, 
  ThumbsUp,
  BookOpen,
  ArrowLeft, 
  AlertTriangle,
  CalendarClock,
  Download
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AIEnhancedRecipe extends BreadRecipe {
  isAIGenerated: boolean;
  matchScore?: number;
  author?: string; // Add author to fix TypeScript errors
}

export default function AIRecipeDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<AIEnhancedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const response = await fetch(`/api/recipes/${id}`);
        if (!response.ok) {
          throw new Error("Recipe not found");
        }
        
        const data = await response.json();
        
        // Parse complex nested ingredient and instruction structures from AI-generated recipes
        let parsedIngredients = data.ingredients;
        let parsedInstructions = data.instructions;
        
        // Handle nested ingredient structure (levain/dough format)
        if (data.ingredients && typeof data.ingredients === 'object' && !Array.isArray(data.ingredients)) {
          const ingredientsList: string[] = [];
          
          // Extract levain ingredients
          if (data.ingredients.levain?.ingredients) {
            ingredientsList.push("**Levain:**");
            data.ingredients.levain.ingredients.forEach((ing: any) => {
              ingredientsList.push(`${ing.quantity}${ing.unit} ${ing.item}`);
            });
            ingredientsList.push(""); // Add spacing
          }
          
          // Extract dough ingredients
          if (data.ingredients.dough?.ingredients) {
            ingredientsList.push("**Dough:**");
            data.ingredients.dough.ingredients.forEach((ing: any) => {
              ingredientsList.push(`${ing.quantity}${ing.unit} ${ing.item}`);
            });
          }
          
          parsedIngredients = ingredientsList;
        }
        
        // Handle nested instruction structure (step objects format)
        if (data.instructions && typeof data.instructions === 'object' && !Array.isArray(data.instructions)) {
          const instructionsList: string[] = [];
          
          // Convert instruction objects to ordered array
          const steps = Object.values(data.instructions) as any[];
          steps
            .filter(step => step && typeof step === 'object')
            .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
            .forEach((step: any) => {
              if (step.description) {
                instructionsList.push(step.description);
              }
            });
          
          parsedInstructions = instructionsList;
        }
        
        // Ensure it's marked as AI generated
        const aiRecipe: AIEnhancedRecipe = {
          ...data,
          ingredients: parsedIngredients,
          instructions: parsedInstructions,
          isAIGenerated: true,
          matchScore: data.matchScore || 100  // Default to 100% if not provided
        };
        
        setRecipe(aiRecipe);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        setError("Failed to load recipe. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const handleSaveRecipe = async () => {
    try {
      if (!recipe) return;
      
      // Save the recipe to the database server-side
      const recipeToSave = {
        ...recipe,
        userId: 1, // Set the userId to mark this as a user's recipe
        isAIGenerated: true,
        savedAt: new Date().toISOString()
      };

      // Make API request to save the recipe to the database
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeToSave)
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe to database');
      }
      
      // Also store in localStorage for client-side access
      const savedRecipesJson = localStorage.getItem('savedRecipes');
      let savedRecipes = savedRecipesJson ? JSON.parse(savedRecipesJson) : [];
      
      // Check if recipe is already saved (by id)
      const alreadySaved = savedRecipes.some((saved: any) => saved.id === recipe.id);
      if (!alreadySaved) {
        // Add to saved recipes
        savedRecipes = [...savedRecipes, recipeToSave];
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        
        // Dispatch custom event for other components
        const customEvent = new CustomEvent('recipeSaved', { 
          detail: { recipe: recipeToSave } 
        });
        window.dispatchEvent(customEvent);
        
        toast({
          title: "Recipe Saved",
          description: "This recipe has been saved to your collection.",
        });
      } else {
        toast({
          title: "Already Saved",
          description: "This recipe is already in your collection.",
        });
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Save Failed",
        description: "Unable to save this recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrintRecipe = () => {
    window.print();
  };
  
  // Function to extract timing information from recipe instructions
  const extractTimingInformation = (recipeData: AIEnhancedRecipe) => {
    const timingData = [
      { id: 'levenBuild', hours: 0, minutes: 0, hasWaterTemp: true },
      { id: 'autolyse', hours: 0, minutes: 0 },
      { id: 'mix', hours: 0, minutes: 0 },
      { id: 'bulk', hours: 0, minutes: 0 },
      { id: 'shape', hours: 0, minutes: 0 },
      { id: 'proof', hours: 0, minutes: 0 },
      { id: 'bake', hours: 0, minutes: 0 },
      { id: 'cool', hours: 0, minutes: 0 }
    ];
    
    // Helper to convert instruction text time references to minutes
    const extractTimeFromText = (text: string): { hours: number, minutes: number } => {
      let hours = 0;
      let minutes = 0;
      
      // Match patterns like "2 hours", "90 minutes", "1-2 hours", "30-45 minutes"
      const hourMatches = text.match(/(\d+)[-\s]?(?:to)?[-\s]?(\d+)?\s*hours?/i);
      const minuteMatches = text.match(/(\d+)[-\s]?(?:to)?[-\s]?(\d+)?\s*min(?:ute)?s?/i);
      
      if (hourMatches) {
        // If there's a range, take the average
        if (hourMatches[2]) {
          hours = (parseInt(hourMatches[1]) + parseInt(hourMatches[2])) / 2;
        } else {
          hours = parseInt(hourMatches[1]);
        }
      }
      
      if (minuteMatches) {
        if (minuteMatches[2]) {
          minutes = (parseInt(minuteMatches[1]) + parseInt(minuteMatches[2])) / 2;
        } else {
          minutes = parseInt(minuteMatches[1]);
        }
      }
      
      return { hours, minutes };
    };
    
    // Process instructions to extract timing information
    if (Array.isArray(recipeData.instructions)) {
      recipeData.instructions.forEach(instruction => {
        const text = typeof instruction === 'string' 
          ? instruction 
          : (instruction as any).instruction || (instruction as any).details || '';
        
        // Check for specific stages in the instruction text
        if (/starter|levain|leaven/i.test(text) && /ferment|rise|develop/i.test(text)) {
          const { hours, minutes } = extractTimeFromText(text);
          timingData[0].hours = hours;
          timingData[0].minutes = minutes;
        } else if (/autolyse|rest/i.test(text)) {
          const { hours, minutes } = extractTimeFromText(text);
          timingData[1].hours = hours;
          timingData[1].minutes = minutes;
        } else if (/mix|knead|fold/i.test(text) && !/bulk/i.test(text)) {
          const { hours, minutes } = extractTimeFromText(text);
          timingData[2].hours = hours;
          timingData[2].minutes = minutes;
        } else if (/bulk\s+ferment/i.test(text) || (/ferment/i.test(text) && /dough/i.test(text))) {
          const { hours, minutes } = extractTimeFromText(text);
          timingData[3].hours = hours;
          timingData[3].minutes = minutes;
        } else if (/shape/i.test(text)) {
          const { hours, minutes } = extractTimeFromText(text);
          timingData[4].hours = hours;
          timingData[4].minutes = minutes;
        } else if (/proof|rise/i.test(text) && !/bulk/i.test(text)) {
          const { hours, minutes } = extractTimeFromText(text);
          timingData[5].hours = hours;
          timingData[5].minutes = minutes;
        } else if (/bake|oven/i.test(text)) {
          const { hours, minutes } = extractTimeFromText(text);
          timingData[6].hours = hours;
          timingData[6].minutes = minutes;
        } else if (/cool|rest/i.test(text) && /finished|baked|complete/i.test(text)) {
          const { hours, minutes } = extractTimeFromText(text);
          timingData[7].hours = hours;
          timingData[7].minutes = minutes;
        }
      });
    }
    
    return timingData;
  };
  
  // Navigate to the timeline calculator with recipe data
  const [_, navigate] = useLocation();
  
  const handleCreateTimeline = () => {
    if (!recipe) return;
    
    try {
      // Extract timing information from the recipe
      const timeEntries = extractTimingInformation(recipe);
      
      // Create a URL-friendly encoded string with the timing information
      const timeEntriesStr = encodeURIComponent(JSON.stringify(timeEntries));
      const recipeName = encodeURIComponent(recipe.name);
      
      // Navigate to the timeline calculator with the extracted data
      navigate(`/tools/timeline-calculator?recipe=${recipeName}&times=${timeEntriesStr}&id=${id}`);
      
      toast({
        title: "Timeline Generated",
        description: "Custom timeline created from this recipe.",
      });
    } catch (error) {
      console.error("Error creating timeline:", error);
      toast({
        title: "Error Creating Timeline",
        description: "Failed to generate a custom timeline. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadRecipe = () => {
    if (!recipe) return;
    
    try {
      // Format recipe content for download
      let content = `${recipe.name}\n`;
      content += "=".repeat(recipe.name.length) + "\n\n";
      
      if (recipe.description) {
        content += `${recipe.description}\n\n`;
      }
      
      // Add recipe details
      if (recipe.difficulty || recipe.totalTime || recipe.yields) {
        content += "Recipe Details:\n";
        if (recipe.difficulty) content += `• Difficulty: ${recipe.difficulty}\n`;
        if (recipe.totalTime) content += `• Total Time: ${recipe.totalTime}\n`;
        if (recipe.yields) content += `• Yield: ${recipe.yields}\n`;
        content += "\n";
      }
      
      // Add ingredients
      if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
        content += "Ingredients:\n";
        content += "-----------\n";
        recipe.ingredients.forEach((ingredient: any) => {
          if (typeof ingredient === 'string') {
            content += `• ${ingredient}\n`;
          } else if (ingredient && typeof ingredient === 'object') {
            const { name, amount, unit, bakersPercentage } = ingredient;
            let line = `• ${amount || ''}${unit ? ` ${unit}` : ''} ${name || 'Ingredient'}`;
            if (bakersPercentage) line += ` (${bakersPercentage})`;
            content += `${line}\n`;
          }
        });
        content += "\n";
      }
      
      // Add instructions
      if (Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
        content += "Instructions:\n";
        content += "-------------\n";
        recipe.instructions.forEach((instruction: any, index: number) => {
          const text = typeof instruction === 'string' 
            ? instruction 
            : instruction?.instruction || instruction?.details || 'Step';
          content += `${index + 1}. ${text}\n\n`;
        });
      }
      
      // Add footer
      content += `\n--- Generated by Bakehouse Breads AI Assistant ---\n`;
      if (recipe.isAIGenerated) {
        content += "This recipe was custom-generated based on your preferences.\n";
      }
      
      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${recipe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Recipe Downloaded",
        description: "Recipe has been saved as a text file.",
      });
    } catch (error) {
      console.error("Error downloading recipe:", error);
      toast({
        title: "Download Failed",
        description: "Unable to download recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-amber-100 rounded-full mb-2"></div>
          <div className="h-4 w-48 bg-amber-100 rounded mb-6"></div>
          <div className="h-2 w-64 bg-gray-200 rounded mb-2.5"></div>
          <div className="h-2 w-56 bg-gray-200 rounded mb-2.5"></div>
          <div className="h-2 w-60 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <AlertTriangle size={48} className="text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">
                {error || "Recipe Not Found"}
              </h2>
              <p className="text-red-600 mb-6">
                We couldn't load the recipe you're looking for. It may have been removed or there was an error.
              </p>
              <Link href="/recipes">
                <Button>
                  Return to Recipe Creator
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/recipes">
          <Button variant="ghost" className="text-gray-600 hover:text-gray-800 p-0">
            <ArrowLeft size={16} className="mr-1" /> Back to Recipe Creator
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#2B2B2B] mb-2">{recipe.name}</h1>
          {recipe.author && (
            <p className="text-gray-600">
              By <span className="font-medium">{recipe.author}</span>
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {recipe.isAIGenerated && (
            <Badge variant="outline" className="text-sm font-medium bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 flex items-center">
              <Sparkles size={14} className="mr-1.5 text-amber-500" />
              AI-Generated
            </Badge>
          )}
          
          {recipe.matchScore !== undefined && (
            <Badge variant="outline" className="text-sm bg-amber-50 text-amber-800 border-amber-200 flex items-center">
              <Gauge size={14} className="mr-1.5 text-amber-600" />
              {recipe.matchScore}% Match
            </Badge>
          )}
        </div>
      </div>
      
      <p className="text-gray-700 mb-8 text-lg max-w-3xl">
        {recipe.description || "A delicious sourdough bread recipe."}
      </p>
      
      <div className="flex flex-wrap gap-4 mb-8">
        {recipe.difficulty && (
          <div className="bg-gray-50 px-4 py-2 rounded-md flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Difficulty</span>
            <span className="font-medium">{recipe.difficulty}</span>
          </div>
        )}
        
        {recipe.totalTime && (
          <div className="bg-gray-50 px-4 py-2 rounded-md flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Total Time</span>
            <span className="font-medium flex items-center">
              <Clock size={14} className="mr-1.5" />
              {recipe.totalTime}
            </span>
          </div>
        )}
        
        {recipe.activeTime && (
          <div className="bg-gray-50 px-4 py-2 rounded-md flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Active Time</span>
            <span className="font-medium flex items-center">
              <Clock size={14} className="mr-1.5" />
              {recipe.activeTime}
            </span>
          </div>
        )}
        
        {recipe.hydration && (
          <div className="bg-gray-50 px-4 py-2 rounded-md flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Hydration</span>
            <span className="font-medium">{recipe.hydration}%</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(recipe.instructions) ? (
                <ol className="list-none space-y-6">
                  {recipe.instructions.map((instruction, index) => {
                    // Check if instruction is a string or an object with step/instruction fields
                    if (typeof instruction === 'string') {
                      return (
                        <li key={index} className="text-gray-700 pb-4 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-amber-800 font-medium">
                              {index + 1}
                            </div>
                            <h3 className="font-medium text-gray-800">Step {index + 1}</h3>
                          </div>
                          <div className="pl-11 text-gray-700">{instruction}</div>
                        </li>
                      );
                    } else if (instruction && typeof instruction === 'object') {
                      // Handle new format with step and instruction/details fields
                      const instructionObj = instruction as { 
                        step?: string; 
                        instruction?: string;
                        details?: string;
                      };
                      
                      // Get the instruction text from either the instruction or details field
                      const instructionText = instructionObj.instruction || instructionObj.details;
                      
                      return (
                        <li key={index} className="text-gray-700 pb-4 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-amber-800 font-medium">
                              {index + 1}
                            </div>
                            <h3 className="font-medium text-gray-800">{instructionObj.step || `Step ${index + 1}`}</h3>
                          </div>
                          <div className="pl-11 text-gray-700">{instructionText}</div>
                        </li>
                      );
                    }
                    return <li key={index} className="text-gray-700">{JSON.stringify(instruction)}</li>;
                  })}
                </ol>
              ) : typeof recipe.instructions === 'string' ? (
                <p className="text-gray-700">{recipe.instructions}</p>
              ) : (
                <p className="text-gray-500 italic">No instructions provided</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(recipe.ingredients) ? (
                <ul className="space-y-3 divide-y divide-gray-100">
                  {recipe.ingredients.map((ingredient, index) => {
                    // Handle both string and object formats
                    if (typeof ingredient === 'string') {
                      return (
                        <li key={index} className={`text-gray-700 ${index > 0 ? 'pt-3' : ''}`}>
                          {ingredient}
                        </li>
                      );
                    } else if (typeof ingredient === 'object' && ingredient !== null) {
                      const { name, amount, unit, bakersPercentage } = ingredient as { 
                        name: string, 
                        amount: string | number, 
                        unit?: string,
                        bakersPercentage?: string
                      };
                      return (
                        <li key={index} className={`flex justify-between ${index > 0 ? 'pt-3' : ''}`}>
                          <div className="text-gray-700">
                            <span className="font-semibold">{amount}</span>
                            {unit && <span> {unit}</span>}
                            <span> {name}</span>
                          </div>
                          {bakersPercentage && (
                            <span className="text-amber-700 text-sm font-medium">
                              {bakersPercentage}
                            </span>
                          )}
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No ingredients provided</p>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 flex flex-col space-y-3">
            {/* We now auto-save AI recipes, so we only show the "View My Recipes" button */}
            <Button 
              variant="outline" 
              className="w-full justify-start"
              asChild 
            >
              <Link href="/recipes/my-recipes">
                <BookOpen size={16} className="mr-2" /> View My Recipes
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handlePrintRecipe}
            >
              <Printer size={16} className="mr-2" /> Print Recipe
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleDownloadRecipe}
            >
              <Download size={16} className="mr-2" /> Download Recipe
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200" 
              onClick={handleCreateTimeline}
            >
              <CalendarClock size={16} className="mr-2 text-amber-600" /> Generate Custom Timeline
            </Button>
          </div>
        </div>
      </div>
      
      <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-amber-600 mt-1" />
            <div>
              <h3 className="text-amber-800 text-lg font-medium mb-2">About AI-Generated Recipes</h3>
              <p className="text-amber-700 mb-2">
                This recipe was custom-generated by our AI system based on your specific preferences
                for texture, flavor profile, and ingredients. Every aspect of the recipe, from the ingredient
                ratios to the baking technique, has been tailored to match your requested parameters.
              </p>
              <p className="text-amber-700">
                We suggest following the recipe exactly the first time, then making small adjustments 
                based on your results and personal taste for future bakes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}