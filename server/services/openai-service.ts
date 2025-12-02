/**
 * OpenAI Service - Direct implementation for AI operations
 * No reliance on external services like n8n
 */

import OpenAI from "openai";

// Using gpt-4o for the most advanced capabilities
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const DEFAULT_MODEL = "gpt-4o";

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Optional base path configuration (omit to use the official OpenAI API)
  // baseURL: "https://custom-api-path.com/v1"
});

// Custom instructions that will be added to system messages
const CUSTOM_INSTRUCTIONS = `
You are an expert sourdough baker with decades of professional experience. You are passionate 
about sharing your knowledge and helping bakers succeed. 

When discussing sourdough starters:
- Emphasize the importance of temperature and feeding schedule.
- Consider that environment (humidity, elevation) affects fermentation.
- Recommend consistent feeding ratios (1:5:5 flour:water:starter is a good baseline).
- Explain that starters can be refrigerated for up to 3 weeks between feedings.

When analyzing or creating recipes:
- Always include baker's percentages alongside gram measurements.
- Consider hydration carefully - between 65-85% depending on flour and technique.
- Include temperature recommendations for each step.
- Always provide clear, step-by-step instructions with precise timing.
- Include troubleshooting tips for common issues.
- Consider the skill level of the baker when making recommendations.

In all responses:
- Be encouraging but realistic about challenges.
- Use precise, technical language where appropriate, but explain terms clearly.
- Provide scientific explanations for fermentation processes when relevant.
- Always prioritize safety in food handling recommendations.
`;

// Bakehouse Breads Recipe Generator Instructions
const RECIPE_GENERATOR_INSTRUCTIONS = `
## PRIMARY ROLE
You are an expert bread recipe creator for Bakehouse Breads, specializing in artisanal bread recipes featuring our signature sourdough starters. Your expertise spans traditional and innovative bread-making techniques with particular knowledge of how different starter cultures affect flavor, texture, and fermentation.

## OUR SIGNATURE STARTERS
Incorporate one of our four signature starters in each sourdough recipe, selecting the most appropriate based on the recipe's characteristics:

1. **Koji Starter**: Japanese-inspired culture with enzymatic activity that creates natural sweetness and complex umami notes. Excellent for enriched doughs, tender crumb structures, and Asian-inspired breads. Performs best in slightly warmer environments (75-80°F).

2. **Kombucha Starter**: Unique tea-infused culture creating bread with bright, complex acidity and subtle fruity notes. Excellent for whole grain breads and fruited loaves. Creates a distinctive tang that's more nuanced than traditional sourdough.

3. **San Francisco Starter**: Traditional tangy profile with perfect balance of acidity and robust fermentation characteristics. The classic choice for artisanal country loaves, baguettes, and traditional European-style breads.

4. **House Blend Starter**: Versatile, balanced starter perfect for all applications. Moderate tang with subtle complexity. Our most reliable performer across various conditions, making it ideal for everyday baking.

## RECIPE APPROACH

Present recipes in a modernist bread cookbook style with the following structure:

1. **Recipe Title**: Creative but descriptive title
2. **Introduction**: Brief paragraph describing the bread's characteristics, flavor profile, and cultural context
3. **Yield**: Number of loaves/rolls and approximate weight
4. **Time Requirements**: Active time and total time including fermentation
5. **Equipment Needed**: Essential tools required
6. **Difficulty Level**: Clearly indicate beginning, intermediate, or advanced
7. **Ingredients**:
   - List in grams with baker's percentages in parentheses
   - Always include the appropriate starter from our collection (specified in parentheses, e.g., "100g mature sourdough starter (Koji Starter)")
8. **Process**:
   - Clear, sequential steps with precise timing
   - Temperature specifications where critical
   - Visual/tactile cues for fermentation markers
9. **Special Techniques**: Detailed explanations for any specialized techniques
10. **Tips**: Two specific expert tips at the end of each recipe that enhance results or offer variations

## SKILL LEVEL ADAPTATION

Adjust recipe complexity based on the user's skill level:

- **Beginner**: Emphasize reliable techniques, fewer variables, clear visual indicators, and forgiving timelines. Suggest House Blend or San Francisco starters for reliability.
- **Intermediate**: Introduce more nuanced techniques, timing variations, and flavor development strategies. Explore ingredient combinations and pre-ferments.
- **Advanced**: Incorporate complex fermentation schedules, lamination techniques, specialized flours, and challenging dough management. Suggest experimental applications of our specialty starters.

## BREAD DIVERSITY

Create recipes across the full spectrum of bread styles, including but not limited to:
- Sourdough country loaves
- Enriched breads (brioche, challah, etc.)
- Flatbreads (focaccia, pita, etc.)
- Sandwich loaves
- Specialty breads (bagels, pretzels, etc.)
- Regional and global bread varieties
- Whole grain and ancient grain formulations
- Gluten-free alternatives when requested

## TECHNICAL PRECISION

Demonstrate technical expertise in these areas:
- Accurate hydration calculations
- Proper baker's percentages
- Temperature management
- Fermentation science
- Flour combination effects
- Starter influence on dough development

## ADAPTABILITY

Respond to specific user requests by:
- Adapting hydration levels for their environment
- Suggesting flour substitutions based on availability
- Offering scaling guidance for different batch sizes
- Proposing variation ideas for flavor experimentation
- Choosing the most appropriate starter based on the bread style

When the user doesn't specify a starter preference, select the most appropriate starter for their desired bread style and explain your reasoning.

Remember to always highlight which of our four signature starters (Koji, Kombucha, San Francisco, or House Blend) would be most appropriate for the recipe, and always include it in the ingredient list with the name in parentheses.
`;

