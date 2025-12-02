// Mock service for testing AI features when API key is not available
export async function mockAnalyzeRecipe(recipeData: any) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    difficultyExplanation: `This ${recipeData.difficulty.toLowerCase()} recipe requires attention to timing and technique. With ${recipeData.hydration}% hydration, the dough will be moderately sticky and require confident handling during shaping.`,
    keyTechniques: [
      "Autolyse for gluten development",
      "Stretch and fold for structure",
      "Bulk fermentation monitoring",
      "Pre-shaping and final shaping",
      "Steam baking for crust development"
    ],
    commonMistakes: [
      "Under-fermenting during bulk rise",
      "Over-handling during shaping",
      "Insufficient steam during baking",
      "Cutting too early after baking"
    ],
    tips: [
      "Use the poke test to check bulk fermentation",
      "Keep hands wet when handling sticky dough",
      "Score deeply and confidently",
      "Let bread cool completely before slicing"
    ],
    variations: [
      "Add 10% whole wheat flour for nuttier flavor",
      "Include seeds or grains for texture",
      "Try different scoring patterns"
    ],
    nutritionalInsights: [
      "Sourdough fermentation increases nutrient bioavailability",
      "Lower glycemic index than regular bread"
    ],
    timingOptimizations: [
      "Use refrigerator for extended fermentation control",
      "Adjust starter percentage for timing flexibility"
    ]
  };
}

export async function mockGeneratePersonalizedRecipe(preferences: any) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const flavorAdjectives = preferences.flavorProfile.includes('tangy') ? 'Tangy' : 
                          preferences.flavorProfile.includes('mild') ? 'Mild' : 'Classic';
  
  return {
    name: `${flavorAdjectives} ${preferences.difficulty} Sourdough`,
    description: `A personalized sourdough recipe tailored to your ${preferences.difficulty.toLowerCase()} skill level with ${preferences.flavorProfile.join(' and ')} flavors.`,
    ingredients: [
      { name: "Bread flour", amount: 500, unit: "g", bakersPercentage: "100%" },
      { name: "Water", amount: 375, unit: "g", bakersPercentage: "75%" },
      { name: "Active sourdough starter", amount: 100, unit: "g", bakersPercentage: "20%" },
      { name: "Sea salt", amount: 10, unit: "g", bakersPercentage: "2%" }
    ],
    instructions: [
      "Combine flour and water in a large bowl. Mix until no dry flour remains. Cover and rest for 30 minutes (autolyse).",
      "Add the active starter to the dough and mix thoroughly until well incorporated.",
      "Sprinkle salt over the dough and mix until evenly distributed.",
      "Perform 4 sets of stretch and folds, spacing them 30 minutes apart during the first 2 hours.",
      "Continue bulk fermentation for 4-6 hours total, until dough increases by 50%.",
      "Pre-shape into a round, rest 20 minutes, then shape into final form.",
      "Place in banneton and refrigerate overnight (8-24 hours).",
      "Bake in preheated Dutch oven at 450°F: 20 minutes covered, 15-20 minutes uncovered."
    ],
    tips: [
      "Check starter activity before beginning - it should double within 4-8 hours of feeding",
      "Use the windowpane test to check gluten development after stretch and folds",
      "Score the dough quickly and confidently with a sharp blade",
      "Cool completely on a wire rack before slicing (at least 2 hours)"
    ],
    difficulty: preferences.difficulty,
    totalTime: preferences.availableTime === 'same-day' ? '8-10 hours' : '18-24 hours',
    activeTime: '45 minutes'
  };
}

export async function mockGenerateStarterTroubleshootingAdvice(issueData: any) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const hasActivityIssues = issueData.symptoms.some((s: string) => 
    s.includes('rising') || s.includes('bubble')
  );
  
  return {
    diagnosis: hasActivityIssues 
      ? "Your starter appears to be experiencing low microbial activity, likely due to temperature, feeding schedule, or flour quality issues."
      : "The symptoms suggest an imbalanced microbial ecosystem, possibly from environmental factors or contamination.",
    solutions: [
      "Move starter to a warmer location (75-80°F ideal)",
      "Switch to a 1:1:1 feeding ratio (starter:flour:water by weight)",
      "Feed twice daily with quality bread flour",
      "Ensure water is dechlorinated (filtered or left out overnight)"
    ],
    preventionTips: [
      "Maintain consistent feeding schedule",
      "Use clean utensils and containers",
      "Monitor ambient temperature",
      "Keep detailed feeding logs"
    ],
    timelineExpectation: "With proper care, you should see improvement within 3-5 days. Full recovery typically takes 1-2 weeks."
  };
}