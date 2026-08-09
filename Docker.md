# Backend Docker Guide

This repository contains the independently deployable Docker setup for the Note App backend.

The backend Docker image contains:

* Node.js
* Compiled API
* MongoDB 7
* Database seed process

MongoDB and the API run inside the backend container.

## Prerequisites

Install:

* Docker
* Docker Compose v2

No local Node.js or MongoDB installation is required for the Docker workflow.

## Repository Structure

```text
backend/
├── Dockerfile
├── docker-entrypoint.sh
├── docker-compose.yml
└── ...
```

## Start the Backend

From the backend repository root:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up --build -d
```

The container starts MongoDB, waits for it to become available, optionally seeds the database, and then starts the API.

## Ports

| Service | Container Port | Host Port |
| ------- | -------------: | --------: |
| API     |           5000 |      5000 |
| MongoDB |          27017 |     27017 |

API:

```text
http://localhost:5000
```

MongoDB:

```text
mongodb://localhost:27017
```

MongoDB can therefore also be accessed from MongoDB Compass using:

```text
mongodb://localhost:27017
```

## Stop the Backend

```bash
docker compose down
```

The MongoDB volume is preserved when the container is stopped.

To remove the container and its associated volume:

```bash
docker compose down -v
```

Be aware that removing the volume deletes the Docker MongoDB data.

## Backend Environment

The Docker Compose configuration provides the following environment variables:

```env
NODE_ENV=production
SEED_DB=true
MONGODB_URI=mongodb://localhost:27017/note_app
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:8080
```

For production deployments, replace development secrets with secure values.

## Database Persistence

MongoDB uses a Docker named volume:

```text
backend-mongo-data
```

This allows MongoDB data to survive normal container recreation.

## Startup Process

The backend entrypoint performs the following operations:

```text
Start container
     ↓
Start MongoDB
     ↓
Wait for MongoDB
     ↓
Seed database when SEED_DB=true
     ↓
Start Node.js API
```

The API remains in the foreground so Docker can monitor the application process.

## Rebuild

When Dockerfile or application dependencies change:

```bash
docker compose build --no-cache
docker compose up
```

For normal changes:

```bash
docker compose up --build
```

## View Logs

```bash
docker compose logs -f
```

For the backend service:

```bash
docker compose logs -f backend
```

## Container Status

```bash
docker compose ps
```

## Frontend Integration

The frontend is a separate repository and container.

The browser communicates with the backend through the published host port:

```text
Frontend → http://localhost:5000 → Backend API
```

The backend CORS configuration should allow the frontend origin.

For the default Docker setup:

```env
CORS_ORIGIN=http://localhost:8080
```

## Important

This Docker configuration belongs exclusively to the backend repository.

It does not require the frontend repository to be present locally.

The backend can therefore be cloned and deployed independently:

```bash
git clone <backend-repository>
cd <backend-repository>
docker compose up --build
```
