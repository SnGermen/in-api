#!/bin/sh
set -e

export NODE_ENV=${NODE_ENV:-development}
export PRISMA_CLIENT_ENGINE_TYPE=${PRISMA_CLIENT_ENGINE_TYPE:-binary}

echo "Generating Prisma Client"
yarn prisma:generate

echo "Applying schema to database"
TRIES=0
until yarn prisma db push >/dev/null 2>&1; do
  TRIES=$((TRIES+1))
  if [ "$TRIES" -ge 30 ]; then
    echo "Database not ready after $TRIES attempts"
    exit 1
  fi
  sleep 2
done

echo "Seeding database"
yarn tsc -p tsconfig.seed.json >/dev/null 2>&1 || true
yarn prisma:seed || true

if [ "$NODE_ENV" = "development" ]; then
  yarn dev
else
  node dist/server.js
fi