import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Droplet,
  Calculator,
  RotateCcw,
  Copy,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';


// Common bread types with typical hydration ranges
const BREAD_TYPES = [
  { name: 'Bagel', minHydration: 50, maxHydration: 57, typical: 54 },
  { name: 'Baguette', minHydration: 65, maxHydration: 75, typical: 70 },
  { name: 'Ciabatta', minHydration: 73, maxHydration: 85, typical: 80 },
  { name: 'Country Loaf', minHydration: 65, maxHydration: 78, typical: 72 },
  { name: 'Focaccia', minHydration: 70, maxHydration: 85, typical: 78 },
  { name: 'Pizza Dough', minHydration: 55, maxHydration: 70, typical: 65 },
  { name: 'Sourdough', minHydration: 65, maxHydration: 85, typical: 75 },
  { name: 'Whole Wheat', minHydration: 68, maxHydration: 88, typical: 78 }
];

// Ingredient types
const INGREDIENT_TYPES = [
  { value: 'flour', label: 'Flour' },
  { value: 'water', label: 'Water' },
  { value: 'salt', label: 'Salt' },
  { value: 'starter', label: 'Starter/Levain' },
  { value: 'fat', label: 'Fat/Oil' },
  { value: 'sugar', label: 'Sugar' },
  { value: 'egg', label: 'Egg' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'other', label: 'Other' }
];

// Hydration factors for different ingredients
const HYDRATION_FACTORS = {
  water: 1.0,
  egg: 0.75, // Eggs are about 75% water
  dairy: 0.87, // Milk is about 87% water
  fat: 0   // Fats don't contribute to hydration
};

interface Ingredient {
  id: number;
  name: string;
  type: string;
  weight: number;
  percentage: number;
  includeInHydration?: boolean;
  hydrationFactor?: number;
}

interface Recipe {
  name: string;
  ingredients: Ingredient[];
  totalWeight: number;
  flourWeight: number;
  hydration: number;
}

// Default recipe
const DEFAULT_RECIPE: Recipe = {
  name: 'Basic Bread Recipe',
  ingredients: [
    { id: 1, name: 'Bread Flour', type: 'flour', weight: 500, percentage: 100 },
    { id: 2, name: 'Water', type: 'water', weight: 350, percentage: 70, includeInHydration: true, hydrationFactor: 1 },
    { id: 3, name: 'Salt', type: 'salt', weight: 10, percentage: 2 },
    { id: 4, name: 'Instant Yeast', type: 'other', weight: 5, percentage: 1 }
  ],
  totalWeight: 865,
  flourWeight: 500,
  hydration: 70
};

