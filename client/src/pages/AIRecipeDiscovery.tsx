import { useState } from 'react';
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Filter, Star, Clock, ChefHat, Brain, Sparkles, TrendingUp, Bot, Loader2 } from "lucide-react";
import { SEO } from '@/components/SEO';
import { Skeleton } from "@/components/ui/skeleton";

interface Recipe {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  totalTime: string;
  activeTime: string;
  yields: string;
  tags: string[];
  imageUrl?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  ingredients?: any[];
  instructions?: string[];
  notes?: string[];
  hydration?: number;
  starterId?: number;
}

interface AIRecipeDiscoveryProps {
  variant: 'discover' | 'ai-generated' | 'trending';
}

export default function AIRecipeDiscovery({ variant }: AIRecipeDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch real recipes from the database
  const { data: recipes = [], isLoading, error } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getPageConfig = () => {
    switch (variant) {
      case 'discover':
        return {
          title: "Smart Recipe Discovery",
          subtitle: "AI-curated recipes tailored to your preferences and skill level",
          icon: Search,
          badge: "Personalized",
          badgeColor: "bg-purple-100 text-purple-700",
          headerColor: "from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 border-purple-200 dark:border-purple-800"
        };
      case 'ai-generated':
        return {
          title: "AI-Generated Recipes",
          subtitle: "Innovative recipes created by artificial intelligence using advanced baking algorithms",
          icon: Bot,
          badge: "AI Created",
          badgeColor: "bg-emerald-100 text-emerald-700",
          headerColor: "from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 border-emerald-200 dark:border-emerald-800"
        };
      case 'trending':
        return {
          title: "Trending Recipes",
          subtitle: "Popular sourdough recipes from our community bakehouse",
          icon: TrendingUp,
          badge: "Popular",
          badgeColor: "bg-orange-100 text-orange-700",
          headerColor: "from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900 border-orange-200 dark:border-orange-800"
        };
    }
  };

  const config = getPageConfig();

  const filteredRecipes = recipes
    .filter(recipe => {
      if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (difficultyFilter !== 'all' && recipe.difficulty?.toLowerCase() !== difficultyFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          const aDiff = a.difficulty ? difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 4 : 4;
          const bDiff = b.difficulty ? difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 4 : 4;
          return aDiff - bDiff;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getDifficultyColor = (difficulty: string | null | undefined) => {
    if (!difficulty) return 'bg-gray-100 text-gray-700';
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <MobileLayout title={config.title} showBackButton backHref="/recipes">
      <SEO
        title={`${config.title} | Bakehouse Breads`}
        description={config.subtitle}
        canonicalUrl={variant === 'trending' ? '/recipes/trending' : `/recipes/${variant}`}
        keywords={variant === 'trending' 
          ? ['trending recipes', 'popular sourdough recipes', 'bakehouse recipes', 'sourdough bread', 'artisan baking']
          : ['sourdough recipes', 'bread recipes', 'baking recipes', 'artisan bread', 'sourdough starter recipes']
        }
        ogType="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Recipes", url: "/recipes" },
          { name: config.title, url: variant === 'trending' ? '/recipes/trending' : `/recipes/${variant}` }
        ]}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <section className={`rounded-lg bg-gradient-to-br ${config.headerColor} p-6 border`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <config.icon className="h-8 w-8 text-blue-600" />
            <Badge variant="secondary" className={config.badgeColor}>
              {config.badge}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">{config.title}</h1>
          <p className="text-muted-foreground text-center">
            {config.subtitle}
          </p>
        </section>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Smart Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Alphabetical</SelectItem>
                    <SelectItem value="difficulty">By Difficulty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Grid */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading recipes...</span>
            </div>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-10 w-24 ml-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-700 mb-4">Failed to load recipes. Please try again later.</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {filteredRecipes.length} Recipe{filteredRecipes.length !== 1 ? 's' : ''} Found
              </h2>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <ChefHat className="h-3 w-3 mr-1" />
                Bakehouse
              </Badge>
            </div>
            
            {filteredRecipes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No recipes found matching your criteria.</p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setDifficultyFilter('all');
                  }} variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border-l-4 border-l-orange-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{recipe.name}</h3>
                          {variant === 'trending' && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {recipe.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty || 'Unknown'}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {recipe.totalTime}
                      </div>
                      {recipe.yields && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ChefHat className="h-4 w-4" />
                          {recipe.yields}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags?.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        )) || []}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Added: {new Date(recipe.createdAt).toLocaleDateString()}
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/recipes/${recipe.slug || recipe.id}`}>
                            View Recipe
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Recipe Collection Info */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <ChefHat className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold">Bakehouse Collection</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Discover tried-and-tested sourdough recipes from our bakehouse collection. Each recipe has been carefully crafted and tested to ensure consistent, delicious results.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-orange-700">Total Recipes:</span>
                <span className="ml-2">{recipes.length}</span>
              </div>
              <div>
                <span className="font-medium text-orange-700">Skill Levels:</span>
                <span className="ml-2">All Levels</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}