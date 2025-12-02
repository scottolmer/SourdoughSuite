import React, { useState, useEffect } from 'react';
import { MobileLayout } from "@/components/mobile-layout";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { SEO } from '@/components/SEO';
import { generateWebpageSEO } from '@/lib/schema';
import { useQuery } from "@tanstack/react-query";

// Form validation schema
const recipeSchema = z.object({
  name: z.string().min(3, { message: "Recipe name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Please provide a brief description" }),
  difficulty: z.string().optional(),
  totalTime: z.string().optional(),
  activeTime: z.string().optional(),
  imageUrl: z.string().optional(),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, { message: "Ingredient name is required" }),
      amount: z.string().min(1, { message: "Amount is required" }),
      unit: z.string().optional(),
    })
  ).min(1, { message: "At least one ingredient is required" }),
  instructions: z.array(z.string().min(5, { message: "Instruction must be at least 5 characters" }))
    .min(1, { message: "At least one instruction step is required" }),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

export default function ManualRecipeEntryPage() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const params = useParams();
  const recipeId = params.id;
  const isEditMode = !!recipeId;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define the type for the API response
  type RecipeApiResponse = RecipeFormValues & {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    userId?: number;
  };

  // Fetch existing recipe if in edit mode - use the specific endpoint for a single recipe
  const { data: existingRecipeData, isLoading } = useQuery<RecipeApiResponse>({
    queryKey: [`/api/recipes/${recipeId}`],
    enabled: isEditMode,
  });
  
  // Handle potential array response or direct object response
  const existingRecipe = React.useMemo(() => {
    if (!existingRecipeData) return null;
    
    // If we got an array (from /api/recipes), find the specific recipe
    if (Array.isArray(existingRecipeData)) {
      console.log('Received array of recipes, searching for ID:', recipeId);
      return existingRecipeData.find(recipe => recipe.id === Number(recipeId));
    }
    
    // Otherwise, return the single recipe object
    return existingRecipeData;
  }, [existingRecipeData, recipeId]);

  // Default form values
  const defaultValues: Partial<RecipeFormValues> = {
    name: "",
    description: "",
    difficulty: "Intermediate",
    totalTime: "3-4 hours",
    activeTime: "30 minutes",
    ingredients: [{ name: "", amount: "", unit: "g" }],
    instructions: [""],
    notes: "",
    isPublic: false,
    tags: [],
  };

  // Initialize form
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues,
    mode: "onChange",
  });
  
  // Using useFieldArray from react-hook-form directly instead of from form
  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = 
    useFieldArray({
      control: form.control,
      name: "ingredients",
    });

  const { 
    fields: instructionFields, 
    append: appendInstruction, 
    remove: removeInstruction 
  } = useFieldArray({
    control: form.control,
    name: "instructions" as const, // Type assertion to fix TypeScript error
  });

  // Populate form with existing recipe data when it's loaded
  useEffect(() => {
    if (existingRecipe && isEditMode) {
      // Log the data we receive from the API
      console.log('Existing recipe data:', existingRecipe);
      console.log('Instructions from API:', existingRecipe.instructions);
      
      // Make sure instructions are valid strings in an array
      let formattedInstructions = [""];
      if (Array.isArray(existingRecipe.instructions)) {
        formattedInstructions = existingRecipe.instructions.map((instr: any) => 
          typeof instr === 'string' ? instr : ""
        );
        // Ensure we have at least one instruction
        if (formattedInstructions.length === 0) {
          formattedInstructions = [""];
        }
      }
      
      console.log('Formatted instructions:', formattedInstructions);
      
      // Reset form with existing recipe data
      const formattedRecipe: RecipeFormValues = {
        name: existingRecipe.name || "",
        description: existingRecipe.description || "",
        difficulty: existingRecipe.difficulty || "Intermediate",
        totalTime: existingRecipe.totalTime || "",
        activeTime: existingRecipe.activeTime || "",
        imageUrl: existingRecipe.imageUrl || "",
        notes: existingRecipe.notes || "",
        isPublic: Boolean(existingRecipe.isPublic),
        tags: Array.isArray(existingRecipe.tags) ? existingRecipe.tags : [],
        // Format ingredients to match form structure
        ingredients: Array.isArray(existingRecipe.ingredients) 
          ? existingRecipe.ingredients.map((ing: {name?: string; amount?: number | string; unit?: string}) => ({
              name: ing.name || "",
              amount: String(ing.amount) || "",
              unit: ing.unit || "g"
            }))
          : [{ name: "", amount: "", unit: "g" }],
        // Use our formatted instructions
        instructions: formattedInstructions,
      };
      
      // Log the formatted recipe data we're using to reset the form
      console.log('Formatted recipe data for form reset:', formattedRecipe);
      
      // Reset the form with the data
      form.reset(formattedRecipe);
      
      // Use a timeout to ensure the form has updated
      setTimeout(() => {
        try {
          // Remove all existing instruction fields and then add the formatted ones
          while (instructionFields.length > 0) {
            removeInstruction(0);
          }
          
          // Add each instruction
          formattedInstructions.forEach((instruction) => {
            appendInstruction(instruction);
          });
          
          // Force update the form values
          form.reset(formattedRecipe);
          
          console.log('Form reset with fields:', form.getValues());
        } catch (error) {
          console.error('Error setting up instruction fields:', error);
        }
      }, 100);
    }
  }, [existingRecipe, form, isEditMode, appendInstruction, removeInstruction]);

  const onSubmit = async (data: RecipeFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Format data for API
      const formattedData = {
        ...data,
        ingredients: data.ingredients.map(ing => ({
          ...ing,
          amount: Number(ing.amount) || ing.amount, // Convert to number if possible
        })),
        // Don't send updatedAt - the server will handle this with a Date object
      };
      
      let result;
      
      // Handle edit vs create modes differently
      if (isEditMode && recipeId) {
        // Don't include userId and createdAt when updating
        console.log(`Updating recipe ${recipeId}:`, formattedData);
        
        result = await apiRequest(`/api/recipes/${recipeId}`, {
          method: 'PATCH',
          body: JSON.stringify(formattedData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        toast({
          title: "Recipe Updated",
          description: "Your recipe has been updated successfully"
        });
        
        // Invalidate the specific recipe cache
        queryClient.invalidateQueries({ queryKey: [`/api/recipes/${recipeId}`] });
      } else {
        // Add new recipe specific fields for creation
        const newRecipeData = {
          ...formattedData,
          userId: 1, // Demo user
          createdAt: new Date().toISOString()
        };
        
        console.log('Creating new recipe:', newRecipeData);
        
        result = await apiRequest('/api/recipes', {
          method: 'POST',
          body: JSON.stringify(newRecipeData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        toast({
          title: "Recipe Created",
          description: "Your recipe has been created successfully"
        });
      }
      
      // Invalidate recipes queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      
      // Navigate to the recipe detail or my recipes page
      if (result && result.id) {
        navigate(`/recipes/${result.id}`);
      } else {
        navigate('/recipes/my-recipes');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} recipe:`, error);
      toast({
        title: "Error",
        description: `There was a problem ${isEditMode ? 'updating' : 'saving'} your recipe. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate SEO data
  const seoData = generateWebpageSEO({
    title: isEditMode ? 'Edit Recipe | Bakehouse Breads' : 'Create Recipe | Bakehouse Breads',
    description: isEditMode 
      ? 'Edit and update your sourdough bread recipe' 
      : 'Manually create and save your own sourdough bread recipes',
    canonicalUrl: isEditMode ? `/recipes/${recipeId}/edit` : '/recipes/manual-entry',
    type: 'website',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Recipes', url: '/recipes' },
      { name: isEditMode ? 'Edit Recipe' : 'Manual Recipe Entry', 
        url: isEditMode ? `/recipes/${recipeId}/edit` : '/recipes/manual-entry' }
    ]
  });

  // Display loading indicator while fetching recipe data in edit mode
  if (isEditMode && isLoading) {
    return (
      <MobileLayout title="Loading Recipe" showBackButton>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading recipe data...</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <>
      <SEO 
        title={isEditMode ? 'Edit Recipe | Bakehouse Breads' : 'Create Recipe | Bakehouse Breads'}
        description={isEditMode ? 'Edit and update your sourdough bread recipe' : 'Manually create and save your own sourdough bread recipes'}
        canonicalUrl={isEditMode ? `/recipes/${recipeId}/edit` : '/recipes/manual-entry'}
        structuredData={seoData}
      />
      <MobileLayout title={isEditMode ? 'Edit Recipe' : 'Create Recipe'} showBackButton>
        <div className="space-y-6 pb-10">
          <Card>
            <CardHeader>
              <CardTitle>{isEditMode ? 'Edit Recipe' : 'Manual Recipe Entry'}</CardTitle>
              <CardDescription>
                {isEditMode 
                  ? 'Update your bread recipe with new ingredients and instructions' 
                  : 'Create and save your own bread recipe with detailed ingredients and instructions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Country Sourdough" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of your bread recipe..." 
                            {...field} 
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <FormControl>
                            <Input placeholder="Intermediate" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="totalTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Time</FormLabel>
                          <FormControl>
                            <Input placeholder="3-4 hours" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="activeTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Active Time</FormLabel>
                          <FormControl>
                            <Input placeholder="30 minutes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">Ingredients*</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendIngredient({ name: "", amount: "", unit: "g" })}
                      >
                        <PlusCircle className="mr-1 h-4 w-4" />
                        Add Ingredient
                      </Button>
                    </div>
                    
                    {ingredientFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className={index !== 0 ? "sr-only" : ""}>
                                Name
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Bread flour" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.amount`}
                          render={({ field }) => (
                            <FormItem className="w-[80px]">
                              <FormLabel className={index !== 0 ? "sr-only" : ""}>
                                Amount
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="500" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className="w-[70px]">
                              <FormLabel className={index !== 0 ? "sr-only" : ""}>
                                Unit
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="g" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIngredient(index)}
                            className="mb-1"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">Instructions*</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendInstruction("")}
                      >
                        <PlusCircle className="mr-1 h-4 w-4" />
                        Add Step
                      </Button>
                    </div>
                    
                    {instructionFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <div className="min-w-[24px] h-6 rounded-full bg-muted flex items-center justify-center mt-2 text-sm font-medium">
                          {index + 1}
                        </div>
                        <FormField
                          control={form.control}
                          name={`instructions.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Textarea 
                                  placeholder={`Step ${index + 1}: Mix the flour and water...`} 
                                  {...field} 
                                  className="min-h-[60px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInstruction(index)}
                            className="mt-2"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional notes about your recipe..." 
                            {...field} 
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Add tips, variations, or special considerations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting 
                        ? (isEditMode ? "Updating Recipe..." : "Saving Recipe...") 
                        : (isEditMode ? "Update Recipe" : "Save Recipe")}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    </>
  );
}