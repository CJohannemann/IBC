const { Router } = require('express')

const { deleteImageIfUnused } = require('../lib/imageCleanup')

module.exports = function createUniformRoutes(db, requireAdmin) {
  const router = Router()

  // GET all uniforms - public, since the schedule page shows them
  router.get('/', async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM uniform ORDER BY title')
      res.json(rows)
    } catch (err) {
      console.error('Get uniforms error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // POST new uniform
  router.post('/', requireAdmin, async (req, res) => {
    try {
      const { title, image_path } = req.body || {}

      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'title_required' })
      }

      const result = await db.run(
        'INSERT INTO uniform (title, image_path) VALUES (?, ?)',
        [title.trim(), image_path || null]
      )

      res.json({ success: true, id: result.lastID })
    } catch (err) {
      console.error('Create uniform error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // PUT update uniform
  router.put('/:id', requireAdmin, async (req, res) => {
    try {
      const { title, image_path } = req.body || {}

      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'title_required' })
      }

      const existing = await db.get('SELECT image_path FROM uniform WHERE id = ?', req.params.id)

      const result = await db.run(
        'UPDATE uniform SET title = ?, image_path = ? WHERE id = ?',
        [title.trim(), image_path || null, req.params.id]
      )

      if (result.changes === 0) return res.status(404).json({ error: 'not_found' })

      // Swapping the photo orphans the old file.
      if (existing && existing.image_path && existing.image_path !== (image_path || null)) {
        await deleteImageIfUnused(db, existing.image_path)
      }

      res.json({ success: true })
    } catch (err) {
      console.error('Update uniform error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // DELETE uniform
  router.delete('/:id', requireAdmin, async (req, res) => {
    try {
      const existing = await db.get('SELECT image_path FROM uniform WHERE id = ?', req.params.id)

      const result = await db.run('DELETE FROM uniform WHERE id = ?', req.params.id)
      if (result.changes === 0) return res.status(404).json({ error: 'not_found' })

      // Schedule entries pointing at it fall back to showing nothing rather
      // than a dangling reference.
      await db.run('UPDATE schedule SET uniform_id = NULL WHERE uniform_id = ?', req.params.id)

      if (existing && existing.image_path) {
        await deleteImageIfUnused(db, existing.image_path)
      }

      res.json({ success: true })
    } catch (err) {
      console.error('Delete uniform error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  return router
}
