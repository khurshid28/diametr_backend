#!/bin/sh
set -e

DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"

echo "[entrypoint] Waiting for MySQL at ${DB_HOST}:${DB_PORT} ..."
until nc -zw 3 "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    sleep 3
done
echo "[entrypoint] MySQL is ready."

echo "[entrypoint] Running Prisma migrate deploy ..."
npx prisma migrate deploy

echo "[entrypoint] Starting NestJS application ..."
# Nest build output: when only src/ is compiled, entry is dist/main.js;
# if prisma/ is also compiled, entry is dist/src/main.js. Pick whichever exists.
if [ -f dist/src/main.js ]; then
    exec node dist/src/main
elif [ -f dist/main.js ]; then
    exec node dist/main
else
    echo "[entrypoint] ERROR: no compiled entry found in dist/" >&2
    ls -la dist || true
    exit 1
fi
