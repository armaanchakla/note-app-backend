import { createApp } from "../src/app";
import { User, IUserDocument } from "../src/models/User";
import { Role } from "../src/types/roles";
import { signToken } from "../src/utils/jwt";
import type { App } from "supertest/types";

/**
 * Creates the Express app and returns it for supertest.
 */
export function getApp(): App {
  // Express application is structurally a RequestListener;
  // cast is safe and avoids `any`.
  return createApp() as unknown as App;
}

export async function createUser(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return User.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: Role.USER,
    interests: ["coding"],
    ...overrides,
  });
}

export function authHeader(user: IUserDocument): string {
  const token = signToken(user._id.toString(), user.role);
  return `Bearer ${token}`;
}
