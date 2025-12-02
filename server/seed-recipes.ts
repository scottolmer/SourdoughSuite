import { storage } from './storage';
import { InsertBreadRecipe } from '@shared/schema';

const now = new Date().toISOString();

// Add attribution note to each recipe
const attribution = "Inspired by Tartine Bread cookbook. Buy the book here: https://www.tartinebakery.com/books";

// Get difficulty based on hydration and complexity
function getDifficulty(hydration: number, author: string): string {
  if (hydration > 80) return 'Advanced';
  if (hydration > 75) return 'Intermediate';
  return 'Beginner';
}

// Calculate total and active time based on instructions
function estimateTimes(instructions: string[]): { totalTime: string, activeTime: string } {
  const hasOvernight = instructions.some(step => 
    step.includes('overnight') || 
    step.includes('8-12 hours') || 
    step.includes('12-24 hours') ||
    step.includes('cold retard')
  );
  
  const hasExtendedFermentation = instructions.some(step => 
    step.includes('bulk fermentation') || 
    step.includes('3-4 hours') ||
    step.includes('4-5 hours')
  );
  
  let totalTime = '6-10 hours';
  if (hasOvernight) totalTime = '16-24 hours';
  
  // Estimate active time based on number of folds and steps
  const activeSteps = instructions.filter(step => 
    !step.includes('rest') && 
    !step.includes('allow') && 
    !step.includes('let') && 
    !step.includes('refrigerate')
  ).length;
  
  const activeTime = `${Math.max(30, activeSteps * 10)}-${activeSteps * 15} minutes`;
  
  return { totalTime, activeTime };
}

// Transform the sourdough_recipes array from the imported data
export async function seedRecipes(recipes: any[]) {
  const results = {
    success: 0,
    errors: [] as string[]
  };

  for (const recipe of recipes) {
    try {
      // Get time estimates
      const { totalTime, activeTime } = estimateTimes(recipe.instructions);
      
      // Determine appropriate tags
      const tags = ['sourdough', 'artisan', 'bread'];
      
      // Add author-specific tags
      if (recipe.author.includes('Robertson')) {
        tags.push('tartine');
      }
      
      // Add ingredient-based tags
      if (recipe.name.toLowerCase().includes('rye')) {
        tags.push('rye');
      }
      if (recipe.name.toLowerCase().includes('porridge') || recipe.ingredients.some((i: any) => i.name.toLowerCase().includes('porridge'))) {
        tags.push('porridge');
      }
      if (recipe.name.toLowerCase().includes('seed') || recipe.ingredients.some((i: any) => 
        i.name.toLowerCase().includes('seed') || 
        i.name.toLowerCase().includes('sesame') ||
        i.name.toLowerCase().includes('flax') ||
        i.name.toLowerCase().includes('sunflower') ||
        i.name.toLowerCase().includes('pumpkin')
      )) {
        tags.push('seeded');
      }
      
      // Transform ingredients if needed
      const ingredients = recipe.ingredients.map((ingredient: any) => {
        // Make sure the ingredient has the required fields
        return {
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit || 'g',
          percentage: ingredient.percentage
        };
      });
      
      // Format instructions as objects with text property
      const instructions = recipe.instructions.map((instruction: string) => ({ 
        text: instruction 
      }));
      
      // Find the main flour amounts to calculate yields
      const mainFlours = recipe.ingredients.filter((i: any) => 
        i.name.toLowerCase().includes('flour') && 
        !i.name.toLowerCase().includes('levain')
      );
      
      const totalFlour = mainFlours.reduce((sum: number, flour: any) => sum + flour.amount, 0);
      
      // Determine texture and flavor profiles based on recipe properties
      const hasRye = recipe.name.toLowerCase().includes('rye') || 
                    recipe.ingredients.some((i: any) => i.name.toLowerCase().includes('rye'));
                    
      const hasWhole = recipe.ingredients.some((i: any) => i.name.toLowerCase().includes('whole wheat'));
      
      const textureProfile = {
        crustThickness: recipe.name.toLowerCase().includes('focaccia') ? 4 : 7,
        crustTexture: recipe.name.toLowerCase().includes('focaccia') ? 5 : 8,
        crumbOpenness: hasRye ? 5 : 7,
        holeSize: hasRye ? 4 : (recipe.hydration > 75 ? 7 : 5),
        tenderness: recipe.name.toLowerCase().includes('brioche') ? 8 : 5,
        moisture: recipe.hydration > 75 ? 7 : 5
      };
      
      const flavorProfile = {
        sourness: hasRye ? 7 : 6,
        sweetness: recipe.name.toLowerCase().includes('honey') ? 7 : 4,
        complexity: hasRye || hasWhole ? 8 : 6,
        strength: hasRye ? 7 : 5,
        flavors: {
          nutty: hasWhole || recipe.name.toLowerCase().includes('walnut'),
          fruity: recipe.name.toLowerCase().includes('cherr'),
          earthy: hasRye,
          malty: false,
          buttery: recipe.name.toLowerCase().includes('brioche'),
          spicy: recipe.name.toLowerCase().includes('spice')
        }
      };
      
      // Get a relevant image based on recipe type
      let imageUrl = 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800';
      
      if (recipe.name.toLowerCase().includes('rye')) {
        imageUrl = 'https://images.unsplash.com/photo-1603379064236-3ce0a951c7b6?w=800';
      } else if (recipe.name.toLowerCase().includes('focaccia')) {
        imageUrl = 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800';
      } else if (recipe.name.toLowerCase().includes('seed')) {
        imageUrl = 'https://images.unsplash.com/photo-1612201143788-b15d51af0b6c?w=800';
      } else if (recipe.name.toLowerCase().includes('porridge')) {
        imageUrl = 'https://images.unsplash.com/photo-1601293052505-397270e7f28e?w=800';
      }
      
      // Transform the recipe into the format expected by our database
      const transformedRecipe: InsertBreadRecipe = {
        userId: 1, // Assign to the admin user or change as needed
        name: recipe.name,
        description: recipe.description,
        ingredients: ingredients,
        instructions: instructions,
        hydration: recipe.hydration,
        yields: `1 loaf (approx. ${totalFlour}g flour)`,
        difficulty: getDifficulty(recipe.hydration, recipe.author),
        totalTime: totalTime,
        activeTime: activeTime,
        imageUrl: imageUrl,
        tags: tags,
        // Add attribution to notes
        notes: recipe.notes 
          ? [recipe.notes, attribution] 
          : [attribution],
        isPublic: true,
        isFavorite: false,
        rating: 5,
        textureProfile: textureProfile,
        flavorProfile: flavorProfile
      };

      // Create the recipe in the database
      await storage.createRecipe(transformedRecipe);
      results.success++;
    } catch (error) {
      console.error(`Error seeding recipe ${recipe.name}:`, error);
      results.errors.push(`Failed to seed ${recipe.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return results;
}