/*
  create_players_db.js
  Attempts to create database/database/players.db using whichever sqlite driver is available.
  Usage: node database/create_players_db.js
  If you get "MODULE_NOT_FOUND" errors, install a driver: e.g. npm install sqlite3 --save
*/
const fs = require('fs')
const path = require('path')
const dbPath = path.join(__dirname, 'baseball.db')
const sql = fs.readFileSync(path.join(__dirname, 'players.sql'), 'utf8')

async function trySqlitePackage() {
  try {
    // sqlite + sqlite3 driver
    const sqlite = require('sqlite')
    const sqlite3 = require('sqlite3')
    const db = await sqlite.open({ filename: dbPath, driver: sqlite3.Database })
    await db.exec(sql)
    await db.close()
    console.log('Created DB using sqlite + sqlite3 driver at', dbPath)
    return true
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return false
    }
    throw err
  }
}

function tryBetterSqlite3() {
  try {
    const Database = require('better-sqlite3')
    const db = new Database(dbPath)
    db.exec(sql)
    db.close()
    console.log('Created DB using better-sqlite3 at', dbPath)
    return true
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') return false
    throw err
  }
}

async function main() {
  if (fs.existsSync(dbPath)) {
    console.log('Database already exists at', dbPath)
    return
  }

  const ok1 = await trySqlitePackage()
  if (ok1) return

  const ok2 = tryBetterSqlite3()
  if (ok2) return

  console.error('\nNo supported sqlite driver found in node_modules.')
  console.error('Install one of the following and re-run:')
  console.error('  npm install sqlite sqlite3 --save')
  console.error('  OR')
  console.error('  npm install better-sqlite3 --save')
  process.exit(1)
}

main().catch(err => {
  console.error('Error creating DB:', err)
  process.exit(1)
})
