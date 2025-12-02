import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PlusCircle, 
  MinusCircle, 
  Trash2, 
  Save, 
  FileText, 
  RefreshCw, 
  Copy, 
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

// Ingredient types
const INGREDIENT_TYPES = [
  { value: 'flour', label: 'Flour' },
  { value: 'water', label: 'Water' },
  { value: 'starter', label: 'Sourdough Starter' },
  { value: 'salt', label: 'Salt' },
  { value: 'sugar', label: 'Sugar' },
  { value: 'fat', label: 'Fat/Oil' },
  { value: 'egg', label: 'Egg' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'other', label: 'Other' }
];

// Default starter composition (adjust as needed)
const DEFAULT_STARTER_COMPOSITION = {
  flour: 0.5, // 50% flour
  water: 0.5, // 50% water
};

// Default formula
const DEFAULT_FORMULA = {
  name: '',
  description: '',
  ingredients: [
    { id: 1, name: 'Bread Flour', type: 'flour', weight: 500, percentage: 100 },
    { id: 2, name: 'Water', type: 'water', weight: 350, percentage: 70 },
    { id: 3, name: 'Sourdough Starter', type: 'starter', weight: 100, percentage: 20 },
    { id: 4, name: 'Salt', type: 'salt', weight: 10, percentage: 2 },
  ],
  totalWeight: 960,
  flourWeight: 500,
  hydration: 70
};

interface Ingredient {
  id: number;
  name: string;
  type: string;
  weight: number;
  percentage: number;
}

