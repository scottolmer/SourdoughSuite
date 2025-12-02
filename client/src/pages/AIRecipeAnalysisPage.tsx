import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { BreadRecipe } from "@shared/schema";

export default function AIRecipeAnalysisPage() {
  const { toast } = useToast();
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [customRecipe, setCustomRecipe] = useState({
    name: "",
    flourGrams: 0,
    waterGrams: 0,
    saltGrams: 0,
    starterGrams: 0,
    instructions: [""],
    ingredients: [""]
  });
  const [recipeText, setRecipeText] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    analysis: string;
    tips: string[];
    score: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all recipes for dropdown
  const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['/api/recipes'],
    queryFn: async () => {
      const result = await apiRequest('/api/recipes', 'GET');
      // Ensure proper type handling
      if (!result) return [] as BreadRecipe[];
      if (result instanceof Response) {
        const json = await result.json();
        return json as BreadRecipe[];
      }
      return result as BreadRecipe[];
    }
  });

  // Get recipe details when selected
  const { data: selectedRecipe, isLoading: isLoadingRecipeDetails } = useQuery({
    queryKey: ['/api/recipes', selectedRecipeId],
    queryFn: async () => {
      if (!selectedRecipeId) return null;
      const result = await apiRequest(`/api/recipes/${selectedRecipeId}`, 'GET');
      
      // Ensure proper type handling
      if (!result) return null;
      if (result instanceof Response) {
        const json = await result.json();
        return json as BreadRecipe;
      }
      return result as BreadRecipe;
    },
    enabled: !!selectedRecipeId
  });

  // Analyze recipe mutation
  const analyzeMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Analyzing recipe with data:", data);
      try {
        // Use direct fetch instead of apiRequest
        const response = await fetch('/api/ai/analyze-recipe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          // Try to parse error response as JSON first, fall back to text
          let errorData;
          let errorMessage = "Failed to analyze recipe";
          
          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            
            // Special handling for timeout errors (status 504)
            if (response.status === 504 || (errorData.error && errorData.error.includes("timeout"))) {
              errorMessage = "The analysis request timed out. Please try again with a simpler recipe or URL.";
            }
          } catch {
            // If not JSON, get raw text
            const errorText = await response.text();
            console.error("Recipe analysis failed:", errorText);
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        return response.json();
      } catch (error) {
        console.error("Recipe analysis error:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      setAnalysisResult(data as { analysis: string; tips: string[]; score: number; });
      setError(null); // Clear any previous errors
      toast({
        title: "Analysis complete",
        description: "Your recipe has been analyzed by our AI.",
      });
    },
    onError: (error) => {
      let errorMessage = "An error occurred during analysis";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide a more user-friendly message for common errors
        if (errorMessage.includes("timeout")) {
          errorMessage = "The analysis request timed out. Please try again with a simpler recipe or URL.";
        } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      }
      
      // Set the error state to display in the UI
      setError(errorMessage);
      setAnalysisResult(null); // Clear any previous results
      
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleAnalyzeExistingRecipe = () => {
    if (!selectedRecipeId) {
      toast({
        title: "No recipe selected",
        description: "Please select a recipe to analyze",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({ recipeId: selectedRecipeId });
  };

  const handleAnalyzeCustomRecipe = () => {
    // Validate custom recipe
    if (!customRecipe.flourGrams || !customRecipe.waterGrams) {
      toast({
        title: "Missing information",
        description: "At minimum, flour and water amounts are needed for analysis",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate(customRecipe);
  };

  const handleAnalyzeRecipeUrl = () => {
    // Validate URL format
    try {
      new URL(recipeUrl); // Will throw an error if invalid URL
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid recipe URL",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({ recipeUrl });
  };

  const handleAnalyzeRecipeText = () => {
    if (!recipeText || recipeText.length < 20) {
      toast({
        title: "Insufficient text",
        description: "Please enter a more detailed recipe description",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({ recipeText });
  };

  const handleCustomRecipeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "ingredients" || name === "instructions") {
      // Split by newlines for these fields
      setCustomRecipe({
        ...customRecipe,
        [name]: value.split('\n').filter(line => line.trim() !== '')
      });
    } else if (name === "flourGrams" || name === "waterGrams" || name === "saltGrams" || name === "starterGrams") {
      // Convert to number for numerical fields
      setCustomRecipe({
        ...customRecipe,
        [name]: parseFloat(value) || 0
      });
    } else {
      setCustomRecipe({
        ...customRecipe,
        [name]: value
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Recipe Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Get expert feedback on your sourdough recipe from our AI assistant
          </p>
        </div>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url">Recipe URL</TabsTrigger>
            <TabsTrigger value="custom">Recipe Details</TabsTrigger>
            <TabsTrigger value="text">Recipe Text</TabsTrigger>
          </TabsList>

          
          {/* Tab for recipe URL analysis */}
          <TabsContent value="url">
            <Card>
              <CardHeader>
                <CardTitle>Analyze Recipe from URL</CardTitle>
                <CardDescription>
                  Enter a URL to a sourdough recipe and our AI will analyze it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipe-url">Recipe URL</Label>
                  <Input
                    id="recipe-url"
                    type="url"
                    value={recipeUrl}
                    onChange={(e) => setRecipeUrl(e.target.value)}
                    placeholder="https://example.com/sourdough-recipe"
                    className="w-full"
                  />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Enter the full URL to a recipe page. Our system will automatically extract and analyze the recipe content.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Works best with dedicated recipe pages from popular cooking websites.
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleAnalyzeRecipeUrl} 
                  disabled={!recipeUrl || analyzeMutation.isPending}
                  className="w-full"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Recipe from URL"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab for custom recipe entry */}
          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Enter Recipe Details</CardTitle>
                <CardDescription>
                  Provide the ingredients and details of your sourdough recipe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipe-name">Recipe Name</Label>
                  <Input
                    id="recipe-name"
                    name="name"
                    value={customRecipe.name}
                    onChange={handleCustomRecipeChange}
                    placeholder="Your recipe name"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flour-grams">Flour (g)</Label>
                    <Input
                      id="flour-grams"
                      name="flourGrams"
                      type="number"
                      min="0"
                      value={customRecipe.flourGrams || ""}
                      onChange={handleCustomRecipeChange}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="water-grams">Water (g)</Label>
                    <Input
                      id="water-grams"
                      name="waterGrams"
                      type="number"
                      min="0"
                      value={customRecipe.waterGrams || ""}
                      onChange={handleCustomRecipeChange}
                      placeholder="350"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salt-grams">Salt (g)</Label>
                    <Input
                      id="salt-grams"
                      name="saltGrams"
                      type="number"
                      min="0"
                      value={customRecipe.saltGrams || ""}
                      onChange={handleCustomRecipeChange}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="starter-grams">Starter (g)</Label>
                    <Input
                      id="starter-grams"
                      name="starterGrams"
                      type="number"
                      min="0"
                      value={customRecipe.starterGrams || ""}
                      onChange={handleCustomRecipeChange}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                  <Textarea
                    id="ingredients"
                    name="ingredients"
                    value={customRecipe.ingredients.join('\n')}
                    onChange={handleCustomRecipeChange}
                    placeholder="500g bread flour&#10;350g water&#10;10g salt&#10;100g sourdough starter"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions (one step per line)</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    value={customRecipe.instructions.join('\n')}
                    onChange={handleCustomRecipeChange}
                    placeholder="Mix flour and water, let rest for 30 minutes&#10;Add starter and salt, mix well&#10;Bulk ferment for 4 hours&#10;Shape and proof overnight"
                    rows={5}
                  />
                </div>

                <Button 
                  onClick={handleAnalyzeCustomRecipe} 
                  disabled={analyzeMutation.isPending}
                  className="w-full"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Recipe"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab for pasting recipe text */}
          <TabsContent value="text">
            <Card>
              <CardHeader>
                <CardTitle>Paste Recipe Text</CardTitle>
                <CardDescription>
                  Copy and paste a recipe from anywhere and our AI will analyze it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipe-text">Recipe Text</Label>
                  <Textarea
                    id="recipe-text"
                    value={recipeText}
                    onChange={(e) => setRecipeText(e.target.value)}
                    placeholder="Paste your entire recipe here, including ingredients and instructions..."
                    rows={10}
                  />
                </div>

                <Button 
                  onClick={handleAnalyzeRecipeText} 
                  disabled={analyzeMutation.isPending}
                  className="w-full"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Recipe"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Loading state */}
        {analyzeMutation.isPending && (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center text-lg">Analyzing your recipe...</p>
              <p className="text-center text-muted-foreground mt-2">
                This might take a moment as our AI assesses your sourdough recipe
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Error state */}
        {error && !analyzeMutation.isPending && (
          <Card className="mt-6 border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-center text-lg font-semibold text-destructive">Analysis Failed</p>
              <p className="text-center mt-2 max-w-md">
                {error}
              </p>
              
              {/* Show different suggestions based on error type */}
              {error.includes("cannot directly analyze recipe URLs") || 
               error.includes("URL browsing capability") ? (
                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <p>To continue with your analysis:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Copy the recipe ingredients and details from the website</li>
                    <li>Use the "Recipe Details" tab to enter them manually</li>
                    <li>Or use the "Recipe Text" tab to paste the entire recipe</li>
                  </ul>
                </div>
              ) : (
                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <p>Suggestions to fix this issue:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Try a simpler recipe with fewer ingredients</li>
                    <li>Ensure the URL leads directly to a recipe page</li>
                    <li>If using a URL, try entering the recipe details manually instead</li>
                    <li>Wait a few minutes and try again</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis results */}
        {analysisResult && !error && !analyzeMutation.isPending && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Recipe Analysis Results
              </CardTitle>
              <CardDescription>
                AI-powered insights and recommendations for your sourdough recipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Recipe Score</Label>
                  {analysisResult.score !== null && analysisResult.score !== undefined ? (
                    <span className={`font-bold text-xl ${getScoreColor(analysisResult.score)}`}>
                      {analysisResult.score}/100
                    </span>
                  ) : (
                    <span className="font-bold text-xl text-muted-foreground">
                      Not scored
                    </span>
                  )}
                </div>
                {analysisResult.score !== null && analysisResult.score !== undefined ? (
                  <Progress value={analysisResult.score} className="h-2" />
                ) : (
                  <Progress value={0} className="h-2 opacity-50" />
                )}
              </div>

              <div className="space-y-2">
                <Label>Expert Analysis</Label>
                <div className="p-4 bg-secondary/20 rounded-md">
                  {analysisResult.analysis ? (
                    <p>{analysisResult.analysis}</p>
                  ) : (
                    <p className="text-muted-foreground">Analysis not available. The AI may be having trouble processing this recipe.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Improvement Tips</Label>
                {analysisResult.tips && Array.isArray(analysisResult.tips) ? (
                  <ul className="space-y-2">
                    {analysisResult.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 bg-secondary/20 rounded-md">
                    <p className="text-muted-foreground">No specific tips provided.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}