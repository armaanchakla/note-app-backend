import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import noteRoutes from "./routes/note.routes";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFound";

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );

  // Body parsing with size limit
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  app.get("/", (_req, res) => {
    res.status(200).json({ success: true, data: { status: "ok" } });
  });

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);

  // 404 + centralized error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