interface Formula {
  id?: number;
  userId?: number;
  name: string;
  description: string;
  ingredients: Ingredient[];
  totalWeight: number;
  flourWeight: number;
  hydration: number;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function BakersPercentageCalculator() {
  const { toast } = useToast();
  const [formula, setFormula] = useState<Formula>({ ...DEFAULT_FORMULA, isPublic: false });
  const [savedFormulas, setSavedFormulas] = useState<Formula[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [targetDoughWeight, setTargetDoughWeight] = useState(1000);
  const [targetDoughWeightInput, setTargetDoughWeightInput] = useState('1000');
  const [weightInputs, setWeightInputs] = useState<{[key: number]: string}>({});
  const [nextId, setNextId] = useState(5); // For new ingredients

  // Fetch user's saved formulas
  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        // Replace with actual user ID or use the current user's ID
        const userId = 1; // Example user ID
        const response = await apiRequest(`/api/formulas/user/${userId}`);
        if (response) {
          setSavedFormulas(response);
        }
      } catch (error) {
        console.error('Failed to fetch formulas:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your saved formulas',
          variant: 'destructive',
        });
      }
    };

    fetchFormulas();
  }, [toast]);

  // Calculate percentages and update formula
  const calculatePercentages = (ingredients: Ingredient[]) => {
    // Calculate total flour weight including flour in starter
    let flourWeight = 0;
    let waterWeight = 0;
    let totalWeight = 0;

    ingredients.forEach(ingredient => {
      totalWeight += ingredient.weight;

      if (ingredient.type === 'flour') {
        flourWeight += ingredient.weight;
      } else if (ingredient.type === 'water') {
        waterWeight += ingredient.weight;
      } else if (ingredient.type === 'starter') {
        // Add flour and water from starter to their respective totals
        flourWeight += ingredient.weight * DEFAULT_STARTER_COMPOSITION.flour;
        waterWeight += ingredient.weight * DEFAULT_STARTER_COMPOSITION.water;
      }
    });

    // Calculate baker's percentages for each ingredient
    const updatedIngredients = ingredients.map(ingredient => ({
      ...ingredient,
      percentage: Math.round((ingredient.weight / flourWeight) * 100 * 10) / 10
    }));

    // Calculate hydration (water percentage)
    const hydration = Math.round((waterWeight / flourWeight) * 100);

    return {
      ingredients: updatedIngredients,
      totalWeight,
      flourWeight,
      hydration
    };
  };

  // Handle ingredient weight change
  const handleWeightChange = (id: number, weightStr: string) => {
    // Update the input display value immediately
    setWeightInputs(prev => ({ ...prev, [id]: weightStr }));
    
    // Only update the actual weight if there's a valid number
    const weight = weightStr === '' ? 0 : parseInt(weightStr, 10) || 0;
    if (weight < 0) return;
    
    const updatedIngredients = formula.ingredients.map(ingredient => 
      ingredient.id === id ? { ...ingredient, weight } : ingredient
    );
    
    const calculated = calculatePercentages(updatedIngredients);
    
    setFormula({
      ...formula,
      ...calculated
    });
  };

  // Get display value for weight input
  const getWeightInputValue = (id: number, weight: number) => {
    return weightInputs[id] !== undefined ? weightInputs[id] : weight.toString();
  };

  // Handle ingredient type change
  const handleTypeChange = (id: number, type: string) => {
    const updatedIngredients = formula.ingredients.map(ingredient => 
      ingredient.id === id ? { ...ingredient, type } : ingredient
    );
    
    const calculated = calculatePercentages(updatedIngredients);
    
    setFormula({
      ...formula,
      ...calculated
    });
  };

  // Handle ingredient name change
  const handleNameChange = (id: number, name: string) => {
    setFormula({
      ...formula,
      ingredients: formula.ingredients.map(ingredient => 
        ingredient.id === id ? { ...ingredient, name } : ingredient
      )
    });
  };

  // Add new ingredient
  const addIngredient = () => {
    const newIngredient = {
      id: nextId,
      name: '',
      type: 'other',
      weight: 0,
      percentage: 0
    };
    
    const updatedIngredients = [...formula.ingredients, newIngredient];
    const calculated = calculatePercentages(updatedIngredients);
    
    setFormula({
      ...formula,
      ...calculated
    });
    
    setNextId(nextId + 1);
  };

  // Remove ingredient
  const removeIngredient = (id: number) => {
    // Don't allow removing if there's only one ingredient left
    if (formula.ingredients.length <= 1) {
      toast({
        title: 'Cannot remove',
        description: 'You need at least one ingredient in your formula',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedIngredients = formula.ingredients.filter(
      ingredient => ingredient.id !== id
    );
    
    const calculated = calculatePercentages(updatedIngredients);
    
    setFormula({
      ...formula,
      ...calculated
    });
  };

  // Scale formula to target dough weight
  const scaleFormula = () => {
    const scaleFactor = targetDoughWeight / formula.totalWeight;
    
    const scaledIngredients = formula.ingredients.map(ingredient => ({
      ...ingredient,
      weight: Math.round(ingredient.weight * scaleFactor)
    }));
    
    const calculated = calculatePercentages(scaledIngredients);
    
    setFormula({
      ...formula,
      ...calculated
    });
    
    toast({
      title: 'Formula scaled',
      description: `Formula scaled to ${targetDoughWeight}g total dough weight`
    });
  };

  // Reset formula to default
  const resetFormula = () => {
    setFormula({ ...DEFAULT_FORMULA, isPublic: false });
    setIsEditing(false);
    
    toast({
      title: 'Formula reset',
      description: 'Formula has been reset to default values'
    });
  };

  // Load a saved formula
  const loadFormula = (savedFormula: Formula) => {
    setFormula(savedFormula);
    setIsEditing(true);
    
    toast({
      title: 'Formula loaded',
      description: `${savedFormula.name} has been loaded for editing`
    });
  };

  // Save current formula
  const saveFormula = async () => {
    if (!formula.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please provide a name for your formula',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {
        ...formula,
        userId: 1, // Replace with actual user ID
      };
      
      if (isEditing && formula.id) {
        // Update existing formula
        const response = await apiRequest(`/api/formulas/${formula.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        }) as Formula;
        
        // Update in local state
        setSavedFormulas(formulas => 
          formulas.map(f => f.id === formula.id ? response : f)
        );
        
        toast({
          title: 'Formula updated',
          description: `${formula.name} has been updated successfully`
        });
      } else {
        // Create new formula
        const response = await apiRequest('/api/formulas', {
          method: 'POST',
          body: JSON.stringify(payload)
        }) as Formula;
        
        // Add to local state
        setSavedFormulas(formulas => [...formulas, response]);
        
        // Start editing the newly created formula
        setFormula(response);
        setIsEditing(true);
        
        toast({
          title: 'Formula saved',
          description: `${formula.name} has been saved successfully`
        });
      }
    } catch (error) {
      console.error('Failed to save formula:', error);
      toast({
        title: 'Error',
        description: 'Failed to save formula',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a formula
  const deleteFormula = async (id: number) => {
    if (!confirm('Are you sure you want to delete this formula?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiRequest(`/api/formulas/${id}`, {
        method: 'DELETE'
      });
      
      // Remove from local state
      setSavedFormulas(formulas => formulas.filter(f => f.id !== id));
      
      // If the deleted formula was being edited, reset to default
      if (isEditing && formula.id === id) {
        resetFormula();
      }
      
      toast({
        title: 'Formula deleted',
        description: 'Formula has been deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete formula:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete formula',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export formula as text
  const exportFormulaAsText = () => {
    try {
      let text = `${formula.name || 'Bread Formula'}\n`;
      text += formula.description ? `${formula.description}\n\n` : '\n';
      text += `Total Dough Weight: ${formula.totalWeight}g\n`;
      text += `Hydration: ${formula.hydration}%\n\n`;
      text += 'Ingredients:\n';
      
      formula.ingredients.forEach(ingredient => {
        text += `${ingredient.name || 'Ingredient'}: ${ingredient.weight}g (${ingredient.percentage}%)\n`;
      });
      
      // Create blob and download
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.href = url;
      element.download = `${formula.name || 'formula'}.txt`;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: 'Formula has been downloaded as a text file'
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'Unable to download the formula. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Baker's Percentage Calculator</CardTitle>
          <CardDescription>
            Calculate baker's percentages and scale your bread formulas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="formula-name">Formula Name</Label>
                <Input
                  id="formula-name"
                  placeholder="e.g., Basic Sourdough Bread"
                  value={formula.name}
                  onChange={(e) => setFormula({ ...formula, name: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={resetFormula}
                  className="border-dashed"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="formula-description">Description (Optional)</Label>
              <Input
                id="formula-description"
                placeholder="A brief description of your formula"
                value={formula.description}
                onChange={(e) => setFormula({ ...formula, description: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ingredients</h3>
                <Button onClick={addIngredient} variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">Name</TableHead>
                      <TableHead className="w-[20%]">Type</TableHead>
                      <TableHead className="w-[20%]">Weight (g)</TableHead>
                      <TableHead className="w-[15%] text-right">Percentage</TableHead>
                      <TableHead className="w-[10%] text-center">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formula.ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell className="py-2 px-3">
                          <Input
                            type="text"
                            placeholder="Ingredient name"
                            value={ingredient.name}
                            onChange={(e) => handleNameChange(ingredient.id, e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Select
                            value={ingredient.type}
                            onValueChange={(value) => handleTypeChange(ingredient.id, value)}
                          >
                            <SelectTrigger className="w-full">
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
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Input
                            type="number"
                            min="0"
                            value={getWeightInputValue(ingredient.id, ingredient.weight)}
                            onChange={(e) => handleWeightChange(ingredient.id, e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right font-mono">
                          {ingredient.type === 'flour' ? (
                            <span className="font-bold">100%</span>
                          ) : (
                            <span>{ingredient.percentage}%</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-center">
                          <Button
                            onClick={() => removeIngredient(ingredient.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {formula.ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-2">
                        <Label className="text-xs text-muted-foreground mb-1 block">Ingredient Name</Label>
                        <Input
                          type="text"
                          placeholder="Ingredient name"
                          value={ingredient.name}
                          onChange={(e) => handleNameChange(ingredient.id, e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Button
                        onClick={() => removeIngredient(ingredient.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Type</Label>
                        <Select
                          value={ingredient.type}
                          onValueChange={(value) => handleTypeChange(ingredient.id, value)}
                        >
                          <SelectTrigger className="w-full">
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
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Weight (g)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={getWeightInputValue(ingredient.id, ingredient.weight)}
                          onChange={(e) => handleWeightChange(ingredient.id, e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Percentage</Label>
                        <div className="h-10 flex items-center justify-center bg-muted rounded border font-mono font-semibold">
                          {ingredient.type === 'flour' ? '100%' : `${ingredient.percentage}%`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="total-weight">Total Dough Weight</Label>
                    <span className="text-sm text-muted-foreground font-mono">{formula.totalWeight}g</span>
                  </div>
                  <div className="h-4"></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="flour-weight">Total Flour Weight</Label>
                    <span className="text-sm text-muted-foreground font-mono">{formula.flourWeight}g</span>
                  </div>
                  <div className="h-4"></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="hydration">Hydration</Label>
                    <span className="text-sm text-muted-foreground font-mono">{formula.hydration}%</span>
                  </div>
                  <div className="h-4"></div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Scale Formula</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div className="sm:col-span-3 space-y-2">
                    <Label htmlFor="target-weight">Target Dough Weight (g)</Label>
                    <Input
                      id="target-weight"
                      type="number"
                      min="1"
                      value={targetDoughWeightInput}
                      onChange={(e) => {
                        setTargetDoughWeightInput(e.target.value);
                        setTargetDoughWeight(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0);
                      }}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Button onClick={scaleFormula} className="w-full">Scale Formula</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={exportFormulaAsText}
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <Button onClick={saveFormula} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Formula' : 'Save Formula'}
          </Button>
        </CardFooter>
      </Card>
      
      {savedFormulas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Formulas</CardTitle>
            <CardDescription>
              Your saved bread formulas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedFormulas.map((savedFormula) => (
                <div 
                  key={savedFormula.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{savedFormula.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center mr-4">
                        Hydration: {savedFormula.hydration}%
                      </span>
                      <span className="inline-flex items-center">
                        Total: {savedFormula.totalWeight}g
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => loadFormula(savedFormula)}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Load</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteFormula(savedFormula.id as number)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}