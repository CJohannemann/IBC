#!/usr/bin/env node
/**
 * Clear statistics. Rosters, schedule, news and accounts are left alone.
 *
 *   node backend/scripts/reset-stats.js                      # dry run, shows what would go
 *   node backend/scripts/reset-stats.js --delete             # clear every season
 *   node backend/scripts/reset-stats.js --delete --league 10U
 *   node backend/scripts/reset-stats.js --delete --season Fall --year 2026
 *
 * Takes a backup before deleting anything, so a mistake is recoverable.
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const fs = require('fs')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const { normalizeLeague, normalizeSeason, normalizeYear } = require('../lib/normalize')

const REPO_ROOT = path.join(__dirname, '..', '..')
const DB_PATH = process.env.DB_PATH || path.join(REPO_ROOT, 'database', 'baseball.db')
const TABLES = ['batting_stats', 'pitching_stats', 'team_stats']

function parseArgs(argv) {
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const name = argv[i].slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) {
        flags[name] = true
      } else {
        flags[name] = next
        i++
      }
    }
  }
  return flags
}

async function hasColumn(db, table, column) {
  const columns = await db.all(`PRAGMA table_info(${table})`)
  return columns.some((c) => c.name === column)
}

/** Build the WHERE clause from whichever filters were given. */
async function buildFilter(db, table, flags) {
  const clauses = []
  const params = []

  if (flags.league) {
    clauses.push('lower(league) = ?')
    params.push(String(normalizeLeague(flags.league)).toLowerCase())
  }

  // Season columns only exist once the migration has run.
  if (flags.season && (await hasColumn(db, table, 'season'))) {
    clauses.push('season = ?')
    params.push(normalizeSeason(flags.season))
  }
  if (flags.year && (await hasColumn(db, table, 'year'))) {
    clauses.push('year = ?')
    params.push(normalizeYear(flags.year))
  }

  return { where: clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '', params }
}

async function main() {
  const flags = parseArgs(process.argv.slice(2))
  const doDelete = Boolean(flags.delete)

  if (!fs.existsSync(DB_PATH)) {
    console.error(`no database at ${DB_PATH}`)
    process.exit(1)
  }

  const db = await sqlite.open({ filename: DB_PATH, driver: sqlite3.Database })

  try {
    const scope = [
      flags.league ? `league ${normalizeLeague(flags.league)}` : null,
      flags.season ? `season ${normalizeSeason(flags.season)}` : null,
      flags.year ? String(normalizeYear(flags.year)) : null,
    ].filter(Boolean)

    console.log(`database: ${DB_PATH}`)
    console.log(`scope:    ${scope.length ? scope.join(', ') : 'everything'}`)
    console.log('')

    let total = 0
    const plan = []

    for (const table of TABLES) {
      const { where, params } = await buildFilter(db, table, flags)
      const row = await db.get(`SELECT COUNT(*) AS n FROM ${table}${where}`, params)

      plan.push({ table, where, params, count: row.n })
      total += row.n
      console.log(`  ${table.padEnd(16)} ${row.n} row(s)`)
    }

    if (total === 0) {
      console.log('\nnothing matches - nothing to do.')
      return
    }

    if (!doDelete) {
      console.log(`\ndry run: ${total} row(s) would be deleted. Re-run with --delete to do it.`)
      return
    }

    // Back up first. This is destructive and there is no undo.
    console.log('\ntaking a backup first...')
    const { execFileSync } = require('child_process')
    execFileSync(process.execPath, [path.join(__dirname, 'backup-db.js')], { stdio: 'inherit' })

    for (const { table, where, params, count } of plan) {
      if (!count) continue
      await db.run(`DELETE FROM ${table}${where}`, params)
      console.log(`cleared ${count} row(s) from ${table}`)
    }

    console.log(`\ndone: ${total} row(s) removed.`)
    console.log('Rosters, schedule, news and accounts were not touched.')
  } finally {
    await db.close()
  }
}

main().catch((err) => {
  console.error('reset failed:', err.message)
  process.exit(1)
})
