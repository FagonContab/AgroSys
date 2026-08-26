#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELEASE_DIR="$ROOT_DIR/.release"
STAGE_DIR="$RELEASE_DIR/agrosys"
ARCHIVE="$ROOT_DIR/agrosys.zip"

echo "Compilando backend..."
npm --prefix "$ROOT_DIR/backend" ci
npm --prefix "$ROOT_DIR/backend" run build

echo "Compilando frontend..."
npm --prefix "$ROOT_DIR/frontend" ci
npm --prefix "$ROOT_DIR/frontend" run build

echo "Montando pacote de implantacao..."
rm -rf "$RELEASE_DIR"
mkdir -p "$STAGE_DIR/backend" "$STAGE_DIR/frontend" "$STAGE_DIR/docker" "$STAGE_DIR/database"

cp "$ROOT_DIR/backend/package.json" "$ROOT_DIR/backend/package-lock.json" "$ROOT_DIR/backend/tsconfig.json" "$ROOT_DIR/backend/Dockerfile" "$STAGE_DIR/backend/"
cp -R "$ROOT_DIR/backend/src" "$STAGE_DIR/backend/src"
cp -R "$ROOT_DIR/backend/migrations" "$STAGE_DIR/backend/migrations"

cp "$ROOT_DIR/frontend/package.json" "$ROOT_DIR/frontend/package-lock.json" "$ROOT_DIR/frontend/angular.json" "$ROOT_DIR/frontend/tsconfig.json" "$ROOT_DIR/frontend/tsconfig.app.json" "$ROOT_DIR/frontend/Dockerfile" "$ROOT_DIR/frontend/nginx.conf" "$STAGE_DIR/frontend/"
cp -R "$ROOT_DIR/frontend/src" "$STAGE_DIR/frontend/src"

cp "$ROOT_DIR/docker/docker-compose-prod.yml" "$ROOT_DIR/docker/.env.production.example" "$ROOT_DIR/docker/agrosys-proxy.conf.example" "$ROOT_DIR/docker/deploy.sh" "$STAGE_DIR/docker/"
cp "$ROOT_DIR/database/schema.sql" "$ROOT_DIR/database/add-subcategoria-lancamentos.sql" "$STAGE_DIR/database/"
cp "$ROOT_DIR/README.md" "$ROOT_DIR/CONTEXTO_APLICACAO.md" "$STAGE_DIR/"

rm -f "$ARCHIVE"
(
  cd "$STAGE_DIR"
  zip -qr "$ARCHIVE" .
)

echo "Pacote criado: $ARCHIVE"

if [[ -n "${DEPLOY_TARGET:-}" ]]; then
  DEPLOY_PORT="${DEPLOY_PORT:-22}"
  DEPLOY_PATH="${DEPLOY_PATH:-/tmp/agrosys.zip}"
  echo "Enviando para $DEPLOY_TARGET:$DEPLOY_PATH..."
  scp -P "$DEPLOY_PORT" "$ARCHIVE" "$DEPLOY_TARGET:$DEPLOY_PATH"
  echo "Envio concluido. No servidor, execute:"
  echo "  bash /srv/agrosys/docker/deploy.sh $DEPLOY_PATH"
else
  echo "Envio nao realizado. Para enviar automaticamente, defina DEPLOY_TARGET."
  echo "Exemplo: DEPLOY_TARGET=usuario@servidor DEPLOY_PORT=22 bash build.sh"
fi
