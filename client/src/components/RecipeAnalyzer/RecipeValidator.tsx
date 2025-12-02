import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ScrapedRecipe } from '@shared/schema';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Loader2, AlertCircle, CheckCircle2, FileText, ListChecks, BarChart4, MessageSquareText, Link2, FileInput } from 'lucide-react';

// URL validation - using a more lenient approach for user-friendly behavior
const urlSchema = z.string().refine(
  (val) => val.trim().startsWith('http://') || val.trim().startsWith('https://'),
  { message: "URL must start with http:// or https://" }
);

// Form validation schema
const formSchema = z.object({
  inputType: z.enum(["text", "url"]),
  recipeName: z.string().optional(),
  recipeText: z.string().optional(),
  recipeUrl: z.string().optional(),
}).superRefine((data, ctx) => {
  // Only validate if we're in the validation phase, not during initial form setup
  if (data.inputType === "text" && data.recipeText !== undefined && data.recipeText.trim().length > 0 && data.recipeText.trim().length < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Recipe text must be at least 10 characters",
      path: ["recipeText"],
    });
  }
  
  if (data.inputType === "url" && data.recipeUrl !== undefined && data.recipeUrl.trim().length > 0 && !urlSchema.safeParse(data.recipeUrl).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter a valid URL",
      path: ["recipeUrl"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

// Using ScrapedRecipe from shared schema

// Recipe Analysis Result types
interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface AnalysisResult {
  extractedRecipe?: {
    ingredients: Ingredient[];
    instructions: string[];
  };
  analysis: {
    hydration: string;
    fermentationApproach: string;
    technique: string;
    overallAssessment: string;
  };
  suggestions: {
    hydration: string;
    fermentation: string;
    technique: string;
    ingredients: string;
    general: string;
  };
  id?: number;
  saved?: boolean;
}

// Helper function to determine assessment indicator color based on content
const getAssessmentColor = (text: string): string => {
  if (!text) return "bg-gray-200";
  
  const lowerText = text.toLowerCase();
  
  // Positive indicators for green
  const goodKeywords = ['good', 'excellent', 'well balanced', 'appropriate', 'great', 'ideal', 'effective', 'proper'];
  // Warning indicators for yellow
  const warningKeywords = ['could', 'might', 'consider', 'try', 'potentially', 'suggestion', 'moderate', 'slight'];
  // Negative indicators for red
  const badKeywords = ['too', 'insufficient', 'excessive', 'problem', 'issue', 'incorrect', 'poor', 'lacking', 'inadequate', 'overproofed', 'underproofed'];

  // Check for negative indicators first (highest priority)
  for (const keyword of badKeywords) {
    if (lowerText.includes(keyword)) {
      return "bg-red-500";
    }
  }
  
  // Then check for warning indicators
  for (const keyword of warningKeywords) {
    if (lowerText.includes(keyword)) {
      return "bg-yellow-500";
    }
  }
  
  // Finally check for positive indicators
  for (const keyword of goodKeywords) {
    if (lowerText.includes(keyword)) {
      return "bg-green-500";
    }
  }
  
  // Default color if no keywords match
  return "bg-yellow-400";
};

const RecipeValidator = () => {
  const [activeTab, setActiveTab] = useState('input');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [recipeValidated, setRecipeValidated] = useState(false);
  const { toast } = useToast();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputType: "text",
      recipeName: '',
      recipeText: '',
      recipeUrl: '',
    },
  });

  // Watch input type to toggle between URL and text input
  const inputType = form.watch("inputType");
  
  // Mutation for scraping recipe from URL
  const scrapeRecipeMutation = useMutation({
    mutationFn: (url: string) => {
      return apiRequest('/api/recipe-validator/scrape', { 
        method: 'POST', 
        body: JSON.stringify({ url }) 
      }) as Promise<any>;
    },
    onSuccess: (data: { success: boolean, recipe: ScrapedRecipe }) => {
      if (data.success && data.recipe) {
        // Auto-fill recipe name if available
        if (data.recipe.title) {
          form.setValue("recipeName", data.recipe.title);
        }
        
        // Format the recipe text from the scraped data
        let formattedRecipe = "";
        
        if (data.recipe.ingredients.length > 0) {
          formattedRecipe += "Ingredients:\n";
          data.recipe.ingredients.forEach(ing => {
            formattedRecipe += `- ${ing}\n`;
          });
          formattedRecipe += "\n";
        }
        
        if (data.recipe.instructions.length > 0) {
          formattedRecipe += "Instructions:\n";
          data.recipe.instructions.forEach((step, index) => {
            formattedRecipe += `${index + 1}. ${step}\n`;
          });
        } else if (data.recipe.fullText) {
          // If no structured instructions but we have full text, use that
          formattedRecipe += data.recipe.fullText;
        }
        
        // Set the recipe text and switch to text input
        form.setValue("recipeText", formattedRecipe);
        form.setValue("inputType", "text");
        
        // Automatically set as validated to make workflow smoother
        setRecipeValidated(true);
        
        toast({
          title: "Recipe scraped successfully",
          description: "Recipe has been extracted and validated. Analysis is starting...",
        });
        
        // Automatically start analysis after a short delay to let the UI update
        setTimeout(() => {
          const payload = {
            recipeText: formattedRecipe,
            recipeName: data.recipe.title,
          };
          analyzeRecipeMutation.mutate(payload);
        }, 500);
      }
    },
    onError: (error: any) => {
      // Handle specific scraping errors with appropriate user guidance
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to extract recipe from URL";
      const errorType = error?.response?.data?.errorType;
      
      let toastTitle = "Error scraping recipe";
      let toastDescription = errorMessage;
      
      switch (errorType) {
        case 'SCRAPING_BLOCKED':
          toastTitle = "Website blocks scraping";
          toastDescription = "This website doesn't allow us to scrape the recipe. Please manually enter the recipe text for analysis.";
          break;
        case 'TIMEOUT':
          toastTitle = "Request timeout";
          toastDescription = "The website took too long to respond. Please try again or enter the recipe manually.";
          break;
        case 'NOT_FOUND':
          toastTitle = "Recipe not found";
          toastDescription = "The recipe page could not be found. Please check the URL and try again.";
          break;
        case 'SERVER_ERROR':
          toastTitle = "Website unavailable";
          toastDescription = "The website is currently unavailable. Please try again later or enter the recipe manually.";
          break;
        default:
          toastTitle = "Unable to extract recipe";
          toastDescription = "Unable to extract recipe from this URL. Please try entering the recipe text manually.";
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
        variant: "destructive",
      });
      
      // Automatically switch to text input mode for blocked sites
      if (errorType === 'SCRAPING_BLOCKED') {
        form.setValue("inputType", "text");
        form.setValue("recipeUrl", "");
      }
    }
  });
  
  // Mutation for analyzing recipe
  const analyzeRecipeMutation = useMutation({
    mutationFn: (data: { recipeText: string, recipeName?: string, userId?: number }) => {
      return apiRequest('/api/recipe-validator/analyze', {
        method: 'POST',
        body: JSON.stringify(data)
      }) as Promise<any>;
    },
    onSuccess: (data: AnalysisResult) => {
      console.log("Analysis result:", data);
      console.log("Suggestions structure:", {
        hasData: !!data,
        hasSuggestions: !!data.suggestions,
        suggestionType: data.suggestions ? typeof data.suggestions : 'none',
        suggestionKeys: data.suggestions ? Object.keys(data.suggestions) : [],
        suggestionContent: data.suggestions,
        hydrationExists: data.suggestions && 'hydration' in data.suggestions,
        hydrationValue: data.suggestions?.hydration
      });
      
      // Ensure suggestions object is present
      if (!data.suggestions) {
        console.log("Creating default suggestions object");
        data.suggestions = {
          hydration: "No specific hydration suggestions available.",
          fermentation: "No specific fermentation suggestions available.",
          technique: "No specific technique suggestions available.",
          ingredients: "No specific ingredient suggestions available.",
          general: "No general suggestions available."
        };
      }
      
      setAnalysisResult(data);
      setIsAnalyzed(true);
      setActiveTab('results');
      toast({
        title: "Recipe analyzed successfully",
        description: "Review the analysis and suggestions to improve your recipe.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error analyzing recipe",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle URL submission
  const handleUrlSubmit = () => {
    const url = form.getValues("recipeUrl");
    if (url && urlSchema.safeParse(url).success) {
      // Show loading indicator while scraping
      toast({
        title: "Scraping recipe",
        description: "Please wait while we extract the recipe details...",
      });
      scrapeRecipeMutation.mutate(url);
    } else {
      toast({
        title: "Invalid URL Format",
        description: "URL must start with http:// or https://",
        variant: "destructive",
      });
    }
  };

  // Submit handler
  const onSubmit = (values: FormValues) => {
    // If it's URL input type and we haven't scraped yet, scrape first
    if (values.inputType === "url" && values.recipeUrl && !values.recipeText) {
      handleUrlSubmit();
      return;
    }
    
    // Prepare payload for analysis
    const payload = {
      recipeText: values.recipeText || "",
      recipeName: values.recipeName,
      // We'll omit the userId for now since we don't have auth
    };
    
    // Check if we have valid recipe text
    if (!payload.recipeText || payload.recipeText.trim().length < 10) {
      toast({
        title: "Invalid recipe text",
        description: "Please enter at least 10 characters of recipe text before analyzing.",
        variant: "destructive",
      });
      return;
    }
    
    // Set as validated and proceed directly to analysis
    setRecipeValidated(true);
    
    toast({
      title: "Analyzing recipe",
      description: "Processing your recipe and generating analysis...",
    });
    
    analyzeRecipeMutation.mutate(payload);
  };

  // Reset analysis and form
  const handleReset = () => {
    form.reset();
    setAnalysisResult(null);
    setIsAnalyzed(false);
    setRecipeValidated(false);
    setActiveTab('input');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="input" disabled={analyzeRecipeMutation.isPending}>
            <FileText className="mr-2 h-4 w-4" />
            Recipe Input
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!isAnalyzed || analyzeRecipeMutation.isPending}>
            <BarChart4 className="mr-2 h-4 w-4" />
            Analysis Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Recipe</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  toast({
                    title: "Form validation failed",
                    description: "Please check the form and try again.",
                    variant: "destructive",
                  });
                })} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="inputType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Input Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="text" id="input-text" />
                              <label htmlFor="input-text" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <FileInput className="h-4 w-4 mr-2" />
                                  <span>Enter Recipe Text</span>
                                </div>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="url" id="input-url" />
                              <label htmlFor="input-url" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <Link2 className="h-4 w-4 mr-2" />
                                  <span>Import from URL</span>
                                </div>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="recipeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="My Sourdough Recipe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Give your recipe a name to help identify it later
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {recipeValidated && !analyzeRecipeMutation.isPending && !isAnalyzed && (
                    <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle>Recipe Validated</AlertTitle>
                      <AlertDescription>
                        Your recipe has been validated. Click 'Analyze Recipe' to proceed with full analysis.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {inputType === "url" ? (
                    <FormField
                      control={form.control}
                      name="recipeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipe URL</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="https://example.com/sourdough-recipe" 
                                defaultValue={field.value || ''}
                                onChange={(e) => {
                                  // Update the form value using regular change handler
                                  field.onChange(e.target.value);
                                }}
                                className="flex-1"
                              />
                              <Button 
                                type="button" 
                                variant="default" 
                                onClick={handleUrlSubmit}
                                disabled={scrapeRecipeMutation.isPending}
                                className="bg-primary hover:bg-primary/90 text-white"
                              >
                                {scrapeRecipeMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scraping...
                                  </>
                                ) : (
                                  "Extract Recipe"
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Enter the URL of a recipe website to automatically extract the recipe
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="recipeText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipe Text</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Paste your entire recipe here including ingredients and instructions..."
                              className="min-h-[300px]"
                              value={field.value || ''}
                              onChange={(e) => {
                                // Sanitize HTML tags from pasted content
                                const value = e.target.value.replace(/<[^>]*>/g, '');
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Include all ingredients, amounts, and preparation steps
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleReset} disabled={analyzeRecipeMutation.isPending}>
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={analyzeRecipeMutation.isPending || (inputType === "url" && !form.getValues("recipeText"))}
                      variant="default"
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      {analyzeRecipeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart4 className="mr-2 h-4 w-4" />
                          Analyze Recipe
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  <span>Include all ingredients with measurements (preferably in grams)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  <span>Provide detailed step-by-step instructions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  <span>Mention fermentation times and temperatures</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  <span>Include details about your sourdough starter if applicable</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  <span>Note baking times, temperatures, and any special equipment used</span>
                </li>
              </ul>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>URL Scraping Note:</strong> Some websites may block automated scraping. 
                  If you encounter issues, simply copy and paste the recipe text manually for analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analysisResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Recipe Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative overflow-hidden p-4 border border-muted bg-card rounded-md">
                      {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.overallAssessment && (
                        <div 
                          className={`absolute top-0 left-0 h-1.5 w-full ${
                            getAssessmentColor(analysisResult.analysis.overallAssessment)
                          }`} 
                          aria-hidden="true"
                        ></div>
                      )}
                      <div className="flex items-center mb-2">
                        <h3 className="font-medium">Overall Assessment</h3>
                        {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.overallAssessment && (
                          <div 
                            className={`ml-auto flex-shrink-0 w-4 h-4 rounded-full ${
                              getAssessmentColor(analysisResult.analysis.overallAssessment)
                            }`} 
                            aria-hidden="true"
                          ></div>
                        )}
                      </div>
                      <p className="text-sm">
                        {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.overallAssessment ? 
                          analysisResult.analysis.overallAssessment : 
                          "Overall assessment not available."
                        }
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Hydration assessment with indicator */}
                      <div className="p-3 bg-muted rounded-md relative overflow-hidden">
                        {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.hydration && (
                          <div 
                            className={`absolute top-0 left-0 h-1.5 w-full ${
                              getAssessmentColor(analysisResult.analysis.hydration)
                            }`} 
                            aria-hidden="true"
                          ></div>
                        )}
                        <div className="flex items-center mb-1">
                          <h4 className="text-sm font-medium">Hydration</h4>
                          {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.hydration && (
                            <div 
                              className={`ml-auto flex-shrink-0 w-3 h-3 rounded-full ${
                                getAssessmentColor(analysisResult.analysis.hydration)
                              }`} 
                              aria-hidden="true"
                            ></div>
                          )}
                        </div>
                        <p className="text-sm">
                          {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.hydration ? 
                            analysisResult.analysis.hydration : 
                            "Hydration analysis not available."
                          }
                        </p>
                      </div>
                      
                      {/* Fermentation assessment with indicator */}
                      <div className="p-3 bg-muted rounded-md relative overflow-hidden">
                        {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.fermentationApproach && (
                          <div 
                            className={`absolute top-0 left-0 h-1.5 w-full ${
                              getAssessmentColor(analysisResult.analysis.fermentationApproach)
                            }`} 
                            aria-hidden="true"
                          ></div>
                        )}
                        <div className="flex items-center mb-1">
                          <h4 className="text-sm font-medium">Fermentation</h4>
                          {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.fermentationApproach && (
                            <div 
                              className={`ml-auto flex-shrink-0 w-3 h-3 rounded-full ${
                                getAssessmentColor(analysisResult.analysis.fermentationApproach)
                              }`} 
                              aria-hidden="true"
                            ></div>
                          )}
                        </div>
                        <p className="text-sm">
                          {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.fermentationApproach ? 
                            analysisResult.analysis.fermentationApproach : 
                            "Fermentation analysis not available."
                          }
                        </p>
                      </div>
                      
                      {/* Technique assessment with indicator */}
                      <div className="p-3 bg-muted rounded-md relative overflow-hidden">
                        {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.technique && (
                          <div 
                            className={`absolute top-0 left-0 h-1.5 w-full ${
                              getAssessmentColor(analysisResult.analysis.technique)
                            }`} 
                            aria-hidden="true"
                          ></div>
                        )}
                        <div className="flex items-center mb-1">
                          <h4 className="text-sm font-medium">Technique</h4>
                          {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.technique && (
                            <div 
                              className={`ml-auto flex-shrink-0 w-3 h-3 rounded-full ${
                                getAssessmentColor(analysisResult.analysis.technique)
                              }`} 
                              aria-hidden="true"
                            ></div>
                          )}
                        </div>
                        <p className="text-sm">
                          {analysisResult.analysis && typeof analysisResult.analysis === 'object' && analysisResult.analysis.technique ? 
                            analysisResult.analysis.technique : 
                            "Technique analysis not available."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ListChecks className="mr-2 h-5 w-5" />
                      Extracted Recipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] px-6">
                      {analysisResult.extractedRecipe && 
                        ((analysisResult.extractedRecipe.ingredients && analysisResult.extractedRecipe.ingredients.length > 0) || 
                         (analysisResult.extractedRecipe.instructions && analysisResult.extractedRecipe.instructions.length > 0)) ? (
                        <div className="space-y-6 py-2">
                          <div>
                            <h3 className="font-medium mb-2">Ingredients</h3>
                            <ul className="space-y-1 text-sm">
                              {(analysisResult.extractedRecipe.ingredients || []).map((ing, i) => {
                                // Handle both string and object formats
                                if (typeof ing === 'string') {
                                  return (
                                    <li key={i} className="text-sm">
                                      {ing}
                                    </li>
                                  );
                                } else if (typeof ing === 'object' && ing !== null) {
                                  return (
                                    <li key={i} className="flex items-center">
                                      <span className="font-medium">{ing.amount} {ing.unit}</span>
                                      <span className="mx-2">-</span>
                                      <span>{ing.name}</span>
                                    </li>
                                  );
                                }
                                return null;
                              })}
                            </ul>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="font-medium mb-2">Instructions</h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                              {(analysisResult.extractedRecipe.instructions || []).map((step, i) => (
                                <li key={i} className="pl-1">{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ) : (
                        <Alert className="m-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Unable to extract structured recipe</AlertTitle>
                          <AlertDescription>
                            We couldn't extract a structured recipe from your input. Please check the suggestions for improving your recipe format.
                          </AlertDescription>
                        </Alert>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquareText className="mr-2 h-5 w-5" />
                      Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                      <Accordion type="single" collapsible className="px-6 pt-2 pb-6">
                        <AccordionItem value="hydration">
                          <AccordionTrigger className="flex">
                            <span>Hydration Improvements</span>
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.hydration && (
                              <div 
                                className={`ml-auto mr-4 flex-shrink-0 w-3 h-3 rounded-full ${
                                  getAssessmentColor(analysisResult.suggestions.hydration)
                                }`} 
                                aria-hidden="true"
                              ></div>
                            )}
                          </AccordionTrigger>
                          <AccordionContent>
                            {/* Show the hydration suggestions if available */}
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.hydration ? 
                              analysisResult.suggestions.hydration : 
                              "No specific hydration suggestions available."
                            }
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="fermentation">
                          <AccordionTrigger className="flex">
                            <span>Fermentation Improvements</span>
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.fermentation && (
                              <div 
                                className={`ml-auto mr-4 flex-shrink-0 w-3 h-3 rounded-full ${
                                  getAssessmentColor(analysisResult.suggestions.fermentation)
                                }`} 
                                aria-hidden="true"
                              ></div>
                            )}
                          </AccordionTrigger>
                          <AccordionContent>
                            {/* Show the fermentation suggestions if available */}
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.fermentation ? 
                              analysisResult.suggestions.fermentation : 
                              "No specific fermentation suggestions available."
                            }
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="technique">
                          <AccordionTrigger className="flex">
                            <span>Technique Improvements</span>
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.technique && (
                              <div 
                                className={`ml-auto mr-4 flex-shrink-0 w-3 h-3 rounded-full ${
                                  getAssessmentColor(analysisResult.suggestions.technique)
                                }`} 
                                aria-hidden="true"
                              ></div>
                            )}
                          </AccordionTrigger>
                          <AccordionContent>
                            {/* Show the technique suggestions if available */}
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.technique ? 
                              analysisResult.suggestions.technique : 
                              "No specific technique suggestions available."
                            }
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="ingredients">
                          <AccordionTrigger className="flex">
                            <span>Ingredient Improvements</span>
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.ingredients && (
                              <div 
                                className={`ml-auto mr-4 flex-shrink-0 w-3 h-3 rounded-full ${
                                  getAssessmentColor(analysisResult.suggestions.ingredients)
                                }`} 
                                aria-hidden="true"
                              ></div>
                            )}
                          </AccordionTrigger>
                          <AccordionContent>
                            {/* Show the ingredient suggestions if available */}
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.ingredients ? 
                              analysisResult.suggestions.ingredients : 
                              "No specific ingredient suggestions available."
                            }
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="general">
                          <AccordionTrigger className="flex">
                            <span>General Advice</span>
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.general && (
                              <div 
                                className={`ml-auto mr-4 flex-shrink-0 w-3 h-3 rounded-full ${
                                  getAssessmentColor(analysisResult.suggestions.general)
                                }`} 
                                aria-hidden="true"
                              ></div>
                            )}
                          </AccordionTrigger>
                          <AccordionContent>
                            {/* Show the general suggestions if available */}
                            {analysisResult.suggestions && typeof analysisResult.suggestions === 'object' && analysisResult.suggestions.general ? 
                              analysisResult.suggestions.general : 
                              "No general suggestions available."
                            }
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setActiveTab('input')}>
                  Back to Input
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleReset}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Analyze Another Recipe
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecipeValidator;