import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express";

/**
 * Wraps an async route handler so rejected promises
 * are forwarded to the centralized error handler.
 */
export const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
