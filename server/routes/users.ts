import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import logger from "../config/logger";
import { insertUserPreferencesSchema } from "../../shared/schema";
import { ZodError, fromZodError } from "zod-validation-error";

/**
 * Register all user-related routes
 * User preferences and profile management
 */
export function registerUserRoutes(app: Express) {

  /**
   * GET /api/user/preferences/:userId
   * Get user preferences
   */
  app.get("/api/user/preferences/:userId", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getUserPreferences(userId);

      if (!preferences) {
        return notFound(res, "User preferences not found");
      }

      logger.info("Fetched user preferences", { userId });
      return successResponse(res, preferences);
    } catch (error) {
      logger.error("Error fetching user preferences", { error, userId: req.params.userId });
      return errorResponse(res, "Failed to fetch user preferences", 500);
    }
  });

  /**
   * POST /api/user/preferences
   * Create user preferences
   */
  app.post("/api/user/preferences", requireAuth, async (req, res) => {
    try {
      const preferences = insertUserPreferencesSchema.parse(req.body);
      const newPreferences = await storage.createUserPreferences(preferences);
      logger.info("Created user preferences", { userId: newPreferences.userId });
      return successResponse(res, newPreferences, "User preferences created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating user preferences", { error });
      return errorResponse(res, "Failed to create user preferences", 500);
    }
  });

  /**
   * PATCH /api/user/preferences/:userId
   * Update user preferences
   */
  app.patch("/api/user/preferences/:userId", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferencesSchema = insertUserPreferencesSchema.partial();
      const preferenceUpdates = preferencesSchema.parse(req.body);

      const updatedPreferences = await storage.updateUserPreferences(userId, preferenceUpdates);
      if (!updatedPreferences) {
        return notFound(res, "User preferences not found");
      }

      logger.info("Updated user preferences", { userId });
      return successResponse(res, updatedPreferences);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error updating user preferences", { error, userId: req.params.userId });
      return errorResponse(res, "Failed to update user preferences", 500);
    }
  });
}
