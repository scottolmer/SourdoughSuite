import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MobileLayout } from '@/components/mobile-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRecipe } from '@/hooks/use-recipes';
import { useQuery } from '@tanstack/react-query';
import { Slider } from '@/components/ui/slider';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { SEO } from '@/components/SEO';
import { generateWebpageSEO } from '@/lib/schema';
import { useTimeline } from '@/hooks/use-timelines';

// Form schema with validation - adjusted to match database schema
const formSchema = z.object({
  recipeId: z.number(),
  recipeName: z.string(),
  bakeDate: z.date(),
  starterId: z.number().nullable().optional(),
  starterName: z.string().optional(),
  bulkFermentationTime: z.number().int().positive().or(z.string().transform(val => parseInt(val))),
  proofingTime: z.number().int().positive().or(z.string().transform(val => parseInt(val))),
  roomTemperature: z.number().int().positive().optional().or(z.string().transform(val => val ? parseInt(val) : undefined)),
  proofingMethod: z.string().optional(),
  ovenSpringRating: z.number().min(1).max(5),
  crumbStructureRating: z.number().min(1).max(5),
  crustQualityRating: z.number().min(1).max(5),
  flavorRating: z.number().min(1).max(5),
  overallRating: z.number().min(1).max(5).optional(),
  bakeNotes: z.string().optional(),
  starterPerformanceNotes: z.string().optional(),
  photoUrl: z.string().optional(),
  futureAdjustments: z.string().optional(),
  userId: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BakingLogFormPage() {
  const [location] = useLocation();
  
  // Get parameters from localStorage instead of URL
  const getRecipeAndStarterIds = () => {
    const recipeIdFromLocalStorage = localStorage.getItem('bakingLogRecipeId');
    const starterIdFromLocalStorage = localStorage.getItem('bakingLogStarterId');
    const timelineIdFromLocalStorage = localStorage.getItem('bakingLogTimelineId');
    
    console.log("From localStorage - recipeId:", recipeIdFromLocalStorage, "starterId:", starterIdFromLocalStorage, "timelineId:", timelineIdFromLocalStorage);
    
    const recipeId = recipeIdFromLocalStorage ? parseInt(recipeIdFromLocalStorage) : undefined;
    const starterId = starterIdFromLocalStorage ? parseInt(starterIdFromLocalStorage) : null;
    const timelineId = timelineIdFromLocalStorage ? parseInt(timelineIdFromLocalStorage) : null;
    
    return { recipeId, starterId, timelineId };
  };
  
  const { recipeId, starterId, timelineId } = getRecipeAndStarterIds();
  
  console.log("URL Params - recipeId:", recipeId, "starterId:", starterId, "timelineId:", timelineId);
  
  const { data: recipe } = useRecipe(recipeId);
  // Fetch timeline data if available
  const { timeline } = useTimeline(timelineId || 0);
  
  // Log when recipe data is fetched
  useEffect(() => {
    console.log("Recipe data fetched:", recipe);
  }, [recipe]);
  
  // Log when timeline data is fetched
  useEffect(() => {
    console.log("Timeline data fetched:", timeline);
  }, [timeline]);
  
  // Clear localStorage data when component unmounts to prevent stale data
  useEffect(() => {
    return () => {
      console.log("Cleaning up localStorage data");
      localStorage.removeItem('bakingLogRecipeId');
      localStorage.removeItem('bakingLogStarterId');
      localStorage.removeItem('bakingLogTimelineId');
    };
  }, []);
  
  // Fetch starter details if starterId is provided
  const { data: starter } = useQuery({
    queryKey: starterId ? ['/api/starters', starterId] : ['/api/starters', 'empty'],
    queryFn: async () => {
      if (!starterId) return null;
      
      // In a real app, we'd fetch a specific starter by ID
      // For now, we'll fetch all starters and find the one with matching ID
      const response = await fetch('/api/starters');
      if (!response.ok) {
        throw new Error('Failed to fetch starters');
      }
      const starters = await response.json();
      return starters.find((s: any) => s.id === starterId) || null;
    },
    enabled: !!starterId
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default form values - adjusted to match database schema
  const defaultValues: Partial<FormValues> = {
    recipeId: recipeId || 0,
    recipeName: recipe?.name || "",
    bakeDate: new Date(),
    starterId: starterId || null,
    starterName: starter?.name || "",
    bulkFermentationTime: 180, // 3 hours in minutes
    proofingTime: 120, // 2 hours in minutes
    roomTemperature: 75,
    proofingMethod: "Banneton",
    ovenSpringRating: 3,
    crumbStructureRating: 3,
    crustQualityRating: 3,
    flavorRating: 3,
    overallRating: 3,
    bakeNotes: "",
    starterPerformanceNotes: "",
    userId: 1, // Default user ID
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Update form values when recipe, starter, or timeline data changes
  useEffect(() => {
    if (recipe) {
      form.setValue('recipeId', recipe.id);
      form.setValue('recipeName', recipe.name);
    }
    
    if (starter) {
      form.setValue('starterId', starter.id);
      form.setValue('starterName', starter.name);
    }
    
    if (timeline) {
      
      // If the timeline has fermentation data, use it
      if (timeline.timelineData && timeline.timelineData.length > 0) {
        // Extract bulk fermentation time data if available
        const bulkFermentStep = timeline.timelineData.find(step => 
          step.stage.toLowerCase().includes('bulk') || 
          step.stageName.toLowerCase().includes('ferment'));
          
        if (bulkFermentStep) {
          // Calculate duration in minutes
          const start = new Date(bulkFermentStep.startTime);
          const end = new Date(bulkFermentStep.endTime);
          const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
          
          if (durationMinutes > 0) {
            form.setValue('bulkFermentationTime', durationMinutes);
          }
        }
        
        // Extract proofing time data if available
        const proofingStep = timeline.timelineData.find(step => 
          step.stage.toLowerCase().includes('proof') || 
          step.stageName.toLowerCase().includes('proof'));
          
        if (proofingStep) {
          // Calculate duration in minutes
          const start = new Date(proofingStep.startTime);
          const end = new Date(proofingStep.endTime);
          const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
          
          if (durationMinutes > 0) {
            form.setValue('proofingTime', durationMinutes);
          }
        }
      }
    }
    
    // Log the form values after setting
    console.log("Current form values:", form.getValues());
  }, [recipe, starter, timeline, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Format the data to match database schema
      const formattedData = {
        ...data,
        bakeDate: data.bakeDate.toISOString(),
        userId: 1, // Demo user ID
        // Convert values to numbers if needed
        bulkFermentationTime: typeof data.bulkFermentationTime === 'string' 
          ? parseInt(data.bulkFermentationTime) 
          : data.bulkFermentationTime,
        proofingTime: typeof data.proofingTime === 'string' 
          ? parseInt(data.proofingTime) 
          : data.proofingTime,
      };
      
      console.log("Submitting data:", formattedData);
      
      // Save to API
      const result = await apiRequest('/api/baking-logs', {
        method: 'POST',
        body: JSON.stringify(formattedData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // If there's a timeline associated with this log, mark it as complete
      if (timelineId && result && result.id) {
        try {
          // Mark the timeline as complete and link it to the baking log
          await apiRequest(`/api/timelines/${timelineId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ bakingLogId: result.id }),
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`Timeline ${timelineId} marked as complete with baking log ${result.id}`);
          
          // Invalidate timeline queries
          queryClient.invalidateQueries({ queryKey: ['/api/timelines'] });
          queryClient.invalidateQueries({ queryKey: ['/api/timelines', timelineId] });
          if (recipeId) {
            queryClient.invalidateQueries({ queryKey: ['/api/recipes', recipeId, 'timelines'] });
          }
        } catch (error) {
          console.error("Error marking timeline as complete:", error);
          // Still continue as the baking log was created successfully
        }
      }
      
      toast({
        title: "Baking Log Saved",
        description: "Your baking log has been saved successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/baking-logs'] });
      
      // Navigate back to recipe or baking journal
      if (recipe) {
        navigate(`/recipes/${recipe.id}`);
      } else {
        navigate('/baking-journal');
      }
    } catch (error) {
      console.error("Error saving baking log:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your baking log",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate SEO data
  const seoData = generateWebpageSEO({
    title: 'Create Baking Log | Bakehouse Breads',
    description: 'Track your bread baking results with detailed notes on oven spring, crumb structure, and more',
    canonicalUrl: '/baking-logs/new',
    type: 'website',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: recipe ? 'Recipes' : 'Baking Journal', url: recipe ? '/recipes' : '/baking-journal' },
      { name: recipe ? recipe.name : 'Baking Logs', url: recipe ? `/recipes/${recipe.id}` : '/baking-journal' },
      { name: 'New Baking Log', url: '/baking-logs/new' }
    ]
  });

  return (
    <>
      <SEO 
        title="Create Baking Log | Bakehouse Breads"
        description="Track your bread baking results with detailed notes on oven spring, crumb structure, and more"
        canonicalUrl="/baking-logs/new"
        structuredData={seoData}
      />
      <MobileLayout 
        title={recipe ? `Log for ${recipe.name}` : "Create Baking Log"} 
        showBackButton
        backHref={recipe ? `/recipes/${recipe.id}` : '/baking-journal'}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: recipe ? 'Recipes' : 'Tools', url: recipe ? '/recipes' : '/tools' },
          { name: recipe ? recipe.name : 'Baking Journal', url: recipe ? `/recipes/${recipe.id}` : '/baking-journal' },
          { name: 'New Baking Log', url: '/baking-logs/new' }
        ]}
      >
        <div className="space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Baking Log</CardTitle>
              <CardDescription>
                <div className="flex flex-col gap-1 mt-1">
                  {recipe && (
                    <span className="flex items-center">
                      Recipe: <span className="font-semibold ml-1">{recipe.name}</span>
                    </span>
                  )}
                  {starter && (
                    <span className="flex items-center">
                      Using starter: <span className="font-semibold ml-1">{starter.name}</span>
                    </span>
                  )}
                  {timeline && (
                    <span className="flex items-center text-green-600">
                      <ClockIcon className="h-4 w-4 mr-1" /> 
                      <span>Using timeline data from your baking plan</span>
                    </span>
                  )}
                  {!recipe && !starter && !timeline && (
                    "Track the results of your bread baking"
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Recipe Reference - hidden if coming from recipe page */}
                  {!recipe && (
                    <FormField
                      control={form.control}
                      name="recipeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipe ID*</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter recipe ID" {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Baking Date */}
                  <FormField
                    control={form.control}
                    name="bakeDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Baking Date*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Starter Reference */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="starterId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starter ID</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Optional starter ID" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              value={field.value === null ? '' : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="starterName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starter Name</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco Starter" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Fermentation & Proofing */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bulkFermentationTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bulk Fermentation Time*</FormLabel>
                          <FormControl>
                            <Input placeholder="3 hours" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="proofingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proofing Time*</FormLabel>
                          <FormControl>
                            <Input placeholder="2 hours" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Ambient Temperature & Proofing Method */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="roomTemperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ambient Temperature</FormLabel>
                          <FormControl>
                            <Input placeholder="75°F" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="proofingMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proofing Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Banneton">Banneton</SelectItem>
                              <SelectItem value="Bowl">Bowl</SelectItem>
                              <SelectItem value="Proofing Basket">Proofing Basket</SelectItem>
                              <SelectItem value="Loaf Pan">Loaf Pan</SelectItem>
                              <SelectItem value="Dutch Oven">Dutch Oven</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Rating Section */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium">Bake Results (1-5)</h3>
                    
                    {/* Oven Spring */}
                    <FormField
                      control={form.control}
                      name="ovenSpringRating"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Oven Spring*</FormLabel>
                            <span className="text-sm font-medium">{field.value}/5</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Rate the rise during baking (1=Poor, 5=Excellent)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Crumb Structure */}
                    <FormField
                      control={form.control}
                      name="crumbStructureRating"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Crumb Structure*</FormLabel>
                            <span className="text-sm font-medium">{field.value}/5</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Rate the interior texture (1=Poor, 5=Excellent)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Crust Quality */}
                    <FormField
                      control={form.control}
                      name="crustQualityRating"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Crust Quality*</FormLabel>
                            <span className="text-sm font-medium">{field.value}/5</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Rate the crust (1=Poor, 5=Excellent)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Flavor */}
                    <FormField
                      control={form.control}
                      name="flavorRating"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Flavor*</FormLabel>
                            <span className="text-sm font-medium">{field.value}/5</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Rate the taste (1=Poor, 5=Excellent)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="bakeNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observations, adjustments, improvements for next time..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Image URL */}
                  <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/bread-image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Removed isFavorite field as it's not in the database schema */}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Baking Log"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    </>
  );
}