// Response interface
interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Generate a sourdough recipe based on user preferences
 */
export async function generateRecipe(preferences: any): Promise<AIResponse> {
  try {
    // Create a descriptive prompt based on the preferences
    const preferencesText = JSON.stringify(preferences, null, 2);
    
    // Check the preferences to determine which starter to use
    let forcedStarter = "";
    let suggestedStarter = "";
    
    const description = preferences.description || "";
    const breadStyle = preferences.breadStyle || "";
    
    // First check for explicit starter requirements in the description
    // This overrides all other logic
    const upperDescription = description.toUpperCase();
    if (upperDescription.includes("KOJI STARTER")) {
      forcedStarter = "Koji Starter";
    } else if (upperDescription.includes("TRADITIONAL RYE STARTER")) {
      forcedStarter = "Traditional Rye Starter";
    } else if (upperDescription.includes("SAN FRANCISCO STARTER")) {
      forcedStarter = "San Francisco Starter";
    } else if (upperDescription.includes("HOUSE BLEND STARTER")) {
      forcedStarter = "House Blend Starter";
    }
    
    // If no forced starter, use the previous logic
    if (!forcedStarter) {
      // Get breadStyle from preferences if available
      const preferencesObj = preferences.preferences || {};
      const preferenceBreadStyle = preferencesObj.breadStyle || "";
      
      // Use either breadStyle direct property or from preferences object
      const effectiveBreadStyle = breadStyle || preferenceBreadStyle;
      
      if (effectiveBreadStyle.toLowerCase() === "enriched" || 
          effectiveBreadStyle.toLowerCase() === "brioche" ||
          description.toLowerCase().includes("japanese") || 
          description.toLowerCase().includes("koji") || 
          description.toLowerCase().includes("sweet") || 
          description.toLowerCase().includes("umami") || 
          description.toLowerCase().includes("milk bread")) {
        suggestedStarter = "Koji Starter";
      } else if (effectiveBreadStyle.toLowerCase() === "focaccia" ||
                 description.toLowerCase().includes("focaccia") ||
                 description.toLowerCase().includes("italian") ||
                 description.toLowerCase().includes("flat") ||
                 description.toLowerCase().includes("rye") || 
                 description.toLowerCase().includes("dense") || 
                 description.toLowerCase().includes("hearty") || 
                 description.toLowerCase().includes("earthy") ||
                 description.toLowerCase().includes("european")) {
        suggestedStarter = "Traditional Rye Starter";
      } else if (description.toLowerCase().includes("classic") || 
                 description.toLowerCase().includes("artisan") || 
                 description.toLowerCase().includes("tangy") || 
                 effectiveBreadStyle.toLowerCase() === "traditional" ||
                 effectiveBreadStyle.toLowerCase() === "baguette" ||
                 effectiveBreadStyle.toLowerCase() === "boule") {
        suggestedStarter = "San Francisco Starter";
      } else {
        suggestedStarter = "House Blend Starter";
      }
      
      console.log("Bread style selection:", { 
        breadStyle, 
        preferenceBreadStyle, 
        effectiveBreadStyle,
        selectedStarter: suggestedStarter 
      });
    }
    
    // Use the forced starter if present, otherwise use the suggested starter
    const selectedStarter = forcedStarter || suggestedStarter;
    
    console.log("OpenAI Service - Recipe Generator - selectedStarter:", selectedStarter);
    console.log("OpenAI Service - Recipe Generator - parameters:", JSON.stringify({
      ...preferences,
      forcedStarter, 
      suggestedStarter,
      selectedStarter
    }, null, 2));
    
    const userPrompt = `Create a detailed sourdough bread recipe based on these preferences:
      
${preferencesText}

MANDATORY REQUIREMENT: YOU MUST CREATE A RECIPE THAT USES OUR "${selectedStarter}" - DO NOT SUBSTITUTE THIS WITH ANY OTHER STARTER.

${selectedStarter === "Koji Starter" ? 
  "KOJI STARTER CHARACTERISTICS: Creates naturally sweet breads with complex umami notes. Ideal for Japanese-style breads, milk bread, and enriched doughs. Produces a tender, soft crumb with subtle fermentation." :
  selectedStarter === "Traditional Rye Starter" ? 
  "TRADITIONAL RYE STARTER CHARACTERISTICS: Creates bread with deep, earthy flavors and dense, hearty crumb. Cultivated with rye and wheat flours, produces classic European-style breads with complex flavor profiles and excellent keeping qualities." :
  selectedStarter === "San Francisco Starter" ?
  "SAN FRANCISCO STARTER CHARACTERISTICS: Creates traditional tangy sourdough profile with robust acidity. Perfect for classic artisan breads, baguettes, and rustic country loaves." :
  "HOUSE BLEND STARTER CHARACTERISTICS: Creates balanced, versatile flavor profile suitable for all bread styles. Offers mild tang and subtle complexity."}

THIS RECIPE MUST PROMINENTLY FEATURE THE "${selectedStarter}" AND MENTION IT BY NAME IN THE INGREDIENTS LIST AND DESCRIPTION.

Return your response in this JSON format:
{
  "name": "Name of the recipe",
  "description": "Brief description of the bread (mention the ${selectedStarter} by name)",
  "difficulty": "beginner|intermediate|advanced",
  "totalTime": "Total time including fermentation",
  "activeTime": "Active working time",
  "yield": "Number of loaves and approximate weight",
  "equipment": ["List of essential tools"],
  "ingredients": [
    {
      "name": "Ingredient name",
      "amount": numerical amount,
      "unit": "g for grams, etc.",
      "bakersPercentage": "xx%"
    }
  ],
  "process": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "bakingInstructions": {
    "temperature": "Temperature for baking",
    "time": "Total baking time",
    "notes": "Any special baking considerations"
  },
  "tips": [
    "Helpful tip 1",
    "Helpful tip 2"
  ],
  "starterUsed": "${selectedStarter}",
  "textureProfile": {
    "crustThickness": 1-10 value,
    "crumbOpenness": 1-10 value,
    "moisture": 1-10 value
  },
  "flavorProfile": [
    "dominant flavor note",
    "secondary flavor note"
  ]
}`;

    // Add a timestamp to ensure uniqueness of each request
    const timestamp = new Date().toISOString();
    const uniquenessPrompt = `Generate a unique recipe at timestamp: ${timestamp}. Use creative variations to ensure this recipe is different from previous ones.`;
    
    // Make the API call with the Bakehouse Breads recipe generator instructions
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: `${RECIPE_GENERATOR_INSTRUCTIONS}` },
        { role: "user", content: userPrompt },
        { role: "user", content: uniquenessPrompt }
      ],
      temperature: 0.9, // Increased temperature for more creativity
      response_format: { type: "json_object" }
    });

    // Extract and parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI service");
    }

    const recipeData = JSON.parse(content);
    
    return {
      success: true,
      data: recipeData
    };
  } catch (error: any) {
    console.error("Recipe Generation Error:", error);
    return {
      success: false,
      error: error.message || "Unknown error in recipe generation"
    };
  }
}

