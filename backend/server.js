require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const requireAdmin = require('./middleware/requireAdmin')
const createPlayerRoutes = require('./routes/players')
const createTeamRoutes = require('./routes/teams')
const createCoachRoutes = require('./routes/coaches')
const createAssistantRoutes = require('./routes/assistants')
const createGameRoutes = require('./routes/games')
const createNewsRoutes = require('./routes/news')
const createSwagRoutes = require('./routes/swag')
const createScheduleRoutes = require('./routes/schedule')
const createStatsRoutes = require('./routes/stats')
const createAdminRoutes = require('./routes/admin')
const createUploadRoutes = require('./routes/upload')

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

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

  // ======================================================
  // ROUTES
  // ======================================================

  app.use('/api/players', createPlayerRoutes(db, requireAdmin))
  app.use('/api/teams', createTeamRoutes(db))
  app.use('/api/coaches', createCoachRoutes(db, requireAdmin))
  app.use('/api/assistants', createAssistantRoutes(db, requireAdmin))
  app.use('/api/games', createGameRoutes(db, requireAdmin))
  app.use('/api/news', createNewsRoutes(db, requireAdmin))
  app.use('/api/swag', createSwagRoutes(db, requireAdmin))
  app.use('/api/schedule', createScheduleRoutes(db, requireAdmin))
  app.use('/api/stats', createStatsRoutes(db, requireAdmin))
  app.use('/api/admin', createAdminRoutes(requireAdmin))
  app.use('/api/upload', createUploadRoutes(requireAdmin))

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
