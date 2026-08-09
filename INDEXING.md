# Indexing Strategy

This document explains every custom index defined in the Note App, why it exists,
and — equally important — why no further indexes were created. MongoDB automatically indexes `_id` on every collection, so no additional `_id` index was ever considered.

---

## 1. User Collection

### Index 1: `{ email: 1 }` (unique)

```js
userSchema.index({ email: 1 }, { unique: true });
```

- **Used by:** `AuthService.login()` (`UserRepository.findByEmail`).
- **Query:** `findOne({ email })` — authentication lookup.
- **Filtering fields:** `email` (equality).
- **Sorting fields:** none.
- **Why required:**
  - Login must locate a user by email on every request; a unique index makes
    this an equality lookup with O(log n) cost instead of a collection scan.
  - The unique constraint also guarantees no duplicate accounts, enforced
    at the database level (backing the service-level `isEmailTaken` check).
- **Why an existing index is insufficient:** No other index covers `email`.
- **Why no additional index:** Authentication requires nothing beyond `email`.

### Index 2: `{ createdAt: -1 }`

```js
userSchema.index({ createdAt: -1 });
```

- **Used by:** `GET /api/users` admin user listing.
- **Query:** `User.find({}).sort({ createdAt: -1 }).skip(...).limit(...)`.
- **Filtering fields:** none.
- **Sorting fields:** `createdAt` (descending) for deterministic pagination.
- **Why required:** Admin paginated user listing sorts by `createdAt DESC`.
  A sort-only index avoids an in-memory sort of the whole collection on each
  page.
- **Why an existing index is insufficient:** `{ email: 1 }` does not support
  sorting by `createdAt`.
- **Why no additional index:** No other user query sorts or filters on a field
  that is not already indexed.

### Why no index on `interests`

The `interests` array participates only in the interest-grouping aggregation
(`GET /api/users/interests`). That pipeline reads **all** users, unwinds
`interests`, and groups — it does **not** filter on `interests` in any
`$match` stage. An index on `interests` would never be used because there is no
equality/range predicate on that field. Creating one would be wasted storage
and write overhead with zero query benefit. **Therefore no index on
`interests`.**

---

## 2. Note Collection

### Index: `{ userId: 1, createdAt: -1 }`

```js
noteSchema.index({ userId: 1, createdAt: -1 });
```

- **Used by:** `GET /api/notes` (owner note listing).
- **Query:** `Note.find({ userId }).sort({ createdAt: -1 }).skip(...).limit(...)`.
- **Filtering fields:** `userId` (equality).
- **Sorting fields:** `createdAt` (descending).
- **Why required:** The primary "my notes" listing filters by `userId` and
  sorts newest-first. A compound `(userId: 1, createdAt: -1)` index serves
  both the equality filter and the descending sort in a single index scan.
- **Why an existing index is insufficient:** There is no other index on the
  Note collection.
- **Why no `{ _id: 1 }` index:** MongoDB already indexes `_id`; `GET /api/notes/:id`
  is covered by the built-in `_id` index.
- **Why no separate `{ userId: 1 }` or `{ createdAt: -1 }`:** The compound index
  already handles the equality filter and the sort more efficiently than either
  single-field index alone; additional single-field indexes would be redundant.
- **Why no `{ userId: 1, _id: 1 }` compound for ownership checks:**
  Ownership lookups fetch the note by `_id` first (indexed), then compare
  `userId` in application code. The `_id` index alone is sufficient; a compound
  `(userId, _id)` prefix would only help a hypothetical `find({ _id, userId })`
  which we do not run.

---

## 3. Post Collection

### Index: `{ userId: 1, createdAt: -1 }`

```js
postSchema.index({ userId: 1, createdAt: -1 });
```

- **Used by:** `GET /api/users/:userId/posts` aggregation `$lookup`.
- **Query:** `[ { $match: { _id: userId } }, { $lookup: { from: "posts", localField: "_id", foreignField: "userId", as: "posts" } }, ... ]`.
- **Foreign/equality field:** `userId` — the `$lookup` joins `users._id` to
  `posts.userId`, so MongoDB needs an efficient lookup by `userId`.
- **Sorting fields:** `createdAt` (descending) if the pipeline sorts posts.
- **Why required:** `$lookup` performs a join on the foreign field `userId`.
  Without an index on `posts.userId`, every lookup scans the entire posts
  collection. Adding `createdAt: -1` lets the returned posts be produced in
  order if/when sorted newest-first.
- **Why an existing index is insufficient:** No `_id` index on posts helps a
  `userId` join.
- **Why no additional index:** The pipeline only ever accesses posts through
  `userId`; there are no other Post query patterns in this application.

---

## Summary Table

| Collection | Index | Supports |
|-----------|-------|----------|
| User | `{ email: 1 }` (unique) | Login / email uniqueness |
| User | `{ createdAt: -1 }` | Admin user list pagination |
| Note | `{ userId: 1, createdAt: -1 }` | Owner note list + sort |
| Post | `{ userId: 1, createdAt: -1 }` | `$lookup` join + sort |

All custom indexes are declared with `schema.index(...)` and their justifications
are documented above. No redundant or speculative indexes were introduced.
