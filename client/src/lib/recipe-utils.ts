import { BreadProfile } from "@/hooks/use-bread-profile";
import { BreadRecipe } from "@shared/schema";

// Calculate match percentage between a recipe's profile and user's preferences
export function calculateMatchPercentage(recipe: BreadRecipe, userProfile: BreadProfile): number {
  if (!recipe.textureProfile || !recipe.flavorProfile) {
    return 0;
  }
  
  const textureMatch = calculateTextureMatchScore(recipe, userProfile);
  const flavorMatch = calculateFlavorMatchScore(recipe, userProfile);
  
  // Overall match is an average of texture and flavor matches
  const overallMatch = (textureMatch + flavorMatch) / 2;
  
  // Return percentage (0-100)
  return Math.round(overallMatch * 100);
}

// Calculate texture match score (0-1 scale)
function calculateTextureMatchScore(recipe: BreadRecipe, userProfile: BreadProfile): number {
  const recipeTexture = recipe.textureProfile as Record<string, any>;
  const userTexture = userProfile.texture;
  
  if (!recipeTexture) return 0;
  
  // Calculate distance between numeric values (normalized to 0-1 scale)
  const crumbOpennessMatch = 1 - Math.abs(((recipeTexture.crumbOpenness || 5) / 10) - (userTexture.crumbOpenness / 10)) / 1;
  const holeSizeMatch = 1 - Math.abs(((recipeTexture.holeSize || 5) / 10) - (userTexture.holeSize / 10)) / 1;
  const tendernessMatch = 1 - Math.abs(((recipeTexture.tenderness || 5) / 10) - (userTexture.tenderness / 10)) / 1;
  const moistureMatch = 1 - Math.abs(((recipeTexture.moisture || 5) / 10) - (userTexture.moisture / 10)) / 1;
  const crustThicknessMatch = 1 - Math.abs(((recipeTexture.crustThickness || 5) / 10) - (userTexture.crustThickness / 10)) / 1;
  const crustTextureMatch = 1 - Math.abs(((recipeTexture.crustTexture || 5) / 10) - (userTexture.crustTexture / 10)) / 1;
  const colorMatch = 1 - Math.abs(((recipeTexture.color || 5) / 10) - (userTexture.color / 10)) / 1;
  const surfaceCharacterMatch = 1 - Math.abs(((recipeTexture.surfaceCharacter || 5) / 10) - (userTexture.surfaceCharacter / 10)) / 1;
  
  // Boolean matches (exact match = 1, mismatch = 0)
  const isSmoothMatch = recipeTexture.isSmooth === userTexture.isSmooth ? 1 : 0;
  const isRusticMatch = recipeTexture.isRustic === userTexture.isRustic ? 1 : 0;
  
  // Calculate the average match score across all texture attributes
  const totalAttributes = 10; // 8 numeric + 2 boolean
  const textureMatchScore = (
    crumbOpennessMatch + 
    holeSizeMatch + 
    tendernessMatch + 
    moistureMatch + 
    crustThicknessMatch + 
    crustTextureMatch + 
    colorMatch + 
    surfaceCharacterMatch + 
    isSmoothMatch + 
    isRusticMatch
  ) / totalAttributes;
  
  return textureMatchScore;
}

// Calculate flavor match score (0-1 scale)
function calculateFlavorMatchScore(recipe: BreadRecipe, userProfile: BreadProfile): number {
  const recipeFlavor = recipe.flavorProfile as Record<string, any>;
  const userFlavor = userProfile.flavor;
  
  if (!recipeFlavor) return 0;
  
  // Calculate distance between numeric values (normalized to 0-1 scale)
  const sournessMatch = 1 - Math.abs(((recipeFlavor.sourness || 5) / 10) - (userFlavor.sourness / 10)) / 1;
  const sweetnessMatch = 1 - Math.abs(((recipeFlavor.sweetness || 5) / 10) - (userFlavor.sweetness / 10)) / 1;
  const complexityMatch = 1 - Math.abs(((recipeFlavor.complexity || 5) / 10) - (userFlavor.complexity / 10)) / 1;
  const strengthMatch = 1 - Math.abs(((recipeFlavor.strength || 5) / 10) - (userFlavor.strength / 10)) / 1;
  
  // Calculate matches for flavor notes
  const recipeFlavorNotes = recipeFlavor.flavors as Record<string, boolean> || {};
  const flavorNoteMatches = Object.keys(userFlavor.flavors).map(key => {
    const typedKey = key as keyof typeof userFlavor.flavors;
    // Only count matches where the user has selected a flavor note
    if (userFlavor.flavors[typedKey]) {
      // If the recipe has that note, it's a match
      return recipeFlavorNotes[key] ? 1 : 0;
    }
    // If the user hasn't selected this note, don't penalize
    return 1;
  });
  
  const flavorNotesAverage = flavorNoteMatches.reduce((sum, val) => sum + val, 0) / flavorNoteMatches.length;
  
  // Calculate the average match score across all flavor attributes
  // Weighting: 70% for primary dimensions (sourness, sweetness, etc.) and 30% for flavor notes
  const primaryDimensionsScore = (sournessMatch + sweetnessMatch + complexityMatch + strengthMatch) / 4;
  const flavorMatchScore = (primaryDimensionsScore * 0.7) + (flavorNotesAverage * 0.3);
  
  return flavorMatchScore;
}