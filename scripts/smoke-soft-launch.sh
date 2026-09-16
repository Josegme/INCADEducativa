#!/usr/bin/env bash
# Smoke soft-launch (preview). Requiere BASE_URL y cookies/sesión manual
# o Playwright. Este script solo chequea rutas públicas y crons auth.

set -euo pipefail
BASE_URL="${BASE_URL:?Set BASE_URL=https://your-preview.vercel.app}"
CRON_SECRET="${CRON_SECRET:-}"

echo "== GET / =="
curl -sS -o /dev/null -w "%{http_code}\n" "$BASE_URL/"

echo "== GET /login =="
curl -sS -o /dev/null -w "%{http_code}\n" "$BASE_URL/login"

echo "== GET /carreras =="
curl -sS -o /dev/null -w "%{http_code}\n" "$BASE_URL/carreras"

echo "== GET /manifest.json =="
curl -sS -o /dev/null -w "%{http_code}\n" "$BASE_URL/manifest.json"

if [[ -n "$CRON_SECRET" ]]; then
  echo "== POST /api/cron/coworking (auth) =="
  curl -sS -o /dev/null -w "%{http_code}\n" -X POST "$BASE_URL/api/cron/coworking" \
    -H "Authorization: Bearer $CRON_SECRET"
fi

echo "OK — completar smoke autenticado (alumno/admin/docente) en docs/qa/soft-launch-checklist.md"
