import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * Limits all API requests to prevent abuse
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests",
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for AI generation endpoints
 * Very expensive operations that need tight control
 */
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 AI generations per hour
  message: {
    error: "Too many AI requests",
    message: "You've exceeded the AI generation limit. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for authenticated premium users
  skip: (req) => {
    const user = req.user as any;
    return user && (user.subscriptionTier === "premium" || user.subscriptionTier === "master");
  }
});

/**
 * Rate limiter for file upload endpoints
 * Prevents abuse of upload functionality
 */
export const fileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: "Too many uploads",
    message: "You've exceeded the upload limit. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: {
    error: "Too many login attempts",
    message: "Too many login attempts from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Rate limiter for search/query endpoints
 * Prevents database abuse
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 searches per minute
  message: {
    error: "Too many searches",
    message: "You're searching too quickly. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for recipe validation and scraping
 * Expensive operations involving external requests
 */
export const recipeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Limit each IP to 15 recipe validations per hour
  message: {
    error: "Too many recipe validations",
    message: "You've exceeded the recipe validation limit. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
