import { Request, Response, NextFunction } from "express";

/**
 * Authentication middleware to protect routes
 * Checks if user is authenticated via session
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({
    error: "Unauthorized",
    message: "Authentication required"
  });
}

/**
 * Admin authentication middleware
 * Checks if user is authenticated AND has admin privileges
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required"
    });
  }

  // Check if user has admin role
  const user = req.user as any;
  if (!user || user.subscriptionTier !== "master") {
    return res.status(403).json({
      error: "Forbidden",
      message: "Admin privileges required"
    });
  }

  return next();
}

/**
 * Premium user authentication middleware
 * Checks if user has premium or master subscription
 */
export function requirePremium(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required"
    });
  }

  const user = req.user as any;
  if (!user || (user.subscriptionTier !== "premium" && user.subscriptionTier !== "master")) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Premium subscription required"
    });
  }

  return next();
}

/**
 * Optional authentication middleware
 * Continues even if user is not authenticated but sets req.user if they are
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Just continue - req.user will be set by passport if authenticated
  next();
}
