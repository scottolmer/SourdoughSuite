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
  Scale,
  Calculator,
  Copy,
  Plus,
  Trash2,
  RotateCcw
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

// Common bread pan sizes
const PAN_SIZES = [
  { name: 'Standard Loaf (8.5" x 4.5")', volume: 1800 },  // volume in cm³
  { name: 'Large Loaf (9" x 5")', volume: 2200 },
  { name: 'Pullman (13" x 4")', volume: 3000 },
  { name: 'Round Banneton (8")', volume: 1700 },
  { name: 'Round Banneton (10")', volume: 2600 },
  { name: 'Boule (large)', volume: 1900 },
];

interface Ingredient {
  id: number;
  name: string;
  weight: number;
  percentage: number;
}

interface Recipe {
  name: string;
  ingredients: Ingredient[];
  totalWeight: number;
  flourWeight: number;
}

// Default recipe
const DEFAULT_RECIPE: Recipe = {
  name: 'Basic Bread Recipe',
  ingredients: [
    { id: 1, name: 'Bread Flour', weight: 500, percentage: 100 },
    { id: 2, name: 'Water', weight: 350, percentage: 70 },
    { id: 3, name: 'Salt', weight: 10, percentage: 2 },
    { id: 4, name: 'Instant Yeast', weight: 5, percentage: 1 }
  ],
  totalWeight: 865,
  flourWeight: 500
};

