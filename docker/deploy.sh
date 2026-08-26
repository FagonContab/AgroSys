#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${AGROSYS_APP_DIR:-/srv/agrosys}"
ARCHIVE="${1:-/tmp/agrosys.zip}"

if [[ ! -f "$ARCHIVE" ]]; then
  echo "Arquivo nao encontrado: $ARCHIVE" >&2
  exit 1
fi

mkdir -p "$APP_DIR"
unzip -o "$ARCHIVE" -d "$APP_DIR"

if [[ ! -f "$APP_DIR/docker/.env.production" ]]; then
  echo "Configure $APP_DIR/docker/.env.production antes de subir a aplicacao." >&2
  echo "Use $APP_DIR/docker/.env.production.example como modelo." >&2
  exit 1
fi

cd "$APP_DIR/docker"
docker compose -f docker-compose-prod.yml up -d --build --remove-orphans
docker compose -f docker-compose-prod.yml ps
