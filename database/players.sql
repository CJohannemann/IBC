-- players.sql: creates players table and inserts two sample players
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_number INTEGER,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  favorite_food TEXT,
  favorite_movie TEXT,
  bio TEXT,
  photo_path TEXT,
  league TEXT,
  season TEXT,
  year INTEGER,
  sport TEXT NOT NULL DEFAULT 'Baseball'
);

COMMIT;
