const { Router } = require('express')

module.exports = function createCoachRoutes(db, requireAdmin) {
  const router = Router()

  // GET all coaches
  router.get('/', async (req, res) => {
    try {
      const rows = await db.all(`
        SELECT
          first_name,
          last_name,
          league,
          season,
          year,
          archive,
          sport
        FROM coaches
        ORDER BY year DESC, league
      `)
      res.json(rows)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // POST coach
  router.post('/', requireAdmin, async (req, res) => {
    try {
      const {
        first_name,
        last_name,
        league,
        season,
        year,
        archive,
        sport
      } = req.body

      await db.run(
        `
        INSERT INTO coaches (
          first_name,
          last_name,
          league,
          season,
          year,
          archive,
          sport
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          first_name,
          last_name,
          league,
          season,
          year,
          archive || 'N',
          sport || 'Baseball'
        ]
      )

      res.json({ success: true })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // PUT coach
  router.put('/:lastName/:league/:season/:year', requireAdmin, async (req, res) => {
    const { lastName, league, season, year } = req.params
    const {
      first_name,
      last_name,
      league: newLeague,
      season: newSeason,
      year: newYear,
      archive,
      sport
    } = req.body

    try {
      const result = await db.run(
        `
        UPDATE coaches
        SET
          first_name = ?,
          last_name = ?,
          league = ?,
          season = ?,
          year = ?,
          archive = ?,
          sport = COALESCE(?, sport)
        WHERE last_name = ? AND league = ? AND season = ? AND year = ?
        `,
        [
          first_name,
          last_name,
          newLeague,
          newSeason,
          newYear,
          archive || 'N',
          sport || null,
          lastName,
          league,
          season,
          year
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

  // DELETE coach
  router.delete('/:lastName/:league/:season/:year', requireAdmin, async (req, res) => {
    const { lastName, league, season, year } = req.params
    
    try {
      const result = await db.run(
        'DELETE FROM coaches WHERE last_name = ? AND league = ? AND season = ? AND year = ?',
        [lastName, league, season, year]
      )

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Coach not found' })
      }
      res.json({ success: true })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  return router
}
