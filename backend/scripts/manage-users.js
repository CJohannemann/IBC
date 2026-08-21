#!/usr/bin/env node
/**
 * Create and manage admin accounts.
 *
 *   node backend/scripts/manage-users.js list
 *   node backend/scripts/manage-users.js add <username> [--role admin|editor] [--email you@x.com] [--password ...]
 *   node backend/scripts/manage-users.js passwd  <username> [--password ...]
 *   node backend/scripts/manage-users.js role    <username> <admin|editor>
 *   node backend/scripts/manage-users.js disable <username>
 *   node backend/scripts/manage-users.js enable  <username>
 *   node backend/scripts/manage-users.js delete  <username>
 *
 * Omit --password and a strong one is generated and printed once. That is
 * usually what you want: generated passwords beat chosen ones.
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const fs = require('fs')
const crypto = require('crypto')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const { hashPassword } = require('../lib/passwords')
const { destroyUserSessions } = require('../lib/sessions')

const REPO_ROOT = path.join(__dirname, '..', '..')
const DB_PATH = process.env.DB_PATH || path.join(REPO_ROOT, 'database', 'baseball.db')
const SCHEMA = path.join(REPO_ROOT, 'database', 'users.sql')

const ROLES = ['admin', 'editor']

function parseFlags(argv) {
  const flags = {}
  const positional = []

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      flags[argv[i].slice(2)] = argv[i + 1]
      i++
    } else {
      positional.push(argv[i])
    }
  }

  return { flags, positional }
}

/** ~90 bits of entropy, no ambiguous characters. */
function generatePassword() {
  const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(crypto.randomBytes(16))
    .map((b) => alphabet[b % alphabet.length])
    .join('')
}

async function findUser(db, username) {
  return db.get('SELECT * FROM users WHERE username = ?', username)
}

async function requireUser(db, username) {
  const user = await findUser(db, username)
  if (!user) {
    console.error(`no such user: ${username}`)
    process.exit(1)
  }
  return user
}

const commands = {
  async list(db) {
    const rows = await db.all(
      'SELECT id, username, email, role, active, created_at, last_login FROM users ORDER BY username'
    )

    if (!rows.length) {
      console.log('no users yet - create one with: manage-users.js add <username> --role admin')
      return
    }

    const pad = (s, n) => String(s === null || s === undefined ? '-' : s).padEnd(n)
    console.log(pad('USER', 18) + pad('ROLE', 8) + pad('STATUS', 10) + pad('LAST LOGIN', 22) + 'EMAIL')
    for (const r of rows) {
      console.log(
        pad(r.username, 18) +
        pad(r.role, 8) +
        pad(r.active ? 'active' : 'disabled', 10) +
        pad(r.last_login, 22) +
        (r.email || '-')
      )
    }
  },

  async add(db, [username], flags) {
    if (!username) {
      console.error('usage: manage-users.js add <username> [--role admin|editor] [--email ...]')
      process.exit(1)
    }

    if (await findUser(db, username)) {
      console.error(`user already exists: ${username}`)
      process.exit(1)
    }

    const role = flags.role || 'editor'
    if (!ROLES.includes(role)) {
      console.error(`role must be one of: ${ROLES.join(', ')}`)
      process.exit(1)
    }

    const password = flags.password || generatePassword()
    if (password.length < 12) {
      console.error('password must be at least 12 characters')
      process.exit(1)
    }

    await db.run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, flags.email || null, await hashPassword(password), role]
    )

    console.log(`created ${role} "${username}"`)
    if (!flags.password) {
      console.log(`password: ${password}`)
      console.log('(shown once - store it in a password manager now)')
    }
  },

  async passwd(db, [username], flags) {
    const user = await requireUser(db, username)

    const password = flags.password || generatePassword()
    if (password.length < 12) {
      console.error('password must be at least 12 characters')
      process.exit(1)
    }

    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [
      await hashPassword(password),
      user.id,
    ])
    // A password change must end existing sessions, or a stolen one survives it.
    await destroyUserSessions(db, user.id)

    console.log(`password updated for "${username}" (all their sessions ended)`)
    if (!flags.password) {
      console.log(`password: ${password}`)
      console.log('(shown once - store it in a password manager now)')
    }
  },

  async role(db, [username, role]) {
    const user = await requireUser(db, username)

    if (!ROLES.includes(role)) {
      console.error(`role must be one of: ${ROLES.join(', ')}`)
      process.exit(1)
    }

    await db.run('UPDATE users SET role = ? WHERE id = ?', [role, user.id])
    console.log(`"${username}" is now ${role}`)
  },

  async disable(db, [username]) {
    const user = await requireUser(db, username)
    await db.run('UPDATE users SET active = 0 WHERE id = ?', user.id)
    await destroyUserSessions(db, user.id)
    console.log(`disabled "${username}" and ended their sessions`)
  },

  async enable(db, [username]) {
    const user = await requireUser(db, username)
    await db.run('UPDATE users SET active = 1 WHERE id = ?', user.id)
    console.log(`enabled "${username}"`)
  },

  async delete(db, [username]) {
    const user = await requireUser(db, username)
    await db.run('DELETE FROM users WHERE id = ?', user.id)
    console.log(`deleted "${username}"`)
    console.log('note: disabling keeps the account for the record - deleting does not')
  },
}

async function main() {
  const [command, ...rest] = process.argv.slice(2)

  if (!command || !commands[command]) {
    const help = fs.readFileSync(__filename, 'utf8')
      .split('*/')[0].split('/**')[1]
      .split('\n').map((line) => line.replace(/^\s*\* ?/, '')).join('\n').trim()
    console.log(help)
    process.exit(command ? 1 : 0)
  }

  const db = await sqlite.open({ filename: DB_PATH, driver: sqlite3.Database })

  try {
    await db.run('PRAGMA foreign_keys = ON')
    await db.exec(fs.readFileSync(SCHEMA, 'utf8'))

    const { flags, positional } = parseFlags(rest)
    await commands[command](db, positional, flags)
  } finally {
    await db.close()
  }
}

main().catch((err) => {
  console.error('failed:', err.message)
  process.exit(1)
})
