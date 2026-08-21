-- Uniform combinations, each with a photo the team can recognise at a glance.
-- Applied at startup, so it is written to be safe to re-run.

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS uniform (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  image_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

COMMIT;
