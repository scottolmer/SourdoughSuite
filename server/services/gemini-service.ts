// Gemini Service for Google AI integration
// This service handles all Gemini-related API calls

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Use environment variables for the API key
const API_KEY = process.env.GEMINI_API_KEY;

// Default model (Gemini 2.5 Flash)
const DEFAULT_MODEL = "gemini-2.5-flash-preview-05-20";

// Initialize the GoogleGenerativeAI with the API key
const genAI = new GoogleGenerativeAI(API_KEY || '');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE_PATH = path.join(__dirname, '../../data/ai-settings.json');

// Import AI settings functions
async function getAISettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading AI settings:', error);
  }
  return null;
}

interface RequestOptions {
  messages: Array<{role: string, content: string}>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: {type: string};
}

interface AIServiceResponse {
  success: boolean;
  response?: string;
  data?: any;
  error?: string;
}

/**
 * Get AI prompt template from admin settings
 */
async function getPromptTemplate(usage: string): Promise<string | null> {
  try {
    console.log("🔍 Looking for AI settings file at:", SETTINGS_FILE_PATH);
    console.log("🔍 File exists:", fs.existsSync(SETTINGS_FILE_PATH));
    
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
      console.log("🔍 Settings file read, length:", data.length);
      
      const settings = JSON.parse(data);
      console.log("🔍 Prompts array length:", settings.prompts?.length || 0);
      console.log("🔍 Looking for usage:", usage);
      
      if (settings.prompts) {
        settings.prompts.forEach((p: any, index: number) => {
          console.log(`🔍 Prompt ${index}: usage='${p.usage}', template length=${p.template?.length || 0}`);
        });
      }
      
      const prompt = settings.prompts?.find((p: any) => p.usage === usage);
      console.log("🔍 Found matching prompt:", prompt ? "YES" : "NO");
      
      if (prompt) {
        console.log("🔍 Template length:", prompt.template?.length || 0);
        return prompt.template || null;
      }
    }
  } catch (error) {
    console.error('❌ Error reading AI settings for prompt template:', error);
  }
  return null;
}

/**
 * Make a request to the Google Gemini API
 */
export async function makeAIRequest(options: RequestOptions): Promise<AIServiceResponse> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      return {
        success: false,
        error: "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable."
      };
    }

    // Ensure required parameters are present
    const modelName = options.model || DEFAULT_MODEL;
    
    // Format messages for Gemini API
    // Gemini expects a different format than OpenAI
    // For system messages, Gemini doesn't have a direct equivalent, so we'll prepend them to the first user message
    
    // Get the system message if it exists (usually the first one)
    const systemMessage = options.messages.find(m => m.role === "system");
    
    // Filter to only user and assistant messages
    let geminiMessages: any[] = [];
    
    // Convert OpenAI-style messages to Gemini format
    options.messages.forEach((message, index) => {
      if (message.role === "user") {
        // For user messages, create a new content part
        geminiMessages.push({
          role: "user",
          parts: [{ text: message.content }]
        });
      } else if (message.role === "assistant") {
        // For assistant messages
        geminiMessages.push({
          role: "model",
          parts: [{ text: message.content }]
        });
      }
      // System messages are handled separately
    });
    
    // Get the model
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    // Get the multi-agent coordinator instructions from AI settings
    let coordinatorInstructions = '';
    try {
      const settings = await getAISettings();
      const multiAgentPrompt = settings.prompts?.find((p: any) => p.id === 'multi-agent-coordinator');
      if (multiAgentPrompt && multiAgentPrompt.template) {
        coordinatorInstructions = multiAgentPrompt.template.replace('{{userMessage}}', '');
      }
    } catch (error) {
      console.log('Using fallback coordinator instructions');
    }
    
    // If the system message exists, combine it with coordinator instructions and prepend to first user message
    if (geminiMessages.length > 0 && geminiMessages[0].role === "user") {
      let combinedInstructions = '';
      if (coordinatorInstructions) {
        combinedInstructions = coordinatorInstructions;
      } else if (systemMessage) {
        combinedInstructions = systemMessage.content;
      }
      
      if (combinedInstructions) {
        geminiMessages[0].parts[0].text = `${combinedInstructions}\n\nUser Query: ${geminiMessages[0].parts[0].text}`;
      }
    }
    
    console.log(`Making Gemini API request using model ${modelName}`);
    
    // Create chat session
    const chat = model.startChat({
      history: geminiMessages.length > 1 ? geminiMessages.slice(0, -1) : [],
    });
    
    // Get response (use last message as the prompt)
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;
    
    // Format response to match expected structure from OpenAI
    const responseData = {
      choices: [
        {
          message: {
            role: "assistant",
            content: response.text(),
          },
          finish_reason: "stop",
        },
      ],
      model: modelName,
    };
    
    return {
      success: true,
      response: response.text(),
      data: responseData,
    };
  } catch (error) {
    console.error("Gemini Service Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in Gemini service",
    };
  }
}

