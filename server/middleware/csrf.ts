import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Simple CSRF protection middleware
 * Validates that requests come from the same origin
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints that use API keys or tokens
  // (In the future, when API tokens are implemented)
  const isApiKeyAuth = req.headers["x-api-key"];
  if (isApiKeyAuth) {
    return next();
  }

  // Check Origin header
  const origin = req.headers.origin || req.headers.referer;
  const host = req.headers.host;

  if (!origin) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Origin header is required for this request"
    });
  }

  // Validate origin matches host
  try {
    const originUrl = new URL(origin);
    const expectedHost = host?.split(":")[0]; // Remove port if present

    if (!expectedHost || !originUrl.hostname.endsWith(expectedHost)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Cross-origin requests are not allowed"
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Invalid origin header"
    });
  }
}

/**
 * Double Submit Cookie pattern for CSRF protection
 * More modern approach that doesn't require session state
 */
export function generateCSRFToken(req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    return next();
  }

  // Generate token if it doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }

  // Make token available to views/API
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

/**
 * Validate CSRF token from header or body
 */
export function validateCSRFToken(req: Request, res: Response, next: NextFunction) {
  // Skip for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const token = req.headers["x-csrf-token"] || req.body?.csrfToken;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Invalid or missing CSRF token"
    });
  }

  next();
}
