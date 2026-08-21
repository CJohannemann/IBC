const { Router } = require('express')
const { deleteImageIfUnused } = require('../lib/imageCleanup')

const PLAYER_COLUMNS = `
  id,
  player_number,
  first_name,
  last_name,
  favorite_food,
  favorite_movie,
  bio,
  photo_path,
  league,
  season,
  year,
  sport
`

const DELETE_PLAYER = `
  DELETE
  FROM players
  WHERE player_number = ?
`

module.exports = function createPlayerRoutes(db, requireAdmin) {
  const router = Router()

  // GET all players
  router.get('/', async (req, res) => {
    try {
      const rows = await db.all(`
        SELECT
          ${PLAYER_COLUMNS}
        FROM players
        ORDER BY league, player_number
      `)

      res.json(rows)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // GET player by number
  router.get('/:number', async (req, res) => {
    try {
      const row = await db.get(`
        SELECT
          ${PLAYER_COLUMNS}
        FROM players
        WHERE player_number = ?
      `, req.params.number)

      if (!row)
        return res.status(404).json({ error: 'not_found' })

      res.json(row)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // POST player
  router.post('/', requireAdmin, async (req, res) => {
    try {
      const {
        player_number,
        first_name,
        last_name,
        favorite_food,
        favorite_movie,
        bio,
        photo_path,
        league,
        season,
        year,
        sport
      } = req.body

      const result = await db.run(
        `
        INSERT INTO players (
          player_number,
          first_name,
          last_name,
          favorite_food,
          favorite_movie,
          bio,
          photo_path,
          league,
          season,
          year,
          sport
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          player_number,
          first_name,
          last_name,
          favorite_food,
          favorite_movie,
          bio,
          photo_path,
          league,
          season,
          year,
          sport || 'Baseball'
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

  // PUT player
  router.put('/:id', requireAdmin, async (req, res) => {
    const id = req.params.id

    const {
      player_number,
      first_name,
      last_name,
      favorite_food,
      favorite_movie,
      bio,
      photo_path,
      league,
      season,
      year,
      sport
    } = req.body

    try {
      const existing = await db.get('SELECT photo_path FROM players WHERE id = ?', id)

      const result = await db.run(
        `
        UPDATE players
        SET
          player_number = ?,
          first_name = ?,
          last_name = ?,
          favorite_food = ?,
          favorite_movie = ?,
          bio = ?,
          photo_path = ?,
          league = ?,
          season = ?,
          year = ?,
          sport = ?
        WHERE id = ?
        `,
        [
          player_number,
          first_name,
          last_name,
          favorite_food,
          favorite_movie,
          bio,
          photo_path,
          league,
          season,
          year,
          sport || 'Baseball',
          id
        ]
      )

      // Swapping or clearing the photo orphans the old file - drop it.
      if (existing && existing.photo_path && existing.photo_path !== (photo_path || null)) {
        await deleteImageIfUnused(db, existing.photo_path)
      }

      res.json({
        success: true,
        changes: result.changes
      })

    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.message })
    }
  })

  // DELETE player
  router.delete('/:playerNumber', requireAdmin, async (req, res) => {
    try {
      // player_number can match several rows (multiple seasons) - collect them all.
      const existing = await db.all(
        'SELECT photo_path FROM players WHERE player_number = ? AND photo_path IS NOT NULL',
        req.params.playerNumber
      )

      const result = await db.run(DELETE_PLAYER, req.params.playerNumber)

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Player not found' })
      }

      for (const row of existing) {
        await deleteImageIfUnused(db, row.photo_path)
      }

      res.json({ success: true })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  return router
}
