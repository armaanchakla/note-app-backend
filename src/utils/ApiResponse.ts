import { Response } from "express";
import { PaginationMeta } from "./pagination";

/**
 * Standard success response wrapper.
 */
export function successResponse<T>(
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: PaginationMeta
): Response {
  const body: Record<string, unknown> = { success: true, data };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
}
