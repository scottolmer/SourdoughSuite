import { useState } from "react";
import { MobileLayout, MobileBottomSheet, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Loader2, Save, Share2, Wand2, ChevronDown, CheckCircle2, Scissors
} from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PreferenceOption {
  id: string;
  label: string;
  description?: string;
}

export function RecipeGeneratorPage() {
  const [_, navigate] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [breadStylesOpen, setBreadStylesOpen] = useState(false);
  const [additionsOpen, setAdditionsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    hydration: 75,
    sourness: 5,
    wholeGrain: false,
    glutenFree: false
  });
  
  // Selected bread style
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  
  // Selected additional ingredients
  const [selectedAdditions, setSelectedAdditions] = useState<string[]>([]);
  
  // Selected flour types
  const [selectedFlours, setSelectedFlours] = useState<string[]>([]);
  
  // Selected flavor profiles
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  // Mock flour options
  const flourOptions: PreferenceOption[] = [
    { id: "bread-flour", label: "Bread Flour" },
    { id: "whole-wheat", label: "Whole Wheat Flour" },
    { id: "rye", label: "Rye Flour" },
    { id: "spelt", label: "Spelt Flour" },
    { id: "einkorn", label: "Einkorn Flour" },
    { id: "semolina", label: "Semolina Flour" }
  ];

  // Mock flavor profile options
  const flavorOptions: PreferenceOption[] = [
    { id: "mild", label: "Mild" },
    { id: "tangy", label: "Tangy" },
    { id: "nutty", label: "Nutty" },
    { id: "sweet", label: "Sweet" },
    { id: "robust", label: "Robust" }
  ];
  
  // Bread style options
  const breadStyleOptions: PreferenceOption[] = [
    { id: "traditional", label: "Traditional Sourdough", description: "Classic artisan sourdough with open crumb" },
    { id: "sandwich", label: "Sandwich Bread", description: "Softer crumb ideal for sandwiches" },
    { id: "enriched", label: "Enriched Bread", description: "With eggs, butter, and/or milk" },
    { id: "focaccia", label: "Focaccia", description: "Italian flatbread with olive oil" },
    { id: "ciabatta", label: "Ciabatta", description: "Light, airy Italian bread" },
    { id: "baguette", label: "Baguette", description: "Long, thin French-style bread" },
    { id: "boule", label: "Round Boule", description: "Traditional round loaf" },
    { id: "rustic", label: "Rustic Country", description: "Hearty with mixed grains" }
  ];
  
  // Additional ingredients by category
  const additionalIngredients = {
    nuts: [
      { id: "walnut", label: "Walnuts" },
      { id: "pecan", label: "Pecans" },
      { id: "almond", label: "Almonds" },
      { id: "hazelnut", label: "Hazelnuts" },
      { id: "pine", label: "Pine Nuts" },
      { id: "pistachio", label: "Pistachios" },
      { id: "cashew", label: "Cashews" },
      { id: "macadamia", label: "Macadamia Nuts" }
    ],
    seeds: [
      { id: "sesame", label: "Sesame Seeds" },
      { id: "flax", label: "Flax Seeds" },
      { id: "sunflower", label: "Sunflower Seeds" },
      { id: "pumpkin", label: "Pumpkin Seeds" },
      { id: "chia", label: "Chia Seeds" },
      { id: "poppy", label: "Poppy Seeds" },
      { id: "hemp", label: "Hemp Hearts" },
      { id: "nigella", label: "Nigella Seeds" }
    ],
    fruits: [
      { id: "raisin", label: "Raisins" },
      { id: "cranberry", label: "Dried Cranberries" },
      { id: "apricot", label: "Dried Apricots" },
      { id: "cherry", label: "Dried Cherries" },
      { id: "fig", label: "Dried Figs" },
      { id: "date", label: "Chopped Dates" },
      { id: "currant", label: "Currants" },
      { id: "blueberry", label: "Dried Blueberries" }
    ],
    cheese: [
      { id: "cheddar", label: "Cheddar" },
      { id: "parmesan", label: "Parmesan" },
      { id: "bleu", label: "Blue Cheese" },
      { id: "gouda", label: "Gouda" },
      { id: "gruyere", label: "Gruyère" },
      { id: "feta", label: "Feta" },
      { id: "manchego", label: "Manchego" },
      { id: "ricotta", label: "Ricotta" }
    ],
    vegetables: [
      { id: "olive", label: "Olives" },
      { id: "onion", label: "Caramelized Onions" },
      { id: "garlic", label: "Roasted Garlic" },
      { id: "herbs", label: "Fresh Herbs" },
      { id: "tomato", label: "Sun-Dried Tomatoes" },
      { id: "pepper", label: "Roasted Red Peppers" },
      { id: "jalapeno", label: "Jalapeños" },
      { id: "scallion", label: "Green Onions" }
    ],
    sweet: [
      { id: "chocolate", label: "Chocolate Chunks" },
      { id: "cinnamon", label: "Cinnamon Sugar" },
      { id: "honey", label: "Honey" },
      { id: "cardamom", label: "Cardamom" },
      { id: "vanilla", label: "Vanilla Extract" },
      { id: "orange", label: "Orange Zest" },
      { id: "maple", label: "Maple Syrup" },
      { id: "cocoa", label: "Cocoa Powder" }
    ]
  };

  // Function to handle recipe generation
  const handleGenerateRecipe = () => {
    setIsGenerating(true);
    
    // Gather all recipe parameters to send to the API including flour types and flavor profiles
    const recipeParameters = {
      preferences: {
        ...preferences,
        breadStyle: selectedStyle || "traditional", // Default to traditional style if none selected
        additionalIngredients: selectedAdditions,
        selectedFlours: selectedFlours,
        selectedFlavors: selectedFlavors,
      }
    };
    
    console.log("Sending recipe parameters to API:", recipeParameters);
    
    // Make an actual API call to our AI service endpoint
    fetch("/api/ai/generate-recipe", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recipeParameters)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to generate recipe");
      }
      return response.json();
    })
    .then(data => {
      setIsGenerating(false);
      console.log("API response data:", data);
      
      // Try to find the ID in the response in various possible formats
      let recipeId = null;
      if (data && data.id) {
        // Direct ID in the response
        recipeId = data.id;
      } else if (data && data._id) {
        // MongoDB style ID
        recipeId = data._id;
      } else if (data && data.recipe && data.recipe.id) {
        // Nested recipe object
        recipeId = data.recipe.id;
      }
      
      if (recipeId) {
        // Navigate to the specific recipe - use AI recipe detail route for better compatibility
        navigate(`/ai/recipes/${recipeId}`);
        console.log("Navigating to AI recipe detail page with ID:", recipeId);
      } else {
        // If we can't find an ID, check if we can extract it from logs
        console.warn("Could not find recipe ID in response, navigating to recent recipes");
        // Fallback to recipes list
        navigate("/recipes");
      }
    })
    .catch(error => {
      console.error("Error generating recipe:", error);
      setIsGenerating(false);
      // Still navigate to recipes list to avoid leaving user stuck
      navigate("/recipes");
    });
  };

  // Create breadcrumbs for this page
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' },
    { name: 'Recipe Generator', url: '/tools/recipe-generator' }
  ];

  return (
    <MobileLayout 
      title="Recipe Generator" 
      showBackButton 
      backHref="/tools"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <section className="text-center">
          <h1 className="text-2xl font-bold mb-3">Create Your Perfect Sourdough</h1>
          <p className="text-muted-foreground mb-6">
            Our AI will generate a personalized sourdough recipe based on your preferences
          </p>
        </section>

        <MobileCard>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-medium">Hydration</h2>
              <span className="text-sm text-muted-foreground">{preferences.hydration}%</span>
            </div>
            <Slider
              value={[preferences.hydration]}
              onValueChange={(value) => setPreferences({...preferences, hydration: value[0]})}
              min={65}
              max={85}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Drier (65%)</span>
              <span>Wetter (85%)</span>
            </div>
          </div>
        </MobileCard>

        <MobileCard>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-medium">Sourness</h2>
              <span className="text-sm text-muted-foreground">{preferences.sourness}/10</span>
            </div>
            <Slider
              value={[preferences.sourness]}
              onValueChange={(value) => setPreferences({...preferences, sourness: value[0]})}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mild</span>
              <span>Very Sour</span>
            </div>
          </div>
        </MobileCard>

        <div className="flex flex-col gap-4">
          {/* Bread Style Selection Card */}
          <MobileCard
            onClick={() => setBreadStylesOpen(true)}
            className="cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium">Bread Style</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedStyle ? 
                    breadStyleOptions.find(style => style.id === selectedStyle)?.label : 
                    "Select a bread style"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </MobileCard>
          
          {/* Additional Ingredients Card */}
          <MobileCard
            onClick={() => setAdditionsOpen(true)}
            className="cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium">Additional Ingredients</h2>
                {selectedAdditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAdditions.slice(0, 3).map(id => (
                      <Badge key={id} variant="outline" className="text-xs">
                        {Object.values(additionalIngredients).flat().find(item => item.id === id)?.label}
                      </Badge>
                    ))}
                    {selectedAdditions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedAdditions.length - 3} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nuts, fruits, cheese, etc.</p>
                )}
              </div>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </div>
          </MobileCard>
          
          {/* More Preferences Card */}
          <MobileCard
            onClick={() => setPreferencesOpen(true)}
            className="cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium">More Preferences</h2>
                {(selectedFlours.length > 0 || selectedFlavors.length > 0) ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFlours.slice(0, 2).map(id => (
                      <Badge key={id} variant="outline" className="text-xs">
                        {flourOptions.find(item => item.id === id)?.label}
                      </Badge>
                    ))}
                    {selectedFlours.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedFlours.length - 2} more flours
                      </Badge>
                    )}
                    {selectedFlavors.slice(0, 2).map(id => (
                      <Badge key={id} variant="outline" className="text-xs">
                        {flavorOptions.find(item => item.id === id)?.label}
                      </Badge>
                    ))}
                    {selectedFlavors.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedFlavors.length - 2} more flavors
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Flour types, flavor profile, etc.</p>
                )}
              </div>
              <Button variant="outline" size="icon">
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
          </MobileCard>
        </div>

        <div className="pt-8">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleGenerateRecipe}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Recipe...
              </>
            ) : (
              "Generate My Recipe"
            )}
          </Button>
        </div>
      </div>

      {/* Bread Style Selection Bottom Sheet */}
      <MobileBottomSheet 
        open={breadStylesOpen} 
        onOpenChange={setBreadStylesOpen}
        title="Select Bread Style"
        description="Choose the type of bread you want to create"
      >
        <div className="space-y-3">
          {breadStyleOptions.map(style => (
            <div 
              key={style.id}
              className={`rounded-lg border p-3 ${selectedStyle === style.id ? 'border-primary bg-primary/5' : 'border-border'} cursor-pointer`}
              onClick={() => {
                setSelectedStyle(style.id);
                setTimeout(() => setBreadStylesOpen(false), 300);
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{style.label}</h3>
                  {style.description && (
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  )}
                </div>
                {selectedStyle === style.id && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
      </MobileBottomSheet>
      
      {/* Additional Ingredients Bottom Sheet */}
      <MobileBottomSheet 
        open={additionsOpen} 
        onOpenChange={setAdditionsOpen}
        title="Additional Ingredients"
        description="Select ingredients to add to your bread (optional)"
      >
        <div className="space-y-6">
          <Tabs defaultValue="nuts">
            <TabsList className="grid grid-cols-3 mb-4 w-full">
              <TabsTrigger value="nuts">Nuts</TabsTrigger>
              <TabsTrigger value="fruits">Fruits</TabsTrigger>
              <TabsTrigger value="cheese">Cheese</TabsTrigger>
            </TabsList>
            
            <TabsList className="grid grid-cols-3 mb-6 w-full">
              <TabsTrigger value="seeds">Seeds</TabsTrigger>
              <TabsTrigger value="vegetables">Vegetables</TabsTrigger>
              <TabsTrigger value="sweet">Sweet</TabsTrigger>
            </TabsList>
            
            {Object.entries(additionalIngredients).map(([category, items]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-2 gap-2">
                  {items.map(item => {
                    const isSelected = selectedAdditions.includes(item.id);
                    return (
                      <Button 
                        key={item.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`justify-start h-auto py-2 px-3 ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAdditions(selectedAdditions.filter(id => id !== item.id));
                          } else {
                            setSelectedAdditions([...selectedAdditions, item.id]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && <CheckCircle2 className="h-4 w-4" />}
                          <span>{item.label}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          {selectedAdditions.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Selected Ingredients</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedAdditions([])}
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAdditions.map(id => {
                  const item = Object.values(additionalIngredients).flat().find(item => item.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {item?.label}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setSelectedAdditions(selectedAdditions.filter(i => i !== id))}
                      >
                        ✕
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full mt-4" 
            onClick={() => setAdditionsOpen(false)}
          >
            Done
          </Button>
        </div>
      </MobileBottomSheet>
      
      {/* More Preferences Bottom Sheet */}
      <MobileBottomSheet 
        open={preferencesOpen} 
        onOpenChange={setPreferencesOpen}
        title="Advanced Preferences"
        description="Fine-tune your recipe settings"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Flour Selection</h3>
            <div className="grid grid-cols-2 gap-2">
              {flourOptions.map(option => {
                const isSelected = selectedFlours.includes(option.id);
                return (
                  <Button 
                    key={option.id}
                    variant={isSelected ? "default" : "outline"} 
                    className={`justify-start h-auto py-2 px-3 ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFlours(selectedFlours.filter(id => id !== option.id));
                      } else {
                        setSelectedFlours([...selectedFlours, option.id]);
                      }
                    }}
                  >
                    <div className="text-left flex items-center gap-2">
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Flavor Profile</h3>
            <div className="grid grid-cols-2 gap-2">
              {flavorOptions.map(option => {
                const isSelected = selectedFlavors.includes(option.id);
                return (
                  <Button 
                    key={option.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-start ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFlavors(selectedFlavors.filter(id => id !== option.id));
                      } else {
                        setSelectedFlavors([...selectedFlavors, option.id]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      {option.label}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Special Requirements</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="whole-grain">100% Whole Grain</Label>
                <p className="text-xs text-muted-foreground">Use only whole grain flours</p>
              </div>
              <Switch 
                id="whole-grain"
                checked={preferences.wholeGrain}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, wholeGrain: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="gluten-free">Gluten-Free</Label>
                <p className="text-xs text-muted-foreground">Use only gluten-free ingredients</p>
              </div>
              <Switch 
                id="gluten-free"
                checked={preferences.glutenFree}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, glutenFree: checked})
                }
              />
            </div>
          </div>
        </div>
      </MobileBottomSheet>
    </MobileLayout>
  );
}