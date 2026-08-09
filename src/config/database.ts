import mongoose from "mongoose";

/**
 * Establishes the MongoDB connection.
 */
export async function connectDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
