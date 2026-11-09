#!/bin/sh
set -eu

strapi_database="${STRAPI_DATABASE_NAME:?STRAPI_DATABASE_NAME is required}"

case "$strapi_database" in
  *[!A-Za-z0-9_]* | "")
    echo "STRAPI_DATABASE_NAME must contain only letters, numbers, or underscores." >&2
    exit 1
    ;;
esac

if [ "$strapi_database" = "$POSTGRES_DB" ]; then
  echo "STRAPI_DATABASE_NAME must be different from POSTGRES_DB." >&2
  exit 1
fi

database_exists="$(
  psql \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" \
    --tuples-only \
    --no-align \
    --command "SELECT 1 FROM pg_database WHERE datname = '$strapi_database'"
)"

if [ "$database_exists" = "1" ]; then
  echo "Database '$strapi_database' already exists; leaving it unchanged."
  exit 0
fi

psql \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 \
  --command "CREATE DATABASE \"$strapi_database\""

echo "Created isolated Strapi database '$strapi_database'."
