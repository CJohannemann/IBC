const { Router } = require('express')

const { verifyPassword, hashPassword } = require('../lib/passwords')
const { createRateLimiter } = require('../lib/rateLimit')
const {
  createSession,
  destroySession,
  destroyUserSessions,
  readSessionCookie,
  setSessionCookie,
  clearSessionCookie,
} = require('../lib/sessions')

// 10 failed attempts per IP+username per 15 minutes. Generous for a coach
// fat-fingering a password, useless for guessing one.
const LOGIN_LIMIT = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyFn: (req) => `${req.ip}:${String(req.body && req.body.username || '').toLowerCase()}`,
})

module.exports = function createAuthRoutes(db, requireAdmin) {
  const router = Router()

  // POST /api/auth/login
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body || {}

      if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
        return res.status(400).json({ error: 'username_and_password_required' })
      }

      const limit = LOGIN_LIMIT.check(req)
      if (limit.limited) {
        res.set('Retry-After', String(limit.retryAfter))
        return res.status(429).json({ error: 'too_many_attempts', retry_after: limit.retryAfter })
      }

      const row = await db.get(
        'SELECT id, username, email, password_hash, role, active FROM users WHERE username = ?',
        username
      )

      // Same response for unknown user, wrong password and disabled account, so
      // the endpoint doesn't reveal which usernames exist.
      const ok = row && row.active && (await verifyPassword(password, row.password_hash))
      if (!ok) {
        return res.status(401).json({ error: 'invalid_credentials' })
      }

      LOGIN_LIMIT.reset(req)

      const { token, expiresAt } = await createSession(db, row.id, req.headers['user-agent'])
      setSessionCookie(res, token, expiresAt)

      await db.run("UPDATE users SET last_login = datetime('now') WHERE id = ?", row.id)

      res.json({
        authenticated: true,
        user: { id: row.id, username: row.username, email: row.email, role: row.role },
      })
    } catch (err) {
      console.error('login error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // POST /api/auth/logout
  router.post('/logout', async (req, res) => {
    try {
      await destroySession(db, readSessionCookie(req))
      clearSessionCookie(res)
      res.json({ success: true })
    } catch (err) {
      console.error('logout error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // GET /api/auth/me - who am I, according to the cookie I just sent
  router.get('/me', requireAdmin, (req, res) => {
    res.json({ authenticated: true, user: req.user })
  })

  // POST /api/auth/password - change your own password
  router.post('/password', requireAdmin, async (req, res) => {
    try {
      const { current_password, new_password } = req.body || {}

      if (!req.user.id) {
        // The break-glass env credential has no row to update.
        return res.status(400).json({ error: 'not_a_database_user' })
      }

      if (typeof new_password !== 'string' || new_password.length < 12) {
        return res.status(400).json({ error: 'password_too_short', minimum: 12 })
      }

      const row = await db.get('SELECT password_hash FROM users WHERE id = ?', req.user.id)
      if (!row || !(await verifyPassword(String(current_password || ''), row.password_hash))) {
        return res.status(401).json({ error: 'invalid_credentials' })
      }

      await db.run(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [await hashPassword(new_password), req.user.id]
      )

      // Changing a password ends every other session, then re-issues one here so
      // the person changing it isn't logged out of their own browser.
      await destroyUserSessions(db, req.user.id)
      const { token, expiresAt } = await createSession(db, req.user.id, req.headers['user-agent'])
      setSessionCookie(res, token, expiresAt)

      res.json({ success: true })
    } catch (err) {
      console.error('password change error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  return router
}
