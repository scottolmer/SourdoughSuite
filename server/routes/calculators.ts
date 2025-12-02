import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { requireAuth, optionalAuth } from "../middleware/auth";
import logger from "../config/logger";

/**
 * Register all calculator and formula-related routes
 * Baker's percentage formulas, troubleshooting guides, and reminders
 */
export function registerCalculatorRoutes(app: Express) {

  /**
   * GET /api/formulas
   * Get all formulas
   */
  app.get("/api/formulas", async (req, res) => {
    try {
      const formulas = await storage.getAllFormulas();
      logger.info("Fetched all formulas", { count: formulas.length });
      return successResponse(res, formulas);
    } catch (error) {
      logger.error("Error fetching formulas", { error });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/formulas/user/:userId
   * Get formulas for a specific user
   */
  app.get("/api/formulas/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return errorResponse(res, "Invalid user ID", 400);
      }

      const formulas = await storage.getUserFormulas(userId);
      logger.info("Fetched user formulas", { userId, count: formulas.length });
      return successResponse(res, formulas);
    } catch (error) {
      logger.error("Error fetching user formulas", { error, userId: req.params.userId });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/formulas/public
   * Get public formulas
   */
  app.get("/api/formulas/public", async (req, res) => {
    try {
      const formulas = await storage.getPublicFormulas();
      logger.info("Fetched public formulas", { count: formulas.length });
      return successResponse(res, formulas);
    } catch (error) {
      logger.error("Error fetching public formulas", { error });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/formulas/:id
   * Get formula by ID
   */
  app.get("/api/formulas/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const formula = await storage.getFormulaById(id);

      if (!formula) {
        return notFound(res, "Formula not found");
      }

      logger.info("Fetched formula", { formulaId: id });
      return successResponse(res, formula);
    } catch (error) {
      logger.error("Error fetching formula", { error, formulaId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * POST /api/formulas
   * Create a new formula with automatic hydration calculation
   */
  app.post("/api/formulas", optionalAuth, async (req, res) => {
    try {
      const formulaData = req.body;

      // Calculate hydration percentage if not provided
      if (!formulaData.hydration && formulaData.ingredients) {
        const ingredients = formulaData.ingredients as any[];
        let totalWater = 0;
        let totalFlour = 0;

        ingredients.forEach(ingredient => {
          if (ingredient.type === 'flour') {
            totalFlour += ingredient.weight;
          } else if (ingredient.type === 'water' || ingredient.type === 'liquid') {
            totalWater += ingredient.weight;
          }
        });

        if (totalFlour > 0) {
          formulaData.hydration = Math.round((totalWater / totalFlour) * 100);
        }
      }

      const newFormula = await storage.createFormula(formulaData);
      logger.info("Created formula", { formulaId: newFormula.id, hydration: newFormula.hydration });
      return successResponse(res, newFormula, "Formula created successfully", 201);
    } catch (error) {
      logger.error("Error creating formula", { error });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * PUT /api/formulas/:id
   * Update a formula with automatic hydration recalculation
   */
  app.put("/api/formulas/:id", optionalAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const formulaData = req.body;

      // Calculate hydration percentage if ingredients provided
      if (formulaData.ingredients) {
        const ingredients = formulaData.ingredients as any[];
        let totalWater = 0;
        let totalFlour = 0;

        ingredients.forEach(ingredient => {
          if (ingredient.type === 'flour') {
            totalFlour += ingredient.weight;
          } else if (ingredient.type === 'water' || ingredient.type === 'liquid') {
            totalWater += ingredient.weight;
          }
        });

        if (totalFlour > 0) {
          formulaData.hydration = Math.round((totalWater / totalFlour) * 100);
        }
      }

      const updatedFormula = await storage.updateFormula(id, formulaData);

      if (!updatedFormula) {
        return notFound(res, "Formula not found");
      }

      logger.info("Updated formula", { formulaId: id, hydration: updatedFormula.hydration });
      return successResponse(res, updatedFormula);
    } catch (error) {
      logger.error("Error updating formula", { error, formulaId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * DELETE /api/formulas/:id
   * Delete a formula
   */
  app.delete("/api/formulas/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFormula(id);

      if (!success) {
        return notFound(res, "Formula not found");
      }

      logger.info("Deleted formula", { formulaId: id });
      return res.status(204).end();
    } catch (error) {
      logger.error("Error deleting formula", { error, formulaId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/troubleshooting
   * Get all troubleshooting issues
   */
  app.get("/api/troubleshooting", async (req, res) => {
    try {
      const issues = await storage.getAllTroubleshootingIssues();
      logger.info("Fetched all troubleshooting issues", { count: issues.length });
      return successResponse(res, issues);
    } catch (error) {
      logger.error("Error fetching troubleshooting issues", { error });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/troubleshooting/published
   * Get published troubleshooting issues
   */
  app.get("/api/troubleshooting/published", async (req, res) => {
    try {
      const issues = await storage.getPublishedTroubleshootingIssues();
      logger.info("Fetched published troubleshooting issues", { count: issues.length });
      return successResponse(res, issues);
    } catch (error) {
      logger.error("Error fetching published troubleshooting issues", { error });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/troubleshooting/category/:category
   * Get troubleshooting issues by category
   */
  app.get("/api/troubleshooting/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const issues = await storage.getTroubleshootingIssuesByCategory(category);
      logger.info("Fetched troubleshooting issues by category", { category, count: issues.length });
      return successResponse(res, issues);
    } catch (error) {
      logger.error("Error fetching troubleshooting issues by category", { error, category: req.params.category });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/troubleshooting/:id
   * Get troubleshooting issue by ID
   */
  app.get("/api/troubleshooting/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.getTroubleshootingIssueById(id);

      if (!issue) {
        return notFound(res, "Troubleshooting issue not found");
      }

      logger.info("Fetched troubleshooting issue", { issueId: id });
      return successResponse(res, issue);
    } catch (error) {
      logger.error("Error fetching troubleshooting issue", { error, issueId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * POST /api/troubleshooting
   * Create a new troubleshooting issue
   */
  app.post("/api/troubleshooting", requireAuth, async (req, res) => {
    try {
      const issueData = req.body;
      const newIssue = await storage.createTroubleshootingIssue(issueData);
      logger.info("Created troubleshooting issue", { issueId: newIssue.id });
      return successResponse(res, newIssue, "Troubleshooting issue created successfully", 201);
    } catch (error) {
      logger.error("Error creating troubleshooting issue", { error });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * PUT /api/troubleshooting/:id
   * Update a troubleshooting issue
   */
  app.put("/api/troubleshooting/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const issueData = req.body;
      const updatedIssue = await storage.updateTroubleshootingIssue(id, issueData);

      if (!updatedIssue) {
        return notFound(res, "Troubleshooting issue not found");
      }

      logger.info("Updated troubleshooting issue", { issueId: id });
      return successResponse(res, updatedIssue);
    } catch (error) {
      logger.error("Error updating troubleshooting issue", { error, issueId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * DELETE /api/troubleshooting/:id
   * Delete a troubleshooting issue
   */
  app.delete("/api/troubleshooting/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTroubleshootingIssue(id);

      if (!success) {
        return notFound(res, "Troubleshooting issue not found");
      }

      logger.info("Deleted troubleshooting issue", { issueId: id });
      return res.status(204).end();
    } catch (error) {
      logger.error("Error deleting troubleshooting issue", { error, issueId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/reminders/user/:userId
   * Get reminders for a specific user
   */
  app.get("/api/reminders/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return errorResponse(res, "Invalid user ID", 400);
      }

      const reminders = await storage.getUserReminders(userId);
      logger.info("Fetched user reminders", { userId, count: reminders.length });
      return successResponse(res, reminders);
    } catch (error) {
      logger.error("Error fetching user reminders", { error, userId: req.params.userId });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/reminders/starter/:starterId
   * Get reminders for a specific starter
   */
  app.get("/api/reminders/starter/:starterId", async (req, res) => {
    try {
      const starterId = parseInt(req.params.starterId);
      if (isNaN(starterId)) {
        return errorResponse(res, "Invalid starter ID", 400);
      }

      const reminders = await storage.getStarterReminders(starterId);
      logger.info("Fetched starter reminders", { starterId, count: reminders.length });
      return successResponse(res, reminders);
    } catch (error) {
      logger.error("Error fetching starter reminders", { error, starterId: req.params.starterId });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/reminders/active
   * Get all active reminders
   */
  app.get("/api/reminders/active", async (req, res) => {
    try {
      const reminders = await storage.getActiveReminders();
      logger.info("Fetched active reminders", { count: reminders.length });
      return successResponse(res, reminders);
    } catch (error) {
      logger.error("Error fetching active reminders", { error });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * GET /api/reminders/:id
   * Get reminder by ID
   */
  app.get("/api/reminders/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reminder = await storage.getReminderById(id);

      if (!reminder) {
        return notFound(res, "Reminder not found");
      }

      logger.info("Fetched reminder", { reminderId: id });
      return successResponse(res, reminder);
    } catch (error) {
      logger.error("Error fetching reminder", { error, reminderId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * POST /api/reminders
   * Create a new reminder
   */
  app.post("/api/reminders", optionalAuth, async (req, res) => {
    try {
      const reminderData = req.body;
      const newReminder = await storage.createReminder(reminderData);
      logger.info("Created reminder", { reminderId: newReminder.id });
      return successResponse(res, newReminder, "Reminder created successfully", 201);
    } catch (error) {
      logger.error("Error creating reminder", { error });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * PUT /api/reminders/:id
   * Update a reminder
   */
  app.put("/api/reminders/:id", optionalAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reminderData = req.body;
      const updatedReminder = await storage.updateReminder(id, reminderData);

      if (!updatedReminder) {
        return notFound(res, "Reminder not found");
      }

      logger.info("Updated reminder", { reminderId: id });
      return successResponse(res, updatedReminder);
    } catch (error) {
      logger.error("Error updating reminder", { error, reminderId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * PUT /api/reminders/:id/toggle
   * Toggle reminder active status
   */
  app.put("/api/reminders/:id/toggle", optionalAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // Get current reminder to toggle its status
      const currentReminder = await storage.getReminderById(id);
      if (!currentReminder) {
        return notFound(res, "Reminder not found");
      }

      const updatedReminder = await storage.updateReminder(id, {
        isActive: !currentReminder.isActive
      });

      if (!updatedReminder) {
        return notFound(res, "Reminder not found");
      }

      logger.info("Toggled reminder status", {
        reminderId: id,
        newStatus: updatedReminder.isActive
      });
      return successResponse(res, updatedReminder);
    } catch (error) {
      logger.error("Error toggling reminder", { error, reminderId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });

  /**
   * DELETE /api/reminders/:id
   * Delete a reminder
   */
  app.delete("/api/reminders/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReminder(id);

      if (!success) {
        return notFound(res, "Reminder not found");
      }

      logger.info("Deleted reminder", { reminderId: id });
      return res.status(204).end();
    } catch (error) {
      logger.error("Error deleting reminder", { error, reminderId: req.params.id });
      return errorResponse(res, "Internal server error", 500);
    }
  });
}
