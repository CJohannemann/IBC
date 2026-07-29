const express = require('express')
const cors = require('cors')
const path = require('path')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const DB_PATH = path.join(__dirname, '..', 'database', 'baseball.db')
const PORT = process.env.PORT || 3001

async function start() {
  // ======================================================
  // DATABASE
  // ======================================================

  const db = await sqlite.open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  })

  // ======================================================
  // EXPRESS SETUP
  // ======================================================

  const app = express()

  app.use(cors())
  app.use(express.json())

  // ======================================================
  // CONSTANTS
  // ======================================================

  const DELETE_PLAYER = `
    DELETE
    FROM players
    WHERE player_number = ?
`

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
  year
`

  // ======================================================
  // AUTHENTICATION
  // ======================================================

  function requireAdmin(req, res, next) {
    // authentication goes here
    next()
  }

  // ======================================================
  // PLAYER ROUTES
  // ======================================================

  // GET all players
  app.get('/api/players', async (req, res) => {
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
  app.get('/api/players/:number', async (req, res) => {
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
app.post('/api/players', requireAdmin, async (req, res) => {
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
      year
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
        year
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        year
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
  app.put('/api/players/:id', requireAdmin, async (req, res) => {
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
      year
    } = req.body

    try {
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
          year = ?
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

  // DELETE player
  app.delete('/api/players/:playerNumber', requireAdmin, async (req, res) => {
    try {
      const result = await db.run(DELETE_PLAYER, req.params.playerNumber)

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Player not found' })
      }
      res.json({ success: true })
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // ======================================================
  // TEAM ROUTES
  // ======================================================

  // GET all teams
  app.get('/api/teams', async (req, res) => {
    try {

      const rows = await db.all(`
              SELECT DISTINCT
                  league
              FROM coaches
              WHERE archive = 'N'
              ORDER BY league
          `)

      res.json(rows)

    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // GET team details
  app.get('/api/teams/:league', async (req, res) => {
    try {

      const league = req.params.league.toLowerCase()

      const coach = await db.get(`
              SELECT
                  first_name,
                  last_name,
                  league
              FROM coaches
              WHERE lower(league) = ?
                  AND archive = 'N'
              LIMIT 1
          `, league)

      const players = await db.all(`
              SELECT
                  ${PLAYER_COLUMNS}
              FROM players
              WHERE lower(league) = ?
              ORDER BY player_number
          `, league)

      res.json({
        league: coach?.league ?? req.params.league,
        headCoach: coach
          ? `${coach.first_name} ${coach.last_name}`
          : null,
        players
      })

    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error' })
    }
  })

  // ======================================================
  // COACH ROUTES
  // ======================================================

  app.get('/api/coaches', async (req, res) => {

  })

  app.post('/api/coaches', requireAdmin, async (req, res) => {

  })

  app.put('/api/coaches/:id', requireAdmin, async (req, res) => {

  })

  // ======================================================
  // GAME ROUTES
  // ======================================================

  app.get('/api/games', async (req, res) => {

  })

  app.post('/api/games', requireAdmin, async (req, res) => {

  })

  // ======================================================
  // NEWS ROUTES
  // ======================================================

  app.get('/api/news', async (req, res) => {

  })

  // ======================================================
  // SPONSOR ROUTES
  // ======================================================

  app.get('/api/sponsors', async (req, res) => {

  })

  // ======================================================
  // ADMIN ROUTES
  // ======================================================

  app.get('/api/admin/check', requireAdmin, (req, res) => {
    res.json({ authenticated: true })
  })

  // ======================================================
  // HEALTH / DEBUG
  // ======================================================

  app.get('/health', (req, res) => {
    res.json({ ok: true })
  })

  app.get('/debug/routes', (req, res) => {

  })

  // ======================================================
  // START SERVER
  // ======================================================

  app.listen(PORT, () => {
    console.log(`Backend API listening on http://localhost:${PORT}`)
    console.log(`Using DB at ${DB_PATH}`)
  })
}

start().catch(err => {
  console.error(err)
  process.exit(1)
})
