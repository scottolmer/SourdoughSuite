import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { optionalAuth, requireAuth } from "../middleware/auth";
import logger from "../config/logger";

/**
 * Register all content article routes
 * Educational content and article management
 */
export function registerContentRoutes(app: Express) {

  /**
   * GET /api/content-articles
   * Get all content articles
   */
  app.get("/api/content-articles", optionalAuth, async (req, res) => {
    try {
      const articles = await storage.getAllContentArticles();
      logger.info("Fetched all content articles", { count: articles.length });
      return successResponse(res, articles);
    } catch (error) {
      logger.error("Error fetching content articles", { error });
      return errorResponse(res, "Failed to fetch content articles", 500);
    }
  });

  /**
   * GET /api/content-articles/published
   * Get published content articles
   */
  app.get("/api/content-articles/published", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const articles = await storage.getPublishedContentArticles(limit);
      logger.info("Fetched published content articles", { count: articles.length, limit });
      return successResponse(res, articles);
    } catch (error) {
      logger.error("Error fetching published content articles", { error });
      return errorResponse(res, "Failed to fetch published content articles", 500);
    }
  });

  /**
   * GET /api/content-articles/category/:category
   * Get content articles by category
   */
  app.get("/api/content-articles/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const articles = await storage.getContentArticlesByCategory(category);
      logger.info("Fetched content articles by category", { category, count: articles.length });
      return successResponse(res, articles);
    } catch (error) {
      logger.error("Error fetching content articles by category", { error, category: req.params.category });
      return errorResponse(res, "Failed to fetch content articles by category", 500);
    }
  });

  /**
   * GET /api/content-articles/entity-type/:entityType
   * Get content articles by entity type
   */
  app.get("/api/content-articles/entity-type/:entityType", async (req, res) => {
    try {
      const { entityType } = req.params;
      const articles = await storage.getContentArticlesByEntityType(entityType);
      logger.info("Fetched content articles by entity type", { entityType, count: articles.length });
      return successResponse(res, articles);
    } catch (error) {
      logger.error("Error fetching content articles by entity type", { error, entityType: req.params.entityType });
      return errorResponse(res, "Failed to fetch content articles by entity type", 500);
    }
  });

  /**
   * GET /api/content-articles/entity/:entityType/:entityId
   * Get content articles by entity
   */
  app.get("/api/content-articles/entity/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const articles = await storage.getContentArticlesByEntityId(entityType, parseInt(entityId));
      logger.info("Fetched content articles by entity", { entityType, entityId, count: articles.length });
      return successResponse(res, articles);
    } catch (error) {
      logger.error("Error fetching content articles by entity", { error, entityType: req.params.entityType, entityId: req.params.entityId });
      return errorResponse(res, "Failed to fetch content articles by entity", 500);
    }
  });

  /**
   * GET /api/content-articles/:id
   * Get content article by ID
   */
  app.get("/api/content-articles/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getContentArticleById(id);

      if (!article) {
        return notFound(res, "Content article not found");
      }

      logger.info("Fetched content article", { articleId: id });
      return successResponse(res, article);
    } catch (error) {
      logger.error("Error fetching content article by ID", { error, articleId: req.params.id });
      return errorResponse(res, "Failed to fetch content article", 500);
    }
  });

  /**
   * GET /api/content-articles/by-slug/:slug
   * Get content article by slug (for blog post pages)
   */
  app.get("/api/content-articles/by-slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getContentArticleBySlug(slug);

      if (!article) {
        return notFound(res, "Article not found");
      }

      logger.info("Fetched content article by slug", { slug });
      return successResponse(res, article);
    } catch (error) {
      logger.error("Error fetching content article by slug", { error, slug: req.params.slug });
      return errorResponse(res, "Failed to fetch content article", 500);
    }
  });

  /**
   * GET /api/content-articles/slug/:slug
   * Get content article by slug (alternate route)
   */
  app.get("/api/content-articles/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getContentArticleBySlug(slug);

      if (!article) {
        return notFound(res, "Content article not found");
      }

      logger.info("Fetched content article by slug (alt)", { slug });
      return successResponse(res, article);
    } catch (error) {
      logger.error("Error fetching content article by slug", { error, slug: req.params.slug });
      return errorResponse(res, "Failed to fetch content article", 500);
    }
  });

  /**
   * POST /api/content-articles
   * Create a new content article
   */
  app.post("/api/content-articles", requireAuth, async (req, res) => {
    try {
      const newArticle = req.body;

      // Validation: required fields check
      if (!newArticle.title || !newArticle.content || !newArticle.category) {
        logger.warn("Missing required fields for content article", {
          hasTitle: !!newArticle.title,
          hasContent: !!newArticle.content,
          hasCategory: !!newArticle.category,
        });
        return errorResponse(res, "Missing required fields: title, content, or category", 400);
      }

      // Generate slug if not provided
      if (!newArticle.slug || newArticle.slug.trim() === "") {
        newArticle.slug = newArticle.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      }

      // Ensure slug is never empty
      if (!newArticle.slug || newArticle.slug.trim() === "") {
        newArticle.slug = "article-" + Date.now();
      }

      logger.info("Creating content article", {
        title: newArticle.title,
        slug: newArticle.slug,
        category: newArticle.category,
        userId: (req.user as any)?.id,
      });

      const article = await storage.createContentArticle(newArticle);
      logger.info("Content article created", { articleId: article.id });
      return successResponse(res, article, "Content article created successfully", 201);
    } catch (error) {
      logger.error("Error creating content article", { error });
      return errorResponse(
        res,
        error instanceof Error ? error.message : "Failed to create content article",
        500
      );
    }
  });

  /**
   * PATCH /api/content-articles/:id
   * Update a content article
   */
  app.patch("/api/content-articles/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const articleUpdates = req.body;

      const article = await storage.updateContentArticle(id, articleUpdates);

      if (!article) {
        return notFound(res, "Content article not found");
      }

      logger.info("Updated content article", { articleId: id, userId: (req.user as any)?.id });
      return successResponse(res, article);
    } catch (error) {
      logger.error("Error updating content article", { error, articleId: req.params.id });
      return errorResponse(res, "Failed to update content article", 500);
    }
  });

  /**
   * DELETE /api/content-articles/:id
   * Delete a content article
   */
  app.delete("/api/content-articles/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContentArticle(id);

      if (!success) {
        return notFound(res, "Content article not found");
      }

      logger.info("Deleted content article", { articleId: id, userId: (req.user as any)?.id });
      return res.status(204).end();
    } catch (error) {
      logger.error("Error deleting content article", { error, articleId: req.params.id });
      return errorResponse(res, "Failed to delete content article", 500);
    }
  });
}
