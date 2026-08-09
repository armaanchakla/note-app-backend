import request from "supertest";
import { getApp, createUser, authHeader } from "./helpers";
import { Post } from "../src/models/Post";
import { Role } from "../src/types/roles";

const app = getApp();

async function adminUser() {
  return createUser({ email: "agg-admin@example.com", role: Role.ADMIN });
}

describe("Aggregation: group users by interests", () => {
  it("groups users by interest with userCount and users", async () => {
    const admin = await adminUser();
    const a = await createUser({
      email: "i1@example.com",
      interests: ["chess", "music"],
    });
    await createUser({
      email: "i2@example.com",
      interests: ["chess", "reading"],
    });
    const c = await createUser({
      email: "i3@example.com",
      interests: ["music"],
    });

    const res = await request(app)
      .get("/api/users/interests")
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(200);
    const groups = res.body.data;

    // aggregate includes admin's interests too
    const chess = groups.find(
      (g: { interest: string }) => g.interest === "chess",
    );
    const music = groups.find(
      (g: { interest: string }) => g.interest === "music",
    );

    expect(chess.userCount).toBe(2);
    expect(music.userCount).toBe(2);

    // users must not expose passwords
    const emails = music.users.map((u: { email: string }) => u.email);
    expect(emails).toContain(a.email);
    expect(emails).toContain(c.email);

    const allDataHasNoPassword = groups.every(
      (g: { users: Array<{ password?: string }> }) =>
        g.users.every((u) => u.password === undefined),
    );
    expect(allDataHasNoPassword).toBe(true);
  });
});

describe("Aggregation: user posts with $lookup", () => {
  it("returns a user with their posts", async () => {
    const admin = await adminUser();
    const user = await createUser({ email: "postowner@example.com" });

    await Post.create({ userId: user._id, title: "Post 1", content: "c1" });
    await Post.create({ userId: user._id, title: "Post 2", content: "c2" });
    // A post by another user should NOT be included
    const other = await createUser({ email: "other@example.com" });
    await Post.create({ userId: other._id, title: "Post 3", content: "c3" });

    const res = await request(app)
      .get(`/api/users/${user._id}/posts`)
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(user._id.toString());
    expect(Array.isArray(res.body.data.posts)).toBe(true);
    expect(res.body.data.posts).toHaveLength(2);
    expect(res.body.data.posts.map((p: { title: string }) => p.title)).toEqual(
      expect.arrayContaining(["Post 1", "Post 2"]),
    );
  });

  it("returns 404 if user not found", async () => {
    const admin = await adminUser();
    const res = await request(app)
      .get("/api/users/000000000000000000000000/posts")
      .set("Authorization", authHeader(admin));
    expect(res.status).toBe(404);
  });
});
