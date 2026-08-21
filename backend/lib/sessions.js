const crypto = require('crypto')

const COOKIE_NAME = 'ibc_session'
const TOKEN_BYTES = 32
const DEFAULT_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || 14)

/**
 * Sessions are opaque random tokens. The cookie holds the token; the database
 * holds only its SHA-256, so a leaked database copy cannot be replayed as a
 * logged-in session. Nothing about the user is encoded in the token, which
 * means logout and deactivation take effect immediately.
 */

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function expiryFrom(days) {
  return new Date(Date.now() + days * 86400 * 1000)
}

/** Create a session for a user. Returns the raw token - store it nowhere else. */
async function createSession(db, userId, userAgent) {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('base64url')
  const expiresAt = expiryFrom(DEFAULT_TTL_DAYS)

  await db.run(
    `INSERT INTO sessions (token_hash, user_id, expires_at, user_agent)
     VALUES (?, ?, ?, ?)`,
    [hashToken(token), userId, expiresAt.toISOString(), (userAgent || '').slice(0, 255)]
  )

  return { token, expiresAt }
}

/**
 * Resolve a raw token to its user, or null. Rejects expired sessions and
 * deactivated accounts, so revoking access does not wait for the cookie to
 * expire.
 */
async function resolveSession(db, token) {
  if (!token || typeof token !== 'string') return null

  const row = await db.get(
    `SELECT u.id, u.username, u.email, u.role, u.active, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?`,
    hashToken(token)
  )

  if (!row) return null

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await destroySession(db, token)
    return null
  }

  if (!row.active) return null

  return { id: row.id, username: row.username, email: row.email, role: row.role }
}

async function destroySession(db, token) {
  if (!token) return
  await db.run('DELETE FROM sessions WHERE token_hash = ?', hashToken(token))
}

/** Drop every session for a user - used when deactivating or changing a password. */
async function destroyUserSessions(db, userId) {
  await db.run('DELETE FROM sessions WHERE user_id = ?', userId)
}

/** Housekeeping: remove expired rows so the table doesn't grow forever. */
async function purgeExpired(db) {
  const result = await db.run(
    "DELETE FROM sessions WHERE expires_at <= datetime('now')"
  )
  return result.changes || 0
}

/** Read the session cookie without pulling in cookie-parser. */
function readSessionCookie(req) {
  const header = req.headers.cookie
  if (!header) return null

  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq).trim() === COOKIE_NAME) {
      return decodeURIComponent(part.slice(eq + 1).trim())
    }
  }

  return null
}

function setSessionCookie(res, token, expiresAt) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,                                  // not readable from JavaScript
    secure: process.env.NODE_ENV === 'production',   // HTTPS only in production
    sameSite: 'lax',                                 // blocks cross-site CSRF on state changes
    expires: expiresAt,
    path: '/',
  })
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

module.exports = {
  COOKIE_NAME,
  createSession,
  resolveSession,
  destroySession,
  destroyUserSessions,
  purgeExpired,
  readSessionCookie,
  setSessionCookie,
  clearSessionCookie,
}
