import request from "supertest";
import { getApp, createUser, authHeader } from "./helpers";
import { Note } from "../src/models/Note";

const app = getApp();

describe("Notes", () => {
  it("creates a note for authenticated user", async () => {
    const user = await createUser({ email: "note@example.com" });
    const res = await request(app)
      .post("/api/notes")
      .set("Authorization", authHeader(user))
      .send({ title: "My Note", content: "Hello world" });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("My Note");
    expect(res.body.data.userId).toBe(user._id.toString());
  });

  it("rejects creating note without auth", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "My Note", content: "Hello" });
    expect(res.status).toBe(401);
  });

  it("rejects invalid note body", async () => {
    const user = await createUser({ email: "note2@example.com" });
    const res = await request(app)
      .post("/api/notes")
      .set("Authorization", authHeader(user))
      .send({ title: "", content: "" });
    expect(res.status).toBe(400);
  });

  describe("Listing", () => {
    it("returns only the authenticated user's notes", async () => {
      const userA = await createUser({ email: "a@example.com" });
      const userB = await createUser({ email: "b@example.com" });

      await Note.create({ userId: userA._id, title: "A1", content: "c" });
      await Note.create({ userId: userA._id, title: "A2", content: "c" });
      await Note.create({ userId: userB._id, title: "B1", content: "c" });

      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", authHeader(userA));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it("applies default pagination", async () => {
      const user = await createUser({ email: "p@example.com" });
      for (let i = 0; i < 5; i++) {
        await Note.create({
          userId: user._id,
          title: `Note ${i}`,
          content: "c",
        });
      }

      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", authHeader(user));

      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 5,
        totalPages: 1,
      });
    });

    it("supports custom page and limit", async () => {
      const user = await createUser({ email: "custom@example.com" });
      for (let i = 0; i < 25; i++) {
        await Note.create({
          userId: user._id,
          title: `Note ${i}`,
          content: "c",
        });
      }

      const res = await request(app)
        .get("/api/notes?page=2&limit=10")
        .set("Authorization", authHeader(user));

      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.total).toBe(25);
      expect(res.body.pagination.totalPages).toBe(3);
      expect(res.body.data).toHaveLength(10);
    });

    it("caps limit at 100", async () => {
      const user = await createUser({ email: "max@example.com" });
      const res = await request(app)
        .get("/api/notes?limit=1000")
        .set("Authorization", authHeader(user));
      expect(res.body.pagination.limit).toBe(100);
    });
  });

  describe("Ownership", () => {
    it("user cannot view another user's note", async () => {
      const owner = await createUser({ email: "owner@example.com" });
      const other = await createUser({ email: "other@example.com" });

      const note = await Note.create({
        userId: owner._id,
        title: "Secret",
        content: "hidden",
      });

      const res = await request(app)
        .get(`/api/notes/${note._id}`)
        .set("Authorization", authHeader(other));

      expect(res.status).toBe(403);
    });

    it("owner can view own note", async () => {
      const owner = await createUser({ email: "owner2@example.com" });
      const note = await Note.create({
        userId: owner._id,
        title: "Mine",
        content: "visible",
      });

      const res = await request(app)
        .get(`/api/notes/${note._id}`)
        .set("Authorization", authHeader(owner));

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Mine");
    });

    it("user cannot update another user's note", async () => {
      const owner = await createUser({ email: "owner3@example.com" });
      const other = await createUser({ email: "other3@example.com" });
      const note = await Note.create({
        userId: owner._id,
        title: "Original",
        content: "x",
      });

      const res = await request(app)
        .patch(`/api/notes/${note._id}`)
        .set("Authorization", authHeader(other))
        .send({ title: "Hacked" });

      expect(res.status).toBe(403);
    });

    it("owner can update own note", async () => {
      const owner = await createUser({ email: "owner4@example.com" });
      const note = await Note.create({
        userId: owner._id,
        title: "Original",
        content: "x",
      });

      const res = await request(app)
        .patch(`/api/notes/${note._id}`)
        .set("Authorization", authHeader(owner))
        .send({ title: "Updated" });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated");
    });

    it("user cannot delete another user's note", async () => {
      const owner = await createUser({ email: "owner5@example.com" });
      const other = await createUser({ email: "other5@example.com" });
      const note = await Note.create({
        userId: owner._id,
        title: "Original",
        content: "x",
      });

      const res = await request(app)
        .delete(`/api/notes/${note._id}`)
        .set("Authorization", authHeader(other));

      expect(res.status).toBe(403);
    });

    it("owner can delete own note", async () => {
      const owner = await createUser({ email: "owner6@example.com" });
      const note = await Note.create({
        userId: owner._id,
        title: "Original",
        content: "x",
      });

      const res = await request(app)
        .delete(`/api/notes/${note._id}`)
        .set("Authorization", authHeader(owner));

      expect(res.status).toBe(200);
      const found = await Note.findById(note._id);
      expect(found).toBeNull();
    });
  });

  describe("Admin access", () => {
    it("admin can view notes by non-privileged user", async () => {
      const admin = await createUser({
        email: "admin@example.com",
        role: "ADMIN",
      });
      const other = await createUser({ email: "other@example.com" });
      const note = await Note.create({
        userId: other._id,
        title: "Other's note",
        content: "viewable by admin",
      });

      const res = await request(app)
        .get(`/api/notes/${note._id}`)
        .set("Authorization", authHeader(admin));

      expect(res.status).toBe(200);
      expect(res.body.data.userId).toBe(other._id.toString());
    });

    it("admin can list all users' notes", async () => {
      const admin = await createUser({
        email: "admin-list@example.com",
        role: "ADMIN",
      });
      const a = await createUser({ email: "aa@example.com" });
      const b = await createUser({ email: "bb@example.com" });

      await Note.create({ userId: a._id, title: "A", content: "x" });
      await Note.create({ userId: b._id, title: "B", content: "x" });

      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", authHeader(admin));

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(2);
    });
  });

  it("returns 404 for a non-existent note", async () => {
    const user = await createUser({ email: "nf@example.com" });
    const res = await request(app)
      .get(`/api/notes/${"000000000000000000000000"}`)
      .set("Authorization", authHeader(user));
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid objectId", async () => {
    const user = await createUser({ email: "badid@example.com" });
    const res = await request(app)
      .get("/api/notes/not-an-id")
      .set("Authorization", authHeader(user));
    expect(res.status).toBe(400);
  });
});