/**
 * Test connection to the Gemini AI service
 */
export async function testConnection(): Promise<AIServiceResponse> {
  try {
    const result = await makeAIRequest({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello" },
      ],
    });
    
    if (!result.success) {
      return result;
    }
    
    return {
      success: true,
      data: {
        message: "API connection successful",
        details: result.data,
      },
    };
  } catch (error) {
    console.error("Gemini API Connection Test Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in API connection test",
    };
  }
}

// Export all the same functions as ai-service.ts but using the Gemini implementation

/**
 * Generate a sourdough recipe based on user preferences
 */
export async function generateRecipe(preferences: any): Promise<AIServiceResponse> {
  try {
    // Get custom prompt template from admin settings
    const promptTemplate = await getPromptTemplate('recipe-generator');
    
    let systemPrompt = `You are the COORDINATOR AGENT for Bakehouse Breads AI, a multi-agent baking and cooking assistant. Your mission is to receive user queries and deliver informed, diverse guidance by orchestrating a panel of expert agents, each with unique backgrounds, philosophies, and knowledge domains.

COORDINATOR AGENT INSTRUCTIONS:
• Analyze the user's question, breaking it down into specific sub-questions if needed.
• Assign each sub-question to relevant experts, ensuring the full panel is consulted.
• Collect all responses, ensuring every expert addresses the question from their own perspective.
• Display each answer, clearly labeled by expert, and include:
  – The expert's advice or recipe
  – Their self-assessed confidence score (1–10)
  – A brief justification for their confidence
• Do not combine answers; never merge perspectives—show each expert's answer independently.
• If relevant, allow experts to briefly reference or contrast other experts' viewpoints.
• If the question is unclear or missing details, ask the user to clarify.
• Adapt language and technicality to the user's skill level if stated.
• Be thorough but concise; never invent facts.

EXPERT AGENTS:
1. THE CLASSIC BAKER - Traditionalist rooted in time-honored recipes and regional baking.
2. PASTRY PERFECTIONIST - Champion of precision, finesse, and aesthetics—pastry, viennoiserie, desserts.
3. THE SCIENCE GEEK - Food scientist passionate about baking chemistry, process optimization, troubleshooting.
4. RUSTIC ARTISAN - Lover of hearty, slow-crafted, farm-to-table breads and comfort bakes.
5. ADVENTUROUS CHEF - Culinary explorer thriving on fusion, bold flavors, unconventional methods.
6. MODERNIST MAVEN - Technophile obsessed with innovation, science, and food tech.
7. HERITAGE HISTORIAN - Culinary scholar specializing in historical recipes and global baking traditions.
8. DIETARY SPECIALIST - Expert in alternative diets, allergen-friendly baking, and nutrition.

PRESENTATION FORMAT:
For every user query, present:

[EXPERT NAME]:
Answer: [Expert's advice, step-by-step or with reasoning]
Confidence Score: [X]/10
Reason: [Why the expert feels this way]

Repeat for all eight experts.`;
    let userPrompt;
    
    console.log("Prompt template loaded:", promptTemplate ? "YES" : "NO");
    console.log("Template length:", promptTemplate ? promptTemplate.length : 0);
    
    if (promptTemplate) {
      console.log("Using custom prompt template from admin settings");
      // Replace the placeholder with actual preferences
      const preferencesText = JSON.stringify(preferences, null, 2);
      userPrompt = promptTemplate.replace('{{preferences}}', preferencesText);
      
      // Extract system prompt if the template starts with one
      const firstLineBreak = userPrompt.indexOf('\n\n');
      if (firstLineBreak > 0) {
        const firstLine = userPrompt.substring(0, firstLineBreak);
        if (firstLine.includes("You are") || firstLine.includes("expert")) {
          systemPrompt = firstLine;
          userPrompt = userPrompt.substring(firstLineBreak + 2);
        }
      }
    } else {
      console.log("⚠️ Using fallback prompt - custom template not found");
      // Fallback prompt with variation encouragement
      const preferencesText = JSON.stringify(preferences, null, 2);
      userPrompt = `Generate a recipe based on this request: "${preferences.description}"

Requirements:
- Create exactly what the user requested (not sourdough unless specifically asked)
- Use precise measurements and detailed instructions
- Make it appropriate for ${preferences.difficulty} level
- Return ONLY the JSON object, no other text

Preferences: ${preferencesText}

IMPORTANT: Start your response with { and end with }. No explanations or markdown.`;
    }
    
    console.log("Generating recipe with preferences:", JSON.stringify(preferences, null, 2));
    
    const finalPrompt = userPrompt;
    
    // Make the AI request
    const result = await makeAIRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: finalPrompt }
      ],
      temperature: 0.9
      // Note: Gemini doesn't have a built-in JSON mode like OpenAI
    });
    
    if (!result.success) {
      return result;
    }
    
    // Parse the JSON content from the response
    const content = result.data.choices[0].message.content;
    console.log("Raw AI response:", content.substring(0, 200) + "...");
    
    // Try to extract JSON from the response (Gemini often wraps JSON in markdown)
    let jsonContent = content;
    
    // Remove markdown code blocks if present
    if (content.includes('```json')) {
      const jsonStart = content.indexOf('```json') + 7;
      const jsonEnd = content.indexOf('```', jsonStart);
      if (jsonEnd > jsonStart) {
        jsonContent = content.substring(jsonStart, jsonEnd).trim();
      }
    } else if (content.includes('```')) {
      const jsonStart = content.indexOf('```') + 3;
      const jsonEnd = content.indexOf('```', jsonStart);
      if (jsonEnd > jsonStart) {
        jsonContent = content.substring(jsonStart, jsonEnd).trim();
      }
    } else {
      // Try to extract JSON by finding the first { and last }
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      
      if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
        jsonContent = content.substring(jsonStart, jsonEnd + 1);
      }
    }
    
    let recipeData;
    try {
      recipeData = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", e);
      console.error("Extracted content:", jsonContent.substring(0, 500));
      
      // Try with OpenAI as fallback for better JSON compliance
      console.log("Attempting recipe generation with OpenAI fallback...");
      try {
        const { generateRecipe: openAIGenerateRecipe } = await import('./ai-service');
        const openAIResult = await openAIGenerateRecipe(preferences);
        if (openAIResult.success) {
          console.log("OpenAI fallback successful");
          return openAIResult;
        }
      } catch (fallbackError) {
        console.error("OpenAI fallback also failed:", fallbackError);
      }
      
      return {
        success: false,
        error: "AI service returned invalid response format. Please try again."
      };
    }
    
    // Log the raw recipe data but don't modify it
    console.log("Using raw LLM response without modifications.");
    
    // Add minimal handling for missing fields to prevent UI errors
    if (!recipeData.name && recipeData.title) {
      recipeData.name = recipeData.title;
    }
    
    if (!recipeData.name && !recipeData.title) {
      recipeData.name = "Sourdough Bread Recipe";
    }
    
    // Ensure we have a description field
    if (!recipeData.description && recipeData.introduction) {
      recipeData.description = recipeData.introduction;
    }
    
    if (!recipeData.description && !recipeData.introduction) {
      recipeData.description = "A sourdough bread recipe.";
    }
    
    return {
      success: true,
      data: recipeData
    };
  } catch (error) {
    console.error("Recipe Generation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in recipe generation"
    };
  }
}

