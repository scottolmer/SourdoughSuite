import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Plus, Trash } from 'lucide-react';
import { DialogFooter, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define the form schema with zod
const bakingLogSchema = z.object({
  recipeName: z.string().min(1, "Recipe name is required"),
  recipeId: z.number().optional(),
  bakeDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),
  // Make sure ratings have default values and aren't optional for consistency
  ovenSpringRating: z.number().min(1).max(10).default(5),
  crumbStructureRating: z.number().min(1).max(10).default(5),
  crustQualityRating: z.number().min(1).max(10).default(5),
  flavorRating: z.number().min(1).max(10).default(5),
  overallRating: z.number().min(1).max(10).default(5),
  // Keep these optional since they're not required
  starterPerformanceNotes: z.string().optional(),
  bakeNotes: z.string().optional(),
  roomTemperature: z.number().optional(),
  bulkFermentationTime: z.number().positive().optional(),
  proofingMethod: z.string().default("room temperature"),
  proofingTime: z.number().positive().optional(),
  bakingTemperature: z.number().optional(),
  bakingMethod: z.string().optional(),
  futureAdjustments: z.string().optional(),
  photoUrl: z.string().optional(),
});

type BakingLogFormValues = z.infer<typeof bakingLogSchema>;

type Recipe = {
  id: number;
  name: string;
};

interface BakingLogFormProps {
  onSubmit: (values: BakingLogFormValues) => void;
  defaultValues?: Partial<BakingLogFormValues>;
  isLoading?: boolean;
}

