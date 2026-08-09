import request from "supertest";
import { getApp } from "./helpers";
import { User } from "../src/models/User";
import { Role } from "../src/types/roles";

const app = getApp();

describe("Authentication", () => {
  describe("POST /api/auth/register", () => {
    it("registers a user and returns token + user (no password)", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        interests: ["chess"],
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeTruthy();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.role).toBe(Role.USER);
    });

    it("rejects duplicate email", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "dup@example.com",
        password: "password123",
      });
      const res = await request(app).post("/api/auth/register").send({
        name: "Bob",
        email: "dup@example.com",
        password: "password123",
      });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("rejects invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "not-an-email",
        password: "password123",
      });
      expect(res.status).toBe(400);
    });

    it("rejects short password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "alice2@example.com",
        password: "short",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with valid credentials", async () => {
      await User.create({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        role: Role.USER,
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "alice@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeTruthy();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("rejects invalid credentials", async () => {
      await User.create({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        role: Role.USER,
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "alice@example.com",
        password: "wrongpassword",
      });
      expect(res.status).toBe(401);
      expect(res.body.data).toBeUndefined();
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns current user with a valid token", async () => {
      const user = await User.create({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        role: Role.USER,
      });

      const login = await request(app).post("/api/auth/login").send({
        email: "alice@example.com",
        password: "password123",
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${login.body.data.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("alice@example.com");
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data._id).toBe(user._id.toString());
    });

    it("rejects without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("rejects invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.value");
      expect(res.status).toBe(401);
    });
  });
});
