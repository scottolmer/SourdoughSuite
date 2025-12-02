import { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { successResponse, errorResponse, notFound, validationError } from "../utils/responses";
import { validateBody, validateParams, idParamSchema, starterFeedingSchema } from "../middleware/validation";
import { requireAuth, optionalAuth } from "../middleware/auth";
import logger from "../config/logger";
import {
  insertStarterSchema,
  insertFeedingLogSchema,
  insertHealthLogSchema,
  insertBakingLogSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Register all starter-related routes
 * Includes starters, feeding logs, health logs, and baking logs
 */
export function registerStarterRoutes(app: Express) {

  // ===== STARTER CRUD =====

  /**
   * GET /api/starters
   * Get all sourdough starters with image URL mapping
   */
  app.get("/api/starters", optionalAuth, async (req, res) => {
    try {
      const starters = await storage.getAllStarters();

      // Update image URLs to use local images
      const updatedStarters = starters.map(starter => {
        const imageMap: Record<number, string> = {
          1: "/images/starters/homemade-starter.png",
          6: "/images/starters/koji-starter.jpg",
          7: "/images/starters/san-francisco-starter.jpg",
          8: "/images/starters/rye-starter.jpg",
          10: "/images/starters/house-blend-starter.jpg",
        };

        return {
          ...starter,
          imageUrl: imageMap[starter.id] || "/images/starters/house-blend-starter.jpg"
        };
      });

      logger.info("Fetched starters", { count: updatedStarters.length });
      return successResponse(res, updatedStarters);
    } catch (error) {
      logger.error("Error fetching starters", { error });
      return errorResponse(res, "Failed to fetch sourdough starters", 500);
    }
  });

  /**
   * GET /api/starters/:id
   * Get a single starter by ID
   */
  app.get("/api/starters/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      const starter = await storage.getStarterById(starterId);

      if (!starter) {
        return notFound(res, "Starter not found");
      }

      logger.info("Fetched starter", { starterId });
      return successResponse(res, starter);
    } catch (error) {
      logger.error("Error fetching starter", { error, starterId: req.params.id });
      return errorResponse(res, "Failed to fetch starter", 500);
    }
  });

  /**
   * POST /api/starters
   * Create a new sourdough starter
   */
  app.post("/api/starters", requireAuth, async (req, res) => {
    try {
      const starter = insertStarterSchema.parse(req.body);
      const newStarter = await storage.createStarter(starter);

      logger.info("Created starter", { starterId: newStarter.id, userId: (req.user as any)?.id });
      return successResponse(res, newStarter, "Starter created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating starter", { error });
      return errorResponse(res, "Failed to create starter", 500);
    }
  });

  /**
   * PUT /api/starters/:id
   * Update a sourdough starter
   */
  app.put("/api/starters/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);

      // Check if starter exists
      const existingStarter = await storage.getStarterById(starterId);
      if (!existingStarter) {
        return notFound(res, "Starter not found");
      }

      // Validate and parse update data
      const starterUpdates = insertStarterSchema.partial().parse(req.body);
      const updatedStarter = await storage.updateStarter(starterId, starterUpdates);

      if (!updatedStarter) {
        return errorResponse(res, "Failed to update starter", 500);
      }

      logger.info("Updated starter", { starterId, userId: (req.user as any)?.id });
      return successResponse(res, updatedStarter, "Starter updated successfully");
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error updating starter", { error, starterId: req.params.id });
      return errorResponse(res, "Failed to update starter", 500);
    }
  });

  /**
   * DELETE /api/starters/:id
   * Delete a sourdough starter
   */
  app.delete("/api/starters/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);

      // Check if starter exists
      const existingStarter = await storage.getStarterById(starterId);
      if (!existingStarter) {
        return notFound(res, "Starter not found");
      }

      const success = await storage.deleteStarter(starterId);
      if (!success) {
        return errorResponse(res, "Failed to delete starter", 500);
      }

      logger.info("Deleted starter", { starterId, userId: (req.user as any)?.id });
      return successResponse(res, { success: true }, "Starter deleted successfully");
    } catch (error) {
      logger.error("Error deleting starter", { error, starterId: req.params.id });
      return errorResponse(res, "Failed to delete starter", 500);
    }
  });

  // ===== FEEDING LOGS =====

  /**
   * GET /api/starters/:id/feeding-logs
   * Get feeding logs for a specific starter, optionally filtered by date
   */
  app.get("/api/starters/:id/feeding-logs", validateParams(idParamSchema), async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);

      // Verify starter exists
      const existingStarter = await storage.getStarterById(starterId);
      if (!existingStarter) {
        return notFound(res, "Starter not found");
      }

      // Check for date filter
      if (req.query.date) {
        const dateParam = req.query.date as string;
        const date = new Date(dateParam);

        if (isNaN(date.getTime())) {
          return errorResponse(res, "Invalid date format", 400);
        }

        const feedingLogs = await storage.getStarterFeedingLogsByDate(starterId, date);
        logger.info("Fetched feeding logs by date", { starterId, date: dateParam, count: feedingLogs.length });
        return successResponse(res, feedingLogs);
      }

      // Return all logs
      const feedingLogs = await storage.getStarterFeedingLogs(starterId);
      logger.info("Fetched feeding logs", { starterId, count: feedingLogs.length });
      return successResponse(res, feedingLogs);
    } catch (error) {
      logger.error("Error fetching feeding logs", { error, starterId: req.params.id });
      return errorResponse(res, "Failed to fetch feeding logs", 500);
    }
  });

  /**
   * GET /api/starters/:id/feeding-log-dates
   * Get dates with feeding logs for calendar display
   */
  app.get("/api/starters/:id/feeding-log-dates", validateParams(idParamSchema), async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);

      // Verify starter exists
      const existingStarter = await storage.getStarterById(starterId);
      if (!existingStarter) {
        return notFound(res, "Starter not found");
      }

      const dates = await storage.getStarterFeedingLogDates(starterId);
      logger.info("Fetched feeding log dates", { starterId, count: dates.length });
      return successResponse(res, { dates });
    } catch (error) {
      logger.error("Error fetching feeding log dates", { error, starterId: req.params.id });
      return errorResponse(res, "Failed to fetch feeding log dates", 500);
    }
  });

  /**
   * POST /api/feeding-logs
   * Create a new feeding log entry
   */
  app.post("/api/feeding-logs", requireAuth, async (req, res) => {
    try {
      const feedingLogData = insertFeedingLogSchema.parse(req.body);

      // Ensure feedingDate is a Date object
      const formattedData = {
        ...feedingLogData,
        feedingDate: new Date(feedingLogData.feedingDate)
      };

      const newFeedingLog = await storage.createFeedingLog(formattedData);
      logger.info("Created feeding log", { feedingLogId: newFeedingLog.id, userId: (req.user as any)?.id });
      return successResponse(res, newFeedingLog, "Feeding log created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating feeding log", { error });
      return errorResponse(res, "Failed to create feeding log", 500);
    }
  });

  /**
   * DELETE /api/feeding-logs/:id
   * Delete a feeding log entry
   */
  app.delete("/api/feeding-logs/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      const success = await storage.deleteFeedingLog(logId);

      if (!success) {
        return notFound(res, "Feeding log not found");
      }

      logger.info("Deleted feeding log", { feedingLogId: logId, userId: (req.user as any)?.id });
      return successResponse(res, { success: true }, "Feeding log deleted successfully");
    } catch (error) {
      logger.error("Error deleting feeding log", { error, feedingLogId: req.params.id });
      return errorResponse(res, "Failed to delete feeding log", 500);
    }
  });

  // ===== HEALTH LOGS =====

  /**
   * GET /api/starters/:id/health-logs
   * Get all health logs for a starter
   */
  app.get("/api/starters/:id/health-logs", validateParams(idParamSchema), async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);

      // Verify starter exists
      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return notFound(res, "Starter not found");
      }

      const healthLogs = await storage.getStarterHealthLogs(starterId);
      logger.info("Fetched health logs", { starterId, count: healthLogs.length });
      return successResponse(res, healthLogs);
    } catch (error) {
      logger.error("Error fetching health logs", { error, starterId: req.params.id });
      return errorResponse(res, "Failed to fetch health logs", 500);
    }
  });

  /**
   * GET /api/starters/:id/health-logs/latest
   * Get the most recent health log for a starter
   */
  app.get("/api/starters/:id/health-logs/latest", validateParams(idParamSchema), async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      const latestLog = await storage.getLatestHealthLog(starterId);

      if (!latestLog) {
        return notFound(res, "No health logs found for this starter");
      }

      logger.info("Fetched latest health log", { starterId, healthLogId: latestLog.id });
      return successResponse(res, latestLog);
    } catch (error) {
      logger.error("Error fetching latest health log", { error, starterId: req.params.id });
      return errorResponse(res, "Failed to fetch latest health log", 500);
    }
  });

  /**
   * POST /api/health-logs
   * Create a new health log entry
   */
  app.post("/api/health-logs", requireAuth, async (req, res) => {
    try {
      const healthLog = insertHealthLogSchema.parse(req.body);
      const newHealthLog = await storage.createHealthLog(healthLog);

      logger.info("Created health log", { healthLogId: newHealthLog.id, userId: (req.user as any)?.id });
      return successResponse(res, newHealthLog, "Health log created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating health log", { error });
      return errorResponse(res, "Failed to create health log", 500);
    }
  });

  /**
   * GET /api/health-logs/:id
   * Get a specific health log
   */
  app.get("/api/health-logs/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const healthLog = await storage.getHealthLogById(id);

      if (!healthLog) {
        return notFound(res, "Health log not found");
      }

      logger.info("Fetched health log", { healthLogId: id });
      return successResponse(res, healthLog);
    } catch (error) {
      logger.error("Error fetching health log", { error, healthLogId: req.params.id });
      return errorResponse(res, "Failed to fetch health log", 500);
    }
  });

  /**
   * PATCH /api/health-logs/:id
   * Update a health log entry
   */
  app.patch("/api/health-logs/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const healthLogSchema = insertHealthLogSchema.partial();
      const healthLogUpdates = healthLogSchema.parse(req.body);

      const updatedLog = await storage.updateHealthLog(id, healthLogUpdates);

      if (!updatedLog) {
        return notFound(res, "Health log not found");
      }

      logger.info("Updated health log", { healthLogId: id, userId: (req.user as any)?.id });
      return successResponse(res, updatedLog, "Health log updated successfully");
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error updating health log", { error, healthLogId: req.params.id });
      return errorResponse(res, "Failed to update health log", 500);
    }
  });

  /**
   * DELETE /api/health-logs/:id
   * Delete a health log entry
   */
  app.delete("/api/health-logs/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHealthLog(id);

      if (!success) {
        return notFound(res, "Health log not found");
      }

      logger.info("Deleted health log", { healthLogId: id, userId: (req.user as any)?.id });
      return successResponse(res, { success: true }, "Health log deleted successfully");
    } catch (error) {
      logger.error("Error deleting health log", { error, healthLogId: req.params.id });
      return errorResponse(res, "Failed to delete health log", 500);
    }
  });

  // ===== BAKING LOGS =====

  /**
   * GET /api/baking-logs
   * Get all baking logs, optionally filtered by recipeId or starterId
   */
  app.get("/api/baking-logs", async (req, res) => {
    try {
      const recipeId = req.query.recipeId ? parseInt(req.query.recipeId as string) : undefined;
      const starterId = req.query.starterId ? parseInt(req.query.starterId as string) : undefined;

      let bakingLogs;
      if (recipeId && starterId) {
        bakingLogs = await storage.getStarterBakingLogsByRecipe(starterId, recipeId);
      } else if (recipeId) {
        bakingLogs = await storage.getBakingLogsByRecipeId(recipeId);
      } else if (starterId) {
        bakingLogs = await storage.getStarterBakingLogs(starterId);
      } else {
        bakingLogs = await storage.getAllBakingLogs();
      }

      logger.info("Fetched baking logs", { count: bakingLogs.length, recipeId, starterId });
      return successResponse(res, bakingLogs);
    } catch (error) {
      logger.error("Error fetching baking logs", { error });
      return errorResponse(res, "Failed to fetch baking logs", 500);
    }
  });

  /**
   * GET /api/starters/:id/baking-logs
   * Get baking logs for a specific starter
   */
  app.get("/api/starters/:id/baking-logs", validateParams(idParamSchema), async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);

      // Verify starter exists
      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return notFound(res, "Starter not found");
      }

      const bakingLogs = await storage.getStarterBakingLogs(starterId);
      logger.info("Fetched baking logs for starter", { starterId, count: bakingLogs.length });
      return successResponse(res, bakingLogs);
    } catch (error) {
      logger.error("Error fetching baking logs", { error, starterId: req.params.id });
      return errorResponse(res, "Failed to fetch baking logs", 500);
    }
  });

  /**
   * GET /api/starters/:starterId/recipes/:recipeId/baking-logs
   * Get baking logs for a specific recipe using a specific starter
   */
  app.get("/api/starters/:starterId/recipes/:recipeId/baking-logs", async (req, res) => {
    try {
      const starterId = parseInt(req.params.starterId);
      const recipeId = parseInt(req.params.recipeId);

      if (isNaN(starterId) || isNaN(recipeId)) {
        return errorResponse(res, "Invalid starter or recipe ID", 400);
      }

      // Verify starter exists
      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return notFound(res, "Starter not found");
      }

      // Verify recipe exists
      const recipe = await storage.getRecipeById(recipeId);
      if (!recipe) {
        return notFound(res, "Recipe not found");
      }

      const bakingLogs = await storage.getStarterBakingLogsByRecipe(starterId, recipeId);
      logger.info("Fetched baking logs for recipe", { starterId, recipeId, count: bakingLogs.length });
      return successResponse(res, bakingLogs);
    } catch (error) {
      logger.error("Error fetching baking logs for recipe", { error, starterId: req.params.starterId, recipeId: req.params.recipeId });
      return errorResponse(res, "Failed to fetch baking logs for recipe", 500);
    }
  });

  /**
   * GET /api/baking-logs/:id
   * Get specific baking log by ID
   */
  app.get("/api/baking-logs/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      const bakingLog = await storage.getBakingLogById(logId);

      if (!bakingLog) {
        return notFound(res, "Baking log not found");
      }

      logger.info("Fetched baking log", { bakingLogId: logId });
      return successResponse(res, bakingLog);
    } catch (error) {
      logger.error("Error fetching baking log", { error, bakingLogId: req.params.id });
      return errorResponse(res, "Failed to fetch baking log", 500);
    }
  });

  /**
   * POST /api/baking-logs
   * Create a new baking log entry
   */
  app.post("/api/baking-logs", requireAuth, async (req, res) => {
    try {
      const bakingLog = insertBakingLogSchema.parse(req.body);
      const newBakingLog = await storage.createBakingLog(bakingLog);

      logger.info("Created baking log", { bakingLogId: newBakingLog.id, userId: (req.user as any)?.id });
      return successResponse(res, newBakingLog, "Baking log created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error("Zod validation error", { errors: error.errors });
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating baking log", { error });
      return errorResponse(res, "Failed to create baking log", 500);
    }
  });

  /**
   * PATCH /api/baking-logs/:id
   * Update a baking log entry
   */
  app.patch("/api/baking-logs/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const logId = parseInt(req.params.id);

      // Check if log exists
      const existingLog = await storage.getBakingLogById(logId);
      if (!existingLog) {
        return notFound(res, "Baking log not found");
      }

      const updatedLog = await storage.updateBakingLog(logId, req.body);
      logger.info("Updated baking log", { bakingLogId: logId, userId: (req.user as any)?.id });
      return successResponse(res, updatedLog, "Baking log updated successfully");
    } catch (error) {
      logger.error("Error updating baking log", { error, bakingLogId: req.params.id });
      return errorResponse(res, "Failed to update baking log", 500);
    }
  });

  /**
   * DELETE /api/baking-logs/:id
   * Delete a baking log entry
   */
  app.delete("/api/baking-logs/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      const success = await storage.deleteBakingLog(logId);

      if (!success) {
        return notFound(res, "Baking log not found");
      }

      logger.info("Deleted baking log", { bakingLogId: logId, userId: (req.user as any)?.id });
      return successResponse(res, { success: true }, "Baking log deleted successfully");
    } catch (error) {
      logger.error("Error deleting baking log", { error, bakingLogId: req.params.id });
      return errorResponse(res, "Failed to delete baking log", 500);
    }
  });

  /**
   * GET /api/starters/:id/recipes
   * Get recipes associated with a starter
   */
  app.get("/api/starters/:id/recipes", validateParams(idParamSchema), async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);

      // Verify starter exists
      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return notFound(res, "Starter not found");
      }

      const recipes = await storage.getStarterRecipes(starterId);
      logger.info("Fetched starter recipes", { starterId, count: recipes.length });
      return successResponse(res, recipes);
    } catch (error) {
      logger.error("Error fetching starter recipes", { error, starterId: req.params.id });
      return errorResponse(res, "Failed to fetch starter recipes", 500);
    }
  });
}
