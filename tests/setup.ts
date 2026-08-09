import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Use a low bcrypt cost factor in tests to keep hashing fast.
process.env.BCRYPT_ROUNDS = "4";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
