import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { recipeLimiter } from "../middleware/rate-limit";
import logger from "../config/logger";
import { insertBreadRecipeSchema, type InsertRecipeValidation } from "../../shared/schema";
import { ZodError, fromZodError } from "zod-validation-error";
import { z } from "zod";
import * as recipeScraper from "../services/recipe-scraper";
import { scrapeRecipeFromUrl } from "../services/recipeScraperService";
import { analyzeRecipe } from "../services/openai";

/**
 * Register all recipe-related routes
 * Recipe CRUD, validation, scraping, and analysis
 */
export function registerRecipeRoutes(app: Express) {

  /**
   * GET /api/recipes
   * Get all recipes
   */
  app.get("/api/recipes", optionalAuth, async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      logger.info("Fetched all recipes", { count: recipes.length });
      return successResponse(res, recipes);
    } catch (error) {
      logger.error("Error fetching recipes", { error });
      return errorResponse(res, "Failed to fetch recipes", 500);
    }
  });

  /**
   * GET /api/recipes/public
   * Get public recipes only
   */
  app.get("/api/recipes/public", async (req, res) => {
    try {
      const recipes = await storage.getPublicRecipes();
      logger.info("Fetched public recipes", { count: recipes.length });
      return successResponse(res, recipes);
    } catch (error) {
      logger.error("Error fetching public recipes", { error });
      return errorResponse(res, "Failed to fetch public recipes", 500);
    }
  });

  /**
   * GET /api/recipes/:id
   * Get a single recipe by ID
   */
  app.get("/api/recipes/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      const recipe = await storage.getRecipeById(recipeId);

      if (!recipe) {
        return notFound(res, "Recipe not found");
      }

      logger.info("Fetched recipe", { recipeId });
      return successResponse(res, recipe);
    } catch (error) {
      logger.error("Error fetching recipe", { error, recipeId: req.params.id });
      return errorResponse(res, "Failed to fetch recipe", 500);
    }
  });

  /**
   * GET /api/user/:userId/recipes
   * Get recipes for a specific user
   */
  app.get("/api/user/:userId/recipes", validateParams(idParamSchema), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const recipes = await storage.getUserRecipes(userId);
      logger.info("Fetched user recipes", { userId, count: recipes.length });
      return successResponse(res, recipes);
    } catch (error) {
      logger.error("Error fetching user recipes", { error, userId: req.params.userId });
      return errorResponse(res, "Failed to fetch user recipes", 500);
    }
  });

  /**
   * POST /api/recipes
   * Create a new bread recipe
   */
  app.post("/api/recipes", requireAuth, async (req, res) => {
    try {
      const recipe = insertBreadRecipeSchema.parse(req.body);
      const newRecipe = await storage.createRecipe(recipe);
      logger.info("Created recipe", { recipeId: newRecipe.id, userId: (req.user as any)?.id });
      return successResponse(res, newRecipe, "Recipe created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating recipe", { error });
      return errorResponse(res, "Failed to create recipe", 500);
    }
  });

  /**
   * PATCH /api/recipes/:id
   * Update a bread recipe
   */
  app.patch("/api/recipes/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      const recipeSchema = insertBreadRecipeSchema.partial();
      const recipeUpdates = recipeSchema.parse(req.body);

      const updatedRecipe = await storage.updateRecipe(recipeId, recipeUpdates);
      if (!updatedRecipe) {
        return notFound(res, "Recipe not found");
      }

      logger.info("Updated recipe", { recipeId, userId: (req.user as any)?.id });
      return successResponse(res, updatedRecipe);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error updating recipe", { error, recipeId: req.params.id });
      return errorResponse(res, "Failed to update recipe", 500);
    }
  });

  /**
   * DELETE /api/recipes/:id
   * Delete a bread recipe
   */
  app.delete("/api/recipes/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      const success = await storage.deleteRecipe(recipeId);

      if (!success) {
        return notFound(res, "Recipe not found");
      }

      logger.info("Deleted recipe", { recipeId, userId: (req.user as any)?.id });
      return res.status(204).end();
    } catch (error) {
      logger.error("Error deleting recipe", { error, recipeId: req.params.id });
      return errorResponse(res, "Failed to delete recipe", 500);
    }
  });

  /**
   * POST /api/recipes/import
   * Import multiple recipes at once
   */
  app.post("/api/recipes/import", requireAuth, async (req, res) => {
    try {
      const { seedRecipes } = await import("../seed-recipes");
      const { recipes } = req.body;

      if (!Array.isArray(recipes)) {
        return errorResponse(res, "Invalid input: recipes must be an array", 400);
      }

      const results = await seedRecipes(recipes);
      logger.info("Imported recipes", { count: results.success, userId: (req.user as any)?.id });
      return successResponse(res, results, `Successfully imported ${results.success} recipes`, 201);
    } catch (error) {
      logger.error("Error importing recipes", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to import recipes",
        500
      );
    }
  });

  /**
   * POST /api/recipes/scrape
   * Scrape a recipe from a URL
   */
  app.post("/api/recipes/scrape", recipeLimiter, async (req, res) => {
    try {
      const urlSchema = z.object({
        url: z.string().url(),
      });

      const { url } = urlSchema.parse(req.body);
      logger.info("Scraping recipe from URL", { url });

      const scrapedRecipe = await recipeScraper.scrapeRecipeFromUrl(url);
      const recipeAnalysis = recipeScraper.analyzeRecipe(scrapedRecipe);

      return successResponse(res, {
        recipe: scrapedRecipe,
        analysis: recipeAnalysis,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }

      if (error && typeof error === "object" && "name" in error && error.name === "ScraperError") {
        const scraperError = error as { name: string; message: string; statusCode?: number };
        return errorResponse(res, scraperError.message, scraperError.statusCode || 422);
      }

      logger.error("Error scraping recipe", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to scrape recipe",
        500
      );
    }
  });

  /**
   * POST /api/recipes/validate
   * Validate a bread recipe and get analysis
   */
  app.post("/api/recipes/validate", recipeLimiter, async (req, res) => {
    try {
      const recipeSchema = z.object({
        flourGrams: z.number().optional(),
        waterGrams: z.number().optional(),
        saltGrams: z.number().optional(),
        starterGrams: z.number().optional(),
        recipeText: z.string().optional(),
      });

      const recipeData = recipeSchema.parse(req.body);

      let hydration: number | undefined;
      let saltPercentage: number | undefined;
      let starterPercentage: number | undefined;

      if (recipeData.flourGrams && recipeData.waterGrams) {
        hydration = (recipeData.waterGrams / recipeData.flourGrams) * 100;
      }

      if (recipeData.flourGrams && recipeData.saltGrams) {
        saltPercentage = (recipeData.saltGrams / recipeData.flourGrams) * 100;
      }

      if (recipeData.flourGrams && recipeData.starterGrams) {
        starterPercentage = (recipeData.starterGrams / recipeData.flourGrams) * 100;
      }

      // Process recipe text if provided
      if (recipeData.recipeText && !recipeData.flourGrams) {
        const flourMatch = recipeData.recipeText.match(/(\d+)\s*g(?:rams)?\s*(?:of)?\s*flour/i);
        if (flourMatch) {
          recipeData.flourGrams = parseInt(flourMatch[1]);
        }

        const waterMatch = recipeData.recipeText.match(/(\d+)\s*g(?:rams)?\s*(?:of)?\s*water/i);
        if (waterMatch && recipeData.flourGrams) {
          recipeData.waterGrams = parseInt(waterMatch[1]);
          hydration = (recipeData.waterGrams / recipeData.flourGrams) * 100;
        }

        const saltMatch = recipeData.recipeText.match(/(\d+)\s*g(?:rams)?\s*(?:of)?\s*salt/i);
        if (saltMatch && recipeData.flourGrams) {
          recipeData.saltGrams = parseInt(saltMatch[1]);
          saltPercentage = (recipeData.saltGrams / recipeData.flourGrams) * 100;
        }

        const starterMatch = recipeData.recipeText.match(/(\d+)\s*g(?:rams)?\s*(?:of)?\s*(?:sourdough)?\s*starter/i);
        if (starterMatch && recipeData.flourGrams) {
          recipeData.starterGrams = parseInt(starterMatch[1]);
          starterPercentage = (recipeData.starterGrams / recipeData.flourGrams) * 100;
        }
      }

      const hydrationAnalysis = getHydrationAnalysis(hydration);
      const saltAnalysis = getSaltAnalysis(saltPercentage);
      const starterAnalysis = getStarterAnalysis(starterPercentage);

      const suggestions = [];
      if (hydrationAnalysis.suggestion) suggestions.push(hydrationAnalysis.suggestion);
      if (saltAnalysis.suggestion) suggestions.push(saltAnalysis.suggestion);
      if (starterAnalysis.suggestion) suggestions.push(starterAnalysis.suggestion);

      let recipeScore = 75;
      if (hydration) {
        if (hydration < 60 || hydration > 80) recipeScore -= 10;
        else if (hydration >= 65 && hydration <= 75) recipeScore += 5;
      }
      if (saltPercentage) {
        if (saltPercentage < 1.5 || saltPercentage > 2.5) recipeScore -= 5;
        else if (saltPercentage >= 1.8 && saltPercentage <= 2.2) recipeScore += 5;
      }
      if (starterPercentage) {
        if (starterPercentage < 10 || starterPercentage > 30) recipeScore -= 5;
        else if (starterPercentage >= 15 && starterPercentage <= 25) recipeScore += 5;
      }
      recipeScore = Math.max(0, Math.min(100, recipeScore));

      let overallAssessment = "";
      if (recipeScore >= 90) overallAssessment = "Excellent recipe with ideal proportions for consistent results.";
      else if (recipeScore >= 80) overallAssessment = "Very good recipe with well-balanced formulation.";
      else if (recipeScore >= 70) overallAssessment = "Good basic recipe that could benefit from minor adjustments.";
      else if (recipeScore >= 60) overallAssessment = "Workable recipe that needs some refinement for better results.";
      else overallAssessment = "Recipe may present challenges; consider significant reformulation.";

      const recommendedFlavorProfile: string[] = [];
      if (starterAnalysis.flavorProfile) {
        recommendedFlavorProfile.push(...starterAnalysis.flavorProfile);
      }
      if (hydration) {
        if (hydration > 75) {
          if (!recommendedFlavorProfile.includes("tangy")) recommendedFlavorProfile.push("tangy");
          if (!recommendedFlavorProfile.includes("rustic")) recommendedFlavorProfile.push("rustic");
        } else if (hydration < 65) {
          if (!recommendedFlavorProfile.includes("mild")) recommendedFlavorProfile.push("mild");
          if (!recommendedFlavorProfile.includes("nutty")) recommendedFlavorProfile.push("nutty");
        } else {
          if (!recommendedFlavorProfile.includes("balanced")) recommendedFlavorProfile.push("balanced");
        }
      }

      const validationResult = {
        hydrationPercentage: hydration ? parseFloat(hydration.toFixed(1)) : undefined,
        saltPercentage: saltPercentage ? parseFloat(saltPercentage.toFixed(1)) : undefined,
        starterPercentage: starterPercentage ? parseFloat(starterPercentage.toFixed(1)) : undefined,
        recipeScore,
        hydrationAnalysis: hydrationAnalysis.assessment,
        saltAnalysis: saltAnalysis.assessment,
        starterAnalysis: starterAnalysis.assessment,
        overallAssessment,
        suggestions,
        recommendedFlavorProfile,
      };

      logger.info("Validated recipe", { recipeScore, hydration, saltPercentage, starterPercentage });
      return successResponse(res, validationResult);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error validating recipe", { error });
      return errorResponse(res, "Failed to validate recipe", 500);
    }
  });

  /**
   * POST /api/recipe-validator/scrape
   * Scrape a recipe from a URL for validation
   */
  app.post("/api/recipe-validator/scrape", recipeLimiter, async (req, res) => {
    try {
      const { url } = req.body;

      if (!url || url.trim() === "") {
        return errorResponse(res, "URL is required", 400);
      }

      if (!url.match(/^https?:\/\//i)) {
        return errorResponse(res, "Invalid URL format. URL must start with http:// or https://", 400);
      }

      logger.info("Scraping recipe for validation", { url });
      const scrapedRecipe = await scrapeRecipeFromUrl(url);

      if (!scrapedRecipe) {
        return notFound(res, "Could not extract recipe from the provided URL");
      }

      return successResponse(res, { recipe: scrapedRecipe });
    } catch (error) {
      logger.error("Error scraping recipe for validation", { error });

      if (error instanceof Error) {
        switch (error.message) {
          case "SCRAPING_BLOCKED":
            return errorResponse(res, "This website doesn't allow us to scrape the recipe. Please manually enter the recipe text for analysis.", 403);
          case "TIMEOUT":
            return errorResponse(res, "The website took too long to respond. Please try again or enter the recipe manually.", 408);
          case "NOT_FOUND":
            return notFound(res, "The recipe page could not be found. Please check the URL and try again.");
          case "SERVER_ERROR":
            return errorResponse(res, "The website is currently unavailable. Please try again later or enter the recipe manually.", 502);
          default:
            return errorResponse(res, "Unable to extract recipe from this URL. Please try entering the recipe text manually.", 500);
        }
      }

      return errorResponse(res, "Failed to scrape recipe from URL. Please try entering the recipe text manually.", 500);
    }
  });

  /**
   * POST /api/predict-recipe-success
   * Predict recipe success based on skill level and recipe characteristics
   */
  app.post("/api/predict-recipe-success", recipeLimiter, async (req, res) => {
    try {
      const { recipeText, skillLevel, bakingFrequency, environment, recipeName, userId } = req.body;

      if ((!recipeText || recipeText.trim() === "") && (!req.body.url || req.body.url.trim() === "")) {
        return errorResponse(res, "Recipe text or URL is required", 400);
      }

      if (!skillLevel) {
        return errorResponse(res, "Skill level is required", 400);
      }

      logger.info("Predicting recipe success", { skillLevel, hasUrl: !!req.body.url, userId });

      let analysisResult;
      let scrapedRecipe = null;

      if (req.body.url) {
        scrapedRecipe = await scrapeRecipeFromUrl(req.body.url);

        if (!scrapedRecipe) {
          return notFound(res, "Could not extract recipe from the provided URL");
        }

        const recipeTextFromUrl = `${scrapedRecipe.title}\n\nIngredients:\n${scrapedRecipe.ingredients.join("\n")}\n\nInstructions:\n${scrapedRecipe.instructions.join("\n")}`;
        analysisResult = await analyzeRecipe(recipeTextFromUrl, scrapedRecipe.title);
      } else {
        analysisResult = await analyzeRecipe(recipeText, recipeName);
      }

      const hydration = analysisResult.extractedRecipe?.hydration || null;
      let successProbability = 85;
      const riskFactors = [];
      const tips = [];

      if (hydration) {
        if (hydration >= 80) {
          if (skillLevel === "beginner") {
            successProbability = 35;
            riskFactors.push("Very high hydration (80%+) is extremely challenging for beginners");
            tips.push("Consider starting with 65-70% hydration recipes first");
            tips.push("Use stretch and folds every 30 minutes during bulk fermentation");
          } else if (skillLevel === "intermediate") {
            successProbability = 55;
            riskFactors.push("High hydration requires advanced handling techniques");
            tips.push("Keep your hands and work surface lightly wet when handling");
          } else if (skillLevel === "advanced") {
            successProbability = 75;
            tips.push("Use coil folds instead of traditional stretch and folds");
          }
        } else if (hydration >= 75) {
          if (skillLevel === "beginner") {
            successProbability = 45;
            riskFactors.push("High hydration (75%+) is very sticky and difficult to handle");
            tips.push("Practice with lower hydration recipes first");
            tips.push("Use a bench scraper to help with dough handling");
          } else if (skillLevel === "intermediate") {
            successProbability = 70;
            tips.push("Work quickly and confidently during shaping");
            tips.push("Ensure your starter is very active for high hydration doughs");
          }
        } else if (hydration >= 70) {
          if (skillLevel === "beginner") {
            successProbability = 65;
            tips.push("This hydration level is manageable with practice");
            tips.push("Focus on gentle handling to maintain dough structure");
          } else if (skillLevel === "intermediate") {
            successProbability = 80;
          }
        } else if (hydration <= 65) {
          if (skillLevel === "beginner") {
            successProbability = 85;
            tips.push("This is a great hydration level for building confidence");
          }
        }
      }

      if (skillLevel === "expert") {
        successProbability = Math.min(95, successProbability + 10);
      } else if (skillLevel === "advanced") {
        successProbability = Math.min(90, successProbability + 5);
      } else if (skillLevel === "beginner") {
        if (bakingFrequency === "occasionally") {
          successProbability = Math.max(30, successProbability - 10);
          riskFactors.push("Infrequent baking can make technique development challenging");
        }
      }

      if (skillLevel === "beginner") {
        tips.push("Take detailed notes during each step for future reference");
        tips.push("Don't rush the process - fermentation takes time");
      } else if (skillLevel === "intermediate") {
        tips.push("Focus on consistency in your techniques");
        tips.push("Pay attention to dough feel and visual cues");
      }

      if (environment === "professional") {
        successProbability = Math.min(95, successProbability + 5);
      }

      const predictionResult = {
        successProbability: Math.round(successProbability),
        extractedRecipe: analysisResult.extractedRecipe,
        analysis: analysisResult.analysis,
        scrapedRecipe,
        riskFactors,
        tips,
        skillLevel,
        bakingFrequency,
        environment,
      };

      if (userId) {
        const validationData: InsertRecipeValidation = {
          userId,
          recipeName: recipeName || scrapedRecipe?.title || "Untitled Recipe",
          recipeInput: recipeText || req.body.url,
          ingredients: analysisResult.extractedRecipe?.ingredients || null,
          instructions: analysisResult.extractedRecipe?.instructions || null,
          analysis: JSON.stringify(predictionResult),
          suggestions: analysisResult.suggestions,
        };

        const savedValidation = await storage.createRecipeValidation(validationData);
        logger.info("Saved recipe validation", { validationId: savedValidation.id, userId });

        return successResponse(res, {
          ...predictionResult,
          id: savedValidation.id,
          saved: true,
        });
      }

      return successResponse(res, {
        ...predictionResult,
        saved: false,
      });
    } catch (error) {
      logger.error("Error predicting recipe success", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to predict recipe success",
        500
      );
    }
  });

  /**
   * GET /api/recipe-validator/user/:userId
   * Get user's saved recipe validations
   */
  app.get("/api/recipe-validator/user/:userId", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const validations = await storage.getUserRecipeValidations(userId);
      logger.info("Fetched user recipe validations", { userId, count: validations.length });
      return successResponse(res, validations);
    } catch (error) {
      logger.error("Error fetching recipe validations", { error, userId: req.params.userId });
      return errorResponse(res, "Failed to fetch recipe validations", 500);
    }
  });

  /**
   * GET /api/recipe-validator/:id
   * Get a specific recipe validation
   */
  app.get("/api/recipe-validator/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const validationId = parseInt(req.params.id);
      const validation = await storage.getRecipeValidationById(validationId);

      if (!validation) {
        return notFound(res, "Recipe validation not found");
      }

      logger.info("Fetched recipe validation", { validationId });
      return successResponse(res, validation);
    } catch (error) {
      logger.error("Error fetching recipe validation", { error, validationId: req.params.id });
      return errorResponse(res, "Failed to fetch recipe validation", 500);
    }
  });

  /**
   * DELETE /api/recipe-validator/:id
   * Delete a recipe validation
   */
  app.delete("/api/recipe-validator/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const validationId = parseInt(req.params.id);
      const result = await storage.deleteRecipeValidation(validationId);

      if (!result) {
        return notFound(res, "Recipe validation not found");
      }

      logger.info("Deleted recipe validation", { validationId, userId: (req.user as any)?.id });
      return successResponse(res, { success: true, message: "Recipe validation deleted successfully" });
    } catch (error) {
      logger.error("Error deleting recipe validation", { error, validationId: req.params.id });
      return errorResponse(res, "Failed to delete recipe validation", 500);
    }
  });
}

