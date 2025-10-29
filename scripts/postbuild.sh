#!/bin/bash
# Ensure Prisma binary is in the correct location for Vercel
set -e

echo "Checking Prisma client generation..."
npx prisma generate

# Ensure the binary exists
if [ ! -f "node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node" ]; then
  echo "Warning: Prisma binary not found in expected location"
  ls -la node_modules/.prisma/client/ || true
fi

echo "Prisma client ready"

