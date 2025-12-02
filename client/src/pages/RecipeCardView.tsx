import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Clock, ChefHat, User, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Recipe Display Component for standalone card view
const RecipeCardDisplay = ({ recipe }: { recipe: any }) => {
  if (!recipe) return null;
  

  
  // Parse ingredient strings and format them properly
  const parseIngredientString = (ingredientStr: string) => {
    // Handle string format like "1/2 cup (1 stick) unsalted butter, softened - 113 - grams"
    if (typeof ingredientStr === 'string') {
      // Try to extract parts: amount, item, metric conversion
      const parts = ingredientStr.split(' - ');
      if (parts.length >= 2) {
        const mainPart = parts[0].trim();
        const metricAmount = parts[1]?.trim();
        const metricUnit = parts[2]?.trim();
        
        // Extract amount and item from main part
        const match = mainPart.match(/^([^a-zA-Z]*)\s*(.+)$/);
        if (match) {
          const amount = match[1].trim();
          const item = match[2].trim();
          
          return {
            amount,
            item,
            metricAmount,
            metricUnit
          };
        }
      }
      
      // Fallback: treat whole string as item
      return {
        amount: '',
        item: ingredientStr,
        metricAmount: '',
        metricUnit: ''
      };
    }
    
    // Handle object format - this shouldn't be reached since we check for string above
    return {
      amount: '',
      item: 'Invalid ingredient format',
      metricAmount: '',
      metricUnit: ''
    };
  };

  const formatAmount = (ingredient: any) => {
    if (typeof ingredient === 'string') {
      const parsed = parseIngredientString(ingredient);
      if (parsed.amount) {
        return (
          <span className="font-medium text-blue-600">
            {parsed.amount}
            {parsed.metricAmount && parsed.metricUnit && (
              <span className="text-gray-500 ml-1">({parsed.metricAmount} {parsed.metricUnit})</span>
            )}
          </span>
        );
      }
      return null;
    }
    
    // Original object handling code
    let amount = '';
    let imperialAmount = '';
    
    if (ingredient.amount) {
      if (typeof ingredient.amount === 'object') {
        amount = ingredient.amount.metric || ingredient.amount.amount || '';
        imperialAmount = ingredient.amount.imperial || '';
      } else {
        amount = ingredient.amount;
      }
    } else if (ingredient.amountMetric) {
      amount = ingredient.amountMetric;
      imperialAmount = ingredient.amountImperial || '';
    } else if (ingredient.quantityMetric) {
      amount = ingredient.quantityMetric;
      imperialAmount = ingredient.quantityImperial || '';
    } else if (ingredient.quantity) {
      amount = ingredient.quantity;
    } else if (ingredient.measurement) {
      amount = ingredient.measurement;
    }
    
    if (amount) {
      return (
        <span className="font-medium text-blue-600">
          {amount}
          {imperialAmount && amount !== imperialAmount && (
            <span className="text-gray-500 ml-1">({imperialAmount})</span>
          )}
        </span>
      );
    }
    
    return <span className="font-medium text-blue-600">-</span>;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const recipeText = `
${recipe.name}
${recipe.description || ''}

INGREDIENTS:
${recipe.ingredients?.map((ing: any, i: number) => 
  `${i + 1}. ${ing.amountMetric || ing.amount?.metric || ing.amount || ''} ${ing.item || ing.name}`
).join('\n') || ''}

INSTRUCTIONS:
${recipe.instructions?.map((inst: any, i: number) => 
  `${i + 1}. ${typeof inst === 'string' ? inst : inst.step || inst}`
).join('\n') || ''}

${recipe.tips ? `TIPS:\n${recipe.tips.map((tip: string, i: number) => `${i + 1}. ${tip}`).join('\n')}` : ''}
    `.trim();

    const blob = new Blob([recipeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name?.replace(/[^a-z0-9]/gi, '_') || 'recipe'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen print:p-4">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-blue-600">Recipe Card</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="p-8 shadow-lg print:shadow-none print:border-none">
        <div className="space-y-8">
          {/* Recipe Header */}
          {recipe.name && (
            <div className="text-center border-b pb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">{recipe.name}</h1>
              {recipe.description && (
                <p className="text-xl text-gray-600 italic">{recipe.description}</p>
              )}
            </div>
          )}
          
          {/* Recipe Stats */}
          {(recipe.totalTime || recipe.activeTime || recipe.yield || recipe.servings) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50 rounded-lg">
              {recipe.totalTime && (
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-gray-700">Total Time</p>
                  <p className="text-2xl font-bold text-blue-600">{recipe.totalTime}</p>
                </div>
              )}
              {recipe.activeTime && (
                <div className="text-center">
                  <ChefHat className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-gray-700">Active Time</p>
                  <p className="text-2xl font-bold text-blue-600">{recipe.activeTime}</p>
                </div>
              )}
              {(recipe.yield || recipe.servings) && (
                <div className="text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-gray-700">Serves</p>
                  <p className="text-2xl font-bold text-blue-600">{recipe.yield || recipe.servings}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-600 pb-2">Ingredients</h2>
              <ul className="space-y-3 text-lg">
                {recipe.ingredients.map((ingredient: any, index: number) => {
                  if (typeof ingredient === 'string') {
                    const parsed = parseIngredientString(ingredient);
                    return (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3 mt-1">•</span>
                        <div className="flex-1">
                          <span className="font-medium">
                            {parsed.amount && (
                              <span className="text-blue-600 mr-2">{parsed.amount}</span>
                            )}
                            {parsed.item}
                            {parsed.metricAmount && parsed.metricUnit && (
                              <span className="text-gray-500 ml-2">({parsed.metricAmount} {parsed.metricUnit})</span>
                            )}
                          </span>
                        </div>
                      </li>
                    );
                  }
                  
                  // Handle object format with nested quantity structure
                  const getDisplayAmount = (ing: any) => {
                    if (ing.quantity) {
                      const imperial = ing.quantity.imperial || '';
                      const metric = ing.quantity.metric || '';
                      if (imperial && metric) {
                        return `${imperial} (${metric})`;
                      }
                      return imperial || metric || '';
                    }
                    return formatAmount(ing);
                  };
                  
                  return (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 font-bold mr-3 mt-1">•</span>
                      <div className="flex-1">
                        <span className="font-medium">
                          <span className="text-blue-600 mr-2">{getDisplayAmount(ingredient)}</span>
                          {ingredient.item || ingredient.name}
                          {ingredient.temperature && (
                            <span className="text-sm text-gray-500 ml-2">({ingredient.temperature})</span>
                          )}
                          {ingredient.optional && (
                            <span className="text-sm text-gray-500 ml-2">(optional)</span>
                          )}
                        </span>
                        {ingredient.notes && (
                          <div className="text-sm text-gray-500 italic mt-1">{ingredient.notes}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-600 pb-2">Instructions</h2>
              <ol className="space-y-4 text-lg">
                {recipe.instructions.map((instruction: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="font-bold text-blue-600 mr-3 mt-1 text-xl">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="leading-relaxed text-gray-800">
                        {typeof instruction === 'string' ? instruction : instruction.step}
                      </p>
                      {typeof instruction === 'object' && instruction.time && (
                        <p className="text-sm text-blue-600 font-medium mt-1">Time: {instruction.time}</p>
                      )}
                      {typeof instruction === 'object' && instruction.temperature && (
                        <p className="text-sm text-red-600 font-medium mt-1">Temperature: {instruction.temperature}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
          

        </div>
      </Card>
    </div>
  );
};

export function RecipeCardView() {
  const [, params] = useRoute("/recipe-card/:id");
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recipeId = params?.id;
    if (recipeId) {
      // Try to get the recipe from localStorage or sessionStorage
      const storedRecipe = localStorage.getItem(`recipe_${recipeId}`) || sessionStorage.getItem(`recipe_${recipeId}`);
      if (storedRecipe) {
        try {
          setRecipe(JSON.parse(storedRecipe));
        } catch (e) {
          console.error('Failed to parse stored recipe:', e);
        }
      }
    }
    setLoading(false);
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Recipe Not Found</h1>
          <p className="text-gray-600">The recipe you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return <RecipeCardDisplay recipe={recipe} />;
}