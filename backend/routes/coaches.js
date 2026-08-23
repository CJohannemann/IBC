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
      // Both writes or neither: an assistant whose head coach moved out from
      // under them is unreachable from every page that lists them.
      await db.run('BEGIN')

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

      // Assistants hold their own copy of the head coach's key rather than a
      // reference to the row, so correcting a spelling or a season on the coach
      // silently detached every one of them. Move them with it.
      const assistants = await db.run(
        `
        UPDATE assistants
        SET
          head_coach_last_name = ?,
          head_coach_league    = ?,
          head_coach_season    = ?,
          head_coach_year      = ?
        WHERE lower(head_coach_last_name) = lower(?)
          AND lower(head_coach_league)    = lower(?)
          AND lower(head_coach_season)    = lower(?)
          AND head_coach_year             = ?
        `,
        [last_name, newLeague, newSeason, newYear, lastName, league, season, year]
      )

      await db.run('COMMIT')

      res.json({
        success: true,
        changes: result.changes,
        assistants_moved: assistants.changes
      })
    } catch (error) {
      await db.run('ROLLBACK').catch(() => {})
      console.error(error)
      res.status(500).json({ error: error.message })
    }
  })

  // DELETE coach
  router.delete('/:lastName/:league/:season/:year', requireAdmin, async (req, res) => {
    const { lastName, league, season, year } = req.params
    
    try {
      const coach = await db.get(
        `SELECT sport FROM coaches
          WHERE last_name = ? AND league = ? AND season = ? AND year = ?`,
        [lastName, league, season, year]
      )
      if (!coach) return res.status(404).json({ error: 'Coach not found' })

      const sport = coach.sport || 'Baseball'

      const assistants = await db.get(
        `SELECT COUNT(*) AS n FROM assistants
          WHERE lower(head_coach_last_name) = lower(?)
            AND lower(head_coach_league)    = lower(?)
            AND lower(head_coach_season)    = lower(?)
            AND head_coach_year             = ?`,
        [lastName, league, season, year]
      )

      // Players belong to the team, not to one coach, so they only strand if
      // this is the last coach standing for that season.
      const others = await db.get(
        `SELECT COUNT(*) AS n FROM coaches
          WHERE lower(league) = lower(?) AND lower(season) = lower(?)
            AND year = ? AND lower(sport) = lower(?)
            AND lower(last_name) <> lower(?)`,
        [league, season, year, sport, lastName]
      )

      const players = others.n
        ? { n: 0 }
        : await db.get(
            `SELECT COUNT(*) AS n FROM players
              WHERE lower(league) = lower(?) AND lower(season) = lower(?)
                AND year = ? AND lower(sport) = lower(?)`,
            [league, season, year, sport]
          )

      // Deleting the row deletes the team, and nothing else moves with it -
      // there are no foreign keys here, so the players and assistants would
      // simply stop being reachable. Archiving is what this almost always means.
      if (assistants.n || players.n) {
        const parts = []
        if (players.n) parts.push(`${players.n} player${players.n === 1 ? '' : 's'}`)
        if (assistants.n) parts.push(`${assistants.n} assistant coach${assistants.n === 1 ? '' : 'es'}`)

        return res.status(409).json({
          error: 'team_not_empty',
          players: players.n,
          assistants: assistants.n,
          message: `${league} ${season} ${year} still has ${parts.join(' and ')}. ` +
            `Deleting this coach would leave them on file but unreachable. ` +
            `Archive the team instead, which keeps everything and takes it off the site.`,
        })
      }

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
