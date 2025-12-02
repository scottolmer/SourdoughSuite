import { Response } from "express";

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Send a successful response
 */
export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  } as ApiResponse<T>);
}

/**
 * Send a paginated successful response
 */
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data,
    ...(message && { message }),
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  } as ApiResponse<T[]>);
}

/**
 * Send an error response
 */
export function errorResponse(
  res: Response,
  error: string,
  statusCode: number = 500,
  details?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(details && { details }),
  } as ApiResponse);
}

/**
 * Send a validation error response
 */
export function validationError(
  res: Response,
  message: string,
  details?: any
): Response {
  return errorResponse(res, message, 400, details);
}

/**
 * Send an unauthorized error response
 */
export function unauthorized(res: Response, message: string = "Unauthorized"): Response {
  return errorResponse(res, message, 401);
}

/**
 * Send a forbidden error response
 */
export function forbidden(res: Response, message: string = "Forbidden"): Response {
  return errorResponse(res, message, 403);
}

/**
 * Send a not found error response
 */
export function notFound(res: Response, message: string = "Resource not found"): Response {
  return errorResponse(res, message, 404);
}

/**
 * Send a conflict error response
 */
export function conflict(res: Response, message: string = "Conflict"): Response {
  return errorResponse(res, message, 409);
}

/**
 * Send a server error response
 */
export function serverError(res: Response, message: string = "Internal Server Error"): Response {
  return errorResponse(res, message, 500);
}