export default function ScalingCalculator() {
  const [recipe, setRecipe] = useState<Recipe>(DEFAULT_RECIPE);
  const [originalRecipe, setOriginalRecipe] = useState<Recipe>(DEFAULT_RECIPE);
  const [nextId, setNextId] = useState<number>(5);
  const [scalingResults, setScalingResults] = useState<any>({});
  const [scalingComplete, setScalingComplete] = useState(false);
  
  // Weight scaling
  const [targetWeight, setTargetWeight] = useState<number>(1000);
  
  // Pan scaling
  const [panSize, setPanSize] = useState<string>('');
  const [panCount, setPanCount] = useState<number | string>(1);
  
  const { toast } = useToast();

  // Calculate percentages when recipe changes
  useEffect(() => {
    calculatePercentages();
  }, [recipe.ingredients]);

  // Calculate baker's percentages
  const calculatePercentages = () => {
    let flourWeight = 0;
    let totalWeight = 0;

    // Calculate flour weight and total weight
    recipe.ingredients.forEach(ingredient => {
      totalWeight += ingredient.weight;
      if (ingredient.name.toLowerCase().includes('flour')) {
        flourWeight += ingredient.weight;
      }
    });

    // Calculate percentages
    const updatedIngredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      percentage: flourWeight > 0 ? Math.round((ingredient.weight / flourWeight) * 1000) / 10 : 0
    }));

    setRecipe({
      ...recipe,
      ingredients: updatedIngredients,
      flourWeight,
      totalWeight
    });
  };

  // Add new ingredient
  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: nextId,
      name: '',
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
  const handleIngredientChange = (id: number, field: string, value: string | number) => {
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.map(ingredient => 
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    });
  };

  // Scale recipe by weight
  const scaleByWeight = () => {
    if (recipe.totalWeight === 0) {
      toast({
        title: "Cannot Scale",
        description: "Recipe must have ingredients with weights",
        variant: "destructive"
      });
      return;
    }

    const scalingFactor = targetWeight / recipe.totalWeight;
    const scaledIngredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      weight: Math.round(ingredient.weight * scalingFactor)
    }));

    const originalIngredients = [...recipe.ingredients];
    
    setRecipe({
      ...recipe,
      ingredients: scaledIngredients
    });

    setScalingResults({
      scalingMethod: 'weight',
      scalingFactor,
      originalWeight: recipe.totalWeight,
      targetWeight,
      originalIngredients,
      scaledIngredients
    });

    setScalingComplete(true);
    
    toast({
      title: "Recipe Scaled",
      description: `Recipe scaled to ${targetWeight}g total weight`
    });
  };

  // Scale recipe by pan size
  const scaleByPan = () => {
    if (!panSize) {
      toast({
        title: "Select Pan Size",
        description: "Please select a pan size first",
        variant: "destructive"
      });
      return;
    }

    const selectedPan = PAN_SIZES.find(p => p.name === panSize);
    if (!selectedPan) return;

    const actualPanCount = typeof panCount === 'string' ? parseInt(panCount, 10) || 1 : panCount;
    const requiredVolume = selectedPan.volume * actualPanCount * 0.8; // 80% fill
    const estimatedWeight = Math.round(requiredVolume / 0.85); // density factor

    const scalingFactor = estimatedWeight / recipe.totalWeight;
    const scaledIngredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      weight: Math.round(ingredient.weight * scalingFactor)
    }));

    const originalIngredients = [...recipe.ingredients];
    
    setRecipe({
      ...recipe,
      ingredients: scaledIngredients
    });

    setScalingResults({
      scalingMethod: 'pan',
      scalingFactor,
      originalWeight: recipe.totalWeight,
      targetWeight: estimatedWeight,
      originalIngredients,
      scaledIngredients,
      panSize,
      panCount: actualPanCount,
      panVolume: selectedPan.volume
    });

    setScalingComplete(true);
    
    toast({
      title: "Recipe Scaled for Pans",
      description: `Recipe scaled for ${actualPanCount} ${panSize} pan(s)`
    });
  };

  // Reset to original recipe
  const resetRecipe = () => {
    setRecipe({ ...originalRecipe });
    setScalingComplete(false);
    setScalingResults({});
    
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
    const resultText = `Scaled Recipe: ${recipe.name}\n\n` +
      recipe.ingredients.map(ingredient => 
        `${ingredient.name}: ${ingredient.weight}g (${ingredient.percentage}%)`
      ).join('\n') +
      `\n\nTotal Weight: ${recipe.totalWeight}g\n` +
      `Scaling Factor: ${scalingResults.scalingFactor?.toFixed(2)}x`;
    
    navigator.clipboard.writeText(resultText);
    
    toast({
      title: "Results Copied",
      description: "Scaling results copied to clipboard"
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Recipe Scaling Calculator
          </CardTitle>
          <CardDescription>
            Scale bread recipes by weight or pan size while maintaining proper ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recipe" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recipe">Recipe</TabsTrigger>
              <TabsTrigger value="scaling">Scaling</TabsTrigger>
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
                    {recipe.ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <Input
                            placeholder="Ingredient name"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            placeholder="Weight (g)"
                            value={ingredient.weight}
                            onChange={(e) => handleIngredientChange(ingredient.id, 'weight', parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="text-sm text-muted-foreground text-center">
                            {ingredient.percentage}%
                          </div>
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(ingredient.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Weight:</span> {recipe.totalWeight}g
                    </div>
                    <div>
                      <span className="font-medium">Flour Weight:</span> {recipe.flourWeight}g
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
            
            <TabsContent value="scaling" className="space-y-6">
              {/* Weight Scaling */}
              <div className="p-4 rounded-md border space-y-4">
                <h3 className="text-lg font-medium">Scale by Weight</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-weight">Target Total Weight</Label>
                    <div className="text-sm text-muted-foreground">
                      Currently: {recipe.totalWeight}g
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Scale className="h-5 w-5 text-primary" />
                    <Slider
                      min={100}
                      max={3000}
                      step={25}
                      value={[targetWeight]}
                      onValueChange={(values) => setTargetWeight(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="100"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(parseInt(e.target.value, 10) || 1000)}
                      className="w-20"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setTargetWeight(500)} variant="outline" size="sm">
                      500g
                    </Button>
                    <Button onClick={() => setTargetWeight(1000)} variant="outline" size="sm">
                      1000g
                    </Button>
                    <Button onClick={() => setTargetWeight(1500)} variant="outline" size="sm">
                      1500g
                    </Button>
                    <Button onClick={() => setTargetWeight(recipe.totalWeight * 2)} variant="outline" size="sm">
                      Double
                    </Button>
                    <Button onClick={() => setTargetWeight(Math.round(recipe.totalWeight / 2))} variant="outline" size="sm">
                      Half
                    </Button>
                  </div>
                  
                  <Button onClick={scaleByWeight} className="w-full">
                    <Scale className="mr-2 h-4 w-4" />
                    Scale to {targetWeight}g
                  </Button>
                </div>
              </div>

              {/* Pan Scaling */}
              <div className="p-4 rounded-md border space-y-4">
                <h3 className="text-lg font-medium">Scale by Pan Size</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pan-size">Pan Size</Label>
                    <Select value={panSize} onValueChange={setPanSize}>
                      <SelectTrigger id="pan-size">
                        <SelectValue placeholder="Select pan size" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAN_SIZES.map((pan) => (
                          <SelectItem key={pan.name} value={pan.name}>
                            {pan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="pan-count">Number of Pans</Label>
                    <Input
                      id="pan-count"
                      type="number"
                      min="1"
                      max="10"
                      value={panCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setPanCount('');
                        } else {
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue) && numValue >= 1) {
                            setPanCount(numValue);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          setPanCount(1);
                        }
                      }}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={scaleByPan} 
                  disabled={!panSize} 
                  className="w-full"
                >
                  <Scale className="mr-2 h-4 w-4" />
                  Scale for Selected Pan(s)
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              {scalingComplete && Object.keys(scalingResults).length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Scaling Results</h3>
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
                          <span>Total Weight:</span>
                          <span className="font-mono">{scalingResults.originalWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Scaling Factor:</span>
                          <span className="font-mono">1.00x</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-primary/10 p-4">
                      <h4 className="font-medium mb-2">Scaled Recipe</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Weight:</span>
                          <span className="font-mono">{scalingResults.targetWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Scaling Factor:</span>
                          <span className="font-mono">{scalingResults.scalingFactor.toFixed(2)}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-md text-sm">
                    <h4 className="font-medium mb-2">Scaling Details</h4>
                    <ul className="space-y-1">
                      {scalingResults.scalingMethod === 'weight' ? (
                        <>
                          <li>• Scaled all ingredients by {scalingResults.scalingFactor.toFixed(2)}x</li>
                          <li>• Weight changed from {scalingResults.originalWeight}g to {scalingResults.targetWeight}g</li>
                          <li>• All ratios maintained</li>
                        </>
                      ) : (
                        <>
                          <li>• Scaled for {scalingResults.panCount} {scalingResults.panSize} pan(s)</li>
                          <li>• Pan volume: {scalingResults.panVolume}cm³ each</li>
                          <li>• Scaling factor: {scalingResults.scalingFactor.toFixed(2)}x</li>
                          <li>• Dough weight: {scalingResults.targetWeight}g (80% pan fill)</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Scaled Ingredients</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Ingredient</th>
                            <th className="text-right p-2">Original</th>
                            <th className="text-right p-2">Scaled</th>
                            <th className="text-right p-2">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipe.ingredients.map((ingredient) => {
                            const original = scalingResults.originalIngredients.find(
                              (orig: Ingredient) => orig.id === ingredient.id
                            );
                            return (
                              <tr key={ingredient.id} className="border-b">
                                <td className="p-2">{ingredient.name}</td>
                                <td className="text-right p-2 font-mono">{original?.weight}g</td>
                                <td className="text-right p-2 font-mono">{ingredient.weight}g</td>
                                <td className="text-right p-2 font-mono">{ingredient.percentage}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scaling results yet. Use the scaling tab to scale your recipe.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}