/**
 * Helper function: Analyze hydration percentage
 */
function getHydrationAnalysis(hydration?: number) {
  if (!hydration) return { assessment: "Cannot determine hydration" };

  if (hydration < 60) {
    return {
      assessment: "Lower than typical sourdough hydration",
      suggestion: "Consider increasing water for more open crumb",
    };
  } else if (hydration > 80) {
    return {
      assessment: "Higher than typical hydration",
      suggestion: "This dough may be difficult to handle; consider reducing water by 5-10% or using a higher protein flour",
    };
  } else {
    return {
      assessment: "Within standard sourdough hydration range",
      suggestion: null,
    };
  }
}

/**
 * Helper function: Analyze salt percentage
 */
function getSaltAnalysis(saltPercentage?: number) {
  if (!saltPercentage) return { assessment: "Cannot determine salt percentage" };

  if (saltPercentage < 1.5) {
    return {
      assessment: "Salt is lower than recommended",
      suggestion: "Increase salt to 1.8-2.2% of flour weight for better flavor",
    };
  } else if (saltPercentage > 2.5) {
    return {
      assessment: "Salt is higher than typical",
      suggestion: "Consider reducing salt to 1.8-2.2% of flour weight",
    };
  } else {
    return {
      assessment: "Salt percentage is within ideal range",
      suggestion: null,
    };
  }
}

