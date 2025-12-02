import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Middleware factory for validating request bodies with Zod schemas
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: "Validation failed",
          message: validationError.message,
          details: error.errors
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware factory for validating query parameters
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: "Validation failed",
          message: validationError.message,
          details: error.errors
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware factory for validating route parameters
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: "Validation failed",
          message: validationError.message,
          details: error.errors
        });
      }
      next(error);
    }
  };
}

// Common validation schemas for reuse across routes

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10")
}).optional();

export const recipeGenerationSchema = z.object({
  prompt: z.string().min(1).max(1000),
  hydration: z.number().min(50).max(100).optional(),
  weight: z.number().min(100).max(10000).optional(),
  includeTimeline: z.boolean().optional(),
  preferredFlour: z.string().max(100).optional(),
});

export const timelineGenerationSchema = z.object({
  bulkFermentTime: z.number().min(1).max(48),
  proofTime: z.number().min(0.5).max(24),
  startTime: z.string().optional(),
  preferredBakeTime: z.string().optional(),
  temperature: z.number().min(60).max(85).optional(),
});

export const starterFeedingSchema = z.object({
  starterId: z.number().int().positive(),
  starterAmount: z.number().min(1).max(10000),
  flourAmount: z.number().min(1).max(10000),
  waterAmount: z.number().min(1).max(10000),
  notes: z.string().max(500).optional(),
  temperature: z.number().min(60).max(85).optional(),
});

export const recipeValidationSchema = z.object({
  recipeUrl: z.string().url().max(500),
});

export const troubleshootingSchema = z.object({
  issue: z.string().min(10).max(1000),
  recipeDetails: z.object({
    hydration: z.number().min(50).max(100).optional(),
    bulkFermentTime: z.number().optional(),
    proofTime: z.number().optional(),
    temperature: z.number().optional(),
  }).optional(),
  images: z.array(z.string()).optional(),
});

export const userRegistrationSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  displayName: z.string().min(1).max(100).optional(),
});

export const userLoginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(128),
});

export const userUpdateSchema = z.object({
  email: z.string().email().max(255).optional(),
  displayName: z.string().min(1).max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")
    .optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  category: z.string().max(50),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().max(100),
  })).min(1).max(50),
  shippingAddress: z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().min(2).max(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().min(2).max(2),
  }),
  paymentMethodId: z.string().min(1),
});
