-- Full schema for the content database, dumped from baseball.db.
-- The .db file itself is no longer tracked (it holds live data), so this
-- is the repo record of the structure. Rebuild an empty database with:
--   sqlite3 new.db < database/schema.sql
--
-- Users and sessions are in users.sql and applied automatically at startup.

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS batting_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'Baseball',
  player_name TEXT NOT NULL,
  team TEXT,
  avg REAL,
  hits INTEGER,
  at_bats INTEGER,
  runs INTEGER,
  rbis INTEGER,
  doubles INTEGER,
  triples INTEGER,
  home_runs INTEGER,
  stolen_bases INTEGER,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS coaches (
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  league TEXT,
  season TEXT,
  year INTEGER,
  archive TEXT NOT NULL DEFAULT 'N', sport TEXT NOT NULL DEFAULT 'Baseball',
  PRIMARY KEY (last_name, league, season, year)
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  sport TEXT NOT NULL DEFAULT 'Baseball',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  image_path TEXT
);

CREATE TABLE IF NOT EXISTS pitching_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'Baseball',
  player_name TEXT NOT NULL,
  team TEXT,
  era REAL,
  wins INTEGER,
  losses INTEGER,
  saves INTEGER,
  innings_pitched REAL,
  strikeouts INTEGER,
  walks INTEGER,
  hits_allowed INTEGER,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_number INTEGER,
    first_name TEXT,
    last_name TEXT,
    favorite_food TEXT,
    favorite_movie TEXT,
    bio TEXT,
    photo_path TEXT,
    league TEXT,
    season TEXT,
    year INTEGER
, sport TEXT NOT NULL DEFAULT 'Baseball');

CREATE TABLE IF NOT EXISTS schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Game',
  league TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'Baseball',
  location TEXT,
  opponent TEXT,
  home_away TEXT,
  notes TEXT,
  season TEXT,
  year INTEGER
, jersey_color TEXT, pants_color TEXT, hat_color TEXT);

CREATE TABLE IF NOT EXISTS swag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_path TEXT,
  sport TEXT NOT NULL DEFAULT 'Baseball',
  created_at TEXT DEFAULT (datetime('now'))
, url TEXT);

CREATE TABLE IF NOT EXISTS team_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'Baseball',
  team_name TEXT NOT NULL,
  wins INTEGER,
  losses INTEGER,
  ties INTEGER DEFAULT 0,
  runs_scored INTEGER,
  runs_allowed INTEGER,
  updated_at TEXT DEFAULT (datetime('now'))
);

COMMIT;