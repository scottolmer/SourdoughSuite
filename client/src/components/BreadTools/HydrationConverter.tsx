import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Scale,
  Droplet,
  RotateCcw,
  Calculator,
  Save,
  FilePieChart,
  Undo2,
  ChevronDown,
  ChevronUp,
  Copy
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from '@/components/ui/checkbox';

// Types of ingredients
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

// Default starter composition
const DEFAULT_STARTER_COMPOSITION = {
  flour: 0.5, // 50% flour
  water: 0.5  // 50% water
};

// Standard conversion factors
const HYDRATION_FACTORS = {
  water: 1.0,
  egg: 0.75, // Eggs are about 75% water
  dairy: {
    milk: 0.87,
    buttermilk: 0.9,
    yogurt: 0.85
  },
  fat: 0   // Fats don't contribute to hydration
};

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
  type: string;
  weight: number;
  percentage: number;
  isFlour?: boolean;
  includeInHydration?: boolean;
  hydrationFactor?: number;
}

interface Formula {
  name: string;
  description: string;
  ingredients: Ingredient[];
  totalWeight: number;
  flourWeight: number;
  hydration: number;
  hydrationDisplay?: string;
}

// Default formula for a basic bread
const DEFAULT_FORMULA: Formula = {
  name: 'Basic Bread Formula',
  description: 'A simple bread dough formula',
  ingredients: [
    { id: 1, name: 'Bread Flour', type: 'flour', weight: 500, percentage: 100, isFlour: true },
    { id: 2, name: 'Water', type: 'water', weight: 350, percentage: 70, includeInHydration: true, hydrationFactor: 1 },
    { id: 3, name: 'Salt', type: 'salt', weight: 10, percentage: 2 },
    { id: 4, name: 'Instant Yeast', type: 'other', weight: 5, percentage: 1 }
  ],
  totalWeight: 865,
  flourWeight: 500,
  hydration: 70,
  hydrationDisplay: '70%'
};

