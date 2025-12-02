import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { searchLimiter } from "../middleware/rate-limit";
import logger from "../config/logger";
import { insertProductSchema } from "../../shared/schema";
import { ZodError, fromZodError } from "zod-validation-error";

/**
 * Register all product-related routes
 * E-commerce product catalog management
 */
export function registerProductRoutes(app: Express) {

  /**
   * GET /api/products
   * Get all products
   */
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      logger.info("Fetched all products", { count: products.length });
      return successResponse(res, products);
    } catch (error) {
      logger.error("Error fetching products", { error });
      return errorResponse(res, "Failed to fetch products", 500);
    }
  });

  /**
   * GET /api/products/category/:category
   * Get products by category
   */
  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      logger.info("Fetched products by category", { category, count: products.length });
      return successResponse(res, products);
    } catch (error) {
      logger.error("Error fetching products by category", { error, category: req.params.category });
      return errorResponse(res, "Failed to fetch products by category", 500);
    }
  });

  /**
   * GET /api/products/featured
   * Get featured products
   */
  app.get("/api/products/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const products = await storage.getFeaturedProducts(limit);
      logger.info("Fetched featured products", { limit, count: products.length });
      return successResponse(res, products);
    } catch (error) {
      logger.error("Error fetching featured products", { error });
      return errorResponse(res, "Failed to fetch featured products", 500);
    }
  });

  /**
   * GET /api/products/search
   * Search products by query
   */
  app.get("/api/products/search", searchLimiter, async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== "string") {
        return errorResponse(res, "Search query is required", 400);
      }
      const products = await storage.searchProducts(query);
      logger.info("Searched products", { query, count: products.length });
      return successResponse(res, products);
    } catch (error) {
      logger.error("Error searching products", { error, query: req.query.query });
      return errorResponse(res, "Failed to search products", 500);
    }
  });

  /**
   * GET /api/products/:id
   * Get product by ID
   */
  app.get("/api/products/:id", validateParams(idParamSchema), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);

      if (!product) {
        return notFound(res, "Product not found");
      }

      logger.info("Fetched product", { productId });
      return successResponse(res, product);
    } catch (error) {
      logger.error("Error fetching product", { error, productId: req.params.id });
      return errorResponse(res, "Failed to fetch product", 500);
    }
  });

  /**
   * GET /api/products/slug/:slug
   * Get product by slug
   */
  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);

      if (!product) {
        return notFound(res, "Product not found");
      }

      logger.info("Fetched product by slug", { slug });
      return successResponse(res, product);
    } catch (error) {
      logger.error("Error fetching product by slug", { error, slug: req.params.slug });
      return errorResponse(res, "Failed to fetch product by slug", 500);
    }
  });

  /**
   * POST /api/products
   * Create a new product (requires authentication)
   */
  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(product);
      logger.info("Created product", { productId: newProduct.id, userId: (req.user as any)?.id });
      return successResponse(res, newProduct, "Product created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating product", { error });
      return errorResponse(res, "Failed to create product", 500);
    }
  });

  /**
   * PATCH /api/products/:id
   * Update a product (requires authentication)
   */
  app.patch("/api/products/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const productSchema = insertProductSchema.partial();
      const productUpdates = productSchema.parse(req.body);

      const updatedProduct = await storage.updateProduct(productId, productUpdates);
      if (!updatedProduct) {
        return notFound(res, "Product not found");
      }

      logger.info("Updated product", { productId, userId: (req.user as any)?.id });
      return successResponse(res, updatedProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error updating product", { error, productId: req.params.id });
      return errorResponse(res, "Failed to update product", 500);
    }
  });

  /**
   * DELETE /api/products/:id
   * Delete a product (requires authentication)
   */
  app.delete("/api/products/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const success = await storage.deleteProduct(productId);

      if (!success) {
        return notFound(res, "Product not found");
      }

      logger.info("Deleted product", { productId, userId: (req.user as any)?.id });
      return res.status(204).end();
    } catch (error) {
      logger.error("Error deleting product", { error, productId: req.params.id });
      return errorResponse(res, "Failed to delete product", 500);
    }
  });
}
