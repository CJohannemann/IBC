const { Router } = require('express')

const { hashPassword, generatePassword, MIN_PASSWORD_LENGTH } = require('../lib/passwords')
const { destroyUserSessions } = require('../lib/sessions')

const ROLES = ['admin', 'editor']

/**
 * Account management. Every route is admin-only.
 *
 * Hiding the UI from non-admins is presentation, not security - the checks that
 * matter are here, because anyone can call the API directly.
 */
module.exports = function createUserRoutes(db, requireAdmin, requireRole) {
  const router = Router()

  // Applied to the whole router so a new route cannot be added unprotected.
  router.use(requireAdmin, requireRole('admin'))

  /** Count admins who can still log in - used to refuse the last one being removed. */
  async function activeAdminCount(excludeId) {
    const row = await db.get(
      `SELECT COUNT(*) AS n FROM users
        WHERE role = 'admin' AND active = 1 AND id != ?`,
      excludeId ?? -1
    )
    return row.n
  }

  /** Guard against an admin locking themselves, or everyone, out. */
  async function blocksLockout(req, targetId, { removingAdmin }) {
    if (Number(targetId) === req.user.id) {
      return 'You cannot change your own account here. Use the account page.'
    }
    if (removingAdmin && (await activeAdminCount(targetId)) === 0) {
      return 'This is the last admin account. Promote someone else first.'
    }
    return null
  }

  async function getUser(id) {
    return db.get(
      'SELECT id, username, email, role, active, created_at, last_login FROM users WHERE id = ?',
      id
    )
  }

  // GET /api/users
  router.get('/', async (req, res) => {
    try {
      const users = await db.all(
        `SELECT id, username, email, role, active, created_at, last_login
           FROM users ORDER BY username`
      )
      res.json(users)
    } catch (err) {
      console.error('List users error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // POST /api/users - create an account and return its one-time password
  router.post('/', async (req, res) => {
    try {
      const { username, email, role } = req.body || {}

      if (typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ error: 'username_required' })
      }
      if (role && !ROLES.includes(role)) {
        return res.status(400).json({ error: 'invalid_role' })
      }

      const name = username.trim()
      const existing = await db.get('SELECT id FROM users WHERE username = ?', name)
      if (existing) {
        return res.status(409).json({ error: 'username_taken' })
      }

      // Generated rather than chosen: whoever creates the account never needs to
      // invent a password, and the new user changes it on the account page.
      const password = generatePassword()

      const result = await db.run(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, (email || '').trim() || null, await hashPassword(password), role || 'editor']
      )

      res.json({
        success: true,
        user: await getUser(result.lastID),
        // Shown once, never retrievable again - only the hash is stored.
        password,
      })
    } catch (err) {
      console.error('Create user error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // PUT /api/users/:id/role
  router.put('/:id/role', async (req, res) => {
    try {
      const { role } = req.body || {}
      if (!ROLES.includes(role)) {
        return res.status(400).json({ error: 'invalid_role' })
      }

      const target = await getUser(req.params.id)
      if (!target) return res.status(404).json({ error: 'not_found' })

      const blocked = await blocksLockout(req, req.params.id, {
        removingAdmin: target.role === 'admin' && role !== 'admin',
      })
      if (blocked) return res.status(409).json({ error: 'would_lock_out', message: blocked })

      await db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id])
      res.json({ success: true, user: await getUser(req.params.id) })
    } catch (err) {
      console.error('Update role error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // PUT /api/users/:id/active
  router.put('/:id/active', async (req, res) => {
    try {
      const active = req.body?.active ? 1 : 0

      const target = await getUser(req.params.id)
      if (!target) return res.status(404).json({ error: 'not_found' })

      const blocked = await blocksLockout(req, req.params.id, {
        removingAdmin: !active && target.role === 'admin',
      })
      if (blocked) return res.status(409).json({ error: 'would_lock_out', message: blocked })

      await db.run('UPDATE users SET active = ? WHERE id = ?', [active, req.params.id])

      // Disabling must take effect now, not whenever their cookie expires.
      if (!active) await destroyUserSessions(db, req.params.id)

      res.json({ success: true, user: await getUser(req.params.id) })
    } catch (err) {
      console.error('Update active error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // POST /api/users/:id/password - issue a new one-time password
  router.post('/:id/password', async (req, res) => {
    try {
      const target = await getUser(req.params.id)
      if (!target) return res.status(404).json({ error: 'not_found' })

      if (Number(req.params.id) === req.user.id) {
        return res.status(409).json({
          error: 'use_account_page',
          message: 'Change your own password on the account page.',
        })
      }

      const password = generatePassword()
      await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [
        await hashPassword(password),
        req.params.id,
      ])
      // A reset must invalidate whatever sessions the old password left open.
      await destroyUserSessions(db, req.params.id)

      res.json({ success: true, password })
    } catch (err) {
      console.error('Reset password error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // DELETE /api/users/:id
  router.delete('/:id', async (req, res) => {
    try {
      const target = await getUser(req.params.id)
      if (!target) return res.status(404).json({ error: 'not_found' })

      const blocked = await blocksLockout(req, req.params.id, {
        removingAdmin: target.role === 'admin',
      })
      if (blocked) return res.status(409).json({ error: 'would_lock_out', message: blocked })

      await db.run('DELETE FROM users WHERE id = ?', req.params.id)
      res.json({ success: true })
    } catch (err) {
      console.error('Delete user error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  router.minPasswordLength = MIN_PASSWORD_LENGTH
  return router
}
