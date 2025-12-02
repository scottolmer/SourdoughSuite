import { Express } from "express";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rate-limit";
import logger from "../config/logger";
import * as aiService from "../services/ai-service-switcher";
import { analyzeRecipeWithO3, generatePersonalizedRecipe, generateStarterTroubleshootingAdvice } from "../services/openai-o3-service";
import * as openAIService from "../services/openai-service";
import * as geminiService from "../services/gemini-service";
import { AIWrapperEngine } from "../services/ai-wrapper-engine";
import { AIContentGenerator } from "../services/ai-content-generator";
import { recipeScraper } from "../services/recipe-scraper";
import { generateAllStarterRecipes, generateRecipesForStarter, getRecipesForStarter } from "../services/starter-recipe-service";
import { textureProfileSchema, flavorProfileSchema } from "../../shared/types";
import { db } from "../db";
import { sourdoughStarters, aiGeneratedRecipes } from "../../shared/schema";
import { eq, and, or, ilike, desc, sql, type SQL } from "drizzle-orm";

/**
 * Register all AI-related routes
 * AI services including recipe generation, analysis, chat, troubleshooting, and consensus
 */
export function registerAIRoutes(app: Express) {

  /**
   * POST /api/ai/recommend-starter
   * AI-powered starter recommendation based on quiz data
   */
  app.post("/api/ai/recommend-starter", aiLimiter, async (req, res) => {
    try {
      const quizData = req.body;

      // Validate request has required data
      if (!quizData || !quizData.userPreferences || !quizData.availableStarters) {
        return errorResponse(res, "Invalid request format. Missing user preferences or available starters.", 400);
      }

      logger.info("Processing AI starter recommendation", {
        hasPreferences: !!quizData.userPreferences,
        starterCount: quizData.availableStarters?.length
      });

      // Call AI service to get recommendations
      const result = await aiService.recommendStarter(quizData);

      if (!result.success) {
        logger.error("AI starter recommendation failed", { error: result.error });
        return errorResponse(res, result.error || "Failed to get starter recommendation", 500);
      }

      logger.info("AI starter recommendation successful");
      return successResponse(res, result.data);
    } catch (error) {
      logger.error("Error recommending starter", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to process starter recommendation",
        500
      );
    }
  });

  /**
   * POST /api/ai/generate-timeline
   * AI-powered baking timeline generator
   */
  app.post("/api/ai/generate-timeline", aiLimiter, async (req, res) => {
    try {
      const timelineData = req.body;

      // Validate request has minimum required data
      if (!timelineData || !timelineData.targetCompletionTime || !timelineData.recipe) {
        return errorResponse(res, "Invalid request format. Missing required timeline parameters.", 400);
      }

      logger.info("Generating AI-optimized baking timeline", {
        hasRecipe: !!timelineData.recipe,
        targetTime: timelineData.targetCompletionTime
      });

      // Call AI service to generate optimized timeline
      const result = await aiService.generateBakingTimeline(timelineData);

      if (!result.success) {
        logger.error("AI timeline generation failed", { error: result.error });
        return errorResponse(res, result.error || "Failed to generate baking timeline", 500);
      }

      logger.info("Timeline generation successful");
      return successResponse(res, result.data);
    } catch (error) {
      logger.error("Error generating timeline", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to generate baking timeline",
        500
      );
    }
  });

  /**
   * POST /api/ai/analyze-recipe
   * AI-powered recipe analysis using OpenAI O3
   */
  app.post("/api/ai/analyze-recipe", aiLimiter, async (req, res) => {
    try {
      const recipeSchema = z.object({
        recipeId: z.number().optional(),
        recipeUrl: z.string().url().optional(),
        name: z.string().optional(),
        flourGrams: z.number().optional(),
        waterGrams: z.number().optional(),
        saltGrams: z.number().optional(),
        starterGrams: z.number().optional(),
        ingredients: z.array(z.string()).optional(),
        instructions: z.array(z.string()).optional(),
        textureProfile: textureProfileSchema.optional(),
        flavorProfile: flavorProfileSchema.optional(),
      });

      const recipeData = recipeSchema.parse(req.body);

      // Validate required fields for basic analysis
      if (!recipeData.name && !recipeData.recipeId && !recipeData.recipeUrl) {
        return errorResponse(res, "Missing required recipe data (name, recipeId, or recipeUrl)", 400);
      }

      // If a recipeId is provided, fetch the complete recipe from the database
      if (recipeData.recipeId) {
        const dbRecipe = await storage.getRecipeById(recipeData.recipeId);
        if (dbRecipe) {
          Object.assign(recipeData, {
            ...dbRecipe,
            ...recipeData
          });
        }
      }

      // Check for OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        return errorResponse(res, "AI analysis service temporarily unavailable", 503);
      }

      logger.info("Analyzing recipe with AI", {
        hasRecipeId: !!recipeData.recipeId,
        hasUrl: !!recipeData.recipeUrl,
        recipeName: recipeData.name
      });

      // Handle URL-based recipe analysis differently
      if (recipeData.recipeUrl) {
        try {
          logger.info("Fetching recipe content from URL", { url: recipeData.recipeUrl });

          // Use recipe scraper for extraction
          const scrapedRecipe = await recipeScraper.scrapeRecipeFromUrl(recipeData.recipeUrl);
          const recipeAnalysis = recipeScraper.analyzeRecipe(scrapedRecipe);

          // Check if we extracted structured data
          if (scrapedRecipe.ingredients?.length || scrapedRecipe.instructions?.length) {
            logger.info("Successfully extracted structured recipe data from URL");

            const recipe = {
              name: scrapedRecipe.title || 'Unknown Recipe',
              ingredients: scrapedRecipe.ingredients || [],
              instructions: scrapedRecipe.instructions || [],
              source: recipeData.recipeUrl
            };

            const result = await openAIService.analyzeRecipe(recipe);

            if (!result.success) {
              throw new Error(result.error || "Failed to analyze recipe with AI service");
            }

            const analysis = {
              analysis: result.data.summary || result.data.textureAnalysis || null,
              tips: result.data.recommendations || result.data.improvements || [],
              score: result.data.technicalRating ? Math.round(result.data.technicalRating * 10) : null
            };

            logger.info("Recipe analysis from URL complete", { score: analysis.score });
            return successResponse(res, analysis);
          } else {
            // No structured data found, use limited content
            logger.info("No structured recipe data found, using limited content");

            const recipe = {
              name: scrapedRecipe.title || 'Unknown Recipe',
              description: scrapedRecipe.description || '',
              source: recipeData.recipeUrl
            };

            const result = await openAIService.analyzeRecipe(recipe);

            if (!result.success) {
              throw new Error(result.error || "Failed to analyze recipe with AI service");
            }

            const analysis = {
              analysis: result.data.summary || result.data.textureAnalysis || null,
              tips: result.data.recommendations || result.data.improvements || [],
              score: result.data.technicalRating ? Math.round(result.data.technicalRating * 10) : null
            };

            return successResponse(res, analysis);
          }
        } catch (scrapingError) {
          logger.error("Error scraping recipe URL", { error: scrapingError });
          return errorResponse(
            res,
            scrapingError instanceof Error ? scrapingError.message : "Failed to fetch recipe from URL",
            400
          );
        }
      } else {
        // Handle direct recipe data analysis
        logger.info("Analyzing recipe data directly with OpenAI");

        const result = await openAIService.analyzeRecipe(recipeData);

        if (!result.success) {
          throw new Error(result.error || "Failed to analyze recipe with AI service");
        }

        const analysis = {
          analysis: result.data.summary || result.data.textureAnalysis || null,
          tips: result.data.recommendations || result.data.improvements || [],
          score: result.data.technicalRating ? Math.round(result.data.technicalRating * 10) : null
        };

        logger.info("Recipe analysis complete", { score: analysis.score });
        return successResponse(res, analysis);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }

      logger.error("Error in recipe analysis", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to analyze recipe with AI",
        500
      );
    }
  });

  /**
   * POST /api/ai/generate-recipe
   * Generate personalized recipe with AI (handles both chat and form-based requests)
   */
  app.post("/api/ai/generate-recipe", aiLimiter, async (req, res) => {
    try {
      const requestData = req.body;
      logger.info("Recipe generation request received", {
        hasPrompt: !!requestData.prompt,
        hasDifficulty: !!requestData.difficulty
      });

      // Handle chat-based requests (from AI Recipe Generator page)
      if (requestData.prompt && requestData.context) {
        const { prompt, context } = requestData;

        logger.info("Processing chat-based recipe request");

        const result = await aiService.makeAIRequest({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are the Bakehouse Breads multi-agent AI system. Respond only in valid JSON format.

AGENTS AVAILABLE:
- COORDINATOR AGENT: Routes requests to specialists
- RECIPE GENERATION AGENT: Creates recipes
- TECHNIQUE AGENT: Provides technique guidance
- INGREDIENT AGENT: Offers ingredient advice
- EQUIPMENT AGENT: Equipment recommendations
- TIMING AGENT: Timing and scheduling advice

MANDATORY JSON FORMAT - Copy this structure exactly:

{
  "name": "Recipe Name Here",
  "description": "COORDINATOR AGENT: For this [recipe type], I'm consulting the Recipe Generation Agent, Technique Agent, Ingredient Agent, Equipment Agent, and Timing Agent. [Brief description]",
  "difficulty": "intermediate",
  "ingredients": ["ingredient with measurement", "another ingredient"],
  "instructions": ["Step 1", "Step 2"],
  "totalTime": "time needed",
  "activeTime": "active time",
  "yields": "number served",
  "notes": ["TECHNIQUE AGENT: specific technique advice", "INGREDIENT AGENT: ingredient guidance", "EQUIPMENT AGENT: equipment advice", "TIMING AGENT: timing advice"],
  "tips": ["RECIPE GENERATION AGENT: helpful question?", "RECIPE GENERATION AGENT: another question?"]
}

The description MUST start with "COORDINATOR AGENT: For this" - this is non-negotiable.
Each note MUST start with an agent name followed by a colon.
Each tip MUST start with "RECIPE GENERATION AGENT:"

Return only valid JSON with no additional text.`
            },
            {
              role: "user",
              content: `Create a recipe for: ${prompt}

Requirements:
- Skill level: ${context.skillLevel || 'intermediate'}
- Serving size: ${context.servingSize || 4}
- Dietary restrictions: ${context.dietaryRestrictions?.join(', ') || 'none'}

Respond in JSON format. The description MUST start with "COORDINATOR AGENT: For this" and list the consulting agents. Each note must be prefixed with an agent name.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2500
        });

        if (!result.success) {
          throw new Error(result.error || "AI service error");
        }

        try {
          const aiContent = result.data?.choices?.[0]?.message?.content || result.data;
          logger.info("Raw AI response received", { contentLength: aiContent?.length });

          let recipeData;

          // Try to parse as JSON first
          try {
            const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
              recipeData = JSON.parse(jsonMatch[1]);
            } else {
              recipeData = JSON.parse(aiContent);
            }
          } catch (jsonError) {
            logger.warn("JSON parsing failed, creating structured response from text");
            recipeData = {
              name: "AI Generated Recipe",
              description: "A recipe generated based on your request",
              difficulty: requestData.context?.skillLevel || "intermediate",
              ingredients: ["Check the full response for ingredients"],
              instructions: ["Check the full response for instructions"],
              totalTime: "Varies",
              activeTime: "30 minutes",
              yields: "1 serving",
              hydration: 70,
              notes: ["Full recipe details: " + aiContent.substring(0, 500) + "..."]
            };
          }

          logger.info("Recipe generated successfully from chat request");
          return successResponse(res, recipeData);
        } catch (parseError) {
          logger.error("Failed to process AI response", { error: parseError });
          return errorResponse(res, "AI response processing failed", 500);
        }
      }

      // Handle form-based requests (from enhanced form)
      if (requestData.difficulty && requestData.flavorProfile) {
        logger.info("Processing form-based recipe request");

        const flavorDesc = Array.isArray(requestData.flavorProfile)
          ? requestData.flavorProfile.join(', ')
          : String(requestData.flavorProfile);

        const dietaryDesc = Array.isArray(requestData.dietaryRestrictions)
          ? requestData.dietaryRestrictions.join(', ')
          : 'none';

        const equipmentDesc = Array.isArray(requestData.equipment)
          ? requestData.equipment.join(', ')
          : 'basic kitchen tools';

        const result = await aiService.makeAIRequest({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are the Bakehouse Breads multi-agent AI system. Respond only in valid JSON format.

AGENTS AVAILABLE:
- COORDINATOR AGENT: Routes requests to specialists
- RECIPE GENERATION AGENT: Creates recipes
- TECHNIQUE AGENT: Provides technique guidance
- INGREDIENT AGENT: Offers ingredient advice
- EQUIPMENT AGENT: Equipment recommendations
- TIMING AGENT: Timing and scheduling advice

MANDATORY JSON FORMAT - Copy this structure exactly:

{
  "name": "Recipe Name Here",
  "description": "COORDINATOR AGENT: For this [recipe type], I'm consulting the Recipe Generation Agent, Technique Agent, Ingredient Agent, Equipment Agent, and Timing Agent. [Brief description]",
  "difficulty": "intermediate",
  "ingredients": ["ingredient with measurement", "another ingredient"],
  "instructions": ["Step 1", "Step 2"],
  "totalTime": "time needed",
  "activeTime": "active time",
  "yields": "number served",
  "notes": ["TECHNIQUE AGENT: specific technique advice", "INGREDIENT AGENT: ingredient guidance", "EQUIPMENT AGENT: equipment advice", "TIMING AGENT: timing advice"],
  "tips": ["RECIPE GENERATION AGENT: helpful question?", "RECIPE GENERATION AGENT: another question?"]
}

The description MUST start with "COORDINATOR AGENT: For this" - this is non-negotiable.
Each note MUST start with an agent name followed by a colon.
Each tip MUST start with "RECIPE GENERATION AGENT:"

Return only valid JSON with no additional text.`
            },
            {
              role: "user",
              content: `Create a sourdough bread recipe with these specifications:

Difficulty Level: ${requestData.difficulty}
Flavor Profile: ${flavorDesc}
Dietary Restrictions: ${dietaryDesc}
Available Time: ${requestData.availableTime || 'flexible'}
Equipment: ${equipmentDesc}
Bread Type: ${requestData.breadType || 'traditional sourdough'}
Hydration Level: ${requestData.hydrationLevel || 'medium'}
Texture Preferences: ${Array.isArray(requestData.texturePreferences) ? requestData.texturePreferences.join(', ') : 'classic'}
Serving Size: ${Array.isArray(requestData.servingSize) ? requestData.servingSize[0] : 4}
Starter Type: ${requestData.starterType || 'traditional wheat starter'}

Respond in JSON format. The description MUST start with "COORDINATOR AGENT: For this" and list the consulting agents. Each note must be prefixed with an agent name.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2500
        });

        if (!result.success) {
          throw new Error(result.error || "AI service error");
        }

        try {
          const aiContent = result.data?.choices?.[0]?.message?.content || result.data;
          logger.info("Raw AI response for form request received", {
            contentLength: aiContent?.length
          });

          let recipeData;

          try {
            const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
              recipeData = JSON.parse(jsonMatch[1]);
            } else {
              recipeData = JSON.parse(aiContent);
            }

            logger.info("Ingredients check", {
              ingredientCount: recipeData.ingredients?.length || 0
            });
          } catch (jsonError) {
            logger.warn("JSON parsing failed for form request, creating fallback");
            recipeData = {
              name: "Custom Sourdough Recipe",
              description: "COORDINATOR AGENT: For this custom sourdough request, I'm consulting the Recipe Generation Agent, Technique Agent, Ingredient Agent, Equipment Agent, and Timing Agent. A personalized recipe based on your preferences.",
              difficulty: requestData.difficulty,
              ingredients: ["500g bread flour", "375g water", "100g active sourdough starter", "10g salt"],
              instructions: ["Mix flour and water, autolyse 30 minutes", "Add starter and salt, mix well", "Bulk ferment with folds", "Shape and proof", "Bake with steam"],
              totalTime: "24 hours",
              activeTime: "1 hour",
              yields: "1 loaf",
              notes: ["TECHNIQUE AGENT: Monitor dough temperature for optimal fermentation", "INGREDIENT AGENT: Use high-quality flour for best results", "EQUIPMENT AGENT: A kitchen scale is essential for accuracy", "TIMING AGENT: Plan ahead for proper fermentation timing"],
              tips: ["RECIPE GENERATION AGENT: How does your kitchen temperature affect fermentation?", "RECIPE GENERATION AGENT: Would you like guidance on shaping techniques?"]
            };
          }

          logger.info("Recipe generated successfully from form request");
          return successResponse(res, recipeData);
        } catch (parseError) {
          logger.error("Failed to process AI response for form request", { error: parseError });
          return errorResponse(res, "AI response processing failed", 500);
        }
      }

      // If neither format is detected, return error
      return errorResponse(
        res,
        "Invalid request format. Please provide either prompt+context or difficulty+flavorProfile",
        400
      );

    } catch (error) {
      logger.error("Error generating recipe", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to generate recipe",
        500
      );
    }
  });

  /**
   * POST /api/ai/troubleshoot-starter
   * Starter troubleshooting with ChatGPT
   */
  app.post("/api/ai/troubleshoot-starter", aiLimiter, async (req, res) => {
    try {
      const { issue } = req.body;

      // Validate required fields
      if (!issue || !issue.symptoms || !Array.isArray(issue.symptoms) || issue.symptoms.length === 0) {
        return errorResponse(res, "Issue data with symptoms are required for troubleshooting", 400);
      }

      logger.info("Troubleshooting starter with AI", {
        symptomCount: issue.symptoms.length
      });

      const advice = await generateStarterTroubleshootingAdvice(issue);

      logger.info("Starter troubleshooting advice generated successfully");
      return successResponse(res, advice);
    } catch (error) {
      logger.error("Error generating starter troubleshooting advice", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to generate troubleshooting advice",
        500
      );
    }
  });

  /**
   * POST /api/ai/ingredient-substitution
   * AI-powered ingredient substitution recommendations
   */
  app.post("/api/ai/ingredient-substitution", aiLimiter, async (req, res) => {
    try {
      const substitutionSchema = z.object({
        originalIngredient: z.string().min(1),
        recipeContext: z.object({
          name: z.string().optional(),
          ingredients: z.array(z.string()).optional(),
          hydration: z.number().optional(),
          recipeType: z.string().optional()
        }).optional(),
        restrictions: z.array(z.string()).optional(),
        preferences: z.array(z.string()).optional(),
        reason: z.string().optional()
      });

      const substitutionRequest = substitutionSchema.parse(req.body);

      logger.info("Processing ingredient substitution request", {
        ingredient: substitutionRequest.originalIngredient
      });

      const result = await aiService.suggestSubstitutions(substitutionRequest);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate ingredient substitutions");
      }

      logger.info("Ingredient substitutions generated successfully");
      return successResponse(res, result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error generating ingredient substitutions", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to generate ingredient substitutions",
        500
      );
    }
  });

  /**
   * POST /api/ai/troubleshoot-baking
   * AI Baking Troubleshooter endpoint
   */
  app.post("/api/ai/troubleshoot-baking", aiLimiter, async (req, res) => {
    try {
      const { issueDescription } = req.body;

      if (!issueDescription || typeof issueDescription !== 'string') {
        return errorResponse(res, "Issue description is required", 400);
      }

      logger.info("Processing baking troubleshooting request");

      const systemPrompt = `You are a master baker with 20+ years of sourdough experience.
      Diagnose baking issues and provide practical, actionable solutions.

      Analyze the baking issue and respond with this exact JSON structure:
      {
        "issue": "brief summary of the problem",
        "diagnosis": "detailed explanation of what went wrong",
        "severity": "low|medium|high",
        "possibleCauses": ["cause 1", "cause 2", "cause 3"],
        "solutions": [
          {
            "solution": "detailed step-by-step solution",
            "difficulty": "easy|medium|advanced",
            "timeframe": "how long this will take",
            "effectiveness": 85
          }
        ],
        "preventionTips": ["prevention tip 1", "prevention tip 2"],
        "relatedIssues": ["related issue 1", "related issue 2"]
      }

      Provide 2-4 solutions ranked by effectiveness. Effectiveness should be a number 1-100.`;

      const userPrompt = `Analyze this sourdough baking issue: "${issueDescription}"`;

      const result = await aiService.makeAIRequest({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      if (!result.success) {
        return errorResponse(res, result.error || "AI service error", 500);
      }

      // Handle different AI service response formats
      let responseContent;
      if (result.data.response) {
        responseContent = result.data.response;
      } else if (result.data.choices && result.data.choices[0]) {
        responseContent = result.data.choices[0].message.content;
      } else {
        throw new Error("Unexpected AI response format");
      }

      // Try to parse as JSON, provide fallback if needed
      let response;
      try {
        response = JSON.parse(responseContent);

        if (!response.issue || !response.diagnosis || !response.solutions) {
          throw new Error("Invalid response structure");
        }
      } catch (parseError) {
        logger.warn("JSON parsing failed, providing fallback response");
        response = {
          issue: "General baking issue",
          diagnosis: "Unable to parse AI response, but here's general advice based on your description.",
          severity: "medium",
          possibleCauses: ["Multiple factors could be involved", "Check your starter activity", "Review your fermentation timing"],
          solutions: [
            {
              solution: "Review your basic sourdough process: ensure your starter is active, check your hydration levels, and monitor fermentation timing.",
              difficulty: "easy",
              timeframe: "Next baking session",
              effectiveness: 70
            }
          ],
          preventionTips: ["Keep detailed baking notes", "Test your starter before using", "Monitor dough temperature"],
          relatedIssues: ["Starter health", "Timing issues", "Temperature control"]
        };
      }

      logger.info("Baking troubleshooting advice generated successfully");
      return successResponse(res, response);

    } catch (error) {
      logger.error("Baking troubleshooter error", { error });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * POST /api/ai/generate-content
   * AI Content Generator endpoint
   */
  app.post("/api/ai/generate-content", aiLimiter, async (req, res) => {
    try {
      const { topic, contentType, skillLevel, length, type, targetAudience, context } = req.body;

      // Handle new format for AIContentGenerator
      if (type) {
        let content;
        switch (type) {
          case 'blog_article':
            content = await AIContentGenerator.generateBlogArticle(topic, targetAudience);
            break;
          case 'product_description':
            content = await AIContentGenerator.generateProductDescription(
              context.productName,
              context.productType,
              context.features
            );
            break;
          default:
            return errorResponse(res, "Invalid content type", 400);
        }

        logger.info("Content generated with AIContentGenerator", { type });
        return successResponse(res, content);
      }

      // Original format handling
      if (!topic) {
        return errorResponse(res, "Topic is required", 400);
      }

      logger.info("Processing AI content generation request", { topic, contentType });

      // Get prompt template for content generation
      const aiSettings = await import("../services/ai-settings");
      const settings = await aiSettings.getAISettings();
      const promptTemplate = settings.prompts?.find((p: any) => p.usage === 'content-generator')?.template;

      if (!promptTemplate) {
        logger.warn("Content generator template not found, using fallback");
        const fallbackPrompt = `Create a comprehensive ${contentType} about "${topic}" for ${skillLevel} level bakers.
        The content should be ${length} in length.

        Please provide a well-structured response in JSON format with:
        - title: A compelling title
        - content: The main content with proper formatting
        - contentType: The type of content
        - estimatedReadTime: Reading time estimate
        - skillLevel: Target skill level
        - tags: Relevant tags array

        Make the content informative, practical, and engaging for bakers.`;

        const aiResponse = await geminiService.makeAIRequest({
          messages: [
            { role: "system", content: "You are an expert baking content creator who writes helpful guides and articles." },
            { role: "user", content: fallbackPrompt }
          ],
          model: "gemini-2.0-flash",
          temperature: 0.7
        });

        if (!aiResponse.success || !aiResponse.data) {
          logger.error("AI content generation failed", { error: aiResponse.error });
          return errorResponse(res, "Failed to generate content", 500);
        }

        let parsedContent;
        try {
          parsedContent = JSON.parse(aiResponse.data);
        } catch (parseError) {
          parsedContent = {
            title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${topic}`,
            content: aiResponse.data,
            contentType,
            estimatedReadTime: length === 'short' ? '2-3 min' : length === 'medium' ? '5-7 min' : '10-15 min',
            skillLevel,
            tags: [contentType, skillLevel, 'baking'],
          };
        }

        logger.info("Content generated successfully using fallback");
        return successResponse(res, parsedContent);
      }

      // Replace template variables
      const finalPrompt = promptTemplate
        .replace(/\{\{topic\}\}/g, topic)
        .replace(/\{\{contentType\}\}/g, contentType)
        .replace(/\{\{skillLevel\}\}/g, skillLevel)
        .replace(/\{\{length\}\}/g, length);

      const aiResponse = await geminiService.makeAIRequest({
        messages: [
          { role: "system", content: "You are an expert baking content creator." },
          { role: "user", content: finalPrompt }
        ],
        model: "gemini-2.0-flash",
        temperature: 0.7
      });

      if (!aiResponse.success || !aiResponse.data) {
        logger.error("AI content generation failed", { error: aiResponse.error });
        return errorResponse(res, "Failed to generate content", 500);
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(aiResponse.data);
      } catch (parseError) {
        parsedContent = {
          title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${topic}`,
          content: aiResponse.data,
          contentType,
          estimatedReadTime: length === 'short' ? '2-3 min' : length === 'medium' ? '5-7 min' : '10-15 min',
          skillLevel,
          tags: [contentType, skillLevel, 'baking'],
        };
      }

      logger.info("Content generated successfully");
      return successResponse(res, parsedContent);

    } catch (error) {
      logger.error("Error in AI content generation", { error });
      return errorResponse(res, "Internal server error during content generation", 500);
    }
  });

  /**
   * POST /api/ai/chat
   * AI Chat endpoint for interactive baking assistance
   */
  app.post("/api/ai/chat", aiLimiter, async (req, res) => {
    try {
      const { message, context, history } = req.body;

      if (!message || typeof message !== 'string') {
        return errorResponse(res, "Message is required", 400);
      }

      logger.info("Processing AI chat request", { messageLength: message.length });

      // Build context-aware prompt
      let systemPrompt = `You are an expert baking assistant specializing in all types of baking - bread, pastries, cakes, cookies, and more. You provide helpful, practical advice with a friendly but professional tone.

Key guidelines:
- Give specific, actionable advice
- Explain the science behind techniques when relevant
- Suggest troubleshooting steps for problems
- Recommend ingredient substitutions when asked
- Keep responses concise but thorough
- Always be encouraging and supportive`;

      if (context === 'baking_assistant') {
        systemPrompt += "\n\nYou are responding to a user in a chat interface designed for real-time baking help.";
      }

      // Include recent conversation history for context
      let conversationHistory = "";
      if (history && Array.isArray(history)) {
        conversationHistory = history
          .slice(-3)
          .map((msg: any) => `${msg.role}: ${msg.content}`)
          .join("\n");
      }

      const fullPrompt = conversationHistory
        ? `${systemPrompt}\n\nRecent conversation:\n${conversationHistory}\n\nUser: ${message}\n\nAssistant:`
        : `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

      const aiResponse = await geminiService.makeAIRequest({
        messages: [{ role: 'user', content: fullPrompt }],
        model: "gemini-2.0-flash"
      });

      const content = aiResponse.response || "I apologize, but I'm having trouble processing your request right now. Please try again.";

      logger.info("AI chat response generated successfully");
      return successResponse(res, {
        response: content,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error("Error in AI chat", { error });
      return errorResponse(res, "Failed to process chat message", 500);
    }
  });

  /**
   * GET /api/ai/recipes/:id
   * Get AI-generated recipe by ID
   */
  app.get("/api/ai/recipes/:id", async (req, res) => {
    try {
      const recipeId = req.params.id;

      // Check memory cache first
      if ((global as any).aiRecipeCache && (global as any).aiRecipeCache.has(recipeId)) {
        const recipe = (global as any).aiRecipeCache.get(recipeId);
        logger.info("Retrieved AI recipe from cache", { recipeId });
        return successResponse(res, recipe);
      }

      // Check database
      const [recipe] = await db.select()
        .from(aiGeneratedRecipes)
        .where(eq(aiGeneratedRecipes.id, Number(recipeId)));

      if (!recipe) {
        return notFound(res, "AI recipe not found or expired");
      }

      logger.info("Retrieved AI recipe from database", { recipeId });
      return successResponse(res, recipe);
    } catch (error) {
      logger.error("Error retrieving AI recipe", { error, recipeId: req.params.id });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to retrieve AI recipe",
        500
      );
    }
  });

  /**
   * POST /api/ai/generate-blog-post
   * AI-powered blog post generation
   */
  app.post("/api/ai/generate-blog-post", aiLimiter, async (req, res) => {
    try {
      const topicSchema = z.object({
        topic: z.string().min(5, "Topic must be at least 5 characters long"),
      });

      const { topic } = topicSchema.parse(req.body);

      logger.info("Generating blog post with AI service", { topic });

      const result = await aiService.generateBlogPost(topic);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate blog post with AI service");
      }

      logger.info("Blog post generated successfully");
      return successResponse(res, result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error generating blog post with AI", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to generate blog post with AI",
        500
      );
    }
  });

  /**
   * POST /api/ai/test-connection
   * Test endpoint for API connection
   */
  app.post("/api/ai/test-connection", async (req, res) => {
    try {
      logger.info("Testing API connection with AI service");

      const result = await aiService.testConnection();

      if (!result.success) {
        throw new Error(result.error || "Failed to connect to AI service");
      }

      logger.info("API connection test successful");
      return successResponse(res, {
        message: "API connection successful",
        response: result.data
      });
    } catch (error) {
      logger.error("Error testing API connection", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to connect to AI API",
        500
      );
    }
  });

  /**
   * POST /api/ai/test-gemini
   * Test endpoint specifically for Gemini API connection
   */
  app.post("/api/ai/test-gemini", async (req, res) => {
    try {
      logger.info("Testing Gemini API connection directly");

      const result = await geminiService.testConnection();

      if (!result.success) {
        throw new Error(result.error || "Failed to connect to Gemini AI service");
      }

      logger.info("Gemini API connection test successful");
      return successResponse(res, {
        message: "Gemini API connection successful",
        response: result.data
      });
    } catch (error) {
      logger.error("Error testing Gemini API connection", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to connect to Gemini API",
        500
      );
    }
  });

  /**
   * POST /api/ai/generate-faqs
   * AI-powered FAQ generation
   */
  app.post("/api/ai/generate-faqs", aiLimiter, async (req, res) => {
    try {
      const faqSchema = z.object({
        category: z.string().min(3, "Category must be at least 3 characters long"),
        count: z.number().min(1).max(10).optional(),
      });

      const { category, count = 5 } = faqSchema.parse(req.body);

      logger.info("Generating FAQs with AI service", { category, count });

      const result = await aiService.generateFaqs(category, count);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate FAQs with AI service");
      }

      logger.info("FAQs generated successfully");
      return successResponse(res, result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error generating FAQs with AI", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to generate FAQs with AI",
        500
      );
    }
  });

  /**
   * POST /api/ai/adjust-fermentation-times
   * Adjust fermentation times based on temperature
   */
  app.post("/api/ai/adjust-fermentation-times", aiLimiter, async (req, res) => {
    try {
      const fermentationSchema = z.object({
        stages: z.record(z.object({
          hours: z.number().min(0).optional(),
          minutes: z.number().min(0).optional(),
          refrigerated: z.boolean().optional()
        })),
        roomTemperature: z.number().min(32).max(100)
      });

      const parsedData = fermentationSchema.parse(req.body);
      const { stages, roomTemperature } = parsedData;

      logger.info("Adjusting fermentation times for temperature", {
        temperature: roomTemperature,
        stageCount: Object.keys(stages).length
      });

      const result = await openAIService.adjustFermentationTimes(stages, roomTemperature);

      if (!result.success) {
        throw new Error(result.error || "Failed to adjust fermentation times");
      }

      logger.info("Fermentation times adjusted successfully");
      return successResponse(res, result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error adjusting fermentation times", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to adjust fermentation times",
        500
      );
    }
  });

  /**
   * POST /api/ai/personalized-homepage
   * AI Wrapper Engine - Personalized Homepage
   */
  app.post("/api/ai/personalized-homepage", async (req, res) => {
    try {
      const userContext = {
        sessionId: req.body.sessionId || 'anonymous',
        visitCount: req.body.visitCount || 1,
        timeOnSite: req.body.timeOnSite || 0,
        pagesVisited: req.body.pagesVisited || [],
        toolsUsed: req.body.toolsUsed || [],
        searchQueries: req.body.searchQueries || [],
        skillLevel: req.body.skillLevel,
        interests: req.body.interests || [],
        currentPage: req.body.currentPage || 'homepage',
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      };

      logger.info("Generating personalized homepage", {
        sessionId: userContext.sessionId,
        skillLevel: userContext.skillLevel
      });

      const personalizedContent = await AIWrapperEngine.generatePersonalizedHomepage(userContext);

      logger.info("Personalized homepage generated successfully");
      return successResponse(res, personalizedContent);
    } catch (error) {
      logger.error('Error generating personalized homepage', { error });
      return errorResponse(res, "Failed to generate personalized content", 500);
    }
  });

  /**
   * POST /api/ai/analyze-intent
   * AI Intent Analysis for Smart Search
   */
  app.post("/api/ai/analyze-intent", async (req, res) => {
    try {
      const { searchQuery, userContext } = req.body;

      logger.info("Analyzing user intent", { query: searchQuery });

      const intent = await AIWrapperEngine.analyzeUserIntent(searchQuery, userContext);

      logger.info("User intent analyzed successfully");
      return successResponse(res, intent);
    } catch (error) {
      logger.error('Error analyzing user intent', { error });
      return errorResponse(res, "Failed to analyze search intent", 500);
    }
  });

  /**
   * POST /api/ai/predict-needs
   * AI Predictive Analytics
   */
  app.post("/api/ai/predict-needs", async (req, res) => {
    try {
      const { behaviorPattern } = req.body;

      logger.info("Predicting user needs");

      const predictions = await AIWrapperEngine.predictUserNeeds(behaviorPattern);

      logger.info("User needs predicted successfully");
      return successResponse(res, predictions);
    } catch (error) {
      logger.error('Error predicting user needs', { error });
      return errorResponse(res, "Failed to predict user needs", 500);
    }
  });

  /**
   * GET /api/recipes/public
   * Public Recipe Search API for SEO
   */
  app.get("/api/recipes/public", async (req, res) => {
    try {
      const { page = 1, limit = 20, search, tag, difficulty } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let conditions: SQL[] = [eq(aiGeneratedRecipes.isPublic, true)];

      if (search) {
        const searchCondition = or(
          ilike(aiGeneratedRecipes.name, `%${search}%`),
          ilike(aiGeneratedRecipes.description, `%${search}%`)
        );
        if (searchCondition) conditions.push(searchCondition);
      }

      if (tag) {
        conditions.push(
          sql`${aiGeneratedRecipes.tags}::text ILIKE ${'%' + tag + '%'}`
        );
      }

      if (difficulty) {
        conditions.push(eq(aiGeneratedRecipes.difficulty, difficulty as string));
      }

      const query = db.select().from(aiGeneratedRecipes)
        .where(and(...conditions));

      const recipes = await query
        .orderBy(desc(aiGeneratedRecipes.createdAt))
        .limit(Number(limit))
        .offset(offset);

      const totalQuery = db.select({ count: sql<number>`count(*)` })
        .from(aiGeneratedRecipes)
        .where(and(...conditions));

      const [{ count }] = await totalQuery;

      logger.info("Fetched public recipes", {
        count: recipes.length,
        total: count,
        page,
        search: search || 'none'
      });

      return successResponse(res, {
        recipes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching public recipes', { error });
      return errorResponse(res, "Failed to fetch recipes", 500);
    }
  });

  /**
   * GET /api/recipes/public/:slug
   * Get recipe by slug for SEO URLs
   */
  app.get("/api/recipes/public/:slug", async (req, res) => {
    try {
      const { slug } = req.params;

      const [recipe] = await db.select()
        .from(aiGeneratedRecipes)
        .where(and(
          eq(aiGeneratedRecipes.slug, slug),
          eq(aiGeneratedRecipes.isPublic, true)
        ));

      if (!recipe) {
        return notFound(res, "Recipe not found");
      }

      logger.info("Fetched recipe by slug", { slug });
      return successResponse(res, recipe);
    } catch (error) {
      logger.error('Error fetching recipe by slug', { error, slug: req.params.slug });
      return errorResponse(res, "Failed to fetch recipe", 500);
    }
  });

  /**
   * GET /api/ai/recipes/session/:sessionId
   * Get user's AI recipes by session
   */
  app.get("/api/ai/recipes/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      const recipes = await db.select()
        .from(aiGeneratedRecipes)
        .where(eq(aiGeneratedRecipes.sessionId, sessionId))
        .orderBy(desc(aiGeneratedRecipes.createdAt));

      logger.info("Fetched user recipes by session", {
        sessionId,
        count: recipes.length
      });
      return successResponse(res, recipes);
    } catch (error) {
      logger.error('Error fetching user recipes', { error });
      return errorResponse(res, "Failed to fetch recipes", 500);
    }
  });

  /**
   * GET /api/ai/recipes/saved/:sessionId
   * Get saved AI recipes for a user
   */
  app.get("/api/ai/recipes/saved/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      const recipes = await db.select()
        .from(aiGeneratedRecipes)
        .where(and(
          eq(aiGeneratedRecipes.sessionId, sessionId),
          eq(aiGeneratedRecipes.isSaved, true)
        ))
        .orderBy(desc(aiGeneratedRecipes.createdAt));

      logger.info("Fetched saved recipes", { sessionId, count: recipes.length });
      return successResponse(res, recipes);
    } catch (error) {
      logger.error('Error fetching saved recipes', { error });
      return errorResponse(res, "Failed to fetch saved recipes", 500);
    }
  });

  /**
   * PATCH /api/ai/recipes/:id/save
   * Save/unsave a recipe
   */
  app.patch("/api/ai/recipes/:id/save", async (req, res) => {
    try {
      const { id } = req.params;
      const { isSaved } = req.body;

      const [updatedRecipe] = await db.update(aiGeneratedRecipes)
        .set({ isSaved })
        .where(eq(aiGeneratedRecipes.id, Number(id)))
        .returning();

      if (!updatedRecipe) {
        return notFound(res, "Recipe not found");
      }

      logger.info("Updated recipe save status", { recipeId: id, isSaved });
      return successResponse(res, updatedRecipe);
    } catch (error) {
      logger.error('Error updating recipe save status', { error, recipeId: req.params.id });
      return errorResponse(res, "Failed to update recipe", 500);
    }
  });

  /**
   * POST /api/ai/search-cached-recipes
   * Search public recipes for AI system reuse
   */
  app.post("/api/ai/search-cached-recipes", async (req, res) => {
    try {
      const { query, tags, difficulty, limit = 10 } = req.body;

      let conditions: SQL[] = [eq(aiGeneratedRecipes.isPublic, true)];

      if (query) {
        const searchCondition = or(
          ilike(aiGeneratedRecipes.name, `%${query}%`),
          ilike(aiGeneratedRecipes.description, `%${query}%`),
          ilike(aiGeneratedRecipes.content, `%${query}%`)
        );
        if (searchCondition) conditions.push(searchCondition);
      }

      if (tags && Array.isArray(tags)) {
        for (const tag of tags) {
          conditions.push(
            sql`${aiGeneratedRecipes.tags}::text ILIKE ${'%' + tag + '%'}`
          );
        }
      }

      if (difficulty) {
        conditions.push(eq(aiGeneratedRecipes.difficulty, difficulty));
      }

      const searchQuery = db.select().from(aiGeneratedRecipes)
        .where(and(...conditions));

      const cachedRecipes = await searchQuery
        .orderBy(desc(aiGeneratedRecipes.createdAt))
        .limit(Number(limit));

      logger.info("Searched cached recipes", {
        query: query || 'none',
        resultCount: cachedRecipes.length
      });

      return successResponse(res, {
        cached: true,
        recipes: cachedRecipes,
        message: `Found ${cachedRecipes.length} cached recipes matching your criteria`
      });
    } catch (error) {
      logger.error('Error searching cached recipes', { error });
      return errorResponse(res, "Failed to search cached recipes", 500);
    }
  });

  /**
   * POST /api/admin/generate-all-starter-recipes
   * Starter Recipe Management - Generate all starter recipes
   */
  app.post("/api/admin/generate-all-starter-recipes", requireAuth, async (req, res) => {
    try {
      logger.info("Starting bulk recipe generation for all starters");
      const totalCreated = await generateAllStarterRecipes();

      logger.info("Bulk recipe generation complete", { totalCreated });
      return successResponse(res, {
        message: `Successfully generated ${totalCreated} recipes`,
        totalCreated
      });
    } catch (error) {
      logger.error("Error generating starter recipes", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to generate recipes",
        500
      );
    }
  });

  /**
   * GET /api/starters/:id/recipes
   * Get recipes for a specific starter
   */
  app.get("/api/starters/:id/recipes", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return errorResponse(res, "Invalid starter ID", 400);
      }

      const recipes = await getRecipesForStarter(starterId);

      logger.info("Fetched starter recipes", { starterId, count: recipes.length });
      return successResponse(res, recipes);
    } catch (error) {
      logger.error("Error fetching starter recipes", { error, starterId: req.params.id });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to fetch recipes",
        500
      );
    }
  });

  /**
   * POST /api/starters/:id/generate-recipes
   * Generate recipes for a specific starter
   */
  app.post("/api/starters/:id/generate-recipes", requireAuth, async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return errorResponse(res, "Invalid starter ID", 400);
      }

      // Get starter details
      const [starter] = await db
        .select()
        .from(sourdoughStarters)
        .where(eq(sourdoughStarters.id, starterId));

      if (!starter) {
        return notFound(res, "Starter not found");
      }

      logger.info("Generating recipes for starter", {
        starterId,
        starterName: starter.name
      });

      const recipes = await generateRecipesForStarter(starterId, starter.slug);

      logger.info("Recipes generated for starter", {
        starterId,
        recipeCount: recipes.length
      });

      return successResponse(res, {
        message: `Generated ${recipes.length} recipes for ${starter.name}`,
        recipes,
        count: recipes.length
      });
    } catch (error) {
      logger.error("Error generating recipes for starter", { error, starterId: req.params.id });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to generate recipes for starter",
        500
      );
    }
  });

  /**
   * GET /api/ai/consensus/status
   * Gemini Multi-Agent AI Routes - Get consensus status
   */
  app.get("/api/ai/consensus/status", async (req, res) => {
    try {
      const status = {
        isEnabled: true,
        providers: ["Gemini-2.5-Flash"],
        fallbackService: "Gemini",
        confidence: 0.95
      };

      logger.info("Retrieved AI consensus status");
      return successResponse(res, status);
    } catch (error) {
      logger.error("Error getting AI status", { error });
      return errorResponse(res, "Failed to get AI status", 500);
    }
  });

  /**
   * POST /api/ai/consensus/recipe
   * Generate recipe with Gemini multi-agent consensus
   */
  app.post("/api/ai/consensus/recipe", aiLimiter, async (req, res) => {
    try {
      const preferences = req.body;
      const options = {
        useConsensus: true,
        ...req.query
      };

      logger.info("Generating recipe with Bakehouse Breads multi-agent system");

      const result = await aiService.makeAIRequest({
        messages: [
          {
            role: "system",
            content: `You are the Bakehouse Breads AI Assistant — a multi-agent expert system dedicated exclusively to answering questions about baking and cooking.

👨‍🍳 RECIPE GENERATION AGENT
Expertise: Custom recipes for bread, pastries, cakes, cookies, pies, laminated doughs, savory bakes, and home-cooked meals
Tasks:
• Generate or adapt recipes based on user constraints (diet, time, skill)
• Provide ingredient quantities, baker's percentages, and substitutions
• Explain flavor, texture, or structure implications of choices

FOR RECIPE GENERATION: You MUST respond with ONLY a valid JSON object.

The JSON must have this exact structure:
{
  "name": "Recipe Name",
  "description": "Brief description with technique insights",
  "difficulty": "intermediate",
  "ingredients": ["Complete ingredient list with measurements"],
  "instructions": ["Step-by-step instructions with sensory cues"],
  "totalTime": "Total time needed",
  "activeTime": "Active preparation time",
  "yields": "How many servings",
  "notes": ["Expert tips and technique explanations"],
  "tips": ["Follow-up questions to help succeed"]
}`
          },
          {
            role: "user",
            content: `Create a recipe based on these preferences: ${JSON.stringify(preferences)}`
          }
        ]
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to generate recipe");
      }

      logger.info("Recipe generated with consensus system");
      return successResponse(res, {
        ...result.data,
        generationMethod: 'gemini-multi-agent'
      });
    } catch (error) {
      logger.error("Error generating recipe", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to generate recipe",
        500
      );
    }
  });

  /**
   * POST /api/ai/consensus/validate
   * Validate recipe with Gemini multi-agent consensus
   */
  app.post("/api/ai/consensus/validate", aiLimiter, async (req, res) => {
    try {
      const recipe = req.body;

      logger.info("Validating recipe with Gemini multi-agent system");

      const result = await aiService.analyzeRecipe(recipe);

      if (!result.success) {
        throw new Error(result.error || "Failed to validate recipe");
      }

      logger.info("Recipe validation complete");
      return successResponse(res, {
        ...result.data,
        validationMethod: 'gemini-multi-agent'
      });
    } catch (error) {
      logger.error("Error validating recipe", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to validate recipe",
        500
      );
    }
  });

  /**
   * GET /api/ai/settings
   * Get AI settings
   */
  app.get("/api/ai/settings", requireAuth, async (req, res) => {
    try {
      const aiSettings = await import("../services/ai-settings");
      const settings = await aiSettings.getAISettings();

      logger.info("Retrieved AI settings");
      return successResponse(res, settings);
    } catch (error) {
      logger.error("Error getting AI settings", { error });
      return errorResponse(res, "Failed to get AI settings", 500);
    }
  });

  /**
   * POST /api/ai/settings
   * Save AI settings
   */
  app.post("/api/ai/settings", requireAuth, async (req, res) => {
    try {
      const aiSettings = await import("../services/ai-settings");
      const settings = req.body;
      const result = await aiSettings.saveAISettings(settings);

      logger.info("Saved AI settings successfully");
      return successResponse(res, result);
    } catch (error) {
      logger.error("Error saving AI settings", { error });
      return errorResponse(res, "Failed to save AI settings", 500);
    }
  });

  /**
   * GET /api/quiz/settings
   * Get quiz settings
   */
  app.get("/api/quiz/settings", async (req, res) => {
    try {
      const aiSettings = await import("../services/ai-settings");
      const settings = await aiSettings.getQuizSettings();

      logger.info("Retrieved quiz settings");
      return successResponse(res, settings);
    } catch (error) {
      logger.error("Error getting quiz settings", { error });
      return errorResponse(res, "Failed to get quiz settings", 500);
    }
  });

  /**
   * POST /api/quiz/settings
   * Save quiz settings
   */
  app.post("/api/quiz/settings", requireAuth, async (req, res) => {
    try {
      const aiSettings = await import("../services/ai-settings");
      const settings = req.body;
      const result = await aiSettings.saveQuizSettings(settings);

      logger.info("Saved quiz settings successfully");
      return successResponse(res, result);
    } catch (error) {
      logger.error("Error saving quiz settings", { error });
      return errorResponse(res, "Failed to save quiz settings", 500);
    }
  });

  /**
   * GET /api/products/recommendations
   * Product recommendations based on content context
   */
  app.get('/api/products/recommendations', async (req, res) => {
    try {
      const { category, tags, entityType, entityId, limit = '3' } = req.query;
      const maxLimit = parseInt(limit as string);

      // Get featured starters that match the context
      const starters = await storage.getAllSourdoughStarters();
      const featuredStarters = starters
        .filter((starter: any) => starter.featured)
        .slice(0, Math.min(2, maxLimit));

      // Transform starters to match product format for recommendations
      const starterRecommendations = featuredStarters.map((starter: any) => ({
        ...starter,
        category: 'starter',
        type: 'starter'
      }));

      logger.info("Fetched product recommendations", {
        count: starterRecommendations.length
      });
      return successResponse(res, starterRecommendations);
    } catch (error) {
      logger.error('Error fetching product recommendations', { error });
      return errorResponse(res, "Failed to fetch product recommendations", 500);
    }
  });
}
