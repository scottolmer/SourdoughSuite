import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Search, Filter, Star, Clock, ChefHat, Brain, Sparkles, TrendingUp, Bot, BookOpen, Heart, Calendar, Share2 } from "lucide-react";
import { SEO } from '@/components/SEO';

interface AIRecipe {
  id: number;
  sessionId: string;
  name: string;
  description: string;
  content: string;
  ingredients: string[];
  instructions: string[];
  difficulty: string;
  totalTime: string;
  activeTime: string;
  yields: string;
  isAIGenerated: boolean;
  isSaved: boolean;
  isPublic: boolean;
  slug: string;
  tags: string[];
  createdAt: string;
}

export default function MyAIRecipesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('my-recipes');

  // Get user's session recipes
  const sessionId = localStorage.getItem('sessionId') || `session_${Date.now()}`;
  
  const { data: myRecipes = [], isLoading: myRecipesLoading } = useQuery<AIRecipe[]>({
    queryKey: ['/api/ai/recipes/session', sessionId],
    enabled: activeTab === 'my-recipes'
  });

  const { data: publicRecipesData, isLoading: publicRecipesLoading } = useQuery<{recipes: AIRecipe[], pagination: any}>({
    queryKey: ['/api/recipes/public', { search: searchTerm, difficulty: difficultyFilter }],
    enabled: activeTab === 'discover'
  });

  const { data: savedRecipes = [], isLoading: savedRecipesLoading } = useQuery<AIRecipe[]>({
    queryKey: ['/api/ai/recipes/saved', sessionId],
    enabled: activeTab === 'saved'
  });

  const publicRecipes = publicRecipesData?.recipes || [];

  const filteredMyRecipes = myRecipes.filter((recipe: AIRecipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (difficultyFilter === 'all' || recipe.difficulty === difficultyFilter)
  );

  const RecipeCard = ({ recipe }: { recipe: AIRecipe }) => (
    <Card className="hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
              {recipe.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Brain className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
              {recipe.difficulty && (
                <Badge variant="outline" className="text-xs">
                  {recipe.difficulty}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 ml-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            {recipe.totalTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{recipe.totalTime}</span>
              </div>
            )}
            {recipe.yields && (
              <div className="flex items-center gap-1">
                <ChefHat className="h-3 w-3" />
                <span>{recipe.yields}</span>
              </div>
            )}
          </div>
          <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button asChild className="flex-1" size="sm">
            <Link href={`/ai/recipes/${recipe.id}`}>
              <BookOpen className="w-4 h-4 mr-2" />
              View Recipe
            </Link>
          </Button>
          {recipe.slug && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/recipes/public/${recipe.slug}`}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "My AI Recipes", href: "/ai/my-recipes" }
  ];

  return (
    <>
      <SEO 
        title="My AI Recipes | Bakehouse Breads"
        description="View and manage your AI-generated baking recipes. Access your personalized recipe collection created by our intelligent baking assistant."
        canonicalUrl="/ai/my-recipes"
      />
      <MobileLayout
        title="My AI Recipes"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          {/* Header */}
          <section className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                AI Recipe Collection
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">My AI Recipes</h1>
            <p className="text-muted-foreground text-center">
              Access your personalized collection of AI-generated recipes
            </p>
            <div className="mt-4 flex justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/ai/recipe-generator">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate New Recipe
                </Link>
              </Button>
            </div>
          </section>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-recipes">My Recipes</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>

            <TabsContent value="my-recipes" className="mt-6">
              {myRecipesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading your recipes...</p>
                </div>
              ) : filteredMyRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start creating personalized recipes with our AI assistant
                  </p>
                  <Button asChild>
                    <Link href="/ai/recipe-generator">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Your First Recipe
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredMyRecipes.map((recipe: AIRecipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              {savedRecipesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading saved recipes...</p>
                </div>
              ) : savedRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved recipes</h3>
                  <p className="text-muted-foreground mb-6">
                    Save your favorite AI-generated recipes for easy access
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {savedRecipes.map((recipe: AIRecipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="discover" className="mt-6">
              {publicRecipesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Discovering recipes...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {publicRecipes?.map((recipe: AIRecipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  )) || []}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </MobileLayout>
    </>
  );
}