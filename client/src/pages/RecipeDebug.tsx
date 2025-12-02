import React, { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecipeDebug() {
  const { id } = useParams();
  const [recipeData, setRecipeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const response = await fetch(`/api/recipes/${id}`);
        if (!response.ok) {
          throw new Error("Recipe not found");
        }
        
        const data = await response.json();
        setRecipeData(data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        setError("Failed to load recipe. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !recipeData) {
    return <div>Error: {error || "Recipe not found"}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Recipe Debug - {recipeData.id}: {recipeData.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Recipe Structure</h2>
          
          <div className="mb-6">
            <h3 className="text-md font-bold mb-1">Ingredients Data Type:</h3>
            <div className="bg-gray-100 p-2 rounded">
              {typeof recipeData.ingredients === 'string' 
                ? 'String' 
                : Array.isArray(recipeData.ingredients) 
                  ? `Array with ${recipeData.ingredients.length} items` 
                  : typeof recipeData.ingredients}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-bold mb-1">First Ingredient Item Type (if array):</h3>
            <div className="bg-gray-100 p-2 rounded">
              {Array.isArray(recipeData.ingredients) && recipeData.ingredients.length > 0
                ? typeof recipeData.ingredients[0]
                : 'N/A'}
            </div>
            {Array.isArray(recipeData.ingredients) && recipeData.ingredients.length > 0 && (
              <pre className="bg-gray-100 p-2 mt-2 rounded overflow-auto text-xs">
                {JSON.stringify(recipeData.ingredients[0], null, 2)}
              </pre>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-bold mb-1">Full Ingredients:</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
              {JSON.stringify(recipeData.ingredients, null, 2)}
            </pre>
          </div>

          <div className="mb-6">
            <h3 className="text-md font-bold mb-1">First Instruction Item Type (if array):</h3>
            <div className="bg-gray-100 p-2 rounded">
              {Array.isArray(recipeData.instructions) && recipeData.instructions.length > 0
                ? typeof recipeData.instructions[0]
                : 'N/A'}
            </div>
            {Array.isArray(recipeData.instructions) && recipeData.instructions.length > 0 && (
              <pre className="bg-gray-100 p-2 mt-2 rounded overflow-auto text-xs">
                {JSON.stringify(recipeData.instructions[0], null, 2)}
              </pre>
            )}
          </div>
          
          <div>
            <h3 className="text-md font-bold mb-1">Complete Recipe Data:</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
              {JSON.stringify(recipeData, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}