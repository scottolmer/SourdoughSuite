import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Brain, ChefHat, Clock, Users, Wheat, 
  Sparkles, TrendingUp, Timer, Scale, 
  Droplets, Cookie, Thermometer, Plus,
  Mountain, Sprout
} from "lucide-react";
import { SEO } from '@/components/SEO';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PersonalizedRecipe {
  name: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    bakersPercentage?: string;
  }>;
  instructions: string[];
  tips: string[];
  difficulty: string;
  totalTime: string;
  activeTime: string;
}

export default function AIPersonalizedRecipeGeneratorPage() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    difficulty: '',
    flavorProfile: [] as string[],
    dietaryRestrictions: [] as string[],
    availableTime: '',
    equipment: [] as string[],
    breadType: '',
    hydrationLevel: '',
    texturePreferences: [] as string[],
    servingSize: [4],
    temperaturePreferences: [] as string[],
    specialIngredients: [] as string[],
    bakingEnvironment: [] as string[],
    starterType: ''
  });

  const flavorOptions = [
    { id: 'tangy', label: 'Tangy & Sour' },
    { id: 'mild', label: 'Mild & Sweet' },
    { id: 'nutty', label: 'Nutty & Earthy' },
    { id: 'fruity', label: 'Fruity & Complex' },
    { id: 'rustic', label: 'Rustic & Traditional' },
    { id: 'herb', label: 'Herb & Savory' }
  ];

  const dietaryOptions = [
    { id: 'none', label: 'No restrictions' },
    { id: 'whole-grain', label: 'Whole grain preferred' },
    { id: 'low-salt', label: 'Low sodium' },
    { id: 'ancient-grains', label: 'Ancient grains' },
    { id: 'gluten-reduced', label: 'Reduced gluten' }
  ];

  const equipmentOptions = [
    { id: 'dutch-oven', label: 'Dutch oven' },
    { id: 'stand-mixer', label: 'Stand mixer' },
    { id: 'proofing-basket', label: 'Proofing basket' },
    { id: 'kitchen-scale', label: 'Kitchen scale' },
    { id: 'bench-scraper', label: 'Bench scraper' },
    { id: 'lame', label: 'Bread lame' }
  ];

  const breadTypeOptions = [
    { id: 'sourdough-loaf', label: 'Classic Sourdough Loaf' },
    { id: 'pizza-dough', label: 'Pizza Dough' },
    { id: 'focaccia', label: 'Focaccia' },
    { id: 'bagels', label: 'Bagels' },
    { id: 'sandwich-bread', label: 'Sandwich Bread' },
    { id: 'artisan-boule', label: 'Artisan Boule' },
    { id: 'baguette', label: 'Baguette' },
    { id: 'rolls', label: 'Dinner Rolls' },
    { id: 'crackers', label: 'Sourdough Crackers' },
    { id: 'pancakes', label: 'Sourdough Pancakes' }
  ];

  const hydrationOptions = [
    { id: 'low', label: 'Low (60-70%) - Dense, easier to handle' },
    { id: 'medium', label: 'Medium (70-80%) - Balanced texture' },
    { id: 'high', label: 'High (80%+) - Open crumb, challenging' }
  ];

  const textureOptions = [
    { id: 'crusty-exterior', label: 'Crusty exterior' },
    { id: 'soft-crust', label: 'Soft crust' },
    { id: 'open-crumb', label: 'Open, airy crumb' },
    { id: 'dense-crumb', label: 'Dense, tight crumb' },
    { id: 'chewy', label: 'Chewy texture' },
    { id: 'tender', label: 'Tender and soft' },
    { id: 'crispy', label: 'Crispy and light' }
  ];

  const temperatureOptions = [
    { id: 'room-temp', label: 'Room temperature rise' },
    { id: 'cold-ferment', label: 'Cold fermentation' },
    { id: 'warm-proof', label: 'Warm proofing environment' },
    { id: 'overnight-counter', label: 'Overnight counter rise' },
    { id: 'fridge-bulk', label: 'Bulk ferment in fridge' }
  ];

  const specialIngredientsOptions = [
    { id: 'seeds', label: 'Seeds (sunflower, sesame, etc.)' },
    { id: 'nuts', label: 'Nuts (walnuts, pecans, etc.)' },
    { id: 'dried-fruits', label: 'Dried fruits' },
    { id: 'fresh-herbs', label: 'Fresh herbs' },
    { id: 'cheese', label: 'Cheese' },
    { id: 'olives', label: 'Olives' },
    { id: 'garlic', label: 'Garlic' },
    { id: 'onions', label: 'Onions' },
    { id: 'honey', label: 'Honey' },
    { id: 'chocolate', label: 'Chocolate chips' }
  ];

  const bakingEnvironmentOptions = [
    { id: 'humid-climate', label: 'Humid climate' },
    { id: 'dry-climate', label: 'Dry climate' },
    { id: 'high-altitude', label: 'High altitude (3000+ ft)' },
    { id: 'sea-level', label: 'Sea level' },
    { id: 'cold-kitchen', label: 'Cold kitchen' },
    { id: 'warm-kitchen', label: 'Warm kitchen' }
  ];

  const starterTypeOptions = [
    { id: 'white', label: 'White flour starter' },
    { id: 'whole-wheat', label: 'Whole wheat starter' },
    { id: 'rye', label: 'Rye starter' },
    { id: 'mixed-grain', label: 'Mixed grain starter' },
    { id: 'discard', label: 'Sourdough discard' },
    { id: 'young-starter', label: 'Young/new starter' },
    { id: 'mature-starter', label: 'Mature starter (6+ months)' }
  ];

  const generateRecipeMutation = useMutation({
    mutationFn: async (userPreferences: typeof preferences) => {
      return apiRequest('/api/ai/generate-recipe', {
        method: 'POST',
        body: JSON.stringify(userPreferences)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Recipe Generated!",
        description: "Your personalized sourdough recipe is ready."
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate recipe. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFlavorChange = (flavorId: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        flavorProfile: [...prev.flavorProfile, flavorId]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        flavorProfile: prev.flavorProfile.filter(id => id !== flavorId)
      }));
    }
  };

  const handleDietaryChange = (dietaryId: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, dietaryId]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        dietaryRestrictions: prev.dietaryRestrictions.filter(id => id !== dietaryId)
      }));
    }
  };

  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        equipment: [...prev.equipment, equipmentId]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        equipment: prev.equipment.filter(id => id !== equipmentId)
      }));
    }
  };

  const handleTextureChange = (textureId: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        texturePreferences: [...prev.texturePreferences, textureId]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        texturePreferences: prev.texturePreferences.filter(id => id !== textureId)
      }));
    }
  };

  const handleTemperatureChange = (tempId: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        temperaturePreferences: [...prev.temperaturePreferences, tempId]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        temperaturePreferences: prev.temperaturePreferences.filter(id => id !== tempId)
      }));
    }
  };

  const handleSpecialIngredientsChange = (ingredientId: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        specialIngredients: [...prev.specialIngredients, ingredientId]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        specialIngredients: prev.specialIngredients.filter(id => id !== ingredientId)
      }));
    }
  };

  const handleBakingEnvironmentChange = (envId: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        bakingEnvironment: [...prev.bakingEnvironment, envId]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        bakingEnvironment: prev.bakingEnvironment.filter(id => id !== envId)
      }));
    }
  };

  const handleSubmit = () => {
    if (!preferences.difficulty || preferences.flavorProfile.length === 0 || !preferences.availableTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in difficulty level, flavor profile, and available time.",
        variant: "destructive"
      });
      return;
    }

    generateRecipeMutation.mutate(preferences);
  };

  const result = generateRecipeMutation.data as PersonalizedRecipe | undefined;

  return (
    <MobileLayout 
      title="AI Recipe Generator" 
      showBackButton 
      backHref="/ai"
    >
      <SEO
        title="AI Personalized Recipe Generator | Bakehouse Breads"
        description="Generate custom sourdough recipes tailored to your preferences using advanced AI technology. Create unique recipes based on your skill level, flavor preferences, and available equipment."
        canonicalUrl="/ai-recipe-generator"
        keywords={[
          'AI recipe generator',
          'personalized sourdough recipes',
          'custom bread recipes',
          'sourdough AI',
          'recipe customization'
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "AI Tools", url: "/ai" },
          { name: "Recipe Generator", url: "/ai-recipe-generator" }
        ]}
      />

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              AI Recipe Creator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tell us your preferences and we'll create a personalized sourdough recipe using ChatGPT's advanced AI capabilities.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              * Required fields
            </p>
          </CardHeader>
        </Card>

        {!result ? (
          <>
            {/* Difficulty Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Your Baking Experience <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={preferences.difficulty} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, difficulty: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Beginner" id="beginner" />
                    <Label htmlFor="beginner">Beginner - New to sourdough baking</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediate - Comfortable with basic techniques</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Advanced" id="advanced" />
                    <Label htmlFor="advanced">Advanced - Experienced with complex recipes</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Flavor Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  Flavor Profile <span className="text-red-500">*</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select flavors you'd like in your bread (choose multiple)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {flavorOptions.map((flavor) => (
                    <div key={flavor.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={flavor.id}
                        checked={preferences.flavorProfile.includes(flavor.id)}
                        onCheckedChange={(checked) => 
                          handleFlavorChange(flavor.id, !!checked)
                        }
                      />
                      <Label htmlFor={flavor.id} className="text-sm cursor-pointer">
                        {flavor.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Available Time <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={preferences.availableTime} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, availableTime: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same-day" id="same-day" />
                    <Label htmlFor="same-day">Same day (6-8 hours)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overnight" id="overnight" />
                    <Label htmlFor="overnight">Overnight (12-18 hours)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multi-day" id="multi-day" />
                    <Label htmlFor="multi-day">Multi-day (24+ hours)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flexible" id="flexible" />
                    <Label htmlFor="flexible">Flexible timeline</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Dietary Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wheat className="h-5 w-5 text-yellow-600" />
                  Dietary Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dietaryOptions.map((dietary) => (
                    <div key={dietary.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={dietary.id}
                        checked={preferences.dietaryRestrictions.includes(dietary.id)}
                        onCheckedChange={(checked) => 
                          handleDietaryChange(dietary.id, !!checked)
                        }
                      />
                      <Label htmlFor={dietary.id} className="text-sm cursor-pointer">
                        {dietary.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-purple-600" />
                  Available Equipment
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select equipment you have available
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {equipmentOptions.map((equipment) => (
                    <div key={equipment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment.id}
                        checked={preferences.equipment.includes(equipment.id)}
                        onCheckedChange={(checked) => 
                          handleEquipmentChange(equipment.id, !!checked)
                        }
                      />
                      <Label htmlFor={equipment.id} className="text-sm cursor-pointer">
                        {equipment.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bread Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-amber-600" />
                  Bread Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={preferences.breadType} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, breadType: value }))}
                >
                  {breadTypeOptions.map((breadType) => (
                    <div key={breadType.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={breadType.id} id={breadType.id} />
                      <Label htmlFor={breadType.id}>{breadType.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Hydration Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  Hydration Level
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred dough hydration
                </p>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={preferences.hydrationLevel} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, hydrationLevel: value }))}
                >
                  {hydrationOptions.map((hydration) => (
                    <div key={hydration.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={hydration.id} id={hydration.id} />
                      <Label htmlFor={hydration.id}>{hydration.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Texture Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-orange-600" />
                  Texture Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select desired textures (choose multiple)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {textureOptions.map((texture) => (
                    <div key={texture.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={texture.id}
                        checked={preferences.texturePreferences.includes(texture.id)}
                        onCheckedChange={(checked) => 
                          handleTextureChange(texture.id, !!checked)
                        }
                      />
                      <Label htmlFor={texture.id} className="text-sm cursor-pointer">
                        {texture.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Serving Size */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Serving Size
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Number of servings: {preferences.servingSize[0]}
                </p>
              </CardHeader>
              <CardContent>
                <Slider
                  value={preferences.servingSize}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, servingSize: value }))}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1 serving</span>
                  <span>20 servings</span>
                </div>
              </CardContent>
            </Card>

            {/* Temperature Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-600" />
                  Temperature Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select fermentation preferences (choose multiple)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {temperatureOptions.map((temp) => (
                    <div key={temp.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={temp.id}
                        checked={preferences.temperaturePreferences.includes(temp.id)}
                        onCheckedChange={(checked) => 
                          handleTemperatureChange(temp.id, !!checked)
                        }
                      />
                      <Label htmlFor={temp.id} className="text-sm cursor-pointer">
                        {temp.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-600" />
                  Special Ingredients
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add extra ingredients (optional)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {specialIngredientsOptions.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={ingredient.id}
                        checked={preferences.specialIngredients.includes(ingredient.id)}
                        onCheckedChange={(checked) => 
                          handleSpecialIngredientsChange(ingredient.id, !!checked)
                        }
                      />
                      <Label htmlFor={ingredient.id} className="text-sm cursor-pointer">
                        {ingredient.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Baking Environment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-teal-600" />
                  Baking Environment
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select your kitchen conditions
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {bakingEnvironmentOptions.map((env) => (
                    <div key={env.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={env.id}
                        checked={preferences.bakingEnvironment.includes(env.id)}
                        onCheckedChange={(checked) => 
                          handleBakingEnvironmentChange(env.id, !!checked)
                        }
                      />
                      <Label htmlFor={env.id} className="text-sm cursor-pointer">
                        {env.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Starter Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-emerald-600" />
                  Starter Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={preferences.starterType} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, starterType: value }))}
                >
                  {starterTypeOptions.map((starter) => (
                    <div key={starter.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={starter.id} id={starter.id} />
                      <Label htmlFor={starter.id}>{starter.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button 
              onClick={handleSubmit}
              disabled={generateRecipeMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {generateRecipeMutation.isPending ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Creating Your Recipe...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate My Recipe
                </>
              )}
            </Button>
          </>
        ) : (
          /* Generated Recipe Display */
          <div className="space-y-4">
            {/* Recipe Header */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{result.name}</CardTitle>
                <p className="text-muted-foreground">{result.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline">{result.difficulty}</Badge>
                  <Badge variant="outline">
                    <Timer className="h-3 w-3 mr-1" />
                    {result.totalTime}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {result.activeTime} active
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wheat className="h-5 w-5" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="font-medium">{ingredient.name}</span>
                      <span className="text-sm">
                        {ingredient.amount}{ingredient.unit}
                        {ingredient.bakersPercentage && (
                          <span className="text-muted-foreground ml-2">
                            ({ingredient.bakersPercentage})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{instruction}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPreferences({
                    difficulty: '',
                    flavorProfile: [],
                    dietaryRestrictions: [],
                    availableTime: '',
                    equipment: []
                  });
                  generateRecipeMutation.reset();
                }}
              >
                Create Another
              </Button>
              <Button variant="outline">
                Save Recipe
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}