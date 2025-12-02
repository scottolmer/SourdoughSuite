import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { optionalAuth, requireAuth } from "../middleware/auth";
import logger from "../config/logger";
import { insertFaqSchema } from "../../shared/schema";
import { ZodError, fromZodError } from "zod-validation-error";

/**
 * Register all FAQ-related routes
 * Frequently Asked Questions management
 */
export function registerFaqRoutes(app: Express) {

  /**
   * GET /api/faqs
   * Get all FAQs (admin view)
   */
  app.get("/api/faqs", optionalAuth, async (req, res) => {
    try {
      const faqs = await storage.getAllFaqs();
      logger.info("Fetched all FAQs", { count: faqs.length });
      return successResponse(res, faqs);
    } catch (error) {
      logger.error("Error fetching FAQs", { error });
      return errorResponse(res, "Failed to fetch FAQs", 500);
    }
  });

  /**
   * GET /api/faqs/published
   * Get published FAQs only (public view)
   */
  app.get("/api/faqs/published", async (req, res) => {
    try {
      const faqs = await storage.getPublishedFaqs();
      logger.info("Fetched published FAQs", { count: faqs.length });
      return successResponse(res, faqs);
    } catch (error) {
      logger.error("Error fetching published FAQs", { error });
      return errorResponse(res, "Failed to fetch published FAQs", 500);
    }
  });

  /**
   * GET /api/faqs/category/:category
   * Get FAQs by category
   */
  app.get("/api/faqs/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const faqs = await storage.getFaqsByCategory(category);
      logger.info("Fetched FAQs by category", { category, count: faqs.length });
      return successResponse(res, faqs);
    } catch (error) {
      logger.error("Error fetching FAQs by category", { error, category: req.params.category });
      return errorResponse(res, "Failed to fetch FAQs by category", 500);
    }
  });

  /**
   * GET /api/faqs/:id
   * Get single FAQ by ID
   */
  app.get("/api/faqs/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const faqId = parseInt(req.params.id);
      const faq = await storage.getFaqById(faqId);

      if (!faq) {
        return notFound(res, "FAQ not found");
      }

      logger.info("Fetched FAQ", { faqId });
      return successResponse(res, faq);
    } catch (error) {
      logger.error("Error fetching FAQ", { error, faqId: req.params.id });
      return errorResponse(res, "Failed to fetch FAQ", 500);
    }
  });

  /**
   * POST /api/faqs
   * Create a new FAQ (requires authentication)
   */
  app.post("/api/faqs", requireAuth, async (req, res) => {
    try {
      const faq = insertFaqSchema.parse(req.body);
      const newFaq = await storage.createFaq(faq);
      logger.info("Created FAQ", { faqId: newFaq.id, userId: (req.user as any)?.id });
      return successResponse(res, newFaq, "FAQ created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating FAQ", { error });
      return errorResponse(res, "Failed to create FAQ", 500);
    }
  });

  /**
   * PATCH /api/faqs/:id
   * Update an FAQ (requires authentication)
   */
  app.patch("/api/faqs/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const faqId = parseInt(req.params.id);
      const faqSchema = insertFaqSchema.partial();
      const faqUpdates = faqSchema.parse(req.body);

      const updatedFaq = await storage.updateFaq(faqId, faqUpdates);
      if (!updatedFaq) {
        return notFound(res, "FAQ not found");
      }

      logger.info("Updated FAQ", { faqId, userId: (req.user as any)?.id });
      return successResponse(res, updatedFaq);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error updating FAQ", { error, faqId: req.params.id });
      return errorResponse(res, "Failed to update FAQ", 500);
    }
  });

  /**
   * DELETE /api/faqs/:id
   * Delete an FAQ (requires authentication)
   */
  app.delete("/api/faqs/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const faqId = parseInt(req.params.id);
      const success = await storage.deleteFaq(faqId);

      if (!success) {
        return notFound(res, "FAQ not found");
      }

      logger.info("Deleted FAQ", { faqId, userId: (req.user as any)?.id });
      return res.status(204).end();
    } catch (error) {
      logger.error("Error deleting FAQ", { error, faqId: req.params.id });
      return errorResponse(res, "Failed to delete FAQ", 500);
    }
  });
}
