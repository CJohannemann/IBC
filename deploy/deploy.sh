#!/usr/bin/env bash
#
# Update the site on the VPS: pull, rebuild the frontend, restart the API.
#
#   bash deploy/deploy.sh
#
# Run as your normal user (it calls sudo only to restart the service).
# Set WEB_ROOT in deploy/deploy.env to have the frontend copied into place.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

[ -f deploy/deploy.env ] && . deploy/deploy.env
WEB_ROOT="${WEB_ROOT:-}"

SERVICE="${SERVICE:-ibc-api}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3001/health}"

step() { printf '\n=== %s ===\n' "$1"; }

# --- safety: the live database must not be inside the repo -----------------
# git tracks database/baseball.db. If the live database is still at that path,
# `git pull` can conflict with it, and the usual ways of resolving that will
# overwrite it with the snapshot from the repo.

step "checking the database is out of harm's way"
if git ls-files --error-unmatch database/baseball.db >/dev/null 2>&1 \
   && [ -f database/baseball.db ] \
   && ! git diff --quiet -- database/baseball.db; then
  cat <<'WARN'
STOP. database/baseball.db is tracked by git, exists here, and differs from the
committed copy - so this looks like your live database sitting in the repo.

Pulling now risks losing it. Move it out first:

  mkdir -p ~/ibc-data
  cp database/baseball.db ~/ibc-data/baseball-preupgrade-$(date +%F).db
  mv database/baseball.db ~/ibc-data/baseball.db
  echo "DB_PATH=$HOME/ibc-data/baseball.db" >> backend/.env

Stop the API before copying, so nothing is mid-write.
WARN
  exit 1
fi
echo "ok"

# --- pull ------------------------------------------------------------------

step "pulling latest code"
git pull --ff-only

# --- backend ---------------------------------------------------------------
# Nothing in the backend needs a build step; only install if deps are missing
# or package.json moved ahead of what is installed.

step "backend dependencies"
if [ ! -d backend/node_modules ] || [ backend/package-lock.json -nt backend/node_modules ]; then
  ( cd backend && npm ci --omit=dev )
else
  echo "up to date, skipping"
fi

# --- frontend --------------------------------------------------------------

step "building frontend"
( cd frontend && npm ci && npm run build )

if [ -n "$WEB_ROOT" ]; then
  step "publishing frontend to $WEB_ROOT"
  if [ ! -d "$WEB_ROOT" ]; then
    echo "WEB_ROOT '$WEB_ROOT' does not exist - skipping copy" >&2
  else
    # Trailing slashes matter: copy the contents, not the dist folder itself.
    sudo rsync -a --delete frontend/dist/ "$WEB_ROOT/"
    echo "published"
  fi
else
  cat <<'INFO'
WEB_ROOT is not set, so the built files were left in frontend/dist/.
To automate this step, create deploy/deploy.env containing:

  WEB_ROOT=/var/www/ibc
INFO
fi

# --- restart ---------------------------------------------------------------

step "restarting $SERVICE"
sudo systemctl restart "$SERVICE"
sleep 2

if systemctl is-active --quiet "$SERVICE"; then
  echo "$SERVICE is running"
else
  echo "$SERVICE FAILED to start. Recent log:" >&2
  journalctl -u "$SERVICE" -n 30 --no-pager >&2
  exit 1
fi

# --- verify ----------------------------------------------------------------

step "health check"
if curl -fsS --max-time 10 "$HEALTH_URL" >/dev/null; then
  echo "$HEALTH_URL responded"
else
  echo "health check failed - check: journalctl -u $SERVICE -n 50" >&2
  exit 1
fi

printf '\nDeploy complete.\n'
