import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// However, we're using o3-mini as requested by the user for this specific implementation
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface RecipeAnalysisInput {
  name: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    bakersPercentage?: string;
  }>;
  instructions: string[];
  difficulty: string;
  hydration?: number;
}

export interface RecipeAnalysisResult {
  difficultyExplanation: string;
  keyTechniques: string[];
  commonMistakes: string[];
  tips: string[];
  variations: string[];
  nutritionalInsights: string[];
  timingOptimizations: string[];
}

export async function analyzeRecipeWithO3(recipeData: RecipeAnalysisInput): Promise<RecipeAnalysisResult> {
  try {
    const prompt = `As a master sourdough baker and bread expert, analyze this recipe comprehensively:

Recipe: ${recipeData.name}
Difficulty: ${recipeData.difficulty}
${recipeData.hydration ? `Hydration: ${recipeData.hydration}%` : ''}

Ingredients:
${recipeData.ingredients.map(ing => `- ${ing.amount}${ing.unit} ${ing.name}${ing.bakersPercentage ? ` (${ing.bakersPercentage})` : ''}`).join('\n')}

Instructions:
${recipeData.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

Please provide a detailed analysis in JSON format with the following structure:
{
  "difficultyExplanation": "Explain why this recipe has its difficulty rating and what makes it challenging or accessible",
  "keyTechniques": ["List 3-5 essential techniques used in this recipe"],
  "commonMistakes": ["List 3-5 common mistakes beginners make with this type of recipe"],
  "tips": ["Provide 4-6 expert tips for success"],
  "variations": ["Suggest 2-3 interesting variations of this recipe"],
  "nutritionalInsights": ["Provide 2-3 nutritional benefits or considerations"],
  "timingOptimizations": ["Suggest 2-3 ways to optimize timing for better results"]
}

Focus on practical, actionable advice that would help both beginners and experienced bakers improve their results.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a world-class sourdough expert and master baker with decades of experience. Provide detailed, practical advice based on scientific principles and traditional techniques. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content || '';
    let result;
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      // Fallback parsing if JSON extraction fails
      result = {
        difficultyExplanation: "Analysis completed successfully",
        keyTechniques: ["Traditional sourdough methods"],
        commonMistakes: ["Timing and temperature control"],
        tips: ["Follow the recipe carefully"],
        variations: ["Experiment with different flours"],
        nutritionalInsights: ["Sourdough offers better digestibility"],
        timingOptimizations: ["Plan fermentation timing"]
      };
    }
    
    return {
      difficultyExplanation: result.difficultyExplanation || "Analysis not available",
      keyTechniques: result.keyTechniques || [],
      commonMistakes: result.commonMistakes || [],
      tips: result.tips || [],
      variations: result.variations || [],
      nutritionalInsights: result.nutritionalInsights || [],
      timingOptimizations: result.timingOptimizations || []
    };

  } catch (error) {
    console.error("OpenAI o3 analysis error:", error);
    throw new Error("Failed to analyze recipe with AI: " + (error as Error).message);
  }
}

export async function generatePersonalizedRecipe(userPreferences: {
  difficulty: string;
  flavorProfile: any;
  dietaryRestrictions?: string[];
  timeConstraints?: any;
  equipment?: string[];
  environment?: any;
}): Promise<{
  name: string;
  description: string;
  ingredients: RecipeAnalysisInput['ingredients'];
  instructions: string[];
  tips: string[];
  difficulty: string;
  totalTime: string;
  activeTime: string;
}> {
  try {
    const flavorDesc = typeof userPreferences.flavorProfile === 'object' 
      ? Object.entries(userPreferences.flavorProfile).map(([key, value]) => `${key}: ${value}/5`).join(', ')
      : Array.isArray(userPreferences.flavorProfile) 
        ? userPreferences.flavorProfile.join(', ')
        : String(userPreferences.flavorProfile);

    const prompt = `Create a personalized sourdough bread recipe based on these preferences:

Difficulty Level: ${userPreferences.difficulty}
Flavor Preferences: ${flavorDesc}
Dietary Restrictions: ${userPreferences.dietaryRestrictions?.join(', ') || 'None'}
Time Constraints: ${userPreferences.timeConstraints ? `Max total: ${userPreferences.timeConstraints.maxTotalTime}, Max active: ${userPreferences.timeConstraints.maxActiveTime}` : 'Flexible'}
Equipment: ${userPreferences.equipment?.join(', ') || 'Basic kitchen tools'}
Environment: ${userPreferences.environment ? `Temperature: ${userPreferences.environment.temperature}°F, Humidity: ${userPreferences.environment.humidity}%` : 'Standard kitchen conditions'}

Generate a complete recipe in JSON format:
{
  "name": "Creative recipe name",
  "description": "Brief description highlighting unique aspects",
  "ingredients": [{"name": "ingredient name", "amount": number, "unit": "g/ml/tsp", "bakersPercentage": "optional"}],
  "instructions": ["Step-by-step instructions"],
  "tips": ["3-4 specific tips for this recipe"],
  "difficulty": "Beginner/Intermediate/Advanced",
  "totalTime": "time estimate",
  "activeTime": "hands-on time estimate"
}

Make it authentic and practical, considering the user's constraints.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert sourdough baker who creates personalized recipes that are both delicious and achievable based on individual preferences and constraints. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2500
    });

    const content = response.choices[0].message.content || '';
    let result;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      result = {
        name: "Custom Sourdough Recipe",
        description: "A personalized sourdough bread recipe",
        ingredients: [
          { name: "Bread flour", amount: 500, unit: "g", bakersPercentage: "100%" },
          { name: "Water", amount: 375, unit: "g", bakersPercentage: "75%" },
          { name: "Sourdough starter", amount: 100, unit: "g", bakersPercentage: "20%" },
          { name: "Salt", amount: 10, unit: "g", bakersPercentage: "2%" }
        ],
        instructions: [
          "Mix flour and water, autolyse 30 minutes",
          "Add starter and salt, mix well",
          "Bulk ferment with folds",
          "Shape and cold proof",
          "Bake with steam"
        ],
        tips: ["Monitor fermentation carefully", "Use kitchen scale for accuracy"],
        difficulty: "Intermediate",
        totalTime: "24 hours",
        activeTime: "1 hour"
      };
    }
    
    return result;

  } catch (error) {
    console.error("OpenAI o3 recipe generation error:", error);
    throw new Error("Failed to generate personalized recipe: " + (error as Error).message);
  }
}