/**
 * Generate a blog post about a sourdough baking topic
 */
export async function generateBlogPost(topic: string): Promise<AIServiceResponse> {
  try {
    const systemPrompt = "You are a professional food writer specializing in sourdough and artisan bread baking.";
    const userPrompt = `
      Write a comprehensive blog post about this sourdough baking topic:
      
      "${topic}"
      
      Return the blog post in this JSON format:
      {
        "title": "Engaging blog post title",
        "slug": "url-friendly-version-of-title",
        "content": "Full blog post content with markdown formatting, at least 800 words",
        "excerpt": "Brief 1-2 sentence summary to display in previews",
        "coverImage": "descriptive image suggestion",
        "tags": ["Related topic tags"]
      }
    `;
    
    const result = await makeAIRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8
    });
    
    if (!result.success) {
      return result;
    }
    
    // Parse the JSON content from the response
    const content = result.data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let jsonContent = content;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
      jsonContent = content.substring(jsonStart, jsonEnd + 1);
    }
    
    let blogData;
    try {
      blogData = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", e);
      return {
        success: false,
        error: "Failed to parse JSON from AI response"
      };
    }
    
    // Create slug if not provided
    if (!blogData.slug) {
      blogData.slug = blogData.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    }
    
    return {
      success: true,
      data: blogData
    };
  } catch (error) {
    console.error("Blog Post Generation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in blog post generation"
    };
  }
}

