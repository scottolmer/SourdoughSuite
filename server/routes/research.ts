import { Express } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { insertResearchSourceSchema, insertResearchTopicSchema, insertResearchClaimSchema, insertResearchArticleSchema } from "../../shared/schema";
import logger from "../config/logger";

/**
 * Register all research and admin-related routes
 * Research sources, topics, claims, articles, and admin functions
 */
export function registerResearchRoutes(app: Express) {

  /**
   * GET /api/research/sources
   * Get all research sources
   */
  app.get("/api/research/sources", async (req, res) => {
    try {
      const sources = await storage.getAllResearchSources();
      logger.info("Fetched all research sources", { count: sources.length });
      return successResponse(res, sources);
    } catch (error) {
      logger.error("Error fetching research sources", { error });
      return errorResponse(res, "Failed to fetch research sources", 500);
    }
  });

  /**
   * GET /api/research/sources/:id
   * Get research source by ID
   */
  app.get("/api/research/sources/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const sourceId = parseInt(req.params.id);
      const source = await storage.getResearchSourceById(sourceId);

      if (!source) {
        return notFound(res, "Research source not found");
      }

      logger.info("Fetched research source", { sourceId });
      return successResponse(res, source);
    } catch (error) {
      logger.error("Error fetching research source", { error, sourceId: req.params.id });
      return errorResponse(res, "Failed to fetch research source", 500);
    }
  });

  /**
   * POST /api/research/sources
   * Create a new research source
   */
  app.post("/api/research/sources", requireAuth, async (req, res) => {
    try {
      const source = insertResearchSourceSchema.parse(req.body);
      const newSource = await storage.createResearchSource(source);
      logger.info("Created research source", { sourceId: newSource.id });
      return successResponse(res, newSource, "Research source created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating research source", { error });
      return errorResponse(res, "Failed to create research source", 500);
    }
  });

  /**
   * GET /api/research/topics
   * Get all research topics
   */
  app.get("/api/research/topics", async (req, res) => {
    try {
      const topics = await storage.getAllResearchTopics();
      logger.info("Fetched all research topics", { count: topics.length });
      return successResponse(res, topics);
    } catch (error) {
      logger.error("Error fetching research topics", { error });
      return errorResponse(res, "Failed to fetch research topics", 500);
    }
  });

  /**
   * GET /api/research/topics/top-level
   * Get top-level research topics
   */
  app.get("/api/research/topics/top-level", async (req, res) => {
    try {
      const topics = await storage.getTopLevelResearchTopics();
      logger.info("Fetched top-level research topics", { count: topics.length });
      return successResponse(res, topics);
    } catch (error) {
      logger.error("Error fetching top-level research topics", { error });
      return errorResponse(res, "Failed to fetch top-level research topics", 500);
    }
  });

  /**
   * GET /api/research/topics/:id/children
   * Get child topics of a specific topic
   */
  app.get("/api/research/topics/:id/children", validateParams(idParamSchema), async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const childTopics = await storage.getChildTopics(topicId);
      logger.info("Fetched child topics", { topicId, count: childTopics.length });
      return successResponse(res, childTopics);
    } catch (error) {
      logger.error("Error fetching child topics", { error, topicId: req.params.id });
      return errorResponse(res, "Failed to fetch child topics", 500);
    }
  });

  /**
   * POST /api/research/topics
   * Create a new research topic
   */
  app.post("/api/research/topics", requireAuth, async (req, res) => {
    try {
      const topic = insertResearchTopicSchema.parse(req.body);
      const newTopic = await storage.createResearchTopic(topic);
      logger.info("Created research topic", { topicId: newTopic.id });
      return successResponse(res, newTopic, "Research topic created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating research topic", { error });
      return errorResponse(res, "Failed to create research topic", 500);
    }
  });

  /**
   * GET /api/research/claims
   * Get research claims with optional filtering
   */
  app.get("/api/research/claims", async (req, res) => {
    try {
      const { topicId, confidence } = req.query;

      let claims;
      if (topicId) {
        claims = await storage.getResearchClaimsByTopic(parseInt(topicId as string));
        logger.info("Fetched research claims by topic", {
          topicId,
          count: claims.length
        });
      } else if (confidence) {
        claims = await storage.getResearchClaimsByConfidence(confidence as string);
        logger.info("Fetched research claims by confidence", {
          confidence,
          count: claims.length
        });
      } else {
        claims = await storage.getAllResearchClaims();
        logger.info("Fetched all research claims", { count: claims.length });
      }

      return successResponse(res, claims);
    } catch (error) {
      logger.error("Error fetching research claims", { error });
      return errorResponse(res, "Failed to fetch research claims", 500);
    }
  });

  /**
   * POST /api/research/claims
   * Create a new research claim
   */
  app.post("/api/research/claims", requireAuth, async (req, res) => {
    try {
      const claim = insertResearchClaimSchema.parse(req.body);
      const newClaim = await storage.createResearchClaim(claim);
      logger.info("Created research claim", { claimId: newClaim.id });
      return successResponse(res, newClaim, "Research claim created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating research claim", { error });
      return errorResponse(res, "Failed to create research claim", 500);
    }
  });

  /**
   * GET /api/research/articles
   * Get research articles with optional filtering
   */
  app.get("/api/research/articles", async (req, res) => {
    try {
      const { published, topicId } = req.query;

      let articles;
      if (published === 'true') {
        articles = await storage.getPublishedResearchArticles();
        logger.info("Fetched published research articles", { count: articles.length });
      } else if (topicId) {
        articles = await storage.getResearchArticlesByTopic(parseInt(topicId as string));
        logger.info("Fetched research articles by topic", {
          topicId,
          count: articles.length
        });
      } else {
        articles = await storage.getAllResearchArticles();
        logger.info("Fetched all research articles", { count: articles.length });
      }

      return successResponse(res, articles);
    } catch (error) {
      logger.error("Error fetching research articles", { error });
      return errorResponse(res, "Failed to fetch research articles", 500);
    }
  });

  /**
   * GET /api/research/articles/:slug
   * Get research article by slug
   */
  app.get("/api/research/articles/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getResearchArticleBySlug(slug);

      if (!article) {
        return notFound(res, "Research article not found");
      }

      logger.info("Fetched research article by slug", { slug });
      return successResponse(res, article);
    } catch (error) {
      logger.error("Error fetching research article", { error, slug: req.params.slug });
      return errorResponse(res, "Failed to fetch research article", 500);
    }
  });

  /**
   * POST /api/research/articles
   * Create a new research article with optional AI summary generation
   */
  app.post("/api/research/articles", requireAuth, async (req, res) => {
    try {
      const article = insertResearchArticleSchema.parse(req.body);

      // Auto-generate summary if requested and content exists
      if (req.body.generateSummary && article.fullContent) {
        try {
          const { generateArticleSummary } = await import('../services/chat-service');
          const aiSummary = await generateArticleSummary(article.fullContent);

          // Update article with AI-generated content
          article.executiveSummary = aiSummary.executiveSummary;
          article.keyFindings = aiSummary.keyFindings;
          article.practicalApplications = aiSummary.practicalApplications;

          logger.info("AI summary generated for research article", {
            hasExecutiveSummary: !!aiSummary.executiveSummary,
            hasKeyFindings: !!aiSummary.keyFindings
          });
        } catch (aiError) {
          logger.warn("AI summary generation failed, continuing with manual summary", {
            error: aiError
          });
        }
      }

      const newArticle = await storage.createResearchArticle(article);
      logger.info("Created research article", { articleId: newArticle.id });
      return successResponse(res, newArticle, "Research article created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating research article", { error });
      return errorResponse(res, "Failed to create research article", 500);
    }
  });

  /**
   * POST /api/research/articles/:id/publish
   * Publish a research article
   */
  app.post("/api/research/articles/:id/publish", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);

      const updatedArticle = await storage.updateResearchArticle(articleId, {
        isPublished: true
      });

      if (!updatedArticle) {
        return notFound(res, "Article not found");
      }

      logger.info("Published research article", { articleId });
      return successResponse(res, updatedArticle);
    } catch (error) {
      logger.error("Error publishing article", { error, articleId: req.params.id });
      return errorResponse(res, "Failed to publish article", 500);
    }
  });

  /**
   * POST /api/research/articles/:id/unpublish
   * Unpublish a research article
   */
  app.post("/api/research/articles/:id/unpublish", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);

      const updatedArticle = await storage.updateResearchArticle(articleId, {
        isPublished: false
      });

      if (!updatedArticle) {
        return notFound(res, "Article not found");
      }

      logger.info("Unpublished research article", { articleId });
      return successResponse(res, updatedArticle);
    } catch (error) {
      logger.error("Error unpublishing article", { error, articleId: req.params.id });
      return errorResponse(res, "Failed to unpublish article", 500);
    }
  });

  /**
   * GET /api/research/citations
   * Get content citations with optional filtering
   */
  app.get("/api/research/citations", async (req, res) => {
    try {
      const { contentType, contentId, sourceId } = req.query;

      let citations;
      if (contentType && contentId) {
        citations = await storage.getContentCitations(
          contentType as string,
          parseInt(contentId as string)
        );
        logger.info("Fetched citations by content", {
          contentType,
          contentId,
          count: citations.length
        });
      } else if (sourceId) {
        citations = await storage.getCitationsBySource(parseInt(sourceId as string));
        logger.info("Fetched citations by source", {
          sourceId,
          count: citations.length
        });
      } else {
        citations = await storage.getAllCitations();
        logger.info("Fetched all citations", { count: citations.length });
      }

      return successResponse(res, citations);
    } catch (error) {
      logger.error("Error fetching citations", { error });
      return errorResponse(res, "Failed to fetch citations", 500);
    }
  });

  /**
   * POST /api/research/citations
   * Create a new content citation
   */
  app.post("/api/research/citations", requireAuth, async (req, res) => {
    try {
      const citation = req.body;
      const newCitation = await storage.createContentCitation(citation);
      logger.info("Created content citation", { citationId: newCitation.id });
      return successResponse(res, newCitation, "Citation created successfully", 201);
    } catch (error) {
      logger.error("Error creating citation", { error });
      return errorResponse(res, "Failed to create citation", 500);
    }
  });

  /**
   * GET /api/admin/processing-jobs
   * Get all processing jobs (admin)
   */
  app.get("/api/admin/processing-jobs", requireAuth, async (req, res) => {
    try {
      const jobs = await storage.getAllProcessingJobs();
      logger.info("Fetched all processing jobs", { count: jobs.length });
      return successResponse(res, jobs);
    } catch (error) {
      logger.error("Error fetching processing jobs", { error });
      return errorResponse(res, "Failed to fetch processing jobs", 500);
    }
  });

  /**
   * GET /api/admin/processing-jobs/:jobId
   * Get processing job by ID (admin)
   */
  app.get("/api/admin/processing-jobs/:jobId", requireAuth, async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const job = await storage.getProcessingJobById(jobId);

      if (!job) {
        return notFound(res, "Processing job not found");
      }

      logger.info("Fetched processing job", { jobId });
      return successResponse(res, job);
    } catch (error) {
      logger.error("Error fetching processing job", { error, jobId: req.params.jobId });
      return errorResponse(res, "Failed to fetch processing job", 500);
    }
  });

  /**
   * POST /api/admin/process-url
   * Process a URL (admin)
   */
  app.post("/api/admin/process-url", requireAuth, async (req, res) => {
    try {
      const { url, processingType } = req.body;

      if (!url) {
        return errorResponse(res, "URL is required", 400);
      }

      logger.info("Processing URL", { url, processingType });

      // Create processing job
      const job = await storage.createProcessingJob({
        jobId: `job_${Date.now()}`,
        status: 'processing',
        sourceUrl: url,
        processingType: processingType || 'article',
        createdAt: new Date()
      });

      // Note: Actual processing would happen asynchronously
      logger.info("Created processing job for URL", { jobId: job.jobId });
      return successResponse(res, job, "Processing job created", 201);
    } catch (error) {
      logger.error("Error processing URL", { error });
      return errorResponse(res, "Failed to process URL", 500);
    }
  });

  /**
   * POST /api/admin/process-file
   * Process an uploaded file (admin)
   */
  app.post("/api/admin/process-file", requireAuth, async (req: any, res) => {
    try {
      if (!req.file && !req.files) {
        return errorResponse(res, "No file uploaded", 400);
      }

      const file = req.file || (req.files && req.files[0]);
      logger.info("Processing uploaded file", {
        filename: file?.originalname,
        size: file?.size
      });

      // Create processing job
      const job = await storage.createProcessingJob({
        jobId: `job_${Date.now()}`,
        status: 'processing',
        sourceUrl: file?.originalname || 'uploaded-file',
        processingType: 'file',
        createdAt: new Date()
      });

      // Note: Actual file processing would happen asynchronously
      logger.info("Created processing job for file", { jobId: job.jobId });
      return successResponse(res, job, "File processing job created", 201);
    } catch (error) {
      logger.error("Error processing file", { error });
      return errorResponse(res, "Failed to process file", 500);
    }
  });
}
