import { z } from "zod";
import { Role } from "../types/roles";

export const createUserSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email")
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
  role: z.enum([Role.USER, Role.ADMIN]).optional().default(Role.USER),
  interests: z.array(z.string().min(1).max(50)).max(50).optional().default([]),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().toLowerCase().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .optional(),
    role: z.enum([Role.USER, Role.ADMIN]).optional(),
    interests: z.array(z.string().min(1).max(50)).max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const objectIdSchema = z.string().refine(
  (value) => /^[a-fA-F0-9]{24}$/.test(value),
  { message: "Invalid ObjectId" }
);

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
