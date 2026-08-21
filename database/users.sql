PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL COLLATE NOCASE,
  email         TEXT COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  -- 'admin' can manage users; 'editor' can edit content but not accounts.
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  -- Deactivating keeps the row (and its audit value) while blocking login.
  active        INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login    TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username COLLATE NOCASE);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email    ON users (email COLLATE NOCASE) WHERE email IS NOT NULL;

-- Only the SHA-256 of each session token is stored, so a copy of the database
-- can't be used to impersonate anyone.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

COMMIT;