/**
 * Helper function: Analyze starter percentage
 */
function getStarterAnalysis(starterPercentage?: number): {
  assessment: string;
  suggestion?: string;
  flavorProfile?: string[];
} {
  if (!starterPercentage) return { assessment: "Cannot determine starter percentage" };

  let flavorProfile: string[] = [];
  let recommendedStarterNote: string = "";

  if (starterPercentage < 10) {
    flavorProfile = ["mild", "fruity"];
    recommendedStarterNote = "Consider our Kombucha Sourdough Starter for this low starter percentage recipe, which provides a mild tanginess with subtle fruity notes.";
    return {
      assessment: "Starter percentage is low",
      suggestion: "Low starter percentage will result in longer fermentation. Ensure ambient temperature is warm enough. " + recommendedStarterNote,
      flavorProfile,
    };
  } else if (starterPercentage > 30) {
    flavorProfile = ["tangy", "acidic", "classic"];
    recommendedStarterNote = "Our San Francisco Style Sourdough Starter would complement this high starter percentage recipe, providing excellent tanginess and classic flavor.";
    return {
      assessment: "Starter percentage is high",
      suggestion: "High starter percentage will result in faster fermentation. Watch carefully to avoid over-fermentation. " + recommendedStarterNote,
      flavorProfile,
    };
  } else if (starterPercentage >= 20 && starterPercentage <= 30) {
    flavorProfile = ["balanced", "versatile", "moderate tang"];
    recommendedStarterNote = "A mature sourdough starter would work perfectly with this balanced starter percentage, providing consistent results.";
    return {
      assessment: "Starter percentage is within ideal range for balanced sourdough",
      suggestion: recommendedStarterNote,
      flavorProfile,
    };
  } else {
    flavorProfile = ["sweet", "complex", "umami"];
    recommendedStarterNote = "Our Koji Sourdough Starter would be excellent for this moderate starter percentage, providing unique sweet and complex flavors.";
    return {
      assessment: "Starter percentage is within moderate range",
      suggestion: recommendedStarterNote,
      flavorProfile,
    };
  }
}