export default function SimpleHydrationConverter() {
  const [recipe, setRecipe] = useState<Recipe>(DEFAULT_RECIPE);
  const [originalRecipe, setOriginalRecipe] = useState<Recipe>(DEFAULT_RECIPE);
  const [targetHydration, setTargetHydration] = useState<number>(75);
  const [nextId, setNextId] = useState<number>(5);
  const [conversionResults, setConversionResults] = useState<any>({});
  const [conversionComplete, setConversionComplete] = useState(false);
  const [shouldMaintainTotalWeight, setShouldMaintainTotalWeight] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Calculate percentages and hydration when recipe changes
  useEffect(() => {
    calculateRecipeData();
  }, [recipe.ingredients]);

  // Calculate recipe data
  const calculateRecipeData = () => {
    let flourWeight = 0;
    let totalWeight = 0;
    let liquidWeight = 0;

    // Calculate weights
    recipe.ingredients.forEach(ingredient => {
      totalWeight += ingredient.weight;
      
      if (ingredient.type === 'flour') {
        flourWeight += ingredient.weight;
      }
      
      if (ingredient.includeInHydration && ingredient.hydrationFactor) {
        liquidWeight += ingredient.weight * ingredient.hydrationFactor;
      }
      
      // Handle starter (50% flour, 50% water)
      if (ingredient.type === 'starter') {
        flourWeight += ingredient.weight * 0.5;
        liquidWeight += ingredient.weight * 0.5;
      }
    });

    // Calculate hydration
    const hydration = flourWeight > 0 ? Math.round((liquidWeight / flourWeight) * 100) : 0;

    // Calculate percentages
    const updatedIngredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      percentage: flourWeight > 0 ? Math.round((ingredient.weight / flourWeight) * 1000) / 10 : 0
    }));

    setRecipe({
      ...recipe,
      ingredients: updatedIngredients,
      flourWeight,
      totalWeight,
      hydration
    });
  };

  // Add new ingredient
  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: nextId,
      name: '',
      type: 'other',
      weight: 0,
      percentage: 0
    };
    
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, newIngredient]
    });
    
    setNextId(nextId + 1);
  };

  // Remove ingredient
  const removeIngredient = (id: number) => {
    if (recipe.ingredients.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "Recipe must have at least one ingredient",
        variant: "destructive"
      });
      return;
    }
    
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.filter(i => i.id !== id)
    });
  };

  // Handle ingredient changes
  const handleIngredientChange = (id: number, field: string, value: any) => {
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.map(ingredient => {
        if (ingredient.id === id) {
          let updatedIngredient = { ...ingredient, [field]: value };
          
          // Set hydration properties based on type
          if (field === 'type') {
            const includeInHydration = value === 'water' || value === 'egg' || value === 'dairy';
            const hydrationFactor = value === 'water' ? 1 : 
                                  value === 'egg' ? 0.75 :
                                  value === 'dairy' ? 0.87 : 0;
            
            updatedIngredient = {
              ...updatedIngredient,
              includeInHydration,
              hydrationFactor
            };
          }
          
          return updatedIngredient;
        }
        return ingredient;
      })
    });
  };

  // Convert to target hydration
  const convertHydration = () => {
    if (recipe.flourWeight === 0) {
      toast({
        title: "Cannot Convert",
        description: "Recipe must contain flour",
        variant: "destructive"
      });
      return;
    }

    const waterIngredients = recipe.ingredients.filter(i => 
      i.includeInHydration && i.hydrationFactor
    );

    if (waterIngredients.length === 0) {
      toast({
        title: "Cannot Convert",
        description: "Recipe must contain water or other liquid ingredients",
        variant: "destructive"
      });
      return;
    }

    // Calculate current liquid weight
    const currentLiquidWeight = waterIngredients.reduce(
      (sum, i) => sum + (i.weight * (i.hydrationFactor || 1)), 0
    );

    // Calculate new liquid weight needed
    const newLiquidWeight = (targetHydration / 100) * recipe.flourWeight;
    const liquidDifference = newLiquidWeight - currentLiquidWeight;

    // Get main water ingredient
    const mainWaterIngredient = [...waterIngredients].sort((a, b) => b.weight - a.weight)[0];

    let convertedRecipe: Recipe;

    if (shouldMaintainTotalWeight) {
      // Adjust flour and water to maintain total weight
      const newFlourWeight = Math.round(recipe.totalWeight / (1 + (targetHydration / 100)));
      const flourScalingFactor = newFlourWeight / recipe.flourWeight;

      const scaledIngredients = recipe.ingredients.map(ingredient => {
        if (ingredient.id === mainWaterIngredient.id) {
          return {
            ...ingredient,
            weight: Math.round((targetHydration / 100) * newFlourWeight)
          };
        } else if (ingredient.type === 'flour') {
          return {
            ...ingredient,
            weight: Math.round(ingredient.weight * flourScalingFactor)
          };
        } else {
          return {
            ...ingredient,
            weight: Math.round(ingredient.weight * flourScalingFactor)
          };
        }
      });

      convertedRecipe = {
        ...recipe,
        ingredients: scaledIngredients
      };
    } else {
      // Keep flour weight, adjust water
      const newWaterWeight = Math.round(mainWaterIngredient.weight + liquidDifference);
      
      const adjustedIngredients = recipe.ingredients.map(ingredient => 
        ingredient.id === mainWaterIngredient.id 
          ? { ...ingredient, weight: Math.max(0, newWaterWeight) }
          : ingredient
      );

      convertedRecipe = {
        ...recipe,
        ingredients: adjustedIngredients
      };
    }

    setRecipe(convertedRecipe);

    // Store conversion results
    setConversionResults({
      originalHydration: recipe.hydration,
      targetHydration,
      originalFlourWeight: recipe.flourWeight,
      newFlourWeight: convertedRecipe.flourWeight,
      liquidChange: liquidDifference,
      maintainedTotalWeight: shouldMaintainTotalWeight
    });

    setConversionComplete(true);

    toast({
      title: "Hydration Converted",
      description: `Recipe converted to ${targetHydration}% hydration`
    });
  };

  // Load preset bread type
  const loadBreadType = (breadType: typeof BREAD_TYPES[0]) => {
    setTargetHydration(breadType.typical);
    
    toast({
      title: "Preset Loaded",
      description: `Target hydration set to ${breadType.typical}% for ${breadType.name}`
    });
  };

  // Reset to original recipe
  const resetRecipe = () => {
    setRecipe({ ...originalRecipe });
    setConversionComplete(false);
    setConversionResults({});
    
    toast({
      title: "Recipe Reset",
      description: "Recipe restored to original values"
    });
  };

  // Save current as original
  const saveAsOriginal = () => {
    setOriginalRecipe({ ...recipe });
    
    toast({
      title: "Recipe Saved",
      description: "Current recipe saved as original"
    });
  };

  // Copy results to clipboard
  const copyResults = () => {
    const resultText = `Hydration Conversion Results\n\n` +
      `Recipe: ${recipe.name}\n` +
      `Target Hydration: ${targetHydration}%\n` +
      `Final Hydration: ${recipe.hydration}%\n\n` +
      `Ingredients:\n` +
      recipe.ingredients.map(ingredient => 
        `${ingredient.name}: ${ingredient.weight}g (${ingredient.percentage}%)`
      ).join('\n') +
      `\n\nTotal Weight: ${recipe.totalWeight}g\n` +
      `Flour Weight: ${recipe.flourWeight}g`;
    
    navigator.clipboard.writeText(resultText);
    
    toast({
      title: "Results Copied",
      description: "Conversion results copied to clipboard"
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Hydration Converter
          </CardTitle>
          <CardDescription>
            Convert between hydration levels and analyze bread recipes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recipe" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recipe">Recipe</TabsTrigger>
              <TabsTrigger value="convert">Convert</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recipe" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipe-name">Recipe Name</Label>
                  <Input
                    id="recipe-name"
                    value={recipe.name}
                    onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                    placeholder="Enter recipe name"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Ingredients</h3>
                    <Button onClick={addIngredient} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {/* Mobile-friendly table layout */}
                    <div className="sm:hidden text-xs text-muted-foreground text-center mb-2">
                      ← Scroll horizontally to view all columns →
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 min-w-[120px]">Ingredient</th>
                            <th className="text-left p-2 min-w-[80px]">Type</th>
                            <th className="text-right p-2 min-w-[80px]">Weight (g)</th>
                            <th className="text-right p-2 min-w-[80px]">Percentage</th>
                            <th className="text-center p-2 min-w-[80px]">Liquid?</th>
                            <th className="text-center p-2 min-w-[50px]"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipe.ingredients.map((ingredient) => (
                            <tr key={ingredient.id} className="border-b">
                              <td className="p-2">
                                <Input
                                  placeholder="Ingredient name"
                                  value={ingredient.name}
                                  onChange={(e) => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                                  className="min-w-0"
                                />
                              </td>
                              <td className="p-2">
                                <Select 
                                  value={ingredient.type} 
                                  onValueChange={(value) => handleIngredientChange(ingredient.id, 'type', value)}
                                >
                                  <SelectTrigger className="min-w-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {INGREDIENT_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  placeholder="Weight"
                                  value={ingredient.weight}
                                  onChange={(e) => handleIngredientChange(ingredient.id, 'weight', parseInt(e.target.value, 10) || 0)}
                                  className="min-w-0 text-right"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <div className="text-sm text-muted-foreground font-mono">
                                  {ingredient.percentage}%
                                </div>
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={ingredient.includeInHydration || false}
                                  onChange={(e) => handleIngredientChange(ingredient.id, 'includeInHydration', e.target.checked)}
                                  className="w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeIngredient(ingredient.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-3 p-3 bg-muted/50 rounded-md">
                      <p><strong>Liquid checkbox:</strong> Check this box for ingredients that contribute water to the dough (water, milk, eggs, etc.). This determines which ingredients are included in the hydration calculation.</p>
                      <p className="mt-1"><strong>Examples:</strong> Water ✓, Milk ✓, Eggs ✓, Oil ✗, Flour ✗, Salt ✗</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Weight:</span> {recipe.totalWeight}g
                    </div>
                    <div>
                      <span className="font-medium">Flour Weight:</span> {recipe.flourWeight}g
                    </div>
                    <div>
                      <span className="font-medium">Current Hydration:</span> {recipe.hydration}%
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveAsOriginal} variant="outline">
                    Save as Original
                  </Button>
                  <Button onClick={resetRecipe} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="convert" className="space-y-6">
              {/* Target Hydration */}
              <div className="p-4 rounded-md border space-y-4">
                <h3 className="text-lg font-medium">Target Hydration</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current: {recipe.hydration}% → Target: {targetHydration}%</Label>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Droplet className="h-5 w-5 text-primary" />
                    <Slider
                      min={50}
                      max={100}
                      step={1}
                      value={[targetHydration]}
                      onValueChange={(values) => setTargetHydration(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="50"
                      max="100"
                      value={targetHydration}
                      onChange={(e) => setTargetHydration(parseInt(e.target.value, 10) || 75)}
                      className="w-20"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="maintain-weight"
                      checked={shouldMaintainTotalWeight}
                      onChange={(e) => setShouldMaintainTotalWeight(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <Label htmlFor="maintain-weight">Maintain total weight</Label>
                  </div>
                  
                  <Button onClick={convertHydration} className="w-full">
                    <Droplet className="mr-2 h-4 w-4" />
                    Convert to {targetHydration}%
                  </Button>
                </div>
              </div>

              {/* Bread Type Presets */}
              <div className="p-4 rounded-md border space-y-4">
                <h3 className="text-lg font-medium">Bread Type Presets</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {BREAD_TYPES.map((breadType) => (
                    <Button
                      key={breadType.name}
                      variant="outline"
                      size="sm"
                      onClick={() => loadBreadType(breadType)}
                      className="text-left flex-col h-auto p-3"
                    >
                      <div className="font-medium">{breadType.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {breadType.typical}% ({breadType.minHydration}-{breadType.maxHydration}%)
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              {conversionComplete && Object.keys(conversionResults).length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Conversion Results</h3>
                    <Button onClick={copyResults} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Results
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md bg-muted p-4">
                      <h4 className="font-medium mb-2">Original Recipe</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Hydration:</span>
                          <span className="font-mono">{conversionResults.originalHydration}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flour Weight:</span>
                          <span className="font-mono">{conversionResults.originalFlourWeight}g</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-primary/10 p-4">
                      <h4 className="font-medium mb-2">Converted Recipe</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Hydration:</span>
                          <span className="font-mono">{recipe.hydration}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flour Weight:</span>
                          <span className="font-mono">{recipe.flourWeight}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-md text-sm">
                    <h4 className="font-medium mb-2">Changes Applied</h4>
                    <ul className="space-y-1">
                      <li>• {conversionResults.maintainedTotalWeight 
                          ? `Adjusted flour and water to maintain total weight` 
                          : `Kept flour weight constant`
                        }</li>
                      <li>• {conversionResults.liquidChange > 0 
                          ? `Added ${Math.round(Math.abs(conversionResults.liquidChange))}g of liquid` 
                          : `Removed ${Math.round(Math.abs(conversionResults.liquidChange))}g of liquid`
                        }</li>
                      <li>• Hydration changed from {conversionResults.originalHydration}% to {recipe.hydration}%</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Final Recipe</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Ingredient</th>
                            <th className="text-right p-2">Weight</th>
                            <th className="text-right p-2">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipe.ingredients.map((ingredient) => (
                            <tr key={ingredient.id} className="border-b">
                              <td className="p-2">{ingredient.name}</td>
                              <td className="text-right p-2 font-mono">{ingredient.weight}g</td>
                              <td className="text-right p-2 font-mono">{ingredient.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversion results yet. Use the convert tab to change hydration levels.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}