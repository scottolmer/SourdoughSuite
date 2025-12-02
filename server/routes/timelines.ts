import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { requireAuth, optionalAuth } from "../middleware/auth";
import logger from "../config/logger";
import { type InsertBakingTimeline } from "../../shared/schema";

/**
 * Register all timeline-related routes
 * Baking timeline management and scheduling
 */
export function registerTimelineRoutes(app: Express) {

  /**
   * GET /api/timelines
   * Get all timelines for the current user
   */
  app.get("/api/timelines", optionalAuth, async (req, res) => {
    try {
      // Default to user ID 1 for development if not authenticated
      const userId = (req.user as any)?.id || 1;

      const timelines = await storage.getUserTimelines(userId);
      logger.info("Fetched user timelines", { userId, count: timelines.length });
      return successResponse(res, timelines);
    } catch (error) {
      logger.error("Error fetching timelines", { error });
      return errorResponse(res, "Failed to fetch timelines", 500);
    }
  });

  /**
   * GET /api/timelines/:id
   * Get a single timeline by ID
   */
  app.get("/api/timelines/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const timelineId = parseInt(req.params.id);
      const timeline = await storage.getTimelineById(timelineId);

      if (!timeline) {
        return notFound(res, "Timeline not found");
      }

      logger.info("Fetched timeline", { timelineId });
      return successResponse(res, timeline);
    } catch (error) {
      logger.error("Error fetching timeline", { error, timelineId: req.params.id });
      return errorResponse(res, "Failed to fetch timeline", 500);
    }
  });

  /**
   * GET /api/recipes/:recipeId/timelines
   * Get all timelines for a specific recipe
   */
  app.get("/api/recipes/:recipeId/timelines", validateParams(idParamSchema), async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      const timelines = await storage.getTimelinesByRecipeId(recipeId);
      logger.info("Fetched recipe timelines", { recipeId, count: timelines.length });
      return successResponse(res, timelines);
    } catch (error) {
      logger.error("Error fetching recipe timelines", { error, recipeId: req.params.recipeId });
      return errorResponse(res, "Failed to fetch recipe timelines", 500);
    }
  });

  /**
   * POST /api/timelines
   * Create a new baking timeline
   */
  app.post("/api/timelines", optionalAuth, async (req, res) => {
    try {
      // For simplicity, set userId to 1 for development if not authenticated
      const userId = (req.user as any)?.id || 1;

      const timelineData: InsertBakingTimeline = {
        userId,
        recipeName: req.body.recipeName,
        recipeId: req.body.recipeId,
        timelineData: req.body.timelineData,
        startTime: new Date(req.body.startTime),
        desiredFinishTime: new Date(req.body.desiredFinishTime),
        isCompleted: false,
      };

      const timeline = await storage.createTimeline(timelineData);
      logger.info("Created timeline", { timelineId: timeline.id, userId });
      return successResponse(res, timeline, "Timeline created successfully", 201);
    } catch (error) {
      logger.error("Error creating timeline", { error });
      return errorResponse(res, "Failed to create timeline", 500);
    }
  });

  /**
   * PATCH /api/timelines/:id
   * Update a timeline
   */
  app.patch("/api/timelines/:id", optionalAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const timelineId = parseInt(req.params.id);
      const timeline = await storage.updateTimeline(timelineId, req.body);

      if (!timeline) {
        return notFound(res, "Timeline not found");
      }

      logger.info("Updated timeline", { timelineId });
      return successResponse(res, timeline);
    } catch (error) {
      logger.error("Error updating timeline", { error, timelineId: req.params.id });
      return errorResponse(res, "Failed to update timeline", 500);
    }
  });

  /**
   * POST /api/timelines/:id/complete
   * Mark a timeline as complete
   */
  app.post("/api/timelines/:id/complete", optionalAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const timelineId = parseInt(req.params.id);
      const bakingLogId = parseInt(req.body.bakingLogId);

      if (isNaN(bakingLogId)) {
        return errorResponse(res, "Invalid input. Baking log ID is required.", 400);
      }

      const timeline = await storage.markTimelineComplete(timelineId, bakingLogId);

      if (!timeline) {
        return notFound(res, "Timeline not found");
      }

      logger.info("Marked timeline as complete", { timelineId, bakingLogId });
      return successResponse(res, timeline);
    } catch (error) {
      logger.error("Error completing timeline", { error, timelineId: req.params.id });
      return errorResponse(res, "Failed to complete timeline", 500);
    }
  });

  /**
   * DELETE /api/timelines/:id
   * Delete a timeline
   */
  app.delete("/api/timelines/:id", optionalAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const timelineId = parseInt(req.params.id);
      const success = await storage.deleteTimeline(timelineId);

      if (!success) {
        return notFound(res, "Timeline not found");
      }

      logger.info("Deleted timeline", { timelineId });
      return successResponse(res, { success: true });
    } catch (error) {
      logger.error("Error deleting timeline", { error, timelineId: req.params.id });
      return errorResponse(res, "Failed to delete timeline", 500);
    }
  });
}
