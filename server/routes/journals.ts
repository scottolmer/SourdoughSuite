import { Express } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { optionalAuth } from "../middleware/auth";
import { insertBakingLogSchema } from "../../shared/schema";
import logger from "../config/logger";

/**
 * Register all baking journal/log-related routes
 * Baking session logging, performance tracking, and analytics
 */
export function registerJournalRoutes(app: Express) {

  /**
   * GET /api/baking-logs
   * Get baking logs with optional filtering by recipe or starter
   */
  app.get("/api/baking-logs", async (req, res) => {
    try {
      const recipeId = req.query.recipeId ? parseInt(req.query.recipeId as string) : undefined;
      const starterId = req.query.starterId ? parseInt(req.query.starterId as string) : undefined;

      let bakingLogs;
      if (recipeId && starterId) {
        bakingLogs = await storage.getStarterBakingLogsByRecipe(starterId, recipeId);
        logger.info("Fetched baking logs by starter and recipe", {
          starterId,
          recipeId,
          count: bakingLogs.length
        });
      } else if (recipeId) {
        bakingLogs = await storage.getBakingLogsByRecipeId(recipeId);
        logger.info("Fetched baking logs by recipe", {
          recipeId,
          count: bakingLogs.length
        });
      } else if (starterId) {
        bakingLogs = await storage.getStarterBakingLogs(starterId);
        logger.info("Fetched baking logs by starter", {
          starterId,
          count: bakingLogs.length
        });
      } else {
        bakingLogs = await storage.getAllBakingLogs();
        logger.info("Fetched all baking logs", { count: bakingLogs.length });
      }

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

      // Verify the starter exists
      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return notFound(res, "Starter not found");
      }

      const bakingLogs = await storage.getStarterBakingLogs(starterId);
      logger.info("Fetched starter baking logs", {
        starterId,
        count: bakingLogs.length
      });
      return successResponse(res, bakingLogs);
    } catch (error) {
      logger.error("Error fetching starter baking logs", {
        error,
        starterId: req.params.id
      });
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

      // Verify the starter exists
      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return notFound(res, "Starter not found");
      }

      // Verify the recipe exists
      const recipe = await storage.getRecipeById(recipeId);
      if (!recipe) {
        return notFound(res, "Recipe not found");
      }

      const bakingLogs = await storage.getStarterBakingLogsByRecipe(starterId, recipeId);
      logger.info("Fetched baking logs for recipe with starter", {
        starterId,
        recipeId,
        count: bakingLogs.length
      });
      return successResponse(res, bakingLogs);
    } catch (error) {
      logger.error("Error fetching baking logs for recipe", {
        error,
        starterId: req.params.starterId,
        recipeId: req.params.recipeId
      });
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

      logger.info("Fetched baking log", { logId });
      return successResponse(res, bakingLog);
    } catch (error) {
      logger.error("Error fetching baking log", { error, logId: req.params.id });
      return errorResponse(res, "Failed to fetch baking log", 500);
    }
  });

  /**
   * POST /api/baking-logs
   * Add a new baking log entry
   */
  app.post("/api/baking-logs", optionalAuth, async (req, res) => {
    try {
      // Log the incoming request for debugging
      logger.info("Baking log creation request", {
        hasBody: !!req.body,
        bodyKeys: Object.keys(req.body || {})
      });

      // Parse with schema validation
      const bakingLog = insertBakingLogSchema.parse(req.body);

      logger.info("Successfully validated baking log data", {
        recipeId: bakingLog.recipeId,
        starterId: bakingLog.starterId
      });

      const newBakingLog = await storage.createBakingLog(bakingLog);
      logger.info("Created baking log", { logId: newBakingLog.id });
      return successResponse(res, newBakingLog, "Baking log created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error("Zod validation error creating baking log", {
          errors: error.errors
        });
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
  app.patch("/api/baking-logs/:id", optionalAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const logId = parseInt(req.params.id);

      // Check if the log exists
      const existingLog = await storage.getBakingLogById(logId);
      if (!existingLog) {
        return notFound(res, "Baking log not found");
      }

      // Partial validation of the update data
      const updateData = req.body;

      logger.info("Updating baking log", {
        logId,
        updateFields: Object.keys(updateData)
      });

      const updatedLog = await storage.updateBakingLog(logId, updateData);
      logger.info("Updated baking log successfully", { logId });
      return successResponse(res, updatedLog);
    } catch (error) {
      logger.error("Error updating baking log", { error, logId: req.params.id });
      return errorResponse(res, "Failed to update baking log", 500);
    }
  });

  /**
   * DELETE /api/baking-logs/:id
   * Delete a baking log entry
   */
  app.delete("/api/baking-logs/:id", optionalAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      const success = await storage.deleteBakingLog(logId);

      if (!success) {
        return notFound(res, "Baking log not found");
      }

      logger.info("Deleted baking log", { logId });
      return successResponse(res, { success: true });
    } catch (error) {
      logger.error("Error deleting baking log", { error, logId: req.params.id });
      return errorResponse(res, "Failed to delete baking log", 500);
    }
  });
}
