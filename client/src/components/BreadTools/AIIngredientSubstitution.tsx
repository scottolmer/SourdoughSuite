import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SubstitutionResult {
  originalIngredient: string;
  substitutes: Array<{
    ingredient: string;
    ratio: string;
    notes: string;
    impact: string;
  }>;
  explanation: string;
  considerations: string[];
}

export default function AIIngredientSubstitution() {
  const [ingredient, setIngredient] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [recipeContext, setRecipeContext] = useState('');
  const [result, setResult] = useState<SubstitutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ingredient.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an ingredient to substitute.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const apiResponse = await apiRequest('/api/ai/ingredient-substitution', {
        method: 'POST',
        body: JSON.stringify({
          ingredient: ingredient.trim(),
          amount: amount.trim(),
          reason: reason.trim(),
          recipeContext: recipeContext.trim()
        }),
      });

      console.log('API response received for /api/ai/ingredient-substitution:', apiResponse);
      
      if (apiResponse.success && apiResponse.data && apiResponse.data.substitutions) {
        // Transform API response to match component expectations
        const transformedResult: SubstitutionResult = {
          originalIngredient: ingredient,
          substitutes: apiResponse.data.substitutions.map((sub: any) => ({
            ingredient: sub.substitute,
            ratio: sub.ratio,
            notes: sub.notes,
            impact: sub.difficulty
          })),
          explanation: `Substitution options for ${ingredient}${amount ? ` (${amount})` : ''}`,
          considerations: ["Check recipe balance after substitution", "Adjust liquid ratios if needed", "Test small batches first"]
        };
        
        setResult(transformedResult);
        toast({
          title: "Analysis Complete",
          description: `Found ${apiResponse.data.substitutions.length} substitution options.`,
        });
      } else {
        console.log('Response validation failed:', {
          success: apiResponse.success,
          hasData: !!apiResponse.data,
          hasSubstitutions: !!(apiResponse.data && apiResponse.data.substitutions)
        });
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error getting substitution suggestions:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to get substitution suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIngredient('');
    setAmount('');
    setReason('');
    setRecipeContext('');
    setResult(null);
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Ingredient Substitution</h1>
          <p className="text-gray-600">
            Get intelligent suggestions for ingredient substitutions in your sourdough recipes
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient">Ingredient to Substitute</Label>
              <Input
                id="ingredient"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                placeholder="e.g., bread flour, honey, olive oil"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (optional)</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 500g, 2 tbsp, 1 cup"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Substitution (optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., allergies, dietary restrictions, unavailable"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="context">Recipe Context (optional)</Label>
            <Textarea
              id="context"
              value={recipeContext}
              onChange={(e) => setRecipeContext(e.target.value)}
              placeholder="Describe your recipe or what you're making..."
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !ingredient.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Get Substitution Suggestions'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </div>

        {result && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Substitution Suggestions for {result.originalIngredient}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Recommended Substitutes</h3>
                  <div className="space-y-4">
                    {result.substitutes.map((substitute, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{substitute.ingredient}</h4>
                          <Badge variant="secondary">{substitute.ratio}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{substitute.notes}</p>
                        <div className="text-sm">
                          <span className="font-medium">Impact: </span>
                          <span className="text-gray-700">{substitute.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Explanation</h3>
                  <p className="text-gray-700">{result.explanation}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Important Considerations</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {result.considerations.map((consideration, index) => (
                      <li key={index}>{consideration}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}