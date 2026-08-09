# Note App Backend

Production-quality REST API for the Note App.

The backend is an independently deployable Node.js + TypeScript application with MongoDB, JWT authentication, role-based authorization, validation, pagination, aggregation pipelines, and automated tests.

## Tech Stack

* Node.js
* TypeScript
* Express
* MongoDB
* Mongoose
* JWT authentication
* bcryptjs
* Zod
* Helmet
* CORS
* Jest
* Supertest
* mongodb-memory-server
* ESLint
* Prettier

## Architecture

The backend follows a layered architecture:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Mongoose Model
  ↓
MongoDB
```

### Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   ├── routes/
│   ├── seed/
│   ├── types/
│   ├── utils/
│   ├── validators/
│   ├── app.ts
│   └── server.ts
├── tests/
├── Dockerfile
├── docker-entrypoint.sh
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.json
└── .prettierrc
```

## Features

### Authentication

* User registration
* User login
* JWT authentication
* Current-user endpoint
* Password hashing with bcrypt
* Configurable JWT expiration

### Authorization

Two roles are supported:

* `USER`
* `ADMIN`

Role-based authorization is enforced through middleware.

### Notes

Authenticated users can:

* Create notes
* View their own notes
* Update their own notes
* Delete their own notes

Note ownership is derived from the authenticated JWT rather than trusting a `userId` supplied by the client.

Administrators can additionally view all notes.

### Admin User Management

Administrators can:

* Create users
* List users
* View users
* Update users
* Delete users
* Group users by interests
* Retrieve a user together with their posts

### Pagination

Collection endpoints support:

```text
?page=1&limit=20
```

The maximum limit is `100`.

## API

The API is available at:

```text
http://localhost:5000
```

Authentication uses:

```text
Authorization: Bearer <token>
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Notes

```text
POST   /api/notes
GET    /api/notes
GET    /api/notes/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

### Posts

```text
POST   /api/posts
GET    /api/posts
```

### Admin Users

```text
POST   /api/users
GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
GET    /api/users/interests
GET    /api/users/:userId/posts
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the backend in development mode:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Start the compiled application:

```bash
npm start
```

Run tests:

```bash
npm test
```

## Environment Variables

Create a `.env` file from `.env.example`.

Example:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/note_app
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173
```

## Docker

The backend has its own independent Docker setup. See [Docker.md](./Docker.md)

## Seed Data

Development seed data includes one administrator and regular users.

Example administrator:

```text
Email:    admin@example.com
Password: adminpassword123
Role:     ADMIN
```

Example user:

```text
Email:    john@example.com
Password: userpassword123
Role:     USER
```

These credentials are intended for development/demo use only.

## Testing

Tests use an in-memory MongoDB instance.

Run:

```bash
npm test
```

No external MongoDB instance is required for the test suite.

## Indexing

The application intentionally uses a minimal indexing strategy.

Current indexes include:

* User email — unique
* User creation date
* Note owner + creation date
* Post owner + creation date

See [INDEXING.md](./INDEXING.md) for the detailed rationale.

## Security

The backend includes:

* JWT authentication
* Role-based authorization
* Server-side note ownership enforcement
* Password hashing
* Request validation
* Helmet security headers
* CORS configuration
* Centralized error handling
* Sensitive-field exclusion from API responses

## Repository Independence

This backend is an independent repository.

The frontend is maintained separately and communicates with this API through HTTP.

```text
Frontend
   │
   │ HTTP / REST API
   ▼
Backend
   │
   ▼
MongoDB
```
