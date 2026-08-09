import request from "supertest";
import { getApp, createUser, authHeader } from "./helpers";
import { User } from "../src/models/User";
import { Role } from "../src/types/roles";

const app = getApp();

describe("Authorization", () => {
  it("normal user cannot access admin users endpoint", async () => {
    const user = await createUser({ email: "normal@example.com" });
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", authHeader(user));
    expect(res.status).toBe(403);
  });

  it("admin can access admin users endpoint", async () => {
    const admin = await createUser({
      email: "admin@example.com",
      role: Role.ADMIN,
    });
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", authHeader(admin));
    expect(res.status).toBe(200);
  });

  it("rejects access without token", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  it("normal user cannot access interests aggregation", async () => {
    const user = await createUser({ email: "normal2@example.com" });
    const res = await request(app)
      .get("/api/users/interests")
      .set("Authorization", authHeader(user));
    expect(res.status).toBe(403);
  });
});

describe("Admin User Management", () => {
  let admin: Awaited<ReturnType<typeof createUser>>;

  beforeEach(async () => {
    admin = await createUser({
      email: "admin-mgmt@example.com",
      role: Role.ADMIN,
    });
  });

  it("admin can create a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", authHeader(admin))
      .send({
        name: "New User",
        email: "new@example.com",
        password: "password123",
        role: Role.USER,
        interests: ["reading"],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("new@example.com");
    expect(res.body.data.password).toBeUndefined();
  });

  it("admin can list users with pagination", async () => {
    for (let i = 0; i < 30; i++) {
      await createUser({ email: `user${i}@example.com` });
    }

    const res = await request(app)
      .get("/api/users?page=2&limit=20")
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(20);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(31);
  });

  it("admin can update a user", async () => {
    const target = await createUser({ email: "target@example.com" });
    const res = await request(app)
      .patch(`/api/users/${target._id}`)
      .set("Authorization", authHeader(admin))
      .send({ name: "Renamed User" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Renamed User");
  });

  it("admin can delete a user", async () => {
    const target = await createUser({ email: "delete@example.com" });
    const res = await request(app)
      .delete(`/api/users/${target._id}`)
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(200);
    const found = await User.findById(target._id);
    expect(found).toBeNull();
  });

  it("admin can fetch a single user", async () => {
    const target = await createUser({ email: "single@example.com" });
    const res = await request(app)
      .get(`/api/users/${target._id}`)
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(target._id.toString());
  });
});
