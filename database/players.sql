-- players.sql: creates players table and inserts two sample players
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS players (
  player_number INTEGER,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  favorite_food TEXT,
  favorite_movie TEXT,
  bio TEXT,
  photo_path TEXT,
  photo_blob BLOB,
  league TEXT,
  season TEXT,
  year INTEGER,
  PRIMARY KEY (player_number, league, season, year)
);

INSERT INTO players (player_number, first_name, last_name, favorite_food, favorite_movie, bio, photo_path, photo_blob, league, season, year) VALUES
(10, 'Alex', 'Johnson', 'Pizza', 'The Sandlot', 'Tenacious lefty with a big bat.', '/uploads/players/10u-alex.png', NULL, '10u', 'Fall', 2026),
(10, 'Jordan', 'Smith', 'Hot Dogs', 'Field of Dreams', 'Catcher who loves pop-ups.', '/uploads/players/10u-jordan.png', NULL, '14u', 'Fall', 2026);

COMMIT;
