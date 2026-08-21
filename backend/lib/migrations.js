/**
 * Schema changes that CREATE TABLE IF NOT EXISTS cannot express.
 *
 * SQLite has no ADD COLUMN IF NOT EXISTS, so each change checks the current
 * shape first. Every migration here must be safe to run on every startup.
 */

const STATS_TABLES = ['batting_stats', 'pitching_stats', 'team_stats']

async function columnExists(db, table, column) {
  const columns = await db.all(`PRAGMA table_info(${table})`)
  return columns.some((c) => c.name === column)
}

async function tableExists(db, table) {
  const row = await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
    table
  )
  return Boolean(row)
}

/**
 * Work out which season the existing stats belong to. They were uploaded for
 * whatever season is current, so the active coaching staff is the best signal.
 */
async function currentSeason(db) {
  const row = await db.get(
    "SELECT season, year FROM coaches WHERE archive = 'N' AND season IS NOT NULL AND year IS NOT NULL ORDER BY year DESC LIMIT 1"
  )
  if (row) return { season: row.season, year: row.year }

  // No coaches on file: fall back to the calendar. Northern-hemisphere youth
  // baseball runs spring into summer, so treat the back half of the year as Fall.
  const now = new Date()
  return { season: now.getMonth() >= 6 ? 'Fall' : 'Spring', year: now.getFullYear() }
}

/**
 * Give the stats tables a season and a year.
 *
 * Without them, uploading next season's export deletes the previous one, since
 * the delete is scoped to league and sport alone. Existing rows are backfilled
 * with the current season so nothing is left unattributed.
 */
async function addSeasonToStats(db) {
  const applied = []

  for (const table of STATS_TABLES) {
    if (!(await tableExists(db, table))) continue

    const addedSeason = !(await columnExists(db, table, 'season'))
    const addedYear = !(await columnExists(db, table, 'year'))

    if (addedSeason) await db.run(`ALTER TABLE ${table} ADD COLUMN season TEXT`)
    if (addedYear) await db.run(`ALTER TABLE ${table} ADD COLUMN year INTEGER`)

    if (addedSeason || addedYear) applied.push(table)
  }

  if (!applied.length) return []

  // Backfill in the same run, so no row is ever visible without a season.
  const { season, year } = await currentSeason(db)
  for (const table of applied) {
    await db.run(
      `UPDATE ${table} SET season = COALESCE(season, ?), year = COALESCE(year, ?)
        WHERE season IS NULL OR year IS NULL`,
      [season, year]
    )
  }

  return applied.map((t) => `${t} (backfilled as ${season} ${year})`)
}

/** Let a schedule entry point at a uniform, instead of three free-text colours. */
async function addUniformToSchedule(db) {
  if (!(await tableExists(db, 'schedule'))) return []
  if (await columnExists(db, 'schedule', 'uniform_id')) return []

  await db.run('ALTER TABLE schedule ADD COLUMN uniform_id INTEGER')
  return ['schedule.uniform_id']
}

async function runMigrations(db) {
  return [
    ...(await addSeasonToStats(db)),
    ...(await addUniformToSchedule(db)),
  ]
}

module.exports = { runMigrations, addUniformToSchedule, addSeasonToStats, currentSeason, columnExists }
