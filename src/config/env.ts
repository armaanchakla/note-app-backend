import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Centralized configuration.
 * All secrets and environment-dependent values are read here.
 */
function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number(getEnv("PORT", "5000")),
  mongodbUri: getEnv("MONGODB_URI", "mongodb://localhost:27017/note_app"),
  jwtSecret: getEnv("JWT_SECRET", "change-this-secret"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "1d"),
  corsOrigin: getEnv("CORS_ORIGIN", "http://localhost:8080"),
  isProduction: getEnv("NODE_ENV", "development") === "production",
};
