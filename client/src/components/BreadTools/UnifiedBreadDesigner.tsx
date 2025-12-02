import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadProfile } from "@/hooks/use-bread-profile";
import { useToast } from "@/hooks/use-toast";
import TextureStructureDesigner from "@/components/recommendation/TextureStructureDesigner";
import FlavorProfileDesigner from "@/components/recommendation/FlavorProfileDesigner";
import { BreadRecipe } from "@shared/schema";

// Extended type for AI-enhanced recipes
interface AIEnhancedRecipe extends BreadRecipe {
  isAIGenerated?: boolean;
  matchScore?: number;
}
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertTriangle, FlaskConical, ChefHat, ArrowRight } from "lucide-react";
import RecipeCard from "@/components/recipe/RecipeCard";
import { calculateMatchPercentage } from "@/lib/recipe-utils";

interface BreadArchitectProps {
  onRecommendationsComplete?: (recipes: AIEnhancedRecipe[]) => void;
}

export default function BreadArchitect({ 
  onRecommendationsComplete 
}: BreadArchitectProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("welcome");
  const { breadProfile, updateTextureProfile, updateFlavorProfile, updateFlavorNote } = useBreadProfile();
  const [hasGenerated, setHasGenerated] = useState(false);
  const [designPathSelected, setDesignPathSelected] = useState<"recommend" | "generate" | null>(null);
  const [generationStage, setGenerationStage] = useState<"analyzing" | "generating" | "complete" | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<AIEnhancedRecipe | null>(null);

  // Query for bread recommendations
  const { 
    data: recommendedRecipes,
    isLoading: isLoadingRecommendations, 
    isError: isRecommendationsError,
    refetch: refetchRecommendations,
    isSuccess: isRecommendationsSuccess,
  } = useQuery<AIEnhancedRecipe[]>({
    queryKey: ["/api/recommendations"],
    queryFn: () => apiRequest("POST", "/api/recommendations", breadProfile)
      .then(res => res.json()),
    enabled: false, // Don't fetch on component mount
  });

  // Query for custom recipe generation
  const {
    data: customRecipe,
    isLoading: isGeneratingRecipe,
    isError: isGenerationError,
    refetch: generateRecipe,
    isSuccess: isGenerationSuccess,
  } = useQuery<AIEnhancedRecipe>({
    queryKey: ["/api/generate-recipe"],
    queryFn: () => {
      console.log("Sending recipe generation request with profile:", JSON.stringify(breadProfile));
      return fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(breadProfile),
        credentials: "include"
      })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            console.error("Error response:", text);
            throw new Error(text);
          });
        }
        return res.json();
      });
    },
    enabled: false, // Don't fetch on component mount
  });

  const handleGenerateRecommendations = async () => {
    setHasGenerated(true);
    const result = await refetchRecommendations();
    
    if (result.isSuccess && result.data && onRecommendationsComplete) {
      onRecommendationsComplete(result.data);
      toast({
        title: "Recommendations Generated",
        description: `Found ${result.data.length} bread recipes matching your preferences.`,
      });
    }
  };

  const handleGenerateCustomRecipe = async () => {
    setGenerationStage("analyzing");
    setHasGenerated(true);
    
    try {
      // Start with the analysis stage
      setTimeout(async () => {
        setGenerationStage("generating");
        
        try {
          console.log("Sending direct fetch for recipe generation");
          console.log("Profile data:", JSON.stringify(breadProfile));
          
          // Use direct fetch instead of the query client
          const response = await fetch("/api/generate-recipe", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(breadProfile)
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Recipe generation failed:", errorText);
            throw new Error(errorText || "Failed to generate recipe");
          }
          
          const data = await response.json();
          console.log("Recipe generation succeeded:", data);
          
          // Mark the recipe as AI-generated
          const aiRecipe = {
            ...data,
            isAIGenerated: true
          };
          
          setGeneratedRecipe(aiRecipe);
          setGenerationStage("complete");
          
          toast({
            title: "Custom Recipe Created",
            description: "Your personalized recipe has been generated based on your preferences.",
          });
        } catch (error) {
          console.error("Error generating recipe:", error);
          setGenerationStage(null);
          toast({
            title: "Recipe Generation Failed",
            description: error instanceof Error ? error.message : "Unable to generate a custom recipe. Please try again.",
            variant: "destructive",
          });
        }
      }, 1500);
    } catch (error) {
      console.error("Error in recipe generation flow:", error);
      setGenerationStage(null);
      toast({
        title: "Recipe Generation Failed",
        description: "Unable to generate a custom recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const goToNextTab = () => {
    if (activeTab === "welcome") {
      setActiveTab("texture");
    } else if (activeTab === "texture") {
      setActiveTab("flavor");
    } else if (activeTab === "flavor") {
      setActiveTab("chooseDesignPath");
    } else if (activeTab === "chooseDesignPath") {
      if (designPathSelected === "recommend") {
        handleGenerateRecommendations();
        setActiveTab("recommendationResults");
      } else if (designPathSelected === "generate") {
        handleGenerateCustomRecipe();
        setActiveTab("generationResults");
      }
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "texture") {
      setActiveTab("welcome");
    } else if (activeTab === "flavor") {
      setActiveTab("texture");
    } else if (activeTab === "chooseDesignPath") {
      setActiveTab("flavor");
    } else if (activeTab === "recommendationResults" || activeTab === "generationResults") {
      setActiveTab("chooseDesignPath");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="texture">Texture</TabsTrigger>
          <TabsTrigger value="flavor">Flavor</TabsTrigger>
          <TabsTrigger value="chooseDesignPath" disabled={!hasGenerated && activeTab !== "chooseDesignPath"}>Choose Path</TabsTrigger>
          <TabsTrigger value="recommendationResults" disabled={!hasGenerated || designPathSelected !== "recommend"}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="welcome">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Bread Architect</CardTitle>
              <CardDescription>
                Design your perfect bread by defining texture and flavor preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Our Bread Architect tool lets you define your ideal bread characteristics and then:
              </p>
              <ol className="list-decimal pl-5 space-y-2 mb-6">
                <li>Define the texture and structure of your ideal bread</li>
                <li>Select your preferred flavor profile and notes</li>
                <li>Choose whether to find matching recipes or create a custom recipe</li>
              </ol>
              
              <div className="bg-amber-50 p-4 rounded-md border border-amber-100 mb-6">
                <h3 className="text-amber-800 text-sm font-medium mb-2">How This Tool Works</h3>
                <p className="text-sm text-amber-900">
                  The Bread Architect combines our <strong>Recommendation Engine</strong> with our <strong>Custom Recipe Generator</strong>. 
                  After defining your preferences, you can either find existing recipes that match your profile 
                  or generate a completely new recipe that precisely matches your specifications.
                </p>
              </div>
              
              <Button onClick={goToNextTab} className="w-full">Begin: Define Texture & Structure</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="texture">
          <div className="space-y-6">
            <TextureStructureDesigner 
              textureProfile={breadProfile.texture}
              onUpdate={updateTextureProfile}
            />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousTab}>
                Back to Welcome
              </Button>
              <Button onClick={goToNextTab}>
                Continue to Flavor Profile
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="flavor">
          <div className="space-y-6">
            <FlavorProfileDesigner 
              flavorProfile={breadProfile.flavor}
              onUpdate={updateFlavorProfile}
              onUpdateFlavor={updateFlavorNote}
            />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousTab}>
                Back to Texture
              </Button>
              <Button onClick={goToNextTab}>
                Continue to Choose Path
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chooseDesignPath">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Choose Your Design Path</CardTitle>
              <CardDescription>
                Based on your texture and flavor preferences, choose what you want to do next
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Recommendation Engine Path */}
                <Card 
                  className={`border-2 cursor-pointer hover:border-amber-300 transition-all ${designPathSelected === "recommend" ? "border-amber-500 bg-amber-50" : "border-gray-200"}`}
                  onClick={() => setDesignPathSelected("recommend")}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                        <FlaskConical size={32} className="text-amber-600" />
                      </div>
                    </div>
                    <h3 className="text-xl text-center font-serif mb-2">Find Matching Recipes</h3>
                    <p className="text-sm text-gray-600 mb-4 text-center">
                      Discover existing recipes that best match your flavor and texture preferences
                    </p>
                    <ul className="text-sm space-y-2 mb-4">
                      <li className="flex items-center">
                        <ArrowRight size={16} className="mr-2 text-amber-600" />
                        Get recipes ranked by match percentage
                      </li>
                      <li className="flex items-center">
                        <ArrowRight size={16} className="mr-2 text-amber-600" />
                        See why each recipe matches your preferences
                      </li>
                      <li className="flex items-center">
                        <ArrowRight size={16} className="mr-2 text-amber-600" />
                        Use tried-and-tested community recipes
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Custom Recipe Generator Path */}
                <Card
                  className={`border-2 cursor-pointer hover:border-amber-300 transition-all ${designPathSelected === "generate" ? "border-amber-500 bg-amber-50" : "border-gray-200"}`}
                  onClick={() => setDesignPathSelected("generate")}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                        <ChefHat size={32} className="text-amber-600" />
                      </div>
                    </div>
                    <h3 className="text-xl text-center font-serif mb-2">Create Custom Recipe</h3>
                    <p className="text-sm text-gray-600 mb-4 text-center">
                      Generate a completely new recipe tailored exactly to your specifications
                    </p>
                    <ul className="text-sm space-y-2 mb-4">
                      <li className="flex items-center">
                        <ArrowRight size={16} className="mr-2 text-amber-600" />
                        Precise ingredient ratios for your preferences
                      </li>
                      <li className="flex items-center">
                        <ArrowRight size={16} className="mr-2 text-amber-600" />
                        Customized techniques and instructions
                      </li>
                      <li className="flex items-center">
                        <ArrowRight size={16} className="mr-2 text-amber-600" />
                        Create something truly unique
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab}>
                  Back to Flavor Profile
                </Button>
                <Button 
                  onClick={goToNextTab} 
                  disabled={!designPathSelected}
                >
                  {designPathSelected === "recommend" ? "Find Matching Recipes" : "Generate Custom Recipe"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendationResults">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Recipe Recommendations</CardTitle>
                <CardDescription>
                  Based on your texture and flavor preferences, we've found these bread recipes for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecommendations && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-4" />
                    <p className="text-gray-600">Finding your perfect bread matches...</p>
                  </div>
                )}
                
                {isRecommendationsError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800">Error Finding Recommendations</h3>
                      <p className="text-sm text-red-700">
                        We couldn't generate recommendations based on your preferences. Please try again.
                      </p>
                    </div>
                  </div>
                )}
                
                {isRecommendationsSuccess && recommendedRecipes && (
                  <div>
                    {recommendedRecipes.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-700 mb-2">No matching recipes found.</p>
                        <p className="text-sm text-gray-600 mb-4">Try adjusting your preferences or create a custom recipe instead.</p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setDesignPathSelected("generate");
                            setActiveTab("chooseDesignPath");
                          }}
                        >
                          Try Custom Recipe Generator
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm mb-6">
                          These recipes most closely match your preferred texture and flavor profile.
                          Each recipe is shown with a match percentage indicating how well it aligns with your preferences.
                          {recommendedRecipes.some(recipe => recipe.isAIGenerated) && (
                            <span className="block mt-2 text-amber-700">
                              <span className="font-medium">✨ AI-Generated Recipes</span>: Our AI has crafted custom recipes that perfectly match your preferences when existing recipes weren't an optimal fit.
                            </span>
                          )}
                        </p>
                        <div className="grid grid-cols-1 gap-6">
                          {recommendedRecipes.map((recipe) => (
                            <RecipeCard 
                              key={recipe.id} 
                              recipe={recipe} 
                              matchPercentage={recipe.matchScore || calculateMatchPercentage(recipe, breadProfile)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousTab}>
                Change Path
              </Button>
              <Button onClick={handleGenerateRecommendations}>
                Refresh Recommendations
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="generationResults">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Custom Recipe Generator</CardTitle>
                <CardDescription>
                  Creating a personalized recipe based on your exact specifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(generationStage === "analyzing" || generationStage === "generating") && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-4" />
                    <p className="text-gray-600">
                      {generationStage === "analyzing" 
                        ? "Analyzing your texture and flavor preferences..." 
                        : "Generating your custom recipe..."}
                    </p>
                    <div className="w-full max-w-md mt-4 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-amber-600 h-2.5 rounded-full" 
                        style={{ width: generationStage === "analyzing" ? "30%" : "75%" }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {isGenerationError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800">Recipe Generation Failed</h3>
                      <p className="text-sm text-red-700">
                        We couldn't generate a custom recipe based on your preferences. Please try again.
                      </p>
                    </div>
                  </div>
                )}
                
                {generationStage === "complete" && generatedRecipe && (
                  <div>
                    <div className="bg-amber-50 p-4 rounded-md border border-amber-100 mb-6">
                      <h3 className="text-amber-800 text-sm font-medium mb-2">Recipe Successfully Generated</h3>
                      <p className="text-sm text-amber-900">
                        Your custom recipe has been created based on your texture and flavor preferences.
                        This recipe is tailored to produce bread with your exact specifications.
                      </p>
                    </div>
                    
                    <div className="mt-6">
                      <RecipeCard 
                        recipe={generatedRecipe} 
                        matchPercentage={100} 
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousTab}>
                Change Path
              </Button>
              <Button onClick={handleGenerateCustomRecipe} disabled={generationStage !== "complete" && generationStage !== null}>
                Regenerate Recipe
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}