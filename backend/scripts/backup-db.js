#!/usr/bin/env node
/**
 * Consistent, compressed backup of the SQLite database.
 *
 * Uses SQLite's `VACUUM INTO`, which takes a proper snapshot of a live database
 * and compacts it on the way out. Plain `cp` of a .db file that is being written
 * to can produce a corrupt backup - don't do that.
 *
 * Usage:  node backend/scripts/backup-db.js
 * Env:    DB_PATH            source database   (default: <repo>/database/baseball.db)
 *         BACKUP_DIR         output directory  (default: <repo>/backups)
 *         BACKUP_KEEP_DAYS   prune older than  (default: 30)
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const fs = require('fs')
const zlib = require('zlib')
const { pipeline } = require('stream/promises')
const sqlite3 = require('sqlite3')

const REPO_ROOT = path.join(__dirname, '..', '..')
const DB_PATH = process.env.DB_PATH || path.join(REPO_ROOT, 'database', 'baseball.db')
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(REPO_ROOT, 'backups')
const KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS || 30)

const PREFIX = 'baseball-'
const SUFFIX = '.db.gz'

function timestamp() {
  // 2026-08-21T164539 - sorts lexicographically, safe on every filesystem
  return new Date().toISOString().replace(/[:-]/g, '').replace(/\..+$/, '').replace('T', 'T')
}

function vacuumInto(dbPath, destPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(new Error(`cannot open ${dbPath}: ${err.message}`))
      db.run('VACUUM INTO ?', destPath, (runErr) => {
        db.close(() => (runErr ? reject(runErr) : resolve()))
      })
    })
  })
}

async function prune() {
  if (!Number.isFinite(KEEP_DAYS) || KEEP_DAYS <= 0) return []

  const cutoff = Date.now() - KEEP_DAYS * 86400 * 1000
  const removed = []

  for (const name of fs.readdirSync(BACKUP_DIR)) {
    if (!name.startsWith(PREFIX) || !name.endsWith(SUFFIX)) continue
    const full = path.join(BACKUP_DIR, name)
    if (fs.statSync(full).mtimeMs < cutoff) {
      fs.unlinkSync(full)
      removed.push(name)
    }
  }

  return removed
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`backup failed: no database at ${DB_PATH}`)
    process.exit(1)
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true })

  const stamp = timestamp()
  const snapshot = path.join(BACKUP_DIR, `.${PREFIX}${stamp}.tmp`)
  const finalPath = path.join(BACKUP_DIR, `${PREFIX}${stamp}${SUFFIX}`)

  try {
    await vacuumInto(DB_PATH, snapshot)

    await pipeline(
      fs.createReadStream(snapshot),
      zlib.createGzip({ level: 9 }),
      fs.createWriteStream(finalPath)
    )
  } finally {
    if (fs.existsSync(snapshot)) fs.unlinkSync(snapshot)
  }

  const size = fs.statSync(finalPath).size
  const removed = await prune()

  console.log(`backup ok: ${path.basename(finalPath)} (${(size / 1024).toFixed(1)} KB)`)
  if (removed.length) {
    console.log(`pruned ${removed.length} backup(s) older than ${KEEP_DAYS} days`)
  }
}

main().catch((err) => {
  console.error('backup failed:', err.message)
  process.exit(1)
})
