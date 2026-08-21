const crypto = require('crypto')

const { verifyPassword } = require('../lib/passwords')
const { resolveSession, readSessionCookie } = require('../lib/sessions')

/**
 * Authentication for admin routes.
 *
 * Accepts, in order:
 *   1. A session cookie (how the admin UI authenticates after logging in).
 *   2. Basic Auth against a row in the users table (so curl and scripts work
 *      with a real per-person credential).
 *   3. Basic Auth against ADMIN_USER / ADMIN_PASS, if those are still set.
 *      This is break-glass access for bootstrapping and lockouts only - once
 *      real accounts exist, unset them. See backend/scripts/README.md.
 *
 * On success req.user is { id, username, email, role }. The env fallback has
 * no row behind it, so it reports id: null.
 */
function createRequireAdmin(db) {
  return async function requireAdmin(req, res, next) {
    try {
      // ---- 1. session cookie -------------------------------------------
      const token = readSessionCookie(req)
      if (token) {
        const user = await resolveSession(db, token)
        if (user) {
          req.user = user
          return next()
        }
      }

      // ---- 2 & 3. Basic Auth -------------------------------------------
      const header = req.headers.authorization
      if (header && header.startsWith('Basic ')) {
        const credentials = decodeBasic(header)
        if (credentials) {
          const user = await authenticateBasic(db, credentials.user, credentials.pass)
          if (user) {
            req.user = user
            return next()
          }
        }
      }

      // Deliberately no WWW-Authenticate header: it makes browsers pop up
      // their own login dialog over the app's login form. Basic Auth clients
      // like curl send credentials preemptively and do not need the challenge.
      return res.status(401).json({ error: 'authentication_required' })
    } catch (err) {
      console.error('auth error:', err)
      return res.status(500).json({ error: 'internal_error' })
    }
  }
}

function decodeBasic(header) {
  let decoded
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
  } catch {
    return null
  }

  const separator = decoded.indexOf(':')
  if (separator === -1) return null

  return { user: decoded.slice(0, separator), pass: decoded.slice(separator + 1) }
}

async function authenticateBasic(db, username, password) {
  const row = await db.get(
    'SELECT id, username, email, password_hash, role, active FROM users WHERE username = ?',
    username
  )

  if (row) {
    if (!row.active) return null
    if (!(await verifyPassword(password, row.password_hash))) return null
    return { id: row.id, username: row.username, email: row.email, role: row.role }
  }

  return authenticateEnvFallback(username, password)
}

function authenticateEnvFallback(username, password) {
  const envUser = process.env.ADMIN_USER
  const envPass = process.env.ADMIN_PASS
  if (!envUser || !envPass) return null

  // Both comparisons always run so a wrong username and a wrong password take
  // the same amount of time.
  const userMatch = timingSafeCompare(username, envUser)
  const passMatch = timingSafeCompare(password, envPass)
  if (!userMatch || !passMatch) return null

  return { id: null, username: envUser, email: null, role: 'admin' }
}

function timingSafeCompare(input, expected) {
  const inputBuf = Buffer.from(String(input), 'utf8')
  const expectedBuf = Buffer.from(String(expected), 'utf8')

  if (inputBuf.length !== expectedBuf.length) {
    crypto.timingSafeEqual(expectedBuf, expectedBuf)
    return false
  }

  return crypto.timingSafeEqual(inputBuf, expectedBuf)
}

/** Gate a route on a specific role. Use after requireAdmin. */
function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'authentication_required' })
    if (req.user.role !== role) return res.status(403).json({ error: 'forbidden' })
    next()
  }
}

module.exports = createRequireAdmin
module.exports.createRequireAdmin = createRequireAdmin
module.exports.requireRole = requireRole
