#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

TOKEN="${SUPABASE_ACCESS_TOKEN:-${PRIVATE_SUPABASE_ACCESS_TOKEN:-${SUPABASE_TOKEN:-}}}"

if [ -z "$TOKEN" ]; then
  echo "Supabase MCP token not found in .env or environment" >&2
  exit 1
fi

echo "Starting Supabase MCP server (stdio mode)..."
exec npx -y @supabase/mcp-server-supabase@0.9.0 \
  --project-ref mjysxkxsktalulooajfv \
  --access-token "$TOKEN"