/**
 * Analyze a recipe for sourdough optimization
 */
export async function analyzeRecipe(recipe: any): Promise<AIResponse> {
  try {
    const recipeText = JSON.stringify(recipe, null, 2);
    
    const userPrompt = `
      Analyze this sourdough recipe and provide expert feedback on improving it:
      
      ${recipeText}
      
      Return your analysis in this JSON format:
      {
        "summary": "Brief overview of the recipe",
        "strengths": ["List of strong points in the recipe"],
        "improvements": ["Suggestions for improvements"],
        "textureAnalysis": "Analysis of the expected texture based on ingredient ratios",
        "flavorAnalysis": "Analysis of the expected flavor profile",
        "technicalRating": number from 1-10 rating the technical correctness,
        "recommendations": ["Specific, actionable recommendations to improve the recipe"]
      }
    `;
    
    // Make the API call with custom instructions in the system message
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: `${CUSTOM_INSTRUCTIONS}` },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    // Extract and parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI service");
    }

    const analysisData = JSON.parse(content);
    
    return {
      success: true,
      data: analysisData
    };
  } catch (error: any) {
    console.error("Recipe Analysis Error:", error);
    return {
      success: false,
      error: error.message || "Unknown error in recipe analysis"
    };
  }
}

/**
 * Adjust fermentation times based on room temperature
 * @param stages Object containing the baking stages with time estimates
 * @param roomTemperature The current room temperature in Fahrenheit (°F)
 * @returns Adjusted time estimates for each stage
 */
