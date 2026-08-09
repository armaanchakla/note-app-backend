import mongoose from "mongoose";
import { env } from "../config/env";
import { User, IUserDocument } from "../models/User";
import { Note } from "../models/Note";
import { Post } from "../models/Post";
import { Role } from "../types/roles";

/**
 * Development-only seed script.
 * Creates an admin, several users with varied interests, notes, and posts.
 */
async function seed(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  console.log("Connected to MongoDB");

  // Clean existing data
  await Promise.all([User.deleteMany({}), Note.deleteMany({}), Post.deleteMany({})]);
  console.log("Cleared existing collections");

  // Admin
  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "adminpassword123",
    role: Role.ADMIN,
    interests: ["engineering", "leadership"],
  });
  console.log("Admin created:", admin.email);

  // Regular users with different interests
  const userData = [
    {
      name: "John Doe",
      email: "john@example.com",
      password: "userpassword123",
      interests: ["chess", "reading", "music"],
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      password: "userpassword123",
      interests: ["reading", "photography"],
    },
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: "userpassword123",
      interests: ["chess", "coding", "gaming"],
    },
    {
      name: "Bob Brown",
      email: "bob@example.com",
      password: "userpassword123",
      interests: ["music", "sports", "chess"],
    },
  ];

  const users: IUserDocument[] = [];
  for (const data of userData) {
    const user = await User.create({
      ...data,
      role: Role.USER,
    });
    users.push(user);
    console.log("User created:", user.email);
  }

  // Notes
  const notesData: Array<{ userId: typeof admin._id; title: string; content: string }> = [
    ...users.map((u, i) => ({
      userId: u._id,
      title: `Meeting notes ${i + 1}`,
      content: `Notes from meeting ${i + 1} about project planning and next steps.`,
    })),
    ...users.map((u, i) => ({
      userId: u._id,
      title: `Personal journal ${i + 1}`,
      content: `Personal journal entry ${i + 1} reflecting on the week.`,
    })),
  ];
  await Note.insertMany(notesData);
  console.log("Notes created:", notesData.length);

  // Posts
  const postsData: Array<{ userId: typeof admin._id; title: string; content: string }> = [
    {
      userId: admin._id,
      title: "Understanding MongoDB aggregation",
      content: "An overview of aggregation pipelines and $lookup joins.",
    },
    ...users.map((u, i) => ({
      userId: u._id,
      title: `Post ${i + 1} by ${u.name}`,
      content: `Public post content number ${i + 1}: learning TypeScript and Node.js.`,
    })),
  ];
  await Post.insertMany(postsData);
  console.log("Posts created:", postsData.length);

  console.log("\n=== Seed complete ===");
  console.log("Admin   -> admin@example.com / adminpassword123");
  console.log("Users   -> <name>@example.com / userpassword123");
  console.log("  john@example.com");
  console.log("  jane@example.com");
  console.log("  alice@example.com");
  console.log("  bob@example.com");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
