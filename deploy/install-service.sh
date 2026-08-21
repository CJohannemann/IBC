#!/usr/bin/env bash
#
# Install the IBC API as a systemd service, plus a nightly backup timer.
# Detects the repo path, the user and the node binary, so there is nothing to
# hand-edit. Run it from the VPS:
#
#   sudo bash deploy/install-service.sh
#
# Safe to re-run - it overwrites the units and reloads systemd.

set -euo pipefail

# --- work out who and where ------------------------------------------------

# When run under sudo, SUDO_USER is the human; running the app as root is bad.
RUN_USER="${SUDO_USER:-$(id -un)}"
if [ "$RUN_USER" = "root" ]; then
  echo "Refusing to run the app as root."
  echo "Log in as your normal user and use: sudo bash deploy/install-service.sh"
  exit 1
fi

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# node is often installed per-user (nvm), which systemd will not have on PATH,
# so resolve an absolute path and verify it exists for the service user.
NODE="$(sudo -u "$RUN_USER" bash -lc 'command -v node' || true)"
if [ -z "$NODE" ] || [ ! -x "$NODE" ]; then
  echo "Could not find node for user '$RUN_USER'."
  echo "Install it system-wide (e.g. /usr/bin/node) or set NODE=/path/to/node and re-run."
  exit 1
fi

if [ ! -f "$REPO/backend/server.js" ]; then
  echo "Expected $REPO/backend/server.js - is this the repo root?"
  exit 1
fi

echo "user : $RUN_USER"
echo "repo : $REPO"
echo "node : $NODE"
echo

# --- write the units -------------------------------------------------------

write_unit() {
  local src="$1" dest="$2"
  sed -e "s|__USER__|$RUN_USER|g" \
      -e "s|__REPO__|$REPO|g" \
      -e "s|__NODE__|$NODE|g" \
      "$src" > "$dest"
  echo "wrote $dest"
}

write_unit "$REPO/deploy/ibc-api.service"    /etc/systemd/system/ibc-api.service
write_unit "$REPO/deploy/ibc-backup.service" /etc/systemd/system/ibc-backup.service
cp "$REPO/deploy/ibc-backup.timer"           /etc/systemd/system/ibc-backup.timer
echo "wrote /etc/systemd/system/ibc-backup.timer"
echo

# --- start everything ------------------------------------------------------

systemctl daemon-reload
systemctl enable --now ibc-api.service
systemctl enable --now ibc-backup.timer

echo
echo "--- status ---"
systemctl --no-pager --lines=0 status ibc-api.service || true

cat <<INFO

Done. From now on:

  sudo systemctl restart ibc-api     # restart after a deploy
  sudo systemctl stop ibc-api        # stop it
  systemctl status ibc-api           # is it running?
  journalctl -u ibc-api -f           # watch the logs live
  systemctl list-timers ibc-backup   # when is the next backup

The API now starts automatically on boot and restarts if it crashes.
You no longer need to keep an SSH window open.

If it is NOT running, the reason will be in:  journalctl -u ibc-api -n 50
INFO
