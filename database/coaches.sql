PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS coaches (
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  league TEXT,
  season TEXT,
  year INTEGER,
  archive TEXT NOT NULL DEFAULT 'N',
  PRIMARY KEY (last_name, league, season, year)
);

INSERT INTO coaches (first_name, last_name, league, season, year, archive) VALUES
('Derek', 'Uhl', '10U','Fall','2026', 'N'),
('Darren', 'Farrar', '14U','Fall','2026', 'N');
COMMIT;