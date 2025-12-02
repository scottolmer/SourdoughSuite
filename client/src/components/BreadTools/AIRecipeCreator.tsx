import React, { useState } from "react";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBreadProfile } from "@/hooks/use-bread-profile";
import { useToast } from "@/hooks/use-toast";
import TextureStructureDesigner from "@/components/recommendation/TextureStructureDesigner";
import FlavorProfileDesigner from "@/components/recommendation/FlavorProfileDesigner";
import { BreadRecipe } from "@shared/schema";
import { Loader2, AlertTriangle, Sparkles, Wand2, Filter, Cookie, Wheat, GanttChart, Info, FileText } from "lucide-react";
import RecipeCard from "@/components/recipe/RecipeCard";

// Extended type for AI-enhanced recipes
interface AIEnhancedRecipe extends BreadRecipe {
  isAIGenerated: boolean;
  matchScore?: number;
}

interface AIRecipeCreatorProps {
  onRecipeGenerated?: (recipe: AIEnhancedRecipe) => void;
}

export default function AIRecipeCreator({ 
  onRecipeGenerated 
}: AIRecipeCreatorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("welcome");
  const { breadProfile, updateTextureProfile, updateFlavorProfile, updateFlavorNote, updateCustomPrompt } = useBreadProfile();
  const [generationStage, setGenerationStage] = useState<"analyzing" | "generating" | "complete" | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<AIEnhancedRecipe | null>(null);
  const [previousRecipes, setPreviousRecipes] = useState<AIEnhancedRecipe[]>([]);
  
  // Additional recipe search options
  const [difficulty, setDifficulty] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [searchOptions, setSearchOptions] = useState({
    type: "all",
    technique: "all",
    ingredients: {
      preferredFlour: "all",
      hasSeeds: false,
      hasDryFruit: false,
      hasNuts: false,
      hasHerbs: false
    },
    dietary: {
      isVegan: false,
      isGlutenFree: false,
      isNutFree: false,
      isDairyFree: false,
      isLowSodium: false
    }
  });

  // Load the Sourdough Suite template automatically
  const loadSourdoughSuiteTemplate = async () => {
    try {
      // Fetch template from public assets
      const response = await fetch('/assets/sourdoughsuite_prompt_template.txt');
      if (!response.ok) {
        console.error(`Failed to fetch template: ${response.status}`);
        return undefined;
      }
      return await response.text();
    } catch (err) {
      console.error("Error loading Sourdough Suite template:", err);
      return undefined;
    }
  };

const handleGenerateRecipe = async () => {
    // Scroll to the top with smooth scrolling
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setGenerationStage("analyzing");
    
    try {
      // Start with the analysis stage
      setTimeout(async () => {
        setGenerationStage("generating");
        
        try {
          // First, try to load the template if no custom prompt is provided
          let promptToUse = breadProfile.customPrompt;
          
          // Check if the prompt is HTML (starts with <!DOCTYPE or <html)
          if (promptToUse && (promptToUse.trim().startsWith('<!DOCTYPE') || promptToUse.trim().startsWith('<html'))) {
            console.log("HTML content detected in custom prompt, ignoring and using default template instead");
            promptToUse = ""; // Set to empty string instead of null
          }
          
          if (!promptToUse || promptToUse.trim() === '') {
            console.log("No custom prompt provided, attempting to auto-load Sourdough Suite template");
            promptToUse = await loadSourdoughSuiteTemplate();
            if (promptToUse) {
              console.log("Successfully auto-loaded Sourdough Suite template");
              // Update the prompt in the UI so user can see it
              updateCustomPrompt(promptToUse);
            }
          }
          
          const customPromptInfo = promptToUse ? 
            `Custom prompt included (${promptToUse.length} chars): ${promptToUse.substring(0, 50)}...` : 
            "No custom prompt provided";
          
          console.log("🔍 Custom prompt check:", customPromptInfo);
          console.log("Generating AI recipe with profile:", JSON.stringify({
            ...breadProfile,
            customPrompt: promptToUse
          }));
          
          // Use direct fetch for recipe generation
          const response = await fetch("/api/generate-recipe", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...breadProfile,
              customPrompt: promptToUse
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Recipe generation failed:", errorText);
            throw new Error(errorText || "Failed to generate recipe");
          }
          
          const data = await response.json();
          console.log("Recipe generation succeeded:", data);
          
          // Mark the recipe as AI-generated and add a perfect match score
          const aiRecipe: AIEnhancedRecipe = {
            ...data,
            isAIGenerated: true,
            matchScore: 100
          };
          
          // Save the current recipe to history if it exists
          if (generatedRecipe) {
            setPreviousRecipes([generatedRecipe, ...previousRecipes].slice(0, 3));
          }
          
          setGeneratedRecipe(aiRecipe);
          setGenerationStage("complete");
          
          // Notify parent component if callback exists
          if (onRecipeGenerated) {
            onRecipeGenerated(aiRecipe);
          }
          
          toast({
            title: "AI Recipe Created",
            description: "Your personalized bread recipe has been generated based on your preferences.",
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
        description: "Unable to generate a recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const goToNextTab = () => {
    // Scroll to the top of the page with smooth scrolling
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (activeTab === "welcome") {
      setActiveTab("texture");
    } else if (activeTab === "texture") {
      setActiveTab("flavor");
    } else if (activeTab === "flavor") {
      handleGenerateRecipe();
      setActiveTab("result");
    }
  };

  const goToPreviousTab = () => {
    // Scroll to the top of the page with smooth scrolling
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (activeTab === "texture") {
      setActiveTab("welcome");
    } else if (activeTab === "flavor") {
      setActiveTab("texture");
    } else if (activeTab === "result") {
      setActiveTab("flavor");
    }
  };

  // Custom tab change handler to ensure scrolling to top on all tab changes
  const handleTabChange = (tab: string) => {
    // Scroll to the top of the page with smooth scrolling
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab(tab);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex flex-wrap gap-2 mb-6 bg-transparent">
          <TabsTrigger value="welcome" className="px-3 py-1.5 text-xs sm:text-sm md:text-base whitespace-nowrap">Welcome</TabsTrigger>
          <TabsTrigger value="texture" className="px-3 py-1.5 text-xs sm:text-sm md:text-base whitespace-nowrap">Texture</TabsTrigger>
          <TabsTrigger value="flavor" className="px-3 py-1.5 text-xs sm:text-sm md:text-base whitespace-nowrap">Flavor</TabsTrigger>
          <TabsTrigger value="ingredients" className="px-3 py-1.5 text-xs sm:text-sm md:text-base whitespace-nowrap">Ingredients</TabsTrigger>
          <TabsTrigger value="dietary" className="px-3 py-1.5 text-xs sm:text-sm md:text-base whitespace-nowrap">Dietary</TabsTrigger> 
          <TabsTrigger value="difficulty" className="px-3 py-1.5 text-xs sm:text-sm md:text-base whitespace-nowrap">Difficulty</TabsTrigger>
          <TabsTrigger value="result" className="px-3 py-1.5 text-xs sm:text-sm md:text-base whitespace-nowrap">Your Recipe</TabsTrigger>
        </TabsList>
        
        <TabsContent value="welcome">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">AI Bread Recipe Creator</CardTitle>
              <CardDescription>
                Design your perfect bread with our AI-powered recipe generator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <Wand2 size={36} className="text-amber-600" />
                </div>
              </div>
              
              <p className="mb-4">
                Our AI Bread Recipe Creator uses advanced AI technology to generate custom sourdough bread
                recipes perfectly tailored to your preferences. Here's how it works:
              </p>
              
              <ol className="list-decimal pl-5 space-y-2 mb-6">
                <li>Define the texture and structure characteristics you want in your bread</li>
                <li>Select your preferred flavor profile and flavor notes</li>
                <li>Our AI will generate a complete recipe designed specifically for your preferences</li>
              </ol>
              
              <div className="bg-amber-50 p-4 rounded-md border border-amber-100 mb-6">
                <div className="flex items-center mb-2">
                  <Sparkles size={16} className="text-amber-600 mr-1.5" />
                  <h3 className="text-amber-800 text-sm font-medium">AI-Powered Recipe Creation</h3>
                </div>
                <p className="text-sm text-amber-900">
                  Unlike traditional recipe finders, our AI creates completely new recipes on demand.
                  Each recipe includes precisely calculated ingredient ratios, detailed instructions,
                  and expert techniques to achieve your desired texture and flavor profile.
                </p>
              </div>
              
              <Button onClick={goToNextTab} className="w-full">Begin: Define Texture & Structure</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="texture">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Define Texture & Structure</CardTitle>
                <CardDescription>
                  Set your preferences for the physical characteristics of your ideal bread
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TextureStructureDesigner 
                  textureProfile={breadProfile.texture}
                  onUpdate={updateTextureProfile}
                />
              </CardContent>
            </Card>
            
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Define Flavor Profile</CardTitle>
                <CardDescription>
                  Set your preferences for the taste characteristics of your ideal bread
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FlavorProfileDesigner 
                  flavorProfile={breadProfile.flavor}
                  onUpdate={updateFlavorProfile}
                  onUpdateFlavor={updateFlavorNote}
                />
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousTab}>
                Back to Texture
              </Button>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleGenerateRecipe}
                  className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                >
                  Generate Recipe Now
                </Button>
                <Button onClick={() => handleTabChange("ingredients")}>
                  Continue to Ingredients
                </Button>
              </div>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Custom Recipe Prompt</CardTitle>
                <CardDescription>
                  Optionally provide a custom prompt template for the AI recipe generator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customPrompt" className="text-base">Custom Template</Label>
                    <Textarea 
                      id="customPrompt"
                      placeholder="Paste your custom recipe generation prompt here. Leave blank to use the default prompt."
                      className="h-[200px] font-mono text-sm"
                      value={breadProfile.customPrompt || ""}
                      onChange={(e) => updateCustomPrompt(e.target.value)}
                    />
                  </div>
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
                    <div className="flex items-center mb-2">
                      <AlertTriangle size={16} className="text-amber-600 mr-1.5" />
                      <h3 className="text-amber-800 text-sm font-medium">How to Use Custom Prompts</h3>
                    </div>
                    <p className="text-sm text-amber-900">
                      You can paste a custom prompt template to provide specific instructions to the AI.
                      A good custom prompt will create a recipe that follows your selected preferences.
                      The preferences you've selected above will still be respected even with a custom prompt.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={async () => {
                        try {
                          // Fetch from public assets folder and use as template
                          const response = await fetch('/assets/sourdoughsuite_prompt_template.txt');
                          if (!response.ok) {
                            throw new Error(`Failed to fetch template: ${response.status}`);
                          }
                          const templateText = await response.text();
                          updateCustomPrompt(templateText);
                          toast({
                            title: "Sourdough Suite Template Loaded",
                            description: "The Sourdough Suite recipe template has been loaded successfully.",
                          });
                        } catch (err) {
                          console.error("Error loading Sourdough Suite template:", err);
                          toast({
                            title: "Error Loading Template",
                            description: "There was a problem loading the Sourdough Suite template. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }}
                      variant="outline"
                      className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Load Bakehouse Template
                    </Button>
                    <Button 
                      onClick={handleGenerateRecipe} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Recipe with Custom Prompt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="ingredients">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">
                  <div className="flex items-center">
                    <Wheat className="mr-2 h-5 w-5 text-amber-600" />
                    Ingredient Preferences
                  </div>
                </CardTitle>
                <CardDescription>
                  Specify your preferred ingredients for the AI-generated recipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Preferred Flour Type</Label>
                    <Select 
                      value={searchOptions.ingredients.preferredFlour} 
                      onValueChange={(value) => setSearchOptions({
                        ...searchOptions,
                        ingredients: {
                          ...searchOptions.ingredients,
                          preferredFlour: value
                        }
                      })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select flour type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Flour Type</SelectItem>
                        <SelectItem value="all-purpose">All Purpose Flour</SelectItem>
                        <SelectItem value="bread">Bread Flour</SelectItem>
                        <SelectItem value="whole-wheat">Whole Wheat Flour</SelectItem>
                        <SelectItem value="rye">Rye Flour</SelectItem>
                        <SelectItem value="spelt">Spelt Flour</SelectItem>
                        <SelectItem value="einkorn">Einkorn Flour</SelectItem>
                        <SelectItem value="kamut">Kamut Flour</SelectItem>
                        <SelectItem value="buckwheat">Buckwheat Flour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Include Special Ingredients</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="seeds" 
                          checked={searchOptions.ingredients.hasSeeds}
                          onCheckedChange={(checked) => 
                            setSearchOptions({
                              ...searchOptions,
                              ingredients: {
                                ...searchOptions.ingredients,
                                hasSeeds: checked === true
                              }
                            })
                          }
                        />
                        <Label htmlFor="seeds">Seeds (sesame, flax, etc.)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="dryFruit" 
                          checked={searchOptions.ingredients.hasDryFruit}
                          onCheckedChange={(checked) => 
                            setSearchOptions({
                              ...searchOptions,
                              ingredients: {
                                ...searchOptions.ingredients,
                                hasDryFruit: checked === true
                              }
                            })
                          }
                        />
                        <Label htmlFor="dryFruit">Dried Fruits</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="nuts" 
                          checked={searchOptions.ingredients.hasNuts}
                          onCheckedChange={(checked) => 
                            setSearchOptions({
                              ...searchOptions,
                              ingredients: {
                                ...searchOptions.ingredients,
                                hasNuts: checked === true
                              }
                            })
                          }
                        />
                        <Label htmlFor="nuts">Nuts (walnuts, pecans, etc.)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="herbs" 
                          checked={searchOptions.ingredients.hasHerbs}
                          onCheckedChange={(checked) => 
                            setSearchOptions({
                              ...searchOptions,
                              ingredients: {
                                ...searchOptions.ingredients,
                                hasHerbs: checked === true
                              }
                            })
                          }
                        />
                        <Label htmlFor="herbs">Herbs & Spices</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("flavor")}>
                Back to Flavor
              </Button>
              <Button onClick={() => handleTabChange("dietary")}>
                Continue to Dietary Preferences
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="dietary">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">
                  <div className="flex items-center">
                    <Cookie className="mr-2 h-5 w-5 text-amber-600" />
                    Dietary Preferences
                  </div>
                </CardTitle>
                <CardDescription>
                  Specify any dietary requirements for your recipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="vegan" 
                        checked={searchOptions.dietary.isVegan}
                        onCheckedChange={(checked) => 
                          setSearchOptions({
                            ...searchOptions,
                            dietary: {
                              ...searchOptions.dietary,
                              isVegan: checked === true
                            }
                          })
                        }
                      />
                      <Label htmlFor="vegan">Vegan</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="glutenFree" 
                        checked={searchOptions.dietary.isGlutenFree}
                        onCheckedChange={(checked) => 
                          setSearchOptions({
                            ...searchOptions,
                            dietary: {
                              ...searchOptions.dietary,
                              isGlutenFree: checked === true
                            }
                          })
                        }
                      />
                      <Label htmlFor="glutenFree">Gluten-Free</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="nutFree" 
                        checked={searchOptions.dietary.isNutFree}
                        onCheckedChange={(checked) => 
                          setSearchOptions({
                            ...searchOptions,
                            dietary: {
                              ...searchOptions.dietary,
                              isNutFree: checked === true
                            }
                          })
                        }
                      />
                      <Label htmlFor="nutFree">Nut-Free</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="dairyFree" 
                        checked={searchOptions.dietary.isDairyFree}
                        onCheckedChange={(checked) => 
                          setSearchOptions({
                            ...searchOptions,
                            dietary: {
                              ...searchOptions.dietary,
                              isDairyFree: checked === true
                            }
                          })
                        }
                      />
                      <Label htmlFor="dairyFree">Dairy-Free</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="lowSodium" 
                        checked={searchOptions.dietary.isLowSodium}
                        onCheckedChange={(checked) => 
                          setSearchOptions({
                            ...searchOptions,
                            dietary: {
                              ...searchOptions.dietary,
                              isLowSodium: checked === true
                            }
                          })
                        }
                      />
                      <Label htmlFor="lowSodium">Low Sodium</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("ingredients")}>
                Back to Ingredients
              </Button>
              <Button onClick={() => handleTabChange("difficulty")}>
                Continue to Difficulty
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="difficulty">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">
                  <div className="flex items-center">
                    <GanttChart className="mr-2 h-5 w-5 text-amber-600" />
                    Recipe Difficulty
                  </div>
                </CardTitle>
                <CardDescription>
                  Specify the complexity level for your recipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <RadioGroup
                    value={difficulty}
                    onValueChange={setDifficulty}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="font-medium">Beginner</Label>
                      <span className="ml-2 text-sm text-gray-500">Simple techniques, minimal steps</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="font-medium">Intermediate</Label>
                      <span className="ml-2 text-sm text-gray-500">Standard sourdough techniques</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="font-medium">Advanced</Label>
                      <span className="ml-2 text-sm text-gray-500">Complex methods, multiple stages</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="font-medium">No Preference</Label>
                      <span className="ml-2 text-sm text-gray-500">Let the AI decide based on other preferences</span>
                    </div>
                  </RadioGroup>
                  
                  <div className="pt-4">
                    <Input
                      type="text"
                      placeholder="Additional keywords (optional)"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Add specific keywords (e.g., "crusty", "tangy", "artisan") for more tailored results
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("dietary")}>
                Back to Dietary
              </Button>
              <Button onClick={() => {
                handleGenerateRecipe();
                handleTabChange("result");
              }}>
                Generate My AI Recipe
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="result">
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-serif">Your AI Recipe</CardTitle>
                    <CardDescription>
                      Personalized bread recipe created by AI based on your preferences
                    </CardDescription>
                  </div>
                  <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-full">
                    <Sparkles size={16} className="text-amber-600 mr-1.5" />
                    <span className="text-sm font-medium text-amber-800">AI Generated</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {(generationStage === "analyzing" || generationStage === "generating") && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-4" />
                    <p className="text-gray-600">
                      {generationStage === "analyzing" 
                        ? "Analyzing your texture and flavor preferences..." 
                        : "Crafting your perfect bread recipe..."}
                    </p>
                    <div className="w-full max-w-md mt-4 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-amber-600 h-2.5 rounded-full" 
                        style={{ width: generationStage === "analyzing" ? "30%" : "75%" }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {generationStage === null && !generatedRecipe && (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      No recipe has been generated yet. Adjust your preferences and generate a recipe.
                    </p>
                    <Button onClick={() => handleTabChange("texture")}>
                      Start Creating
                    </Button>
                  </div>
                )}
                
                {generationStage === "complete" && generatedRecipe && (
                  <div>
                    <RecipeCard 
                      recipe={generatedRecipe} 
                      matchPercentage={100} 
                    />

                    {previousRecipes.length > 0 && (
                      <div className="mt-10">
                        <h3 className="text-lg font-medium mb-4">Previously Generated Recipes</h3>
                        <div className="space-y-4">
                          {previousRecipes.map((recipe, index) => (
                            <RecipeCard 
                              key={`previous-${index}`} 
                              recipe={recipe} 
                              matchPercentage={recipe.matchScore || 90} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousTab}>
                Adjust Preferences
              </Button>
              <Button 
                onClick={handleGenerateRecipe} 
                disabled={generationStage === "analyzing" || generationStage === "generating"}
              >
                {generatedRecipe ? "Generate New Recipe" : "Generate Recipe"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}