/**
 * Generate FAQs about a sourdough baking category
 */
export async function generateFaqs(category: string, count: number = 5): Promise<AIServiceResponse> {
  try {
    const systemPrompt = "You are a sourdough baking expert helping to create an educational website.";
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
    
    const result = await makeAIRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });
    
    if (!result.success) {
      return result;
    }
    
    // Parse the JSON content from the response
    const content = result.data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let jsonContent = content;
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');
    
    if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
      jsonContent = content.substring(jsonStart, jsonEnd + 1);
    }
    
    let faqsData;
    try {
      faqsData = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", e);
      return {
        success: false,
        error: "Failed to parse JSON from AI response"
      };
    }
    
    return {
      success: true,
      data: faqsData
    };
  } catch (error) {
    console.error("FAQ Generation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in FAQ generation"
    };
  }
}

/**
 * Analyze a recipe for sourdough optimization
 */
export async function analyzeRecipe(recipe: any): Promise<AIServiceResponse> {
  try {
    const systemPrompt = "You are a professional sourdough baker and recipe analyst.";
    const userPrompt = `
      Analyze this sourdough recipe and provide expert feedback on improving it:
      
      ${JSON.stringify(recipe, null, 2)}
      
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
    
    const result = await makeAIRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5
    });
    
    if (!result.success) {
      return result;
    }
    
    // Parse the JSON content from the response
    const content = result.data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let jsonContent = content;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
      jsonContent = content.substring(jsonStart, jsonEnd + 1);
    }
    
    let analysisData;
    try {
      analysisData = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", e);
      return {
        success: false,
        error: "Failed to parse JSON from AI response"
      };
    }
    
    return {
      success: true,
      data: analysisData
    };
  } catch (error) {
    console.error("Recipe Analysis Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in recipe analysis"
    };
  }
}

/**
 * Recommend a sourdough starter based on user quiz answers
 */
export async function recommendStarter(quizData: any): Promise<AIServiceResponse> {
  try {
    // Use default starter quiz template
    const promptTemplate = "You are a sourdough starter expert helping customers find their perfect starter culture match.\n\nBased on these user preferences and available starter options, recommend the best matching sourdough starter:\n\n{{quizData}}\n\nAnalyze their preferences for flavor, baking frequency, experience level, and environment to find the best match.\n\nReturn your recommendation in this JSON format:\n{\n  \"primaryMatch\": \"starter-id-from-availableStarters\",\n  \"matchScore\": number from 85-98 representing confidence in the match,\n  \"secondaryMatches\": [\"array-of-2-other-starter-ids-that-are-good-matches\"],\n  \"rationale\": {\n    \"flavor\": number from 70-95 representing flavor match score,\n    \"maintenance\": number from 70-95 representing maintenance match score,\n    \"style\": number from 70-95 representing bread style match score,\n    \"experience\": number from 70-95 representing experience level match score\n  }\n}";
    
    // Replace the placeholder with actual quiz data
    let processedPrompt = promptTemplate.replace('{{quizData}}', JSON.stringify(quizData, null, 2));
    
    // Split out system and user prompts
    let systemPrompt = "You are a sourdough starter expert helping customers find their perfect starter culture match.";
    let userPrompt = processedPrompt;
    
    // Check if prompt starts with a system instruction
    const firstLineBreak = processedPrompt.indexOf('\n\n');
    if (firstLineBreak > 0) {
      const firstLine = processedPrompt.substring(0, firstLineBreak);
      if (firstLine.includes("You are") || firstLine.includes("expert")) {
        systemPrompt = firstLine;
        userPrompt = processedPrompt.substring(firstLineBreak + 2);
      }
    }
    
    // Make the AI request
    const aiResponse = await makeAIRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4
    });
    
    if (!aiResponse.success) {
      return aiResponse;
    }
    
    // Parse the JSON content from the response
    const content = aiResponse.data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let jsonContent = content;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
      jsonContent = content.substring(jsonStart, jsonEnd + 1);
    }
    
    let recommendationData;
    try {
      recommendationData = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", e);
      return {
        success: false,
        error: "Failed to parse JSON from AI response"
      };
    }
    
    return {
      success: true,
      data: recommendationData
    };
  } catch (error) {
    console.error("Starter Recommendation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in starter recommendation"
    };
  }
}

/**
 * Generate an optimized baking timeline based on user constraints and recipe requirements
 */
export async function generateBakingTimeline(timelineData: any): Promise<AIServiceResponse> {
  try {
    const systemPrompt = "You are a professional baker specializing in sourdough bread timing optimization.";
    const userPrompt = `
      Generate an optimized baking schedule for this sourdough recipe based on the user's time constraints:
      
      ${JSON.stringify(timelineData, null, 2)}
      
      Create a step-by-step timeline that fits the user's available time slots and ensures optimal fermentation.
      
      Return your schedule in this JSON format:
      {
        "scheduleName": "Name for this baking schedule",
        "totalTime": "Total time from start to finish",
        "activeTime": "Time requiring active work",
        "difficulty": "easy|medium|advanced",
        "steps": [
          {
            "stepNumber": 1,
            "name": "Step name",
            "description": "Detailed instructions",
            "startTime": "Day and time (e.g., 'Friday 6:00 PM')",
            "duration": "Duration in minutes or hours",
            "isActive": true/false depending on if this step requires active attention
          }
        ],
        "notes": ["Important notes about the schedule"]
      }
    `;
    
    const result = await makeAIRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3
    });
    
    if (!result.success) {
      return result;
    }
    
    // Parse the JSON content from the response
    const content = result.data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let jsonContent = content;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
      jsonContent = content.substring(jsonStart, jsonEnd + 1);
    }
    
    let timelineResult;
    try {
      timelineResult = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", e);
      return {
        success: false,
        error: "Failed to parse JSON from AI response"
      };
    }
    
    // Validate schedule structure
    if (!timelineResult.steps || !Array.isArray(timelineResult.steps)) {
      return {
        success: false,
        error: "Invalid timeline format: missing steps array"
      };
    }
    
    return {
      success: true,
      data: timelineResult
    };
  } catch (error) {
    console.error("Baking Timeline Generation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in baking timeline generation"
    };
  }
}

/**
 * Suggest ingredient substitutions for sourdough recipes
 */
export async function suggestSubstitutions(substitutionRequest: any): Promise<AIServiceResponse> {
  try {
    // Get custom prompt template from admin settings
    const customPromptTemplate = await getPromptTemplate('ingredient-substitution');
    
    let processedPrompt;
    if (customPromptTemplate) {
      // Replace the placeholder with actual substitution request data
      processedPrompt = customPromptTemplate.replace('{{substitutionRequest}}', JSON.stringify(substitutionRequest, null, 2));
    } else {
      // Fallback prompt if no custom template found
      processedPrompt = `You are an expert sourdough baker specializing in ingredient substitutions and recipe adaptations. Help bakers find suitable alternatives for ingredients they don't have or can't use.

Analyze this substitution request:

${JSON.stringify(substitutionRequest, null, 2)}

Provide practical, tested substitution suggestions that maintain the integrity of the sourdough recipe. Consider hydration levels, fermentation impact, flavor changes, and texture modifications.

Return your recommendations in this JSON format:
{
  "primarySubstitutions": [
    {
      "original": "ingredient being replaced",
      "substitute": "recommended replacement",
      "ratio": "1:1 or specific conversion ratio",
      "adjustments": "any other recipe modifications needed",
      "impact": "how this affects flavor, texture, or process"
    }
  ],
  "alternativeOptions": [
    {
      "substitute": "alternative replacement option",
      "ratio": "conversion ratio",
      "notes": "when to use this option"
    }
  ],
  "warnings": ["important considerations or limitations"],
  "tips": ["professional tips for best results with substitutions"]
}`;
    }
    
    // Split out system and user prompts
    let systemPrompt = "You are an expert sourdough baker specializing in ingredient substitutions and recipe adaptations.";
    let userPrompt = processedPrompt;
    
    // Check if prompt starts with a system instruction
    const firstLineBreak = processedPrompt.indexOf('\n\n');
    if (firstLineBreak > 0) {
      const firstLine = processedPrompt.substring(0, firstLineBreak);
      if (firstLine.includes("You are") || firstLine.includes("expert")) {
        systemPrompt = firstLine;
        userPrompt = processedPrompt.substring(firstLineBreak + 2);
      }
    }
    
    const result = await makeAIRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6
    });
    
    if (!result.success) {
      return result;
    }
    
    // Parse the JSON content from the response
    const content = result.data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let jsonContent = content;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
      jsonContent = content.substring(jsonStart, jsonEnd + 1);
    }
    
    let substitutionData;
    try {
      substitutionData = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", e);
      return {
        success: false,
        error: "Failed to parse JSON from AI response"
      };
    }
    
    return {
      success: true,
      data: substitutionData
    };
  } catch (error) {
    console.error("Ingredient Substitution Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in ingredient substitution"
    };
  }
}

/**
 * Troubleshoot baking problems and provide solutions
 */
export async function troubleshootBaking(problemDescription: any): Promise<AIServiceResponse> {
  try {
    // Get custom prompt template from admin settings
    const customPromptTemplate = await getPromptTemplate('baking-troubleshooter');
    
    let processedPrompt;
    if (customPromptTemplate) {
      // Replace the placeholder with actual problem description
      processedPrompt = customPromptTemplate.replace('{{problemDescription}}', JSON.stringify(problemDescription, null, 2));
    } else {
      // Fallback prompt if no custom template found
      processedPrompt = `You are an expert sourdough troubleshooter with decades of professional baking experience. Help diagnose and solve sourdough baking problems with practical, actionable solutions.

Analyze this baking issue:

${JSON.stringify(problemDescription, null, 2)}

Provide a comprehensive diagnosis and step-by-step solutions. Consider all factors: starter health, fermentation, environmental conditions, technique, timing, and ingredients.

Return your diagnosis in this JSON format:
{
  "diagnosis": {
    "primaryCause": "most likely cause of the problem",
    "contributingFactors": ["other factors that may be involved"],
    "severity": "minor|moderate|major"
  },
  "solutions": {
    "immediate": ["steps to fix current batch if possible"],
    "nextBake": ["adjustments for the next baking session"],
    "longTerm": ["process improvements for consistent results"]
  },
  "prevention": ["how to avoid this problem in the future"],
  "commonMistakes": ["related mistakes that often cause this issue"],
  "expertTips": ["professional techniques to improve results"],
  "additionalQuestions": ["questions to ask for more specific diagnosis if needed"]
}`;
    }
    
    // Split out system and user prompts
    let systemPrompt = "You are an expert sourdough troubleshooter with decades of professional baking experience.";
    let userPrompt = processedPrompt;
    
    // Check if prompt starts with a system instruction
    const firstLineBreak = processedPrompt.indexOf('\n\n');
    if (firstLineBreak > 0) {
      const firstLine = processedPrompt.substring(0, firstLineBreak);
      if (firstLine.includes("You are") || firstLine.includes("expert")) {
        systemPrompt = firstLine;
        userPrompt = processedPrompt.substring(firstLineBreak + 2);
      }
    }
    
    const result = await makeAIRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5
    });
    
    if (!result.success) {
      return result;
    }
    
    // Parse the JSON content from the response
    const content = result.data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let jsonContent = content;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
      jsonContent = content.substring(jsonStart, jsonEnd + 1);
    }
    
    let troubleshootingData;
    try {
      troubleshootingData = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", e);
      return {
        success: false,
        error: "Failed to parse JSON from AI response"
      };
    }
    
    return {
      success: true,
      data: troubleshootingData
    };
  } catch (error) {
    console.error("Baking Troubleshooting Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in baking troubleshooting"
    };
  }
}