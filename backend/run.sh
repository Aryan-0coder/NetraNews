#!/usr/bin/env bash
# Loads backend/.env.local (if present) and starts the NetraNews backend.
# Usage: ./run.sh
set -euo pipefail
cd "$(dirname "$0")"

if [ -f .env.local ]; then
  echo "Loading .env.local"
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
else
  echo "No .env.local found — copy .env.example to .env.local and add your key (AI uses offline fallbacks until then)."
fi

exec ./mvnw spring-boot:run
