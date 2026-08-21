#!/usr/bin/env node
/**
 * Find (and optionally delete) uploaded images that no database row references.
 *
 * Every upload lands in public/uploads/news/ regardless of what it is for, and
 * news, swag and players all point into that one folder - so a file is only an
 * orphan when NO row in ANY of those tables references it.
 *
 * Usage:  node backend/scripts/cleanup-orphans.js            # dry run, lists only
 *         node backend/scripts/cleanup-orphans.js --delete   # actually remove them
 * Env:    DB_PATH   source database (default: <repo>/database/baseball.db)
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const fs = require('fs')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const { UPLOADS_DIR, collectReferencedFilenames } = require('../lib/imageCleanup')

const REPO_ROOT = path.join(__dirname, '..', '..')
const DB_PATH = process.env.DB_PATH || path.join(REPO_ROOT, 'database', 'baseball.db')
const DELETE = process.argv.includes('--delete')

function mb(bytes) {
  return (bytes / 1048576).toFixed(2) + ' MB'
}

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log(`nothing to do: ${UPLOADS_DIR} does not exist`)
    return
  }

  const db = await sqlite.open({ filename: DB_PATH, driver: sqlite3.Database })

  try {
    const referenced = await collectReferencedFilenames(db)
    const onDisk = fs.readdirSync(UPLOADS_DIR).filter((name) =>
      fs.statSync(path.join(UPLOADS_DIR, name)).isFile()
    )

    const orphans = onDisk.filter((name) => !referenced.has(name))
    const totalBytes = orphans.reduce(
      (sum, name) => sum + fs.statSync(path.join(UPLOADS_DIR, name)).size,
      0
    )

    console.log(`referenced by database: ${referenced.size}`)
    console.log(`files on disk:          ${onDisk.length}`)
    console.log(`orphans:                ${orphans.length} (${mb(totalBytes)})`)

    if (!orphans.length) return

    console.log('')
    for (const name of orphans) {
      const size = fs.statSync(path.join(UPLOADS_DIR, name)).size
      console.log(`  ${DELETE ? 'deleting' : 'orphan  '}  ${name}  ${(size / 1024).toFixed(0)} KB`)
    }

    if (!DELETE) {
      console.log('\ndry run - nothing was removed. Re-run with --delete to free this space.')
      return
    }

    let freed = 0
    for (const name of orphans) {
      const full = path.join(UPLOADS_DIR, name)
      const size = fs.statSync(full).size
      fs.unlinkSync(full)
      freed += size
    }

    console.log(`\ndeleted ${orphans.length} file(s), freed ${mb(freed)}`)
  } finally {
    await db.close()
  }
}

main().catch((err) => {
  console.error('cleanup failed:', err.message)
  process.exit(1)
})
