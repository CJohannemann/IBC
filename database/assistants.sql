-- Assistant coaches, linked to a head coach by the coaches table's composite key.
-- Applied automatically at server startup, so it is written to be safe to re-run.

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS assistants (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  head_coach_last_name TEXT NOT NULL,
  head_coach_league    TEXT NOT NULL,
  head_coach_season    TEXT NOT NULL,
  head_coach_year      INTEGER NOT NULL,
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL
);

-- Every lookup is "who assists this head coach", so index that.
CREATE INDEX IF NOT EXISTS idx_assistants_head_coach
  ON assistants (head_coach_last_name, head_coach_league, head_coach_season, head_coach_year);

COMMIT;
