# Running and deploying the site on the VPS

This folder is the written-down version of how the server runs. Before it
existed, that only lived in the habit of typing `node server.js`.

## What changes

Instead of keeping an SSH window open with `node server.js` running in it, the
API becomes a systemd service. It starts when the server boots, restarts itself
if it crashes, and keeps its logs where you can read them later.

## One-time setup

Do this once, on the VPS.

### 1. Move the database out of the repo — do this first

`database/baseball.db` is tracked by git. While your live database sits at that
path, `git pull` can collide with it, and the usual ways of resolving that
collision overwrite it with the old snapshot from the repo.

Stop the API first (Ctrl-C in whatever window is running it), then:

```bash
cd ~/IBC                                   # your actual repo path
mkdir -p ~/ibc-data
cp database/baseball.db ~/ibc-data/baseball-preupgrade-$(date +%F).db
mv database/baseball.db ~/ibc-data/baseball.db

echo "DB_PATH=$HOME/ibc-data/baseball.db" >> backend/.env
echo "BACKUP_DIR=$HOME/ibc-data/backups"  >> backend/.env
```

Copy only while the API is stopped — copying a SQLite file that is being
written to can produce a corrupt copy.

`deploy.sh` refuses to run if it finds a live database still in the repo, so
this is enforced rather than remembered.

### 2. Install the service

```bash
sudo bash deploy/install-service.sh
```

It works out the repo path, your username and where `node` lives, writes the
service files, and starts everything. Safe to re-run.

This also installs a timer that backs up the database every night at 03:15.

### 3. Tell deploy.sh where the frontend goes

```bash
cp deploy/deploy.env.example deploy/deploy.env
# then edit WEB_ROOT to the directory nginx serves, e.g. /var/www/ibc
```

Without this, deploys still work — the built files are just left in
`frontend/dist/` for you to copy yourself.

## Deploying an update

```bash
cd ~/IBC
bash deploy/deploy.sh
```

Which pulls, rebuilds the frontend, publishes it, restarts the API, and checks
that it came back up. If the API fails to start, the script prints the last 30
log lines and exits non-zero rather than leaving you with a quietly dead site.

## Day-to-day commands

```bash
systemctl status ibc-api           # is it running?
sudo systemctl restart ibc-api     # restart it
sudo systemctl stop ibc-api        # stop it
journalctl -u ibc-api -f           # watch logs as they happen
journalctl -u ibc-api -n 50        # last 50 log lines - start here when something breaks
systemctl list-timers ibc-backup   # when does the next backup run
sudo systemctl start ibc-backup    # run a backup right now
```

## If the site is down

```bash
systemctl status ibc-api
journalctl -u ibc-api -n 50
```

The service restarts automatically on crash, so a site that is still down after
a minute usually means it cannot start at all — a bad `.env` value, a missing
database file, or a port already in use. The log says which.

## Files here

| File | What it is |
|---|---|
| `install-service.sh` | One-time setup. Generates and installs the units. |
| `deploy.sh` | Pull, build, publish, restart, verify. |
| `ibc-api.service` | The API service (template; paths filled in at install). |
| `ibc-backup.service` | Runs `backend/scripts/backup-db.js` once. |
| `ibc-backup.timer` | Triggers the backup nightly at 03:15. |
| `deploy.env.example` | Copy to `deploy.env` and set `WEB_ROOT`. |

Editing a `.service` file here does nothing on its own — re-run
`sudo bash deploy/install-service.sh` to apply it.
