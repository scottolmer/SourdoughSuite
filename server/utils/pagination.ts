import { Request } from "express";

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Extract pagination parameters from request query
 * @param req Express request object
 * @param defaultLimit Default items per page (default: 20)
 * @param maxLimit Maximum items per page (default: 100)
 */
export function getPaginationParams(
  req: Request,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginationParams {
  // Parse page number (default to 1)
  let page = parseInt(req.query.page as string) || 1;
  if (page < 1) page = 1;

  // Parse limit (default to defaultLimit)
  let limit = parseInt(req.query.limit as string) || defaultLimit;
  if (limit < 1) limit = 1;
  if (limit > maxLimit) limit = maxLimit;

  // Calculate offset
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Calculate pagination metadata
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 */
export function getPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Paginated response data structure
 */
export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Create a paginated response object
 * @param items Array of items for current page
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): PaginatedData<T> {
  return {
    items,
    meta: getPaginationMeta(page, limit, total),
  };
}
