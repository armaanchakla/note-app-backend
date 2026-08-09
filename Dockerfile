# syntax=docker/dockerfile:1

########################################################################
# Stage 1: Build the TypeScript backend
########################################################################
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

########################################################################
# Stage 2: Runtime image
# MongoDB 7 + Node.js + compiled API in a single self-contained image.
# Starting this image runs MongoDB, seeds the DB, and starts the API —
# everything with one command.
########################################################################
FROM mongo:7-jammy

# Install Node.js runtime. The Node binary is copied from the Debian (glibc)
# node image so it runs on the Ubuntu-22.04 mongo base (both are glibc and
# Node's minimum glibc requirement is far below either).
COPY --from=node:20-bookworm /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
ENV NODE_ENV=production

# Copy compiled app and production dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Entrypoint: starts mongod -> waits -> seeds -> runs the API
COPY docker-entrypoint.sh /usr/local/bin/api-entrypoint
RUN chmod +x /usr/local/bin/api-entrypoint

# MongoDB (27017) and API (5000) ports
EXPOSE 27017 5000

# Override the mongo base image entrypoint with our orchestrator script.
ENTRYPOINT ["/usr/local/bin/api-entrypoint"]

