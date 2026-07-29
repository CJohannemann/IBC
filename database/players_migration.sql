PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS players_new (
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
INSERT INTO players_new (player_number, first_name, last_name, favorite_food, favorite_movie, bio, photo_path, photo_blob, league, season, year)
SELECT player_number, first_name, last_name, favorite_food, favorite_movie, bio, photo_path, photo_blob, league, season, year FROM players;
DROP TABLE players;
ALTER TABLE players_new RENAME TO players;
COMMIT;
PRAGMA foreign_keys=ON;
