import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../types/roles";

/**
 * Signs a JWT containing only the minimal claims needed for auth.
 */
export function signToken(userId: string, role: Role): string {
  const expiresIn = env.jwtExpiresIn as jwt.SignOptions["expiresIn"];
  return jwt.sign({ userId, role }, env.jwtSecret, { expiresIn });
}
