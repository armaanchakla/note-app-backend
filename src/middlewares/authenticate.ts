import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError, ForbiddenError } from "../utils/AppError";
import { Role } from "../types/roles";

interface JwtPayload {
  userId: string;
  role: Role;
}

/**
 * Verifies the Bearer JWT and attaches the decoded identity to req.user.
 * Rejects when no/invalid/expired token is present.
 */
export function authenticate(): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new UnauthorizedError());
    }

    const token = header.split(" ")[1];
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
      if (!decoded.userId || !decoded.role) {
        return next(
          new ForbiddenError("INVALID_TOKEN", "Invalid token payload"),
        );
      }
      req.user = { userId: decoded.userId, role: decoded.role };
      next();
    } catch {
      return next(
        new UnauthorizedError("INVALID_TOKEN", "Invalid or expired token"),
      );
    }
  };
}
