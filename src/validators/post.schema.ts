import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  content: z
    .string({ required_error: "Content is required" })
    .min(1, "Content is required"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
