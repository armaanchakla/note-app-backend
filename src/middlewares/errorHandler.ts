import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import mongoose from "mongoose";

/**
 * Centralized error handler.
 * Converts various error types into a consistent API error shape.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Known application error.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
  }

  // Mongoose duplicate key (unique email).
  if (err instanceof mongoose.Error && "code" in err && (err as { code?: number }).code === 11000) {
    const field = Object.keys(
      (err as { keyValue?: Record<string, unknown> }).keyValue ?? {}
    );
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_KEY",
        message: `Duplicate value for field(s): ${field.join(", ")}`,
      },
    });
  }

  // Invalid ObjectId cast.
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: `Invalid value for ${err.path}`,
      },
    });
  }

  // Unexpected/unknown errors — don't leak internals in production.
  const message = env.isProduction
    ? "Internal server error"
    : err.message || "Internal server error";

  console.error(`[error] ${err.stack || err.message}`);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message,
    },
  });
}
