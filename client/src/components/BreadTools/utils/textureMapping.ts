// Types for texture settings
export interface TextureSettings {
  crumbOpenness: number;
  elasticity: number;
  crustThickness: number;
  crustHardness: number;
  chewiness: number;
  riseProfile: string;
  hydrationPriority: "crumb" | "crust";
}

// Types for recipe adjustments
export interface RecipeAdjustments {
  hydration: number;
  flour: {
    type: string;
    protein: string;
  };
  method: {
    autolyse: number;
    bulk: number;
    proof: number;
    folds: number;
  };
  bake: {
    temp: number;
    time: number;
    steam: boolean;
    dutch: boolean;
  };
}

// Calculate hydration based on texture settings
export function getHydrationLevel(settings: TextureSettings): number {
  const { crumbOpenness, elasticity, hydrationPriority } = settings;
  
  // Base hydration depends on crumb openness and elasticity
  let hydration = 72; // Default value
  
  if (crumbOpenness > 70 && elasticity > 60) {
    hydration = 78;
  } else if (crumbOpenness > 60) {
    hydration = 75;
  } else if (crumbOpenness < 40) {
    hydration = 65;
  }
  
  // Adjust for hydration priority
  if (hydrationPriority === 'crust' && hydration > 70) {
    hydration -= 3; // Less hydration for better crust development
  } else if (hydrationPriority === 'crumb' && hydration < 75) {
    hydration += 2; // More hydration for more open crumb
  }
  
  return Math.round(hydration);
}

// Get baking adjustments based on crust preferences
export function adjustCrustSettings(settings: TextureSettings): {
  bakeTemp: number;
  bakeTime: number;
  steamRequired: boolean;
  dutchOven: boolean;
} {
  const { crustThickness, crustHardness, hydrationPriority } = settings;
  
  // Default baking settings
  let bakeTemp = 450;
  let bakeTime = 35;
  let steamRequired = true;
  let dutchOven = true;
  
  // Adjust temperature based on crust hardness
  if (crustHardness > 70) {
    bakeTemp = 475;
  } else if (crustHardness < 40) {
    bakeTemp = 425;
  }
  
  // Adjust bake time based on crust thickness
  if (crustThickness > 70) {
    bakeTime = 45;
  } else if (crustThickness < 40) {
    bakeTime = 30;
  }
  
  // Determine if steam is required
  steamRequired = crustHardness > 50;
  
  // Dutch oven recommendation
  dutchOven = crustHardness > 60 || crustThickness > 50;
  
  // Adjust for hydration priority
  if (hydrationPriority === 'crust') {
    bakeTemp += 15; // Higher temperature for better crust
    bakeTime -= 5;  // But shorter time to prevent burning
  }
  
  return {
    bakeTemp,
    bakeTime,
    steamRequired,
    dutchOven
  };
}

// Generate a comprehensive recipe adjustment based on texture settings
export function generateRecipeAdjustments(settings: TextureSettings): RecipeAdjustments {
  const { crumbOpenness, elasticity, chewiness, riseProfile } = settings;
  const hydration = getHydrationLevel(settings);
  const { bakeTemp, bakeTime, steamRequired, dutchOven } = adjustCrustSettings(settings);
  
  // Determine flour type and protein content
  let flourType = "bread flour";
  let proteinContent = "medium-high";
  
  if (elasticity > 70) {
    flourType = "high-gluten bread flour";
    proteinContent = "high";
  } else if (elasticity < 40 && crumbOpenness < 50) {
    flourType = "all-purpose flour";
    proteinContent = "medium";
  }
  
  // Determine method adjustments
  const autolyseTime = elasticity > 60 ? 60 : 30; // minutes
  const bulkTime = crumbOpenness > 60 ? 5 : 3.5;  // hours
  const proofTime = riseProfile === "Domed" ? 3 : (riseProfile === "Flat" ? 2 : 2.5); // hours
  const foldCount = elasticity > 60 ? 6 : 4;
  
  return {
    hydration,
    flour: {
      type: flourType,
      protein: proteinContent
    },
    method: {
      autolyse: autolyseTime,
      bulk: bulkTime,
      proof: proofTime,
      folds: foldCount
    },
    bake: {
      temp: bakeTemp,
      time: bakeTime,
      steam: steamRequired,
      dutch: dutchOven
    }
  };
}

// Generate human-readable instructions based on texture settings
export function getTextureInstructions(settings: TextureSettings): string {
  const adjustments = generateRecipeAdjustments(settings);
  
  return `
Recipe adjusted for your texture preferences:
• ${adjustments.hydration}% hydration with ${adjustments.flour.type} (${adjustments.flour.protein} protein)
• ${adjustments.method.autolyse} minute autolyse period
• ${adjustments.method.bulk} hour bulk fermentation with ${adjustments.method.folds} gentle folds
• ${adjustments.method.proof} hour final proof for a ${settings.riseProfile.toLowerCase()} profile
• Bake at ${adjustments.bake.temp}°F for ${adjustments.bake.time} minutes${adjustments.bake.steam ? ' with steam' : ''}${adjustments.bake.dutch ? ' in a Dutch oven' : ''}

${settings.crumbOpenness > 70 ? '• Handle dough very gently to preserve air bubbles' : ''}
${settings.elasticity > 70 ? '• Develop strong gluten network through extended mixing or folding' : ''}
${settings.chewiness > 70 ? '• Include a small percentage of high-protein flour for additional chew' : ''}
  `.trim();
}