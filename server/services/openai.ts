import OpenAI from "openai";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes a recipe using OpenAI's GPT model and provides improvement suggestions
 * @param recipeText The full text of the recipe to analyze
 * @param recipeName Optional name of the recipe for more context
 * @returns Analysis result including extracted recipe, analysis, and suggestions
 */
export async function analyzeRecipe(recipeText: string, recipeName?: string) {
  try {
    // Ensure we have an API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    console.log(`Analyzing recipe${recipeName ? ` "${recipeName}"` : ''} with OpenAI`);

    // Create a prompt that instructs the model to analyze the recipe
    const prompt = `
You are an expert sourdough bread baker and food scientist. Analyze the following sourdough recipe thoroughly and provide detailed feedback:

${recipeName ? `Recipe Name: ${recipeName}\n\n` : ''}
${recipeText}

Provide your analysis in the following JSON format:
{
  "extractedRecipe": {
    "ingredients": [
      {"name": "ingredient name", "amount": "numerical amount", "unit": "unit of measurement"}
    ],
    "instructions": ["step 1", "step 2", "etc."]
  },
  "analysis": {
    "hydration": "detailed assessment of the recipe's hydration level and how it impacts the bread",
    "fermentationApproach": "analysis of the fermentation method and timing",
    "technique": "assessment of the techniques used (folding, shaping, etc.)",
    "overallAssessment": "comprehensive evaluation of the recipe's strengths and potential issues"
  },
  "suggestions": {
    "hydration": "specific suggestions to improve hydration if needed",
    "fermentation": "recommendations for optimizing fermentation",
    "technique": "advice on improving techniques used",
    "ingredients": "suggestions related to ingredients or proportions",
    "general": "overall recommendations to enhance the recipe"
  }
}

Important:
- Accurately extract ingredient amounts and units
- All fields must return text strings, not numbers
- Ensure your analysis is thorough and educational
- Focus on sourdough bread specific techniques and science
- For hydration, calculate water-to-flour ratio if possible
- If you can't extract a structured recipe, provide empty arrays but still complete the analysis sections
`;

    // Call the OpenAI API for analysis
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert sourdough bread baker and food scientist." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }, 
    });

    // Extract the response content
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Received empty response from OpenAI");
    }

    // Parse the JSON response
    try {
      const analysisResult = JSON.parse(content);
      
      // Ensure we have all required fields or provide minimal defaults
      if (!analysisResult.analysis) {
        console.warn("Analysis result is missing analysis field, providing defaults");
        analysisResult.analysis = {
          overallAssessment: "Unable to generate a comprehensive assessment.",
          hydration: "Hydration analysis not available.",
          fermentationApproach: "Fermentation analysis not available.",
          technique: "Technique analysis not available."
        };
      }
      
      if (!analysisResult.suggestions) {
        console.warn("Analysis result is missing suggestions field, providing defaults");
        analysisResult.suggestions = {
          hydration: "No specific hydration suggestions available.",
          fermentation: "No specific fermentation suggestions available.",
          technique: "No specific technique suggestions available.",
          ingredients: "No specific ingredient suggestions available.",
          general: "No general suggestions available."
        };
      }
      
      if (!analysisResult.extractedRecipe) {
        console.warn("Analysis result is missing extractedRecipe field, providing empty structure");
        analysisResult.extractedRecipe = {
          ingredients: [],
          instructions: []
        };
      }
      
      return analysisResult;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Failed to parse analysis result");
    }
  } catch (error) {
    console.error("Error in recipe analysis:", error);
    throw error;
  }
}