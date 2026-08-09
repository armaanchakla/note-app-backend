import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";
import { BadRequestError } from "../utils/AppError";

/**
 * Validates a request part (body, query, params) against a Zod schema.
 * On failure, returns a consistent 400 validation error.
 */
export function validate(schema: ZodSchema, part: "body" | "query" | "params"): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return next(
        new BadRequestError("VALIDATION_ERROR", "Validation failed", result.error.flatten())
      );
    }
    req[part] = result.data as Request["body" | "query" | "params"];
    next();
  };
}
