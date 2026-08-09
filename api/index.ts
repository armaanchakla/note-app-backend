import { Request, Response } from "express";
import { createApp } from "../src/app";
import { connectDatabase } from "../src/config/database";
import { env } from "../src/config/env";

let app: ReturnType<typeof createApp> | null = null;

async function getApp() {
  if (!app) {
    await connectDatabase(env.mongodbUri);
    app = createApp();
  }

  return app;
}

export default async function handler(req: Request, res: Response) {
  try {
    const application = await getApp();

    return application(req, res);
  } catch (error) {
    console.error("Application initialization failed:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
