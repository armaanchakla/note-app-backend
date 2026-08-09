import { Request, Response, NextFunction, RequestHandler } from "express";
import { ForbiddenError } from "../utils/AppError";
import { Role } from "../types/roles";

/**
 * Restricts a route to the allowed roles.
 * Must run after authenticate() so req.user is populated.
 */
export function authorizeRoles(...allowedRoles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new ForbiddenError());
    }
    if (!allowedRoles.includes(user.role)) {
      return next(new ForbiddenError());
    }
    next();
  };
}