export const BakingLogForm: React.FC<BakingLogFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading = false,
}) => {
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  
  // Load recipes for the recipe select dropdown
  const { data: recipes = [], refetch: refetchRecipes } = useQuery({
    queryKey: ['/api/recipes'],
    queryFn: async () => {
      const response = await apiRequest<Recipe[]>('/api/recipes');
      return response;
    },
  });

  // Handle adding a new recipe
  const handleAddRecipe = async () => {
    if (!newRecipeName.trim()) return;
    
    setIsAddingRecipe(true);
    try {
      // Create a more complete recipe that will be saved to the user's recipe collection
      const recipeData = {
        name: newRecipeName,
        description: 'Custom recipe added from baking log',
        ingredients: [], // Empty ingredients list to be filled in later
        instructions: [], // Empty instructions to be filled in later
        // Add additional fields to make it a proper recipe in the collection
        textureProfile: {
          openCrumb: 5,
          chewiness: 5,
          moistness: 5,
          crust: 5
        },
        flavorProfile: {
          sourness: 5,
          sweetness: 5,
          complexity: 5
        },
        isPublic: false, // Private by default
        userId: 1, // Current user ID
        // Add some basic metadata
        totalTime: null,
        activeTime: null,
        difficulty: "intermediate",
        yields: "1 loaf",
        imageUrl: null,
        // Set as a custom recipe added from the baking log
        tags: ['custom', 'baking-log']
      };

      // Save the recipe to the database
      const newRecipe = await apiRequest<Recipe>('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
      });
      
      console.log("Recipe added to personal collection:", newRecipe);
      
      // Refetch recipes to include the new one
      await refetchRecipes();
      
      // Select the newly created recipe
      if (newRecipe?.id) {
        form.setValue('recipeId', newRecipe.id);
        form.setValue('recipeName', newRecipe.name);
      }
      
      // Close the dialog and reset state
      setIsAddRecipeOpen(false);
      setNewRecipeName('');
      
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setIsAddingRecipe(false);
    }
  };

  // Set up form with react-hook-form and zod validation
  const form = useForm<BakingLogFormValues>({
    resolver: zodResolver(bakingLogSchema),
    defaultValues: {
      recipeName: '',
      bakeDate: new Date().toISOString().split('T')[0],
      ovenSpringRating: 5,
      crumbStructureRating: 5,
      crustQualityRating: 5,
      flavorRating: 5,
      overallRating: 5,
      proofingMethod: 'room temperature',
      ...defaultValues,
    },
  });

  // Create a modified submit function that ensures the date is properly formatted
  const handleSubmit = async (values: BakingLogFormValues) => {
    // Make sure required fields are present before submitting
    if (!values.recipeName || !values.bakeDate) {
      form.setError("recipeName", { 
        type: "manual", 
        message: "Recipe name is required" 
      });
      return;
    }

    // Create a new object with the modified date for submission
    // This keeps the original form values intact
    const submissionValues = { ...values };

    try {
      // Ensure bakeDate is properly formatted with time component
      if (submissionValues.bakeDate) {
        // Parse the date string properly - the form date input returns YYYY-MM-DD
        const parts = submissionValues.bakeDate.split('-').map(part => parseInt(part));
        
        if (parts.length !== 3) {
          form.setError("bakeDate", {
            type: "manual",
            message: "Invalid date format. Use YYYY-MM-DD"
          });
          return;
        }
        
        // Month is 0-indexed in JavaScript Date
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        
        // Format it as an ISO string with time (will include timezone)
        const formattedDate = dateObj.toISOString();
        
        // Set the formatted date in the submission values
        submissionValues.bakeDate = formattedDate;
        
        console.log('Formatted date for submission:', formattedDate);
      }
      
      // Submit the modified values
      onSubmit(submissionValues);
    } catch (error) {
      console.error('Date formatting error:', error);
      form.setError("bakeDate", {
        type: "manual",
        message: "Error formatting date. Please enter a valid date."
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 px-1">
        <div className="grid grid-cols-1 gap-4 max-w-full">
          {/* Recipe Selection */}
          <div>
            <FormField
              control={form.control}
              name="recipeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(parseInt(value));
                      // Set the recipe name when a recipe is selected
                      const selectedRecipe = recipes.find(recipe => recipe.id === parseInt(value));
                      if (selectedRecipe) {
                        form.setValue('recipeName', selectedRecipe.name);
                      }
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a recipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id.toString()}>
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between mt-2">
                    <FormDescription>
                      Select the recipe you used for this bake
                    </FormDescription>
                    
                    <Dialog open={isAddRecipeOpen} onOpenChange={setIsAddRecipeOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" /> New Recipe
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Add New Recipe</DialogTitle>
                          <DialogDescription>
                            Create a new recipe to use in your baking log.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <FormLabel htmlFor="new-recipe-name">Recipe Name</FormLabel>
                            <Input
                              id="new-recipe-name"
                              placeholder="Enter recipe name"
                              value={newRecipeName}
                              onChange={(e) => setNewRecipeName(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAddRecipeOpen(false)}
                            className="w-full sm:w-auto order-2 sm:order-1"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="button" 
                            onClick={handleAddRecipe}
                            disabled={isAddingRecipe || !newRecipeName.trim()}
                            className="w-full sm:w-auto order-1 sm:order-2"
                          >
                            {isAddingRecipe ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : 'Create Recipe'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Recipe Name (if custom recipe or not found in dropdown) */}
          <div>
            <FormField
              control={form.control}
              name="recipeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Recipe name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the name of the recipe you used
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bake Date */}
          <FormField
            control={form.control}
            name="bakeDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bake Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ratings */}
          <div>
            <h3 className="text-lg font-medium mb-2">Ratings</h3>
          </div>

          {/* Oven Spring Rating */}
          <FormField
            control={form.control}
            name="ovenSpringRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oven Spring Rating (1-10) *</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[field.value || 5]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{field.value}</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Crumb Structure Rating */}
          <FormField
            control={form.control}
            name="crumbStructureRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crumb Structure Rating (1-10) *</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[field.value || 5]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{field.value}</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Crust Quality Rating */}
          <FormField
            control={form.control}
            name="crustQualityRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crust Quality Rating (1-10) *</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[field.value || 5]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{field.value}</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Flavor Rating */}
          <FormField
            control={form.control}
            name="flavorRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flavor Rating (1-10) *</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[field.value || 5]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{field.value}</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Overall Rating */}
          <FormField
            control={form.control}
            name="overallRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overall Rating (1-10) *</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[field.value || 5]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{field.value}</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Starter Performance Notes */}
          <div>
            <FormField
              control={form.control}
              name="starterPerformanceNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starter Performance Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How did your starter perform? Observations about activity, rise, smell, etc."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bake Notes */}
          <div>
            <FormField
              control={form.control}
              name="bakeNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bake Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="General notes about the bake, what went well, what didn't..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Process Details */}
          <div>
            <h3 className="text-lg font-medium mb-2 mt-4">Process Details (Optional)</h3>
          </div>

          {/* Room Temperature */}
          <FormField
            control={form.control}
            name="roomTemperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Temperature (°F)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bulk Fermentation Time */}
          <FormField
            control={form.control}
            name="bulkFermentationTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bulk Fermentation Time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Proofing Method */}
          <FormField
            control={form.control}
            name="proofingMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proofing Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a proofing method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="room temperature">Room Temperature</SelectItem>
                    <SelectItem value="refrigerator">Refrigerator</SelectItem>
                    <SelectItem value="proofing box">Proofing Box</SelectItem>
                    <SelectItem value="oven with light">Oven with Light</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Proofing Time */}
          <FormField
            control={form.control}
            name="proofingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proofing Time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Baking Temperature */}
          <FormField
            control={form.control}
            name="bakingTemperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Baking Temperature (°F)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Baking Method */}
          <FormField
            control={form.control}
            name="bakingMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Baking Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a baking method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dutch oven">Dutch Oven</SelectItem>
                    <SelectItem value="baking stone">Baking Stone</SelectItem>
                    <SelectItem value="loaf pan">Loaf Pan</SelectItem>
                    <SelectItem value="baking sheet">Baking Sheet</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Future Adjustments */}
          <div>
            <FormField
              control={form.control}
              name="futureAdjustments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Future Adjustments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What would you change for the next bake?"
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Photo URL */}
          <div>
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/images/my-bread-photo.jpg"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    URL to a photo of your bread (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Baking Log'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};