import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadProfile } from "@/hooks/use-bread-profile";
import { useToast } from "@/hooks/use-toast";
import TextureStructureDesigner from "./TextureStructureDesigner";
import FlavorProfileDesigner from "./FlavorProfileDesigner";
import { BreadRecipe } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

interface BreadRecommendationEngineProps {
  onRecommendationsComplete?: (recipes: BreadRecipe[]) => void;
}

export default function BreadRecommendationEngine({ 
  onRecommendationsComplete 
}: BreadRecommendationEngineProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("welcome");
  const { breadProfile, updateTextureProfile, updateFlavorProfile, updateFlavorNote } = useBreadProfile();
  const [hasGenerated, setHasGenerated] = useState(false);
  const [, navigate] = useLocation();

  // Query for bread recommendations
  const { 
    data: recommendedRecipes,
    isLoading, 
    isError,
    refetch,
    isSuccess,
  } = useQuery<BreadRecipe[]>({
    queryKey: ["/api/recommendations"],
    queryFn: () => apiRequest("POST", "/api/recommendations", breadProfile)
      .then(res => res.json()),
    enabled: false, // Don't fetch on component mount
  });

  const handleGenerateRecommendations = async () => {
    setHasGenerated(true);
    const result = await refetch();
    
    if (result.isSuccess && result.data && onRecommendationsComplete) {
      onRecommendationsComplete(result.data);
      toast({
        title: "Recommendations Generated",
        description: `Found ${result.data.length} bread recipes matching your preferences.`,
      });
    }
  };

  const goToNextTab = () => {
    if (activeTab === "welcome") {
      setActiveTab("texture");
    } else if (activeTab === "texture") {
      setActiveTab("flavor");
    } else if (activeTab === "flavor") {
      handleGenerateRecommendations();
      setActiveTab("results");
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "texture") {
      setActiveTab("welcome");
    } else if (activeTab === "flavor") {
      setActiveTab("texture");
    } else if (activeTab === "results") {
      setActiveTab("flavor");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="texture">Texture</TabsTrigger>
          <TabsTrigger value="flavor">Flavor</TabsTrigger>
          <TabsTrigger value="results" disabled={!hasGenerated}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="welcome">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Personalized Sourdough Recommendation Engine</CardTitle>
              <CardDescription>
                Design your perfect bread by defining texture and flavor preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Our recommendation engine will match you with recipes that align with your tastes.
                Follow the steps to define your ideal bread characteristics:
              </p>
              <ol className="list-decimal pl-5 space-y-2 mb-6">
                <li>Define the texture and structure of your ideal bread</li>
                <li>Select your preferred flavor profile and notes</li>
                <li>Get personalized recipe recommendations</li>
              </ol>
              <Button onClick={goToNextTab} className="w-full">Begin: Define Texture & Structure</Button>
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  onClick={() => navigate("/recipes")}
                  className="text-sm text-gray-600 hover:text-amber-700"
                >
                  Skip to all recipes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="texture">
          <TextureStructureDesigner 
            textureProfile={breadProfile.texture} 
            onUpdate={updateTextureProfile} 
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={goToPreviousTab}>
              Back: Welcome
            </Button>
            <Button onClick={goToNextTab}>Next: Flavor Profile</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="flavor">
          <FlavorProfileDesigner 
            flavorProfile={breadProfile.flavor} 
            onUpdate={updateFlavorProfile}
            onUpdateFlavor={updateFlavorNote}
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={goToPreviousTab}>
              Back: Texture & Structure
            </Button>
            <Button onClick={goToNextTab}>
              Generate Recommendations
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="results">
          <div className="mb-6">
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                <span className="ml-2 text-gray-600">Analyzing your preferences...</span>
              </div>
            )}
            
            {isError && (
              <div className="bg-red-50 p-4 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-red-800">Error Loading Recommendations</h4>
                  <p className="text-red-700 text-sm">
                    We couldn't find recipes matching your criteria. Please try again or adjust your preferences.
                  </p>
                </div>
              </div>
            )}
            
            {isSuccess && recommendedRecipes && (
              <div className="space-y-4">
                {recommendedRecipes.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <h4 className="text-lg font-medium text-gray-700 mb-2">No Exact Matches Found</h4>
                        <p className="text-gray-600">
                          We couldn't find recipes that precisely match your criteria. 
                          Try adjusting your preferences slightly or explore our recipe collection.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {recommendedRecipes.map((recipe) => (
                      <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        matchPercentage={calculateMatchPercentage(recipe, breadProfile)}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={goToPreviousTab}>
              Adjust Preferences
            </Button>
            <Button onClick={handleGenerateRecommendations}>
              Refresh Recommendations
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to render tags safely
function renderTags(tags: unknown): JSX.Element | null {
  if (!tags || !Array.isArray(tags)) {
    return null;
  }
  
  return (
    <>
      {(tags as string[]).slice(0, 3).map((tag, i) => (
        <div key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
          {tag}
        </div>
      ))}
    </>
  );
}

interface RecipeCardProps {
  recipe: BreadRecipe;
  matchPercentage: number;
}

function RecipeCard({ recipe, matchPercentage }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {recipe.imageUrl && (
          <div className="md:w-1/4">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name} 
              className="h-full w-full object-cover aspect-square md:aspect-auto"
            />
          </div>
        )}
        <div className={`flex-1 ${recipe.imageUrl ? 'md:w-3/4' : 'w-full'}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{recipe.name}</CardTitle>
                <CardDescription>{recipe.difficulty} Difficulty</CardDescription>
              </div>
              <div className="bg-amber-100 px-3 py-1 rounded-full">
                <span className="font-mono text-sm font-semibold text-amber-800">
                  {matchPercentage}% Match
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.hydration && (
                <div className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {recipe.hydration}% Hydration
                </div>
              )}
              {recipe.totalTime && (
                <div className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {recipe.totalTime} Total
                </div>
              )}
              {renderTags(recipe.tags)}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

// Function to calculate match percentage between recipe and user preferences
function calculateMatchPercentage(recipe: BreadRecipe, userProfile: any): number {
  if (!recipe.textureProfile || !recipe.flavorProfile) {
    return 65; // Default match if no profiles exist
  }
  
  // Random match between 65-95% for demo purposes
  return Math.floor(Math.random() * 30) + 65;
}