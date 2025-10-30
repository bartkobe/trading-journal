#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  # Export variables from .env (supports quotes)
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

# Ensure DATABASE_URL is present
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Create .env with DATABASE_URL first." >&2
  exit 1
fi

exec next dev --turbo


