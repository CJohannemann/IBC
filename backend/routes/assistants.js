const { Router } = require('express')

module.exports = function createAssistantRoutes(db, requireAdmin) {
  const router = Router()

  // GET all assistants
  router.get('/', async (req, res) => {
    try {
      const rows = await db.all(`
        SELECT
          id,
          head_coach_last_name,
          head_coach_league,
          head_coach_season,
          head_coach_year,
          first_name,
          last_name
        FROM assistants
        ORDER BY head_coach_year DESC, head_coach_league
      `)
      res.json(rows)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // POST assistant
  router.post('/', requireAdmin, async (req, res) => {
    try {
      const {
        head_coach_last_name,
        head_coach_league,
        head_coach_season,
        head_coach_year,
        first_name,
        last_name
      } = req.body

      const result = await db.run(
        `
        INSERT INTO assistants (
          head_coach_last_name,
          head_coach_league,
          head_coach_season,
          head_coach_year,
          first_name,
          last_name
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          head_coach_last_name,
          head_coach_league,
          head_coach_season,
          head_coach_year,
          first_name,
          last_name
        ]
      )

      res.json({
        success: true,
        id: result.lastID
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // PUT assistant
  router.put('/:id', requireAdmin, async (req, res) => {
    const id = req.params.id
    const {
      head_coach_last_name,
      head_coach_league,
      head_coach_season,
      head_coach_year,
      first_name,
      last_name
    } = req.body

    try {
      const result = await db.run(
        `
        UPDATE assistants
        SET
          head_coach_last_name = ?,
          head_coach_league = ?,
          head_coach_season = ?,
          head_coach_year = ?,
          first_name = ?,
          last_name = ?
        WHERE id = ?
        `,
        [
          head_coach_last_name,
          head_coach_league,
          head_coach_season,
          head_coach_year,
          first_name,
          last_name,
          id
        ]
      )

      res.json({
        success: true,
        changes: result.changes
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.message })
    }
  })

  // DELETE assistant
  router.delete('/:id', requireAdmin, async (req, res) => {
    try {
      const result = await db.run('DELETE FROM assistants WHERE id = ?', [req.params.id])

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Assistant not found' })
      }
      res.json({ success: true })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  return router
}
