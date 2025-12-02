import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";

// Form schema for recipe generation
const formSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters").max(200, "Description cannot exceed 200 characters"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  texture: z.object({
    crustThickness: z.number().min(1).max(10),
    crumb: z.enum(["open", "medium", "tight"]),
    moisture: z.number().min(1).max(10),
    chewiness: z.number().min(1).max(10)
  }),
  flavor: z.object({
    sourness: z.number().min(1).max(10),
    sweetness: z.number().min(1).max(10),
    complexity: z.number().min(1).max(10),
    flavors: z.object({
      nutty: z.boolean().default(false),
      fruity: z.boolean().default(false),
      spicy: z.boolean().default(false),
      earthy: z.boolean().default(false),
      malty: z.boolean().default(false),
      buttery: z.boolean().default(false)
    }),
  }),
  preferences: z.object({
    vegan: z.boolean().default(false),
    nutFree: z.boolean().default(false),
    glutenFree: z.boolean().default(false),
    dairyFree: z.boolean().default(false),
    lowSodium: z.boolean().default(false),
  })
});

type FormValues = z.infer<typeof formSchema>;

export default function AIRecipeGeneratorPage() {
  const { toast } = useToast();
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [, setLocation] = useLocation();

  // Define form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      difficulty: "intermediate",
      texture: {
        crustThickness: 5,
        crumb: "medium",
        moisture: 5,
        chewiness: 5
      },
      flavor: {
        sourness: 5,
        sweetness: 5,
        complexity: 5,
        flavors: {
          nutty: false,
          fruity: false,
          spicy: false,
          earthy: false,
          malty: false,
          buttery: false
        },
      },
      preferences: {
        vegan: false,
        nutFree: false,
        glutenFree: false,
        dairyFree: false,
        lowSodium: false,
      }
    }
  });

  // Generate recipe mutation
  const generateRecipeMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      console.log("Attempting to generate recipe with data:", data);
      try {
        // Use direct fetch instead of apiRequest for more control
        const response = await fetch("/api/ai/generate-recipe", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Recipe generation failed:", errorText);
          throw new Error(errorText || "Failed to generate recipe");
        }
        
        return response.json();
      } catch (error) {
        console.error("Recipe generation error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Recipe generated successfully:", data);
      setGeneratedRecipe(data);
      
      // Check if the recipe has an ID from the server (this means it was automatically saved)
      if (data.id) {
        console.log("Recipe has ID:", data.id, "- navigating to detail page");
        toast({
          title: "Recipe generated!",
          description: "Redirecting to your new recipe...",
        });
        // Navigate to the detail page with the recipe ID
        setLocation(`/ai/recipes/${data.id}`);
      } else {
        toast({
          title: "Recipe generated!",
          description: "Your AI-generated recipe is ready.",
        });
      }
    },
    onError: (error) => {
      console.error("Recipe generation error in mutation:", error);
      toast({
        title: "Failed to generate recipe",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Save recipe mutation
  const saveRecipeMutation = useMutation({
    mutationFn: async (recipe: any) => {
      console.log("Attempting to save recipe:", recipe);
      
      try {
        // Transform the generated recipe to match the expected format for the API
        const recipeToSave = {
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients.map((ing: any) => `${ing.amount} ${ing.name}`),
          instructions: recipe.instructions,
          isPublic: true,
          authorId: 1, // Assuming user ID 1 exists - in a real app, this would be the current user's ID
          textureProfile: recipe.textureProfile,
          flavorProfile: recipe.flavorProfile || { 
            sourness: 5, 
            sweetness: 5, 
            complexity: 5, 
            flavors: {
              nutty: false,
              fruity: false,
              spicy: false,
              earthy: false,
              malty: false,
              buttery: false
            } 
          },
          difficulty: recipe.difficulty,
          // Calculate these values if they don't exist in the generated recipe
          totalTime: "3 hours",
          activeTime: "45 minutes",
          imageUrl: "",
        };

        console.log("Transformed recipe for saving:", recipeToSave);
        
        // Use direct fetch instead of apiRequest
        const response = await fetch("/api/recipes", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recipeToSave)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Recipe save failed:", errorText);
          throw new Error(errorText || "Failed to save recipe");
        }
        
        return response.json();
      } catch (error) {
        console.error("Recipe save error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Recipe saved!",
        description: "Your generated recipe has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      
      // Check if the saved recipe has an ID and navigate to its detail page
      if (data && data.id) {
        console.log("Recipe saved with ID:", data.id, "- navigating to detail page");
        setLocation(`/ai/recipes/${data.id}`);
      }
    },
    onError: (error) => {
      console.error("Recipe save error in mutation:", error);
      toast({
        title: "Failed to save recipe",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    generateRecipeMutation.mutate(data);
  };

  const handleSaveRecipe = () => {
    if (generatedRecipe) {
      saveRecipeMutation.mutate(generatedRecipe);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Recipe Generator</h1>
          <p className="text-muted-foreground mt-2">
            Describe your ideal sourdough bread and let AI craft a custom recipe for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Preferences</CardTitle>
              <CardDescription>
                Tell us about the bread you want to create
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the bread you'd like to make, e.g., 'A rustic country loaf with a crispy crust and mild sour flavor perfect for sandwiches'"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about what kind of bread you want
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your baking skill level
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Texture Profile</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="texture.crustThickness"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Crust Thickness</FormLabel>
                              <span className="text-sm">{field.value}/10</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormDescription>
                              Thin (1) to thick (10)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="texture.crumb"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Crumb Structure</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select crumb type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tight">Tight (Like sandwich bread)</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="open">Open (Big holes)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="texture.moisture"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Moisture</FormLabel>
                              <span className="text-sm">{field.value}/10</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormDescription>
                              Dry (1) to moist (10)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="texture.chewiness"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Chewiness</FormLabel>
                              <span className="text-sm">{field.value}/10</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormDescription>
                              Soft (1) to chewy (10)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Flavor Profile</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="flavor.sourness"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Sourness</FormLabel>
                              <span className="text-sm">{field.value}/10</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormDescription>
                              Mild (1) to very sour (10)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="flavor.sweetness"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Sweetness</FormLabel>
                              <span className="text-sm">{field.value}/10</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormDescription>
                              Not sweet (1) to sweet (10)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="flavor.complexity"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Complexity</FormLabel>
                              <span className="text-sm">{field.value}/10</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormDescription>
                              Simple (1) to complex (10)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Dietary Preferences</h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="preferences.vegan"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Vegan</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferences.nutFree"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Nut-Free</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferences.glutenFree"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Gluten-Free (Alternative Flours)</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferences.dairyFree"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Dairy-Free</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferences.lowSodium"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Low Sodium</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={generateRecipeMutation.isPending}
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Recipe...
                      </>
                    ) : (
                      "Generate Recipe"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Generated Recipe Section */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Recipe</CardTitle>
              <CardDescription>
                Your AI-crafted sourdough bread recipe
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              {generateRecipeMutation.isPending ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-center text-muted-foreground">
                    Generating your custom recipe...
                    <br />
                    This may take a moment.
                  </p>
                </div>
              ) : generatedRecipe ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">{generatedRecipe.name}</h2>
                    <p className="text-muted-foreground mt-1">{generatedRecipe.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {generatedRecipe.difficulty}
                      </span>
                      <span className="text-sm">
                        Hydration: {generatedRecipe.hydration}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Ingredients</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {generatedRecipe.ingredients.map((ingredient: any, index: number) => (
                        <li key={index}>
                          {ingredient.amount} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Instructions</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      {generatedRecipe.instructions.map((step: string, index: number) => (
                        <li key={index} className="pl-1">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <h3 className="font-medium text-lg mb-2">Texture Profile</h3>
                      <ul className="text-sm space-y-1">
                        <li>Crust: {generatedRecipe.textureProfile.crustThickness}/10</li>
                        <li>Crumb: {generatedRecipe.textureProfile.crumb}</li>
                        <li>Moisture: {generatedRecipe.textureProfile.moisture}/10</li>
                        <li>Chewiness: {generatedRecipe.textureProfile.chewiness}/10</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Flavor Profile</h3>
                      <ul className="text-sm space-y-1">
                        <li>Sourness: {generatedRecipe.flavorProfile.sourness}/10</li>
                        <li>Sweetness: {generatedRecipe.flavorProfile.sweetness}/10</li>
                        <li>Complexity: {generatedRecipe.flavorProfile.complexity}/10</li>
                        <li>
                          <span className="font-medium">Flavor Notes: </span>
                          {generatedRecipe.flavorProfile.notes ? 
                            Array.isArray(generatedRecipe.flavorProfile.notes) ? 
                              generatedRecipe.flavorProfile.notes.join(", ") : 
                              generatedRecipe.flavorProfile.notes : 
                            "Clean grain flavor"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground mb-4">
                    Your recipe will appear here after generation.
                    <br />
                    Fill out the form and click "Generate Recipe" to start.
                  </p>
                </div>
              )}
            </CardContent>
            {generatedRecipe && (
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveRecipe} 
                  disabled={saveRecipeMutation.isPending}
                >
                  {saveRecipeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save to My Recipes
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}