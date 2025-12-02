import winston from "winston";
import { env } from "./env-validation";

/**
 * Custom log format with timestamp and colors
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console format with colors for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}] ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "sourdough-suite" },
  transports: [
    // Console transport with colors for development
    new winston.transports.Console({
      format: env.NODE_ENV === "production" ? logFormat : consoleFormat,
    }),
  ],
});

// Add file transports in production
if (env.NODE_ENV === "production") {
  // Error log file
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Helper functions for common log patterns
 */

/**
 * Log security events (authentication, authorization, etc.)
 */
export function logSecurity(event: string, details: Record<string, any>) {
  logger.warn(`SECURITY: ${event}`, details);
}

/**
 * Log API requests
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: number
) {
  logger.info("API Request", {
    method,
    path,
    statusCode,
    duration,
    userId,
  });
}

/**
 * Log database operations
 */
export function logDatabase(operation: string, table: string, duration?: number) {
  logger.debug("Database Operation", {
    operation,
    table,
    duration,
  });
}

/**
 * Log AI operations (expensive operations to monitor)
 */
export function logAI(operation: string, model: string, tokens?: number, cost?: number) {
  logger.info("AI Operation", {
    operation,
    model,
    tokens,
    cost,
  });
}

/**
 * Log errors with context
 */
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
}

// Export default logger for convenience
export default logger;
