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
exec node dist/main
