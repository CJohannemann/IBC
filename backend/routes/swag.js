const express = require('express')
const { deleteImageIfUnused } = require('../lib/imageCleanup')

module.exports = (db, requireAdmin) => {
  const router = express.Router()

  // GET all swag items (optionally filtered by sport)
  router.get('/', async (req, res) => {
    try {
      const { sport } = req.query
      let query = 'SELECT * FROM swag'
      const params = []

      if (sport) {
        query += ' WHERE sport = ?'
        params.push(sport)
      }

      query += ' ORDER BY created_at DESC'

      const items = await db.all(query, params)
      res.json(items)
    } catch (err) {
      console.error('Get swag error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // POST new swag item (admin only)
  router.post('/', requireAdmin, async (req, res) => {
    try {
      const { title, description, price, image_path, sport, url } = req.body

      const result = await db.run(
        `INSERT INTO swag (title, description, price, image_path, sport, url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description || null, price, image_path || null, sport || 'Baseball', url || null]
      )

      res.json({ success: true, id: result.lastID })
    } catch (err) {
      console.error('Create swag error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // PUT update swag item (admin only)
  router.put('/:id', requireAdmin, async (req, res) => {
    try {
      const { title, description, price, image_path, sport, url } = req.body

      const existing = await db.get('SELECT image_path FROM swag WHERE id = ?', req.params.id)

      const result = await db.run(
        `UPDATE swag
         SET title = ?, description = ?, price = ?, image_path = ?, sport = ?, url = ?
         WHERE id = ?`,
        [title, description || null, price, image_path || null, sport || 'Baseball', url || null, req.params.id]
      )

      if (result.changes === 0) {
        return res.status(404).json({ error: 'not_found' })
      }

      // Swapping or clearing the image orphans the old file - drop it.
      if (existing && existing.image_path && existing.image_path !== (image_path || null)) {
        await deleteImageIfUnused(db, existing.image_path)
      }

      res.json({ success: true, changes: result.changes })
    } catch (err) {
      console.error('Update swag error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // DELETE swag item (admin only)
  router.delete('/:id', requireAdmin, async (req, res) => {
    try {
      const existing = await db.get('SELECT image_path FROM swag WHERE id = ?', req.params.id)

      const result = await db.run('DELETE FROM swag WHERE id = ?', req.params.id)

      if (result.changes === 0) {
        return res.status(404).json({ error: 'not_found' })
      }

      if (existing && existing.image_path) {
        await deleteImageIfUnused(db, existing.image_path)
      }

      res.json({ success: true })
    } catch (err) {
      console.error('Delete swag error:', err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  return router
}
