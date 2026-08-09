import { z } from "zod";

/**
 * Validates pagination query params.
 * Ensures page and limit are positive integers >= 1.
 * The maximum limit cap (100) and defaulting are enforced by
 * normalizePagination() so behavior is consistent across all endpoints.
 */
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "page must be a positive integer")
    .transform(Number)
    .refine((n) => n >= 1, "page must be >= 1")
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "limit must be a positive integer")
    .transform(Number)
    .refine((n) => n >= 1, "limit must be >= 1")
    .optional(),
});
