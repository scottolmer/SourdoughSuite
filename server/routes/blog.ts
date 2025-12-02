import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { optionalAuth, requireAuth } from "../middleware/auth";
import logger from "../config/logger";
import { insertBlogPostSchema, updateBlogPostSchema } from "../../shared/schema";
import { ZodError, fromZodError } from "zod-validation-error";
import { SEOService } from "../services/seo-service";

/**
 * Register all blog-related routes
 * Blog post management and SEO endpoints
 */
export function registerBlogRoutes(app: Express) {

  /**
   * GET /api/blog/posts
   * Get all blog posts (admin view)
   */
  app.get("/api/blog/posts", optionalAuth, async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      logger.info("Fetched all blog posts", { count: posts.length });
      return successResponse(res, posts);
    } catch (error) {
      logger.error("Error fetching blog posts", { error });
      return errorResponse(res, "Failed to fetch blog posts", 500);
    }
  });

  /**
   * GET /api/blog/posts/published
   * Get published blog posts (public view)
   */
  app.get("/api/blog/posts/published", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      logger.info("Fetched published blog posts", { count: posts.length });
      return successResponse(res, posts);
    } catch (error) {
      logger.error("Error fetching published blog posts", { error });
      return errorResponse(res, "Failed to fetch published blog posts", 500);
    }
  });

  /**
   * GET /api/blog/posts/slug/:slug
   * Get a single blog post by slug
   */
  app.get("/api/blog/posts/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getBlogPostBySlug(slug);

      if (!post) {
        return notFound(res, "Blog post not found");
      }

      logger.info("Fetched blog post by slug", { slug });
      return successResponse(res, post);
    } catch (error) {
      logger.error("Error fetching blog post by slug", { error, slug: req.params.slug });
      return errorResponse(res, "Failed to fetch blog post", 500);
    }
  });

  /**
   * GET /api/blog/posts/:id
   * Get a single blog post by ID
   */
  app.get("/api/blog/posts/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getBlogPostById(postId);

      if (!post) {
        return notFound(res, "Blog post not found");
      }

      logger.info("Fetched blog post", { postId });
      return successResponse(res, post);
    } catch (error) {
      logger.error("Error fetching blog post", { error, postId: req.params.id });
      return errorResponse(res, "Failed to fetch blog post", 500);
    }
  });

  /**
   * GET /api/blog/categories/:category
   * Get blog posts by category
   */
  app.get("/api/blog/categories/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const posts = await storage.getBlogPostsByCategory(category);
      logger.info("Fetched blog posts by category", { category, count: posts.length });
      return successResponse(res, posts);
    } catch (error) {
      logger.error("Error fetching blog posts by category", { error, category: req.params.category });
      return errorResponse(res, "Failed to fetch blog posts", 500);
    }
  });

  /**
   * GET /api/blog/author/:authorId
   * Get blog posts by author
   */
  app.get("/api/blog/author/:authorId", validateParams(idParamSchema), async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const posts = await storage.getBlogPostsByAuthor(authorId);
      logger.info("Fetched blog posts by author", { authorId, count: posts.length });
      return successResponse(res, posts);
    } catch (error) {
      logger.error("Error fetching blog posts by author", { error, authorId: req.params.authorId });
      return errorResponse(res, "Failed to fetch blog posts", 500);
    }
  });

  /**
   * POST /api/blog/posts
   * Create a new blog post (requires authentication)
   */
  app.post("/api/blog/posts", requireAuth, async (req, res) => {
    try {
      const post = insertBlogPostSchema.parse(req.body);

      // Generate slug from title if not provided
      if (!post.slug) {
        post.slug = post.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special chars
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-'); // Remove consecutive hyphens
      }

      // Auto-generate SEO data if not provided
      const seoData = SEOService.generateSEOData(post);

      const enhancedPost = {
        ...post,
        metaTitle: post.metaTitle || seoData.title,
        metaDescription: post.metaDescription || seoData.description,
        keywords: post.keywords || seoData.keywords,
        canonicalUrl: post.canonicalUrl || seoData.canonicalUrl,
        socialImage: post.socialImage || seoData.socialImage,
        readingTime: seoData.readingTime,
        wordCount: seoData.wordCount
      };

      const newPost = await storage.createBlogPost(enhancedPost);
      logger.info("Created blog post", { postId: newPost.id, userId: (req.user as any)?.id });
      return successResponse(res, newPost, "Blog post created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating blog post", { error });
      return errorResponse(res, "Failed to create blog post", 500);
    }
  });

  /**
   * PATCH /api/blog/posts/:id
   * Update a blog post (requires authentication)
   */
  app.patch("/api/blog/posts/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const postUpdates = updateBlogPostSchema.parse(req.body);

      // Generate slug from title if title is being updated and slug not provided
      if (postUpdates.title && !postUpdates.slug) {
        postUpdates.slug = postUpdates.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }

      // If content or title is being updated, regenerate SEO data
      if (postUpdates.content || postUpdates.title) {
        const existingPost = await storage.getBlogPostById(postId);
        if (existingPost) {
          const updatedPostData = { ...existingPost, ...postUpdates };
          const seoData = SEOService.generateSEOData(updatedPostData);

          // Only update SEO fields if they weren't explicitly provided
          if (!postUpdates.metaTitle) postUpdates.metaTitle = seoData.title;
          if (!postUpdates.metaDescription) postUpdates.metaDescription = seoData.description;
          if (!postUpdates.keywords) postUpdates.keywords = seoData.keywords;
          if (!postUpdates.canonicalUrl) postUpdates.canonicalUrl = seoData.canonicalUrl;
          if (!postUpdates.socialImage) postUpdates.socialImage = seoData.socialImage;
          postUpdates.readingTime = seoData.readingTime;
          postUpdates.wordCount = seoData.wordCount;
        }
      }

      const updatedPost = await storage.updateBlogPost(postId, postUpdates);
      if (!updatedPost) {
        return notFound(res, "Blog post not found");
      }

      logger.info("Updated blog post", { postId, userId: (req.user as any)?.id });
      return successResponse(res, updatedPost);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error updating blog post", { error, postId: req.params.id });
      return errorResponse(res, "Failed to update blog post", 500);
    }
  });

  /**
   * DELETE /api/blog/posts/:id
   * Delete a blog post (requires authentication)
   */
  app.delete("/api/blog/posts/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const success = await storage.deleteBlogPost(postId);

      if (!success) {
        return notFound(res, "Blog post not found");
      }

      logger.info("Deleted blog post", { postId, userId: (req.user as any)?.id });
      return res.status(204).end();
    } catch (error) {
      logger.error("Error deleting blog post", { error, postId: req.params.id });
      return errorResponse(res, "Failed to delete blog post", 500);
    }
  });

  /**
   * GET /blog-sitemap.xml
   * Generate blog sitemap for SEO
   */
  app.get("/blog-sitemap.xml", async (req, res) => {
    try {
      const blogPosts = await storage.getAllBlogPosts();
      const sitemap = SEOService.generateBlogSitemap(blogPosts);

      res.setHeader('Content-Type', 'application/xml');
      res.send(sitemap);
      logger.info("Generated blog sitemap", { postsCount: blogPosts.length });
    } catch (error) {
      logger.error("Error generating blog sitemap", { error });
      res.status(500).send("Failed to generate sitemap");
    }
  });

  /**
   * GET /robots.txt
   * Generate robots.txt for SEO
   */
  app.get("/robots.txt", async (req, res) => {
    try {
      const robotsTxt = SEOService.generateRobotsTxt();

      res.setHeader('Content-Type', 'text/plain');
      res.send(robotsTxt);
      logger.info("Generated robots.txt");
    } catch (error) {
      logger.error("Error generating robots.txt", { error });
      res.status(500).send("Failed to generate robots.txt");
    }
  });
}
