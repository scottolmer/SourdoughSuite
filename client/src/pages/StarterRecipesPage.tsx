import { useState } from "react";
import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { useStarters } from "@/hooks/use-starters";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock,
  Users,
  ChefHat,
  Star,
  BookOpen,
  Timer,
  Target,
  Wheat,
  Droplets
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";

interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: any[];
  instructions: string[];
  difficulty: string;
  totalTime: string;
  activeTime: string;
  yields: string;
  hydration: number;
  tags: string[];
  notes: string[];
  recipeType: 'classic' | 'specialty';
  isRecommended: boolean;
}

function useStarterRecipes(starterId: number) {
  return useQuery({
    queryKey: ['/api/starters', starterId, 'recipes'],
    queryFn: async () => {
      const response = await fetch(`/api/starters/${starterId}/recipes`);
      if (!response.ok) throw new Error('Failed to fetch recipes');
      return await response.json() as Recipe[];
    },
    enabled: !!starterId,
  });
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <MobileCard className="overflow-hidden">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{recipe.name}</h3>
              <Badge 
                variant={recipe.recipeType === 'classic' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {recipe.recipeType === 'classic' ? 'Classic' : 'Specialty'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recipe.description}
            </p>
          </div>
        </div>

        {/* Recipe Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="font-medium">{recipe.totalTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{recipe.activeTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-green-600" />
            <span className="font-medium">{recipe.yields}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{recipe.difficulty}</span>
          </div>
        </div>

        {/* Hydration & Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Hydration: {recipe.hydration}%</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full" variant="outline">
          <BookOpen className="h-4 w-4 mr-2" />
          View Full Recipe
        </Button>
      </div>
    </MobileCard>
  );
}

function StarterRecipeSection({ starter }: { starter: any }) {
  const { data: recipes, isLoading, error } = useStarterRecipes(starter.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
      </div>
    );
  }

  if (error || !recipes || recipes.length === 0) {
    return (
      <MobileCard className="p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <ChefHat className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">No Recipes Available</h3>
            <p className="text-sm text-muted-foreground">
              Recipes for this starter are coming soon. Check back later!
            </p>
          </div>
        </div>
      </MobileCard>
    );
  }

  const classicRecipes = recipes.filter(r => r.recipeType === 'classic');
  const specialtyRecipes = recipes.filter(r => r.recipeType === 'specialty');

  return (
    <div className="space-y-6">
      {/* Starter Info */}
      <MobileCard className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
            <Wheat className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{starter.name}</h2>
            <p className="text-sm text-muted-foreground">
              {recipes.length} recipes designed for this starter
            </p>
          </div>
          <Badge className="bg-amber-100 text-amber-700">
            {starter.mainFlour}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {starter.description}
        </p>
      </MobileCard>

      {/* Recipe Categories */}
      <Tabs defaultValue="classic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classic" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Classic ({classicRecipes.length})
          </TabsTrigger>
          <TabsTrigger value="specialty" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Specialty ({specialtyRecipes.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="classic" className="space-y-4 mt-6">
          {classicRecipes.length > 0 ? (
            classicRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <MobileCard className="p-6 text-center text-muted-foreground">
              No classic recipes available yet
            </MobileCard>
          )}
        </TabsContent>
        
        <TabsContent value="specialty" className="space-y-4 mt-6">
          {specialtyRecipes.length > 0 ? (
            specialtyRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <MobileCard className="p-6 text-center text-muted-foreground">
              No specialty recipes available yet
            </MobileCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function StarterRecipesPage() {
  const { data: starters, isLoading } = useStarters();
  const [selectedStarter, setSelectedStarter] = useState<number | null>(null);

  const featuredStarters = starters?.filter(s => s.featured) || [];
  const displayStarters = featuredStarters.length > 0 ? featuredStarters : (starters || []);

  if (isLoading) {
    return (
      <MobileLayout title="Starter Recipes" showBackButton>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Starter Recipes" showBackButton>
      <SEO
        title="Sourdough Starter Recipes | Curated Recipe Collection | Bakehouse Breads"
        description="Discover curated recipe collections specifically designed for each sourdough starter type. Classic and specialty recipes optimized for maximum flavor and success."
        keywords={['sourdough recipes', 'starter recipes', 'bread recipes', 'sourdough baking', 'artisan recipes']}
      />
      
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-950 dark:to-purple-900 p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <ChefHat className="h-6 w-6 text-blue-600" />
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Curated Collection
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Starter Recipe Collection
          </h1>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Discover handcrafted recipes specifically designed for each starter type. 
            Each recipe is optimized to showcase your starter's unique characteristics.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-blue-600" />
              <span>Classic recipes</span>
            </div>
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4 text-purple-600" />
              <span>Specialty creations</span>
            </div>
          </div>
        </section>

        {/* Starter Selection */}
        {!selectedStarter && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Choose Your Starter</h2>
            
            <div className="grid gap-4">
              {displayStarters.map((starter) => (
                <MobileCard 
                  key={starter.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedStarter(starter.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                      <Wheat className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{starter.name}</h3>
                        {starter.featured && (
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {starter.description}
                      </p>
                    </div>
                    <div className="text-amber-600">
                      <ChefHat className="h-5 w-5" />
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          </section>
        )}

        {/* Selected Starter Recipes */}
        {selectedStarter && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedStarter(null)}
              >
                ← Back to Starters
              </Button>
            </div>
            
            <StarterRecipeSection 
              starter={displayStarters.find(s => s.id === selectedStarter)} 
            />
          </section>
        )}

        {/* Call to Action */}
        <section className="space-y-4">
          <MobileCard className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ready to Start Baking?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get your premium sourdough starter and begin your baking journey with our curated recipes.
                </p>
                <div className="flex gap-3">
                  <Link href="/starters">
                    <Button variant="outline" size="sm" className="flex-1">
                      Shop Starters
                    </Button>
                  </Link>
                  <Link href="/starter-school">
                    <Button size="sm" className="flex-1">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </MobileCard>
        </section>
      </div>
    </MobileLayout>
  );
}