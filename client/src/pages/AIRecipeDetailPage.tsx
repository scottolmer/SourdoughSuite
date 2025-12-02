import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, Users, ChefHat, Thermometer, Scale, ArrowLeft, 
  BookOpen, Star, Share2, Heart, Timer, AlertCircle,
  Wheat, Droplets, FlaskConical, TrendingUp, Brain, Sparkles
} from "lucide-react";
import { SEO } from '@/components/SEO';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RecipeDetail {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  totalTime: string;
  activeTime: string;
  yields: string;
  tags: string[];
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    bakersPercentage?: string;
    notes?: string;
  }>;
  instructions: string[];
  notes: string[];
  hydration?: number;
  starterId?: number;
  slug: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AIAnalysis {
  difficultyExplanation: string;
  keyTechniques: string[];
  commonMistakes: string[];
  tips: string[];
  variations: string[];
}

export default function AIRecipeDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch recipe details
  const { data: recipe, isLoading, error } = useQuery<RecipeDetail>({
    queryKey: ['/api/recipes', id],
    queryFn: async () => {
      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) {
        throw new Error('Recipe not found');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Generate AI analysis
  const aiAnalysisMutation = useMutation({
    mutationFn: async (recipeData: RecipeDetail) => {
      return apiRequest('/api/ai/analyze-recipe', {
        method: 'POST',
        body: JSON.stringify({
          name: recipeData.name,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          difficulty: recipeData.difficulty,
          hydration: recipeData.hydration
        })
      });
    },
    onSuccess: (data) => {
      toast({
        title: "AI Analysis Complete",
        description: "Recipe insights and tips generated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Unable to generate AI insights. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAIAnalysis = () => {
    if (recipe) {
      setIsAnalyzing(true);
      aiAnalysisMutation.mutate(recipe);
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title="Loading Recipe..." showBackButton backHref="/recipes">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </MobileLayout>
    );
  }

  if (error || !recipe) {
    return (
      <MobileLayout title="Recipe Not Found" showBackButton backHref="/recipes">
        <SEO
          title="Recipe Not Found | Bakehouse Breads"
          description="The requested recipe could not be found."
          canonicalUrl="/recipes"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Recipe Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The recipe you're looking for doesn't exist or may have been removed.
            </p>
            <Button asChild>
              <Link href="/recipes">Browse All Recipes</Link>
            </Button>
          </CardContent>
        </Card>
      </MobileLayout>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalFlourWeight = recipe.ingredients
    .filter(ing => ing.name.toLowerCase().includes('flour'))
    .reduce((total, ing) => total + ing.amount, 0);

  return (
    <MobileLayout title={recipe.name} showBackButton backHref="/recipes">
      <SEO
        title={`${recipe.name} | Sourdough Recipe | Bakehouse Breads`}
        description={recipe.description}
        canonicalUrl={`/recipes/${recipe.slug || recipe.id}`}
        keywords={[
          'sourdough recipe',
          'bread recipe',
          recipe.difficulty.toLowerCase(),
          ...recipe.tags
        ]}
        ogType="recipe"
        recipeData={{
          ingredients: recipe.ingredients.map(ing => `${ing.amount}${ing.unit} ${ing.name}`),
          instructions: recipe.instructions,
          cookTime: recipe.totalTime,
          prepTime: recipe.activeTime,
          difficulty: recipe.difficulty,
          cuisine: 'Artisan Bread'
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Recipes", url: "/recipes" },
          { name: recipe.name, url: `/recipes/${recipe.slug || recipe.id}` }
        ]}
      />
      
      <div className="space-y-6">
        {/* Recipe Header */}
        <Card className="overflow-hidden">
          {recipe.imageUrl && (
            <div className="aspect-video bg-muted">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{recipe.name}</CardTitle>
                <p className="text-muted-foreground text-sm mb-3">
                  {recipe.description}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty || 'Unknown'}
              </Badge>
              {recipe.hydration && (
                <Badge variant="outline">
                  <Droplets className="h-3 w-3 mr-1" />
                  {recipe.hydration}% Hydration
                </Badge>
              )}
              {recipe.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Recipe Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <p className="text-xs text-muted-foreground">Total Time</p>
              <p className="font-semibold">{recipe.totalTime}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Timer className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <p className="text-xs text-muted-foreground">Active Time</p>
              <p className="font-semibold">{recipe.activeTime}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-orange-600" />
              <p className="text-xs text-muted-foreground">Yields</p>
              <p className="font-semibold">{recipe.yields}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Scale className="h-5 w-5 mx-auto mb-2 text-purple-600" />
              <p className="text-xs text-muted-foreground">Total Flour</p>
              <p className="font-semibold">{totalFlourWeight}g</p>
            </CardContent>
          </Card>
        </div>

        {/* Recipe Content Tabs */}
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="notes">Notes & Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ingredients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wheat className="h-5 w-5" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{ingredient.name}</p>
                      {ingredient.notes && (
                        <p className="text-xs text-muted-foreground">{ingredient.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {ingredient.amount}{ingredient.unit}
                      </p>
                      {ingredient.bakersPercentage && (
                        <p className="text-xs text-muted-foreground">
                          {ingredient.bakersPercentage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{instruction}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Baker's Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.notes && recipe.notes.length > 0 ? (
                  recipe.notes.map((note, index) => (
                    <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm">{note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No additional notes for this recipe.</p>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Recipe Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiAnalysisMutation.data ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Difficulty Explanation</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiAnalysisMutation.data.difficultyExplanation}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Techniques</h4>
                      <div className="flex flex-wrap gap-1">
                        {aiAnalysisMutation.data.keyTechniques?.map((technique: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {technique}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Pro Tips</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {aiAnalysisMutation.data.tips?.map((tip: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Sparkles className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Get personalized insights and tips for this recipe using AI analysis.
                    </p>
                    <Button 
                      onClick={handleAIAnalysis}
                      disabled={aiAnalysisMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {aiAnalysisMutation.isPending ? (
                        <>
                          <Brain className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate AI Insights
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Save Recipe
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}