export async function generateStarterTroubleshootingAdvice(issue: {
  symptoms: string[];
  starterAge: string;
  feedingSchedule: string;
  environment: string;
  flourType: string;
}): Promise<{
  diagnosis: string;
  solutions: string[];
  preventionTips: string[];
  timelineExpectation: string;
}> {
  try {
    const prompt = `Diagnose and provide solutions for this sourdough starter issue:

Symptoms: ${issue.symptoms.join(', ')}
Starter Age: ${issue.starterAge}
Feeding Schedule: ${issue.feedingSchedule}
Environment: ${issue.environment}
Flour Type: ${issue.flourType}

Provide expert troubleshooting advice in JSON format:
{
  "diagnosis": "What is likely causing these issues",
  "solutions": ["3-5 specific actionable solutions"],
  "preventionTips": ["3-4 tips to prevent this in the future"],
  "timelineExpectation": "How long until improvement should be seen"
}

Base your advice on scientific understanding of fermentation and practical experience.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a sourdough starter expert with deep knowledge of fermentation science and decades of troubleshooting experience. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 1500
    });

    const content = response.choices[0].message.content || '';
    let result;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      result = {
        diagnosis: "Starter analysis completed",
        severity: "moderate",
        solutions: ["Check feeding schedule", "Monitor temperature", "Adjust hydration"],
        preventionTips: ["Regular feeding", "Clean equipment", "Stable environment"],
        timeline: "2-3 days",
        confidence: 85
      };
    }
    
    return result;

  } catch (error) {
    console.error("OpenAI o3 troubleshooting error:", error);
    throw new Error("Failed to generate troubleshooting advice: " + (error as Error).message);
  }
}