export async function adjustFermentationTimes(stages: any, roomTemperature: number): Promise<AIResponse> {
  try {
    // Format stages for the API call
    const stagesStr = JSON.stringify(stages, null, 2);
    
    const userPrompt = `
      I need to adjust my bread fermentation times based on room temperature.
      
      The standard fermentation times (at 75°F / 24°C) for my recipe are:
      ${stagesStr}
      
      My current room temperature is ${roomTemperature}°F.
      
      Provide adjusted times for each stage based on the current temperature. 
      If the temperature is colder than standard, fermentation will take longer.
      If the temperature is warmer than standard, fermentation will be faster.
      
      For every 10°F decrease in temperature, fermentation generally takes about 1.5-2x longer.
      For every 10°F increase in temperature, fermentation is generally about 1.5-2x faster.
      
      Return your analysis in this JSON format:
      {
        "adjustedStages": {
          "levenBuild": { "hours": number, "minutes": number, "refrigerated": boolean },
          "autolyse": { "hours": number, "minutes": number, "refrigerated": boolean },
          "bulk": { "hours": number, "minutes": number, "refrigerated": boolean },
          "proof": { "hours": number, "minutes": number, "refrigerated": boolean },
          "bake": { "hours": number, "minutes": number }
        },
        "temperatureImpact": "Brief explanation of how the temperature affects fermentation",
        "fermentationFactor": number (the multiplier applied to standard times),
        "recommendations": ["Optional recommendations for handling the dough at this temperature"]
      }
    `;
    
    // Make the API call with custom instructions in the system message
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: `${CUSTOM_INSTRUCTIONS}` },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    // Extract and parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI service");
    }

    const adjustedTimes = JSON.parse(content);
    
    return {
      success: true,
      data: adjustedTimes
    };
  } catch (error: any) {
    console.error("Temperature Adjustment Error:", error);
    return {
      success: false,
      error: error.message || "Error adjusting fermentation times"
    };
  }
}

export async function generateFaqs(category: string, count: number = 5): Promise<AIResponse> {
  try {
    const userPrompt = `
      Generate ${count} frequently asked questions and detailed answers about sourdough baking related to: "${category}"
      
      Return the FAQs in this JSON format:
      [
        {
          "question": "Specific question about sourdough baking",
          "answer": "Detailed, helpful answer to the question",
          "category": "${category}"
        }
      ]
    `;
    
    // Make the API call with custom instructions in the system message
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: `${CUSTOM_INSTRUCTIONS}` },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Extract and parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI service");
    }

    const faqsData = JSON.parse(content);
    
    return {
      success: true,
      data: faqsData
    };
  } catch (error: any) {
    console.error("FAQ Generation Error:", error);
    return {
      success: false,
      error: error.message || "Unknown error in FAQ generation"
    };
  }
}

/**
 * Generate a blog post about a sourdough baking topic
 */
export async function generateBlogPost(topic: string): Promise<AIResponse> {
  try {
    const userPrompt = `
      Write a comprehensive blog post about sourdough baking focused on: "${topic}"
      
      Return the blog post in this JSON format:
      {
        "title": "Engaging title for the blog post",
        "slug": "url-friendly-slug-for-the-post",
        "summary": "Brief summary of the post content",
        "content": "Full blog post content with markdown formatting",
        "tags": ["relevant", "topic", "tags"],
        "estimatedReadTime": "Estimated reading time in minutes",
        "relatedTopics": ["Related topic 1", "Related topic 2"]
      }
    `;
    
    // Make the API call with custom instructions in the system message
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: `${CUSTOM_INSTRUCTIONS}` },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Extract and parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI service");
    }

    const blogData = JSON.parse(content);
    
    return {
      success: true,
      data: blogData
    };
  } catch (error: any) {
    console.error("Blog Post Generation Error:", error);
    return {
      success: false,
      error: error.message || "Unknown error in blog post generation"
    };
  }
}

/**
 * Test connection to the AI service
 */
export async function testConnection(): Promise<AIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello" }
      ]
    });
    
    return {
      success: true,
      data: {
        message: "API connection successful",
        details: response
      }
    };
  } catch (error: any) {
    console.error("API Connection Test Error:", error);
    return {
      success: false,
      error: error.message || "Unknown error in API connection test"
    };
  }
}