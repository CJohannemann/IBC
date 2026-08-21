# Maintenance scripts

Both scripts use only the dependencies already in `backend/package.json` —
nothing new to install, no image library, no `sqlite3` CLI needed on the VPS.

## backup-db.js — nightly database backup

```bash
node backend/scripts/backup-db.js
```

Writes a gzipped snapshot to `backups/baseball-<timestamp>.db.gz` and prunes
anything older than 30 days.

It uses SQLite's `VACUUM INTO` rather than copying the file. This matters: a
plain `cp` of a database that is being written to can produce a **corrupt
backup**, and you won't find out until you need it.

The whole database is ~44 KB, ~5 KB gzipped, so a full year of nightly backups
costs under 2 MB.

**Install the cron job on the VPS** (adjust the path to wherever the app lives):

```bash
crontab -e
```

```cron
15 3 * * * cd /srv/ibc && /usr/bin/node backend/scripts/backup-db.js >> /var/log/ibc-backup.log 2>&1
```

Tunable via environment variables: `DB_PATH`, `BACKUP_DIR`, `BACKUP_KEEP_DAYS`.

### Get the backups off the box

A backup sitting on the same VPS does not survive losing the VPS. Add a second
cron line that copies them somewhere else — another host you control, or any
object storage:

```cron
30 3 * * * rsync -az --delete /srv/ibc/backups/ user@elsewhere:/backups/ibc/
```

### Restoring

```bash
gunzip -c backups/baseball-20260821T165701.db.gz > restored.db
sqlite3 restored.db 'PRAGMA integrity_check;'   # expect: ok
```

Then stop the app, swap the file into place, and start it again.

## cleanup-orphans.js — reclaim unreferenced uploads

```bash
node backend/scripts/cleanup-orphans.js            # dry run, lists what it would remove
node backend/scripts/cleanup-orphans.js --delete   # actually remove them
```

Every upload lands in `public/uploads/news/` regardless of what it is for, and
`news`, `swag` and `players` all point into that one folder. A file counts as an
orphan only when **no** row in **any** of those tables references it.

Routes now delete their own images on update and delete, so this should stay near
zero. It exists to clear the historical backlog and as a safety net. Safe to run
monthly, but always look at the dry run first.

If you add another table that stores an upload path, add it to
`IMAGE_REFERENCES` in `backend/lib/imageCleanup.js` — both the route cleanup and
this script read from that one list.

## manage-users.js — admin accounts

```bash
node backend/scripts/manage-users.js list
node backend/scripts/manage-users.js add chris --role admin --email chris@example.com
node backend/scripts/manage-users.js add coachdan --role editor
node backend/scripts/manage-users.js passwd coachdan
node backend/scripts/manage-users.js disable coachdan
```

Omit `--password` and a 16-character random password is generated and printed
once. Prefer that over choosing one.

**Roles:** `admin` and `editor` both edit site content. `admin` is the role to
gate account management on as the UI grows. Everyone gets their own login, so
changes are attributable and one person can be removed without disturbing
anyone else.

`passwd` and `disable` both end that user's existing sessions immediately — a
password change that leaves a stolen session alive isn't a password change.

### First-time setup on the VPS

```bash
node backend/scripts/manage-users.js add <you> --role admin
```

The `users` and `sessions` tables are created automatically on first run, and
again at server start — both are `CREATE TABLE IF NOT EXISTS`, so it's safe to
run repeatedly.

Once your own account works, **unset `ADMIN_USER` and `ADMIN_PASS` in
`backend/.env` and restart.** They're a fallback that only applies when no
matching user row exists, and while they're set the shared password still opens
everything. The server warns at startup whenever both real accounts and those
variables exist.

### How login works

Passwords are hashed with scrypt (built into Node — no native build step on the
VPS). Logging in sets an httpOnly, SameSite=Lax session cookie; only the
SHA-256 of each token is stored, so a copy of the database can't be replayed as
a logged-in session. Login is rate-limited to 10 failed attempts per IP and
username per 15 minutes.

Basic Auth still works against the users table, so `curl` and any scripts you
have keep working with a real per-person credential.

**Two settings matter in production** (see `.env.example`): `NODE_ENV=production`
marks cookies `Secure`, and `CORS_ORIGIN` must name your domain — credentialed
requests cannot use a wildcard origin, so cookie login will fail without it if
the frontend is served from a different origin than the API.

## reset-stats.js — clear statistics

```bash
node backend/scripts/reset-stats.js                        # dry run, lists what would go
node backend/scripts/reset-stats.js --delete               # clear every season
node backend/scripts/reset-stats.js --delete --league 10U  # just one team
node backend/scripts/reset-stats.js --delete --season Fall --year 2026
```

Clears `batting_stats`, `pitching_stats` and `team_stats` only. Rosters,
schedule, news, uniforms and accounts are untouched.

It takes a backup before deleting anything, so a mistake is recoverable with the
restore steps above. Dry run first — there is no undo beyond that backup.

Note that `team_stats` holds both the CSV totals and the win/loss record you
enter by hand, so clearing it resets the record too.
