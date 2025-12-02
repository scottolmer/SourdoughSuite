import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { optionalAuth } from "../middleware/auth";
import logger from "../config/logger";

/**
 * Register all video-related routes
 * YouTube integration and video content management
 */
export function registerVideoRoutes(app: Express) {

  /**
   * GET /api/videos
   * Get all videos with optional filtering
   * Query params: category, difficulty, featured
   */
  app.get("/api/videos", optionalAuth, async (req, res) => {
    try {
      const { category, difficulty, featured } = req.query;

      let videos = await storage.getAllVideos();

      // Filter by published status
      videos = videos.filter((video: any) => video.isPublished);

      // Apply category filter
      if (category && category !== 'all') {
        videos = videos.filter((video: any) => video.category === category);
      }

      // Apply difficulty filter
      if (difficulty && difficulty !== 'all') {
        videos = videos.filter((video: any) => video.difficulty === difficulty);
      }

      // Apply featured filter
      if (featured === 'true') {
        videos = videos.filter((video: any) => video.isFeatured);
      }

      // Sort by sort order, then by creation date
      videos.sort((a: any, b: any) => {
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      logger.info("Fetched videos", {
        count: videos.length,
        category,
        difficulty,
        featured
      });
      return successResponse(res, videos);
    } catch (error) {
      logger.error("Error fetching videos", { error });
      return errorResponse(res, "Failed to fetch videos", 500);
    }
  });

  /**
   * GET /api/videos/featured
   * Get featured videos for homepage
   */
  app.get("/api/videos/featured", async (req, res) => {
    try {
      const videos = await storage.getFeaturedVideos();
      logger.info("Fetched featured videos", { count: videos.length });
      return successResponse(res, videos);
    } catch (error) {
      logger.error("Error fetching featured videos", { error });
      return errorResponse(res, "Failed to fetch featured videos", 500);
    }
  });

  /**
   * GET /api/videos/:id
   * Get video by ID
   */
  app.get("/api/videos/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideoById(videoId);

      if (!video) {
        return notFound(res, "Video not found");
      }

      logger.info("Fetched video", { videoId });
      return successResponse(res, video);
    } catch (error) {
      logger.error("Error fetching video", { error, videoId: req.params.id });
      return errorResponse(res, "Failed to fetch video", 500);
    }
  });

  /**
   * GET /api/videos/category/:category
   * Get videos by category
   */
  app.get("/api/videos/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const videos = await storage.getVideosByCategory(category);

      logger.info("Fetched videos by category", { category, count: videos.length });
      return successResponse(res, videos);
    } catch (error) {
      logger.error("Error fetching videos by category", { error, category: req.params.category });
      return errorResponse(res, "Failed to fetch videos by category", 500);
    }
  });
}