export default function HydrationConverter() {
  const { toast } = useToast();
  
  // Main formula state
  const [originalFormula, setOriginalFormula] = useState<Formula>({ ...DEFAULT_FORMULA });
  const [formula, setFormula] = useState<Formula>({ ...DEFAULT_FORMULA });
  
  // Conversion states
  const [targetHydration, setTargetHydration] = useState<number>(75);
  const [targetWeight, setTargetWeight] = useState<number>(1000);
  const [shouldMaintainTotalWeight, setShouldMaintainTotalWeight] = useState<boolean>(true);
  const [conversionComplete, setConversionComplete] = useState<boolean>(false);
  const [scalingComplete, setScalingComplete] = useState<boolean>(false);
  const [nextId, setNextId] = useState<number>(5);  // For new ingredients
  const [calculations, setCalculations] = useState<any>({});
  const [scalingCalculations, setScalingCalculations] = useState<any>({});
  
  // For bakery scaling
  const [panSize, setPanSize] = useState<string>('');
  const [panCount, setPanCount] = useState<number | string>(1);
  
  // For common bread types
  const [isOpenBreadTypes, setIsOpenBreadTypes] = useState(false);
  
  // Calculate baker's percentages and hydration when formula changes
  useEffect(() => {
    calculatePercentages();
  }, [formula.ingredients]);
  
  // Reset the formula to default
  const resetFormula = () => {
    setFormula({ ...DEFAULT_FORMULA });
    setOriginalFormula({ ...DEFAULT_FORMULA });
    setTargetHydration(75);
    setTargetWeight(1000);
    setConversionComplete(false);
    
    toast({
      title: "Formula Reset",
      description: "The formula has been reset to default values"
    });
  };
  
  // Save the current formula as original
  const saveAsOriginal = () => {
    setOriginalFormula({ ...formula });
    
    toast({
      title: "Original Formula Saved",
      description: "The current formula has been saved as the original reference"
    });
  };
  
  // Restore the original formula
  const restoreOriginal = () => {
    setFormula({ ...originalFormula });
    setConversionComplete(false);
    
    toast({
      title: "Original Formula Restored",
      description: "The formula has been restored to the original values"
    });
  };
  
  // Add a new ingredient to the formula
  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: nextId,
      name: '',
      type: 'other',
      weight: 0,
      percentage: 0
    };
    
    setFormula({
      ...formula,
      ingredients: [...formula.ingredients, newIngredient]
    });
    
    setNextId(nextId + 1);
  };
  
  // Remove an ingredient from the formula
  const removeIngredient = (id: number) => {
    // Don't allow removing if there's only one ingredient left or if it's a flour and we'd have no flour left
    const flourIngredients = formula.ingredients.filter(i => i.type === 'flour');
    
    if (
      formula.ingredients.length <= 1 || 
      (flourIngredients.length <= 1 && formula.ingredients.find(i => i.id === id)?.type === 'flour')
    ) {
      toast({
        title: "Cannot Remove Ingredient",
        description: "You need at least one ingredient and one flour in your formula",
        variant: "destructive"
      });
      return;
    }
    
    setFormula({
      ...formula,
      ingredients: formula.ingredients.filter(i => i.id !== id)
    });
  };
  
  // Handle ingredient weight change
  const handleWeightChange = (id: number, weight: number) => {
    if (weight < 0) weight = 0;
    
    setFormula({
      ...formula,
      ingredients: formula.ingredients.map(i => 
        i.id === id ? { ...i, weight } : i
      )
    });
  };
  
  // Handle ingredient type change
  const handleTypeChange = (id: number, type: string) => {
    setFormula({
      ...formula,
      ingredients: formula.ingredients.map(i => {
        if (i.id === id) {
          // If changing to/from flour type, adjust isFlour property
          const isFlour = type === 'flour';
          const includeInHydration = type === 'water' || type === 'egg' || type === 'dairy';
          const hydrationFactor = type === 'water' ? 1 : 
                                 type === 'egg' ? 0.75 :
                                 type === 'dairy' ? 0.87 : 0;
          
          return { 
            ...i, 
            type,
            isFlour,
            includeInHydration,
            hydrationFactor
          };
        }
        return i;
      })
    });
  };
  
  // Handle ingredient name change
  const handleNameChange = (id: number, name: string) => {
    setFormula({
      ...formula,
      ingredients: formula.ingredients.map(i => 
        i.id === id ? { ...i, name } : i
      )
    });
  };
  
  // Handle formula name change
  const handleFormulaNameChange = (name: string) => {
    setFormula({
      ...formula,
      name
    });
  };
  
  // Handle formula description change
  const handleFormulaDescriptionChange = (description: string) => {
    setFormula({
      ...formula,
      description
    });
  };
  
  // Handle hydration factor change for ingredients that contribute to hydration
  const handleHydrationFactorChange = (id: number, hydrationFactor: number) => {
    setFormula({
      ...formula,
      ingredients: formula.ingredients.map(i => 
        i.id === id ? { ...i, hydrationFactor } : i
      )
    });
  };
  
  // Toggle whether an ingredient should be included in hydration calculation
  const toggleIncludeInHydration = (id: number, checked: boolean) => {
    setFormula({
      ...formula,
      ingredients: formula.ingredients.map(i => 
        i.id === id ? { ...i, includeInHydration: checked } : i
      )
    });
  };
  
  // Calculate baker's percentages and hydration for the formula
  const calculatePercentages = () => {
    // Calculate total flour weight
    let flourWeight = 0;
    let totalWeight = 0;
    let liquidWeight = 0;

    // First pass to get flour weight
    formula.ingredients.forEach(i => {
      totalWeight += i.weight;
      
      if (i.type === 'flour' || i.isFlour) {
        flourWeight += i.weight;
      }
      
      // Calculate liquid weight for hydration
      if (i.includeInHydration && i.hydrationFactor) {
        liquidWeight += i.weight * i.hydrationFactor;
      }
      
      // Handle water content in starter
      if (i.type === 'starter') {
        // Add the flour portion to flour weight
        flourWeight += i.weight * DEFAULT_STARTER_COMPOSITION.flour;
        // Add the water portion to liquid weight
        liquidWeight += i.weight * DEFAULT_STARTER_COMPOSITION.water;
      }
    });

    // Calculate hydration
    const hydration = flourWeight > 0 ? Math.round((liquidWeight / flourWeight) * 100) : 0;

    // Second pass to calculate percentages
    const updatedIngredients = formula.ingredients.map(i => ({
      ...i,
      percentage: flourWeight > 0 ? Math.round((i.weight / flourWeight) * 1000) / 10 : 0
    }));

    setFormula({
      ...formula,
      ingredients: updatedIngredients,
      flourWeight,
      totalWeight,
      hydration,
      hydrationDisplay: `${hydration}%`
    });
  };
  
  // Convert formula to a new hydration level
  const convertHydration = () => {
    if (formula.flourWeight === 0) {
      toast({
        title: "Cannot Convert",
        description: "Your formula needs to contain flour",
        variant: "destructive"
      });
      return;
    }
    
    // Find water ingredients
    const waterIngredients = formula.ingredients.filter(i => 
      i.includeInHydration && i.hydrationFactor
    );
    
    if (waterIngredients.length === 0) {
      toast({
        title: "Cannot Convert",
        description: "Your formula needs to contain water or other liquid ingredients",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate current liquid weight
    const currentLiquidWeight = waterIngredients.reduce(
      (sum, i) => sum + (i.weight * (i.hydrationFactor || 1)), 0
    );
    
    // Calculate new liquid weight needed
    const newLiquidWeight = (targetHydration / 100) * formula.flourWeight;
    
    // Calculate the difference in liquid needed
    const liquidDifference = newLiquidWeight - currentLiquidWeight;
    
    // Get main water ingredient (usually the one with the most weight)
    const mainWaterIngredient = [...waterIngredients].sort((a, b) => b.weight - a.weight)[0];
    
    // Create updated formula
    let convertedFormula: Formula;
    
    if (shouldMaintainTotalWeight) {
      // Adjust flour and water to maintain total weight
      // Calculate new flour weight: totalWeight / (1 + (targetHydration / 100))
      const newFlourWeight = Math.round(formula.totalWeight / (1 + (targetHydration / 100)));
      
      // Calculate scaling factors for all ingredients
      const flourScalingFactor = newFlourWeight / formula.flourWeight;
      
      // Create a new set of ingredients with scaled weights
      const scaledIngredients = formula.ingredients.map(i => {
        if (i.id === mainWaterIngredient.id) {
          // For main water ingredient, calculate to achieve target hydration
          const scaledWaterWeight = Math.round((targetHydration / 100) * newFlourWeight);
          return {
            ...i,
            weight: scaledWaterWeight
          };
        } else if (i.type === 'flour' || i.isFlour) {
          // Scale flour ingredients
          return {
            ...i,
            weight: Math.round(i.weight * flourScalingFactor)
          };
        } else {
          // Scale other ingredients proportionally to flour
          return {
            ...i,
            weight: Math.round(i.weight * flourScalingFactor)
          };
        }
      });
      
      convertedFormula = {
        ...formula,
        ingredients: scaledIngredients
      };
    } else {
      // Simply adjust water to achieve target hydration while keeping flour the same
      const updatedIngredients = formula.ingredients.map(i => {
        if (i.id === mainWaterIngredient.id) {
          return {
            ...i,
            weight: Math.max(0, Math.round(i.weight + liquidDifference))
          };
        }
        return i;
      });
      
      convertedFormula = {
        ...formula,
        ingredients: updatedIngredients
      };
    }
    
    // Update state and recalculate
    setFormula(convertedFormula);
    setConversionComplete(true);
    
    // Record calculations for display
    setCalculations({
      originalHydration: formula.hydration,
      targetHydration,
      originalFlourWeight: formula.flourWeight,
      originalWaterWeight: currentLiquidWeight,
      newWaterWeight: newLiquidWeight,
      liquidChange: liquidDifference,
      maintainedTotalWeight: shouldMaintainTotalWeight
    });
    
    toast({
      title: "Hydration Converted",
      description: `Formula converted from ${formula.hydration}% to ${targetHydration}% hydration`
    });
  };
  
  // Scale formula to target weight
  const scaleFormula = () => {
    if (formula.totalWeight === 0) {
      toast({
        title: "Cannot Scale",
        description: "Your formula total weight is zero",
        variant: "destructive"
      });
      return;
    }
    
    // Store original values for comparison
    const originalWeight = formula.totalWeight;
    const originalFlourWeight = formula.flourWeight;
    const originalIngredients = [...formula.ingredients];
    
    // Calculate scaling factor
    const scalingFactor = targetWeight / formula.totalWeight;
    
    // Scale all ingredients
    const scaledIngredients = formula.ingredients.map(i => ({
      ...i,
      weight: Math.round(i.weight * scalingFactor)
    }));
    
    setFormula({
      ...formula,
      ingredients: scaledIngredients
    });
    
    // Store scaling calculations for results display
    setScalingCalculations({
      originalWeight,
      targetWeight,
      scalingFactor,
      originalFlourWeight,
      newFlourWeight: Math.round(originalFlourWeight * scalingFactor),
      originalIngredients,
      scaledIngredients,
      scalingMethod: 'simple'
    });
    
    setScalingComplete(true);
    
    toast({
      title: "Formula Scaled",
      description: `Formula scaled to ${targetWeight}g total weight`
    });
  };
  
  // Scale formula for specific pan size and count
  const scaleForPans = () => {
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
    
    // Calculate required dough volume (pan volume x pan count x 0.8 for proper rise)
    const actualPanCount = typeof panCount === 'string' ? parseInt(panCount, 10) || 1 : panCount;
    const requiredVolume = selectedPan.volume * actualPanCount * 0.8;
    
    // Estimate weight from volume (1g of dough is roughly 0.8-0.9 cm³)
    const estimatedWeight = Math.round(requiredVolume / 0.85);
    
    // Store original values for comparison
    const originalWeight = formula.totalWeight;
    const originalFlourWeight = formula.flourWeight;
    const originalIngredients = [...formula.ingredients];
    
    // Update target weight and perform scaling
    setTargetWeight(estimatedWeight);
    
    // Scale all ingredients
    const scalingFactor = estimatedWeight / formula.totalWeight;
    const scaledIngredients = formula.ingredients.map(i => ({
      ...i,
      weight: Math.round(i.weight * scalingFactor)
    }));
    
    setFormula({
      ...formula,
      ingredients: scaledIngredients
    });
    
    // Store scaling calculations for results display
    setScalingCalculations({
      originalWeight,
      targetWeight: estimatedWeight,
      scalingFactor,
      originalFlourWeight,
      newFlourWeight: Math.round(originalFlourWeight * scalingFactor),
      originalIngredients,
      scaledIngredients,
      scalingMethod: 'pan',
      panSize,
      panCount: actualPanCount,
      panVolume: selectedPan.volume
    });
    
    setScalingComplete(true);
    
    toast({
      title: "Formula Scaled for Pans",
      description: `Formula scaled for ${actualPanCount} ${panSize} pan(s)`
    });
  };
  
  // Load a preset bread type hydration
  const loadBreadType = (breadType: any) => {
    setTargetHydration(breadType.typical);
    
    toast({
      title: "Bread Type Selected",
      description: `Loaded typical hydration for ${breadType.name}: ${breadType.typical}%`
    });
  };
  
  // Export formula to clipboard as text
  const exportFormulaAsText = () => {
    let text = `${formula.name}\n`;
    text += formula.description ? `${formula.description}\n\n` : '\n';
    text += `Total Dough Weight: ${formula.totalWeight}g\n`;
    text += `Hydration: ${formula.hydration}%\n\n`;
    text += 'Ingredients:\n';
    
    formula.ingredients.forEach(ingredient => {
      text += `${ingredient.name}: ${ingredient.weight}g (${ingredient.percentage}%)\n`;
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Formula exported as text and copied to clipboard"
      });
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const element = document.createElement('textarea');
      element.value = text;
      document.body.appendChild(element);
      element.select();
      document.execCommand('copy');
      document.body.removeChild(element);
      
      toast({
        title: "Copied to Clipboard",
        description: "Formula exported as text and copied to clipboard"
      });
    });
  };
  
  // Get hydration range description
  const getHydrationDescription = (hydration: number): string => {
    if (hydration < 60) return 'Low hydration - firm, dense crumb';
    if (hydration < 70) return 'Medium hydration - balanced structure';
    if (hydration < 80) return 'High hydration - open, airy crumb';
    return 'Very high hydration - wet, extensible dough';
  };
  
  // Get a CSS class based on hydration level
  const getHydrationClass = (hydration: number): string => {
    if (hydration < 60) return 'text-blue-500';
    if (hydration < 70) return 'text-green-500';
    if (hydration < 80) return 'text-orange-500';
    return 'text-red-500';
  };
  
  return (
    <div className="space-y-4 w-full max-w-full mx-auto overflow-hidden">
      <Card className="w-full">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <CardTitle>Hydration & Scaling Tool</CardTitle>
          <CardDescription>
            Convert hydration levels and scale formulas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 sm:px-6">
          <Tabs defaultValue="formula">
            <TabsList className="mb-4">
              <TabsTrigger value="formula">Formula</TabsTrigger>
              <TabsTrigger value="convert">Convert</TabsTrigger>
              <TabsTrigger value="scale">Scale</TabsTrigger>
              <TabsTrigger value="guide">Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formula" className="space-y-6">
              {/* Formula Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formula-name">Formula Name</Label>
                  <Input
                    id="formula-name"
                    placeholder="e.g., Basic Sourdough"
                    value={formula.name}
                    onChange={(e) => handleFormulaNameChange(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-end items-end">
                  <Button variant="outline" onClick={resetFormula} size="sm">
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Reset
                  </Button>
                  
                  <Button variant="outline" onClick={saveAsOriginal} size="sm">
                    <Save className="mr-1 h-3 w-3" />
                    Save
                  </Button>
                  
                  <Button variant="outline" onClick={restoreOriginal} disabled={!originalFormula.name} size="sm">
                    <Undo2 className="mr-1 h-3 w-3" />
                    Restore
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="formula-description">Description (Optional)</Label>
                <Input
                  id="formula-description"
                  placeholder="A brief description of your formula"
                  value={formula.description}
                  onChange={(e) => handleFormulaDescriptionChange(e.target.value)}
                />
              </div>
              
              {/* Current Formula Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-muted rounded-md">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Flour</p>
                  <p className="text-2xl font-bold">{formula.flourWeight}g</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Weight</p>
                  <p className="text-2xl font-bold">{formula.totalWeight}g</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Hydration</p>
                  <p className={`text-2xl font-bold ${getHydrationClass(formula.hydration)}`}>
                    {formula.hydration}%
                  </p>
                  <p className="text-xs">{getHydrationDescription(formula.hydration)}</p>
                </div>
              </div>
              
              {/* Ingredients List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Ingredients</h3>
                  <Button onClick={addIngredient} variant="outline" size="sm">
                    Add Ingredient
                  </Button>
                </div>
                
                <div className="mobile-scroll-hint">
                  ← Swipe to see full table →
                </div>
                <div className="rounded-md border overflow-hidden hydration-table-container">
                  <table className="w-full divide-y divide-border hydration-table">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-left text-muted-foreground text-sm font-medium">Ingredient</th>
                        <th className="px-2 py-2 text-left text-muted-foreground text-sm font-medium">Type</th>
                        <th className="px-2 py-2 text-left text-muted-foreground text-sm font-medium">Weight</th>
                        <th className="px-2 py-2 text-left text-muted-foreground text-sm font-medium">%</th>
                        <th className="px-2 py-2 text-left text-muted-foreground text-sm font-medium">Hydration</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {formula.ingredients.map((ingredient) => (
                        <tr key={ingredient.id}>
                          <td className="px-2 py-1">
                            <Input
                              type="text"
                              placeholder="Name"
                              value={ingredient.name}
                              onChange={(e) => handleNameChange(ingredient.id, e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <Select
                              value={ingredient.type}
                              onValueChange={(value) => handleTypeChange(ingredient.id, value)}
                            >
                              <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="Type" />
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
                          <td className="px-2 py-1">
                            <Input
                              type="number"
                              min="0"
                              value={ingredient.weight}
                              onChange={(e) => handleWeightChange(ingredient.id, parseInt(e.target.value, 10) || 0)}
                              className="w-[70px]"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <div className="font-mono w-[40px]">
                              {ingredient.percentage}%
                              {ingredient.type === 'flour' && (
                                <span className="ml-1 text-xs text-primary">•</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-1">
                            {(ingredient.type === 'water' || ingredient.type === 'egg' || ingredient.type === 'dairy') && (
                              <div className="flex items-center space-x-1">
                                <Checkbox
                                  id={`hydration-${ingredient.id}`}
                                  checked={ingredient.includeInHydration || false}
                                  onCheckedChange={(checked) => 
                                    toggleIncludeInHydration(ingredient.id, !!checked)
                                  }
                                />
                                <Input
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={ingredient.hydrationFactor || 0}
                                  onChange={(e) => 
                                    handleHydrationFactorChange(
                                      ingredient.id, 
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-[60px]"
                                  disabled={!ingredient.includeInHydration}
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-1 py-1">
                            <Button
                              onClick={() => removeIngredient(ingredient.id)}
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="convert" className="space-y-6">
              {/* Hydration Conversion Controls */}
              <div className="space-y-6 p-4 bg-muted rounded-md">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label htmlFor="target-hydration">Target Hydration</Label>
                    <span className={`font-mono ${getHydrationClass(targetHydration)}`}>
                      {targetHydration}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Droplet className="h-5 w-5 text-primary" />
                    <Slider
                      id="target-hydration"
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
                  <p className="text-sm text-muted-foreground">
                    {getHydrationDescription(targetHydration)}
                  </p>
                  
                  <Collapsible className="mt-4">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center cursor-pointer text-sm font-medium text-primary">
                        {isOpenBreadTypes ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        <span>Common Bread Types</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {BREAD_TYPES.map((breadType) => (
                          <button
                            key={breadType.name}
                            onClick={() => loadBreadType(breadType)}
                            className="px-3 py-2 text-left border rounded-md hover:bg-secondary transition-colors"
                          >
                            <div className="font-medium">{breadType.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {breadType.minHydration}% - {breadType.maxHydration}% (Typical: {breadType.typical}%)
                            </div>
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label className="text-base">Conversion Method</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="maintain-weight"
                      checked={shouldMaintainTotalWeight}
                      onCheckedChange={(checked) => setShouldMaintainTotalWeight(!!checked)}
                    />
                    <label
                      htmlFor="maintain-weight"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Maintain total dough weight ({formula.totalWeight}g)
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {shouldMaintainTotalWeight 
                      ? "Will adjust flour and water to maintain the same total weight"
                      : "Will add/reduce water to achieve target hydration while keeping flour weight the same"
                    }
                  </p>
                </div>
                
                <Button onClick={convertHydration} className="bg-primary hover:bg-primary/90 text-white mt-2 w-full">
                  <Droplet className="mr-2 h-4 w-4" />
                  Convert to {targetHydration}% Hydration
                </Button>
              </div>
              
              {/* Conversion Results */}
              {conversionComplete && Object.keys(calculations).length > 0 && (
                <div className="rounded-md border p-4 space-y-4">
                  <h3 className="text-lg font-medium">Conversion Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md bg-muted p-4">
                      <h4 className="font-medium mb-2">Original Formula</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Hydration:</span>
                          <span className="font-mono">{calculations.originalHydration}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flour Weight:</span>
                          <span className="font-mono">{calculations.originalFlourWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Water Weight:</span>
                          <span className="font-mono">{Math.round(calculations.originalWaterWeight)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Weight:</span>
                          <span className="font-mono">{originalFormula.totalWeight}g</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-primary/10 p-4">
                      <h4 className="font-medium mb-2">Converted Formula</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Hydration:</span>
                          <span className="font-mono">{formula.hydration}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flour Weight:</span>
                          <span className="font-mono">{formula.flourWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Water Weight:</span>
                          <span className="font-mono">{Math.round(calculations.newWaterWeight)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Weight:</span>
                          <span className="font-mono">{formula.totalWeight}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-md text-sm">
                    <h4 className="font-medium mb-2">Changes Applied</h4>
                    <ul className="space-y-1">
                      <li>• {calculations.maintainedTotalWeight 
                          ? `Adjusted flour and water to maintain ${originalFormula.totalWeight}g total weight` 
                          : `Kept flour weight at ${calculations.originalFlourWeight}g`
                        }</li>
                      <li>• {calculations.liquidChange > 0 
                          ? `Added ${Math.round(Math.abs(calculations.liquidChange))}g of water` 
                          : `Removed ${Math.round(Math.abs(calculations.liquidChange))}g of water`
                        }</li>
                      <li>• Hydration changed from {calculations.originalHydration}% to {formula.hydration}%</li>
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="scale" className="space-y-6">
              {/* Simple Scaling */}
              <div className="p-4 rounded-md border space-y-4">
                <h3 className="text-lg font-medium">Simple Scaling</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label htmlFor="target-weight">Target Total Dough Weight</Label>
                    <span className="text-muted-foreground font-mono">
                      Currently: {formula.totalWeight}g
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Scale className="h-5 w-5 text-primary" />
                    <Slider
                      id="target-weight"
                      min={100}
                      max={2000}
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
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => setTargetWeight(500)} 
                    variant="outline" 
                    className="flex-1"
                  >
                    500g
                  </Button>
                  <Button 
                    onClick={() => setTargetWeight(1000)} 
                    variant="outline"
                    className="flex-1"
                  >
                    1000g
                  </Button>
                  <Button 
                    onClick={() => setTargetWeight(1500)}
                    variant="outline"
                    className="flex-1"
                  >
                    1500g
                  </Button>
                  <Button 
                    onClick={() => setTargetWeight(formula.totalWeight * 2)}
                    variant="outline"
                    className="flex-1"
                  >
                    Double
                  </Button>
                  <Button 
                    onClick={() => setTargetWeight(Math.round(formula.totalWeight / 2))}
                    variant="outline"
                    className="flex-1"
                  >
                    Half
                  </Button>
                </div>
                
                <div className="pt-2">
                  <Button onClick={scaleFormula} className="bg-primary hover:bg-primary/90 text-white w-full">
                    <Scale className="mr-2 h-4 w-4" />
                    Scale to {targetWeight}g
                  </Button>
                </div>
              </div>
              
              {/* Baker's Scaling by Pan Size */}
              <div className="p-4 rounded-md border space-y-4 mt-4">
                <h3 className="text-lg font-medium">Baker's Scaling by Pan Size</h3>
                
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
                  onClick={scaleForPans} 
                  disabled={!panSize} 
                  className="bg-primary hover:bg-primary/90 text-white w-full mt-2"
                >
                  <Scale className="mr-2 h-4 w-4" />
                  Scale for Selected Pan(s)
                </Button>
              </div>
              
              {/* Scaling Results */}
              {scalingComplete && Object.keys(scalingCalculations).length > 0 && (
                <div className="rounded-md border p-4 space-y-4">
                  <h3 className="text-lg font-medium">Scaling Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md bg-muted p-4">
                      <h4 className="font-medium mb-2">Original Formula</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Weight:</span>
                          <span className="font-mono">{scalingCalculations.originalWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flour Weight:</span>
                          <span className="font-mono">{scalingCalculations.originalFlourWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Scaling Factor:</span>
                          <span className="font-mono">1.00x</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-primary/10 p-4">
                      <h4 className="font-medium mb-2">Scaled Formula</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Weight:</span>
                          <span className="font-mono">{scalingCalculations.targetWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flour Weight:</span>
                          <span className="font-mono">{scalingCalculations.newFlourWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Scaling Factor:</span>
                          <span className="font-mono">{scalingCalculations.scalingFactor.toFixed(2)}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-md text-sm">
                    <h4 className="font-medium mb-2">Scaling Details</h4>
                    <ul className="space-y-1">
                      {scalingCalculations.scalingMethod === 'simple' ? (
                        <>
                          <li>• Scaled all ingredients by {scalingCalculations.scalingFactor.toFixed(2)}x</li>
                          <li>• Weight changed from {scalingCalculations.originalWeight}g to {scalingCalculations.targetWeight}g</li>
                          <li>• Hydration ratio maintained at {formula.hydration}%</li>
                        </>
                      ) : (
                        <>
                          <li>• Scaled for {scalingCalculations.panCount} {scalingCalculations.panSize} pan(s)</li>
                          <li>• Pan volume: {scalingCalculations.panVolume}cm³ each</li>
                          <li>• Scaling factor: {scalingCalculations.scalingFactor.toFixed(2)}x</li>
                          <li>• Dough weight: {scalingCalculations.targetWeight}g (80% pan fill)</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  {/* Ingredient Comparison */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Ingredient Changes</h4>
                    <div className="max-h-40 overflow-y-auto overflow-x-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Ingredient</th>
                            <th className="text-right p-2">Original</th>
                            <th className="text-right p-2">Scaled</th>
                            <th className="text-right p-2">Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scalingCalculations.originalIngredients.map((orig: any, index: number) => {
                            const scaled = scalingCalculations.scaledIngredients[index];
                            const change = scaled.weight - orig.weight;
                            return (
                              <tr key={orig.id} className="border-b">
                                <td className="p-2">{orig.name}</td>
                                <td className="text-right p-2 font-mono">{orig.weight}g</td>
                                <td className="text-right p-2 font-mono">{scaled.weight}g</td>
                                <td className={`text-right p-2 font-mono ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {change > 0 ? '+' : ''}{change}g
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Export Formula */}
              <div className="p-4 rounded-md border space-y-4 mt-4">
                <h3 className="text-lg font-medium">Export Formula</h3>
                
                <Button onClick={exportFormulaAsText} className="w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Formula to Clipboard
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="guide" className="space-y-6">
              {/* Hydration Guide */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Understanding Hydration</h3>
                <p className="text-muted-foreground">
                  Hydration refers to the amount of water in a dough compared to the amount of flour, expressed as a percentage.
                  It significantly affects dough handling, fermentation, and the final bread's texture and appearance.
                </p>
                
                <div className="bg-muted p-4 rounded-md space-y-4">
                  <h4 className="font-medium">Hydration Ranges</h4>
                  
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                      <div className="font-medium text-blue-600 dark:text-blue-400">Low Hydration (50-65%)</div>
                      <p className="text-sm">
                        Stiff dough that's easier to handle. Creates denser breads with a tight crumb structure.
                        Common for bagels, pretzels, and sandwich loaves.
                      </p>
                    </div>
                    
                    <div className="p-2 bg-green-50 dark:bg-green-950 rounded-md">
                      <div className="font-medium text-green-600 dark:text-green-400">Medium Hydration (65-75%)</div>
                      <p className="text-sm">
                        Balanced texture that's moderately extensible. Creates breads with good volume and a
                        moderately open crumb. Common for country breads and everyday sourdough.
                      </p>
                    </div>
                    
                    <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-md">
                      <div className="font-medium text-orange-600 dark:text-orange-400">High Hydration (75-85%)</div>
                      <p className="text-sm">
                        Wet, slack dough that requires skill to handle. Creates breads with an open, irregular crumb
                        and thin, crispy crust. Common for ciabatta, focaccia, and artisan sourdough.
                      </p>
                    </div>
                    
                    <div className="p-2 bg-red-50 dark:bg-red-950 rounded-md">
                      <div className="font-medium text-red-600 dark:text-red-400">Very High Hydration (85%+)</div>
                      <p className="text-sm">
                        Extremely wet dough that behaves more like a batter. Challenging to work with but can create
                        breads with large, irregular holes. Often requires special techniques like coil folding.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mt-6">Scaling Tips</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Pan Sizing:</span> Different bread styles require different amounts of dough relative to pan size.
                    For sandwich breads, fill the pan about 1/2 to 2/3 full before final proof.
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Accounting for Weight Loss:</span> Bread typically loses 10-15% of its weight during baking due to
                    moisture evaporation. Consider this when scaling recipes for a specific final weight.
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Calculating Baker's Percentages:</span> All ingredients are expressed as a percentage of the total flour weight.
                    Flour always equals 100%, and other ingredients are calculated relative to that.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between px-4 sm:px-6">
          <div className="text-sm text-muted-foreground">
            All changes apply immediately
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={resetFormula}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white" onClick={exportFormulaAsText}>
              <Copy className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}