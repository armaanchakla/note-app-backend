#!/bin/bash
set -e

MONGO_DB_DIR="${MONGO_DB_DIR:-/data/db}"
MONGO_PORT="${MONGO_PORT:-27017}"
API_PORT="${PORT:-5000}"
SEED_DB="${SEED_DB:-true}"

echo "[entrypoint] MongoDB data dir : ${MONGO_DB_DIR}"
echo "[entrypoint] API port          : ${API_PORT}"

# ---------------------------------------------------------------
# 1. Start MongoDB in the background, bound to all interfaces so it
#    is reachable from Mongo Compass on the host (via published port).
# ---------------------------------------------------------------
mkdir -p "${MONGO_DB_DIR}"
echo "[entrypoint] Starting MongoDB on 0.0.0.0:${MONGO_PORT} ..."
mongod \
  --dbpath "${MONGO_DB_DIR}" \
  --bind_ip 0.0.0.0 \
  --port "${MONGO_PORT}" &
MONGO_PID=$!

# ---------------------------------------------------------------
# 2. Wait for MongoDB to become responsive.
# ---------------------------------------------------------------
echo "[entrypoint] Waiting for MongoDB to become ready..."
READY=false
for i in $(seq 1 60); do
  if mongosh --quiet --norc --host 127.0.0.1 --port "${MONGO_PORT}" \
      --eval "db.runCommand({ping:1}).ok" 2>/dev/null | grep -q "1"; then
    READY=true
    echo "[entrypoint] MongoDB is ready."
    break
  fi
  sleep 1
done

if [ "${READY}" != "true" ]; then
  echo "[entrypoint] ERROR: MongoDB did not become ready in time." >&2
  exit 1
fi

# ---------------------------------------------------------------
# 3. Seed the database (optional, enabled by default).
# ---------------------------------------------------------------
if [ "${SEED_DB}" = "true" ]; then
  echo "[entrypoint] Seeding database..."
  node dist/seed/seed.js
  echo "[entrypoint] Seed complete."
else
  echo "[entrypoint] Seeding skipped (SEED_DB != true)."
fi

# ---------------------------------------------------------------
# 4. Run the API in the foreground.
# ---------------------------------------------------------------
echo "[entrypoint] Starting API on 0.0.0.0:${API_PORT} ..."
exec node dist/server.js
